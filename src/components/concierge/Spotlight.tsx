import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import type { TargetRect } from './useSpotlightTarget'

const PAD = 10

/**
 * Dims the viewport except a rounded cutout around `rect`.
 * Only render when a real target rect exists — never full-black without a cutout.
 */
const Spotlight = ({ rect }: { rect: TargetRect }) => {
    const reduce = useReducedMotion()

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[70] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
            >
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
            </motion.div>
        </AnimatePresence>
    )
}

export default Spotlight
