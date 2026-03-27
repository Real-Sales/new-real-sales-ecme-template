import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignUpForm from './components/SignUpForm'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useAppSelector } from '@/store'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiValidateInvite } from '@/services/InviteService'
import type { ValidateInviteResponse } from '@/services/InviteService'

type SignUpProps = {
    disableSubmit?: boolean
    signInUrl?: string
}

export const SignUpBase = ({
    signInUrl = '/sign-in',
    disableSubmit,
}: SignUpProps) => {
    const [message, setMessage] = useTimeOutMessage()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const inviteToken = searchParams.get('invite') ?? ''
    const [inviteInfo, setInviteInfo] = useState<ValidateInviteResponse | null>(
        null,
    )
    const [isInviteLoading, setInviteLoading] = useState(false)

    const mode = useAppSelector((state) => state.theme.mode)

    useEffect(() => {
        if (!inviteToken) {
            setInviteInfo(null)
            return
        }
        const loadInvite = async () => {
            try {
                setInviteLoading(true)
                const resp = await apiValidateInvite(inviteToken)
                if (resp?.valid) {
                    setInviteInfo(resp)
                } else {
                    setInviteInfo(null)
                    setMessage('Invite expired or invalid')
                    navigate('/sign-in', { replace: true })
                }
            } catch (error: any) {
                setInviteInfo(null)
                setMessage(
                    error?.response?.data?.message ||
                        error?.response?.data?.detail ||
                        'Invite expired or invalid',
                )
                navigate('/sign-in', { replace: true })
            } finally {
                setInviteLoading(false)
            }
        }
        loadInvite()
    }, [inviteToken, setMessage, navigate])

    return (
        <div className="flex flex-col h-full min-h-0 justify-center">
            <div className="flex-shrink-0 mb-6 flex items-center gap-4">
                <Logo
                    type="streamline"
                    mode={mode}
                    logoWidth={60}
                />
                <div>
                    <h3 className="mb-1">Sign Up</h3>
                    <p className="font-semibold heading-text">
                        {inviteInfo
                            ? `You're invited to join ${inviteInfo.company_name} as ${inviteInfo.role}`
                            : 'And lets get started with your free trial'}
                    </p>
                </div>
            </div>
            {message && (
                <div className="flex-shrink-0 mb-4">
                    <Alert showIcon type="danger">
                        <span className="break-all">{message}</span>
                    </Alert>
                </div>
            )}
            <SignUpForm
                disableSubmit={disableSubmit || isInviteLoading}
                setMessage={setMessage}
                inviteToken={inviteToken}
                inviteInfo={inviteInfo}
            />
            <div className="flex-shrink-0 pt-2 text-center">
                <span>Already have an account? </span>
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

const SignUp = () => {
    return <SignUpBase />
}

export default SignUp
