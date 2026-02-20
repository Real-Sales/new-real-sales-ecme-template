import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import OnboardingForm from './components/OnboardingForm'
import { useAppSelector, useAppDispatch } from '@/store'
import { setOnboardingComplete } from '@/store/slices/auth/userSlice'
import type { OnboardingFormSchema } from './components/OnboardingForm'

const Onboarding = () => {
    const [isSubmitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const mode = useAppSelector((state) => state.theme.mode)
    const userName = useAppSelector((state) => state.auth.user.userName)

    const handleComplete = async (data: OnboardingFormSchema) => {
        setSubmitting(true)
        try {
            dispatch(
                setOnboardingComplete({
                    companyName: data.companyName,
                    industry: data.industry,
                    industryProducts: data.industryProducts,
                }),
            )
            navigate('/overview')
        } catch {
            setError('Something went wrong. Please try again.')
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 dark:bg-gray-900">
            <div className="w-full min-w-[320px] max-w-[400px] flex-shrink-0 px-4">
                <div className="flex-shrink-0 mb-4 flex items-center gap-4">
                    <Logo
                        type="streamline"
                        mode={mode}
                        logoWidth={60}
                    />
                    <div>
                        <h3 className="mb-1">Set Up Your Company</h3>
                        <p className="font-semibold heading-text">
                            {userName
                                ? `Welcome ${userName}! Let's personalize your experience`
                                : "Let's personalize your experience"}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="flex-shrink-0 mb-4">
                        <Alert showIcon type="danger">
                            <span className="break-all">{error}</span>
                        </Alert>
                    </div>
                )}

                <div className="flex-shrink-0 mb-4 p-3 rounded-lg bg-blue-50/60 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        This helps us tailor AI sales coaching scenarios to your
                        industry and products. You can update these later in
                        settings.
                    </p>
                </div>

                <OnboardingForm
                    onComplete={handleComplete}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    )
}

export default Onboarding
