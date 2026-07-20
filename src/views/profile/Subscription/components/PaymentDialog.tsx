import { useState } from 'react'
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
import { loadRazorpayScript } from '@/utils/loadRazorpayScript'
import {
    RAZORPAY_PROVIDER,
    apiCreatePayment,
    apiCreateRazorpayOrder,
    apiVerifyRazorpayPayment,
    inrPaiseToMajorUnits,
    toRazorpayAmountPaise,
} from '@/services/PaymentService'
import { apiCreateUserSubscription } from '@/services/SubscriptionService'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

type PaymentDialogProps = {
    onPaymentSuccess?: () => void | Promise<void>
}

const PaymentDialog = ({ onPaymentSuccess }: PaymentDialogProps) => {
    const [loading, setLoading] = useState(false)
    const [paymentSuccessful, setPaymentSuccessful] = useState(false)
    const [payError, setPayError] = useState<string | null>(null)

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const paymentDialog = useAppSelector((state) => state.subscription.paymentDialog)
    const selectedPlan = useAppSelector((state) => state.subscription.selectedPlan)
    const userId = useAppSelector((state) => state.auth.user.userId?.trim() ?? '')
    const userEmail = useAppSelector((state) => state.auth.user.email ?? '')
    const userName = useAppSelector((state) => {
        const first = state.auth.user.firstName ?? ''
        const last = state.auth.user.lastName ?? ''
        return `${first} ${last}`.trim()
    })

    const handleDialogClose = async () => {
        dispatch(setPaymentDialog(false))
        await sleep(200)
        dispatch(setSelectedPlan({}))
        setPaymentSuccessful(false)
        setPayError(null)
        setLoading(false)
    }

    const selectedAmount =
        selectedPlan.price?.[selectedPlan.paymentCycle as PaymentCycle] ?? 0

    const handlePay = async () => {
        setPayError(null)

        if (selectedAmount <= 0) {
            setPayError('This plan does not require payment.')
            return
        }

        const subscriptionId = selectedPlan.subscriptionId?.trim()
        if (!subscriptionId) {
            setPayError('Missing plan id. Please choose a plan again.')
            return
        }
        if (!userId) {
            setPayError('You must be signed in to complete payment.')
            return
        }

        const amountPaise = toRazorpayAmountPaise(selectedAmount)
        if (amountPaise < 100) {
            setPayError('Payment amount is too small for Razorpay (minimum ₹1).')
            return
        }

        setLoading(true)
        try {
            await loadRazorpayScript()
            const RazorpayCtor = window.Razorpay
            if (!RazorpayCtor) {
                throw new Error('Razorpay checkout failed to load.')
            }

            const order = await apiCreateRazorpayOrder({
                amount: amountPaise,
                currency: 'INR',
                receipt: `sub_${subscriptionId.slice(0, 8)}_${Date.now()}`.slice(0, 40),
            })

            const keyId =
                order.key_id ||
                order.keyId ||
                String(import.meta.env.RAZORPAY_KEY_ID ?? '').trim()
            if (!keyId) {
                setPayError(
                    'Razorpay is not configured. Add RAZORPAY_KEY_ID or ensure create-order returns key_id.',
                )
                return
            }

            await new Promise<void>((resolve, reject) => {
                const rzp = new RazorpayCtor({
                    key: keyId,
                    amount: order.amount,
                    currency: order.currency || 'INR',
                    order_id: order.order_id,
                    name: 'SalesWana',
                    description: `${selectedPlan.planName ?? 'Subscription'} plan`,
                    prefill: {
                        name: userName || undefined,
                        email: userEmail || undefined,
                    },
                    theme: { color: '#16a34a' },
                    handler: (response) => {
                        void (async () => {
                            try {
                                const verified = await apiVerifyRazorpayPayment({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                })
                                if (!verified?.success) {
                                    throw new Error('Payment verification failed.')
                                }

                                await apiCreatePayment({
                                    subscription_id: subscriptionId,
                                    user_id: userId,
                                    amount: inrPaiseToMajorUnits(order.amount),
                                    currency: order.currency || 'INR',
                                    payment_method: 'razorpay',
                                    provider: RAZORPAY_PROVIDER,
                                    payment_status: 'paid',
                                    external_payment_id: response.razorpay_payment_id,
                                })

                                await apiCreateUserSubscription({
                                    user_id: userId,
                                    subscription_id: subscriptionId,
                                })

                                await onPaymentSuccess?.()
                                setPaymentSuccessful(true)
                                resolve()
                            } catch (error) {
                                reject(error)
                            }
                        })()
                    },
                    modal: {
                        ondismiss: () => {
                            reject(new Error('Payment cancelled.'))
                        },
                    },
                })

                rzp.on('payment.failed', (res) => {
                    reject(
                        new Error(
                            res.error?.description || 'Payment failed. Please try again.',
                        ),
                    )
                })

                rzp.open()
            })
        } catch (error) {
            const message = getApiErrorMessage(error, 'Payment could not be completed.')
            if (message !== 'Payment cancelled.') {
                setPayError(message)
            }
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
                        <Alert showIcon className="mt-4" type="info">
                            You will complete payment securely with Razorpay Checkout.
                        </Alert>
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
                                    prefix="₹"
                                    fixedDecimalScale
                                    decimalScale={2}
                                    value={selectedAmount}
                                />
                            </span>
                        </h4>
                        <div className="max-w-[350px] ltr:text-right rtl:text-left leading-none mt-2 opacity-80">
                            <small>
                                Complete payment securely with Razorpay. By paying, you
                                agree to the plan billing terms.
                            </small>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            block
                            variant="solid"
                            loading={loading}
                            disabled={selectedAmount <= 0 || !selectedPlan.subscriptionId}
                            onClick={() => void handlePay()}
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
