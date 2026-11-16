import classNames from '@/utils/classNames'
import { MODE_PIPELINE_ORDER, formatModeName } from '@/utils/modePipeline'

export type ScenarioModeStepperProps = {
    /** Scenario's configured modes, in pipeline order (e.g. ["prospecting", "discovering", "closing"]). */
    modeSequenceNames: string[]
    /** The mode this particular session/card belongs to. */
    currentModeName?: string
    /** Whether the session for `currentModeName` has been completed. */
    isCurrentCompleted?: boolean
}

type StepStatus = 'completed' | 'current' | 'upcoming'

/**
 * Horizontal stage tracker (First Step -> Second Step -> ... ) showing where
 * this scenario assignment sits in its configured mode pipeline. Modes
 * earlier than `currentModeName` are assumed completed (the only way to
 * reach a later mode is via the manager's "Advance" action, which requires
 * the prior mode's session to be completed).
 */
const ScenarioModeStepper = ({ modeSequenceNames, currentModeName, isCurrentCompleted }: ScenarioModeStepperProps) => {
    if (!modeSequenceNames || modeSequenceNames.length < 2) return null

    const sorted = [...modeSequenceNames].sort(
        (a, b) => (MODE_PIPELINE_ORDER[a.toLowerCase()] ?? 0) - (MODE_PIPELINE_ORDER[b.toLowerCase()] ?? 0),
    )
    const currentOrder = currentModeName ? MODE_PIPELINE_ORDER[currentModeName.toLowerCase()] : undefined

    const statusFor = (modeName: string): StepStatus => {
        const order = MODE_PIPELINE_ORDER[modeName.toLowerCase()] ?? 0
        if (currentOrder === undefined) return 'upcoming'
        if (order < currentOrder) return 'completed'
        if (order === currentOrder) return isCurrentCompleted ? 'completed' : 'current'
        return 'upcoming'
    }

    return (
        <div className="w-full py-1">
            <div className="flex items-start">
                {sorted.map((modeName, index) => {
                    const status = statusFor(modeName)
                    const isLast = index === sorted.length - 1

                    return (
                        <div key={modeName} className={classNames('flex flex-col items-center', !isLast && 'flex-1')}>
                            {/* Circle + connecting line to the next step */}
                            <div className="flex items-center w-full">
                                <div
                                    className={classNames(
                                        'shrink-0 flex items-center justify-center rounded-full transition-colors',
                                        status === 'current'
                                            ? 'w-5 h-5 border-2 border-primary bg-white dark:bg-gray-900'
                                            : 'w-3.5 h-3.5',
                                        status === 'completed' && 'bg-primary',
                                        status === 'upcoming' && 'bg-gray-300 dark:bg-gray-600',
                                    )}
                                />
                                {!isLast && (
                                    <div
                                        className={classNames(
                                            'h-0.5 flex-1 mx-1',
                                            status === 'completed' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600',
                                        )}
                                    />
                                )}
                            </div>
                            {/* Label */}
                            <div className="text-center mt-2 px-1 max-w-[96px]">
                                <p
                                    className={classNames(
                                        'text-xs font-semibold',
                                        status === 'upcoming'
                                            ? 'text-gray-400 dark:text-gray-500'
                                            : 'text-gray-900 dark:text-gray-100',
                                    )}
                                >
                                    {formatModeName(modeName)}
                                </p>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                    {status === 'completed' ? 'Completed' : status === 'current' ? 'In progress' : 'Upcoming'}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ScenarioModeStepper
