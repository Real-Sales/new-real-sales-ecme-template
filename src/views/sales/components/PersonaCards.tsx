import { Avatar, Spinner } from '@/components/ui'
import {
    HiArrowRight,
    HiCheck,
    HiLockClosed,
    HiOutlineTrash,
    HiOutlineBriefcase,
    HiOutlineOfficeBuilding,
} from 'react-icons/hi'
import type { AIPersona } from '@/components/shared/SessionSetupPanel'
import { formatModeName } from '@/utils/modePipeline'
import type { PersonaJourney } from '@/views/sales/personaJourneys'

/** "Large Company (5,000+):" -> "Large Company (5,000+)" */
const tidy = (value: string) => value.replace(/[:\s]+$/, '')

const DIFFICULTY_CLASS: Record<string, string> = {
    Easy: 'border-emerald-300/60 bg-emerald-100/70 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300',
    Medium: 'border-amber-300/60 bg-amber-100/70 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300',
    Hard: 'border-rose-300/60 bg-rose-100/70 text-rose-700 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-300',
}

const CARD_CLASS =
    'group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border app-liquid-dark transition-all duration-300'

/** Avatar inside a thin green-to-cyan ring. */
function RingAvatar({ src, size }: { src?: string; size: number }) {
    return (
        <span className="inline-flex shrink-0 rounded-full bg-gradient-to-br from-primary via-emerald-300/40 to-cyan-400/70 p-[2px] shadow-[0_8px_24px_rgba(12,175,96,0.18)] transition-shadow duration-300 group-hover:shadow-[0_8px_30px_rgba(12,175,96,0.4)]">
            <Avatar size={size} src={src} shape="circle" className="!bg-gray-200 dark:!bg-gray-900" />
        </span>
    )
}

/** Three thin bars: done, next, still to come. */
function JourneyBars({ journey }: { journey: PersonaJourney }) {
    return (
        <div className="flex gap-1.5" aria-hidden>
            {journey.steps.map((step) => (
                <span
                    key={step.mode}
                    className={`h-1 flex-1 rounded-full ${
                        step.session
                            ? 'bg-primary'
                            : step.mode === journey.nextMode
                              ? 'bg-primary/35'
                              : 'bg-gray-300/70 dark:bg-white/10'
                    }`}
                />
            ))}
        </div>
    )
}

type PersonaCardProps = {
    persona: AIPersona
    roleLabel: string
    industryLabel: string
    /** Most recent journey still in progress with this persona, if any. */
    journey?: PersonaJourney
    /** How many journeys are in progress with this persona. */
    inProgressCount?: number
    /** True when the rep has finished all three modes with this persona at least once. */
    hasCompleted?: boolean
    busy: boolean
    disabled: boolean
    choosingMode: boolean
    onSelect: () => void
}

/** A persona in the "All personas" grid. Clicking the card opens the mode picker, or asks whether to
 * continue when a journey is already in progress. */
