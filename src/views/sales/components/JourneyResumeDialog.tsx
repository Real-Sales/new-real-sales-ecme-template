import Dialog from '@/components/ui/Dialog'
import { Avatar } from '@/components/ui'
import ScrollBar from '@/components/ui/ScrollBar'
import { HiArrowRight, HiCheck, HiLockClosed, HiOutlineTrash, HiPlus } from 'react-icons/hi'
import type { AIPersona } from '@/components/shared/SessionSetupPanel'
import { formatModeName } from '@/utils/modePipeline'
import type { PersonaJourney } from '@/views/sales/personaJourneys'

type JourneyResumeDialogProps = {
    isOpen: boolean
    persona: AIPersona | null
    /** This persona's journeys that still have a mode to go, most recent first. */
    journeys: PersonaJourney[]
    onClose: () => void
    /** Carry on with the next mode of one of the existing journeys. */
    onContinue: (journey: PersonaJourney) => void
    onDiscard: (journey: PersonaJourney) => void
    /** Leave the existing journeys alone and pick a mode for a fresh conversation. */
    onStartNew: () => void
}

const shortDate = (time: number) =>
    time ? new Date(time).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : ''

/** Shown when the rep picks a persona they are already part-way through one or more journeys with. */
const JourneyResumeDialog = ({
    isOpen,
    persona,
    journeys,
    onClose,
    onContinue,
    onDiscard,
    onStartNew,
}: JourneyResumeDialogProps) => {
    const firstName = persona?.name.split(' ')[0] ?? ''
    const many = journeys.length > 1
    return (
        <Dialog
            isOpen={isOpen}
            width={560}
            contentClassName="mt-[10vh] max-w-[560px]"
            onClose={onClose}
            onRequestClose={onClose}
        >
            {persona && journeys.length > 0 && (
                <>
                    <div className="flex items-center gap-4 pr-8">
                        <span className="inline-flex shrink-0 rounded-full bg-gradient-to-br from-primary via-emerald-300/40 to-cyan-400/70 p-[2px] shadow-[0_8px_24px_rgba(12,175,96,0.25)]">
                            <Avatar size={56} src={persona.avatar} shape="circle" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                {many ? `${journeys.length} journeys in progress` : 'Journey in progress'}
                            </p>
                            <h4 className="mt-0.5 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Pick up where you left off?
                            </h4>
                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                {firstName} remembers your earlier conversation{many ? 's' : ''}.
                            </p>
                        </div>
                    </div>

                    <ScrollBar className="-mx-1 mt-5 max-h-[46vh]" autoHide={false}>
                    <ul className={`space-y-3 py-1 pl-1 ${journeys.length > 1 ? 'pr-4' : 'pr-1'}`}>
                        {journeys.map((journey, index) => {
                            const latest = index === 0
                            return (
                                <li
                                    key={journey.journeyId}
                                    className={`rounded-2xl border p-4 ${
                                        latest
                                            ? 'border-primary/40 shadow-[0_0_28px_rgba(12,175,96,0.12)]'
                                            : 'border-gray-200 dark:border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {many && latest && (
                                                <span className="mr-2 rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">
                                                    Most recent
                                                </span>
                                            )}
                                            Last session {shortDate(journey.lastActivity)}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => onDiscard(journey)}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-gray-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                                        >
                                            <HiOutlineTrash className="h-3.5 w-3.5" />
                                            Discard
                                        </button>
                                    </div>

                                    {/* The three modes of this journey */}
                                    <ol className="mt-3 grid grid-cols-3 gap-2">
                                        {journey.steps.map((step) => {
                                            const done = Boolean(step.session)
                                            const isNext = step.mode === journey.nextMode
                                            return (
                                                <li
                                                    key={step.mode}
                                                    className={`rounded-xl border px-2.5 py-2 ${
                                                        done
                                                            ? 'border-primary/30 bg-primary/10'
                                                            : isNext
                                                              ? 'border-primary/60 border-dashed'
                                                              : 'border-gray-200 opacity-60 dark:border-white/10'
                                                    }`}
                                                >
                                                    <p
                                                        className={`flex items-center gap-1.5 text-xs font-bold ${
                                                            done || isNext
                                                                ? 'text-gray-900 dark:text-white'
                                                                : 'text-gray-500 dark:text-gray-400'
                                                        }`}
                                                    >
                                                        {done ? (
                                                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                                                                <HiCheck className="h-3 w-3" />
                                                            </span>
                                                        ) : isNext ? (
                                                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                                                        ) : (
                                                            <HiLockClosed className="h-3.5 w-3.5 shrink-0" />
                                                        )}
                                                        <span className="truncate">{formatModeName(step.mode)}</span>
                                                    </p>
                                                    <p
                                                        className={`mt-0.5 text-[11px] ${
                                                            isNext
                                                                ? 'font-semibold text-primary'
                                                                : 'text-gray-500 dark:text-gray-400'
                                                        }`}
                                                    >
                                                        {done
                                                            ? step.score != null
                                                                ? `Score ${step.score}`
                                                                : 'Completed'
                                                            : isNext
                                                              ? 'Up next'
                                                              : 'Locked'}
                                                    </p>
                                                </li>
                                            )
                                        })}
                                    </ol>

                                    <button
                                        type="button"
                                        onClick={() => onContinue(journey)}
                                        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                                            latest
                                                ? 'bg-primary text-white shadow-[0_8px_24px_rgba(12,175,96,0.3)] hover:brightness-110'
                                                : 'border border-primary/50 text-primary hover:bg-primary hover:text-white'
                                        }`}
                                    >
                                        Continue to {formatModeName(journey.nextMode as string)}
                                        <HiArrowRight className="h-4 w-4" />
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                    </ScrollBar>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
                        <p className="min-w-0 flex-1 text-xs text-gray-500 dark:text-gray-400">
                            Or start a separate conversation. {many ? 'These journeys stay' : 'This journey stays'}{' '}
                            as {many ? 'they are' : 'it is'}.
                        </p>
                        <button
                            type="button"
                            onClick={onStartNew}
                            className="app-liquid-btn inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-100"
                        >
                            <HiPlus className="h-4 w-4" />
                            Start a new conversation
                        </button>
                    </div>
                </>
            )}
        </Dialog>
    )
}

export default JourneyResumeDialog
