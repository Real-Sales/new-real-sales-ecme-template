import React, { useRef, useMemo, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { HiMicrophone, HiStop, HiPaperAirplane, HiPaperClip, HiPlus, HiLightBulb, HiSparkles } from 'react-icons/hi2';


// --- 1. CONFIGURATION: "Kilo Herz 2" ---
const CONFIG = [
  {
    "enabled": true,
    "name": "Kilo Blue Outer",
    "sphereRadius": 1.55,
    "innerSphereRadius": 0.24,
    "rotationSpeed": 0.001,
    "rotationSpeedMin": 0.002,
    "rotationSpeedMax": 0.013,
    "rotationSmoothness": 0.83,
    "particleCount": 8000,
    "particleSize": 0.005,
    "particleLifetime": 10,
    "minFrequency": 20,
    "maxFrequency": 80,
    "minFrequencyBeat": 20,
    "maxFrequencyBeat": 80,
    "noiseScale": 6.4,
    "dynamicNoiseScale": true,
    "minNoiseScale": 2.1,
    "maxNoiseScale": 8.9,
    "noiseStep": 0.2,
    "noiseSpeed": 0.05,
    "turbulenceStrength": 0.0005,
    "colorStart": "#360ff2", // Blue
    "colorEnd": "#481ce8",   // Purple-Blue
    "beatStrength": 0.002,
    "gainMultiplier": 1
  },
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
  const [context, setContext] = useState<{ ctx: AudioContext, source: MediaStreamAudioSourceNode } | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const startAudio = async () => {
    if (context) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const analyzer = ctx.createAnalyser();
      const source = ctx.createMediaStreamSource(stream);

      analyzer.fftSize = 2048;
      analyzer.smoothingTimeConstant = 0.95; // Higher = smoother audio transitions
      
      source.connect(analyzer);
      
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      analyzerRef.current = analyzer;
      dataArrayRef.current = dataArray;
      setContext({ ctx, source });
    } catch (err) {
      console.error("Audio Init Failed:", err);
    }
  };

  const getRangeVolume = (minHz: number, maxHz: number) => {
    if (!analyzerRef.current || !dataArrayRef.current || !context) return 0;
    
    const sampleRate = context.ctx.sampleRate;
    const binCount = analyzerRef.current.frequencyBinCount;
    const nyquist = sampleRate / 2;
    
    const startIndex = Math.floor((minHz / nyquist) * binCount);
    const endIndex = Math.floor((maxHz / nyquist) * binCount);
    
    const start = Math.max(0, startIndex);
    const end = Math.min(binCount - 1, endIndex);
    
    let sum = 0;
    let count = 0;
    
    analyzerRef.current.getByteFrequencyData(dataArrayRef.current as any);

    for (let i = start; i <= end; i++) {
      sum += dataArrayRef.current[i];
      count++;
    }
    
    if (count === 0) return 0;
    return (sum / count) / 255;
  };

  return { startAudio, getRangeVolume, isReady: !!context };
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
const VisualizerLayer = ({ config, analyzer }: { config: any, analyzer: any }) => {
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
      blending: THREE.AdditiveBlending
    });
  }, [config]);

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

