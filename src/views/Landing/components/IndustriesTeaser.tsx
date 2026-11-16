import { useRef, useState } from 'react'
import { GlassLayers } from '@/components/ui/liquid-glass'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { TbArrowRight, TbToolsKitchen2, TbPlayerPlay, TbChevronRight } from 'react-icons/tb'
import { useLandingTheme } from '../LandingThemeProvider'
import type { LandingTheme } from '../landingTheme'
import { glassCard, glassHairline } from '../landingTheme'
import { SectionBadge, SectionHeading, SectionDesc, useSmoothParallax } from './landingUi'
import personaIntros from '../../../../persona_intros/index.json'

// Stable persona subset for the teaser card
const PREVIEW_PERSONAS = personaIntros.personas.slice(0, 8).map(p => ({
    id: p.persona_id,
    name: p.name,
    role: p.ai_role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    initials: p.name.split(' ').map(n => n[0]).slice(0, 2).join(''),
    gender: p.gender,
}))

// Mini waveform bars — purely decorative, animated when `active`
const MiniWave = ({ active }: { active: boolean }) => (
    <div className="flex items-center gap-[2px]" style={{ height: 18 }}>
        {[5, 9, 14, 10, 16, 8, 13, 6, 11, 15, 7, 12, 9, 5].map((h, i) => (
            <motion.div
                key={i}
                style={{ width: 2, borderRadius: 2, background: active ? '#0CAF60' : 'rgba(12,175,96,0.3)' }}
                animate={active ? {
                    height: [`${h}px`, `${h + 5 + (i % 3) * 3}px`, `${h}px`],
                    opacity: [0.7, 1, 0.7],
                } : { height: `${h}px`, opacity: 0.25 }}
                transition={active ? {
                    duration: 0.55 + i * 0.04,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.045,
                } : { duration: 0.3 }}
            />
        ))}
    </div>
)

