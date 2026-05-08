import RealSalesHero from './components/RealSalesHero'
import NavigationBar from './components/NavigationBar'
import VideoSection from './components/VideoSection'
import FeatureGrid from './components/FeatureGrid'
import SocialProof from './components/SocialProof'
import FinalCTA from './components/FinalCTA'
import LandingFooter from './components/LandingFooter'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'

const Landing = () => {
    const [isDark] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT

    return (
        <main className="px-4 lg:px-0 text-base">
            <NavigationBar mode={mode} />
            <RealSalesHero mode={mode} />
            <VideoSection mode={mode} />
            <FeatureGrid mode={mode} />
            <SocialProof mode={mode} />
            <FinalCTA mode={mode} />
            <LandingFooter mode={mode} />
        </main>
    )
}

export default Landing