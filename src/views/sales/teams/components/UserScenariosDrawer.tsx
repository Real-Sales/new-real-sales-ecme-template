import { useState } from 'react'
import Drawer from '@/components/ui/Drawer'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ScenarioDetail from '@/views/sales/ScenarioList/components/ScenarioDetail'
import classNames from '@/utils/classNames'
import { TbChevronDown, TbAlertCircle, TbChecks, TbTrash, TbDownload, TbClock, TbArrowRight } from 'react-icons/tb'
import { motion, AnimatePresence } from 'framer-motion'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    downloadPerformanceReportPdf,
    getPerformanceReportPdfErrorMessage,
} from '@/services/SessionService'
import { MODE_PIPELINE_ORDER, formatModeName } from '@/utils/modePipeline'

type UserScenariosDrawerProps = {
    isOpen: boolean
    onClose: () => void
    user: {
        userId: string
        userName: string
        userEmail: string
        userImg?: string
    } | null
    scenarios: any[]
    onUnassignScenario?: (sessionId: string) => void
    onAdvanceScenario?: (scenarioId: string, sessionId: string) => void
}

/** Next mode name after `currentModeName` in this scenario's configured
 * sequence, or null if there isn't one (single-mode scenario, or already at
 * the last configured mode). */
function nextConfiguredMode(currentModeName: string | undefined, modeSequenceNames: string[] | undefined): string | null {
    if (!currentModeName || !modeSequenceNames || modeSequenceNames.length < 2) return null
    const currentOrder = MODE_PIPELINE_ORDER[currentModeName.toLowerCase()]
    if (currentOrder === undefined) return null
    const nextOrders = modeSequenceNames
        .map((n) => MODE_PIPELINE_ORDER[n.toLowerCase()])
        .filter((o): o is number => o !== undefined && o > currentOrder)
    if (nextOrders.length === 0) return null
    const nextOrder = Math.min(...nextOrders)
    return modeSequenceNames.find((n) => MODE_PIPELINE_ORDER[n.toLowerCase()] === nextOrder) ?? null
}

type AccordionItemProps = {
    title: string
    count: number
    icon: React.ReactNode
    iconBgColor: string
    borderColor: string
    scenarios: any[]
    defaultOpen?: boolean
    showDeleteButton?: boolean
    showDownloadButton?: boolean
    showAdvanceButton?: boolean
    onDeleteScenario?: (sessionId: string) => void
    onDownloadReport?: (sessionId: string) => void
    onAdvanceScenario?: (scenarioId: string, sessionId: string) => void
}