// Rotating persona preview inside the teaser card
const PersonaStack = ({ hovered, t }: { hovered: boolean; t: LandingTheme }) => {
    const [activeIdx, setActiveIdx] = useState(0)

    return (
        <div className="space-y-2">
            {PREVIEW_PERSONAS.slice(0, 5).map((p, i) => {
                const isActive = i === activeIdx
                return (
                    <motion.button
                        key={p.id}
                        onClick={() => setActiveIdx(i)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200"
                        style={{
                            background: isActive
                                ? 'rgba(12,175,96,0.1)'
                                : t.isLight ? 'rgba(0,0,0,0.02)' : 'transparent',
                            border: isActive
                                ? '1px solid rgba(12,175,96,0.22)'
                                : `1px solid ${t.border}`,
                        }}
                        whileHover={{ x: 2 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                        {/* Avatar */}
                        <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                            style={{
                                background: isActive
                                    ? 'linear-gradient(135deg, rgba(12,175,96,0.25), rgba(12,175,96,0.08))'
                                    : t.surfaceHover,
                                border: isActive
                                    ? '1.5px solid rgba(12,175,96,0.4)'
                                    : `1px solid ${t.border}`,
                                color: isActive ? '#0CAF60' : t.textFaint,
                            }}
                        >
                            {p.initials}
                        </div>

                        {/* Name + role */}
                        <div className="flex-1 min-w-0">
                            <p
                                className="text-xs font-semibold leading-none mb-0.5 truncate"
                                style={{ color: isActive ? t.text : t.textMuted }}
                            >
                                {p.name}
                            </p>
                            <p
                                className="text-[10px] truncate"
                                style={{ color: t.textFaint }}
                            >
                                {p.role}
                            </p>
                        </div>

                        {/* Play indicator */}
                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.7 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <MiniWave active={hovered && isActive} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isActive && (
                            <TbPlayerPlay size={10} style={{ color: t.textFaint, flexShrink: 0 }} />
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
}

// The industry preview card (right side) — fully theme-aware
const IndustryCard = ({ navigate, t }: { navigate: (path: string) => void; t: LandingTheme }) => {
    const [hovered, setHovered] = useState(false)
    const { ref: parallaxRef, y: parallaxY } = useSmoothParallax(55)

    const cardBorder = hovered
        ? 'rgba(12,175,96,0.32)'
        : glassHairline(t)

    const cardShadow = hovered
        ? `0 0 60px rgba(12,175,96,0.1), 0 40px 80px ${t.isLight ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.7)'}`
        : `0 20px 60px ${t.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.6)'}`

    const statsBg = t.isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'
    const statsBorder = t.isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)'
    const statsLabelColor = t.textFaint
    const footerBorder = t.isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)'
    const avatarBorder = t.isLight ? 'rgba(255,255,255,0.9)' : 'rgba(8,8,8,0.9)'

    return (
        <motion.div
            ref={parallaxRef}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:mt-10 will-change-transform"
            style={parallaxY ? { y: parallaxY } : undefined}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Ambient outer glow */}
            <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                animate={{ opacity: hovered ? 1 : 0.5 }}
                transition={{ duration: 0.5 }}
                style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(12,175,96,0.14) 0%, transparent 65%)',
                    filter: 'blur(20px)',
                    inset: '-20px',
                }}
            />

            <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                    ...glassCard(t),
                    border: `1px solid ${cardBorder}`,
                    boxShadow: cardShadow,
                    transition: 'border 0.4s, box-shadow 0.4s',
                }}
            >
                <GlassLayers light={t.isLight} />
                {/* Top shimmer line */}
                <motion.div
                    className="absolute top-0 left-0 right-0 h-px"
                    animate={{ opacity: hovered ? 1 : 0.4 }}
                    transition={{ duration: 0.4 }}
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(12,175,96,0.7) 30%, rgba(52,199,121,1) 50%, rgba(12,175,96,0.7) 70%, transparent)' }}
                />

                <div className="p-6">
                    {/* Card header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(12,175,96,0.12)', border: '1px solid rgba(12,175,96,0.22)', color: '#0CAF60' }}
                            >
                                <TbToolsKitchen2 size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: t.text }}>Food & Beverages</p>
                                <p className="text-[10px] uppercase tracking-widest" style={{ color: t.textFaint }}>Industry module</p>
                            </div>
                        </div>
                        <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                            style={{ background: 'rgba(12,175,96,0.1)', border: '1px solid rgba(12,175,96,0.2)', color: '#0CAF60' }}
                        >
                            <motion.span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: '#0CAF60' }}
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            Live
                        </div>
                    </div>

                    {/* Stats row */}
                    <div
                        className="flex items-center gap-4 px-4 py-3 rounded-2xl mb-5"
                        style={{ background: statsBg, border: `1px solid ${statsBorder}` }}
                    >
                        {[['20+', 'AI Personas'], ['6+', 'Roles'], ['3', 'Company Sizes']].map(([val, label]) => (
                            <div key={label} className="flex-1 text-center">
                                <p className="text-lg font-bold tracking-tight" style={{ color: '#0CAF60' }}>{val}</p>
                                <p className="text-[10px]" style={{ color: statsLabelColor }}>{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Persona list */}
                    <PersonaStack hovered={hovered} t={t} />

                    {/* Avatar overflow row */}
                    <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: `1px solid ${footerBorder}` }}>
                        <div className="flex -space-x-2">
                            {PREVIEW_PERSONAS.slice(5, 8).map((p) => (
                                <div
                                    key={p.id}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(12,175,96,0.2), rgba(12,175,96,0.06))',
                                        border: `1.5px solid ${avatarBorder}`,
                                        color: t.textMuted,
                                    }}
                                >
                                    {p.initials}
                                </div>
                            ))}
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                                style={{ background: t.surfaceHover, border: `1.5px solid ${avatarBorder}`, color: t.textFaint }}
                            >
                                +13
                            </div>
                        </div>
                        <span className="text-[10px]" style={{ color: t.textFaint }}>more personas available</span>
                        <motion.button
                            onClick={() => navigate('/industries/food-and-beverages')}
                            className="ml-auto flex items-center gap-1 text-[11px] font-semibold"
                            style={{ color: '#0CAF60' }}
                            whileHover={{ x: 2 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        >
                            View all <TbChevronRight size={12} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ─── Main Section ─────────────────────────────────────────────────────────────

const IndustriesTeaser = () => {
    const t = useLandingTheme()
    const navigate = useNavigate()
    const sectionRef = useRef<HTMLDivElement>(null)
    const inView = useInView(sectionRef, { once: true, margin: '-100px' })

    const industries = [
        { label: 'Food & Beverages', href: '/industries/food-and-beverages', icon: TbToolsKitchen2, count: '20+', active: true },
        { label: 'Manufacturing', href: '#', icon: null, count: 'Soon', active: false },
        { label: 'Healthcare', href: '#', icon: null, count: 'Soon', active: false },
        { label: 'Financial Services', href: '#', icon: null, count: 'Soon', active: false },
    ]

    return (
        <section
            ref={sectionRef}
            className="py-24 md:py-32 overflow-hidden"
            id="industries"
        >
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* ── Left: text column ── */}
                    <div>
                        <SectionBadge t={t} label="Industry coverage" />

                        <SectionHeading
                            t={t}
                            text="Train against buyers from your exact industry"
                            className="text-3xl md:text-4xl font-bold tracking-[-0.015em] leading-tight max-w-[460px] mb-5"
                        />

                        <SectionDesc
                            t={t}
                            text="Generic sales training doesn't cut it. Our AI personas are built for specific industries — they know your buyer's pain points, procurement cycles, and objections cold."
                            className="text-base leading-relaxed max-w-[420px] mb-8"
                        />

                        {/* Industry pill list */}
                        <motion.div
                            className="flex flex-col gap-2 mb-10"
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ delay: 1.4, duration: 0.5 }}
                        >
                            {industries.map((ind, i) => {
                                const Icon = ind.icon
                                return (
                                    <motion.button
                                        key={ind.label}
                                        onClick={() => ind.active && navigate(ind.href)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group"
                                        style={{
                                            background: ind.active ? 'rgba(12,175,96,0.06)' : t.surface,
                                            border: ind.active ? `1px solid rgba(12,175,96,0.2)` : `1px solid ${t.border}`,
                                            cursor: ind.active ? 'pointer' : 'default',
                                            opacity: ind.active ? 1 : 0.5,
                                        }}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={inView ? { opacity: ind.active ? 1 : 0.5, x: 0 } : {}}
                                        transition={{ delay: 1.5 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        whileHover={ind.active ? { x: 4 } : {}}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{
                                                background: ind.active ? 'rgba(12,175,96,0.12)' : t.surfaceHover,
                                                border: ind.active ? '1px solid rgba(12,175,96,0.2)' : `1px solid ${t.border}`,
                                                color: ind.active ? '#0CAF60' : t.textFaint,
                                            }}
                                        >
                                            {Icon ? <Icon size={14} /> : (
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.textFaint, opacity: 0.4 }} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium" style={{ color: ind.active ? t.text : t.textMuted }}>
                                                {ind.label}
                                            </span>
                                        </div>
                                        <span
                                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                                            style={{
                                                background: ind.active ? 'rgba(12,175,96,0.1)' : t.surfaceHover,
                                                border: ind.active ? '1px solid rgba(12,175,96,0.2)' : `1px solid ${t.border}`,
                                                color: ind.active ? '#0CAF60' : t.textFaint,
                                            }}
                                        >
                                            {ind.count}
                                        </span>
                                        {ind.active && (
                                            <TbArrowRight
                                                size={14}
                                                style={{ color: '#0CAF60', flexShrink: 0 }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            />
                                        )}
                                    </motion.button>
                                )
                            })}
                        </motion.div>

                        {/* Primary CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 1.9, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <motion.button
                                onClick={() => navigate('/industries/food-and-beverages')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-full transition-colors duration-200"
                                style={{
                                    backgroundColor: t.primaryBtnBg,
                                    color: t.primaryBtnText,
                                }}
                            >
                                Explore Food & Beverage Personas
                                <TbArrowRight
                                    size={16}
                                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                                />
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* ── Right: industry card ── */}
                    <IndustryCard navigate={navigate} t={t} />
                </div>
            </div>
        </section>
    )
}

export default IndustriesTeaser
