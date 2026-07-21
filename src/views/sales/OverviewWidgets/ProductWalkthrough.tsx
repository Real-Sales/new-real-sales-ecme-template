import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog } from '@/components/ui'
import { TbPlayerPlayFilled, TbX, TbPlayerTrackNextFilled } from 'react-icons/tb'
import { Reveal, SectionHeading, EASE_OUT } from './common'

const VIDEO_ID = '4zd9hzngFwY'

const chapters = [
    { label: 'Choose a scenario', at: 0 },
    { label: 'Live AI conversation', at: 38 },
    { label: 'Objection handling', at: 95 },
    { label: 'Performance report', at: 142 },
]

const ProductWalkthrough = () => {
    const [open, setOpen] = useState(false)
    const [startAt, setStartAt] = useState(0)

    const openAt = (seconds: number) => {
        setStartAt(seconds)
        setOpen(true)
    }

    return (
        <section className="px-4 py-16 md:py-20">
            <div className="max-w-7xl mx-auto">
                <Reveal className="mb-10">
                    <SectionHeading
                        heading="How SalesWana works"
                        description="A two-and-a-half minute walkthrough of a full training loop, from scenario to scored feedback."
                    />
                </Reveal>

                <Reveal delay={0.1}>
                    <div className="relative">
                        <div
                            className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-3xl"
                            aria-hidden="true"
                        />
                        <div className="relative rounded-[2rem] bg-black/[0.03] dark:bg-white/[0.04] p-2 ring-1 ring-black/5 dark:ring-white/10">
                            <div className="relative overflow-hidden rounded-[1.6rem] bg-gray-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                <button
                                    onClick={() => openAt(0)}
                                    className="group relative block aspect-video w-full"
                                >
                                    <div
                                        className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-700 group-hover:scale-105"
                                        style={{
                                            backgroundImage: `url("https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg")`,
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />

                                    <div className="absolute left-5 top-5 flex items-center gap-2">
                                        <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm">
                                            2:30 min
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
                                        className="group flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-primary/40 hover:text-primary transition-colors"
                                    >
                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-[9px] font-semibold text-gray-500 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary">
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
                            <motion.iframe
                                key={startAt}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                title="SalesWana product tour"
                                className="h-full w-full"
                                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&start=${startAt}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </AnimatePresence>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 bg-gray-950 px-5 py-3">
                    <p className="text-xs text-white/50">Jump to a chapter</p>
                    <div className="flex items-center gap-1.5">
                        {chapters.map((chapter) => (
                            <button
                                key={chapter.label}
                                onClick={() => setStartAt(chapter.at)}
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
