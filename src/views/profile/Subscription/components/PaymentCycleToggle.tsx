import Segment from '@/components/ui/Segment'
import { useAppSelector, useAppDispatch } from '@/store/hook'
import { setPaymentCycle } from '../store/subscriptionSlice'
import type { PaymentCycle } from '../types'

const PaymentCycleToggle = () => {
    const dispatch = useAppDispatch()
    const paymentCycle = useAppSelector((state) => state.subscription.paymentCycle)

    return (
        <Segment
            value={paymentCycle}
            onChange={(val) => dispatch(setPaymentCycle(val as PaymentCycle))}
        >
            <Segment.Item value="monthly">Monthly</Segment.Item>
            <Segment.Item value="annually">Annually</Segment.Item>
        </Segment>
    )
}

export default PaymentCycleToggle
