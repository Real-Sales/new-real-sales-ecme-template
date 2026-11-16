import classNames from '@/utils/classNames'
import Card from '@/components/ui/Card'
import useLayout from '@/utils/hooks/useLayout'
import { SURFACE_CARD_CLASSNAME } from '@/constants/surfaceCard.constant'
import type { CardProps } from '@/components/ui/Card'

type AdaptableCardProps = CardProps

const AdaptiveCard = (props: AdaptableCardProps) => {
    const { adaptiveCardActive } = useLayout()

    const { className, bodyClass, ...rest } = props

    return (
        <Card
            className={classNames(
                !adaptiveCardActive && SURFACE_CARD_CLASSNAME,
                className,
                adaptiveCardActive && 'border-none dark:bg-transparent',
            )}
            bodyClass={classNames(bodyClass, adaptiveCardActive && 'p-0')}
            {...rest}
        />
    )
}

export default AdaptiveCard
