import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import OnboardingForm from './components/OnboardingForm'
import { useAppSelector, useAppDispatch } from '@/store'
import { setOnboardingComplete } from '@/store/slices/auth/userSlice'
import { apiCreateSalesCompany } from '@/services/SalesCompanyService'
import { apiGetManagerMe } from '@/services/ManagerService'
import { apiPatchCompanyProfile } from '@/services/AuthService'
import {
    fetchUserProfile,
    mapUserProfileToSettings,
    setProfile,
} from '@/views/profile/Settings/store/settingsSlice'
import { useAuth } from '@/auth'
import { HiArrowLeft } from 'react-icons/hi'
import type { OnboardingFormSchema } from './components/OnboardingForm'

const Onboarding = () => {
    const [isSubmitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { signOut } = useAuth()
    const mode = useAppSelector((state) => state.theme.mode)
    const userName = useAppSelector((state) => state.auth.user.userName)

    const handleBack = async () => {
        await signOut()
    }

    const handleComplete = async (data: OnboardingFormSchema) => {
        setSubmitting(true)
        setError('')
        try {
            const resp = await apiCreateSalesCompany({
                name: data.companyName,
                industry: data.industry,
                location: data.location || 'N/A',
                phone_number: data.phone_number || 'N/A',
                email: data.email || 'N/A',
            })

            if (resp) {
                const patchedProfile = await apiPatchCompanyProfile({
                    sales_company_id: resp.sales_company_id,
                    industry: data.industry,
                    product_ids: data.industryProducts,
                })

                // Fetch the updated user data to get the linked company_id
                const authResp = await apiGetManagerMe()

                const companyId =
                    patchedProfile?.company_id ||
                    patchedProfile?.company?.sales_company_id ||
                    authResp?.company_id ||
                    resp.sales_company_id

                dispatch(
                    setOnboardingComplete({
                        companyId,
                        companyName: patchedProfile?.company?.name || resp.name,
                        industry:
                            patchedProfile?.company?.industry || resp.industry,
                        industryProducts: data.industryProducts,
                    }),
                )

                // Sign-in fetched the profile before a company existed. Replace
                // that snapshot so Settings shows Company information immediately.
                const mapped = mapUserProfileToSettings(patchedProfile)
                dispatch(
                    setProfile({
                        ...(patchedProfile?.user_id ? mapped : {}),
                        hasCompany: true,
                        salesCompanyId: mapped.salesCompanyId || companyId,
                        companyName: mapped.companyName || resp.name,
                        companyIndustry:
                            mapped.companyIndustry || resp.industry,
                        companyEmail: mapped.companyEmail || resp.email,
                        companyPhone:
                            mapped.companyPhone || resp.phone_number,
                        address: mapped.address || resp.location,
                        location: mapped.location || resp.location,
                        selectedProductIds: mapped.selectedProductIds?.length
                            ? mapped.selectedProductIds
                            : data.industryProducts,
                    }),
                )

                void dispatch(fetchUserProfile())
                navigate('/overview')
            }
        } catch (err: any) {
            console.error('Onboarding error:', err)
            setError(err?.response?.data?.message || err?.response?.data?.detail || 'Something went wrong. Please try again.')
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col items-center min-h-screen w-full bg-gray-50 dark:bg-gray-900 py-10 overflow-y-auto">
            <div className="w-full min-w-[320px] max-w-[400px] flex-shrink-0 px-4">
                <Button
                    variant="plain"
                    size="sm"
                    className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    icon={<HiArrowLeft className="text-lg" />}
                    onClick={handleBack}
                >
                    Back to sign in
                </Button>

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
