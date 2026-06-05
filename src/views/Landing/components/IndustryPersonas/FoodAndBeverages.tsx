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
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import personaIntros from '../../../../../persona_intros/index.json'
import { LandingThemeProvider, useLandingTheme } from '../../LandingThemeProvider'
import NavigationBar from '../NavigationBar'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import type { Mode } from '@/@types/theme'

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

const AmbientParticles: FC = () => {
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
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: .65 }} />
}

// ─── Premium Waveform (Canvas-based) ─────────────────────────────────────────

const PremiumWaveform: FC<{ isPlaying: boolean; progress: number; personaId: string }> = ({ isPlaying, progress }) => {
    const t = useLandingTheme()
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
        if (!ctx.roundRect) {
            ctx.roundRect = function(x: number, y: number, w: number, h: number) { ctx.rect(x, y, w, h) } as typeof ctx.roundRect
        }

        const baseHeights = Array.from({ length: bars }, (_, i) => {
            const t2 = i / (bars - 1)
            return 6 + Math.sin(t2 * Math.PI) * 18 + Math.sin(t2 * Math.PI * 3 + 0.5) * 6 + Math.cos(t2 * Math.PI * 2) * 4
        })

        // idle bar color: white on dark, near-black on light
        const idleRgb = t.isLight ? '0,0,0' : '255,255,255'

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
                    ctx.fillStyle = `rgba(${idleRgb},${alpha})`
                }

                ctx.fill()
            }

            animRef.current = requestAnimationFrame(draw)
        }

        draw()
        return () => cancelAnimationFrame(animRef.current)
    }, [isPlaying, progress, t.isLight])

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
                        ? '0 0 24px rgba(12,175,96,0.5), 0 4px 16px rgba(0,0,0,0.4)'
                        : '0 0 12px rgba(12,175,96,0.2), 0 4px 12px rgba(0,0,0,0.3)',
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
}

