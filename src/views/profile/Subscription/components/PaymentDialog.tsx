import { useState } from 'react'
import axios from 'axios'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Segment from '@/components/ui/Segment'
import Alert from '@/components/ui/Alert'
import classNames from '@/utils/classNames'
import sleep from '@/utils/sleep'
import { useAppSelector, useAppDispatch } from '@/store/hook'
import { setPaymentDialog, setSelectedPlan } from '../store/subscriptionSlice'
import { TbCheck, TbMail } from 'react-icons/tb'
import { NumericFormat } from 'react-number-format'
import { useNavigate } from 'react-router-dom'
import type { PaymentCycle } from '../types'
import { loadRazorpayScript } from '@/utils/loadRazorpayScript'
import {
    RAZORPAY_PROVIDER,
    apiCreatePayment,
    apiCreateRazorpayOrder,
    apiUpdatePayment,
    apiVerifyRazorpayPayment,
    inrPaiseToMajorUnits,
    toRazorpayAmountPaise,
} from '@/services/PaymentService'
import { apiCreateUserSubscription } from '@/services/SubscriptionService'

function normalizeRazorpayKeyId(raw: string) {
    return raw.trim().replace(/^["']+|["']+$/g, '')
}

function withRazorpayAuthHint(message: string) {
    if (!/auth/i.test(message)) {
        return message
    }
    return `${message} Use the same Razorpay Key Id as your backend (set RAZORPAY_KEY_ID in .env, or return key_id from create-order). Test/live mode must match the order.`
}

function checkoutPrefillName(state: {
    firstName?: string
    lastName?: string
    userName?: string
}) {
    const full = [state.firstName, state.lastName].filter(Boolean).join(' ').trim()
    if (full) {
        return full
    }
    return state.userName?.trim() || undefined
}

function getErrorMessage(err: unknown, fallback: string) {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as Record<string, unknown> | string | undefined
        if (typeof data === 'string' && data.trim()) {
            return data
        }
        if (data && typeof data === 'object') {
            if (typeof data.detail === 'string') {
                return data.detail
            }
            if (Array.isArray(data.detail) && data.detail[0]) {
                const first = data.detail[0] as { msg?: string }
                if (typeof first?.msg === 'string') {
                    return first.msg
                }
            }
            if (typeof data.message === 'string') {
                return data.message
            }
            if (typeof data.error === 'string') {
                return data.error
            }
        }
        if (err.message) {
            return err.message
        }
    }
    if (err instanceof Error && err.message) {
        return err.message
    }
    return fallback
}

const PaymentDialog = () => {
    const [loading, setLoading] = useState(false)
    const [paymentSuccessful, setPaymentSuccessful] = useState(false)
    const [payError, setPayError] = useState<string | null>(null)

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const paymentDialog = useAppSelector((state) => state.subscription.paymentDialog)
    const selectedPlan = useAppSelector((state) => state.subscription.selectedPlan)
    const userEmail = useAppSelector((state) => state.auth.user.email)
    const userId = useAppSelector((state) => state.auth.user.userId?.trim() ?? '')
    const userFirstName = useAppSelector((state) => state.auth.user.firstName)
    const userLastName = useAppSelector((state) => state.auth.user.lastName)
    const userName = useAppSelector((state) => state.auth.user.userName)
    const userPhone = useAppSelector((state) => state.auth.user.phoneNumber)

    const handleDialogClose = async () => {
        dispatch(setPaymentDialog(false))
        await sleep(200)
        dispatch(setSelectedPlan({}))
        setPaymentSuccessful(false)
        setPayError(null)
    }

    const handlePaymentChange = (paymentCycle: PaymentCycle) => {
        dispatch(
            setSelectedPlan({
                ...selectedPlan,
                paymentCycle,
            }),
        )
    }

    const handlePay = async () => {
        setPayError(null)

        const envKey = normalizeRazorpayKeyId(
            String(import.meta.env.RAZORPAY_KEY_ID ?? ''),
        )
        if (!envKey) {
            setPayError(
                'Razorpay is not configured. Add RAZORPAY_KEY_ID to your .env (same value your API uses).',
            )
            return
        }

        const planType = selectedPlan.planType?.trim().toLowerCase()
        const subscriptionId = selectedPlan.subscriptionId?.trim() ?? ''
        if (!subscriptionId) {
            setPayError('Missing subscription. Please choose a plan again.')
            return
        }
        if (!userId) {
            setPayError('You must be signed in to pay.')
            return
        }

        const billing_cycle: 'monthly' | 'yearly' =
            selectedPlan.paymentCycle === 'annually' ? 'yearly' : 'monthly'

        const cycleKey = selectedPlan.paymentCycle as PaymentCycle
        const priceMajor = Number(selectedPlan.price?.[cycleKey] ?? 0)
        const amountFromPlan = toRazorpayAmountPaise(priceMajor)

        setLoading(true)
        try {
            await loadRazorpayScript()

            const amountPaise = amountFromPlan
            if (!amountPaise || amountPaise < 100) {
                setPayError(
                    'This plan has no payable amount (Razorpay requires at least 100 paise).',
                )
                setLoading(false)
                return
            }

            const order = await apiCreateRazorpayOrder({
                amount: amountPaise,
                currency: 'INR',
                receipt: `rs_${Date.now()}`.slice(0, 40),
            })

            const RazorpayCtor = window.Razorpay
            if (!RazorpayCtor) {
                throw new Error('Razorpay checkout failed to load')
            }

            const payAmount = toRazorpayAmountPaise(
                Number(order.amount ?? amountPaise),
            )
            const currency = order.currency || 'INR'

            const checkoutKey = normalizeRazorpayKeyId(
                String(order.key_id ?? order.keyId ?? envKey),
            )
            if (!checkoutKey.startsWith('rzp_')) {
                setPayError(
                    'Invalid Razorpay Key Id. Expected a value starting with rzp_ (from RAZORPAY_KEY_ID or create-order key_id).',
                )
                setLoading(false)
                return
            }

            const prefillName = checkoutPrefillName({
                firstName: userFirstName,
                lastName: userLastName,
                userName,
            })
            const checkoutLogo = import.meta.env.VITE_RAZORPAY_CHECKOUT_LOGO_URL as
                | string
                | undefined

            const rzp = new RazorpayCtor({
                key: checkoutKey,
                amount: String(payAmount),
                currency,
                order_id: order.order_id,
                name: 'RealSales',
                description: `${selectedPlan.planName ?? planType ?? 'Plan'} (${billing_cycle})`,
                ...(checkoutLogo?.trim()
                    ? { image: checkoutLogo.trim() }
                    : {}),
                prefill: {
                    name: prefillName,
                    email: userEmail?.trim() || undefined,
                    contact: userPhone?.trim() || undefined,
                },
                notes: {
                    subscription_id: subscriptionId,
                    user_id: userId,
                    plan: selectedPlan.planName ?? planType ?? '',
                },
                theme: { color: '#3399cc' },
                modal: {
                    ondismiss: () => {
                        setLoading(false)
                    },
                },
                handler: async (response) => {
                    try {
                        const verified = await apiVerifyRazorpayPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        })
                        if (verified.success !== true) {
                            throw new Error('Payment verification did not succeed.')
                        }

                        const amountMajor =
                            currency === 'INR'
                                ? inrPaiseToMajorUnits(payAmount)
                                : payAmount / 100

                        const created = await apiCreatePayment({
                            subscription_id: subscriptionId,
                            user_id: userId,
                            amount: amountMajor,
                            currency,
                            payment_method: 'razorpay',
                            provider: RAZORPAY_PROVIDER,
                            external_payment_id: response.razorpay_payment_id,
                        })

                        const paymentRowId = String(
                            created.payment_id ?? created.paymentId ?? '',
                        )
                        if (!paymentRowId) {
                            throw new Error(
                                'Missing payment_id from create-payment; cannot finalize payment.',
                            )
                        }

                        await apiUpdatePayment(paymentRowId, {
                            payment_status: 'paid',
                            external_payment_id: response.razorpay_payment_id,
                        })

                        await apiCreateUserSubscription({
                            user_id: userId,
                            subscription_id: subscriptionId,
                        })

                        setPaymentSuccessful(true)
                    } catch (verifyErr) {
                        setPayError(
                            getErrorMessage(
                                verifyErr,
                                'Payment could not be verified or your plan could not be activated. Contact support if you were charged.',
                            ),
                        )
                    } finally {
                        setLoading(false)
                    }
                },
            })

            rzp.on('payment.failed', (res) => {
                setLoading(false)
                const meta = res.error?.metadata
                const detail =
                    res.error?.description ||
                    res.error?.reason ||
                    [res.error?.code, meta?.order_id, meta?.payment_id]
                        .filter(Boolean)
                        .join(' · ') ||
                    'Payment failed. Try again or use another method.'
                setPayError(withRazorpayAuthHint(detail))
            })

            rzp.open()
        } catch (err) {
            setPayError(
                getErrorMessage(err, 'Could not start payment. Please try again.'),
            )
            setLoading(false)
        }
    }

    const handleManageSubscription = async () => {
        navigate('/profile/settings')
        await handleDialogClose()
    }

    return (
        <Dialog
            isOpen={paymentDialog}
            closable={!paymentSuccessful}
            onClose={handleDialogClose}
            onRequestClose={handleDialogClose}
        >
            {paymentSuccessful ? (
                <>
                    <div className="text-center mt-6 mb-2">
                        <div className="inline-flex rounded-full p-5 bg-success">
                            <TbCheck className="text-5xl text-white" />
                        </div>
                        <div className="mt-6">
                            <h4>Thank you for your purchase!</h4>
                            <p className="text-base max-w-[400px] mx-auto mt-4 leading-relaxed">
                                We&apos;ve received your order and are
                                processing it now. You&apos;ll get an email with
                                your order details soon
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-8">
                            <Button block onClick={handleManageSubscription}>
                                Manage subscription
                            </Button>
                            <Button
                                block
                                variant="solid"
                                onClick={handleDialogClose}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h4>{selectedPlan.planName} plan</h4>
                    <div className="mt-6">
                        <Segment
                            defaultValue={selectedPlan.paymentCycle}
                            className="gap-4 flex bg-transparent"
                            onChange={(value) =>
                                handlePaymentChange(value as PaymentCycle)
                            }
                        >
                            {Object.entries(selectedPlan.price || {}).map(
                                ([key, value]) => (
                                    <Segment.Item key={key} value={key}>
                                        {({ active, onSegmentItemClick }) => {
                                            return (
                                                <div
                                                    className={classNames(
                                                        'flex justify-between border rounded-xl border-gray-300 dark:border-gray-600 py-5 px-4 select-none ring-1 w-1/2',
                                                        active
                                                            ? 'ring-primary border-primary'
                                                            : 'ring-transparent bg-gray-100 dark:bg-gray-600',
                                                    )}
                                                    role="button"
                                                    onClick={onSegmentItemClick}
                                                >
                                                    <div>
                                                        <div className="heading-text mb-0.5">
                                                            Pay{' '}
                                                            {key === 'monthly'
                                                                ? 'monthly'
                                                                : 'annually'}
                                                        </div>
                                                        <span className="text-lg font-bold heading-text flex gap-0.5">
                                                            <NumericFormat
                                                                thousandSeparator
                                                                displayType="text"
                                                                prefix="$"
                                                                value={value}
                                                            />
                                                            <span>{'/'}</span>
                                                            <span>
                                                                {key ===
                                                                'monthly'
                                                                    ? 'month'
                                                                    : 'year'}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    {active && (
                                                        <TbCheck className="text-primary text-xl" />
                                                    )}
                                                </div>
                                            )
                                        }}
                                    </Segment.Item>
                                ),
                            )}
                        </Segment>
                    </div>
                    <div className="mt-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center justify-between p-4">
                            <div className="w-full">
                                <span>Billing email (Razorpay prefill)</span>
                                <div className="flex items-center gap-2 mt-2">
                                    <TbMail className="text-2xl shrink-0" />
                                    <span className="heading-text text-sm">
                                        {userEmail || 'Add email in your profile to prefill checkout.'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {payError && (
                        <Alert showIcon className="mt-4" type="danger">
                            {payError}
                        </Alert>
                    )}
                    <div className="mt-6 flex flex-col items-end">
                        <h4>
                            <span>Bill now: </span>
                            <span>
                                <NumericFormat
                                    thousandSeparator
                                    displayType="text"
                                    prefix="$"
                                    value={
                                        selectedPlan.price?.[
                                            selectedPlan.paymentCycle as PaymentCycle
                                        ]
                                    }
                                />
                            </span>
                        </h4>
                        <div className="max-w-[350px] ltr:text-right rtl:text-left leading-none mt-2 opacity-80">
                            <small>
                                You will complete payment in a secure Razorpay
                                window. By paying, you agree to the plan billing
                                terms.
                            </small>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Button
                            block
                            id="rzp-open-checkout"
                            variant="solid"
                            loading={loading}
                            onClick={handlePay}
                        >
                            Pay with Razorpay
                        </Button>
                    </div>
                </>
            )}
        </Dialog>
    )
}

export default PaymentDialog