// --- 5. Types for Chat Interface ---
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
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
export default function KiloHerzVisualizer() {
  const location = useLocation();
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

  const { startAudio, getRangeVolume, isReady } = useAudioAnalyzer();
  const [isMicActive, setIsMicActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [personaMode] = useState(
    sessionData?.mode 
      ? sessionData.mode.charAt(0).toUpperCase() + sessionData.mode.slice(1)
      : 'Discovering'
  );
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [userName] = useState(sessionData?.persona?.name || 'AI Persona');
  const [userRole] = useState(sessionData?.persona?.role || 'Role');
  const [userAvatar] = useState(sessionData?.persona?.avatar);
  const [hints, setHints] = useState<Hint[]>(AVAILABLE_HINTS);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [viewedHints, setViewedHints] = useState<number[]>([]);
  const [showHints, setShowHints] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Timer countdown
  useEffect(() => {
    if (!isReady || !isMicActive) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isReady, isMicActive]);

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

  const handleSendMessage = () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Based on your sales data, I\'ve identified three key opportunities for growth. **First**, your Q4 conversion rates show a 23% increase in the enterprise segment. **Second**, mobile traffic has doubled, suggesting we should optimize for mobile-first experiences.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 2000);
  };

  const toggleMic = async () => {
    if (!isReady) {
      await startAudio();
    }
    setIsMicActive(!isMicActive);
  };

  const endSession = () => {
    setMessages([]);
    setIsMicActive(false);
    setTimeLeft(1800); // Reset timer
    setViewedHints([]); // Reset hints
    setCurrentHintIndex(0);
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
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    formatted = formatted.replace(/`(.*?)`/g, '<code class="px-2 py-0.5 rounded-lg bg-gray-800/80 text-blue-400 font-mono text-sm">$1</code>');
    return formatted;
  };

  return (
    <div className="flex h-screen w-screen bg-gray-950 overflow-hidden fixed inset-0">
      {/* LEFT: Audio Visualizer - Increased to 65% */}
      <div className="relative flex-shrink-0 w-[65%] h-full border-r border-gray-800/50 bg-black">
        {/* Canvas Animation - Always visible */}
        <div className="absolute inset-0" style={{ background: '#000000' }}>
          <Canvas dpr={[1, 2]} style={{ width: '100%', height: '100%' }} gl={{ alpha: false, antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 4.0]} />
            <color attach="background" args={['#000000']} />
        
        <Suspense fallback={null}>
              {CONFIG.map((layerConfig, index) => (
            layerConfig.enabled && (
              <VisualizerLayer 
                key={index} 
                config={layerConfig} 
                analyzer={{ getRangeVolume }} 
              />
            )
          ))}
        </Suspense>

        <EffectComposer enableNormalPass={false}>
          <Bloom 
            luminanceThreshold={0.3} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.8} 
          />
        </EffectComposer>
        
        <OrbitControls enableZoom={true} />
      </Canvas>
        </div>

        {/* Overlay hint when not ready */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">Audio Visualizer</p>
              <p className="text-gray-600 text-sm">Click the microphone button below to activate</p>
            </div>
          </div>
        )}

        {/* Mic Control Overlay - Bottom Center with unique animation */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
          <motion.button
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 10px 40px rgba(42, 133, 255, 0.3)',
                '0 15px 60px rgba(42, 133, 255, 0.5)',
                '0 10px 40px rgba(42, 133, 255, 0.3)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMic}
            title={!isReady ? "Click to activate audio" : isMicActive ? "Stop listening" : "Start listening"}
            className={`
              group relative w-20 h-20 rounded-full
              transition-all duration-300
              pointer-events-auto
              flex items-center justify-center
              ${!isReady
                ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-600 shadow-2xl shadow-blue-500/50'
                : isMicActive 
                  ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/60' 
                  : 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-600 shadow-2xl shadow-blue-500/50'
              }
            `}
          >
            {isMicActive && isReady ? (
              <HiStop className="w-9 h-9 text-white" />
            ) : (
              <HiMicrophone className="w-9 h-9 text-white" />
            )}
            
            {/* Continuous pulse ring */}
            <motion.span 
              className="absolute inset-0 rounded-full border-2 border-blue-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
            
            {/* Active listening pulse */}
            {isMicActive && isReady && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></span>
                <motion.span 
                  className="absolute inset-0 rounded-full bg-red-400"
                  animate={{
                    scale: [1, 1.8],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              </>
            )}
          </motion.button>
        </div>

        {/* End Session Button - Bottom Right - Red */}
        <div className="absolute bottom-12 right-8 z-[100] pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={endSession}
            className="
              px-6 py-3 rounded-xl
              bg-gradient-to-br from-red-500 to-red-600
              border border-red-400/30
              text-white text-sm font-semibold
              hover:from-red-600 hover:to-red-700
              transition-all duration-200
              shadow-xl shadow-red-500/30
              hover:shadow-2xl hover:shadow-red-500/50
              pointer-events-auto
            "
          >
            End Session
          </motion.button>
        </div>
      </div>

      {/* RIGHT: Chat Interface - 35% */}
      <div className="w-[35%] h-full flex flex-col bg-gray-950">
        {/* Header: Persona Detail with Avatar and Session Info */}
        <div className="
          flex-shrink-0 px-6 py-6 border-b border-gray-800/50
          bg-gradient-to-br from-gray-900/80 to-gray-900/60
          backdrop-blur-xl
        ">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Avatar and User Info */}
            <div className="flex flex-col items-center">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="
                    w-20 h-20 rounded-full mb-3
                    border-2 border-blue-500/40
                    shadow-lg shadow-blue-500/20
                    object-cover
                  "
                />
              ) : (
                <div className="
                  w-20 h-20 rounded-full mb-3
                  bg-gradient-to-br from-blue-500/20 to-blue-600/20
                  border-2 border-blue-500/40
                  flex items-center justify-center
                  shadow-lg shadow-blue-500/20
                ">
                  <span className="text-2xl font-bold text-blue-400">
                    {userName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
              <h3 className="text-sm font-semibold text-white text-center">
                {userName}
              </h3>
              <p className="text-xs text-gray-400 text-center">
                {userRole}
              </p>
            </div>

            {/* Right: Session Info and Actions */}
            <div className="flex-1 flex flex-col gap-3">
              {/* Session Mode */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Session Mode:</p>
                <p className="text-base font-semibold text-blue-400">
                  {personaMode}
                </p>
              </div>

              {/* Time Left */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Time left:</p>
                <p className="text-lg font-bold text-white font-mono">
                  {formatTime(timeLeft)}
                </p>
              </div>

              {/* Add Scenario/Files Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddFiles}
                className="
                  flex items-center gap-2 px-4 py-2.5 rounded-xl
                  bg-gray-800/50 border border-gray-700/50
                  text-gray-300 text-xs font-medium
                  hover:bg-gray-700/50 hover:border-gray-600
                  transition-all duration-200
                  shadow-md
                "
              >
                <HiPlus className="w-4 h-4" />
                <span>Add scenario or files</span>
                <HiPaperClip className="w-4 h-4 ml-auto" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Transcript Area - Middle Large Section */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 text-center text-sm">
                Transcript will appear here<br />
                <span className="text-xs text-gray-600">User's input + AI's response</span>
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
                        : 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 text-gray-200 border border-gray-700/50 shadow-md'
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
                  <div className="px-4 py-3 rounded-xl bg-gray-900/90 border border-gray-700/50">
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

        {/* Hints Panel - Above Input - One Hint at a Time */}
        <AnimatePresence>
          {showHints && currentHint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-shrink-0 px-6 py-4 border-t border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HiLightBulb className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-semibold text-white">
                    Session Hint {currentHintIndex + 1}/{hints.length}
                  </h4>
                </div>
                <button
                  onClick={() => setShowHints(false)}
                  className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
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
                className="p-4 rounded-xl bg-gray-900/50 border border-gray-700/50"
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
                
                <h5 className="text-base font-bold text-white mb-2">
                  {currentHint.title}
                </h5>
                
                <p className="text-sm text-gray-300 leading-relaxed">
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
                      ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
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
                            : 'bg-gray-600'
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

        {/* Input Field - Bottom */}
        <div className="
          flex-shrink-0 px-6 py-4 border-t border-gray-800/50
          bg-gray-900/60 backdrop-blur-2xl
        ">
          {/* Hints Button */}
          <div className="mb-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowHints(!showHints);
                // When opening hints, start from first unviewed or reset to beginning
                if (!showHints) {
                  const firstUnviewed = hints.findIndex(h => !viewedHints.includes(h.id));
                  setCurrentHintIndex(firstUnviewed >= 0 ? firstUnviewed : 0);
                }
              }}
              className="
                flex items-center gap-2 px-4 py-2 rounded-xl w-full
                bg-blue-500/10 border border-blue-500/30 text-blue-400 
                hover:bg-blue-500/20 hover:border-blue-500/50
                transition-all duration-200
              "
            >
              <HiLightBulb className="w-4 h-4" />
              <span className="text-sm font-medium">
                {showHints ? 'Hide Hints' : `${hints.length - viewedHints.length} Hints to View`}
              </span>
              <span className="ml-auto w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                {hints.length - viewedHints.length}
              </span>
            </motion.button>
          </div>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type text msg here"
              disabled={isGenerating}
              className="
                w-full px-5 py-3 pr-12 rounded-xl
                bg-gray-900/80 backdrop-blur-xl
                border-2 border-gray-700/50
                text-white text-sm
                placeholder:text-gray-500
                focus:border-blue-500/60 focus:shadow-xl focus:shadow-blue-500/20 focus:ring-4 focus:ring-blue-500/10
                focus:outline-none
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isGenerating}
              className={`
                absolute right-2 top-1/2 -translate-y-1/2
                w-9 h-9 rounded-lg
                flex items-center justify-center
                transition-all duration-200
                ${inputValue.trim() && !isGenerating
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                }
              `}
            >
              <HiPaperAirplane className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
        </div>
    );

}