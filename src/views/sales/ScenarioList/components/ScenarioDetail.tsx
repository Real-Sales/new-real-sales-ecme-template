import Badge from '@/components/ui/Badge'
import classNames from '@/utils/classNames'
import dayjs from 'dayjs'
import { FcImageFile } from 'react-icons/fc'
import { HiOutlineDownload } from 'react-icons/hi'
import type { Scenario } from '../types'

type ScenarioDetailProps = {
    scenario: Scenario
}

type InfoFieldProps = {
    title: string
    value?: string | number | null
}

const InfoField = ({ title, value }: InfoFieldProps) => {
    return (
        <div>
            <span className="font-semibold block mb-1">{title}</span>
            <p className="heading-text font-bold">{value || '—'}</p>
        </div>
    )
}

const statusColor: Record<
    Scenario['session_status'],
    {
        label: string
        bgClass: string
        textClass: string
    }
> = {
    active: {
        label: 'Active',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
        textClass: 'text-green-700 dark:text-green-400',
    },
    inactive: {
        label: 'Inactive',
        bgClass: 'bg-gray-100 dark:bg-gray-700',
        textClass: 'text-gray-700 dark:text-gray-400',
    },
}

const modeColor: Record<
    Scenario['mode'],
    {
        label: string
        bgClass: string
        textClass: string
    }
> = {
    'Role Play': {
        label: 'Role Play',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        textClass: 'text-blue-700 dark:text-blue-400',
    },
    Practice: {
        label: 'Practice',
        bgClass: 'bg-purple-100 dark:bg-purple-900/30',
        textClass: 'text-purple-700 dark:text-purple-400',
    },
    Coaching: {
        label: 'Coaching',
        bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
        textClass: 'text-emerald-700 dark:text-emerald-400',
    },
}

const ScenarioDetail = ({ scenario }: ScenarioDetailProps) => {
    const isInactive = scenario.session_status === 'inactive'

    return (
        <div className="space-y-7">
            {/* Title */}
            <InfoField title="Title" value={scenario.title} />

            {/* Status and Mode in grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-7">
                <div>
                    <span className="font-semibold block mb-1">Status</span>
                    <div>
                        <Badge
                            innerClass={`${statusColor[scenario.session_status].bgClass} ${statusColor[scenario.session_status].textClass} px-2 py-0.5 text-xs font-medium`}
                            content={statusColor[scenario.session_status].label}
                        />
                    </div>
                </div>
                <div>
                    <span className="font-semibold block mb-1">Mode</span>
                    <div>
                        <Badge
                            innerClass={classNames(
                                isInactive
                                    ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-500'
                                    : `${modeColor[scenario.mode].bgClass} ${modeColor[scenario.mode].textClass}`,
                                'px-2 py-0.5 text-xs font-medium',
                            )}
                            content={modeColor[scenario.mode].label}
                        />
                    </div>
                </div>

                {/* Persona and Deadline in same grid */}
                <InfoField title="Persona" value={scenario.persona} />
                <InfoField title="Deadline" value={`${scenario.time_limit_days} days`} />
            </div>

            {/* Created Date */}
            <InfoField 
                title="Created Date" 
                value={dayjs(scenario.created_at).format('DD MMM YYYY')} 
            />

            {/* Scenario */}
            {scenario.scenario_text && (
                <div>
                    <span className="font-semibold block mb-2">Scenario</span>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-sm heading-text whitespace-pre-wrap leading-relaxed">
                            {scenario.scenario_text}
                        </p>
                    </div>
                </div>
            )}

            {/* Message */}
            {scenario.message && (
                <div>
                    <span className="font-semibold block mb-2">Message</span>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-sm heading-text whitespace-pre-wrap leading-relaxed">
                            {scenario.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Document */}
            {scenario.document_name && (
                <div>
                    <span className="font-semibold block mb-2">Document</span>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-4xl">
                                    <FcImageFile />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold heading-text text-sm truncate">
                                        {scenario.document_name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Attached document
                                    </p>
                                </div>
                            </div>
                            <button
                                className="text-primary hover:text-primary-dark text-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                                onClick={() => {
                                    console.log('Download:', scenario.document_url)
                                    // In real app: window.open(scenario.document_url, '_blank')
                                }}
                                title="Download document"
                            >
                                <HiOutlineDownload />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ScenarioDetail
