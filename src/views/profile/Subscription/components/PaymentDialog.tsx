import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Alert from '@/components/ui/Alert'
import sleep from '@/utils/sleep'
import { useAppSelector, useAppDispatch } from '@/store/hook'
import { setPaymentDialog, setSelectedPlan } from '../store/subscriptionSlice'
import { TbCheck } from 'react-icons/tb'
import { NumericFormat } from 'react-number-format'
import { useNavigate } from 'react-router-dom'
import type { PaymentCycle } from '../types'
import { loadStripeScript } from '@/utils/loadStripeScript'
import {
    apiConfirmPayment,
    apiCreatePaymentIntent,
} from '@/services/PaymentService'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

type PaymentDialogProps = {
    onPaymentSuccess?: () => void | Promise<void>
}

function normalizeStripeKey(raw: string) {
    return raw.trim().replace(/^["']+|["']+$/g, '')
}

const PaymentDialog = ({ onPaymentSuccess }: PaymentDialogProps) => {
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(false)
    const [paymentSuccessful, setPaymentSuccessful] = useState(false)
    const [payError, setPayError] = useState<string | null>(null)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

    const paymentElementRef = useRef<HTMLDivElement>(null)
    const stripeElementsRef = useRef<StripeElements | null>(null)
    const stripeInstanceRef = useRef<StripeInstance | null>(null)
    const mountedPaymentElementRef = useRef<StripePaymentElement | null>(null)

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const paymentDialog = useAppSelector((state) => state.subscription.paymentDialog)
    const selectedPlan = useAppSelector((state) => state.subscription.selectedPlan)

    const cleanupStripe = useCallback(() => {
        mountedPaymentElementRef.current?.destroy()
        mountedPaymentElementRef.current = null
        stripeElementsRef.current = null
        stripeInstanceRef.current = null
        setClientSecret(null)
        setPaymentIntentId(null)
    }, [])

    const handleDialogClose = async () => {
        dispatch(setPaymentDialog(false))
        cleanupStripe()
        await sleep(200)
        dispatch(setSelectedPlan({}))
        setPaymentSuccessful(false)
        setPayError(null)
        setLoading(false)
        setInitializing(false)
    }

    const selectedAmount =
        selectedPlan.price?.[selectedPlan.paymentCycle as PaymentCycle] ?? 0

    useEffect(() => {
        if (!paymentDialog || paymentSuccessful) {
            return
        }

        const planType = selectedPlan.planType?.trim().toLowerCase()
        if (!planType) {
            return
        }

        const billing_cycle: 'monthly' | 'yearly' =
            selectedPlan.paymentCycle === 'annually' ? 'yearly' : 'monthly'

        if (selectedAmount <= 0) {
            return
        }

        const stripeKey = normalizeStripeKey(
            String(import.meta.env.STRIPE_PUBLISHABLE_KEY ?? ''),
        )
        if (!stripeKey) {
            setPayError(
                'Stripe is not configured. Add STRIPE_PUBLISHABLE_KEY to your .env.',
            )
            return
        }

        let cancelled = false

        const initPayment = async () => {
            setInitializing(true)
            setPayError(null)
            cleanupStripe()

            try {
                const intent = await apiCreatePaymentIntent({
                    plan_type: planType,
                    billing_cycle,
                })
                if (cancelled) {
                    return
                }

                setClientSecret(intent.client_secret)
                setPaymentIntentId(intent.payment_intent_id)

                await loadStripeScript()
                if (cancelled || !paymentElementRef.current) {
                    return
                }

                const stripeFactory = window.Stripe
                if (!stripeFactory) {
                    throw new Error('Stripe.js failed to load')
                }

                const stripe = stripeFactory(stripeKey)
                const elements = stripe.elements({
                    clientSecret: intent.client_secret,
                })
                const paymentElement = elements.create('payment')
                paymentElement.mount(paymentElementRef.current)

                stripeInstanceRef.current = stripe
                stripeElementsRef.current = elements
                mountedPaymentElementRef.current = paymentElement
            } catch (error) {
                if (!cancelled) {
                    setPayError(
                        getApiErrorMessage(error, 'Could not start payment. Please try again.'),
                    )
                }
            } finally {
                if (!cancelled) {
                    setInitializing(false)
                }
            }
        }

        void initPayment()

        return () => {
            cancelled = true
            cleanupStripe()
        }
    }, [
        cleanupStripe,
        paymentDialog,
        paymentSuccessful,
        selectedAmount,
        selectedPlan.paymentCycle,
        selectedPlan.planType,
    ])

    const handlePay = async () => {
        setPayError(null)

        if (selectedAmount <= 0) {
            setPayError('This plan does not require payment.')
            return
        }

        if (!stripeInstanceRef.current || !stripeElementsRef.current || !paymentIntentId) {
            setPayError('Payment form is not ready yet. Please wait a moment.')
            return
        }

        setLoading(true)
        try {
            const { error } = await stripeInstanceRef.current.confirmPayment({
                elements: stripeElementsRef.current,
                confirmParams: {
                    return_url: window.location.href,
                },
                redirect: 'if_required',
            })

            if (error) {
                setPayError(error.message ?? 'Payment could not be completed.')
                return
            }

            const confirm = await apiConfirmPayment(paymentIntentId)
            if (confirm.status !== 'success' && confirm.status !== 'duplicate') {
                setPayError('Payment confirmation failed. Please contact support.')
                return
            }

            await onPaymentSuccess?.()
            setPaymentSuccessful(true)
        } catch (error) {
            setPayError(getApiErrorMessage(error, 'Payment could not be completed.'))
        } finally {
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
                <div className="text-center mt-6 mb-2">
                    <div className="inline-flex rounded-full p-5 bg-success">
                        <TbCheck className="text-5xl text-white" />
                    </div>
                    <div className="mt-6">
                        <h4>Thank you for your purchase!</h4>
                        <p className="text-base max-w-[400px] mx-auto mt-4 leading-relaxed">
                            Your subscription has been updated. You can manage billing
                            from your profile settings.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-8">
                        <Button block onClick={handleManageSubscription}>
                            Manage subscription
                        </Button>
                        <Button block variant="solid" onClick={handleDialogClose}>
                            Close
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <h4>{selectedPlan.planName} plan</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Billed{' '}
                        {selectedPlan.paymentCycle === 'annually' ? 'yearly' : 'monthly'}
                    </p>

                    {selectedAmount <= 0 ? (
                        <Alert showIcon className="mt-4" type="info">
                            This plan is free and does not require payment.
                        </Alert>
                    ) : (
                        <div
                            ref={paymentElementRef}
                            className="mt-6 min-h-[120px] rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                        />
                    )}

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
                                    fixedDecimalScale
                                    decimalScale={2}
                                    value={selectedAmount}
                                />
                            </span>
                        </h4>
                        <div className="max-w-[350px] ltr:text-right rtl:text-left leading-none mt-2 opacity-80">
                            <small>
                                Complete payment securely with Stripe. By paying, you
                                agree to the plan billing terms.
                            </small>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            block
                            variant="solid"
                            loading={loading || initializing}
                            disabled={selectedAmount <= 0 || initializing || !clientSecret}
                            onClick={handlePay}
                        >
                            {initializing ? 'Preparing checkout...' : 'Pay with Stripe'}
                        </Button>
                    </div>
                </>
            )}
        </Dialog>
    )
}

export default PaymentDialog
