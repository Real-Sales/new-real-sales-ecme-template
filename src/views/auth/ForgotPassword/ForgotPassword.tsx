import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ActionLink from '@/components/shared/ActionLink'
import ForgotPasswordForm from './components/ForgotPasswordForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useNavigate } from 'react-router-dom'

type ForgotPasswordProps = {
    signInUrl?: string
}

export const ForgotPasswordBase = ({
    signInUrl = '/sign-in',
}: ForgotPasswordProps) => {
    const [emailSent, setEmailSent] = useState(false)
    const [isResetDone, setIsResetDone] = useState(false)
    const [message, setMessage] = useTimeOutMessage()
    const [status, setStatus] = useState<'success' | 'danger'>('danger')

    const navigate = useNavigate()

    const handleContinue = () => {
        navigate(signInUrl)
    }

    return (
        <div>
            <div className="mb-6">
                {isResetDone ? (
                    <>
                        <h3 className="mb-2">Password Reset</h3>
                        <p className="font-semibold heading-text">
                            Your password has been successfully reset.
                        </p>
                    </>
                ) : emailSent ? (
                    <>
                        <h3 className="mb-2">Reset Password</h3>
                        <p className="font-semibold heading-text">
                            Please enter the OTP sent to your email and your new password
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="mb-2">Forgot Password</h3>
                        <p className="font-semibold heading-text">
                            Please enter your email to receive a verification code
                        </p>
                    </>
                )}
            </div>
            {message && (
                <Alert showIcon className="mb-4" type={status}>
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            {isResetDone ? (
                <Button
                    block
                    variant="solid"
                    type="button"
                    onClick={handleContinue}
                >
                    Back to Sign In
                </Button>
            ) : (
                <ForgotPasswordForm
                    emailSent={emailSent}
                    setMessage={(msg) => {
                        setMessage(msg)
                        setStatus('danger')
                    }}
                    setSuccess={(msg: string) => {
                        setMessage(msg)
                        setStatus('success')
                    }}
                    setEmailSent={setEmailSent}
                    setIsResetDone={setIsResetDone}
                />
            )}
            <div className="mt-4 text-center">
                <span>Back to </span>
                <ActionLink
                    to={signInUrl}
                    className="heading-text font-bold"
                    themeColor={false}
                >
                    Sign in
                </ActionLink>
            </div>
        </div>
    )
}

const ForgotPassword = () => {
    return <ForgotPasswordBase />
}

export default ForgotPassword
