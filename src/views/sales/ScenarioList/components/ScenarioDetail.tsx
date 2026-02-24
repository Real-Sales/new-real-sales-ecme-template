import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Dialog from '@/components/ui/Dialog'
import classNames from '@/utils/classNames'
import dayjs from 'dayjs'
import { FcImageFile } from 'react-icons/fc'
import { TbInfoCircle } from 'react-icons/tb'
import type { Scenario, ScenarioSession, ScenarioLibraryPersona } from '../types'

type ScenarioDetailProps = {
    scenario: Scenario | ScenarioSession
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

const statusConfig: Record<string, { label: string; bgClass: string; textClass: string }> = {
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

const modeColorMap: Record<string, { bgClass: string; textClass: string }> = {
    'Role Play': { bgClass: 'bg-blue-100 dark:bg-blue-900/30', textClass: 'text-blue-700 dark:text-blue-400' },
    Practice: { bgClass: 'bg-purple-100 dark:bg-purple-900/30', textClass: 'text-purple-700 dark:text-purple-400' },
    Coaching: { bgClass: 'bg-emerald-100 dark:bg-emerald-900/30', textClass: 'text-emerald-700 dark:text-emerald-400' },
    prospecting: { bgClass: 'bg-indigo-100 dark:bg-indigo-900/30', textClass: 'text-indigo-700 dark:text-indigo-400' },
}

const defaultModeStyle = { bgClass: 'bg-gray-100 dark:bg-gray-700', textClass: 'text-gray-700 dark:text-gray-400' }

const getModeStyle = (modeName: string) =>
    modeColorMap[modeName] ?? defaultModeStyle

const isLibraryScenario = (s: Scenario | ScenarioSession): s is Scenario =>
    typeof (s as Scenario).persona === 'object'

const PersonaAttrRow = ({
    leftLabel,
    leftValue,
    rightLabel,
    rightValue,
}: {
    leftLabel: string
    leftValue: string
    rightLabel: string
    rightValue: string
}) => (
    <div className="grid grid-cols-2 gap-x-8 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <div className="min-w-0">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 block mb-1">{leftLabel}</span>
            <p className="font-bold text-gray-900 dark:text-gray-100 break-words">{leftValue}</p>
        </div>
        <div className="min-w-0">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 block mb-1">{rightLabel}</span>
            <p className="font-bold text-gray-900 dark:text-gray-100 capitalize break-words">{rightValue}</p>
        </div>
    </div>
)

export const PersonaCard = ({ persona }: { persona: ScenarioLibraryPersona }) => (
    <div className="space-y-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 block mb-4">PERSONA</span>

        <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            {persona.profile_pic ? (
                <Avatar size={56} shape="circle" src={persona.profile_pic} />
            ) : (
                <Avatar
                    size={56}
                    shape="circle"
                    className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                    <span className="text-lg font-semibold">
                        {persona.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                    </span>
                </Avatar>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{persona.name}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                    {persona.ai_role?.name ?? '—'}
                </p>
            </div>
        </div>

        <PersonaAttrRow
            leftLabel="Industry"
            leftValue={persona.industry?.name ?? '—'}
            rightLabel="Geography"
            rightValue={persona.geography ?? '—'}
        />
        <PersonaAttrRow
            leftLabel="Plant size"
            leftValue={persona.plant_size_impact?.name ?? 'Not applicable'}
            rightLabel="Manufacturing model"
            rightValue={persona.manufacturing_model?.name ?? 'Not applicable'}
        />
        <PersonaAttrRow
            leftLabel="Company size"
            leftValue={persona.company_size_new?.name ?? '—'}
            rightLabel="Gender"
            rightValue={persona.gender ?? '—'}
        />

        {persona.persona_products && persona.persona_products.length > 0 && (
            <div className="pt-4">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 block mb-2">Products</span>
                <div className="flex flex-wrap gap-2">
                    {persona.persona_products.map((pp) =>
                        pp.product?.name ? (
                            <span
                                key={pp.persona_product_id}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                            >
                                {pp.product.name}
                            </span>
                        ) : null
                    )}
                </div>
            </div>
        )}
    </div>
)

const ScenarioDetail = ({ scenario }: ScenarioDetailProps) => {
    const [personaPopupOpen, setPersonaPopupOpen] = useState(false)
    const derivedStatus = isLibraryScenario(scenario)
        ? (scenario.persona?.status_active && scenario.mode?.status_active ? 'active' : 'inactive')
        : (scenario as ScenarioSession).session_status
    const isInactive = derivedStatus === 'inactive'
    const modeName = isLibraryScenario(scenario) ? (scenario.mode?.name ?? '') : (scenario as ScenarioSession).mode
    const personaName = isLibraryScenario(scenario) ? (scenario.persona?.name ?? '') : (scenario as ScenarioSession).persona
    const modeStyle = getModeStyle(modeName)

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
                            innerClass={`${statusConfig[derivedStatus].bgClass} ${statusConfig[derivedStatus].textClass} px-2 py-0.5 text-xs font-medium`}
                            content={statusConfig[derivedStatus].label}
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
                                    : `${modeStyle.bgClass} ${modeStyle.textClass}`,
                                'px-2 py-0.5 text-xs font-medium',
                            )}
                            content={modeName || '—'}
                        />
                    </div>
                </div>

                <InfoField title="Deadline" value={`${scenario.time_limit_days} days`} />

                {/* Persona (library scenario: info button opens popup) */}
                {isLibraryScenario(scenario) && scenario.persona && (
                    <div>
                        <span className="font-semibold block mb-1 flex items-center gap-1.5">
                            Persona
                            <button
                                type="button"
                                onClick={() => setPersonaPopupOpen(true)}
                                className="cursor-pointer text-gray-500 hover:text-primary transition-colors p-0.5 rounded"
                                aria-label="View persona details"
                            >
                                <TbInfoCircle className="text-base" />
                            </button>
                        </span>
                        <p className="heading-text font-bold">{scenario.persona.name}</p>
                    <Dialog
                        isOpen={personaPopupOpen}
                        onClose={() => setPersonaPopupOpen(false)}
                        onRequestClose={() => setPersonaPopupOpen(false)}
                        width={560}
                        contentClassName="!p-6 !rounded-xl !bg-gray-100 dark:!bg-gray-900"
                        overlayClassName="!bg-black/20 dark:!bg-gray-900/40 !backdrop-blur-md"
                    >
                            <PersonaCard persona={scenario.persona} />
                        </Dialog>
                    </div>
                )}

                {/* Persona name only (legacy / assigned scenario) */}
                {!isLibraryScenario(scenario) && (
                    <InfoField title="Persona" value={personaName || '—'} />
                )}
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
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
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
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-sm heading-text whitespace-pre-wrap leading-relaxed">
                            {scenario.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Document content (API) or document name (legacy) */}
            {(isLibraryScenario(scenario) ? scenario.document_content : (scenario as ScenarioSession).document_name) && (
                <div>
                    <span className="font-semibold block mb-2">Document</span>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">
                                <FcImageFile />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm heading-text whitespace-pre-wrap leading-relaxed">
                                    {isLibraryScenario(scenario)
                                        ? scenario.document_content
                                        : (scenario as ScenarioSession).document_name}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ScenarioDetail
