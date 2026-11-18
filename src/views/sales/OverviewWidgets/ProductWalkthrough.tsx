import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog } from '@/components/ui'
import { TbPlayerPlayFilled, TbX, TbPlayerTrackNextFilled } from 'react-icons/tb'
import { Reveal, SectionHeading, EASE_OUT } from './common'

// Same product tour as the landing page
const VIDEO_SRC = '/video/saleswana-tour.mp4'
const POSTER_SRC = '/video/saleswana-tour-poster.jpg'

// Start times (seconds) of the six steps shown in the video
const chapters = [
    { label: 'Invite your team', at: 58 },
    { label: 'Divisions & teams', at: 67 },
    { label: 'Scenario library', at: 84 },
    { label: 'Assign scenarios', at: 99 },
    { label: 'Practice with an AI buyer', at: 112 },
    { label: 'Report card', at: 153 },
]

const ProductWalkthrough = () => {
    const [open, setOpen] = useState(false)
    const [startAt, setStartAt] = useState(0)
    const videoRef = useRef<HTMLVideoElement>(null)

    const openAt = (seconds: number) => {
        setStartAt(seconds)
        setOpen(true)
    }

    // Jump to a chapter while the player is open
    const jumpTo = (seconds: number) => {
        setStartAt(seconds)
        const video = videoRef.current
        if (video) {
            video.currentTime = seconds
            void video.play().catch(() => undefined)
        }
    }

    // Stop playback when the dialog closes
    useEffect(() => {
        if (!open) videoRef.current?.pause()
    }, [open])

    return (
        <section className="px-4 py-16 md:py-20">
            <div className="max-w-7xl mx-auto">
                <Reveal className="mb-10">
                    <SectionHeading
                        heading="How SalesWana works"
                        description="A three-minute walkthrough of the full training loop, from inviting your team to the scored report card."
                    />
                </Reveal>

                <Reveal delay={0.1}>
                    <div className="relative">
                        <div
                            className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-3xl"
                            aria-hidden="true"
                        />
                        <div className="relative rounded-[2rem] border app-liquid-dark p-2">
                            <div className="relative overflow-hidden rounded-[1.6rem] bg-gray-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                <button
                                    onClick={() => openAt(0)}
                                    className="group relative block aspect-video w-full"
                                >
                                    <div
                                        className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-700 group-hover:scale-105"
                                        style={{
                                            backgroundImage: `url("${POSTER_SRC}")`,
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />

                                    <div className="absolute left-5 top-5 flex items-center gap-2">
                                        <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm">
                                            3:06 min
                                        </span>
                                        <span className="rounded-full bg-primary/20 px-3 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/30 backdrop-blur-sm">
                                            Product tour
                                        </span>
                                    </div>

                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center"
                                        whileHover={{ scale: 1.06 }}
                                        transition={{ duration: 0.3, ease: EASE_OUT }}
                                    >
                                        <span className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-colors group-hover:bg-white">
                                            <TbPlayerPlayFilled className="ml-1 h-6 w-6 sm:h-7 sm:w-7 text-gray-900" />
                                        </span>
                                    </motion.div>

                                    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-white/90">
                                            Watch the product tour
                                        </p>
                                        <span className="hidden sm:inline text-xs text-white/50">
                                            Click to expand
                                        </span>
                                    </div>
                                </button>
                            </div>

                            {/* Chapter markers */}
                            <div className="flex flex-wrap gap-2 px-3 py-3">
                                {chapters.map((chapter, i) => (
                                    <button
                                        key={chapter.label}
                                        onClick={() => openAt(chapter.at)}
                                        className="group flex items-center gap-2 rounded-full border border-white/80 dark:border-white/10 bg-white/25 dark:bg-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-400 hover:border-primary/50 hover:text-primary hover:shadow-[0_0_18px_rgba(12,175,96,0.16)] transition-all"
                                    >
                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/[0.06] dark:bg-white/10 text-[9px] font-semibold text-gray-500 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary">
                                            {i + 1}
                                        </span>
                                        {chapter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>

            <Dialog
                isOpen={open}
                onClose={() => setOpen(false)}
                width={960}
                closable={false}
                contentClassName="!bg-black !p-0 !overflow-hidden !rounded-2xl"
            >
                <div className="relative aspect-video w-full">
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    >
                        <TbX className="h-4 w-4" />
                    </button>
                    <AnimatePresence>
                        {open && (
                            <motion.video
                                ref={videoRef}
                                autoPlay
                                controls
                                playsInline
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                title="SalesWana product tour"
                                className="h-full w-full bg-black"
                                src={VIDEO_SRC}
                                poster={POSTER_SRC}
                                onLoadedMetadata={(e) => {
                                    e.currentTarget.currentTime = startAt
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-gray-950 px-5 py-3">
                    <p className="text-xs text-white/50">Jump to a chapter</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {chapters.map((chapter) => (
                            <button
                                key={chapter.label}
                                onClick={() => jumpTo(chapter.at)}
                                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <TbPlayerTrackNextFilled className="h-3 w-3" />
                                {chapter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Dialog>
        </section>
    )
}

export default ProductWalkthrough
