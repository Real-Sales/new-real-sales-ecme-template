import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TbArrowRight } from 'react-icons/tb'
import { useAppSelector } from '@/store'
import SessionSetupPanel from '@/components/shared/SessionSetupPanel'
import type { ConversationMode } from '@/components/shared/SessionSetupPanel'
import SplitText from './SplitText'
import Particles from './Particles'
import Aurora from './Aurora'
import LightRays from './LightRays'
import CountUp from '@/components/reactbits/CountUp'
import ClickSpark from '@/components/reactbits/ClickSpark'
import GradientText from '@/components/reactbits/GradientText'
import BlurText from '@/components/reactbits/BlurText'
import StarBorder from '@/components/reactbits/StarBorder'
import { useLandingTheme } from '../LandingThemeProvider'
import { getLenis } from '../smoothScroll'

const LIGHT_RAY_MASK = 'radial-gradient(ellipse 62% 88% at 50% 0%, #000 0%, rgba(0,0,0,0.55) 45%, transparent 78%)'
const HERO_FADE = 'linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)'

const objections = [
    '"Your competitor costs half as much."',
    '"Send me a proposal first."',
    '"I need to think about it."',
    '"What\'s the actual ROI here?"',
    '"We already have a solution."',
]

const stats = [
    { value: 12400, suffix: '+', label: 'Training sessions run', prefix: '' },
    { value: 34, suffix: '%', label: 'Average win rate increase', prefix: '+' },
    { value: 180, suffix: '+', label: 'Revenue teams onboarded', prefix: '' },
    { value: 4.8, suffix: 'x', label: 'Average reported ROI', prefix: '' },
]

const StatItem = ({
    stat,
    index,
    started,
}: {
    stat: (typeof stats)[0]
    index: number
    started: boolean
}) => {
    const t = useLandingTheme()

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center px-6 py-6"
        >
            <span
                className="text-3xl md:text-4xl font-bold tracking-[-0.02em] tabular-nums"
                style={{ color: t.text }}
            >
                <CountUp
                    to={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    separator=","
                    decimals={stat.value % 1 !== 0 ? 1 : 0}
                    mode="roll"
                    duration={1.6}
                    startWhen={started}
                />
            </span>
            <span className="mt-1.5 text-xs font-medium" style={{ color: t.textFaint }}>
                {stat.label}
            </span>
        </motion.div>
    )
}

