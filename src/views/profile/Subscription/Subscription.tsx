import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import CurrentPlanUsage from './components/CurrentPlanUsage'
import Plans from './components/Plans'
import PaymentCycleToggle from './components/PaymentCycleToggle'
import Faq from './components/Faq'
import PaymentDialog from './components/PaymentDialog'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import {
    apiGetMySubscription,
    apiGetSubscriptions,
    type ApiSubscription,
} from '@/services/SubscriptionService'
import { fetchMySubscription, setActiveUserSubscription } from './store/subscriptionSlice'

const Subscription = () => {
    const dispatch = useAppDispatch()
    const userId = useAppSelector((state) => state.auth.user.userId?.trim() ?? '')
    const activeUserSubscription = useAppSelector(
        (state) => state.subscription.activeUserSubscription,
    )
    const userSubLoading = useAppSelector(
        (state) => state.subscription.userSubscriptionLoading,
    )
    const userSubInitialized = useAppSelector(
        (state) => state.subscription.userSubscriptionInitialized,
    )
    const userSubError = useAppSelector((state) => state.subscription.userSubscriptionError)

    const [subscriptions, setSubscriptions] = useState<ApiSubscription[]>([])
    const [plansLoading, setPlansLoading] = useState(true)
    const [plansError, setPlansError] = useState<string | null>(null)

    const loadPlans = useCallback(async () => {
        setPlansLoading(true)
        setPlansError(null)

        try {
            const data = await apiGetSubscriptions()
            setSubscriptions(Array.isArray(data) ? data : [])
        } catch {
            setPlansError('Unable to load subscription plans. Please try again.')
            setSubscriptions([])
        } finally {
            setPlansLoading(false)
        }
    }, [])

    const loadUserSubscription = useCallback(async () => {
        if (!userId) {
            return
        }

        if (!userSubInitialized) {
            await dispatch(fetchMySubscription())
            return
        }

        try {
            const sub = await apiGetMySubscription()
            dispatch(setActiveUserSubscription(sub))
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                dispatch(setActiveUserSubscription(null))
            }
        }
    }, [dispatch, userId, userSubInitialized])

    useEffect(() => {
        void loadPlans()
    }, [loadPlans])

    useEffect(() => {
        void loadUserSubscription()
    }, [loadUserSubscription])

    return (
        <>
            <CurrentPlanUsage
                activeUserSubscription={activeUserSubscription}
                error={userSubError}
                hasUserId={!!userId}
                loading={userSubLoading}
            />
            <Card className="mb-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <h3>Subscription Plans</h3>
                    <PaymentCycleToggle />
                </div>
                {plansError && (
                    <Alert showIcon className="mb-6" type="danger">
                        {plansError}
                    </Alert>
                )}
                <Plans
                    currentUserSubscription={activeUserSubscription}
                    loading={plansLoading}
                    subscriptions={subscriptions}
                />
            </Card>
            <Faq />
            <PaymentDialog />
        </>
    )
}

export default Subscription
