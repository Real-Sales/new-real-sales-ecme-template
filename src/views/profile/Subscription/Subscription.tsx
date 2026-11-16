import { useCallback, useEffect } from 'react'
import { SURFACE_CARD_CLASSNAME } from '@/constants/surfaceCard.constant'
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
    canPurchaseSubscription,
    isCompanyCreditPool,
} from '@/services/SubscriptionService'
import {
    billingCycleFromPaymentCycle,
    fetchMySubscription,
    fetchSubscriptionPlans,
    setActiveUserSubscription,
} from './store/subscriptionSlice'

const Subscription = () => {
    const dispatch = useAppDispatch()
    const userId = useAppSelector((state) => state.auth.user.userId?.trim() ?? '')
    const userRole = useAppSelector((state) => state.auth.user.role)
    const companyId = useAppSelector((state) => state.auth.user.companyId)
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

    const canPurchase = canPurchaseSubscription({
        role: userRole,
        companyId,
        pool: activeUserSubscription,
    })
    const isCompanyPool = isCompanyCreditPool(activeUserSubscription)

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
            <Card className={`mb-4 ${SURFACE_CARD_CLASSNAME}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <h3>Subscription Plans</h3>
                    {canPurchase && <PaymentCycleToggle />}
                </div>
                {!canPurchase && isCompanyPool && (
                    <Alert showIcon className="mb-6" type="info">
                        Shared company credits. Ask your company owner to upgrade the
                        plan for everyone.
                    </Alert>
                )}
                {plansError && (
                    <Alert showIcon className="mb-6" type="danger">
                        {plansError}
                    </Alert>
                )}
                <Plans
                    canPurchase={canPurchase}
                    currentUserSubscription={activeUserSubscription}
                    loading={plansLoading}
                    subscriptions={subscriptionPlans}
                />
            </Card>
            <Faq />
            {canPurchase && <PaymentDialog onPaymentSuccess={loadUserSubscription} />}
        </>
    )
}

export default Subscription
