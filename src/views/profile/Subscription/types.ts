export type PaymentCycle = 'monthly' | 'annually'

export type SelectedPlan = {
    planName: string
    /** API value, e.g. starter, manager */
    planType: string
    paymentCycle: PaymentCycle
    price: {
        monthly: number
        annually: number
    }
    subscriptionId?: string
    isCustomPlan?: boolean
}

export type PlanItem = {
    id: string
    name: string
    description: string
    price: {
        monthly: number
        annually: number
    }
    features: string[]
    recommended: boolean
}

export type SubscriptionPlansData = {
    featuresModel: {
        id: string
        description: string
    }[]
    plans: PlanItem[]
}
