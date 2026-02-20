import { useAuth } from '@/auth'
import { apiGoogleOauthSignIn } from '@/services/OAuthServices'
import { GoogleLogin } from '@react-oauth/google'
import type { CommonProps } from '@/@types/common'

interface OauthSignInProps extends CommonProps {
    setMessage?: (message: string) => void
    disableSubmit?: boolean
}

const OauthSignIn = ({ setMessage, disableSubmit, className }: OauthSignInProps) => {
    const { oAuthSignIn } = useAuth()

    const handleGoogleSignIn = async (idToken: string) => {
        if (!disableSubmit) {
            oAuthSignIn(async ({ redirect, onSignIn }) => {
                try {
                    const resp = await apiGoogleOauthSignIn({
                        id_token: idToken,
                    })
                    if (resp) {
                        const { token, user } = resp
                        onSignIn({ accessToken: token }, user)
                        redirect()
                    }
                } catch (error: any) {
                    setMessage?.(
                        error?.response?.data?.message ||
                        error?.response?.data?.error ||
                        error?.response?.data?.detail ||
                        error.toString() ||
                        'Google Sign In failed',
                    )
                }
            })
        }
    }

    return (
        <div className={className}>
            <div className="flex flex-col gap-4 w-full">
                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        if (credentialResponse.credential) {
                            handleGoogleSignIn(credentialResponse.credential)
                        }
                    }}
                    onError={() => {
                        setMessage?.('Google Sign In failed')
                    }}
                    useOneTap
                    type="standard"
                    theme="outline"
                    size="large"
                    shape="pill"
                    width="100%"
                />
            </div>
        </div>
    )
}

export default OauthSignIn
