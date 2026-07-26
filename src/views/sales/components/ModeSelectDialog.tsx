import Dialog from '@/components/ui/Dialog'
import type { ConversationMode } from '@/components/shared/SessionSetupPanel'
import type { AIPersona } from '@/components/shared/SessionSetupPanel'
import ModeCardsGrid from '@/views/sales/OverviewWidgets/ModeCardsGrid'

type ModeSelectDialogProps = {
    isOpen: boolean
    persona: AIPersona | null
    onClose: () => void
    onSelectMode: (mode: ConversationMode) => void
    /** Defaults to Prospecting (recommended). */
    recommendedModeName?: string
}

const ModeSelectDialog = ({
    isOpen,
    persona,
    onClose,
    onSelectMode,
    recommendedModeName = 'Prospecting',
}: ModeSelectDialogProps) => {
    return (
        <Dialog
            isOpen={isOpen}
            width={920}
            contentClassName="mt-[8vh] max-w-[920px]"
            onClose={onClose}
            onRequestClose={onClose}
        >
            <div className="mb-6 pr-6">
                <h4 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Start training
                </h4>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                    {persona ? (
                        <>
                            Pick the conversation mode for{' '}
                            <span className="font-semibold text-primary">
                                {persona.name}
                            </span>
                            . Each mode drops you into a live AI roleplay.
                        </>
                    ) : (
                        'Pick the conversation you want to get better at. Each mode drops you straight into a live AI roleplay.'
                    )}
                </p>
            </div>

            <ModeCardsGrid
                compact
                recommendedModeName={recommendedModeName}
                onSelectMode={onSelectMode}
            />
        </Dialog>
    )
}

export default ModeSelectDialog