const SalesWanaHero = () => {
    const navigate = useNavigate()
    const t = useLandingTheme()
    const [currentObjection, setCurrentObjection] = useState(0)
    const [isSetupOpen, setIsSetupOpen] = useState(false)
    const shouldReduceMotion = useReducedMotion()
    const signedIn = useAppSelector((state) => state.auth.session.signedIn)
    const statsRef = useRef(null)
    const statsInView = useInView(statsRef, { once: true, margin: '-40px' })

    const particleColors = useMemo(
        () => [t.accent, t.accentMild, t.accentDeep],
        [t.accent, t.accentMild, t.accentDeep],
    )

    useEffect(() => {
        if (shouldReduceMotion) return
        const interval = setInterval(() => {
            setCurrentObjection((prev) => (prev + 1) % objections.length)
        }, 3200)
        return () => clearInterval(interval)
    }, [shouldReduceMotion])

    const handleEnterSimulator = () => {
        if (!signedIn) {
            navigate('/sign-in?redirect=/audio-visualizer')
            return
        }
        setIsSetupOpen(true)
    }

    const handleNavigateToPersonas = (
        conversationMode: ConversationMode,
        scenarios?: string[],
        files?: File[],
    ) => {
        navigate('/persona-selection', { state: { mode: conversationMode, scenarios, files } })
    }

    const handleWorkflowScroll = () => {
        const target = document.querySelector('#workflow') as HTMLElement | null
        if (!target) return
        const lenis = getLenis()
        if (lenis) {
            lenis.scrollTo(target, { offset: -80, duration: 1.2 })
            return
        }
        target.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section
            className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden pt-28 md:pt-32 pb-0"
            style={{ color: t.text }}
        >
            {/* Layer: solid ground under the hero's own lighting; fades out so the page backdrop returns below */}
            <div
                className="pointer-events-none absolute inset-0 z-[0]"
                style={{ background: `linear-gradient(to bottom, ${t.bg} 0%, ${t.bg} 58%, transparent 100%)` }}
            />

            {/* Layer: animated light rays from the top — dark mode only
                (rays render as light over a dark backdrop; on white they muddy). */}
            {!shouldReduceMotion && !t.isLight && (
                <div className="pointer-events-none absolute inset-0 z-[0]" style={{ maskImage: HERO_FADE, WebkitMaskImage: HERO_FADE }}>
                    <LightRays
                        raysOrigin="top-center"
                        raysColor={t.accent}
                        raysSpeed={1}
                        lightSpread={0.6}
                        rayLength={3}
                        followMouse={false}
                        mouseInfluence={0}
                        noiseAmount={0.05}
                        distortion={0}
                        fadeDistance={1.1}
                        saturation={1}
                    />
                </div>
            )}

            {/* Layer: light-mode ambient glow (clean alternative to the rays) */}
            {t.isLight && (
                <div className="pointer-events-none absolute inset-0 z-[0] overflow-hidden">
                    {/* Soft green beams fanning down from the top centre (CSS, so they stay crisp on white) */}
                    <div
                        className="absolute inset-x-0 top-0 h-[92%] blur-[10px]"
                        style={{
                            background: `conic-gradient(from 132deg at 50% -6%, transparent 0deg, ${t.accent}3d 9deg, transparent 19deg, ${t.accentMild}33 29deg, transparent 38deg, ${t.accent}52 48deg, transparent 58deg, ${t.accentMild}33 67deg, transparent 77deg, ${t.accent}3d 87deg, transparent 96deg, transparent 360deg)`,
                            maskImage: LIGHT_RAY_MASK,
                            WebkitMaskImage: LIGHT_RAY_MASK,
                        }}
                    />
                    <div
                        className="absolute left-1/2 -translate-x-1/2 -top-40 w-[1100px] h-[620px] rounded-full blur-3xl"
                        style={{
                            background: `radial-gradient(ellipse at center, ${t.accent}42 0%, ${t.accent}1c 38%, transparent 72%)`,
                        }}
                    />
                    <div
                        className="absolute -left-32 top-24 w-[480px] h-[480px] rounded-full blur-3xl"
                        style={{
                            background: `radial-gradient(circle at center, ${t.accentMild}14 0%, transparent 70%)`,
                        }}
                    />
                    <div
                        className="absolute -right-32 top-40 w-[480px] h-[480px] rounded-full blur-3xl"
                        style={{
                            background: `radial-gradient(circle at center, ${t.accent}12 0%, transparent 70%)`,
                        }}
                    />
                </div>
            )}

            {/* Layer: WebGL aurora ambience */}
            <div className="pointer-events-none absolute inset-0 z-[0] opacity-[0.32]" style={{ maskImage: HERO_FADE, WebkitMaskImage: HERO_FADE }}>
                <Aurora
                    className="h-full w-full"
                    colorStops={t.auroraStops}
                    blend={0.5}
                    amplitude={0.28}
                    speed={0.3}
                    lightMode={t.isLight}
                />
            </div>

            {/* Layer: floating particles (kept sparse for performance & cleaner hero) */}
            <div className="pointer-events-none absolute inset-0 z-[0]">
                <Particles
                    particleColors={particleColors}
                    particleCount={shouldReduceMotion ? 200 : t.isLight ? 320 : 380}
                    particleSpread={16}
                    speed={shouldReduceMotion ? 0.05 : 0.18}
                    particleBaseSize={t.isLight ? 70 : 200}
                    sizeRandomness={t.isLight ? 0.75 : 1.2}
                    moveParticlesOnHover={false}
                    alphaParticles
                    lightMode={t.isLight}
                    disableRotation={Boolean(shouldReduceMotion)}
                    pixelRatio={1}
                />
            </div>

            {/* Layer: accent glow from top + soft edge/bottom grounding
                (kept light so particles stay visible to the corners). */}
            <div className="pointer-events-none absolute inset-0 z-[1]">
                <div
                    className="absolute inset-x-0 -top-32 h-[520px]"
                    style={{
                        background: `radial-gradient(ellipse 55% 50% at 50% 0%, ${t.accent}22 0%, transparent 70%)`,
                    }}
                />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 w-full text-center flex flex-col items-center flex-1 justify-center py-14 md:py-16">
                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8"
                        style={{
                            border: `1px solid ${t.border}`,
                            backgroundColor: t.surface,
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        <span className="relative flex h-1.5 w-1.5">
                            {!shouldReduceMotion && (
                                <span
                                    className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75"
                                    style={{ backgroundColor: t.accent }}
                                />
                            )}
                            <span
                                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: t.accent }}
                            />
                        </span>
                        <span
                            className="text-xs font-semibold tracking-[0.12em] uppercase"
                            style={{ color: t.textMuted }}
                        >
                            AI-Powered Sales Training
                        </span>
                    </div>
                </motion.div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold leading-[1.03] tracking-[-0.03em] mb-6 md:mb-7 w-full text-center">
                    <SplitText
                        text="Train Smarter"
                        className="leading-[1.02]"
                        delay={35}
                        duration={shouldReduceMotion ? 0 : 1.1}
                        ease="power3.out"
                        splitType="chars"
                        from={{ opacity: 0, y: 40 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="-100px"
                        textAlign="center"
                        tag="div"
                        style={{ color: t.text, display: 'block', width: '100%' }}
                    />
                    <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: shouldReduceMotion ? 0.01 : 1.1,
                            delay: shouldReduceMotion ? 0 : 0.35,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="leading-[1.02] pb-[0.1em]"
                    >
                        <GradientText colors={[t.accentMild, '#38D6E8', t.accent, '#A7F3D0', t.accentMild]} animationSpeed={6} glow={0.2}>
                            Close Faster
                        </GradientText>
                    </motion.div>
                </h1>

                <BlurText
                    text="Practice high-stakes sales conversations with AI buyers that challenge, interrupt, and negotiate like real prospects."
                    delay={40}
                    stepDuration={0.3}
                    distance={14}
                    direction="bottom"
                    color={t.textMuted}
                    className="text-base md:text-lg leading-relaxed mb-4 max-w-[620px] justify-center text-center"
                />

                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, delay: shouldReduceMotion ? 0 : 0.28 }}
                    className="h-6 overflow-hidden mb-10"
                >
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentObjection}
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                            transition={{ duration: shouldReduceMotion ? 0.01 : 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="text-sm italic"
                            style={{ color: t.textFaint }}
                        >
                            {objections[currentObjection]}
                        </motion.p>
                    </AnimatePresence>
                </motion.div>

                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, delay: shouldReduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                    <ClickSpark className="!h-auto !w-auto" sparkColor={t.accent} sparkCount={10} sparkRadius={22}>
                    <StarBorder
                        onClick={handleEnterSimulator}
                        theme={t.isLight ? 'light' : 'dark'}
                        color="#FFFFFF"
                        radius={999}
                        backgroundColor={t.primaryBtnBg}
                        textColor={t.primaryBtnText}
                        className="group w-full !px-7 !leading-5 text-sm !font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2"
                        style={{
                            boxShadow: t.isLight ? '0 12px 28px rgba(16,185,129,0.25)' : '0 12px 28px rgba(0,0,0,0.48)',
                        }}
                    >
                        Start Training Free
                        <TbArrowRight
                            size={16}
                            className="group-hover:translate-x-0.5 transition-transform duration-200"
                        />
                    </StarBorder>
                    </ClickSpark>
                    <motion.button
                        whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -2 }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 hover:!border-[#0CAF60]/60 hover:shadow-[0_0_28px_rgba(12,175,96,0.22)]"
                        style={{
                            color: t.secondaryBtnText,
                            border: `1px solid ${t.secondaryBtnBorder}`,
                            backgroundColor: t.bgElevated,
                        }}
                        onClick={handleWorkflowScroll}
                    >
                        See How It Works
                    </motion.button>
                </motion.div>

                <motion.p
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, delay: shouldReduceMotion ? 0 : 0.5 }}
                    className="mt-5 text-xs"
                    style={{ color: t.textDim }}
                >
                    No credit card required · 10 free sessions monthly
                </motion.p>

            </div>

            <div
                ref={statsRef}
                className="relative z-10 w-full border-t"
                style={{
                    borderColor: t.border,
                }}
            >
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                className="[&:not(:nth-child(2n))]:border-r lg:[&:not(:last-child)]:border-r [&:nth-child(-n+2)]:border-b lg:[&:nth-child(-n+2)]:border-b-0"
                                style={{ borderColor: t.border }}
                            >
                                <StatItem stat={stat} index={i} started={statsInView} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <SessionSetupPanel
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                onNavigateToPersonas={handleNavigateToPersonas}
            />
        </section>
    )
}

export default SalesWanaHero
