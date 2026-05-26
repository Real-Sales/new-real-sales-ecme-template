import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TbArrowRight } from 'react-icons/tb'
import { useAppSelector } from '@/store'
import { useInView } from 'framer-motion'
import SessionSetupPanel from '@/components/shared/SessionSetupPanel'
import type { ConversationMode } from '@/components/shared/SessionSetupPanel'
import type { Mode } from '@/@types/theme'
import Aurora from './Aurora'
import SplitText from './SplitText'

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

function useCountUp(target: number, duration: number, start: boolean) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!start) return
        const isDecimal = target % 1 !== 0
        const steps = 60
        const stepTime = (duration * 1000) / steps
        let current = 0
        const increment = target / steps

        const timer = setInterval(() => {
            current = Math.min(current + increment, target)
            setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.round(current))
            if (current >= target) clearInterval(timer)
        }, stepTime)

        return () => clearInterval(timer)
    }, [target, duration, start])

    return count
}

const StatItem = ({
    stat,
    index,
    started,
}: {
    stat: (typeof stats)[0]
    index: number
    started: boolean
}) => {
    const count = useCountUp(stat.value, 1.4, started)

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center px-6 py-6"
        >
            <span className="text-3xl md:text-4xl font-bold text-[#F5F5F5] tracking-[-0.02em] tabular-nums">
                {stat.prefix}
                {stat.value % 1 !== 0 ? (count as number).toFixed(1) : count.toLocaleString()}
                {stat.suffix}
            </span>
            <span className="mt-1.5 text-xs text-[#6B7280] font-medium">{stat.label}</span>
        </motion.div>
    )
}

const RealSalesHero = ({ mode }: { mode: Mode }) => {
    const navigate = useNavigate()
    const [currentObjection, setCurrentObjection] = useState(0)
    const [isSetupOpen, setIsSetupOpen] = useState(false)
    const signedIn = useAppSelector((state) => state.auth.session.signedIn)
    const statsRef = useRef(null)
    const statsInView = useInView(statsRef, { once: true, margin: '-40px' })

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentObjection((prev) => (prev + 1) % objections.length)
        }, 3200)
        return () => clearInterval(interval)
    }, [])

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

    return (
        <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden pt-24 pb-0">
            {/* Aurora WebGL background */}
            <Aurora
                colorStops={['#ffffff', '#9CA3AF', '#0A0A0A']}
                amplitude={1.0}
                blend={0.5}
                speed={1}
            />

            {/* Dark radial vignette — keeps edges dark, lets center aurora glow through */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 90% 70% at 50% 40%, transparent 0%, rgba(5,5,5,0.18) 52%, rgba(5,5,5,0.75) 100%)',
                }}
            />

            {/* Star dots pattern */}
            <div
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' width='80' height='80' fill='none'%3e%3ccircle cx='40' cy='40' r='0.8' fill='rgba(255,255,255,0.15)'/%3e%3c/svg%3e")`,
                }}
                className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,_white_10%,_transparent_70%)] pointer-events-none opacity-40"
            />

            {/* Content - centered */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 w-full text-center flex flex-col items-center flex-1 justify-center py-16">
                {/* Eyebrow */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] mb-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-medium text-[#9CA3AF] tracking-wide">
                            AI-Powered Sales Training
                        </span>
                    </div>
                </motion.div>

                {/* H1 */}
                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[96px] font-bold leading-[1.02] tracking-[-0.03em] mb-8 w-full text-center">
                    <SplitText
                        text="Train Smarter"
                        className="text-[#F5F5F5] leading-[1.02] block"
                        delay={35}
                        duration={1.25}
                        ease="power3.out"
                        splitType="chars"
                        from={{ opacity: 0, y: 40 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="-100px"
                        textAlign="center"
                        tag="div"
                    />
                    <SplitText
                        text="Close Faster"
                        className="text-[#F5F5F5]/40 leading-[1.02] block"
                        delay={35}
                        duration={1.25}
                        ease="power3.out"
                        splitType="chars"
                        from={{ opacity: 0, y: 40 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="-100px"
                        textAlign="center"
                        tag="div"
                    />
                </h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="text-base md:text-lg text-[#9CA3AF] leading-relaxed mb-4 max-w-[520px]"
                >
                    Practice high-stakes sales conversations with AI buyers that challenge, interrupt, and negotiate like real prospects.
                </motion.p>

                {/* Cycling objection */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                    className="h-6 overflow-hidden mb-10"
                >
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentObjection}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -14 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="text-sm text-[#6B7280] italic"
                        >
                            {objections[currentObjection]}
                        </motion.p>
                    </AnimatePresence>
                </motion.div>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                    <motion.button
                        onClick={handleEnterSimulator}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="group flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-[#050505] bg-[#F5F5F5] hover:bg-white rounded-full transition-colors duration-200"
                    >
                        Start Training Free
                        <TbArrowRight
                            size={16}
                            className="group-hover:translate-x-0.5 transition-transform duration-200"
                        />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-[#9CA3AF] hover:text-[#F5F5F5] border border-white/[0.1] hover:border-white/[0.2] rounded-full transition-all duration-200"
                        onClick={() => {
                            document.querySelector('#workflow')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                    >
                        See How It Works
                    </motion.button>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.55 }}
                    className="mt-5 text-xs text-[#4B5563]"
                >
                    No credit card required · 10 free sessions monthly
                </motion.p>
            </div>

            {/* Stats strip at bottom of hero */}
            <div
                ref={statsRef}
                className="relative z-10 w-full border-t border-white/[0.06] bg-[#050505]/60 backdrop-blur-sm"
            >
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.06]">
                        {stats.map((stat, i) => (
                            <StatItem key={i} stat={stat} index={i} started={statsInView} />
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

export default RealSalesHero
