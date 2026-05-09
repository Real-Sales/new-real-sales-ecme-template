import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { HiStop, HiPaperAirplane, HiPaperClip, HiLightBulb, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import '@/liveAudio/GdmLiveAudio';
import { getRangeVolumeFromAnalyser } from '@/liveAudio/utils/frequencyRange';
import {
  apiStoreSessionMessagesBatch,
  flushSessionMessagesBatchKeepalive,
} from '@/services/SessionService';
import { apiGetGeminiEphemeralToken } from '@/services/GeminiService';
import type { ChatHistoryItem } from '@/services/GeminiService';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Loading from '@/components/shared/Loading';
import ScrollBar from '@/components/ui/ScrollBar';
import { useAppSelector } from '@/store/hook';

// --- 1. Audio Analyzer Hook ---
const useAudioAnalyzer = () => {
  const [context, setContext] = useState<{ ctx: AudioContext, source: MediaStreamAudioSourceNode, stream: MediaStream } | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const startAudio = async () => {
    if (context) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const analyzer = ctx.createAnalyser();
      const source = ctx.createMediaStreamSource(stream);

      analyzer.fftSize = 2048;
      analyzer.smoothingTimeConstant = 0.95;
      
      source.connect(analyzer);
      
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      analyzerRef.current = analyzer;
      dataArrayRef.current = dataArray;
      setContext({ ctx, source, stream });
    } catch (err) {
      console.error("Audio Init Failed:", err);
    }
  };

  const stopAudio = useCallback(() => {
    if (!context) return;
    try { context.source.disconnect(); } catch { /* ignore */ }
    context.stream.getTracks().forEach(t => t.stop());
    try { context.ctx.close(); } catch { /* ignore */ }
    analyzerRef.current = null;
    dataArrayRef.current = null;
    setContext(null);
  }, [context]);

  const getMicRangeVolume = useCallback(
    (minHz: number, maxHz: number) => {
      if (!analyzerRef.current || !dataArrayRef.current || !context) return 0;
      return getRangeVolumeFromAnalyser(
        analyzerRef.current,
        dataArrayRef.current,
        context.ctx.sampleRate,
        minHz,
        maxHz,
      );
    },
    [context],
  );

  return { startAudio, stopAudio, getMicRangeVolume, isReady: !!context };
};