const AccordionItem = ({
    title,
    count,
    icon,
    iconBgColor,
    borderColor,
    scenarios,
    defaultOpen = false,
    showDeleteButton = false,
    showDownloadButton = false,
    showAdvanceButton = false,
    onDeleteScenario,
    onDownloadReport,
    onAdvanceScenario,
}: AccordionItemProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={`border-l-4 ${borderColor} border-t border-t-gray-200 dark:border-t-gray-700 border-b border-b-gray-200 dark:border-b-gray-700 border-r border-r-gray-200 dark:border-r-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all bg-gray-50 dark:bg-gray-800/50`}>
            <button
                className="w-full flex items-center justify-between p-4 hover:opacity-90 transition-all cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className={`${iconBgColor} rounded-lg p-2 text-white`}>
                        {icon}
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                            {title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {count} {count === 1 ? 'scenario' : 'scenarios'}
                        </p>
                    </div>
                </div>
                <TbChevronDown 
                    className={classNames(
                        "text-xl text-gray-600 dark:text-gray-400 transition-transform",
                        isOpen && "rotate-180"
                    )}
                />
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="p-4 space-y-4">
                            {scenarios.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No scenarios found
                                </div>
                            ) : (
                                scenarios.map((scenario, index) => (
                                    <div
                                        key={scenario.scenario_id}
                                        className={`${
                                            index !== scenarios.length - 1
                                                ? 'pb-4 border-b border-gray-200 dark:border-gray-700'
                                                : ''
                                        } relative`}
                                    >
                                        {/* Days Remaining Badge for Pending Scenarios */}
                                        {!scenario.is_completed && scenario.days_remaining !== undefined && (
                                            <div className="absolute top-0 right-0 z-10">
                                                <div className={classNames(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap",
                                                    scenario.days_remaining <= 0 
                                                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                        : scenario.days_remaining <= 2
                                                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                        : scenario.days_remaining <= 4
                                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                                        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                )}>
                                                    <TbClock className="text-sm" />
                                                    <span>{Math.max(0, scenario.days_remaining)} {Math.max(0, scenario.days_remaining) === 1 ? 'day' : 'days'} left</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <ScenarioDetail scenario={scenario} />

                                        {/* Action Buttons - Bottom */}
                                        {(() => {
                                            // Sessions auto-advance on completion; only offer the manual
                                            // fallback when that apparently hasn't happened yet.
                                            const nextMode = showAdvanceButton && scenario._needsManualAdvance
                                                ? nextConfiguredMode(scenario.mode, scenario.mode_sequence_names)
                                                : null
                                            if (!showDeleteButton && !showDownloadButton && !nextMode) return null
                                            return (
                                                <div className="mt-4 flex flex-wrap justify-end gap-2">
                                                    {showDeleteButton && onDeleteScenario && (
                                                        <Button
                                                            size="sm"
                                                            variant="solid"
                                                            icon={<TbTrash />}
                                                            className="bg-red-500 hover:bg-red-600 text-white border-0"
                                                            onClick={() => onDeleteScenario(scenario.sessionId)}
                                                        >
                                                            Unassign Scenario
                                                        </Button>
                                                    )}
                                                    {showDownloadButton && onDownloadReport && (
                                                        <Button
                                                            size="sm"
                                                            variant="solid"
                                                            icon={<TbDownload />}
                                                            className="bg-primary hover:bg-primary-deep text-white border-0"
                                                            onClick={() => onDownloadReport(scenario.sessionId)}
                                                        >
                                                            Download Report
                                                        </Button>
                                                    )}
                                                    {nextMode && onAdvanceScenario && (
                                                        <Button
                                                            size="sm"
                                                            variant="solid"
                                                            icon={<TbArrowRight />}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                                                            onClick={() => onAdvanceScenario(scenario.scenario_id, scenario.sessionId)}
                                                        >
                                                            Retry Advance to {formatModeName(nextMode)}
                                                        </Button>
                                                    )}
                                                </div>
                                            )
                                        })()}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const UserScenariosDrawer = ({ isOpen, onClose, user, scenarios, onUnassignScenario, onAdvanceScenario }: UserScenariosDrawerProps) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    // Separate scenarios into pending/overdue and completed
    const pendingScenarios = scenarios.filter(s => !s.is_completed)
    // Sessions normally auto-advance right after completion. A completed
    // item only still needs the manual "Advance" fallback if no sibling
    // session for its next configured mode has appeared yet (auto-advance
    // hasn't run, e.g. it failed, or this is a legacy pre-auto-advance session).
    const completedScenarios = scenarios
        .filter(s => s.is_completed)
        .map((s) => {
            const nextMode = nextConfiguredMode(s.mode, s.mode_sequence_names)
            const alreadyAdvanced = Boolean(
                nextMode &&
                scenarios.some(
                    (other) => other.scenario_id === s.scenario_id && other.mode?.toLowerCase() === nextMode.toLowerCase(),
                ),
            )
            return { ...s, _needsManualAdvance: !alreadyAdvanced }
        })

    // Handlers for scenario actions
    const handleDeleteScenario = (sessionId: string) => {
        if (onUnassignScenario) {
            onUnassignScenario(sessionId)
        }
    }

    const handleDownloadReport = async (sessionId: string) => {
        try {
            await downloadPerformanceReportPdf(sessionId)
        } catch (err: unknown) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getPerformanceReportPdfErrorMessage(err)}
                </Notification>,
            )
        }
    }

    const DrawerTitle = user ? (
        <div className="flex items-center gap-3">
            {user.userImg ? (
                <Avatar size={50} shape="circle" src={user.userImg} />
            ) : (
                <Avatar size={50} shape="circle" className="bg-blue-100 dark:bg-blue-500/20">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                        {getInitials(user.userName)}
                    </span>
                </Avatar>
            )}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {user.userName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.userEmail}
                </p>
            </div>
        </div>
    ) : null

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={600}
            title={DrawerTitle}
            headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
            bodyClass="!p-6 !bg-gray-100 dark:!bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
            {user && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            Scenario Assignments
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            View all scenarios assigned to this user
                        </p>
                    </div>

                    <AccordionItem
                        title="Overdue / Pending"
                        count={pendingScenarios.length}
                        icon={<TbAlertCircle className="text-xl" />}
                        iconBgColor="bg-blue-500"
                        borderColor="border-l-blue-500"
                        scenarios={pendingScenarios}
                        defaultOpen={true}
                        showDeleteButton={true}
                        onDeleteScenario={handleDeleteScenario}
                    />

                    <AccordionItem
                        title="Completed"
                        count={completedScenarios.length}
                        icon={<TbChecks className="text-xl" />}
                        iconBgColor="bg-emerald-500"
                        borderColor="border-l-emerald-500"
                        scenarios={completedScenarios}
                        showDownloadButton={true}
                        onDownloadReport={handleDownloadReport}
                        showAdvanceButton={true}
                        onAdvanceScenario={onAdvanceScenario}
                    />
                </div>
            )}
        </Drawer>
    )
}

export default UserScenariosDrawer
