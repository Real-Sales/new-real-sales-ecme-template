import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { TbPlayerPlayFilled, TbClock, TbListCheck, TbVolume } from 'react-icons/tb'
import { useLandingTheme } from '../LandingThemeProvider'
import { SectionBadge, SectionHeading, SectionDesc, useIsNarrow, useParallaxY } from './landingUi'

const VIDEO_SRC = '/video/saleswana-tour.mp4'
const POSTER_SRC = '/video/saleswana-tour-poster.jpg'

/** Range the shared parallax loop reports for the frame: +RANGE entering at the bottom, -RANGE leaving at the top. */
const RANGE = 100
/** Share of the trip through the screen over which the video grows to full size (about when it is centred). */
const ZOOM_SPAN = 0.5

const CHIPS = [
    { icon: TbClock, label: '3 minute watch' },
    { icon: TbListCheck, label: '6 guided steps' },
    { icon: TbVolume, label: 'Narrated walkthrough' },
]

/** A beam of light that travels around the frame, and the breathing halo under the video.
 * Everything here animates with transform/opacity only, so the compositor moves ready-made layers and nothing
 * is repainted per frame (an animated gradient angle or an animated blur repaints the whole card, which
 * made scrolling stutter on phones). */
const TOUR_CSS = `
@keyframes tour-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes tour-breathe { 0%, 100% { opacity: 0.55; transform: scale(0.96); } 50% { opacity: 1; transform: scale(1.03); } }
@keyframes tour-ring { 0% { transform: scale(1); opacity: 0.55; } 100% { transform: scale(2.1); opacity: 0; } }
@keyframes tour-sheen { 0%, 60% { transform: translateX(-130%) skewX(-18deg); } 100% { transform: translateX(330%) skewX(-18deg); } }
.tour-beam {
    /* A square wider than the card's diagonal, spun behind it; the card's 1.5px padding shows it as the border */
    position: absolute; left: 50%; top: 50%; width: 125%; aspect-ratio: 1;
    transform: translate(-50%, -50%);
    background: conic-gradient(
        rgba(12,175,96,0.14) 0deg, rgba(12,175,96,0.14) 200deg,
        rgba(52,199,121,0.9) 270deg, #b9ffd9 300deg, rgba(34,211,238,0.9) 325deg,
        rgba(12,175,96,0.14) 360deg);
    animation: tour-spin 6s linear infinite;
    will-change: transform;
}
.tour-halo { animation: tour-breathe 5s ease-in-out infinite; will-change: transform, opacity; }
.tour-ring { animation: tour-ring 2.4s cubic-bezier(0.2, 0.6, 0.3, 1) infinite; }
.tour-sheen { animation: tour-sheen 5.5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
    .tour-beam, .tour-halo, .tour-ring, .tour-sheen { animation: none; }
}
`

