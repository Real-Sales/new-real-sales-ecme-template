import { useState } from 'react'
import Progress from '@/components/ui/Progress'
import classNames from '@/utils/classNames'
import { TbChevronDown } from 'react-icons/tb'
import { motion, AnimatePresence } from 'framer-motion'
import { NumericFormat } from 'react-number-format'
import type { ModeType } from './memberPerformanceData'

type ModeData = {
    score: number
    sessions: number
}

type PerformanceByModeProps = {
    modeData: Record<ModeType, ModeData>
}

type ModeItemProps = {
    mode: ModeType
    label: string
    data: ModeData
    defaultExpand?: boolean
}

const ModeItem = ({ mode, label, data, defaultExpand = false }: ModeItemProps) => {
    const [expanded, setExpanded] = useState(defaultExpand)


    const getProgressColor = (mode: ModeType) => {
        switch (mode) {
            case 'prospecting':
                return 'bg-blue-500'
            case 'discovering':
                return 'bg-green-500'
            case 'closing':
                return 'bg-red-500'
        }
    }

    const getBorderColor = (mode: ModeType) => {
        switch (mode) {
            case 'prospecting':
                return 'border-l-4 border-l-blue-500 border-t border-t-gray-200 dark:border-t-gray-700 border-b border-b-gray-200 dark:border-b-gray-700 border-r border-r-gray-200 dark:border-r-gray-700'
            case 'discovering':
                return 'border-l-4 border-l-green-500 border-t border-t-gray-200 dark:border-t-gray-700 border-b border-b-gray-200 dark:border-b-gray-700 border-r border-r-gray-200 dark:border-r-gray-700'
            case 'closing':
                return 'border-l-4 border-l-red-500 border-t border-t-gray-200 dark:border-t-gray-700 border-b border-b-gray-200 dark:border-b-gray-700 border-r border-r-gray-200 dark:border-r-gray-700'
        }
    }

    return (
        <div className={classNames(
            "rounded-lg mb-3 overflow-hidden transition-all shadow-md hover:shadow-lg bg-gray-50 dark:bg-gray-800/50",
            getBorderColor(mode)
        )}>
            <div
                className="px-4 py-3 cursor-pointer hover:opacity-90 transition-all"
                role="button"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <h5 className="font-bold text-base text-gray-900 dark:text-white">
                            {label}
                        </h5>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                                Overall Score
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                <NumericFormat
                                    displayType="text"
                                    value={data.score}
                                    suffix="/100"
                                    decimalScale={1}
                                    fixedDecimalScale
                                />
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                                Sessions
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {data.sessions}
                            </div>
                        </div>
                        <TbChevronDown 
                            className={classNames(
                                "text-xl text-gray-600 dark:text-gray-400 transition-transform",
                                expanded && "rotate-180"
                            )}
                        />
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-4 pb-4 pt-2">
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Performance
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        <NumericFormat
                                            displayType="text"
                                            value={data.score}
                                            suffix="/100"
                                            decimalScale={1}
                                            fixedDecimalScale
                                        />
                                    </span>
                                </div>
                                <Progress
                                    percent={data.score}
                                    showInfo={false}
                                    customColorClass={getProgressColor(mode)}
                                />
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Sessions Completed
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {data.sessions}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const PerformanceByMode = ({ modeData }: PerformanceByModeProps) => {
    return (
        <>
            {/* Header Section - Outside Card */}
            <div className="mb-4">
                <h4 className="text-lg font-bold mb-1">Performance by Mode</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Detailed breakdown of performance across different interaction modes.</p>
            </div>

            {/* Performance Cards */}
            <div className="mb-6">
                <ModeItem
                    mode="prospecting"
                    label="Prospecting"
                    data={modeData.prospecting}
                />
                <ModeItem
                    mode="discovering"
                    label="Discovering"
                    data={modeData.discovering}
                />
                <ModeItem
                    mode="closing"
                    label="Closing"
                    data={modeData.closing}
                />
            </div>
        </>
    )
}

export default PerformanceByMode
