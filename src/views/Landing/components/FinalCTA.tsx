import { motion, useReducedMotion } from 'framer-motion'
import { GlassLayers } from '@/components/ui/liquid-glass'
import { glassCard, glassEdge } from '../landingTheme'
import GradientText from '@/components/reactbits/GradientText'
import StarBorder from '@/components/reactbits/StarBorder'
import ClickSpark from '@/components/reactbits/ClickSpark'
import { TbArrowRight } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useAppSelector } from '@/store'
import SessionSetupPanel from '@/components/shared/SessionSetupPanel'
import type { ConversationMode } from '@/components/shared/SessionSetupPanel'
import { useLandingTheme } from '../LandingThemeProvider'
import Particles from './Particles'
import {
    SectionDesc,
    SectionHeading,
    SECTION_REVEAL,
    getDescDelay,
    useSmoothParallax,
} from './landingUi'

const FinalCTA = () => {
    const navigate = useNavigate()
    const t = useLandingTheme()
    const [isSetupOpen, setIsSetupOpen] = useState(false)
    const shouldReduceMotion = useReducedMotion()
    const signedIn = useAppSelector((state) => state.auth.session.signedIn)
    const { ref: parallaxRef, y: parallaxY } = useSmoothParallax(45)

    const particleColors = useMemo(
        () => [t.accent, t.accentMild, t.accentDeep],
        [t.accent, t.accentMild, t.accentDeep],
    )

    const handleStart = () => {
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
        <section className="py-24 md:py-32 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[500px]"
                    style={{
                        background: `radial-gradient(ellipse at center, ${t.accentSubtle} 0%, transparent 65%)`,
                    }}
                />
            </div>

            <motion.div
                ref={parallaxRef}
                className="max-w-7xl mx-auto px-4 relative z-10 will-change-transform"
                style={parallaxY ? { y: parallaxY } : undefined}
            >
                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-3xl overflow-hidden px-8 py-16 md:py-20 text-center"
                    style={{
                        border: '1px solid transparent',
                        ...glassCard(t),
                        boxShadow: t.isLight
                            ? glassEdge(t, '')
                            : '0 24px 56px rgba(0,0,0,0.4)',
                    }}
                >
                    <GlassLayers light={t.isLight} />
                    <div
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' width='40' height='40' fill='none'%3e%3ccircle cx='20' cy='20' r='1' fill='${encodeURIComponent(t.gridPattern)}'/%3e%3c/svg%3e")`,
                        }}
                        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,_white_20%,_transparent_70%)] pointer-events-none"
                    />

                    {/* Glowing particles inside the card (theme-aware) */}
                    {!shouldReduceMotion && (
                        <div className="absolute inset-0 pointer-events-none">
                            <Particles
                                particleColors={particleColors}
                                particleCount={t.isLight ? 50 : 70}
                                particleSpread={11}
                                speed={0.3}
                                particleBaseSize={t.isLight ? 90 : 160}
                                sizeRandomness={t.isLight ? 0.7 : 1.2}
                                moveParticlesOnHover={false}
                                alphaParticles
                                lightMode={t.isLight}
                                disableRotation
                                pixelRatio={1}
                            />
                        </div>
                    )}

                    <div className="relative z-10 max-w-2xl mx-auto pointer-events-none">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] mb-6">
                            <GradientText colors={[t.accentMild, '#38D6E8', t.accent, '#A7F3D0', t.accentMild]} animationSpeed={5}>
                                Ready to train?
                            </GradientText>
                        </p>
                        <SectionHeading
                            t={t}
                            text="Stop losing deals you should have won"
                            className="text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-tight mb-5"
                            duration={1.8}
                            delay={SECTION_REVEAL.headingDelay}
                        />
                        <SectionDesc
                            t={t}
                            text="Your team has all the knowledge. They just need the reps. SalesWana gives them a place to fail safely, so they stop failing in front of real customers."
                            className="leading-relaxed mb-10 max-w-lg mx-auto"
                            delay={getDescDelay(1.8)}
                        />

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pointer-events-auto">
                            <ClickSpark className="!h-auto !w-auto" sparkColor={t.accent} sparkCount={10} sparkRadius={22}>
                            <StarBorder
                                onClick={handleStart}
                                theme={t.isLight ? 'light' : 'dark'}
                                color="#FFFFFF"
                                radius={999}
                                backgroundColor={t.primaryBtnBg}
                                textColor={t.primaryBtnText}
                                className="group w-full !px-7 !leading-5 text-sm !font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2"
                                style={{
                                    boxShadow: t.isLight ? '0 12px 26px rgba(16,185,129,0.24)' : '0 12px 26px rgba(0,0,0,0.42)',
                                }}
                            >
                                Start training free
                                <TbArrowRight
                                    size={16}
                                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                                />
                            </StarBorder>
                            </ClickSpark>
                            <motion.a
                                href="mailto:hello@saleswana.com"
                                whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -2 }}
                                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className="flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 hover:!border-[#0CAF60]/60 hover:shadow-[0_0_28px_rgba(12,175,96,0.22)]"
                                style={{
                                    color: t.secondaryBtnText,
                                    border: `1px solid ${t.secondaryBtnBorder}`,
                                    backgroundColor: t.surface,
                                }}
                            >
                                Talk to the team
                            </motion.a>
                        </div>

                        <p className="mt-6 text-xs" style={{ color: t.textDim }}>
                            Free plan available - no credit card needed
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            <SessionSetupPanel
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                onNavigateToPersonas={handleNavigateToPersonas}
            />
        </section>
    )
}

export default FinalCTA
