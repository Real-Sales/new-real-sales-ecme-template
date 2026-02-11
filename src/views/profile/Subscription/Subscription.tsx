import Card from '@/components/ui/Card'
import CurrentPlanUsage from './components/CurrentPlanUsage'
import Plans from './components/Plans'
import PaymentCycleToggle from './components/PaymentCycleToggle'
import Faq from './components/Faq'
import PaymentDialog from './components/PaymentDialog'

const Subscription = () => {
    return (
        <>
            <CurrentPlanUsage />
            <Card className="mb-4">
                <div className="flex items-center justify-between mb-8">
                    <h3>Subscription Plans</h3>
                    <PaymentCycleToggle />
                </div>
                <Plans />
            </Card>
            <Faq />
            <PaymentDialog />
        </>
    )
}

export default Subscription
