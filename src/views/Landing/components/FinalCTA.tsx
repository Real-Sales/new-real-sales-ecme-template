import { motion } from 'framer-motion'
import { TbArrowRight } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppSelector } from '@/store'
import SessionSetupPanel from '@/components/shared/SessionSetupPanel'
import type { ConversationMode } from '@/components/shared/SessionSetupPanel'
import type { Mode } from '@/@types/theme'

const FinalCTA = ({ mode }: { mode: Mode }) => {
    const navigate = useNavigate()
    const [isSetupOpen, setIsSetupOpen] = useState(false)
    const signedIn = useAppSelector((state) => state.auth.session.signedIn)

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
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.05)_0%,_transparent_65%)]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-3xl border border-white/[0.1] bg-white/[0.02] overflow-hidden px-8 py-16 md:py-20 text-center"
                >
                    {/* Inner grid decoration */}
                    <div
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' width='40' height='40' fill='none'%3e%3ccircle cx='20' cy='20' r='1' fill='rgba(255,255,255,0.05)'/%3e%3c/svg%3e")`,
                        }}
                        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,_white_20%,_transparent_70%)] pointer-events-none"
                    />

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <p className="text-xs font-medium text-[#6B7280] uppercase tracking-[0.2em] mb-6">
                            Ready to train?
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#F5F5F5] tracking-[-0.02em] leading-tight mb-5">
                            Stop losing deals you should have won
                        </h2>
                        <p className="text-[#6B7280] leading-relaxed mb-10 max-w-lg mx-auto">
                            Your team has all the knowledge. They just need the reps. RealSales gives them a place to fail safely, so they stop failing in front of real customers.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <motion.button
                                onClick={handleStart}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className="group flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-[#050505] bg-[#F5F5F5] hover:bg-white rounded-full transition-colors duration-200"
                            >
                                Start training free
                                <TbArrowRight
                                    size={16}
                                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                                />
                            </motion.button>
                            <motion.a
                                href="mailto:hello@realsales.ai"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className="flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-[#9CA3AF] hover:text-[#F5F5F5] border border-white/[0.1] hover:border-white/[0.2] rounded-full transition-all duration-200"
                            >
                                Talk to the team
                            </motion.a>
                        </div>

                        <p className="mt-6 text-xs text-[#4B5563]">
                            Free plan available - no credit card needed
                        </p>
                    </div>
                </motion.div>
            </div>

            <SessionSetupPanel
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                onNavigateToPersonas={handleNavigateToPersonas}
            />
        </section>
    )
}

export default FinalCTA