export function PersonaCard({
    persona,
    roleLabel,
    industryLabel,
    journey,
    inProgressCount = 0,
    hasCompleted = false,
    busy,
    disabled,
    choosingMode,
    onSelect,
}: PersonaCardProps) {
    const inProgress = journey && !journey.completed && journey.nextMode
    return (
        <div
            role="button"
            tabIndex={0}
            aria-busy={busy}
            aria-label={`Select persona ${persona.name}`}
            onClick={onSelect}
            onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget && !disabled) {
                    e.preventDefault()
                    onSelect()
                }
            }}
            className={`${CARD_CLASS} px-5 pb-5 pt-12 ${disabled ? 'cursor-wait' : 'cursor-pointer'} ${
                busy
                    ? '!border-primary shadow-[0_0_40px_rgba(12,175,96,0.2)]'
                    : 'hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(12,175,96,0.14)]'
            }`}
        >
            {/* Soft green light from the top, stronger on hover */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-16 h-44 opacity-50 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        'radial-gradient(60% 100% at 50% 0%, rgba(12,175,96,0.2), rgba(34,211,238,0.05) 55%, transparent 100%)',
                }}
            />

            <span
                className={`absolute left-4 top-4 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    DIFFICULTY_CLASS[persona.difficulty] ?? DIFFICULTY_CLASS.Medium
                }`}
            >
                {persona.difficulty}
            </span>
            {busy ? (
                <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-lg">
                    <Spinner size={16} enableTheme={false} className="text-white" />
                </span>
            ) : hasCompleted && !inProgress ? (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    <HiCheck className="h-3 w-3" /> Journey done
                </span>
            ) : null}

            <div className="relative flex flex-col items-center text-center">
                <RingAvatar src={persona.avatar} size={88} />
                <h3 className="mt-4 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                    {persona.name}
                </h3>
                <p className="mt-0.5 text-sm font-semibold text-primary">{roleLabel}</p>
            </div>

            <dl className="relative mt-5 space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                    <HiOutlineOfficeBuilding className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                    <dt className="sr-only">Company size</dt>
                    <dd className="truncate text-gray-700 dark:text-gray-300" title={tidy(persona.company)}>
                        {tidy(persona.company)}
                    </dd>
                </div>
                <div className="flex items-center gap-2.5">
                    <HiOutlineBriefcase className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                    <dt className="sr-only">Industry</dt>
                    <dd className="truncate text-gray-700 dark:text-gray-300" title={industryLabel}>
                        {industryLabel}
                    </dd>
                </div>
            </dl>

            {persona.personality && (
                <p className="relative mt-4 line-clamp-2 text-center text-sm italic text-gray-500 dark:text-gray-400">
                    &ldquo;{persona.personality}&rdquo;
                </p>
            )}

            <div className="relative mt-auto pt-5">
                {inProgress && journey && (
                    <div className="mb-3">
                        <JourneyBars journey={journey} />
                        <p className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="truncate">
                                <span className="font-semibold text-primary">
                                    {formatModeName(journey.nextMode as string)}
                                </span>{' '}
                                is up next
                            </span>
                            {inProgressCount > 1 && (
                                <span className="shrink-0 rounded-full border border-gray-200 px-2 py-0.5 font-semibold dark:border-white/10">
                                    {inProgressCount} in progress
                                </span>
                            )}
                        </p>
                    </div>
                )}
                {(
                    <div
                        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                            busy
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-200 text-gray-700 group-hover:border-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(12,175,96,0.3)] dark:border-white/10 dark:text-gray-200'
                        }`}
                    >
                        {busy
                            ? 'Starting…'
                            : choosingMode
                              ? 'Choose mode…'
                              : inProgress
                                ? 'Continue or start new'
                                : 'Start practice'}
                        {!busy && (
                            <HiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

type JourneyCardProps = {
    persona: AIPersona
    roleLabel: string
    journey: PersonaJourney
    busy: boolean
    disabled: boolean
    onContinue: () => void
    onDiscard: () => void
    onOpenReport: (sessionId: string) => void
}

const formatDate = (time: number) =>
    time ? new Date(time).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : ''

/** A persona the rep has already practised with: what is done, and the mode to do next. */
export function JourneyCard({
    persona,
    roleLabel,
    journey,
    busy,
    disabled,
    onContinue,
    onDiscard,
    onOpenReport,
}: JourneyCardProps) {
    const lastDone = [...journey.steps].reverse().find((s) => s.session)
    return (
        <div
            className={`${CARD_CLASS} p-5 sm:p-6 ${
                busy ? '!border-primary shadow-[0_0_40px_rgba(12,175,96,0.2)]' : ''
            }`}
        >
            <div className="flex items-center gap-4">
                <RingAvatar src={persona.avatar} size={56} />
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                        {persona.name}
                    </h3>
                    <p className="truncate text-sm font-semibold text-primary">{roleLabel}</p>
                </div>
                <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        journey.completed
                            ? 'border-primary/30 bg-primary/10 text-primary'
                            : 'border-amber-300/60 bg-amber-100/70 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300'
                    }`}
                >
                    {journey.completed ? 'Completed' : 'In progress'}
                </span>
            </div>

            {/* The three modes, in order */}
            <ol className="mt-6 grid grid-cols-3">
                {journey.steps.map((step, i) => {
                    const done = Boolean(step.session)
                    const isNext = step.mode === journey.nextMode
                    const prevDone = i > 0 && Boolean(journey.steps[i - 1].session)
                    return (
                        <li key={step.mode} className="relative flex flex-col items-center text-center">
                            {i > 0 && (
                                <span
                                    aria-hidden
                                    className={`absolute right-1/2 top-[18px] h-0.5 w-full -translate-y-1/2 ${
                                        done && prevDone
                                            ? 'bg-primary'
                                            : (done || isNext) && prevDone
                                              ? 'bg-gradient-to-r from-primary to-primary/25'
                                              : 'bg-gray-200 dark:bg-white/10'
                                    }`}
                                />
                            )}
                            <span
                                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold backdrop-blur-md ${
                                    done
                                        ? 'border-primary bg-primary text-white shadow-[0_0_18px_rgba(12,175,96,0.45)]'
                                        : isNext
                                          ? 'border-primary bg-white/70 text-primary ring-4 ring-primary/15 dark:bg-black/45'
                                          : 'border-gray-300 bg-white/70 text-gray-400 dark:border-white/15 dark:bg-black/45 dark:text-gray-500'
                                }`}
                            >
                                {done ? (
                                    <HiCheck className="h-5 w-5" />
                                ) : isNext ? (
                                    i + 1
                                ) : (
                                    <HiLockClosed className="h-4 w-4" />
                                )}
                            </span>
                            <span
                                className={`mt-2.5 text-sm font-semibold ${
                                    done || isNext ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                                }`}
                            >
                                {formatModeName(step.mode)}
                            </span>
                            {done && step.session ? (
                                <button
                                    type="button"
                                    onClick={() => onOpenReport(step.session!.session_id)}
                                    className="mt-0.5 text-xs font-medium text-primary underline-offset-2 hover:underline"
                                >
                                    {step.score != null ? `Score ${step.score} · report` : 'View report'}
                                </button>
                            ) : (
                                <span
                                    className={`mt-0.5 text-xs ${
                                        isNext ? 'font-semibold text-primary' : 'text-gray-400 dark:text-gray-500'
                                    }`}
                                >
                                    {isNext ? 'Up next' : 'Locked'}
                                </span>
                            )}
                        </li>
                    )
                })}
            </ol>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
                <p className="shrink-0 text-xs leading-tight text-gray-500 dark:text-gray-400">
                    Last session
                    <span className="mt-0.5 block whitespace-nowrap font-semibold text-gray-700 dark:text-gray-200">
                        {formatDate(journey.lastActivity)}
                    </span>
                </p>
                {journey.nextMode ? (
                    <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={onDiscard}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 transition hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-60 dark:text-gray-400"
                    >
                        <HiOutlineTrash className="h-4 w-4" />
                        Discard
                    </button>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={onContinue}
                        className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(12,175,96,0.3)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
                    >
                        {busy && <Spinner size={16} enableTheme={false} className="text-white" />}
                        {busy ? 'Starting…' : `Continue to ${formatModeName(journey.nextMode)}`}
                        {!busy && <HiArrowRight className="h-4 w-4" />}
                    </button>
                    </div>
                ) : lastDone?.session ? (
                    <button
                        type="button"
                        onClick={() => onOpenReport(lastDone.session!.session_id)}
                        className="app-liquid-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-100"
                    >
                        View closing report
                        <HiArrowRight className="h-4 w-4" />
                    </button>
                ) : null}
            </div>
        </div>
    )
}
