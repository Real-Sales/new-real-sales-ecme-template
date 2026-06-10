import {
    useEffect,
    useRef,
    useState,
    useCallback,
    type FC,
    type JSX,
} from 'react'
import type { Meta } from '@/@types/routes'
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import personaIntros from '../../../../../persona_intros/index.json'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { LandingThemeProvider } from '../../LandingThemeProvider'
import NavigationBar from '../NavigationBar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiPersona {
    persona_id: string
    name: string
    industry: { name: string; industry_id: string }
    ai_role: { name: string; ai_role_id: string }
    geography: string
    company_size_new?: { name: string; company_size_id: string }
    status_active: boolean
    profile_pic: string
    gender: string
    voice_id: string
    persona_products?: { persona_product_id: string; product: { name: string } }[]
}

interface LocalPersona {
    persona_id: string
    name: string
    ai_role: string
    gender: string
    company_size: string
    intro_text: string
    duration_ms: number
}

interface MergedPersona {
    id: string
    name: string
    role: string
    company_size: string
    intro_text: string
    profile_pic: string | null
    gender: string
    has_audio: boolean
}

// ─── Ambient Canvas ──────────────────────────────────────────────────────────

const AmbientParticles: FC<{ isLight?: boolean }> = ({ isLight = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        let raf: number
        const pts: { x: number; y: number; vx: number; vy: number; r: number; o: number; od: number }[] = []
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
        resize()
        window.addEventListener('resize', resize)
        for (let i = 0; i < 55; i++) pts.push({ x: Math.random() * 1920, y: Math.random() * 900, vx: (Math.random() - .5) * .15, vy: (Math.random() - .5) * .12, r: Math.random() * 1.5 + .3, o: Math.random() * .3 + .04, od: Math.random() > .5 ? 1 : -1 })
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.o += p.od * .0007
                if (p.o > .35 || p.o < .03) p.od *= -1
                if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
                if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(12,175,96,${p.o})`; ctx.fill()
            })
            raf = requestAnimationFrame(draw)
        }
        draw()
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
    }, [])
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: isLight ? 0.18 : 0.65 }} />
}

// ─── Premium Waveform (Canvas-based) ─────────────────────────────────────────

const PremiumWaveform: FC<{ isPlaying: boolean; progress: number; personaId: string; isLight?: boolean }> = ({ isPlaying, progress, isLight = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animRef = useRef<number>(0)
    const phaseRef = useRef(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const W = canvas.width
        const H = canvas.height
        const bars = 38
        const barW = 2.5
        const gap = (W - bars * barW) / (bars + 1)
        // polyfill roundRect for older Safari
        if (!ctx.roundRect) {
            ctx.roundRect = function(x: number, y: number, w: number, h: number) { ctx.rect(x, y, w, h) } as typeof ctx.roundRect
        }

        const baseHeights = Array.from({ length: bars }, (_, i) => {
            const t = i / (bars - 1)
            return 6 + Math.sin(t * Math.PI) * 18 + Math.sin(t * Math.PI * 3 + 0.5) * 6 + Math.cos(t * Math.PI * 2) * 4
        })

        const draw = () => {
            ctx.clearRect(0, 0, W, H)
            phaseRef.current += isPlaying ? 0.055 : 0.012

            for (let i = 0; i < bars; i++) {
                const x = gap + i * (barW + gap)
                const filled = i / bars < progress

                let h = baseHeights[i]
                if (isPlaying) {
                    h += Math.sin(phaseRef.current + i * 0.45) * 10
                    h += Math.sin(phaseRef.current * 1.7 + i * 0.3) * 5
                    h = Math.max(4, h)
                } else {
                    h += Math.sin(phaseRef.current + i * 0.6) * 2.5
                }

                const y = (H - h) / 2
                const alpha = filled ? 1 : isPlaying ? 0.7 + Math.sin(phaseRef.current + i * 0.4) * 0.15 : 0.22

                // Glow layer for active bars
                if (isPlaying && !filled) {
                    ctx.beginPath()
                    ctx.roundRect(x - 1, y - 2, barW + 2, h + 4, 4)
                    ctx.fillStyle = `rgba(12,175,96,${alpha * 0.25})`
                    ctx.filter = 'blur(3px)'
                    ctx.fill()
                    ctx.filter = 'none'
                }

                ctx.beginPath()
                ctx.roundRect(x, y, barW, h, 2)

                if (filled) {
                    const grad = ctx.createLinearGradient(x, y, x, y + h)
                    grad.addColorStop(0, 'rgba(52,199,121,1)')
                    grad.addColorStop(1, 'rgba(12,175,96,0.8)')
                    ctx.fillStyle = grad
                } else if (isPlaying) {
                    const grad = ctx.createLinearGradient(x, y, x, y + h)
                    grad.addColorStop(0, `rgba(52,199,121,${alpha})`)
                    grad.addColorStop(0.5, `rgba(12,175,96,${alpha})`)
                    grad.addColorStop(1, `rgba(8,141,80,${alpha * 0.6})`)
                    ctx.fillStyle = grad
                } else {
                    ctx.fillStyle = isLight ? `rgba(0,0,0,${alpha * 0.35})` : `rgba(255,255,255,${alpha})`
                }

                ctx.fill()
            }

            animRef.current = requestAnimationFrame(draw)
        }

        draw()
        return () => cancelAnimationFrame(animRef.current)
    }, [isPlaying, progress])

    return (
        <canvas
            ref={canvasRef}
            width={220}
            height={44}
            style={{ width: '100%', height: 44, display: 'block' }}
        />
    )
}

// ─── Magnetic Play Button ─────────────────────────────────────────────────────

const PlayButton: FC<{ isPlaying: boolean; onToggle: (e: React.MouseEvent) => void }> = ({ isPlaying, onToggle }) => {
    const btnRef = useRef<HTMLButtonElement>(null)
    const mx = useMotionValue(0)
    const my = useMotionValue(0)
    const sx = useSpring(mx, { stiffness: 300, damping: 20 })
    const sy = useSpring(my, { stiffness: 300, damping: 20 })

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!btnRef.current) return
        const r = btnRef.current.getBoundingClientRect()
        mx.set((e.clientX - r.left - r.width / 2) * 0.35)
        my.set((e.clientY - r.top - r.height / 2) * 0.35)
    }, [mx, my])

    const handleMouseLeave = useCallback(() => {
        mx.set(0); my.set(0)
    }, [mx, my])

    return (
        <motion.div
            className="relative flex items-center justify-center"
            style={{ x: sx, y: sy, width: 56, height: 56 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Outer pulse rings when playing */}
            {isPlaying && <>
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: '1px solid rgba(12,175,96,0.35)' }}
                    animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: '1px solid rgba(12,175,96,0.2)' }}
                    animate={{ scale: [1, 2.4], opacity: [0.4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                />
            </>}

            {/* Glow halo */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(12,175,96,0.4) 0%, transparent 70%)' }}
                animate={{ opacity: isPlaying ? [0.6, 1, 0.6] : 0.3, scale: isPlaying ? [0.9, 1.1, 0.9] : 1 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.button
                ref={btnRef}
                onClick={onToggle}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                className="relative z-10 flex items-center justify-center rounded-full cursor-pointer select-none"
                style={{
                    width: 56,
                    height: 56,
                    background: isPlaying
                        ? 'linear-gradient(135deg, #0CAF60, #088d50)'
                        : 'linear-gradient(135deg, rgba(12,175,96,0.2), rgba(12,175,96,0.08))',
                    border: '1.5px solid rgba(12,175,96,0.5)',
                    boxShadow: isPlaying
                        ? '0 0 24px rgba(12,175,96,0.4), 0 4px 12px rgba(0,0,0,0.15)'
                        : '0 0 12px rgba(12,175,96,0.15), 0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'background 0.3s, box-shadow 0.3s',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                <AnimatePresence mode="wait">
                    {isPlaying ? (
                        <motion.div
                            key="pause"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex gap-[4px]"
                        >
                            <div style={{ width: 3, height: 16, borderRadius: 2, background: '#fff' }} />
                            <div style={{ width: 3, height: 16, borderRadius: 2, background: '#fff' }} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="play"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            style={{
                                width: 0,
                                height: 0,
                                borderTop: '9px solid transparent',
                                borderBottom: '9px solid transparent',
                                borderLeft: '16px solid rgba(12,175,96,0.9)',
                                marginLeft: 3,
                            }}
                        />
                    )}
                </AnimatePresence>
            </motion.button>
        </motion.div>
    )
}

// ─── Premium Persona Card ─────────────────────────────────────────────────────

interface CardProps {
    persona: MergedPersona
    isActive: boolean
    isPlaying: boolean
    audioProgress: number
    onPlayPause: (e: React.MouseEvent) => void
    index: number
    total: number
    isLight: boolean
}

const PersonaCard: FC<CardProps> = ({ persona, isActive, isPlaying, audioProgress, onPlayPause, index, isLight }) => {
    const spotRef = useRef<HTMLDivElement>(null)
    const [hovered, setHovered] = useState(false)

    const initials = persona.name.split(' ').map(n => n[0]).slice(0, 2).join('')

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!spotRef.current) return
        const r = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - r.left
        const y = e.clientY - r.top
        gsap.to(spotRef.current, { left: x, top: y, duration: 0.25, ease: 'power2.out' })
    }, [])

    const handleMouseLeave = useCallback(() => {
        setHovered(false)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0 cursor-pointer select-none"
            style={{ width: 300 }}
            onClick={onPlayPause}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className="relative overflow-hidden rounded-3xl"
                style={{
                    background: isActive
                        ? isLight
                            ? 'linear-gradient(160deg, rgba(12,175,96,0.07) 0%, #ffffff 55%, rgba(12,175,96,0.03) 100%)'
                            : 'linear-gradient(160deg, rgba(12,175,96,0.1) 0%, rgba(8,8,8,0.97) 55%, rgba(12,175,96,0.05) 100%)'
                        : isLight
                            ? '#ffffff'
                            : 'linear-gradient(160deg, rgba(22,22,22,0.97) 0%, rgba(10,10,10,0.98) 100%)',
                    border: isActive
                        ? '1px solid rgba(12,175,96,0.35)'
                        : hovered
                        ? `1px solid ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)'}`
                        : `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.055)'}`,
                    boxShadow: isActive
                        ? `0 0 60px rgba(12,175,96,0.12), 0 20px 50px ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.7)'}, inset 0 1px 0 rgba(12,175,96,0.1)`
                        : hovered
                        ? `0 12px 40px ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.6)'}`
                        : `0 4px 20px ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.5)'}`,
                    transition: 'border 0.3s, box-shadow 0.4s, background 0.4s',
                }}
                onMouseMove={handleMouseMove}
            >
                {/* Mouse-tracking spotlight */}
                <div
                    ref={spotRef}
                    className="absolute pointer-events-none"
                    style={{
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: isActive
                            ? 'radial-gradient(circle, rgba(12,175,96,0.1) 0%, transparent 65%)'
                            : 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%)',
                        transform: 'translate(-50%,-50%)',
                        left: '50%',
                        top: '30%',
                        transition: 'background 0.3s',
                        pointerEvents: 'none',
                    }}
                />

                {/* Active top shimmer */}
                {isActive && (
                    <motion.div
                        layoutId="shimmer-top"
                        className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(12,175,96,0.8) 30%, rgba(52,199,121,1) 50%, rgba(12,175,96,0.8) 70%, transparent 100%)' }}
                    />
                )}

                {/* Noise grain texture overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: '180px' }}
                />

                <div className="relative z-10 p-6">
                    {/* Avatar section */}
                    <div className="flex flex-col items-center mb-5">
                        <div className="relative mb-4" style={{ width: 100, height: 100 }}>
                            {/* Breathing outer ring */}
                            <motion.div
                                className="absolute rounded-full"
                                style={{ inset: -8, border: `1.5px solid ${isActive ? 'rgba(12,175,96,0.25)' : (isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)')}` }}
                                animate={{ opacity: isActive ? [0.4, 0.9, 0.4] : [0.2, 0.4, 0.2], scale: isActive ? [0.97, 1.02, 0.97] : [0.98, 1, 0.98] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            {/* Playing pulse rings */}
                            {isActive && isPlaying && <>
                                <motion.div className="absolute rounded-full" style={{ inset: -4, border: '1px solid rgba(12,175,96,0.5)' }} animate={{ scale: [1, 1.35], opacity: [0.5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} />
                                <motion.div className="absolute rounded-full" style={{ inset: -4, border: '1px solid rgba(12,175,96,0.3)' }} animate={{ scale: [1, 1.55], opacity: [0.4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.6 }} />
                            </>}

                            {/* Avatar */}
                            {persona.profile_pic ? (
                                <img
                                    src={persona.profile_pic}
                                    alt={persona.name}
                                    className="w-full h-full rounded-full object-cover"
                                    style={{ border: isActive ? '2px solid rgba(12,175,96,0.5)' : `2px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.07)'}` }}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                        const fb = e.currentTarget.parentElement?.querySelector('.fb') as HTMLElement
                                        if (fb) fb.style.display = 'flex'
                                    }}
                                />
                            ) : null}
                            <div
                                className="fb w-full h-full rounded-full items-center justify-center text-2xl font-bold"
                                    style={{
                                        display: persona.profile_pic ? 'none' : 'flex',
                                        background: isActive
                                            ? 'linear-gradient(135deg, rgba(12,175,96,0.18) 0%, rgba(12,175,96,0.05) 100%)'
                                            : isLight
                                                ? 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                                                : 'linear-gradient(135deg, rgba(30,30,30,1) 0%, rgba(18,18,18,1) 100%)',
                                        border: isActive ? '2px solid rgba(12,175,96,0.45)' : `2px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)'}`,
                                        color: isActive ? '#0CAF60' : (isLight ? '#9CA3AF' : '#4B5563'),
                                    letterSpacing: '-0.03em',
                                }}
                            >
                                {initials}
                            </div>
                        </div>

                        <motion.h3
                            className="text-base font-semibold tracking-tight mb-0.5 text-center"
                            style={{ color: isActive ? (isLight ? '#111827' : '#F5F5F5') : (isLight ? '#374151' : '#D1D5DB') }}
                            animate={{ color: isActive ? (isLight ? '#111827' : '#F5F5F5') : (isLight ? '#6B7280' : '#9CA3AF') }}
                            transition={{ duration: 0.3 }}
                        >
                            {persona.name}
                        </motion.h3>
                        <p className="text-xs font-medium text-center" style={{ color: isActive ? '#0CAF60' : (isLight ? '#9CA3AF' : '#4B5563') }}>
                            {persona.role}
                        </p>
                    </div>

                    {/* Company size tag */}
                    <div className="flex justify-center mb-4">
                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium tracking-wide"
                            style={{
                                background: isActive ? 'rgba(12,175,96,0.1)' : (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'),
                                border: isActive ? '1px solid rgba(12,175,96,0.22)' : `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)'}`,
                                color: isActive ? '#0CAF60' : (isLight ? '#9CA3AF' : '#4B5563'),
                                transition: 'all 0.3s',
                            }}
                        >
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive ? '#0CAF60' : (isLight ? '#D1D5DB' : '#374151'), display: 'inline-block' }} />
                            {persona.company_size.replace(':', '').trim()}
                        </span>
                    </div>

                    {/* Quote */}
                    <p
                        className="text-xs leading-[1.65] text-center mb-5 line-clamp-3"
                        style={{ color: isActive ? (isLight ? '#374151' : '#6B7280') : (isLight ? '#9CA3AF' : '#374151') }}
                    >
                        {persona.intro_text}
                    </p>

                    {/* Voice player */}
                    {persona.has_audio && (
                        <div
                            className="rounded-2xl p-4"
                            style={{
                                background: isActive
                                    ? 'rgba(12,175,96,0.06)'
                                    : (isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.025)'),
                                border: isActive
                                    ? '1px solid rgba(12,175,96,0.15)'
                                    : `1px solid ${isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)'}`,
                                transition: 'all 0.4s',
                            }}
                        >
                            {/* Label */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: isActive ? 'rgba(12,175,96,0.8)' : (isLight ? '#9CA3AF' : '#6B7280') }}>
                                    Voice preview
                                </span>
                                {isActive && isPlaying && (
                                    <motion.span
                                        className="text-[10px] font-medium"
                                        style={{ color: '#0CAF60' }}
                                        animate={{ opacity: [1, 0.4, 1] }}
                                        transition={{ duration: 1.4, repeat: Infinity }}
                                    >
                                        Live
                                    </motion.span>
                                )}
                            </div>

                            {/* Player row */}
                            <div className="flex items-center gap-3">
                                <PlayButton
                                    isPlaying={isActive && isPlaying}
                                    onToggle={onPlayPause}
                                />
                                <div className="flex-1 min-w-0">
                                    <PremiumWaveform
                                        isPlaying={isActive && isPlaying}
                                        progress={isActive ? audioProgress : 0}
                                        personaId={persona.id}
                                        isLight={isLight}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard: FC<{ delay?: number; isLight?: boolean }> = ({ delay = 0, isLight = false }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
        className="flex-shrink-0 rounded-3xl overflow-hidden"
        style={{ width: 300, background: isLight ? '#f3f4f6' : 'rgba(13,13,13,0.95)', border: `1px solid ${isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)'}` }}
    >
        <div className="p-6">
            <div className="flex flex-col items-center mb-5">
                <motion.div className="w-[100px] h-[100px] rounded-full mb-4" style={{ background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' }} animate={{ opacity: [.4, .7, .4] }} transition={{ duration: 1.8, repeat: Infinity, delay }} />
                {[55, 75].map((w, i) => (
                    <motion.div key={i} className="h-3 rounded-full mb-1.5" style={{ width: `${w}%`, background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' }} animate={{ opacity: [.4, .7, .4] }} transition={{ duration: 1.8, repeat: Infinity, delay: delay + i * .1 }} />
                ))}
            </div>
            <motion.div className="h-[88px] rounded-2xl" style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)' }} animate={{ opacity: [.3, .6, .3] }} transition={{ duration: 1.8, repeat: Infinity, delay: delay + .2 }} />
        </div>
    </motion.div>
)

// ─── Track Navigation ─────────────────────────────────────────────────────────

const TrackNav: FC<{ total: number; active: number; onDotClick: (i: number) => void; isLight: boolean }> = ({ total, active, onDotClick, isLight }) => (
    <div className="flex items-center justify-center gap-2 mt-6">
        {Array.from({ length: total }).map((_, i) => (
            <button
                key={i}
                onClick={() => onDotClick(i)}
                className="relative transition-all duration-300"
                style={{
                    width: i === active ? 24 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === active ? '#0CAF60' : (isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'),
                    boxShadow: i === active ? '0 0 8px rgba(12,175,96,0.5)' : 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                }}
            />
        ))}
    </div>
)

// ─── Badge ────────────────────────────────────────────────────────────────────

const HeroBadge: FC = () => (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-[11px] font-semibold tracking-widest uppercase"
        style={{ background: 'rgba(12,175,96,0.09)', border: '1px solid rgba(12,175,96,0.22)', color: '#0CAF60' }}
    >
        <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#0CAF60', boxShadow: '0 0 6px #0CAF60' }}
            animate={{ opacity: [1, .3, 1], scale: [1, .8, 1] }}
            transition={{ duration: 2.2, repeat: Infinity }}
        />
        Industry-Specific AI Training
    </motion.div>
)

// ─── Main Page ────────────────────────────────────────────────────────────────

function FoodAndBeverages<T extends Meta>(_props: T): JSX.Element {
    const [isDark, setMode] = useDarkMode()
    const isLight = !isDark
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () =>
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    const heroRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const [personas, setPersonas] = useState<MergedPersona[]>([])
    const [loading, setLoading] = useState(true)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioProgress, setAudioProgress] = useState(0)
    const [visiblePage, setVisiblePage] = useState(0)

    const localPersonas = personaIntros.personas as LocalPersona[]
    const CARDS_PER_PAGE = 4

    useEffect(() => {
        const buildFromLocal = () => {
            const merged: MergedPersona[] = localPersonas.map((lp) => ({
                id: lp.persona_id,
                name: lp.name,
                role: lp.ai_role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                company_size: lp.company_size,
                intro_text: lp.intro_text,
                profile_pic: null,
                gender: lp.gender,
                has_audio: true,
            }))
            setPersonas(merged)
            if (merged.length > 0) setActiveId(merged[0].id)
            setLoading(false)
        }

        const fetchFromApi = async () => {
            try {
                const res = await fetch('/api/v1/ai-personas/', { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) })
                if (!res.ok) throw new Error()
                const data: ApiPersona[] = await res.json()
                const fb = data.filter(p => p.industry?.name?.toLowerCase().includes('food'))
                if (!fb.length) throw new Error()
                const merged: MergedPersona[] = fb.map(ap => {
                    const lp = localPersonas.find(l => l.persona_id === ap.persona_id)
                    return { id: ap.persona_id, name: ap.name, role: ap.ai_role?.name ?? '', company_size: ap.company_size_new?.name ?? '', intro_text: lp?.intro_text ?? '', profile_pic: ap.profile_pic ?? null, gender: ap.gender, has_audio: !!lp }
                })
                setPersonas(merged)
                if (merged.length > 0) setActiveId(merged[0].id)
            } catch { buildFromLocal() }
            finally { setLoading(false) }
        }
        fetchFromApi()
    }, [])

    // GSAP hero reveal
    useEffect(() => {
        if (!titleRef.current) return
        const observer = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                gsap.fromTo(titleRef.current!.querySelectorAll('.word'), { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, stagger: 0.065, ease: 'power3.out' })
                observer.disconnect()
            }
        }, { threshold: 0.1 })
        observer.observe(titleRef.current)
        return () => observer.disconnect()
    }, [])

    // Audio management
    const playPersona = useCallback((id: string) => {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
        const audio = new Audio(`/persona_intros/${id}.wav`)
        audioRef.current = audio
        audio.addEventListener('timeupdate', () => { if (audio.duration) setAudioProgress(audio.currentTime / audio.duration) })
        audio.addEventListener('ended', () => { setIsPlaying(false); setAudioProgress(0) })
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }, [])

    const handlePlayPause = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (activeId !== id) { setActiveId(id); setAudioProgress(0); playPersona(id); return }
        if (!audioRef.current) { playPersona(id); return }
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false) }
        else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}) }
    }, [activeId, isPlaying, playPersona])

    const CARD_WIDTH = 300 + 20 // card + gap
    const totalPages = Math.ceil(personas.length / CARDS_PER_PAGE)

    const scrollToPage = useCallback((page: number) => {
        if (!scrollRef.current) return
        scrollRef.current.scrollTo({ left: page * CARDS_PER_PAGE * CARD_WIDTH, behavior: 'smooth' })
        setVisiblePage(page)
    }, [CARD_WIDTH, CARDS_PER_PAGE])

    // Keep dots in sync with manual scroll
    useEffect(() => {
        const el = scrollRef.current
        if (!el || totalPages <= 1) return
        const onScroll = () => {
            const page = Math.round(el.scrollLeft / (CARDS_PER_PAGE * CARD_WIDTH))
            setVisiblePage(Math.min(page, totalPages - 1))
        }
        el.addEventListener('scroll', onScroll, { passive: true })
        return () => el.removeEventListener('scroll', onScroll)
    }, [totalPages, CARD_WIDTH, CARDS_PER_PAGE, personas])

    const activeIndex = personas.findIndex(p => p.id === activeId)

    useEffect(() => { return () => { audioRef.current?.pause() } }, [])

    // Smooth scroll (Lenis) — matches the landing page feel.
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches
        if (prefersReducedMotion) return

        const lenis = new Lenis({
            duration: 1.15,
            easing: (x: number) => Math.min(1, 1.001 - Math.pow(2, -10 * x)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
        })

        let rafId = 0
        const raf = (time: number) => {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }
        rafId = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(rafId)
            lenis.destroy()
        }
    }, [])

    return (
      <LandingThemeProvider mode={mode}>
        <div
            className={`relative z-0 flex-1 w-full min-w-full min-h-screen min-h-[100dvh] overflow-x-clip ${isLight ? 'bg-white' : 'bg-[#050505]'}`}
            style={{
                color: isLight ? '#111827' : '#F5F5F5',
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            {/* Full-bleed page backdrop (covers body gray on wide screens) */}
            <div
                className="fixed inset-0 -z-10 pointer-events-none"
                style={{ background: isLight ? '#ffffff' : '#050505' }}
            />

            {/* ── Background layer ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <AmbientParticles isLight={isLight} />
                {/* Large ambient glow top */}
                <motion.div
                    className="absolute"
                    animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: 900, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(12,175,96,0.055) 0%, transparent 70%)', top: -200, left: '50%', transform: 'translateX(-50%)', filter: 'blur(50px)' }}
                />
                {/* Bottom right glow (hidden in light mode to keep CTA area flat white) */}
                {!isLight && (
                    <motion.div
                        className="absolute"
                        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                        style={{ width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(12,175,96,0.04) 0%, transparent 70%)', bottom: '5%', right: '-80px', filter: 'blur(60px)' }}
                    />
                )}
                {/* Subtle dot grid */}
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(${isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.8)'} 1px, transparent 1px)`, backgroundSize: '44px 44px' }} />
            </div>

            {/* ── Nav bar ── */}
            <NavigationBar mode={mode} toggleMode={toggleMode} />

            {/* ── Hero ── */}
            <section ref={heroRef} className="relative z-10 px-6 pt-28 md:pt-32 pb-16 max-w-4xl mx-auto text-center">
                <HeroBadge />
                <h1
                    ref={titleRef}
                    className="font-bold leading-[1.04] tracking-[-0.03em] mb-6"
                    style={{ fontSize: 'clamp(42px, 7vw, 76px)' }}
                >
                    {['AI Personas for', 'Food & Beverage', 'Sales Training'].map((line, li) => (
                        <span key={li} className="block overflow-hidden">
                            {line.split(' ').map((word, wi) => (
                                <span
                                    key={wi}
                                    className="word inline-block mr-[0.22em] opacity-0"
                                    style={{ color: line === 'Food & Beverage' ? '#0CAF60' : (isLight ? '#111827' : '#F5F5F5'), textShadow: line === 'Food & Beverage' ? '0 0 40px rgba(12,175,96,0.3)' : 'none' }}
                                >
                                    {word}
                                </span>
                            ))}
                        </span>
                    ))}
                </h1>

                <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10"
                    style={{ color: isLight ? '#4B5563' : '#52525b' }}
                >
                    Train against hyper-realistic AI buyers — plant managers, CFOs, distillery owners, and procurement directors. Real voices. Real objections.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                    className="flex items-center justify-center gap-8 text-sm"
                >
                    {[['20+', 'AI personas'], ['6+', 'Seniority levels'], ['3', 'Company sizes']].map(([v, l]) => (
                        <div key={l} className="flex flex-col items-center gap-0.5">
                            <span className="text-xl font-bold tracking-tight" style={{ color: '#0CAF60' }}>{v}</span>
                            <span style={{ color: isLight ? '#6B7280' : '#374151', fontSize: 11 }}>{l}</span>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* ── Active persona strip ── */}
            <AnimatePresence mode="wait">
                {!loading && activeId && (
                    <motion.div
                        key={activeId}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 max-w-2xl mx-auto px-6 mb-8"
                    >
                        <motion.div
                            className="flex items-center gap-4 px-5 py-3 rounded-2xl overflow-hidden relative"
                            animate={{
                                borderColor: isPlaying ? 'rgba(12,175,96,0.35)' : 'rgba(12,175,96,0.14)',
                                background: isPlaying ? 'rgba(12,175,96,0.08)' : 'rgba(12,175,96,0.05)',
                            }}
                            transition={{ duration: 0.4 }}
                            style={{ border: '1px solid rgba(12,175,96,0.14)' }}
                        >
                            {/* Travelling glow when playing */}
                            {isPlaying && (
                                <motion.div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(12,175,96,0.07) 40%, rgba(12,175,96,0.12) 50%, rgba(12,175,96,0.07) 60%, transparent 100%)',
                                        backgroundSize: '200% 100%',
                                    }}
                                    animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                                />
                            )}

                            {/* Status dot / mini bars */}
                            <div className="flex-shrink-0 flex items-center gap-[3px]" style={{ height: 16 }}>
                                {isPlaying ? (
                                    [0, 1, 2, 3].map(i => (
                                        <motion.div
                                            key={i}
                                            style={{ width: 2.5, borderRadius: 2, background: '#0CAF60', boxShadow: '0 0 4px rgba(12,175,96,0.8)' }}
                                            animate={{ height: ['4px', `${8 + i * 2}px`, '4px'] }}
                                            transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
                                        />
                                    ))
                                ) : (
                                    <motion.div
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: '#0CAF60', boxShadow: '0 0 6px #0CAF60' }}
                                        animate={{ opacity: [1, 0.4, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
                            </div>

                            <span className="text-sm font-semibold" style={{ color: isLight ? '#111827' : '#E5E7EB' }}>
                                {personas.find(p => p.id === activeId)?.name}
                            </span>
                            <span className="text-xs hidden sm:block" style={{ color: isLight ? '#6B7280' : '#4B5563' }}>
                                {personas.find(p => p.id === activeId)?.role}
                            </span>

                            <div className="ml-auto flex items-center gap-2">
                                <AnimatePresence mode="wait">
                                    {isPlaying ? (
                                        <motion.span
                                            key="playing"
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.85 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                            style={{ background: 'rgba(12,175,96,0.15)', color: '#34c779', border: '1px solid rgba(12,175,96,0.25)' }}
                                        >
                                            Playing
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="ready"
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.85 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-[10px] uppercase tracking-widest"
                                            style={{ color: isLight ? '#9CA3AF' : '#374151' }}
                                        >
                                            Click to play
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Persona carousel ── */}
            <section className="relative z-10 pb-8" style={{ background: isLight ? '#ffffff' : '#050505' }}>
                {/* Edge fades */}
                <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: `linear-gradient(90deg, ${isLight ? '#ffffff' : '#050505'}, transparent)` }} />
                <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: `linear-gradient(270deg, ${isLight ? '#ffffff' : '#050505'}, transparent)` }} />

                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        paddingLeft: 'max(40px, calc((100vw - 1380px) / 2 + 40px))',
                        paddingRight: 'max(40px, calc((100vw - 1380px) / 2 + 40px))',
                        paddingTop: 24,
                        paddingBottom: 24,
                        scrollSnapType: 'x mandatory',
                    }}
                >
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} delay={i * 0.07} isLight={isLight} />)
                        : personas.map((p, i) => (
                            <div key={p.id} style={{ scrollSnapAlign: 'start' }}>
                                <PersonaCard
                                    persona={p}
                                    index={i}
                                    total={personas.length}
                                    isActive={activeId === p.id}
                                    isPlaying={activeId === p.id && isPlaying}
                                    audioProgress={activeId === p.id ? audioProgress : 0}
                                    onPlayPause={(e) => handlePlayPause(p.id, e)}
                                    isLight={isLight}
                                />
                            </div>
                        ))}
                </div>

                {/* Track nav dots */}
                {!loading && personas.length > 0 && (
                    <TrackNav
                        total={totalPages}
                        active={visiblePage}
                        onDotClick={scrollToPage}
                        isLight={isLight}
                    />
                )}

                {/* Current position indicator */}
                {!loading && personas.length > 0 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-center mt-3 text-[11px]"
                        style={{ color: isLight ? '#9CA3AF' : '#6B7280' }}
                    >
                        {activeIndex + 1} of {personas.length} personas · Scroll to explore
                    </motion.p>
                )}
            </section>

            {/* ── CTA ── */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full py-24 text-center"
            >
                <div className="max-w-2xl mx-auto px-6">
                <div
                    className="rounded-3xl p-10 md:p-14"
                    style={{
                        background: isLight
                            ? '#ffffff'
                            : 'linear-gradient(140deg, rgba(12,175,96,0.09) 0%, rgba(8,8,8,0.98) 60%)',
                        border: isLight
                            ? '1px solid rgba(0,0,0,0.08)'
                            : '1px solid rgba(12,175,96,0.18)',
                        boxShadow: isLight
                            ? '0 4px 24px rgba(0,0,0,0.06)'
                            : '0 0 80px rgba(12,175,96,0.06), 0 40px 100px rgba(0,0,0,0.6)',
                    }}
                >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(12,175,96,0.1)', border: '1px solid rgba(12,175,96,0.2)' }}>
                        <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #0CAF60', marginLeft: 2 }} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: isLight ? '#111827' : '#F5F5F5' }}>
                        Put your reps in the room<br />before the real deal
                    </h2>
                    <p className="text-sm leading-relaxed mb-8 max-w-sm mx-auto" style={{ color: isLight ? '#6B7280' : '#4B5563' }}>
                        Every session is scored, coached, and reviewed. Your team walks into real meetings with confidence they've earned.
                    </p>
                    <motion.a
                        href="/sign-in"
                        whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(12,175,96,0.5)' }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg, #0CAF60, #088d50)', color: '#fff', boxShadow: '0 0 24px rgba(12,175,96,0.35)', textDecoration: 'none' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                        Start training free
                    </motion.a>
                </div>
                </div>
            </motion.section>
        </div>
      </LandingThemeProvider>
    )
}

export default FoodAndBeverages