const ProductTour = () => {
    const t = useLandingTheme()
    const frameRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [started, setStarted] = useState(false)
    const shouldReduceMotion = useReducedMotion()
    const isNarrow = useIsNarrow()

    // Scroll zoom: driven by the shared parallax loop, so it adds no scroll listeners or layout reads.
    const drift = useParallaxY(frameRef, RANGE)
    const startScale = isNarrow ? 0.84 : 0.68
    const zoom = useTransform(drift, (v) => {
        return Math.min(1, Math.max(0, (RANGE - v) / (2 * RANGE) / ZOOM_SPAN))
    })
    const scale = useTransform(zoom, (z) => startScale + (1 - startScale) * z)
    const glow = useTransform(zoom, (z) => 0.2 + 0.8 * z)

    // Pause when the video scrolls out of view
    useEffect(() => {
        const frame = frameRef.current
        if (!frame) return
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) videoRef.current?.pause()
            },
            { threshold: 0.1 },
        )
        io.observe(frame)
        return () => io.disconnect()
    }, [])

    const handlePlay = () => {
        setStarted(true)
        videoRef.current?.play().catch(() => setStarted(false))
    }

    return (
        <section id="tour" className="relative py-20 md:py-28">
            <style>{TOUR_CSS}</style>
            <div className="max-w-[1680px] mx-auto px-3 md:px-6">
                <div className="flex flex-col items-center text-center mb-10 md:mb-14">
                    <SectionBadge t={t} label="Product tour" />
                    <SectionHeading
                        t={t}
                        text="See SalesWana in action"
                        className="text-3xl md:text-4xl font-bold tracking-[-0.015em] leading-tight mb-5"
                    />
                    <SectionDesc
                        t={t}
                        text="A three-minute walkthrough, from setting up your company to practising with an AI buyer and reading your scored report."
                        className="leading-relaxed text-base max-w-xl"
                    />
                    <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
                        {CHIPS.map(({ icon: Icon, label }) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs md:text-[13px] font-medium"
                                style={{
                                    color: t.textMuted,
                                    border: `1px solid ${t.border}`,
                                    backgroundColor: t.surface,
                                }}
                            >
                                <Icon size={15} style={{ color: t.accent }} />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Unscaled frame: the parallax loop measures this one, the inner card zooms */}
                {/* Nearly full width, but never taller than the screen */}
                <div
                    ref={frameRef}
                    className="relative aspect-video mx-auto"
                    style={{ maxWidth: 'calc((100vh - 110px) * 16 / 9)' }}
                >
                    <motion.div
                        className="absolute inset-0"
                        style={shouldReduceMotion ? undefined : { scale, willChange: 'transform' }}
                    >
                        {/* Breathing halo behind the video; brightens as the video zooms in */}
                        <motion.div
                            aria-hidden
                            className="pointer-events-none absolute -inset-8 md:-inset-16"
                            style={{ opacity: shouldReduceMotion ? 1 : glow }}
                        >
                            <div
                                className="tour-halo absolute inset-0"
                                style={{
                                    background:
                                        'radial-gradient(50% 50% at 50% 52%, rgba(12,175,96,0.4), rgba(12,175,96,0.22) 45%, rgba(34,211,238,0.07) 68%, transparent 100%)',
                                }}
                            />
                        </motion.div>
                        {/* Pool of light under the frame */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute left-[4%] right-[4%] -bottom-14 h-28"
                            style={{
                                background:
                                    'radial-gradient(50% 50% at 50% 50%, rgba(12,175,96,0.4), transparent 100%)',
                            }}
                        />

                        {/* Glow that travels with the beam: the same spinning gradient, clipped to the card's outline
                            and blurred. The spin runs on the compositor, so nothing is repainted per frame.
                            Laptop screens only: phones keep the fixed glow below, which costs their GPU nothing. */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-[3px] hidden md:block overflow-hidden rounded-[28px] opacity-80"
                            style={{ filter: 'blur(16px)' }}
                        >
                            <div className="tour-beam" />
                        </div>
                        {/* Beam border: the gradient shows through a 1.5px gap around the video */}
                        <div
                            className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-3xl p-[1.5px]"
                            style={{
                                boxShadow: `0 0 ${isNarrow ? '28px rgba(12,175,96,0.32)' : '24px rgba(12,175,96,0.16)'}, 0 30px 80px ${t.isLight ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.6)'}`,
                            }}
                        >
                            <div aria-hidden className="tour-beam pointer-events-none" />
                            <div
                                className="relative h-full w-full overflow-hidden rounded-[15px] md:rounded-[23px]"
                                style={{ backgroundColor: '#050806' }}
                            >
                                <video
                                    ref={videoRef}
                                    playsInline
                                    className="h-full w-full object-cover"
                                    src={VIDEO_SRC}
                                    poster={POSTER_SRC}
                                    preload="none"
                                    controls={started}
                                    onEnded={() => setStarted(false)}
                                />
                                {!started && (
                                    <button
                                        type="button"
                                        aria-label="Play the SalesWana product tour"
                                        className="group absolute inset-0 flex items-center justify-center overflow-hidden"
                                        style={{
                                            background:
                                                'radial-gradient(70% 70% at 50% 50%, rgba(0,0,0,0.15), rgba(0,0,0,0.6))',
                                        }}
                                        onClick={handlePlay}
                                    >
                                        {/* Sheen that sweeps across the poster now and then */}
                                        <span
                                            aria-hidden
                                            className="tour-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3"
                                            style={{
                                                background:
                                                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent)',
                                            }}
                                        />
                                        <span className="relative flex flex-col items-center">
                                            <span className="relative flex items-center justify-center">
                                                <span
                                                    className="tour-ring absolute h-14 w-14 md:h-24 md:w-24 rounded-full"
                                                    style={{ border: '1.5px solid rgba(52,199,121,0.8)' }}
                                                />
                                                <span
                                                    className="tour-ring absolute h-14 w-14 md:h-24 md:w-24 rounded-full"
                                                    style={{
                                                        border: '1.5px solid rgba(52,199,121,0.8)',
                                                        animationDelay: '1.2s',
                                                    }}
                                                />
                                                <span
                                                    className="relative flex h-14 w-14 md:h-24 md:w-24 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                                                    style={{
                                                        background:
                                                            'linear-gradient(135deg, #34C779 0%, #0CAF60 55%, #0891b2 130%)',
                                                        boxShadow:
                                                            '0 0 0 6px rgba(12,175,96,0.18), 0 0 50px rgba(12,175,96,0.75), inset 0 1px 0 rgba(255,255,255,0.45)',
                                                    }}
                                                >
                                                    <TbPlayerPlayFilled className="text-white text-xl md:text-4xl translate-x-[2px]" />
                                                </span>
                                            </span>
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default ProductTour
