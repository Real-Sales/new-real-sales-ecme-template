import RealSalesHero from './components/RealSalesHero'
import NavigationBar from './components/NavigationBar'
import FeatureGrid from './components/FeatureGrid'
import VideoSection from './components/VideoSection'
import DashboardSection from './components/DashboardSection'
import SocialProof from './components/SocialProof'
import PricingSection from './components/PricingSection'
import FAQSection from './components/FAQSection'
import FinalCTA from './components/FinalCTA'
import LandingFooter from './components/LandingFooter'
import { MODE_DARK } from '@/constants/theme.constant'

const Landing = () => {
    return (
        <main
            className="overflow-x-hidden w-full"
            style={{
                backgroundColor: '#050505',
                color: '#F5F5F5',
                fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            <NavigationBar mode={MODE_DARK} />
            <RealSalesHero mode={MODE_DARK} />
            <FeatureGrid mode={MODE_DARK} />
            <VideoSection mode={MODE_DARK} />
            <DashboardSection />
            <SocialProof mode={MODE_DARK} />
            <PricingSection />
            <FAQSection />
            <FinalCTA mode={MODE_DARK} />
            <LandingFooter mode={MODE_DARK} />
        </main>
    )
}

export default Landing
