import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignUpForm from './components/SignUpForm'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useAppSelector } from '@/store'

type SignUpProps = {
    disableSubmit?: boolean
    signInUrl?: string
}

export const SignUpBase = ({
    signInUrl = '/sign-in',
    disableSubmit,
}: SignUpProps) => {
    const [message, setMessage] = useTimeOutMessage()

    const mode = useAppSelector((state) => state.theme.mode)

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
                        And lets get started with your free trial
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
            <SignUpForm disableSubmit={disableSubmit} setMessage={setMessage} />
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
