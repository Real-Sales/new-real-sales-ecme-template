import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, Button, Upload } from '@/components/ui'
import {
    HiOutlineUserGroup,
    HiOutlineSearchCircle,
    HiOutlineCheckCircle,
    HiOutlineDocument,
    HiOutlineFolder,
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
        icon: <HiOutlineUserGroup className="w-6 h-6" />,
        color: 'from-blue-500 to-blue-600',
    },
    {
        id: 'discovering',
        name: 'Discovering',
        goal: 'Uncover needs and qualify potential',
        icon: <HiOutlineSearchCircle className="w-6 h-6" />,
        color: 'from-indigo-500 to-indigo-600',
    },
    {
        id: 'closing',
        name: 'Closing',
        goal: 'Navigate objections and secure commitment',
        icon: <HiOutlineCheckCircle className="w-6 h-6" />,
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
    const [hoveredMode, setHoveredMode] = useState<ConversationMode | null>(
        null
    )
    const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

    const handleModeSelect = (mode: ConversationMode) => {
        setSelectedMode(mode)
    }

    const handleContinue = () => {
        if (step === 1 && selectedMode) {
            setStep(2)
        }
    }

    const handleBack = () => {
        if (step === 2) {
            setStep(1)
        }
    }

    const handleProceedToPersonas = () => {
        if (selectedMode) {
            onNavigateToPersonas(selectedMode, selectedScenarios, uploadedFiles)
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
        // Reset state
        setTimeout(() => {
            setStep(1)
            setSelectedMode(null)
            setSelectedScenarios([])
            setUploadedFiles([])
        }, 300)
        onClose()
    }

    const handleFileChange = (files: File[]) => {
        setUploadedFiles(files)
    }

    const removeScenario = (scenario: string) => {
        setSelectedScenarios((prev) => prev.filter((s) => s !== scenario))
    }

    const removeFile = (file: File) => {
        setUploadedFiles((prev) => prev.filter((f) => f !== file))
    }

    // Available scenarios (mock data - replace with real data)
    const availableScenarios = [
        'Cold Call Introduction',
        'Discovery Meeting',
        'Price Negotiation',
        'Handling Objections',
    ]

    return (
        <>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #475569;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
            <Dialog
                isOpen={isOpen}
                onClose={handleClose}
                width={720}
                closable={false}
                className="overflow-hidden"
            >
            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Start a Session
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Step {step} of 2
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <HiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="relative h-1 bg-gray-100 dark:bg-gray-800">
                    <motion.div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600"
                        initial={{ width: '0%' }}
                        animate={{ 
                            width: step === 1 ? '50%' : '100%' 
                        }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                </div>

                {/* Content */}
                <div className="px-8 py-8 min-h-[480px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        Choose Your Conversation Mode
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Select what you'd like to practice today
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {modes.map((mode) => {
                                        const isSelected =
                                            selectedMode === mode.id
                                        const isHovered =
                                            hoveredMode === mode.id
                                        const isOtherSelected =
                                            selectedMode &&
                                            selectedMode !== mode.id

                                        return (
                                            <motion.button
                                                key={mode.id}
                                                onClick={() =>
                                                    handleModeSelect(mode.id)
                                                }
                                                onMouseEnter={() =>
                                                    setHoveredMode(mode.id)
                                                }
                                                onMouseLeave={() =>
                                                    setHoveredMode(null)
                                                }
                                                className={`
                                                    relative w-full p-6 rounded-2xl border-2 transition-all duration-300
                                                    ${
                                                        isSelected
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                                    }
                                                    ${
                                                        isOtherSelected
                                                            ? 'opacity-40'
                                                            : 'opacity-100'
                                                    }
                                                    hover:border-blue-400 hover:shadow-lg
                                                `}
                                                whileHover={{
                                                    scale: isOtherSelected
                                                        ? 1
                                                        : 1.02,
                                                }}
                                                whileTap={{
                                                    scale: 0.98,
                                                }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`
                                                        flex items-center justify-center w-14 h-14 rounded-xl
                                                        bg-gradient-to-br ${mode.color}
                                                        text-white shadow-lg
                                                        transition-transform duration-300
                                                        ${
                                                            isSelected ||
                                                            isHovered
                                                                ? 'scale-110'
                                                                : 'scale-100'
                                                        }
                                                    `}
                                                    >
                                                        {mode.icon}
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                {mode.name}
                                                            </h4>
                                                            {isSelected && (
                                                                <motion.div
                                                                    initial={{
                                                                        scale: 0,
                                                                    }}
                                                                    animate={{
                                                                        scale: 1,
                                                                    }}
                                                                    className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
                                                                >
                                                                    <HiOutlineCheckCircle className="w-4 h-4 text-white" />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
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

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        Add Context (Optional)
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Choose a scenario or upload relevant
                                        files to personalize your session
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* Scenario Selection */}
                                    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                                <HiOutlineFolder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    Choose Scenario
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Select from pre-built
                                                    scenarios
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {availableScenarios.map(
                                                (scenario) => {
                                                    const isSelected =
                                                        selectedScenarios.includes(
                                                            scenario
                                                        )
                                                    return (
                                                        <button
                                                            key={scenario}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    removeScenario(
                                                                        scenario
                                                                    )
                                                                } else {
                                                                    setSelectedScenarios(
                                                                        (
                                                                            prev
                                                                        ) => [
                                                                            ...prev,
                                                                            scenario,
                                                                        ]
                                                                    )
                                                                }
                                                            }}
                                                            className={`
                                                                px-4 py-2 rounded-lg text-sm font-medium transition-all
                                                                ${
                                                                    isSelected
                                                                        ? 'bg-blue-500 text-white shadow-md'
                                                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                                                }
                                                            `}
                                                        >
                                                            {scenario}
                                                        </button>
                                                    )
                                                }
                                            )}
                                        </div>
                                    </div>

                                    {/* File Upload */}
                                    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                                                <HiOutlineDocument className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    Upload Files
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Add context documents or
                                                    materials
                                                </p>
                                            </div>
                                        </div>

                                        <Upload
                                            onChange={handleFileChange}
                                            multiple
                                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
                                        >
                                            <div className="py-8 text-center">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Drop files here or click to
                                                    browse
                                                </p>
                                            </div>
                                        </Upload>

                                        {uploadedFiles.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                {uploadedFiles.map(
                                                    (file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg"
                                                        >
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                {file.name}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    removeFile(
                                                                        file
                                                                    )
                                                                }
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <HiX className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        {step === 1 ? (
                            <>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Select a mode to continue
                                </div>
                                <Button
                                    variant="solid"
                                    size="lg"
                                    disabled={!selectedMode}
                                    onClick={handleContinue}
                                    className="bg-primary hover:bg-primary-deep text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    icon={<HiArrowRight className="w-5 h-5" />}
                                    iconAlignment="end"
                                >
                                    Continue
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="plain"
                                    size="lg"
                                    onClick={handleBack}
                                    icon={<HiArrowLeft className="w-5 h-5" />}
                                    className="text-gray-600 dark:text-gray-400"
                                >
                                    Back
                                </Button>
                                <div className="flex gap-3">
                                    <Button
                                        variant="plain"
                                        size="lg"
                                        onClick={handleSkipAndProceed}
                                        className="text-gray-600 dark:text-gray-400"
                                    >
                                        Skip
                                    </Button>
                                    <Button
                                        variant="solid"
                                        size="lg"
                                        onClick={handleProceedToPersonas}
                                        className="bg-primary hover:bg-primary-deep text-white"
                                        icon={
                                            <HiArrowRight className="w-5 h-5" />
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