const PersonaCard: FC<CardProps> = ({ persona, isActive, isPlaying, audioProgress, onPlayPause, index }) => {
    const t = useLandingTheme()
    const cardRef = useRef<HTMLDivElement>(null)
    const spotRef = useRef<HTMLDivElement>(null)
    const [hovered, setHovered] = useState(false)

    const initials = persona.name.split(' ').map(n => n[0]).slice(0, 2).join('')

    const cardBgActive = t.isLight
        ? `linear-gradient(160deg, rgba(12,175,96,0.08) 0%, rgba(243,244,246,0.97) 55%, rgba(12,175,96,0.04) 100%)`
        : `linear-gradient(160deg, rgba(12,175,96,0.1) 0%, rgba(8,8,8,0.97) 55%, rgba(12,175,96,0.05) 100%)`
    const cardBgIdle = t.isLight
        ? `linear-gradient(160deg, rgba(243,244,246,0.98) 0%, rgba(249,250,251,0.99) 100%)`
        : `linear-gradient(160deg, rgba(22,22,22,0.97) 0%, rgba(10,10,10,0.98) 100%)`

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !spotRef.current) return
        const r = cardRef.current.getBoundingClientRect()
        const x = e.clientX - r.left
        const y = e.clientY - r.top
        const cx = r.width / 2, cy = r.height / 2
        gsap.to(cardRef.current, { rotateX: ((y - cy) / cy) * -5, rotateY: ((x - cx) / cx) * 5, duration: 0.35, ease: 'power2.out', transformPerspective: 900 })
        gsap.to(spotRef.current, { left: x, top: y, duration: 0.25, ease: 'power2.out' })
    }, [])

    const handleMouseLeave = useCallback(() => {
        setHovered(false)
        gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1,0.5)' })
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
                ref={cardRef}
                className="relative overflow-hidden rounded-3xl"
                style={{
                    transformStyle: 'preserve-3d',
                    background: isActive ? cardBgActive : cardBgIdle,
                    border: isActive
                        ? '1px solid rgba(12,175,96,0.35)'
                        : hovered
                        ? `1px solid ${t.borderStrong}`
                        : `1px solid ${t.border}`,
                    boxShadow: isActive
                        ? `0 0 60px rgba(12,175,96,0.14), 0 30px 80px rgba(0,0,0,${t.isLight ? 0.12 : 0.7}), inset 0 1px 0 rgba(12,175,96,0.12)`
                        : hovered
                        ? `0 20px 60px rgba(0,0,0,${t.isLight ? 0.08 : 0.6}), inset 0 1px 0 ${t.surface}`
                        : `0 8px 32px rgba(0,0,0,${t.isLight ? 0.06 : 0.5})`,
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
                            : `radial-gradient(circle, ${t.surfaceHover} 0%, transparent 65%)`,
                        transform: 'translate(-50%,-50%)',
                        left: '50%',
                        top: '30%',
                        transition: 'background 0.3s',
                        pointerEvents: 'none',
                    }}
                />

                {isActive && (
                    <motion.div
                        layoutId="shimmer-top"
                        className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(12,175,96,0.8) 30%, rgba(52,199,121,1) 50%, rgba(12,175,96,0.8) 70%, transparent 100%)' }}
                    />
                )}

                {/* Noise grain texture */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: '180px' }}
                />

                <div className="relative z-10 p-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-5">
                        <div className="relative mb-4" style={{ width: 100, height: 100 }}>
                            <motion.div
                                className="absolute rounded-full"
                                style={{ inset: -8, border: `1.5px solid ${isActive ? 'rgba(12,175,96,0.25)' : t.border}` }}
                                animate={{ opacity: isActive ? [0.4, 0.9, 0.4] : [0.2, 0.4, 0.2], scale: isActive ? [0.97, 1.02, 0.97] : [0.98, 1, 0.98] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            {isActive && isPlaying && <>
                                <motion.div className="absolute rounded-full" style={{ inset: -4, border: '1px solid rgba(12,175,96,0.5)' }} animate={{ scale: [1, 1.35], opacity: [0.5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} />
                                <motion.div className="absolute rounded-full" style={{ inset: -4, border: '1px solid rgba(12,175,96,0.3)' }} animate={{ scale: [1, 1.55], opacity: [0.4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.6 }} />
                            </>}

                            {persona.profile_pic ? (
                                <img
                                    src={persona.profile_pic}
                                    alt={persona.name}
                                    className="w-full h-full rounded-full object-cover"
                                    style={{ border: isActive ? '2px solid rgba(12,175,96,0.5)' : `2px solid ${t.border}` }}
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
                                        ? 'linear-gradient(135deg, rgba(12,175,96,0.22) 0%, rgba(12,175,96,0.06) 100%)'
                                        : t.surfaceStrong,
                                    border: isActive ? '2px solid rgba(12,175,96,0.45)' : `2px solid ${t.border}`,
                                    color: isActive ? '#34c779' : t.textFaint,
                                    letterSpacing: '-0.03em',
                                }}
                            >
                                {initials}
                            </div>
                        </div>

                        <motion.h3
                            className="text-base font-semibold tracking-tight mb-0.5 text-center"
                            style={{ color: isActive ? t.text : t.textSecondary }}
                            animate={{ color: isActive ? t.text : t.textMuted }}
                            transition={{ duration: 0.3 }}
                        >
                            {persona.name}
                        </motion.h3>
                        <p className="text-xs font-medium text-center" style={{ color: isActive ? '#0CAF60' : t.textFaint }}>
                            {persona.role}
                        </p>
                    </div>

                    {/* Company size tag */}
                    <div className="flex justify-center mb-4">
                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium tracking-wide"
                            style={{
                                background: isActive ? 'rgba(12,175,96,0.1)' : t.surface,
                                border: isActive ? '1px solid rgba(12,175,96,0.22)' : `1px solid ${t.border}`,
                                color: isActive ? '#34c779' : t.textFaint,
                                transition: 'all 0.3s',
                            }}
                        >
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive ? '#0CAF60' : t.textDim, display: 'inline-block' }} />
                            {persona.company_size.replace(':', '').trim()}
                        </span>
                    </div>

                    {/* Quote */}
                    <p
                        className="text-xs leading-[1.65] text-center mb-5 line-clamp-3"
                        style={{ color: isActive ? t.textMuted : t.textDim }}
                    >
                        {persona.intro_text}
                    </p>

                    {/* Voice player */}
                    {persona.has_audio && (
                        <div
                            className="rounded-2xl p-4"
                            style={{
                                background: isActive ? 'rgba(12,175,96,0.06)' : t.surface,
                                border: isActive ? '1px solid rgba(12,175,96,0.15)' : `1px solid ${t.border}`,
                                transition: 'all 0.4s',
                            }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: isActive ? 'rgba(12,175,96,0.7)' : t.textDim }}>
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

                            <div className="flex items-center gap-3">
                                <PlayButton isPlaying={isActive && isPlaying} onToggle={onPlayPause} />
                                <div className="flex-1 min-w-0">
                                    <PremiumWaveform
                                        isPlaying={isActive && isPlaying}
                                        progress={isActive ? audioProgress : 0}
                                        personaId={persona.id}
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

const SkeletonCard: FC<{ delay?: number }> = ({ delay = 0 }) => {
    const t = useLandingTheme()
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay }}
            className="flex-shrink-0 rounded-3xl overflow-hidden"
            style={{ width: 300, background: t.bgCard, border: `1px solid ${t.border}` }}
        >
            <div className="p-6">
                <div className="flex flex-col items-center mb-5">
                    <motion.div className="w-[100px] h-[100px] rounded-full mb-4" style={{ background: t.surface }} animate={{ opacity: [.4, .7, .4] }} transition={{ duration: 1.8, repeat: Infinity, delay }} />
                    {[55, 75].map((w, i) => (
                        <motion.div key={i} className="h-3 rounded-full mb-1.5" style={{ width: `${w}%`, background: t.surface }} animate={{ opacity: [.4, .7, .4] }} transition={{ duration: 1.8, repeat: Infinity, delay: delay + i * .1 }} />
                    ))}
                </div>
                <motion.div className="h-[88px] rounded-2xl" style={{ background: t.surface }} animate={{ opacity: [.3, .6, .3] }} transition={{ duration: 1.8, repeat: Infinity, delay: delay + .2 }} />
            </div>
        </motion.div>
    )
}

// ─── Track Navigation ─────────────────────────────────────────────────────────

const TrackNav: FC<{ total: number; active: number; onDotClick: (i: number) => void }> = ({ total, active, onDotClick }) => {
    const t = useLandingTheme()
    return (
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
                        background: i === active ? '#0CAF60' : t.borderStrong,
                        boxShadow: i === active ? '0 0 8px rgba(12,175,96,0.5)' : 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                    }}
                />
            ))}
        </div>
    )
}

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

