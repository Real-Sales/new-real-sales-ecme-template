import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import type { TargetRect } from './useSpotlightTarget'

const PAD = 10

/**
 * Dims the whole viewport except a rounded cutout around `rect`, using the
 * classic "oversized box-shadow" spotlight trick (one repainting element,
 * no SVG mask, cheap on the GPU). A soft ring pulses around the cutout edge.
 *
 * When `rect` is null (target still mounting after a route change), fall back
 * to a full-screen dim so the coachmark never floats over a bright, undimmed UI.
 */
const Spotlight = ({ rect }: { rect: TargetRect | null }) => {
    const reduce = useReducedMotion()

    return (
        <AnimatePresence>
            <motion.div
                key={rect ? 'cutout' : 'full'}
                className="fixed inset-0 z-[70] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
            >
                {rect ? (
                    <>
                        <motion.div
                            className="absolute rounded-2xl"
                            style={{
                                boxShadow: '0 0 0 9999px rgba(4, 8, 7, 0.72)',
                            }}
                            animate={{
                                top: rect.top - PAD,
                                left: rect.left - PAD,
                                width: rect.width + PAD * 2,
                                height: rect.height + PAD * 2,
                            }}
                            transition={
                                reduce
                                    ? { duration: 0 }
                                    : { type: 'spring', stiffness: 170, damping: 24 }
                            }
                        />
                        <motion.div
                            className="absolute rounded-2xl ring-2 ring-primary pointer-events-none"
                            animate={{
                                top: rect.top - PAD,
                                left: rect.left - PAD,
                                width: rect.width + PAD * 2,
                                height: rect.height + PAD * 2,
                                boxShadow: reduce
                                    ? '0 0 0 0px rgba(12,175,96,0)'
                                    : [
                                          '0 0 0 0px rgba(12,175,96,0.35)',
                                          '0 0 0 8px rgba(12,175,96,0)',
                                      ],
                            }}
                            transition={{
                                top: reduce ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 24 },
                                left: reduce ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 24 },
                                width: reduce ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 24 },
                                height: reduce ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 24 },
                                boxShadow: reduce
                                    ? { duration: 0 }
                                    : { duration: 1.8, repeat: Infinity, ease: 'easeOut' },
                            }}
                        />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-[rgba(4,8,7,0.72)]" />
                )}
            </motion.div>
        </AnimatePresence>
    )
}

export default Spotlight
