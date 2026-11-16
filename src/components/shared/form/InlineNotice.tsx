import { TbAlertTriangle, TbInfoCircle, TbAlertCircle } from 'react-icons/tb'
import classNames from '@/utils/classNames'
import type { ReactNode } from 'react'

export type InlineNoticeTone = 'info' | 'warning' | 'danger'

const TONE = {
    info: {
        icon: TbInfoCircle,
        wrapper:
            'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200',
        icon_color: 'text-blue-500',
    },
    warning: {
        icon: TbAlertTriangle,
        wrapper:
            'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
        icon_color: 'text-amber-500',
    },
    danger: {
        icon: TbAlertCircle,
        wrapper:
            'border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
        icon_color: 'text-red-500',
    },
} as const

export type InlineNoticeProps = {
    tone?: InlineNoticeTone
    title?: string
    /** Trailing call to action — keep it to one link/button. */
    action?: ReactNode
    className?: string
    children: ReactNode
}

/** Contextual guidance inside a form — empty states, caveats, consequences. */
const InlineNotice = ({
    tone = 'info',
    title,
    action,
    className,
    children,
}: InlineNoticeProps) => {
    const { icon: Icon, wrapper, icon_color } = TONE[tone]

    return (
        <div
            className={classNames(
                'flex items-start gap-2.5 rounded-xl border px-3 py-2.5',
                wrapper,
                className,
            )}
        >
            <Icon className={classNames('mt-0.5 shrink-0 text-base', icon_color)} aria-hidden />
            <div className="min-w-0 flex-1 text-xs leading-relaxed">
                {title ? <p className="font-semibold">{title}</p> : null}
                <div className={title ? 'mt-0.5' : undefined}>{children}</div>
                {action ? <div className="mt-2">{action}</div> : null}
            </div>
        </div>
    )
}

export default InlineNotice
