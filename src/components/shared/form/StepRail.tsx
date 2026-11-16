import { TbCheck, TbExclamationMark } from 'react-icons/tb'
import classNames from '@/utils/classNames'

export type StepStatus = 'complete' | 'active' | 'incomplete' | 'error'

export type StepRailItem = {
    id: string
    label: string
    status: StepStatus
}

export type StepRailProps = {
    steps: StepRailItem[]
    activeId: string
    /** Steps stay clickable in both directions — this is navigation, not a wizard. */
    onStepSelect: (id: string) => void
    className?: string
}

const indicatorClass = (status: StepStatus, isActive: boolean) => {
    if (status === 'error') return 'border-red-500 bg-red-500 text-white'
    if (status === 'complete') return 'border-primary bg-primary text-neutral'
    if (isActive) return 'border-primary text-primary'
    return 'border-gray-300 text-gray-400 dark:border-white/20 dark:text-gray-500'
}

/**
 * Non-blocking step navigation. Every step is reachable at any time — the rail
 * communicates progress and where problems are, it does not gate the user.
 */
const StepRail = ({ steps, activeId, onStepSelect, className }: StepRailProps) => (
    <nav aria-label="Form steps" className={classNames('flex items-center', className)}>
        {steps.map((step, index) => {
            const isActive = step.id === activeId
            return (
                <div key={step.id} className="flex min-w-0 flex-1 items-center">
                    <button
                        type="button"
                        aria-current={isActive ? 'step' : undefined}
                        className={classNames(
                            'group flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 transition-colors',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                            isActive ? '' : 'hover:bg-gray-100 dark:hover:bg-white/5',
                        )}
                        onClick={() => onStepSelect(step.id)}
                    >
                        <span
                            className={classNames(
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors',
                                indicatorClass(step.status, isActive),
                            )}
                            aria-hidden
                        >
                            {step.status === 'complete' ? (
                                <TbCheck className="text-[11px]" />
                            ) : step.status === 'error' ? (
                                <TbExclamationMark className="text-[11px]" />
                            ) : (
                                index + 1
                            )}
                        </span>
                        <span
                            className={classNames(
                                'truncate text-xs font-medium transition-colors',
                                isActive
                                    ? 'text-gray-900 dark:text-white'
                                    : step.status === 'error'
                                      ? 'text-red-500'
                                      : 'text-gray-500 dark:text-gray-400',
                            )}
                        >
                            {step.label}
                        </span>
                    </button>
                    {index < steps.length - 1 ? (
                        <span
                            className={classNames(
                                'mx-1 h-px min-w-2 flex-1',
                                step.status === 'complete'
                                    ? 'bg-primary/40'
                                    : 'bg-gray-200 dark:bg-white/10',
                            )}
                            aria-hidden
                        />
                    ) : null}
                </div>
            )
        })}
    </nav>
)

export default StepRail
