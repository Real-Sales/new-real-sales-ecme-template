import type { ConversationMode } from '@/components/shared/SessionSetupPanel'
import { Reveal } from './common'
import ModeCardsGrid from './ModeCardsGrid'
import type { OverviewData } from './useOverviewData'

const StartTraining = ({
    data,
    onSelectMode,
}: {
    data: OverviewData
    onSelectMode: (mode?: ConversationMode) => void
}) => {
    return (
        <section className="px-4 py-16 md:py-20">
            <div className="max-w-7xl mx-auto">
                <Reveal className="mb-10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl md:text-[2rem] font-bold tracking-tight text-gray-900 dark:text-white">
                                Start training
                            </h2>
                            <p className="mt-2 max-w-lg text-sm md:text-base text-gray-500 dark:text-gray-400">
                                Choose an AI buyer to practice with. You&apos;ll pick
                                prospecting, discovery, or closing after you select a
                                persona.
                            </p>
                        </div>
                    </div>
                </Reveal>

                <ModeCardsGrid
                    recommendedModeName={
                        data.recommendedPractice?.mode ?? 'Prospecting'
                    }
                    onSelectMode={() => onSelectMode()}
                />
            </div>
        </section>
    )
}

export default StartTraining
