import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import Alert from '@/components/ui/Alert'
import OtpVerificationForm from './components/OtpVerificationForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { apiSendOtp } from '@/services/AuthService'

const RESEND_COOLDOWN_SEC = 60

export const OtpVerificationBase = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const email = searchParams.get('email') ?? ''
    const [otpVerified, setOtpVerified] = useTimeOutMessage()
    const [otpResend, setOtpResend] = useTimeOutMessage()
    const [message, setMessage] = useTimeOutMessage()
    const [resendCooldown, setResendCooldown] = useState(0)

    useEffect(() => {
        if (resendCooldown <= 0) return
        const id = setInterval(() => setResendCooldown((p) => (p <= 1 ? 0 : p - 1)), 1000)
        return () => clearInterval(id)
    }, [resendCooldown])

    const handleResendOtp = useCallback(async () => {
        if (!email) {
            setMessage?.('Email is required. Please sign up again.')
            return
        }
        if (resendCooldown > 0) return
        try {
            await apiSendOtp({ email })
            setOtpResend('OTP sent to your email.')
            setResendCooldown(RESEND_COOLDOWN_SEC)
        } catch (errors: unknown) {
            const err = errors as { response?: { data?: { message?: string } } }
            setMessage?.(err?.response?.data?.message || 'Failed to resend OTP. Please try again.')
        }
    }, [email, resendCooldown, setMessage, setOtpResend])

    if (!email) {
        navigate('/sign-up', { replace: true })
        return null
    }

    return (
        <div className="flex flex-col h-full min-h-0 justify-center">
            <div className="mb-8">
                <h3 className="mb-2">OTP Verification</h3>
                <p className="font-semibold heading-text">
                    We have sent you One Time Password to {email}
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            {otpResend && (
                <Alert showIcon className="mb-4" type="info">
                    <span className="break-all">{otpResend}</span>
                </Alert>
            )}
            {otpVerified && (
                <Alert showIcon className="mb-4" type="success">
                    <span className="break-all">{otpVerified}</span>
                </Alert>
            )}
            <OtpVerificationForm
                email={email}
                setMessage={setMessage}
                setOtpVerified={setOtpVerified}
            />
            <div className="mt-4 text-center">
                <span className="font-semibold">Didn&apos;t receive OTP? </span>
                <button
                    className="heading-text font-bold underline disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
            </div>
        </div>
    )
}

const OtpVerification = () => {
    return <OtpVerificationBase />
}

export default OtpVerification
