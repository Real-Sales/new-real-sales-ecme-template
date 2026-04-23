import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import CurrentPlanUsage from './components/CurrentPlanUsage'
import Plans from './components/Plans'
import PaymentCycleToggle from './components/PaymentCycleToggle'
import Faq from './components/Faq'
import PaymentDialog from './components/PaymentDialog'
import { useAppSelector } from '@/store/hook'
import {
    apiGetMySubscription,
    apiGetSubscriptions,
    apiGetUserSubscriptionsByUser,
    pickActiveUserSubscription,
    type ApiSubscription,
    type UserSubscriptionRecord,
} from '@/services/SubscriptionService'

const Subscription = () => {
    const userId = useAppSelector((state) => state.auth.user.userId?.trim() ?? '')

    const [subscriptions, setSubscriptions] = useState<ApiSubscription[]>([])
    const [activeUserSubscription, setActiveUserSubscription] =
        useState<UserSubscriptionRecord | null>(null)
    const [plansLoading, setPlansLoading] = useState(true)
    const [userSubLoading, setUserSubLoading] = useState(true)
    const [plansError, setPlansError] = useState<string | null>(null)
    const [userSubError, setUserSubError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setPlansLoading(true)
        setUserSubLoading(!!userId)
        setPlansError(null)
        setUserSubError(null)

        const catalogPromise = apiGetSubscriptions()
            .then((data) => ({ ok: true as const, data }))
            .catch(() => ({ ok: false as const }))

        const userPromise =
            userId !== ''
                ? (async () => {
                      try {
                          const sub = await apiGetMySubscription()
                          return { ok: true as const, data: sub }
                      } catch (err: unknown) {
                          const status = axios.isAxiosError(err)
                              ? err.response?.status
                              : undefined
                          if (status != null && status !== 404) {
                              return { ok: false as const }
                          }
                          try {
                              const rows = await apiGetUserSubscriptionsByUser(userId)
                              return {
                                  ok: true as const,
                                  data: pickActiveUserSubscription(
                                      Array.isArray(rows) ? rows : [],
                                  ),
                              }
                          } catch {
                              return { ok: false as const }
                          }
                      }
                  })()
                : Promise.resolve({
                      ok: true as const,
                      data: null as UserSubscriptionRecord | null,
                  })

        const [catalogResult, userResult] = await Promise.all([
            catalogPromise,
            userPromise,
        ])

        if (catalogResult.ok) {
            setSubscriptions(
                Array.isArray(catalogResult.data) ? catalogResult.data : [],
            )
        } else {
            setPlansError('Unable to load subscription plans. Please try again.')
            setSubscriptions([])
        }
        setPlansLoading(false)

        if (userId === '') {
            setActiveUserSubscription(null)
            setUserSubLoading(false)
        } else if (userResult.ok) {
            setActiveUserSubscription(userResult.data)
            setUserSubLoading(false)
        } else {
            setUserSubError(
                'Unable to load your subscription details. Please try again.',
            )
            setActiveUserSubscription(null)
            setUserSubLoading(false)
        }
    }, [userId])

    useEffect(() => {
        void load()
    }, [load])

    return (
        <>
            <CurrentPlanUsage
                activeUserSubscription={activeUserSubscription}
                error={userSubError}
                hasUserId={!!userId}
                loading={userSubLoading}
            />
            <Card className="mb-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <h3>Subscription Plans</h3>
                    <PaymentCycleToggle />
                </div>
                {plansError && (
                    <Alert showIcon className="mb-6" type="danger">
                        {plansError}
                    </Alert>
                )}
                <Plans
                    currentUserSubscription={activeUserSubscription}
                    loading={plansLoading}
                    subscriptions={subscriptions}
                />
            </Card>
            <Faq />
            <PaymentDialog />
        </>
    )
}

export default Subscription
