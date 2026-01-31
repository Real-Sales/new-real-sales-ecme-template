import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';


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

// --- 5. Main Component ---
export default function KiloHerzVisualizer() {
  const { startAudio, getRangeVolume, isReady } = useAudioAnalyzer();

    return (

    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      
      {!isReady && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)'
        }}>
          <button 
            onClick={startAudio}
            style={{
              padding: '1.2rem 3rem', fontSize: '1.1rem', color: '#ff32b7', 
              background: 'transparent', border: '2px solid #ff32b7', 
              cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '4px',
              textTransform: 'uppercase', boxShadow: '0 0 25px rgba(255, 50, 183, 0.4)'
            }}
          >
            Activate: Kilo Herz 2
                    </button>

        </div>
      )}

      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 4.0]} />
        
        <Suspense fallback={null}>
          {isReady && CONFIG.map((layerConfig, index) => (
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
          {/* Kilo Herz uses foggy, glowing aesthetic.
             We use Bloom to simulate the 'fog' + 'additive blending' combo from the reference 
          */}
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
    );

}