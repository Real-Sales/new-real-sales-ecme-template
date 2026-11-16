import { motion } from 'framer-motion'
import {
    TbUserSearch,
    TbCompass,
    TbTargetArrow,
    TbArrowUpRight,
    TbSparkles,
} from 'react-icons/tb'
import type { ConversationMode } from '@/components/shared/SessionSetupPanel'
import { StaggerGroup, StaggerItem, EASE_OUT } from './common'

export type ModeCard = {
    id: ConversationMode
    name: string
    goal: string
    icon: React.ReactNode
    accent: string
}

export const TRAINING_MODE_CARDS: ModeCard[] = [
    {
        id: 'prospecting',
        name: 'Prospecting',
        goal: 'Open cold conversations and earn the right to a second call.',
        icon: <TbUserSearch className="h-6 w-6" />,
        accent: 'from-primary/25 to-primary/0',
    },
    {
        id: 'discovering',
        name: 'Discovery',
        goal: 'Uncover real needs and qualify before you pitch anything.',
        icon: <TbCompass className="h-6 w-6" />,
        accent: 'from-primary-mild/25 to-primary/0',
    },
    {
        id: 'closing',
        name: 'Closing',
        goal: 'Handle objections and negotiate a real commitment.',
        icon: <TbTargetArrow className="h-6 w-6" />,
        accent: 'from-primary-deep/25 to-primary/0',
    },
]

type ModeCardsGridProps = {
    onSelectMode: (mode: ConversationMode) => void
    /** Mode name shown with the Recommended badge (defaults to Prospecting). */
    recommendedModeName?: string
    className?: string
    compact?: boolean
}

/** Shared mode cards used on Overview and the persona mode-select dialog. */
const ModeCardsGrid = ({
    onSelectMode,
    recommendedModeName = 'Prospecting',
    className = 'grid gap-5 md:grid-cols-3',
    compact = false,
}: ModeCardsGridProps) => {
    return (
        <StaggerGroup className={className} gap={0.08}>
            {TRAINING_MODE_CARDS.map((mode) => {
                const isRecommended =
                    recommendedModeName.toLowerCase() === mode.name.toLowerCase()
                return (
                    <StaggerItem key={mode.id}>
                        <motion.button
                            type="button"
                            onClick={() => onSelectMode(mode.id)}
                            whileHover={{ y: -6 }}
                            whileTap={{ scale: 0.985 }}
                            transition={{ duration: 0.35, ease: EASE_OUT }}
                            data-tour-id={`mode-${mode.id}`}
                            className={`group relative w-full overflow-hidden rounded-[1.75rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/60 text-left shadow-sm hover:shadow-xl hover:border-primary/40 transition-shadow duration-300 ${
                                compact ? 'p-5' : 'p-7'
                            }`}
                        >
                            <div
                                className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${mode.accent} blur-2xl transition-opacity duration-300 opacity-70 group-hover:opacity-100`}
                            />

                            {isRecommended && (
                                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary ring-1 ring-primary/20">
                                    <TbSparkles className="h-3 w-3" />
                                    Recommended
                                </span>
                            )}

                            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                {mode.icon}
                            </div>

                            <h3
                                className={`relative font-bold text-gray-900 dark:text-white ${
                                    compact ? 'mt-4 text-lg' : 'mt-6 text-xl'
                                }`}
                            >
                                {mode.name}
                            </h3>
                            <p className="relative mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                {mode.goal}
                            </p>

                            <div className="relative mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                                Select persona
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                    <TbArrowUpRight className="h-3.5 w-3.5" />
                                </span>
                            </div>
                        </motion.button>
                    </StaggerItem>
                )
            })}
        </StaggerGroup>
    )
}

export default ModeCardsGrid
