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
            <Card className="mb-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
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
