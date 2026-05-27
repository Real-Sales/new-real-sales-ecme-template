import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { HiChevronDoubleDown, HiPlay, HiStar } from 'react-icons/hi'
import { TbArrowRight } from 'react-icons/tb'
import { UsersAvatarGroup } from '@/components/shared'
import { useAppSelector } from '@/store'
import SessionSetupPanel from '@/components/shared/SessionSetupPanel'
import type { ConversationMode } from '@/components/shared/SessionSetupPanel'
import { useLandingTheme } from '../LandingThemeProvider'
import { getLenis } from '../smoothScroll'
import LaserFlow from './LaserFlow'
import Particles from './Particles'

// Smooth cinematic easing
const EASE_OUT = [0.22, 1, 0.36, 1] as const

const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.15,
        },
    },
}

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 28,
        filter: 'blur(8px)',
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.9,
            ease: EASE_OUT,
        },
    },
}

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 1.2, ease: EASE_OUT },
    },
}

const scrollHintVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6, ease: EASE_OUT, delay: 1.1 },
    },
}

const DEMO_VIDEO_ID = '4zd9hzngFwY'

const RATING_USERS = [
    { name: 'Alex M.', img: '/img/avatars/thumb-1.jpg' },
    { name: 'Jordan K.', img: '/img/avatars/thumb-2.jpg' },
    { name: 'Taylor R.', img: '/img/avatars/thumb-3.jpg' },
]

const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '')
    const full =
        clean.length === 3
            ? clean
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : clean
    const num = parseInt(full, 16)
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    }
}

