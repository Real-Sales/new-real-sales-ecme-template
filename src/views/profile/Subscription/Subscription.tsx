import { useCallback, useEffect } from 'react'
import axios from 'axios'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import CurrentPlanUsage from './components/CurrentPlanUsage'
import Plans from './components/Plans'
import PaymentCycleToggle from './components/PaymentCycleToggle'
import Faq from './components/Faq'
import PaymentDialog from './components/PaymentDialog'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { apiGetMySubscription } from '@/services/SubscriptionService'
import { apiConfirmPayment } from '@/services/PaymentService'
import {
    billingCycleFromPaymentCycle,
    fetchMySubscription,
    fetchSubscriptionPlans,
    setActiveUserSubscription,
} from './store/subscriptionSlice'

const Subscription = () => {
    const dispatch = useAppDispatch()
    const userId = useAppSelector((state) => state.auth.user.userId?.trim() ?? '')
    const paymentCycle = useAppSelector((state) => state.subscription.paymentCycle)
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
    const subscriptionPlans = useAppSelector(
        (state) => state.subscription.subscriptionPlans,
    )
    const plansLoading = useAppSelector((state) => state.subscription.plansLoading)
    const plansError = useAppSelector((state) => state.subscription.plansError)

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
        void loadUserSubscription()
    }, [loadUserSubscription])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const paymentIntentId = params.get('payment_intent')
        const redirectStatus = params.get('redirect_status')
        if (!paymentIntentId || redirectStatus !== 'succeeded') {
            return
        }

        let cancelled = false
        const finalizeRedirect = async () => {
            try {
                await apiConfirmPayment(paymentIntentId)
                if (!cancelled) {
                    await loadUserSubscription()
                }
            } finally {
                if (!cancelled) {
                    const cleanUrl = window.location.pathname
                    window.history.replaceState({}, '', cleanUrl)
                }
            }
        }

        void finalizeRedirect()
        return () => {
            cancelled = true
        }
    }, [loadUserSubscription])

    useEffect(() => {
        dispatch(fetchSubscriptionPlans(billingCycleFromPaymentCycle(paymentCycle)))
    }, [dispatch, paymentCycle])

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
                    subscriptions={subscriptionPlans}
                />
            </Card>
            <Faq />
            <PaymentDialog onPaymentSuccess={loadUserSubscription} />
        </>
    )
}

export default Subscription
