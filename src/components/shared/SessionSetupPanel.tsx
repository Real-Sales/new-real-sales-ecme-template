import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, Button, Upload } from '@/components/ui'
import {
    HiOutlineUserGroup,
    HiOutlineSearchCircle,
    HiOutlineCheckCircle,
    HiOutlineDocument,
    HiOutlineCloudUpload,
    HiArrowRight,
    HiArrowLeft,
    HiX,
} from 'react-icons/hi'
import type { ReactNode } from 'react'

export type ConversationMode = 'prospecting' | 'discovering' | 'closing'

export interface AIPersona {
    id: string
    name: string
    role: string
    company: string
    industry: string
    personality: string
    avatar?: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
}

interface ModeOption {
    id: ConversationMode
    name: string
    goal: string
    icon: ReactNode
    color: string
}

interface SessionSetupPanelProps {
    isOpen: boolean
    onClose: () => void
    onNavigateToPersonas: (mode: ConversationMode, scenarios?: string[], files?: File[]) => void
}

const modes: ModeOption[] = [
    {
        id: 'prospecting',
        name: 'Prospecting',
        goal: 'Build rapport and create new opportunities',
        icon: <HiOutlineUserGroup className="w-5 h-5" />,
        color: 'from-blue-500 to-blue-600',
    },
    {
        id: 'discovering',
        name: 'Discovering',
        goal: 'Uncover needs and qualify potential',
        icon: <HiOutlineSearchCircle className="w-5 h-5" />,
        color: 'from-indigo-500 to-indigo-600',
    },
    {
        id: 'closing',
        name: 'Closing',
        goal: 'Navigate objections and secure commitment',
        icon: <HiOutlineCheckCircle className="w-5 h-5" />,
        color: 'from-purple-500 to-purple-600',
    },
]