const RealSalesHero = () => {
    const navigate = useNavigate()
    const t = useLandingTheme()
    const signedIn = useAppSelector((state) => state.auth.session.signedIn)

    const revealImgRef = useRef<HTMLImageElement>(null)
    const videoCardRef = useRef<HTMLDivElement>(null)
    const [isVideoPlaying, setIsVideoPlaying] = useState(false)
    const [showScrollHint, setShowScrollHint] = useState(true)
    const [isSetupOpen, setIsSetupOpen] = useState(false)

    const particleColors = useMemo(
        () => [t.accent, t.accentMild, t.accentDeep],
        [t.accent, t.accentMild, t.accentDeep],
    )

    const accentRgb = useMemo(() => hexToRgb(t.accent), [t.accent])
    const accentShadow = `0 0 80px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.4), 0 30px 80px rgba(0,0,0,0.6)`
    const btnShadow = `0 8px 25px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.4)`

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollHint(window.scrollY < 40)
        }
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const el = revealImgRef.current
        if (el) {
            el.style.setProperty('--mx', `${x}px`)
            el.style.setProperty('--my', `${y + rect.height * 0.5}px`)
        }
    }

    const handleMouseLeave = () => {
        const el = revealImgRef.current
        if (el) {
            el.style.setProperty('--mx', '-9999px')
            el.style.setProperty('--my', '-9999px')
        }
    }

    const handleScrollToVideo = () => {
        const card = videoCardRef.current
        if (!card) return
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.top + window.scrollY + rect.height / 2
        const targetY = Math.max(0, cardCenter - window.innerHeight / 2)

        const lenis = getLenis()
        if (lenis) {
            lenis.scrollTo(targetY, { duration: 1.4 })
        } else {
            window.scrollTo({ top: targetY, behavior: 'smooth' })
        }
    }

    const handleBookDemo = () => {
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
        navigate('/persona-selection', {
            state: { mode: conversationMode, scenarios, files },
        })
    }

    return (
        <section
            className="relative w-full font-sans h-screen"
            style={{ color: t.text, backgroundColor: t.bg }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Laser canvas extends above & below the hero (in % of hero height, not vh)
                so the flare endpoint always lands exactly at the hero's bottom edge — i.e.
                right at the top of the demo video card — on any screen size. */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={overlayVariants}
                className="pointer-events-none absolute inset-x-0 -top-1/2 h-[200%] overflow-hidden"
            >
                <LaserFlow
                    horizontalBeamOffset={0.22}
                    verticalBeamOffset={-0.25}
                    color={t.accent}
                    horizontalSizing={0.7}
                    verticalSizing={2}
                    wispDensity={1}
                    wispSpeed={30}
                    wispIntensity={5}
                    flowSpeed={0.35}
                    flowStrength={0.7}
                    fogIntensity={0.45}
                    fogScale={0.3}
                    fogFallSpeed={0.6}
                    decay={1.1}
                    falloffStart={1.2}
                />
            </motion.div>

            {/* Floating particles overlay */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={overlayVariants}
                className="pointer-events-none absolute inset-0 z-[1]"
            >
                <Particles
                    particleColors={particleColors}
                    particleCount={200}
                    particleSpread={10}
                    speed={0.3}
                    particleBaseSize={100}
                    moveParticlesOnHover={false}
                    alphaParticles={false}
                    disableRotation={false}
                    pixelRatio={2}
                />
            </motion.div>

            {/* Reveal image overlay (subtle, mouse-driven) */}
            <img
                ref={revealImgRef}
                src={`https://img.youtube.com/vi/${DEMO_VIDEO_ID}/maxresdefault.jpg`}
                alt=""
                aria-hidden
                className="pointer-events-none absolute top-[-25%] z-[5] w-full opacity-25 mix-blend-lighten"
                style={{
                    ['--mx' as string]: '-9999px',
                    ['--my' as string]: '-9999px',
                    WebkitMaskImage:
                        'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
                    maskImage:
                        'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                }}
            />

            {/* Hero content — vertically centered in the viewport */}
            <div className="relative z-10 flex h-full w-full max-w-7xl mx-auto items-center px-5 sm:px-8 lg:pl-12 xl:pl-20">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-2xl flex flex-col"
                >
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 sm:px-4 sm:py-2 rounded-full w-max mb-5 sm:mb-8"
                        style={{
                            backgroundColor: t.surfaceStrong,
                            border: `1px solid ${t.border}`,
                            color: t.text,
                        }}
                    >
                        <span
                            className="h-1 w-1 sm:h-[5px] sm:w-[5px] shrink-0 rounded-full"
                            style={{ backgroundColor: t.accent }}
                        />
                        AI That Drives Revenue
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-[32px] sm:text-[52px] xl:text-[62px] leading-[1.05] font-bold tracking-tight mb-4 sm:mb-6"
                        style={{ color: t.text }}
                    >
                        Intelligent Outreach.
                        <br />
                        Stronger Pipeline.
                        <br />
                        <span style={{ color: t.accent }}>More Revenue.</span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-[14px] sm:text-[17px] mb-6 sm:mb-10 pr-2 sm:pr-4 leading-relaxed font-normal"
                        style={{ color: t.textMuted }}
                    >
                        SalesAI combines the power of AI and your data to help your team find the right prospects, engage at the right time, and close more deals.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5"
                    >
                        <div className="flex items-center gap-2 sm:gap-3">
                            <UsersAvatarGroup
                                users={RATING_USERS}
                                maxCount={3}
                                omittedAvatarTooltip={false}
                                avatarProps={{
                                    shape: 'circle',
                                    className:
                                        'cursor-default pointer-events-none w-8 h-8 sm:w-10 sm:h-10',
                                    style: {
                                        boxShadow: `0 0 0 2px ${t.bg}`,
                                    },
                                }}
                            />

                            <div className="flex flex-col gap-0.5 sm:gap-1">
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <HiStar
                                            key={index}
                                            className="text-sm sm:text-base"
                                            style={{ color: t.accent }}
                                        />
                                    ))}
                                </div>
                                <p
                                    className="text-xs sm:text-sm font-medium"
                                    style={{ color: t.text }}
                                >
                                    From 2000+ ratings
                                </p>
                            </div>
                        </div>

                        <motion.button
                            type="button"
                            onClick={handleBookDemo}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.2, ease: EASE_OUT }}
                            className="mt-[5px] sm:mt-0 text-xs sm:text-base px-4 py-2 sm:px-8 sm:py-3.5 rounded-full font-semibold flex items-center gap-1.5 sm:gap-2"
                            style={{
                                backgroundColor: t.primaryBtnBg,
                                color: t.primaryBtnText,
                                boxShadow: btnShadow,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = t.primaryBtnHover
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = t.primaryBtnBg
                            }}
                        >
                            <span>Book a Demo</span>
                            <TbArrowRight className="text-sm sm:text-lg" />
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll-down indicator (clicking scrolls the video card into view; hides once user scrolls) */}
            <motion.button
                type="button"
                onClick={handleScrollToVideo}
                aria-label="Scroll to demo video"
                initial="hidden"
                animate="visible"
                variants={scrollHintVariants}
                className={`absolute bottom-8 left-1/2 z-[20] flex -translate-x-1/2 cursor-pointer flex-col items-center gap-1 bg-transparent transition-opacity duration-300 ${
                    showScrollHint
                        ? 'opacity-100 animate-bounce'
                        : 'opacity-0 pointer-events-none'
                }`}
                style={{ color: t.textMuted }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = t.text
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = t.textMuted
                }}
            >
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                    Scroll down
                </span>
                <HiChevronDoubleDown className="text-2xl" />
            </motion.button>

            {/* Demo video card — sits exactly at the hero bottom so it's not visible until the user scrolls;
                width scales with viewport so the laser flare always lands inside the card. */}
            <div
                ref={videoCardRef}
                className="absolute left-1/2 top-full z-[6] w-[94vw] max-w-[1700px] -translate-x-1/2"
            >
                <div
                    className="relative aspect-video w-full overflow-hidden rounded-[24px]"
                    style={{
                        backgroundColor: t.bgCard,
                        boxShadow: accentShadow,
                    }}
                >
                    {isVideoPlaying ? (
                        <iframe
                            title="SalesAI Demo Video"
                            className="h-full w-full"
                            src={`https://www.youtube.com/embed/${DEMO_VIDEO_ID}?autoplay=1`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <button
                            type="button"
                            className="group relative h-full w-full cursor-pointer"
                            onClick={() => setIsVideoPlaying(true)}
                        >
                            <img
                                src={`https://img.youtube.com/vi/${DEMO_VIDEO_ID}/maxresdefault.jpg`}
                                alt="Demo video thumbnail"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-5">
                                <div className="relative flex items-center justify-center">
                                    {/* Outer pulsing rings */}
                                    <span
                                        className="absolute h-14 w-14 sm:h-24 sm:w-24 rounded-full animate-ping opacity-40"
                                        style={{ backgroundColor: t.accent }}
                                    />
                                    <span
                                        className="absolute h-12 w-12 sm:h-20 sm:w-20 rounded-full opacity-60 blur-xl"
                                        style={{ backgroundColor: t.accent }}
                                    />

                                    {/* Glass ring */}
                                    <span
                                        className="absolute h-[52px] w-[52px] sm:h-[88px] sm:w-[88px] rounded-full border border-white/30 backdrop-blur-md"
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                        }}
                                    />

                                    {/* Main play button */}
                                    <div
                                        className="relative flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
                                        style={{
                                            backgroundColor: t.accent,
                                            boxShadow: `0 8px 32px ${t.accent}66`,
                                        }}
                                    >
                                        <HiPlay
                                            className="ml-0.5 text-base sm:text-2xl"
                                            style={{ color: t.onAccent }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <p className="text-sm sm:text-lg font-semibold text-white drop-shadow-lg tracking-tight">
                                        Watch Demo Video
                                    </p>
                                </div>
                            </div>
                        </button>
                    )}
                </div>
            </div>

            <SessionSetupPanel
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                onNavigateToPersonas={handleNavigateToPersonas}
            />
        </section>
    )
}

export default RealSalesHero
