import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TbSparkles, TbX, TbRotateClockwise2 } from 'react-icons/tb'
import Checklist from './Checklist'
import { contextTipFor } from './contextTips'
import type { ChecklistItem } from './steps'
import type { TourStatus } from '@/store/slices/concierge/conciergeSlice'

const FloatingCoach = ({
    checklistItems,
    checklistDone,
    tourStatus,
    onResumeTour,
    hasPendingNudge,
}: {
    checklistItems: ChecklistItem[]
    checklistDone: Record<string, boolean>
    tourStatus: TourStatus
    onResumeTour: () => void
    hasPendingNudge: boolean
}) => {
    const [open, setOpen] = useState(false)
    const location = useLocation()
    const tip = contextTipFor(location.pathname)
    const isOverviewPage =
        location.pathname === '/overview' ||
        location.pathname.startsWith('/overview/')

    if (!isOverviewPage) {
        return null
    }

    return (
        <div className="fixed bottom-5 right-5 z-[60] sm:bottom-6 sm:right-6">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                        className="absolute bottom-16 right-0 w-[calc(100vw-2.5rem)] max-w-sm origin-bottom-right"
                    >
                        <div className="rounded-[1.75rem] bg-black/[0.04] dark:bg-white/[0.06] p-1.5 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl">
                            <div className="rounded-[1.4rem] bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <TbSparkles className="h-4 w-4" />
                                        </span>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            AI coach
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <TbX className="h-4 w-4" />
                                    </button>
                                </div>

                                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                    {tip}
                                </p>

                                <button
                                    onClick={() => {
                                        onResumeTour()
                                        setOpen(false)
                                    }}
                                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                                >
                                    <TbRotateClockwise2 className="h-3.5 w-3.5" />
                                    {tourStatus === 'in_progress' || tourStatus === 'paused'
                                        ? 'Resume the tour'
                                        : tourStatus === 'completed'
                                          ? 'Take the tour again'
                                          : 'Take the tour'}
                                </button>

                                <div className="mt-5 border-t border-gray-100 dark:border-white/10 pt-4">
                                    <Checklist items={checklistItems} done={checklistDone} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setOpen((v) => !v)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.25 }}
                aria-label="Open AI coach"
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/30"
            >
                {hasPendingNudge && !open && (
                    <span className="absolute right-0 top-0 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                    </span>
                )}
                <TbSparkles className="h-6 w-6" />
            </motion.button>
        </div>
    )
}

export default FloatingCoach