const SessionSetupPanel = ({
    isOpen,
    onClose,
    onNavigateToPersonas,
}: SessionSetupPanelProps) => {
    const [step, setStep] = useState<1 | 2>(1)
    const [selectedMode, setSelectedMode] = useState<ConversationMode | null>(
        null
    )
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

    const isClosingMode = selectedMode === 'closing'
    const hasSecondStep = isClosingMode
    const totalSteps = hasSecondStep ? 2 : 1

    const handleModeSelect = (mode: ConversationMode) => {
        setSelectedMode(mode)
    }

    const handleContinue = () => {
        if (step === 1 && selectedMode) {
            if (isClosingMode) {
                setStep(2)
            } else {
                onNavigateToPersonas(selectedMode, [], [])
                handleClose()
            }
        }
    }

    const handleBack = () => {
        if (step === 2) {
            setStep(1)
        }
    }

    const handleProceedToPersonas = () => {
        if (selectedMode) {
            onNavigateToPersonas(selectedMode, [], uploadedFiles)
            handleClose()
        }
    }

    const handleSkipAndProceed = () => {
        if (selectedMode) {
            onNavigateToPersonas(selectedMode, [], [])
            handleClose()
        }
    }

    const handleClose = () => {
        setTimeout(() => {
            setStep(1)
            setSelectedMode(null)
            setUploadedFiles([])
        }, 300)
        onClose()
    }

    const handleFileChange = (files: File[]) => {
        setUploadedFiles(files)
    }

    const removeFile = (file: File) => {
        setUploadedFiles((prev) => prev.filter((f) => f !== file))
    }

    return (
        <>
            <Dialog
                isOpen={isOpen}
                onClose={handleClose}
                width={560}
                closable={false}
                style={{
                    content: {
                        maxHeight: 'calc(100vh - 1.5rem)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    },
                }}
                className="overflow-hidden"
                contentClassName="!flex !flex-col !min-h-0 !p-0 !overflow-hidden !bg-gray-50 dark:!bg-gray-900"
                overlayClassName="!flex !items-center !justify-center !p-4"
            >
            <div className="relative flex flex-col min-h-0 flex-1 w-full max-w-full overflow-hidden">
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            Start a Session
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Step {step} of {totalSteps}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Bar - only show when Closing mode has 2 steps */}
                {hasSecondStep && (
                    <div className="flex-shrink-0 relative h-1 bg-gray-200 dark:bg-gray-700">
                        <motion.div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary-deep"
                            initial={{ width: '0%' }}
                            animate={{
                                width: step === 1 ? '50%' : '100%',
                            }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-hidden w-full flex flex-col px-4 sm:px-6 py-3 sm:py-4">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <div className="mb-3 w-full">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-0.5">
                                        Choose Your Conversation Mode
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        Select what you'd like to practice today
                                    </p>
                                </div>

                                <div className="space-y-1.5 w-full">
                                    {modes.map((mode) => {
                                        const isSelected =
                                            selectedMode === mode.id
                                        const isOtherSelected =
                                            selectedMode &&
                                            selectedMode !== mode.id

                                        return (
                                            <motion.button
                                                key={mode.id}
                                                onClick={() =>
                                                    handleModeSelect(mode.id)
                                                }
                                                className={`
                                                    relative w-full p-2.5 sm:p-3 rounded-lg border-2 transition-all duration-300
                                                    ${
                                                        isSelected
                                                            ? 'border-primary bg-primary-subtle dark:border-primary dark:bg-primary-subtle shadow-md'
                                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }
                                                    ${
                                                        isOtherSelected
                                                            ? 'opacity-50'
                                                            : 'opacity-100'
                                                    }
                                                    hover:border-primary-mild dark:hover:border-primary hover:shadow-lg
                                                `}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`
                                                        flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg
                                                        bg-gradient-to-br ${mode.color}
                                                        text-white shadow-sm
                                                    `}
                                                    >
                                                        {mode.icon}
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                                                {mode.name}
                                                            </h4>
                                                            {isSelected && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                                                                >
                                                                    <HiOutlineCheckCircle className="w-3 h-3 text-white" />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                            {mode.goal}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && isClosingMode && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <div className="mb-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        Add Context (Optional)
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        Upload relevant files to personalize your
                                        Closing session
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-purple-50/80 to-transparent dark:from-purple-500/10 dark:to-transparent">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <HiOutlineDocument className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Upload Files
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                PDF, DOC, or images — add context for your Closing session
                                            </p>
                                        </div>
                                    </div>

                                    <Upload
                                        onChange={handleFileChange}
                                        multiple
                                        draggable
                                        showList={false}
                                        className="group relative border-0 border-t border-dashed border-gray-200 dark:border-gray-600 rounded-none bg-gray-50/50 dark:bg-gray-800/30 hover:bg-purple-50/30 dark:hover:bg-purple-500/5 hover:border-purple-400/50 dark:hover:border-purple-500/50 transition-all duration-200 cursor-pointer"
                                    >
                                        <div className="py-6 sm:py-8 px-4 text-center">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-500 dark:text-purple-400 mb-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/30 group-hover:scale-110 transition-all duration-200">
                                                <HiOutlineCloudUpload className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Drop files here or <span className="text-purple-500 dark:text-purple-400 font-semibold">browse</span>
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Supports multiple files
                                            </p>
                                        </div>
                                    </Upload>

                                    {uploadedFiles.length > 0 && (
                                        <div className="p-3 space-y-2 border-t border-gray-100 dark:border-gray-700/50">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
                                                {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} added
                                            </p>
                                            {uploadedFiles.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-gray-700/80 border border-gray-100 dark:border-gray-600 shadow-sm"
                                                >
                                                    <HiOutlineDocument className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                                                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate flex-1 min-w-0">
                                                        {file.name}
                                                    </span>
                                                    <button
                                                        onClick={() => removeFile(file)}
                                                        className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <HiX className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        {step === 1 ? (
                            <>
                                <div className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1 text-center sm:text-left">
                                    {isClosingMode
                                        ? 'Continue to add optional files'
                                        : 'Select a mode to continue'}
                                </div>
                                <Button
                                    variant="solid"
                                    size="sm"
                                    disabled={!selectedMode}
                                    onClick={handleContinue}
                                    className="bg-primary hover:bg-primary-deep text-white disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto"
                                    icon={<HiArrowRight className="w-4 h-4" />}
                                    iconAlignment="end"
                                >
                                    {isClosingMode
                                        ? 'Continue'
                                        : 'Choose Persona'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="plain"
                                    size="sm"
                                    onClick={handleBack}
                                    icon={<HiArrowLeft className="w-4 h-4" />}
                                    className="text-gray-600 dark:text-gray-400 w-full sm:w-auto"
                                >
                                    Back
                                </Button>
                                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                                    <Button
                                        variant="plain"
                                        size="sm"
                                        onClick={handleSkipAndProceed}
                                        className="text-gray-600 dark:text-gray-400 w-full sm:w-auto"
                                    >
                                        Skip
                                    </Button>
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        onClick={handleProceedToPersonas}
                                        className="bg-primary hover:bg-primary-deep text-white w-full sm:w-auto"
                                        icon={
                                            <HiArrowRight className="w-4 h-4" />
                                        }
                                        iconAlignment="end"
                                    >
                                        Choose Persona
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Dialog>
        </>
    )
}

export default SessionSetupPanel