// ─── Main Content ─────────────────────────────────────────────────────────────

function FoodAndBeveragesContent({ mode, toggleMode }: { mode: Mode; toggleMode: () => void }): JSX.Element {
    const t = useLandingTheme()
    const navigate = useNavigate()
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

    // Sync body background with theme
    useEffect(() => {
        const prev = document.body.style.backgroundColor
        document.body.style.backgroundColor = t.bg
        return () => { document.body.style.backgroundColor = prev }
    }, [t.bg])

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

    const CARD_WIDTH = 300 + 20
    const totalPages = Math.ceil(personas.length / CARDS_PER_PAGE)

    const scrollToPage = useCallback((page: number) => {
        if (!scrollRef.current) return
        scrollRef.current.scrollTo({ left: page * CARDS_PER_PAGE * CARD_WIDTH, behavior: 'smooth' })
        setVisiblePage(page)
    }, [CARD_WIDTH, CARDS_PER_PAGE])

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

    // Edge fade color matches page background
    const edgeFade = t.bg

    return (
        <div
            className="min-h-screen relative overflow-x-clip transition-colors duration-300"
            style={{
                background: t.bg,
                color: t.text,
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            {/* ── Background layer ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <AmbientParticles />
                <motion.div
                    className="absolute"
                    animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: 900, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(12,175,96,0.055) 0%, transparent 70%)', top: -200, left: '50%', transform: 'translateX(-50%)', filter: 'blur(50px)' }}
                />
                <motion.div
                    className="absolute"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                    style={{ width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(12,175,96,0.04) 0%, transparent 70%)', bottom: '5%', right: '-80px', filter: 'blur(60px)' }}
                />
                {/* Dot grid */}
                <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: `radial-gradient(${t.isLight ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'} 1px, transparent 1px)`, backgroundSize: '44px 44px' }} />
            </div>

            {/* ── Nav bar ── */}
            <NavigationBar mode={mode} toggleMode={toggleMode} />

            {/* ── Hero ── */}
            <section ref={heroRef} className="relative z-10 px-6 pt-24 md:pt-28 pb-16 max-w-4xl mx-auto text-center">
                <HeroBadge />
                <h1
                    ref={titleRef}
                    className="font-bold leading-[1.12] tracking-[-0.03em] mb-6"
                    style={{ fontSize: 'clamp(42px, 7vw, 76px)' }}
                >
                    {['AI Personas for', 'Food & Beverage', 'Sales Training'].map((line, li) => (
                        <span key={li} className="block overflow-hidden pb-[0.1em]">
                            {line.split(' ').map((word, wi) => (
                                <span
                                    key={wi}
                                    className="word inline-block mr-[0.22em] opacity-0"
                                    style={{
                                        color: line === 'Food & Beverage' ? '#0CAF60' : t.text,
                                        textShadow: line === 'Food & Beverage' ? '0 0 40px rgba(12,175,96,0.3)' : 'none',
                                    }}
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
                    style={{ color: t.textMuted }}
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
                            <span style={{ color: t.textFaint, fontSize: 11 }}>{l}</span>
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

                            <span className="text-sm font-semibold" style={{ color: t.textSecondary }}>
                                {personas.find(p => p.id === activeId)?.name}
                            </span>
                            <span className="text-xs hidden sm:block" style={{ color: t.textFaint }}>
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
                                            style={{ color: t.textDim }}
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
            <section className="relative z-10 pb-8">
                {/* Edge fades */}
                <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: `linear-gradient(90deg, ${edgeFade}, transparent)` }} />
                <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: `linear-gradient(270deg, ${edgeFade}, transparent)` }} />

                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        paddingLeft: 'max(40px, calc((100vw - 1380px) / 2 + 40px))',
                        paddingRight: 'max(40px, calc((100vw - 1380px) / 2 + 40px))',
                        paddingBottom: 12,
                        scrollSnapType: 'x mandatory',
                    }}
                >
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} delay={i * 0.07} />)
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
                                />
                            </div>
                        ))}
                </div>

                {!loading && personas.length > 0 && (
                    <TrackNav total={totalPages} active={visiblePage} onDotClick={scrollToPage} />
                )}

                {!loading && personas.length > 0 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-center mt-3 text-[11px]"
                        style={{ color: t.textDim }}
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
                className="relative z-10 max-w-2xl mx-auto px-6 py-24 text-center"
            >
                <div
                    className="rounded-3xl p-10 md:p-14"
                    style={{
                        background: t.isLight
                            ? `linear-gradient(140deg, rgba(12,175,96,0.06) 0%, ${t.bgCard} 60%)`
                            : `linear-gradient(140deg, rgba(12,175,96,0.09) 0%, rgba(8,8,8,0.98) 60%)`,
                        border: `1px solid rgba(12,175,96,${t.isLight ? 0.2 : 0.15})`,
                        boxShadow: t.isLight
                            ? '0 0 60px rgba(12,175,96,0.06), 0 20px 60px rgba(0,0,0,0.08)'
                            : '0 0 80px rgba(12,175,96,0.06), 0 40px 100px rgba(0,0,0,0.6)',
                    }}
                >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(12,175,96,0.1)', border: '1px solid rgba(12,175,96,0.2)' }}>
                        <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #0CAF60', marginLeft: 2 }} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: t.text }}>
                        Put your reps in the room<br />before the real deal
                    </h2>
                    <p className="text-sm leading-relaxed mb-8 max-w-sm mx-auto" style={{ color: t.textMuted }}>
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
            </motion.section>
        </div>
    )
}

// ─── Themed wrapper ───────────────────────────────────────────────────────────

function FoodAndBeverages<T extends Meta>(_props: T): JSX.Element {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    return (
        <LandingThemeProvider mode={mode}>
            <FoodAndBeveragesContent mode={mode} toggleMode={toggleMode} />
        </LandingThemeProvider>
    )
}

export default FoodAndBeverages