// --- 2. Enhanced Liquid-Glass Circular Visualizer ---
const CircularAvatarVisualizer = ({ 
  analyzer,
  isMicActive, 
  isAiThinking = false,
  avatar, 
  name, 
  role 
}: { 
  analyzer?: { getRangeVolume: (min: number, max: number) => number },
  isMicActive: boolean,
  isAiThinking?: boolean,
  avatar?: string,
  name: string,
  role: string
}) => {
  const swirlRef = useRef<HTMLDivElement | null>(null);
  const blobARef = useRef<HTMLDivElement | null>(null);
  const blobBRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number>();
  const rotationRef = useRef(0);
  const rotationSpeedRef = useRef(0);
  const targetSpeedRef = useRef(0);
  const lastTsRef = useRef(0);
  /** Smoothed volume (0..1-ish). Drives swirl scale + glow opacity. */
  const smoothedVolumeRef = useRef(0);
  /** Phase clock for the liquid morph — accumulates at audio-modulated speed. */
  const morphPhaseRef = useRef(0);
  /** Secondary morph clock so the inner blob counter-rotates and morphs out of phase. */
  const morphPhaseBRef = useRef(0);

  useEffect(() => {
    // deg/s -> quick spin while AI is thinking, 25 for a livelier idle drift.
    targetSpeedRef.current = isAiThinking ? 240 : 25;
  }, [isAiThinking]);

  useEffect(() => {
    /** Build an organic blob border-radius from 8 sine-driven percentages. */
    const buildRadius = (phase: number, amp: number) => {
      const a = 50 + amp * Math.sin(phase);
      const b = 50 + amp * Math.sin(phase * 1.3 + 1.1);
      const c = 50 + amp * Math.sin(phase * 0.9 + 2.3);
      const d = 50 + amp * Math.sin(phase * 1.1 + 3.7);
      const e = 50 + amp * Math.sin(phase * 0.7 + 0.5);
      const f = 50 + amp * Math.sin(phase * 1.05 + 1.9);
      const g = 50 + amp * Math.sin(phase * 0.85 + 4.2);
      const h = 50 + amp * Math.sin(phase * 1.2 + 5.1);
      return `${a}% ${b}% ${c}% ${d}% / ${e}% ${f}% ${g}% ${h}%`;
    };

    const animate = (ts: number) => {
      const dt = lastTsRef.current ? Math.min(0.05, (ts - lastTsRef.current) / 1000) : 0;
      lastTsRef.current = ts;

      // --- Audio level (mic + AI playback are merged inside getRangeVolume) ---
      const raw = analyzer ? analyzer.getRangeVolume(80, 8000) * 1.8 : 0;
      const cur = smoothedVolumeRef.current;
      // Snappy attack, soft release.
      const k = raw > cur ? 0.55 : 0.12;
      smoothedVolumeRef.current = cur + (raw - cur) * k;
      const vol = Math.min(1, smoothedVolumeRef.current);

      // --- Rotation (thinking / idle drift) ---
      const target = targetSpeedRef.current;
      const curSpeed = rotationSpeedRef.current;
      const sk = target > curSpeed ? 0.08 : 0.022;
      rotationSpeedRef.current = curSpeed + (target - curSpeed) * sk;
      rotationRef.current = (rotationRef.current + rotationSpeedRef.current * dt) % 360;

      // --- Liquid morph: phase advances faster as voice level rises ---
      const morphSpeed = 1.4 + vol * 4.0;        // primary blob
      const morphSpeedB = 1.0 + vol * 3.2;       // secondary blob — slower, out of phase
      morphPhaseRef.current += dt * morphSpeed;
      morphPhaseBRef.current += dt * morphSpeedB;

      // --- Apply to swirl wrapper (rotate + audio-reactive scale) ---
      if (swirlRef.current) {
        // Bounded scale so it never overflows the glass shell. Idle ~1.0, full audio ~1.16.
        const scale = 1 + vol * 0.16;
        swirlRef.current.style.transform = `rotate(${rotationRef.current}deg) scale(${scale})`;
        // Slightly brighter on louder audio.
        swirlRef.current.style.opacity = String(0.6 + vol * 0.3);
      }

      // --- Primary blob: morph + saturate/brighten with audio ---
      if (blobARef.current) {
        blobARef.current.style.borderRadius = buildRadius(morphPhaseRef.current, 14 + vol * 16);
        blobARef.current.style.filter =
          `blur(4px) saturate(${1 + vol * 0.7}) brightness(${1 + vol * 0.2})`;
      }

      // --- Secondary blob: counter-rotates, fades in with audio for richness ---
      if (blobBRef.current) {
        blobBRef.current.style.borderRadius = buildRadius(morphPhaseBRef.current * 0.8 + 1.7, 18 + vol * 18);
        blobBRef.current.style.transform = `rotate(${-rotationRef.current * 0.6}deg)`;
        // Quiet at idle, becomes a clear secondary highlight as audio comes in.
        blobBRef.current.style.opacity = String(0.18 + vol * 0.55);
        blobBRef.current.style.filter =
          `blur(8px) saturate(${1.1 + vol * 0.6}) brightness(${1 + vol * 0.25})`;
      }

      // --- Apply to glow halo behind avatar ---
      if (glowRef.current) {
        const glow = (isMicActive ? 0.35 : 0.12) + vol * 0.5;
        glowRef.current.style.opacity = String(Math.min(0.9, glow));
        glowRef.current.style.transform = `scale(${1 + vol * 0.18})`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [analyzer, isMicActive]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* 1. Continuous Background Ripple Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={`bg-ripple-${i}`}
            className="absolute w-[350px] h-[350px] rounded-full border border-gray-500/45 dark:border-gray-600/30"
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: [1, 4],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* Avatar stays visually centered; name/role sit above it without shifting the circle down */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+2rem)] flex w-full max-w-lg flex-col items-center px-4 text-center">
          <h2 className="text-[28px] font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">{name}</h2>
          <p className="text-[15px] font-medium text-gray-600 dark:text-gray-400 mt-1 whitespace-nowrap text-center">{role}</p>
        </div>

        <div className="relative flex items-center justify-center">
          {/* Soft radial glow behind the avatar — pulses with audio level */}
          <div
            ref={glowRef}
            className="absolute w-[260px] h-[260px] bg-blue-400 dark:bg-sky-500 rounded-full blur-[70px]"
            style={{ opacity: 0.15, transform: 'scale(1)', willChange: 'opacity, transform' }}
          />

          {/* --- TRUE LIQUID GLASS AVATAR RING --- */}
          <div className="relative w-[260px] h-[260px] flex items-center justify-center z-30 group">
            
            {/* 1. The morphing blue liquid — fully audio-reactive: speed, color, secondary blob */}
            <div
              ref={swirlRef}
              className="absolute inset-0 flex items-center justify-center"
              style={{ willChange: 'transform, opacity', transformOrigin: 'center' }}
            >
              {/* Primary blob — morph + saturate/brighten driven in rAF */}
              <div
                ref={blobARef}
                className="absolute inset-0 bg-gradient-to-tr from-cyan-100 via-blue-300 to-blue-500 dark:from-indigo-950 dark:via-blue-900 dark:to-cyan-800"
                style={{ willChange: 'border-radius, filter', borderRadius: '50%', filter: 'blur(4px)' }}
              />
              {/* Secondary blob — counter-rotates and fades in with audio for a liquid 'second highlight' */}
              <div
                ref={blobBRef}
                className="absolute inset-[8%] bg-gradient-to-br from-white/80 via-cyan-200 to-blue-400 dark:from-sky-300/25 dark:via-cyan-500/35 dark:to-blue-600/50"
                style={{
                  willChange: 'border-radius, transform, opacity, filter',
                  borderRadius: '50%',
                  opacity: 0.18,
                  mixBlendMode: 'screen',
                  filter: 'blur(8px)',
                }}
              />
            </div>
            
            {/* 2. The Proper Outer Glass Shell */}
            <div className="absolute inset-[6px] rounded-full bg-white/10 dark:bg-gray-900/45 backdrop-blur-2xl border border-white/60 dark:border-white/15 shadow-[inset_0_4px_30px_rgba(255,255,255,0.7),_0_8px_32px_rgba(37,99,235,0.2)] dark:shadow-[inset_0_4px_28px_rgba(255,255,255,0.05),_0_8px_36px_rgba(56,189,248,0.18)] z-10 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 via-transparent to-black/5 dark:from-white/[0.06] dark:via-transparent dark:to-black/50 pointer-events-none" />
            </div>
            
            {/* 3. Deep inner shadow ring for 3D depth */}
            <div className="absolute inset-[16px] rounded-full shadow-[inset_0_4px_15px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_4px_20px_rgba(0,0,0,0.55)] z-20 pointer-events-none border border-black/5 dark:border-gray-700/80" />
            
            {/* 4. The Actual Avatar (White border removed) */}
            <div className="absolute inset-[18px] rounded-full overflow-hidden z-20 shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-[0_0_28px_rgba(0,0,0,0.65)] bg-transparent">
              <img 
                src={avatar || "https://i.pravatar.cc/300?img=11"} 
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// --- 3. Types for Chat Interface ---
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  finished?: boolean
  synced?: boolean
}

interface Hint {
  id: number
  category: 'what' | 'how'
  title: string
  suggestion: string
}

const AVAILABLE_HINTS: Hint[] = [
  { id: 1, category: 'what', title: 'Opening Questions', suggestion: 'Start with: "Can you walk me through your current sales process?" This helps establish context and builds rapport.' },
  { id: 2, category: 'how', title: 'Active Listening', suggestion: 'Pause after they speak, then say: "So if I understand correctly..." This shows engagement and ensures clarity.' },
  { id: 3, category: 'what', title: 'Pain Point Discovery', suggestion: 'Ask: "What challenges are you facing with your current solution?" Focus on their problems, not your product.' },
];

const SESSION_DURATION = 1800;

/** Track sizes for the main / side column split (`gridTemplateColumns`). */
const CHAT_PANEL_VIS_FR = 13;
const CHAT_PANEL_SIDE_FR = 7;
let _msgIdCounter = 0;
const nextMsgId = () => `${Date.now()}_${++_msgIdCounter}`;

// --- 4. Main Component with Chat Interface ---
export default function InteractiveVisualizerSession() {
  const location = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigateTo = useNavigate();
  const direction = useAppSelector((state) => state.theme.direction);
  const sessionData = location.state as any;

  const { startAudio, stopAudio, getMicRangeVolume, isReady } = useAudioAnalyzer();
  const liveAudioRef = useRef<any>(null);

  // --- Live audio analyser bridge (mic + Gemini output) so the swirl can react ---
  const geminiAnalyserRef = useRef<AnalyserNode | null>(null);
  const geminiDataArrayRef = useRef<Uint8Array | null>(null);
  const geminiSampleRateRef = useRef(24000);

  const syncGeminiAnalyserFromElement = useCallback(() => {
    const el = liveAudioRef.current;
    const got = el?.getGeminiOutputAnalyser?.();
    if (got?.analyser && got.analyser.context.state !== 'closed') {
      if (geminiAnalyserRef.current !== got.analyser) {
        geminiAnalyserRef.current = got.analyser;
        geminiDataArrayRef.current = new Uint8Array(got.analyser.frequencyBinCount);
      }
      geminiSampleRateRef.current = got.sampleRate;
    }
  }, []);

  useEffect(() => {
    syncGeminiAnalyserFromElement();
    const onSessionOpened = () => syncGeminiAnalyserFromElement();
    window.addEventListener('liveAudioSessionOpened', onSessionOpened);
    return () => window.removeEventListener('liveAudioSessionOpened', onSessionOpened);
  }, [syncGeminiAnalyserFromElement]);

  useEffect(() => {
    const clear = () => {
      geminiAnalyserRef.current = null;
      geminiDataArrayRef.current = null;
    };
    window.addEventListener('liveAudioGeminiAnalyserEnded', clear);
    return () => window.removeEventListener('liveAudioGeminiAnalyserEnded', clear);
  }, []);

  /** Returns max(mic, gemini-output) so the swirl reacts to both speakers. */
  const getRangeVolume = useCallback(
    (minHz: number, maxHz: number) => {
      const micLevel = getMicRangeVolume(minHz, maxHz);

      let geminiLevel = 0;
      let g = geminiAnalyserRef.current;
      let buf = geminiDataArrayRef.current;
      if (!g || !buf || g.context.state === 'closed') {
        syncGeminiAnalyserFromElement();
      }
      g = geminiAnalyserRef.current;
      buf = geminiDataArrayRef.current;
      if (g && buf && g.context.state !== 'closed') {
        try {
          geminiLevel = getRangeVolumeFromAnalyser(g, buf, geminiSampleRateRef.current, minHz, maxHz);
        } catch {
          /* ignore */
        }
      }
      return Math.max(micLevel, geminiLevel);
    },
    [getMicRangeVolume, syncGeminiAnalyserFromElement],
  );

  const storageKey = (base: string) => sessionId ? `${base}_${sessionId}` : base;

  const [isMicActive, setIsMicActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(true);
  const [tokenReady, setTokenReady] = useState(false);
  const [hasBackendHistory, setHasBackendHistory] = useState(false);
  const [personaMode] = useState(
    sessionData?.mode 
      ? sessionData.mode.charAt(0).toUpperCase() + sessionData.mode.slice(1)
      : 'Discovering'
  );
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const stored = sessionStorage.getItem(storageKey('session_start_timestamp'));
    if (stored) {
      const elapsed = Math.floor((Date.now() - Number(stored)) / 1000);
      return Math.max(0, SESSION_DURATION - elapsed);
    }
    return SESSION_DURATION;
  });
  
  const [userName] = useState(sessionData?.persona?.name || 'Tony Romano');
  const [userRole] = useState(sessionData?.persona?.role || 'Prospecting · Operations Manager');
  const [userAvatar] = useState(sessionData?.persona?.avatar);

  const [hints, setHints] = useState<Hint[]>(AVAILABLE_HINTS);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [viewedHints, setViewedHints] = useState<number[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyPushedRef = useRef(false);
  const syncingPairKeyRef = useRef<string | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const sessionIdRef = useRef<string | undefined>(sessionId);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Persist in-progress assistant reply
  useEffect(() => {
    const onPageHide = () => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      const msgs = messagesRef.current;
      for (let i = 0; i < msgs.length - 1; i++) {
        const a = msgs[i];
        const b = msgs[i + 1];
        if (a.role === 'user' && a.finished && !a.synced && b.role === 'assistant' && !b.synced && b.content.trim()) {
          flushSessionMessagesBatchKeepalive(sid, [
            { role: 'human', content: a.content },
            { role: 'assistant', content: b.content },
          ]);
          return;
        }
      }
    };
    window.addEventListener('pagehide', onPageHide, { capture: true });
    return () => window.removeEventListener('pagehide', onPageHide, true);
  }, []);

  // Fetch token
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGetGeminiEphemeralToken(sessionId);
        if (cancelled) return;
        if (res.chat_history?.length) {
          setHasBackendHistory(true);
          const restored: Message[] = res.chat_history.map((m: ChatHistoryItem, i: number) => ({
            id: `history_${i}`,
            role: m.role === 'human' ? 'user' as const : 'assistant' as const,
            content: m.content,
            timestamp: new Date(),
            finished: true,
            synced: true,
          }));
          setMessages(restored);
        }
      } catch (err) {
        console.error('Failed to prefetch ephemeral token:', err);
      } finally {
        if (!cancelled) setTokenReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId]);

  // Timer
  useEffect(() => {
    if (!sessionStarted) return;
    const startTs = sessionStorage.getItem(storageKey('session_start_timestamp'));
    if (!startTs) return;
    const origin = Number(startTs);
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - origin) / 1000);
      const remaining = Math.max(0, SESSION_DURATION - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    sessionStorage.setItem(storageKey('session_started'), String(sessionStarted));
  }, [sessionStarted]);

  // Transcripts
  useEffect(() => {
    const handleOutput = (e: Event) => {
      const { text, finished } = (e as CustomEvent<{ text: string; finished: boolean }>).detail;
      if (!text) return;
      // First chunk of assistant output -> AI started speaking, exit "thinking" state.
      setIsGenerating(false);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.finished) {
          return [...prev.slice(0, -1), { ...last, content: last.content + text, finished }];
        }
        return [...prev, { id: nextMsgId(), role: 'assistant', content: text, timestamp: new Date(), finished }];
      });
    };

    const handleInput = (e: Event) => {
      const { text, finished } = (e as CustomEvent<{ text: string; finished: boolean }>).detail;
      if (!text) return;
      // User just finished speaking (mic) -> AI is about to think.
      if (finished) setIsGenerating(true);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'user' && !last.finished) {
          return [...prev.slice(0, -1), { ...last, content: last.content + text, finished }];
        }
        return [...prev, { id: nextMsgId(), role: 'user', content: text, timestamp: new Date(), finished }];
      });
    };

    window.addEventListener('liveAudioOutputTranscript', handleOutput);
    window.addEventListener('liveAudioInputTranscript', handleInput);
    return () => {
      window.removeEventListener('liveAudioOutputTranscript', handleOutput);
      window.removeEventListener('liveAudioInputTranscript', handleInput);
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      // AI was interrupted before/while speaking - drop "thinking" state.
      setIsGenerating(false);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.finished) {
          return [...prev.slice(0, -1), { ...last, finished: true }];
        }
        return prev;
      });
    };
    window.addEventListener('liveAudioInterrupted', handler);
    return () => window.removeEventListener('liveAudioInterrupted', handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      // Turn complete - AI is done; clear "thinking" as a safety net.
      setIsGenerating(false);
      setMessages(prev => {
        let changed = false;
        const updated = prev.map(m => {
          if (!m.finished) {
            changed = true;
            return { ...m, finished: true };
          }
          return m;
        });
        return changed ? updated : prev;
      });
    };
    window.addEventListener('liveAudioTurnComplete', handler);
    return () => window.removeEventListener('liveAudioTurnComplete', handler);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let idx = -1;
    for (let i = 0; i < messages.length - 1; i++) {
      const a = messages[i];
      const b = messages[i + 1];
      if (a.role === 'user' && a.finished && !a.synced && b.role === 'assistant' && b.finished && !b.synced) {
        idx = i; break;
      }
    }
    if (idx === -1) return;

    const userMsg = messages[idx];
    const asstMsg = messages[idx + 1];
    const pairKey = `${userMsg.id}:${asstMsg.id}`;
    if (syncingPairKeyRef.current === pairKey) return;

    syncingPairKeyRef.current = pairKey;
    let cancelled = false;

    (async () => {
      try {
        await apiStoreSessionMessagesBatch(sessionId, {
          messages: [
            { role: 'human', content: userMsg.content },
            { role: 'assistant', content: asstMsg.content },
          ],
        });
      } catch (e) {
        syncingPairKeyRef.current = null;
        return;
      }
      if (cancelled) { syncingPairKeyRef.current = null; return; }
      
      const uid = userMsg.id;
      const aid = asstMsg.id;
      setMessages(prev => prev.map(m => m.id === uid || m.id === aid ? { ...m, synced: true } : m));
      syncingPairKeyRef.current = null;
    })();

    return () => { cancelled = true; };
  }, [messages, sessionId]);

  useEffect(() => {
    if (!sessionStarted) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [sessionStarted]);

  useEffect(() => {
    if (!sessionStarted) { historyPushedRef.current = false; return; }
    if (historyPushedRef.current) return;
    historyPushedRef.current = true;
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      setShowLeaveConfirm(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [sessionStarted]);

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    endSession();
    navigateTo('/overview');
  };

  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (!text || isGenerating) return;

    setMessages(prev => [...prev, {
      id: nextMsgId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      finished: true,
      synced: false,
    }]);
    setInputValue('');

    document.dispatchEvent(new CustomEvent('sendLiveText', { detail: { text } }));
    // Enter "AI is thinking" - visualizer shell will swirl until first AI output chunk.
    setIsGenerating(true);
  };

  const toggleMic = async () => {
    if (isMicActive) {
      document.dispatchEvent(new CustomEvent('liveAudioStopMic'));
      stopAudio();
      setIsMicActive(false);
    } else {
      if (!isReady) await startAudio();
      await liveAudioRef.current?.resumeOutputAudio?.();
      document.dispatchEvent(new CustomEvent('liveAudioStartMic'));
      setIsMicActive(true);
    }
  };

  const endSession = () => {
    document.dispatchEvent(new CustomEvent('liveAudioStopMic'));
    stopAudio();
    setMessages([]);
    setIsMicActive(false);
    setSessionStarted(false);
    setTimeLeft(SESSION_DURATION);
    setViewedHints([]);
    setCurrentHintIndex(0);
    sessionStorage.removeItem(storageKey('session_started'));
    sessionStorage.removeItem(storageKey('session_start_timestamp'));
    navigateTo('/overview');
  };

  const handleStartSession = async () => {
    await startAudio();
    await liveAudioRef.current?.resumeOutputAudio?.();
    document.dispatchEvent(new CustomEvent('liveAudioStartMic'));
    setIsMicActive(true);
    setSessionStarted(true);
    if (!sessionStorage.getItem(storageKey('session_start_timestamp'))) {
      sessionStorage.setItem(storageKey('session_start_timestamp'), String(Date.now()));
    }
  };

  const handleNextHint = () => {
    const currentHint = hints[currentHintIndex];
    if (!viewedHints.includes(currentHint.id)) setViewedHints([...viewedHints, currentHint.id]);
    if (currentHintIndex < hints.length - 1) setCurrentHintIndex(currentHintIndex + 1);
    else setShowHints(false);
  };

  const handlePreviousHint = () => {
    if (currentHintIndex > 0) setCurrentHintIndex(currentHintIndex - 1);
  };

  const formatContent = (content: string) => {
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');
    formatted = formatted.replace(/`(.*?)`/g, '<code class="px-2 py-0.5 rounded-lg bg-gray-200/90 dark:bg-gray-800/80 text-blue-600 dark:text-blue-400 font-mono text-sm">$1</code>');
    return formatted;
  };

  if (!tokenReady) {
    return (
      <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-900 overflow-hidden fixed inset-0">
        <Loading loading={true} className="w-full h-full bg-gray-100 dark:bg-gray-900" spinnerClass="text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden fixed inset-0">
      <div className="pointer-events-none absolute overflow-hidden w-px h-px opacity-0 -z-10" aria-hidden>
        {React.createElement('gdm-live-audio', {
          ref: liveAudioRef,
          'hide-built-in-visuals': true,
          'session-id': sessionId || '',
        })}
      </div>

      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        <div
          className="grid h-full min-h-0 min-w-0 overflow-hidden"
          style={{
            gridTemplateColumns: isChatPanelOpen
              ? `minmax(0,${CHAT_PANEL_VIS_FR}fr) minmax(0,${CHAT_PANEL_SIDE_FR}fr)`
              : 'minmax(0,1fr) minmax(0,0fr)',
            transition: 'grid-template-columns 300ms linear',
          }}
        >
        {/* LEFT: Enhanced Liquid Glass Visualizer */}
        <div className="relative z-10 min-h-0 min-w-0 overflow-visible border-r border-gray-200/90 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setIsChatPanelOpen((open) => !open)}
          className={`absolute top-[1.375rem] z-[120] flex items-center backdrop-blur-sm transition-colors ${
            isChatPanelOpen
              ? 'left-full h-8 w-8 -translate-x-1/2 justify-center rounded-full border border-gray-300 bg-white/90 text-gray-700 shadow-md hover:bg-white dark:border-gray-600 dark:bg-gray-800/95 dark:text-gray-100 dark:hover:bg-gray-800'
              : 'right-0 h-8 w-4 translate-x-0 justify-start rounded-l-full border-y border-l border-r-0 border-gray-400/90 bg-gray-900 pl-1 text-white shadow-lg shadow-black/20 ring-2 ring-black/10 hover:bg-gray-800 dark:border-slate-400/80 dark:bg-slate-200 dark:text-slate-900 dark:shadow-black/50 dark:ring-white/20 dark:hover:bg-white'
          }`}
          aria-expanded={isChatPanelOpen}
          aria-label={isChatPanelOpen ? 'Collapse chat panel' : 'Open chat panel'}
        >
          {isChatPanelOpen ? (
            <HiChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <HiChevronLeft className="h-3 w-3 shrink-0" />
          )}
        </button>

        <CircularAvatarVisualizer 
          analyzer={{ getRangeVolume }}
          isMicActive={isMicActive}
          isAiThinking={isGenerating}
          avatar={userAvatar}
          name={userName}
          role={userRole}
        />

        {/* Top Right: Glassmorphism Timer Pill */}
        <div className="absolute top-6 right-12 z-[100] pointer-events-none">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/5 backdrop-blur-xl border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:bg-gray-800 dark:border-gray-600 dark:shadow-[0_4px_18px_rgba(0,0,0,0.55)] dark:ring-1 dark:ring-gray-500/40">
            <div className={`w-2 h-2 rounded-full ${sessionStarted ? 'bg-red-400 animate-pulse' : 'bg-gray-400 dark:bg-gray-400'}`} />
            <span className="text-[13px] font-bold text-gray-800 dark:text-gray-100 font-mono tracking-widest pt-px">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

      </div>

      {/* RIGHT: Chat Interface */}
      <div
        className={
          isChatPanelOpen
            ? 'relative z-0 flex min-h-0 min-w-0 flex-col overflow-hidden border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
            : 'pointer-events-none relative z-0 flex min-h-0 min-w-0 flex-col overflow-hidden border-l border-transparent bg-white dark:border-transparent dark:bg-gray-900'
        }
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-gray-200 dark:border-gray-700/60 bg-gray-100/95 dark:bg-gray-800/70 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-11 h-11 rounded-full border border-blue-500/30 object-cover flex-shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full flex-shrink-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-400">{userName.split(' ').map((n: string) => n[0]).join('')}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{personaMode} · {userRole}</p>
            </div>
            <AnimatePresence>
              {sessionStarted && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={endSession}
                  className="px-3.5 py-1.5 rounded-lg flex-shrink-0 bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all"
                >
                  End Session
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Transcript Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollBar className="h-full max-h-full" style={{ height: '100%', maxHeight: '100%' }} direction={direction}>
            <div className="px-6 py-4 space-y-4 min-h-full box-border bg-white dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="min-h-[min(100%,24rem)] flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400 text-center text-sm">Transcript will appear here<br /><span className="text-xs text-gray-400 dark:text-gray-500">User's input + AI's response</span></p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] px-4 py-3 rounded-xl ${message.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900/90 dark:to-gray-800/90 text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/50 shadow-md'}`}>
                        <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} />
                        <p className="text-xs opacity-50 mt-1.5">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isGenerating && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                      <div className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700/50">
                        <div className="flex gap-1.5">
                          {[0, 0.2, 0.4].map(delay => (
                            <motion.div key={delay} animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay }} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </ScrollBar>
        </div>

        {/* Hints Panel */}
        <AnimatePresence>
          {showHints && hints[currentHintIndex] && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex-shrink-0 px-6 py-4 border-t border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HiLightBulb className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Session Hint {currentHintIndex + 1}/{hints.length}</h4>
                </div>
                <button onClick={() => setShowHints(false)} className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">Close</button>
              </div>
              <motion.div key={hints[currentHintIndex].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 rounded-xl bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50">
                <h5 className="text-base font-bold text-gray-900 dark:text-white mb-2">{hints[currentHintIndex].title}</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{hints[currentHintIndex].suggestion}</p>
              </motion.div>
              <div className="flex items-center justify-between mt-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePreviousHint} disabled={currentHintIndex === 0} className={`px-4 py-2 rounded-lg text-sm font-medium ${currentHintIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800'}`}>Previous</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNextHint} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">{currentHintIndex === hints.length - 1 ? 'Done' : 'Next'}</motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Bar Container */}
        <div className="flex-shrink-0 px-4 py-3 bg-gray-100/95 dark:bg-gray-800/70 backdrop-blur-2xl border-t border-gray-200 dark:border-gray-700/60">
          <AnimatePresence mode="wait">
            {!sessionStarted ? (
              <motion.div key="start" initial={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleStartSession} className="w-full py-3.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all">
                  {hasBackendHistory ? 'Continue Session' : 'Start Session'}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 rounded-full px-4 py-2">
                <button className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex-shrink-0"><HiPaperClip className="w-5 h-5" /></button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  disabled={isGenerating}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none disabled:opacity-50"
                />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowHints(!showHints)} className="flex items-center gap-1.5 px-3 py-1 rounded-full flex-shrink-0 bg-blue-500/10 text-blue-500">
                  <HiLightBulb className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{hints.length - viewedHints.length}</span>
                </motion.button>
                {inputValue.trim() ? (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSendMessage} disabled={isGenerating} className="w-9 h-9 rounded-full flex-shrink-0 bg-blue-500 text-white flex items-center justify-center">
                    <HiPaperAirplane className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleMic} className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${isMicActive ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'}`}>
                    {isMicActive ? <HiStop className="w-4 h-4" /> : <div className="flex gap-[2px] items-end h-4">{[3, 5, 7, 5, 3].map((h, i) => <div key={i} className="w-[2px] bg-current rounded-full" style={{ height: `${h * 2}px` }} />)}</div>}
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </div>

      <ConfirmDialog
        isOpen={showLeaveConfirm}
        type="warning"
        title="Leave Session?"
        onClose={() => setShowLeaveConfirm(false)}
        onCancel={() => setShowLeaveConfirm(false)}
        onConfirm={handleConfirmLeave}
        confirmText="Leave"
        cancelText="Stay"
      >
        <p>Your current session will be lost. Are you sure you want to leave?</p>
      </ConfirmDialog>
    </div>
  );
}