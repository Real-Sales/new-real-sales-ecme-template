import { motion, AnimatePresence } from 'framer-motion'
import { TbSparkles, TbArrowRight } from 'react-icons/tb'

const WelcomeModal = ({
    open,
    firstName,
    onStart,
    onSkip,
}: {
    open: boolean
    firstName: string
    onStart: () => void
    onSkip: () => void
}) => {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-950/70 backdrop-blur-sm px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <motion.div
                        className="relative w-full max-w-md"
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                    >
                        <motion.div
                            className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-primary/20 blur-3xl"
                            animate={{ opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        <div className="relative rounded-[2rem] bg-black/[0.04] dark:bg-white/[0.06] p-1.5 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl">
                            <div className="relative rounded-[1.65rem] bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl px-7 py-9 text-center overflow-hidden">
                                <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

                                <motion.span
                                    className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <TbSparkles className="h-7 w-7" />
                                </motion.span>

                                <h2 className="relative mt-5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Hi {firstName}, I'm your AI coach.
                                </h2>
                                <p className="relative mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                    Give me two minutes and I'll show you around by doing, not by
                                    describing. Skip anytime, and I'll pick up right where you left off.
                                </p>

                                <div className="relative mt-7 flex flex-col gap-2.5">
                                    <button
                                        onClick={onStart}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-deep transition-colors"
                                    >
                                        Show me around
                                        <TbArrowRight className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={onSkip}
                                        className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                    >
                                        Maybe later
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default WelcomeModal
