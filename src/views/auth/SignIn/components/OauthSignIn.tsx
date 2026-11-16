import { useAuth } from '@/auth'
import { apiGoogleOauthSignIn } from '@/services/OAuthServices'
import { useGoogleLogin } from '@react-oauth/google'
import Button from '@/components/ui/Button'
import type { CommonProps } from '@/@types/common'

interface OauthSignInProps extends CommonProps {
    setMessage?: (message: string) => void
    disableSubmit?: boolean
}

const OauthSignIn = ({ setMessage, disableSubmit, className }: OauthSignInProps) => {
    const { oAuthSignIn } = useAuth()

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            if (!disableSubmit) {
                oAuthSignIn(async ({ redirect, onSignIn, navigateToOnboarding }) => {
                    try {
                        const resp = await apiGoogleOauthSignIn({
                            id_token: tokenResponse.access_token,
                        })
                        if (resp) {
                            const needsOnboarding = await onSignIn(
                                { accessToken: resp.token },
                                {
                                    userId: resp.user.user_id,
                                    firstName: resp.user.first_name,
                                    lastName: resp.user.last_name,
                                    email: resp.user.email,
                                    phoneNumber: resp.user.phone_number,
                                    role: resp.user.role,
                                    companyId:
                                        (resp.user as { sales_company_id?: string; company_id?: string }).sales_company_id ||
                                        (resp.user as { company_id?: string }).company_id,
                                },
                            )
                            if (needsOnboarding) {
                                navigateToOnboarding()
                            } else {
                                redirect()
                            }
                        }
                    } catch (error: unknown) {
                        const err = error as {
                            response?: {
                                data?: {
                                    message?: string
                                    error?: string
                                    detail?: string
                                }
                            }
                        }
                        setMessage?.(
                            err?.response?.data?.message ||
                            err?.response?.data?.error ||
                            err?.response?.data?.detail ||
                            (error instanceof Error ? error.message : 'Google Sign In failed'),
                        )
                    }
                })
            }
        },
        onError: () => {
            setMessage?.('Google Sign In failed')
        },
    })

    return (
        <div className={className}>
            <Button
                block
                size="md"
                variant="solid"
                onClick={() => googleLogin()}
                disabled={disableSubmit}
                className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm"
                icon={
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                }
            >
                Google
            </Button>
        </div>
    )
}

export default OauthSignIn
