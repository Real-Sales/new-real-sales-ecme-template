import React, { useRef, useMemo, useState, Suspense, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { HiStop, HiPaperAirplane, HiPaperClip, HiPlus, HiLightBulb, HiSparkles } from 'react-icons/hi2';
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

// --- 1. CONFIGURATION: "Kilo Herz 2" ---
const CONFIG = [

  {
    "enabled": true,
    "name": "Kilo Orange Core",
    "sphereRadius": 0.2,
    "innerSphereRadius": 1.0, // Solid/Surface
    "rotationSpeed": 0.001,
    "rotationSpeedMin": 0,
    "rotationSpeedMax": 0.065,
    "rotationSmoothness": 0.3,
    "particleCount": 8000,
    "particleSize": 0.005,
    "particleLifetime": 4,
    "minFrequency": 120,
    "maxFrequency": 250,
    "minFrequencyBeat": 0,
    "maxFrequencyBeat": 100,
    "noiseScale": 1.4,
    "dynamicNoiseScale": true,
    "minNoiseScale": 0.5,
    "maxNoiseScale": 9.6,
    "noiseStep": 0.2,
    "noiseSpeed": 0.1,
    "turbulenceStrength": 0.0005,
    "colorStart": "#e3570b", // Orange
    "colorEnd": "#d77100",   // Dark Orange
    "beatStrength": 0.002,
    "gainMultiplier": 1
  },
  {
    "enabled": true,
    "name": "Kilo Pink Mid",
    "sphereRadius": 0.8,
    "innerSphereRadius": 1.0, 
    "rotationSpeed": 0.001,
    "rotationSpeedMin": 0.005,
    "rotationSpeedMax": 0.059,
    "rotationSmoothness": 0.79,
    "particleCount": 24000,
    "particleSize": 0.005,
    "particleLifetime": 4,
    "minFrequency": 99,
    "maxFrequency": 10313,
    "minFrequencyBeat": 120,
    "maxFrequencyBeat": 250,
    "noiseScale": 2.8,
    "dynamicNoiseScale": true,
    "minNoiseScale": 0.7,
    "maxNoiseScale": 7.7,
    "noiseStep": 0.2,
    "noiseSpeed": 0.1,
    "turbulenceStrength": 0.0015,
    "colorStart": "#ff324b", // Red-Pink
    "colorEnd": "#ff32b7",   // Hot Pink
    "beatStrength": 0.004,
    "gainMultiplier": 1
  }
];

// --- 2. Audio Analyzer ---
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

// --- 3. Shader Material (GPU Logic) ---
const LayerShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uVolume: { value: 0 },
    uColorStart: { value: new THREE.Color() },
    uColorEnd: { value: new THREE.Color() },
    uNoiseScale: { value: 1.0 },
    uNoiseSpeed: { value: 0.1 },
    uTurbulence: { value: 0.005 },
    uBeatStrength: { value: 0.01 },
    uParticleSize: { value: 4.0 }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uVolume;
    uniform float uNoiseScale;
    uniform float uNoiseSpeed;
    uniform float uTurbulence;
    uniform float uBeatStrength;
    uniform float uParticleSize;
    
    varying float vDist;

    // Simplex Noise 3D
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      // Time flow
      float t = uTime * uNoiseSpeed;
      
      // Dynamic Noise Scaling
      float dynamicScale = uNoiseScale + (uVolume * 1.5);
      
      // Calculate Noise
      float noise = snoise(position * dynamicScale + vec3(t));
      
      // Turbulence & Beat Logic
      // Kilo Herz uses very subtle turbulence (0.0005)
      // We amplify significantly for visual clarity in WebGL
      float displacement = noise * (uTurbulence * 90.0) + (uVolume * uBeatStrength * 5.0);
      
      vec3 newPos = position + (normal * displacement);
      
      // Pass distance for coloring
      vDist = length(newPos); 

      vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
      
      // Particle Size with depth attenuation
      gl_PointSize = (uParticleSize * (1.0 + uVolume * 1.5)) * (1.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    
    varying float vDist;

    void main() {
      // Circular particle
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      
      // Soft Edge
      float alpha = smoothstep(0.5, 0.2, r);
      
      // Gradient Mixing
      // Mix based on radial distance
      float mixFactor = smoothstep(0.1, 1.8, vDist); 
      vec3 color = mix(uColorStart, uColorEnd, mixFactor);
      
      // Highlight center of particle
      color += vec3(0.15) * (1.0 - r);

      gl_FragColor = vec4(color, alpha);
    }
  `
};

// --- 4. Layer Component ---
const VisualizerLayer = ({
    config,
    analyzer,
    useAdditiveBlend = true,
}: {
    config: (typeof CONFIG)[0]
    analyzer: { getRangeVolume: (min: number, max: number) => number }
    useAdditiveBlend?: boolean
}) => {
  const meshRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  // Create unique material for each layer with its own uniforms
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uVolume: { value: 0 },
        uColorStart: { value: new THREE.Color(config.colorStart) },
        uColorEnd: { value: new THREE.Color(config.colorEnd) },
        uNoiseScale: { value: config.noiseScale },
        uNoiseSpeed: { value: config.noiseSpeed },
        uTurbulence: { value: config.turbulenceStrength },
        uBeatStrength: { value: config.beatStrength },
        uParticleSize: { value: config.particleSize * 1500.0 }
      },
      vertexShader: LayerShaderMaterial.vertexShader,
      fragmentShader: LayerShaderMaterial.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: useAdditiveBlend
        ? THREE.AdditiveBlending
        : THREE.NormalBlending,
    });
  }, [config, useAdditiveBlend]);

  // Geometry Generation Logic based on your reference code
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];

    for (let i = 0; i < config.particleCount; i++) {
      // Kilo Herz Logic:
      // innerSphereRadius acts as a modifier for distribution
      // If inner is 1.0, distribution is surface-heavy
      // If inner is 0.24, distribution is volumetric
      
      // Standard Shell logic:
      const rMin = config.sphereRadius * config.innerSphereRadius;
      const rMax = config.sphereRadius;
      
      // Distribute randomly between min and max
      const r = rMin + Math.random() * (rMax - rMin);
      
      const theta = Math.random() * Math.PI * 2;
                        const phi = Math.acos(2 * Math.random() - 1);

      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions.push(x, y, z);
      const n = new THREE.Vector3(x, y, z).normalize();
      normals.push(n.x, n.y, n.z);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    return geo;
  }, [config]);

  useFrame((state) => {
    if (!materialRef.current || !meshRef.current) return;

    // Get Audio
    const volume = analyzer.getRangeVolume(config.minFrequency, config.maxFrequency);
    const beatVolume = analyzer.getRangeVolume(config.minFrequencyBeat, config.maxFrequencyBeat);

    // Dynamic Rotation with smooth transitions
    const targetSpeed = config.rotationSpeedMin + (config.rotationSpeedMax - config.rotationSpeedMin) * beatVolume;
    
    // Store smooth rotation speed
    if (!meshRef.current.userData.smoothSpeed) {
      meshRef.current.userData.smoothSpeed = config.rotationSpeed;
    }
    
    // Smooth the rotation speed changes
    meshRef.current.userData.smoothSpeed = THREE.MathUtils.lerp(
      meshRef.current.userData.smoothSpeed,
      targetSpeed,
      0.05 // Very smooth rotation transitions
    );
    
    // Apply smoothed rotation
    meshRef.current.rotation.y += meshRef.current.userData.smoothSpeed;
    meshRef.current.rotation.z += 0.0005;

    // Dynamic Noise Scale
    let currentNoiseScale = config.noiseScale;
    if (config.dynamicNoiseScale) {
       currentNoiseScale = THREE.MathUtils.lerp(
         config.minNoiseScale, 
         config.maxNoiseScale, 
         volume
       );
    }

    // Update Uniforms
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uNoiseSpeed.value = config.noiseSpeed;
    materialRef.current.uniforms.uTurbulence.value = config.turbulenceStrength;
    materialRef.current.uniforms.uBeatStrength.value = config.beatStrength;
    materialRef.current.uniforms.uParticleSize.value = config.particleSize * 1500.0; // Scaler

    // Smooth Volume - Lower value = smoother, gradual transitions
    materialRef.current.uniforms.uVolume.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uVolume.value,
      volume * config.gainMultiplier, 
      0.12 // Lower = smoother, less sudden changes
    );

    // Smooth Noise Scale transitions
    materialRef.current.uniforms.uNoiseScale.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uNoiseScale.value,
      currentNoiseScale,
      0.08 // Lower = smoother noise transitions
    );

    materialRef.current.uniforms.uColorStart.value.set(config.colorStart);
    materialRef.current.uniforms.uColorEnd.value.set(config.colorEnd);
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <primitive 
        ref={materialRef}
        object={material}
        attach="material"
      />
    </points>
  );
};

/** Bloom for the always-dark session canvas. */
function VisualizerBloom() {
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.3}
        mipmapBlur
        intensity={1.2}
        radius={0.8}
      />
    </EffectComposer>
  )
}

// --- 5. Types for Chat Interface ---
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

// Sample hints for the session
const AVAILABLE_HINTS: Hint[] = [
  {
    id: 1,
    category: 'what',
    title: 'Opening Questions',
    suggestion: 'Start with: "Can you walk me through your current sales process?" This helps establish context and builds rapport.'
  },
  {
    id: 2,
    category: 'how',
    title: 'Active Listening',
    suggestion: 'Pause after they speak, then say: "So if I understand correctly..." This shows engagement and ensures clarity.'
  },
  {
    id: 3,
    category: 'what',
    title: 'Pain Point Discovery',
    suggestion: 'Ask: "What challenges are you facing with your current solution?" Focus on their problems, not your product.'
  },
  {
    id: 4,
    category: 'how',
    title: 'Tone & Pace',
    suggestion: 'Speak 15% slower than usual. Use confident pauses. Mirror their energy level to build connection.'
  },
  {
    id: 5,
    category: 'what',
    title: 'Value Proposition',
    suggestion: 'Frame benefits as: "This means you\'ll be able to..." rather than "Our product has..." Focus on outcomes.'
  }
];

// --- 6. Main Component with Chat Interface ---
const SESSION_DURATION = 1800;
/** Left session + WebGL are always dark so additive particles / bloom read correctly. */
const SESSION_VISUALIZER_BG = '#000000';
let _msgIdCounter = 0;
const nextMsgId = () => `${Date.now()}_${++_msgIdCounter}`;


export default function KiloHerzVisualizer() {
  const location = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigateTo = useNavigate();
  const direction = useAppSelector((state) => state.theme.direction);
  const sessionData = location.state as {
    mode?: string
    persona?: {
      id: string
      name: string
      role: string
      avatar?: string
      company?: string
      industry?: string
    }
    scenarios?: string[]
    files?: File[]
  };

  const { startAudio, stopAudio, getMicRangeVolume, isReady } = useAudioAnalyzer();
  const liveAudioRef = useRef<
    HTMLElement & {
      getGeminiOutputAnalyser?: () => { analyser: AnalyserNode; sampleRate: number } | null;
      resumeOutputAudio?: () => Promise<void>;
    }
  >(null);
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
  }, [syncGeminiAnalyserFromElement]);

  useEffect(() => {
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

  const getRangeVolume = useCallback(
    (minHz: number, maxHz: number) => {
      const g = geminiAnalyserRef.current;
      const buf = geminiDataArrayRef.current;
      if (!g || !buf || g.context.state === 'closed') {
        syncGeminiAnalyserFromElement();
      }
      const g2 = geminiAnalyserRef.current;
      const buf2 = geminiDataArrayRef.current;
      if (g2 && buf2 && g2.context.state !== 'closed') {
        try {
          return getRangeVolumeFromAnalyser(g2, buf2, geminiSampleRateRef.current, minHz, maxHz);
        } catch {
          return getMicRangeVolume(minHz, maxHz);
        }
      }
      return getMicRangeVolume(minHz, maxHz);
    },
    [getMicRangeVolume, syncGeminiAnalyserFromElement],
  );

  const storageKey = (base: string) => sessionId ? `${base}_${sessionId}` : base;

  const [isMicActive, setIsMicActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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
  const [userName] = useState(sessionData?.persona?.name || 'AI Persona');
  const [userRole] = useState(sessionData?.persona?.role || 'Role');
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
  /** Prevents duplicate POSTs for the same user+assistant pair while a batch is in flight */
  const syncingPairKeyRef = useRef<string | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const sessionIdRef = useRef<string | undefined>(sessionId);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Persist in-progress assistant reply on reload/close (normal batch sync waits for turnComplete)
  useEffect(() => {
    const onPageHide = () => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      const msgs = messagesRef.current;
      for (let i = 0; i < msgs.length - 1; i++) {
        const a = msgs[i];
        const b = msgs[i + 1];
        if (
          a.role === 'user' &&
          a.finished &&
          !a.synced &&
          b.role === 'assistant' &&
          !b.synced &&
          b.content.trim()
        ) {
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

  // Fetch ephemeral token on mount — preloads the Gemini session and loads chat history from backend
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

  // Timer countdown using persisted start timestamp for reload accuracy
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persist sessionStarted flag
  useEffect(() => {
    sessionStorage.setItem(storageKey('session_started'), String(sessionStarted));
  }, [sessionStarted]);

  // Transcription event listeners (voice-to-text from Gemini)
  useEffect(() => {
    const handleOutput = (e: Event) => {
      const { text, finished } = (e as CustomEvent<{ text: string; finished: boolean }>).detail;
      if (!text) return;
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

  // Force-finalize in-progress assistant messages on interruption
  useEffect(() => {
    const handler = () => {
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

  // Finalize messages when Gemini's turn completes (reliable signal for end of response)
  useEffect(() => {
    const handler = () => {
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

  // Sync human + assistant pairs to backend (batch — avoids race vs two separate POSTs)
  useEffect(() => {
    if (!sessionId) return;

    let idx = -1;
    for (let i = 0; i < messages.length - 1; i++) {
      const a = messages[i];
      const b = messages[i + 1];
      if (
        a.role === 'user' &&
        a.finished &&
        !a.synced &&
        b.role === 'assistant' &&
        b.finished &&
        !b.synced
      ) {
        idx = i;
        break;
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
        console.error('Failed to sync message batch:', e);
        syncingPairKeyRef.current = null;
        return;
      }
      if (cancelled) {
        syncingPairKeyRef.current = null;
        return;
      }
      const uid = userMsg.id;
      const aid = asstMsg.id;
      setMessages(prev =>
        prev.map(m =>
          m.id === uid || m.id === aid ? { ...m, synced: true } : m,
        ),
      );
      syncingPairKeyRef.current = null;
    })();

    return () => {
      cancelled = true;
    };
  }, [messages, sessionId]);

  // beforeunload warning when session is active
  useEffect(() => {
    if (!sessionStarted) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [sessionStarted]);

  // Browser back button interception via popstate
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

    const userMessage: Message = {
      id: nextMsgId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      finished: true,
      synced: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    document.dispatchEvent(new CustomEvent('sendLiveText', {
      detail: { text },
    }));
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

  const handleAddFiles = () => {
    // Handle file upload or scenario selection
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.txt,.json';
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files);
      console.log('Files selected:', files);
      // Handle file upload logic here
    };
    input.click();
  };

  const handleNextHint = () => {
    const currentHint = hints[currentHintIndex];
    if (!viewedHints.includes(currentHint.id)) {
      setViewedHints([...viewedHints, currentHint.id]);
    }
    
    if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    } else {
      // At the end, close hints
      setShowHints(false);
    }
  };

  const handlePreviousHint = () => {
    if (currentHintIndex > 0) {
      setCurrentHintIndex(currentHintIndex - 1);
    }
  };

  const remainingHints = hints.length - viewedHints.length;
  const currentHint = hints[currentHintIndex];

  const formatContent = (content: string) => {
    let formatted = content.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>',
    );
    formatted = formatted.replace(
        /`(.*?)`/g,
        '<code class="px-2 py-0.5 rounded-lg bg-gray-200/90 dark:bg-gray-800/80 text-blue-600 dark:text-blue-400 font-mono text-sm">$1</code>',
    );
    return formatted;
  };

  if (!tokenReady) {
    return (
      <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-950 overflow-hidden fixed inset-0">
        <Loading loading={true} className="w-full h-full bg-gray-100 dark:bg-gray-950" spinnerClass="text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-950 overflow-hidden fixed inset-0">
      <div
        className="pointer-events-none absolute overflow-hidden w-px h-px opacity-0 -z-10"
        aria-hidden
      >
        {React.createElement('gdm-live-audio', {
          ref: liveAudioRef,
          'hide-built-in-visuals': true,
          'session-id': sessionId || '',
        })}
      </div>
      {/* LEFT: Audio Visualizer - always dark (global theme only affects the chat column). */}
      <div className="relative flex-shrink-0 w-[65%] h-full border-r border-gray-800/50 bg-black">
        {/* Canvas Animation - Always visible */}
        <div className="absolute inset-0" style={{ background: SESSION_VISUALIZER_BG }}>
          <Canvas
            dpr={[1, 2]}
            style={{ width: '100%', height: '100%' }}
            gl={{ alpha: false, antialias: true }}
          >
        <PerspectiveCamera makeDefault position={[0, 0, 4.0]} />
            <color attach="background" args={[SESSION_VISUALIZER_BG]} />
        
        <Suspense fallback={null}>
              {CONFIG.map((layerConfig, index) => (
            layerConfig.enabled && (
              <VisualizerLayer 
                key={index} 
                config={layerConfig} 
                analyzer={{ getRangeVolume }}
                useAdditiveBlend
              />
            )
          ))}
        </Suspense>

        <VisualizerBloom />
        
        <OrbitControls enableZoom={true} />
      </Canvas>
        </div>

        {/* Top Right: Time Left */}
        <div className="absolute top-6 right-6 z-[100] pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
            <div className={`w-1.5 h-1.5 rounded-full ${sessionStarted ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-sm font-bold text-white font-mono">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>



        {/* Bottom Status Indicator */}
        <AnimatePresence>
          {sessionStarted && isMicActive && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-gray-300 font-medium">
                  Listening
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* RIGHT: Chat Interface - 35% */}
      <div className="w-[35%] h-full flex flex-col bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-transparent">
        {/* Header: Persona Detail - Compact Row */}
        <div className="
          flex-shrink-0 px-5 py-4 border-b border-gray-200 dark:border-gray-800/50
          bg-gray-50/95 dark:bg-gray-900/60 backdrop-blur-xl
        ">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-11 h-11 rounded-full border border-blue-500/30 object-cover flex-shrink-0"
              />
            ) : (
              <div className="
                w-11 h-11 rounded-full flex-shrink-0
                bg-gradient-to-br from-blue-500/20 to-blue-600/20
                border border-blue-500/30
                flex items-center justify-center
              ">
                <span className="text-sm font-bold text-blue-400">
                  {userName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}

            {/* Name & Mode */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{personaMode} · {userRole}</p>
            </div>

            {/* End Session - Top Right */}
            <AnimatePresence>
              {sessionStarted && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={endSession}
                  className="
                    px-3.5 py-1.5 rounded-lg flex-shrink-0
                    bg-red-500/10 border border-red-500/25
                    text-red-400 text-xs font-medium
                    hover:bg-red-500/20 hover:border-red-500/40
                    transition-all duration-200
                  "
                >
                  End Session
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Transcript — ScrollBar matches SideNav (SimpleBar + _scrollbar.css) */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollBar
            className="h-full max-h-full"
            style={{ height: '100%', maxHeight: '100%' }}
            direction={direction}
          >
            <div className="px-6 py-4 space-y-4 min-h-full box-border bg-white dark:bg-transparent">
              {messages.length === 0 ? (
                <div className="min-h-[min(100%,24rem)] flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-500 text-center text-sm">
                    Transcript will appear here<br />
                    <span className="text-xs text-gray-500 dark:text-gray-600">User's input + AI's response</span>
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                      max-w-[90%] px-4 py-3 rounded-xl
                      ${message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900/90 dark:to-gray-800/90 text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/50 shadow-md'
                      }
                    `}
                      >
                        <div
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                        />
                        <p className="text-xs opacity-50 mt-1.5">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700/50">
                        <div className="flex gap-1.5">
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                            className="w-1.5 h-1.5 rounded-full bg-blue-500"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-blue-500"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                            className="w-1.5 h-1.5 rounded-full bg-blue-500"
                          />
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

        {/* Hints Panel - Above Input - One Hint at a Time */}
        <AnimatePresence>
          {showHints && currentHint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-shrink-0 px-6 py-4 border-t border-blue-500/20 dark:border-blue-500/30 bg-gradient-to-br from-blue-500/[0.06] to-blue-600/0 dark:from-blue-500/10 dark:to-blue-600/5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HiLightBulb className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Session Hint {currentHintIndex + 1}/{hints.length}
                  </h4>
                </div>
                <button
                  onClick={() => setShowHints(false)}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Current Hint Display */}
              <motion.div
                key={currentHint.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 rounded-xl bg-white/80 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50"
              >
                <div className="flex items-start gap-2 mb-3">
                  <span className={`
                    px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0
                    ${currentHint.category === 'what' 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' 
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    }
                  `}>
                    {currentHint.category === 'what' ? '💬 What to Say' : '🎯 How to Say'}
                  </span>
                </div>
                
                <h5 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  {currentHint.title}
                </h5>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentHint.suggestion}
                </p>
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePreviousHint}
                  disabled={currentHintIndex === 0}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${currentHintIndex === 0
                      ? 'bg-gray-200/80 dark:bg-gray-800/30 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50 border border-gray-300 dark:border-gray-700/50'
                    }
                  `}
                >
                  ← Previous
                </motion.button>

                <div className="flex gap-1.5">
                  {hints.map((_, index) => (
                    <div
                      key={index}
                      className={`
                        w-2 h-2 rounded-full transition-all duration-300
                        ${index === currentHintIndex
                          ? 'bg-blue-400 w-6'
                          : viewedHints.includes(hints[index].id)
                            ? 'bg-blue-600/50'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }
                      `}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextHint}
                  className="
                    px-4 py-2 rounded-lg text-sm font-medium
                    bg-blue-500/20 text-blue-400 border border-blue-500/40
                    hover:bg-blue-500/30 hover:border-blue-500/60
                    transition-all duration-200
                  "
                >
                  {currentHintIndex === hints.length - 1 ? 'Done ✓' : 'Next →'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Section - Start Session or Chat Input */}
        <div className="flex-shrink-0 px-4 py-3 bg-gray-50/95 dark:bg-gray-900/60 backdrop-blur-2xl border-t border-gray-200 dark:border-gray-800/50">
          <AnimatePresence mode="wait">
            {!sessionStarted ? (
              /* Start / Continue Session Button */
              <motion.div
                key="start-session"
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartSession}
                  className="
                    w-full py-3.5 rounded-full
                    bg-gradient-to-r from-blue-500 to-blue-600
                    text-white text-sm font-semibold
                    shadow-lg shadow-blue-500/25
                    hover:shadow-xl hover:shadow-blue-500/35
                    transition-all duration-300
                  "
                >
                  {hasBackendHistory ? 'Continue Session' : 'Start Session'}
                </motion.button>
              </motion.div>
            ) : (
              /* Chat Input Bar */
              <motion.div
                key="chat-input"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="
                  flex items-center gap-2
                  bg-white/90 dark:bg-gray-800/80 backdrop-blur-xl
                  border border-gray-200 dark:border-gray-700/50
                  rounded-full
                  px-4 py-2
                  focus-within:border-blue-500/50
                  transition-all duration-300
                "
              >
                {/* Attachment */}
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex-shrink-0">
                  <HiPaperClip className="w-5 h-5" />
                </button>

                {/* Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  disabled={isGenerating}
                  className="
                    flex-1 bg-transparent text-gray-900 dark:text-white text-sm
                    placeholder:text-gray-500 dark:placeholder:text-gray-500
                    focus:outline-none
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />

                {/* Hints Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowHints(!showHints);
                    if (!showHints) {
                      const firstUnviewed = hints.findIndex(h => !viewedHints.includes(h.id));
                      setCurrentHintIndex(firstUnviewed >= 0 ? firstUnviewed : 0);
                    }
                  }}
                  className="
                    flex items-center gap-1.5 px-3 py-1 rounded-full flex-shrink-0
                    bg-blue-500/10 border border-blue-500/30 text-blue-400
                    hover:bg-blue-500/20 hover:border-blue-500/50
                    transition-all duration-200
                  "
                >
                  <HiLightBulb className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">
                    {hints.length - viewedHints.length}
                  </span>
                </motion.button>

                {/* Send / Mic Button */}
                {inputValue.trim() ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={isGenerating}
                    className="
                      w-9 h-9 rounded-full flex-shrink-0
                      bg-gradient-to-br from-blue-500 to-blue-600
                      text-white shadow-lg shadow-blue-500/20
                      flex items-center justify-center
                      transition-all duration-200
                    "
                  >
                    <HiPaperAirplane className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMic}
                    className={`
                      w-9 h-9 rounded-full flex-shrink-0
                      flex items-center justify-center
                      transition-all duration-200
                      ${isMicActive
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300 dark:bg-white/10 dark:text-white dark:border-gray-600 dark:hover:bg-white/20'
                      }
                    `}
                  >
                    {isMicActive ? (
                      <HiStop className="w-4 h-4" />
                    ) : (
                      <div className="flex gap-[2px] items-end h-4">
                        {[3, 5, 7, 5, 3].map((h, i) => (
                          <div key={i} className="w-[2px] bg-gray-800 dark:bg-white rounded-full" style={{ height: `${h * 2}px` }} />
                        ))}
                      </div>
                    )}
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
        </div>
    );

}