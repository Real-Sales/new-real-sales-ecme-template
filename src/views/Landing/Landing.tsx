import { useEffect } from 'react'
import Lenis from 'lenis'
import RealSalesHero from './components/RealSalesHero'
import NavigationBar from './components/NavigationBar'
import LandingNavSentinel from './components/LandingNavSentinel'
import FeatureGrid from './components/FeatureGrid'
import VideoSection from './components/VideoSection'
import DashboardSection from './components/DashboardSection'
import SocialProof from './components/SocialProof'
import PricingSection from './components/PricingSection'
import FAQSection from './components/FAQSection'
import FinalCTA from './components/FinalCTA'
import LandingFooter from './components/LandingFooter'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { LandingThemeProvider } from './LandingThemeProvider'
import { useLandingTheme } from './LandingThemeProvider'
import { useAppDispatch } from '@/store'
import { setSchema } from '@/store/slices/theme/themeSlice'
import { setLenis } from './smoothScroll'
import type { Mode } from '@/@types/theme'

type LandingContentProps = {
    mode: Mode
    toggleMode: () => void
}

const LandingContent = ({ mode, toggleMode }: LandingContentProps) => {
    const t = useLandingTheme()

    return (
        <main
            className="overflow-x-hidden w-full min-h-screen transition-colors duration-300"
            style={{
                backgroundColor: t.bg,
                color: t.text,
                fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            <LandingNavSentinel />
            <NavigationBar mode={mode} toggleMode={toggleMode} />
            <RealSalesHero />
            {/* Reserve space for the hero's absolutely positioned demo video card */}
            <div
                className="mx-auto w-[94vw] max-w-[1700px] aspect-video mb-12 sm:mb-16"
                aria-hidden
            />
            <FeatureGrid />
            <VideoSection />
            <DashboardSection />
            <SocialProof />
            <PricingSection />
            <FAQSection />
            <FinalCTA />
            <LandingFooter />
        </main>
    )
}

const Landing = () => {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const dispatch = useAppDispatch()

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    useEffect(() => {
        dispatch(setSchema('green'))
    }, [dispatch])

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches
        if (prefersReducedMotion) return

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
        })

        setLenis(lenis)

        let rafId = 0
        const raf = (time: number) => {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }
        rafId = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(rafId)
            setLenis(null)
            lenis.destroy()
        }
    }, [])

    return (
        <LandingThemeProvider mode={mode}>
            <LandingContent mode={mode} toggleMode={toggleMode} />
        </LandingThemeProvider>
    )
}

export default Landing
