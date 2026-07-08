import { useEffect, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Avatar from '@/components/ui/Avatar'
import Spinner from '@/components/ui/Spinner'
import Alert from '@/components/ui/Alert'
import BillingHistory from './BillingHistory'
import { useAppSelector, useAppDispatch } from '@/store/hook'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { PiLightningFill } from 'react-icons/pi'
import { NumericFormat } from 'react-number-format'
import { fetchMySubscription } from '@/views/profile/Subscription/store/subscriptionSlice'
import { apiGetPaymentsByUser, type PaymentRecord } from '@/services/PaymentService'
import { planDisplayTitle } from '@/views/profile/Subscription/planFeatures'

function parseAmount(value: number | string | undefined) {
    const n = typeof value === 'string' ? parseFloat(value) : Number(value)
    return Number.isFinite(n) ? n : 0
}

function mapPaymentToBill(payment: PaymentRecord) {
    const planLabel = payment.plan_type
        ? `${payment.plan_type}${payment.billing_cycle ? ` (${payment.billing_cycle})` : ''}`
        : 'Subscription payment'

    return {
        id: payment.payment_id,
        item: planLabel,
        status: payment.payment_status?.toLowerCase() ?? 'pending',
        amount: parseAmount(payment.amount),
        date: payment.created_at
            ? dayjs(payment.created_at).unix()
            : dayjs().unix(),
    }
}

const SettingsBilling = () => {
    const navigate = useNavigate()
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
    const userSubError = useAppSelector(
        (state) => state.subscription.userSubscriptionError,
    )

    const [paymentsLoading, setPaymentsLoading] = useState(false)
    const [paymentsError, setPaymentsError] = useState<string | null>(null)
    const [payments, setPayments] = useState<PaymentRecord[]>([])

    useEffect(() => {
        if (!userId) {
            return
        }
        if (!userSubInitialized && !userSubLoading) {
            dispatch(fetchMySubscription())
        }
    }, [dispatch, userId, userSubInitialized, userSubLoading])

    useEffect(() => {
        if (!userId) {
            return
        }

        let cancelled = false
        const loadPayments = async () => {
            setPaymentsLoading(true)
            setPaymentsError(null)
            try {
                const data = await apiGetPaymentsByUser(userId)
                if (!cancelled) {
                    setPayments(Array.isArray(data) ? data : [])
                }
            } catch {
                if (!cancelled) {
                    setPaymentsError('Unable to load payment history.')
                    setPayments([])
                }
            } finally {
                if (!cancelled) {
                    setPaymentsLoading(false)
                }
            }
        }

        void loadPayments()
        return () => {
            cancelled = true
        }
    }, [userId])

    const transactionHistory = useMemo(
        () => payments.map(mapPaymentToBill),
        [payments],
    )

    const handleChangePlan = () => {
        navigate('/subscription')
    }

    const subscription = activeUserSubscription?.subscription
    const billingCycle = subscription?.billing_cycle === 'yearly' ? 'yearly' : 'monthly'
    const amount =
        subscription?.billing_cycle === 'yearly'
            ? parseAmount(subscription?.yearly_price ?? '0')
            : parseAmount(subscription?.monthly_price ?? '0')
    const nextBillingDate = activeUserSubscription?.end_date
        ? dayjs(activeUserSubscription.end_date).format('MM/DD/YYYY')
        : '—'

    return (
        <div>
            <h4 className="mb-4">Billing</h4>

            {!userId ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sign in to view billing details.
                </p>
            ) : userSubLoading && !userSubInitialized ? (
                <div className="flex justify-center py-10">
                    <Spinner size={28} />
                </div>
            ) : userSubError ? (
                <Alert showIcon type="danger" className="mb-6">
                    {userSubError}
                </Alert>
            ) : !activeUserSubscription || !subscription ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        No active subscription is linked to your account.
                    </p>
                    <Button size="sm" variant="solid" onClick={handleChangePlan}>
                        Choose a plan
                    </Button>
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Avatar
                                className="bg-emerald-500"
                                shape="circle"
                                icon={<PiLightningFill />}
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h6 className="font-bold">
                                        {planDisplayTitle(subscription)}
                                    </h6>
                                    <Tag className="bg-success-subtle text-success rounded-md border-0">
                                        <span className="capitalize">
                                            {activeUserSubscription.status_active
                                                ? 'active'
                                                : 'inactive'}
                                        </span>
                                    </Tag>
                                </div>
                                <div className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                                    <span>Billing {billingCycle}</span>
                                    <span> | </span>
                                    <span>Next payment on {nextBillingDate}</span>
                                    <span>
                                        <span className="mx-1">for</span>
                                        <NumericFormat
                                            className="font-bold heading-text"
                                            displayType="text"
                                            value={amount.toFixed(2)}
                                            prefix="$"
                                            thousandSeparator
                                        />
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {activeUserSubscription.credits_used} /{' '}
                                    {activeUserSubscription.credits_allocated} sessions used
                                </p>
                            </div>
                        </div>
                        <div className="flex">
                            <Button
                                size="sm"
                                variant="solid"
                                className="rounded-md"
                                onClick={handleChangePlan}
                            >
                                Change plan
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8">
                <h5>Transaction history</h5>
                {paymentsLoading ? (
                    <div className="flex justify-center py-10">
                        <Spinner size={24} />
                    </div>
                ) : paymentsError ? (
                    <Alert showIcon type="danger" className="mt-4">
                        {paymentsError}
                    </Alert>
                ) : transactionHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        No transactions yet.
                    </p>
                ) : (
                    <BillingHistory className="mt-4" data={transactionHistory} />
                )}
            </div>
        </div>
    )
}

export default SettingsBilling
