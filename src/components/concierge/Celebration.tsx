import { useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { TbConfetti, TbX } from 'react-icons/tb'

const PARTICLE_COLORS = ['#0CAF60', '#34c779', '#088d50', '#ffffff']

const useParticles = (count: number) =>
    useMemo(
        () =>
            Array.from({ length: count }).map((_, i) => ({
                id: i,
                angle: (i / count) * Math.PI * 2 + Math.random() * 0.4,
                distance: 90 + Math.random() * 110,
                size: 5 + Math.random() * 6,
                rotate: Math.random() * 360,
                color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
                delay: Math.random() * 0.15,
            })),
        [count],
    )

const Celebration = ({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) => {
    const reduce = useReducedMotion()
    const particles = useParticles(reduce ? 0 : 26)

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[95] flex items-center justify-center bg-gray-950/70 backdrop-blur-sm px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="relative w-full max-w-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                    >
                        <div className="relative rounded-[2rem] bg-black/[0.04] dark:bg-white/[0.06] p-1.5 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl">
                            <div className="relative rounded-[1.65rem] bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl px-7 py-9 text-center overflow-hidden">
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <TbX className="h-4 w-4" />
                                </button>

                                <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                                    {particles.map((p) => (
                                        <motion.span
                                            key={p.id}
                                            className="absolute rounded-sm"
                                            style={{
                                                width: p.size,
                                                height: p.size * 0.4,
                                                backgroundColor: p.color,
                                                top: '50%',
                                                left: '50%',
                                            }}
                                            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                                            animate={{
                                                x: Math.cos(p.angle) * p.distance,
                                                y: Math.sin(p.angle) * p.distance + 40,
                                                opacity: 0,
                                                rotate: p.rotate,
                                            }}
                                            transition={{
                                                duration: 1.1,
                                                delay: p.delay,
                                                ease: [0.16, 1, 0.3, 1],
                                            }}
                                        />
                                    ))}
                                    <motion.span
                                        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                                        initial={{ scale: 0.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                                    >
                                        <TbConfetti className="h-8 w-8" />
                                    </motion.span>
                                </div>

                                <h2 className="relative mt-5 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    First session, done.
                                </h2>
                                <p className="relative mt-2.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                    That's the hardest rep. Your score and coaching notes are ready
                                    whenever you want to look.
                                </p>

                                <button
                                    onClick={onClose}
                                    className="relative mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-deep transition-colors"
                                >
                                    Keep going
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default Celebration
