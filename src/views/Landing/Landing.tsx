import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import SalesWanaHero from './components/SalesWanaHero'
import NavigationBar from './components/NavigationBar'
import LandingNavSentinel from './components/LandingNavSentinel'
import ProductTour from './components/ProductTour'
import FeatureGrid from './components/FeatureGrid'
import VideoSection from './components/VideoSection'
import DashboardSection from './components/DashboardSection'
import SocialProof from './components/SocialProof'
import PricingSection from './components/PricingSection'
import FAQSection, { landingFaqs } from './components/FAQSection'
import FinalCTA from './components/FinalCTA'
import LandingFooter from './components/LandingFooter'
import IndustriesTeaser from './components/IndustriesTeaser'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { LandingThemeProvider } from './LandingThemeProvider'
import { useLandingTheme } from './LandingThemeProvider'
import { useAppDispatch } from '@/store'
import { setSchema } from '@/store/slices/theme/themeSlice'
import { getLandingNavScrollOffset, scrollToLandingSection, setLenis } from './smoothScroll'
import Seo from '@/components/shared/Seo'
import ShaderArt from '@/components/ui/shader-art'
import {
    faqPageJsonLd,
    organizationJsonLd,
    seoPages,
    softwareApplicationJsonLd,
    websiteJsonLd,
} from '@/configs/seo.config'
import type { Mode } from '@/@types/theme'

type LandingContentProps = {
    mode: Mode
    toggleMode: () => void
}

const LandingContent = ({ mode, toggleMode }: LandingContentProps) => {
    const t = useLandingTheme()

    return (
        <main
            className="relative isolate overflow-x-clip w-full min-h-screen transition-colors duration-300"
            style={{
                backgroundColor: t.bg,
                color: t.text,
                fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            {/* Living backdrop for the whole page: fixed to the viewport, behind every section */}
            <ShaderArt
                className="pointer-events-none fixed inset-0 -z-10"
                colors={{ base: t.bg, accent: t.accent, ink: t.text }}
                intensity={t.isLight ? 0.45 : 0.32}
                speed={0.6}
                scale={1.4}
                interactive={false}
            />
            <LandingNavSentinel />
            <NavigationBar mode={mode} toggleMode={toggleMode} />
            <SalesWanaHero />
            <ProductTour />
            <FeatureGrid />
            <VideoSection />
            <IndustriesTeaser />
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
    const location = useLocation()

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    useEffect(() => {
        dispatch(setSchema('green'))
    }, [dispatch])

    useEffect(() => {
        const padding = `${getLandingNavScrollOffset()}px`
        document.documentElement.style.scrollPaddingTop = padding
        return () => {
            document.documentElement.style.scrollPaddingTop = ''
        }
    }, [])

    useEffect(() => {
        if (!location.hash) return

        const id = location.hash.slice(1)
        const scrollToHash = () => {
            const el = document.getElementById(id)
            if (el) scrollToLandingSection(el)
        }

        const timer = window.setTimeout(scrollToHash, 150)
        return () => window.clearTimeout(timer)
    }, [location.pathname, location.hash])

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches
        // Touch screens already scroll smoothly; Lenis there only adds per-frame scroll reads
        const isTouch = window.matchMedia('(pointer: coarse)').matches
        if (prefersReducedMotion || isTouch) return

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

    const pageSeo =
        location.pathname === '/' ? seoPages.home : seoPages.landing

    return (
        <LandingThemeProvider mode={mode}>
            <Seo
                {...pageSeo}
                jsonLd={[
                    organizationJsonLd(),
                    websiteJsonLd(),
                    softwareApplicationJsonLd(),
                    faqPageJsonLd(landingFaqs),
                ]}
            />
            <LandingContent mode={mode} toggleMode={toggleMode} />
        </LandingThemeProvider>
    )
}

export default Landing
