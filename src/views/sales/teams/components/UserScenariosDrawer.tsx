import { useState } from 'react'
import Drawer from '@/components/ui/Drawer'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ScenarioDetail from '@/views/sales/ScenarioList/components/ScenarioDetail'
import classNames from '@/utils/classNames'
import { TbChevronDown, TbAlertCircle, TbChecks, TbTrash, TbDownload, TbClock } from 'react-icons/tb'
import { motion, AnimatePresence } from 'framer-motion'
import type { Scenario } from '@/views/sales/ScenarioList/types'

type UserScenariosDrawerProps = {
    isOpen: boolean
    onClose: () => void
    user: {
        userId: string
        userName: string
        userEmail: string
        userImg?: string
    } | null
    scenarios: Scenario[]
}

type AccordionItemProps = {
    title: string
    count: number
    icon: React.ReactNode
    iconBgColor: string
    borderColor: string
    scenarios: Scenario[]
    defaultOpen?: boolean
    showDeleteButton?: boolean
    showDownloadButton?: boolean
    onDeleteScenario?: (scenarioId: string) => void
    onDownloadReport?: (scenarioId: string) => void
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
    onDeleteScenario,
    onDownloadReport
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
                                        {(showDeleteButton || showDownloadButton) && (
                                            <div className="mt-4 flex justify-end gap-2">
                                                {showDeleteButton && onDeleteScenario && (
                                                    <Button
                                                        size="sm"
                                                        variant="solid"
                                                        icon={<TbTrash />}
                                                        className="bg-red-500 hover:bg-red-600 text-white border-0"
                                                        onClick={() => onDeleteScenario(scenario.scenario_id)}
                                                    >
                                                        Delete Assignment
                                                    </Button>
                                                )}
                                                {showDownloadButton && onDownloadReport && (
                                                    <Button
                                                        size="sm"
                                                        variant="solid"
                                                        icon={<TbDownload />}
                                                        className="bg-primary hover:bg-primary-deep text-white border-0"
                                                        onClick={() => onDownloadReport(scenario.scenario_id)}
                                                    >
                                                        Download Report
                                                    </Button>
                                                )}
                                            </div>
                                        )}
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

const UserScenariosDrawer = ({ isOpen, onClose, user, scenarios }: UserScenariosDrawerProps) => {
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
    const completedScenarios = scenarios.filter(s => s.is_completed)

    // Handlers for scenario actions
    const handleDeleteScenario = (scenarioId: string) => {
        console.log('Delete scenario assignment:', scenarioId)
        // In real app: API call to delete assignment
        // Then refresh the data or close drawer
    }

    const handleDownloadReport = (scenarioId: string) => {
        console.log('Download performance report for scenario:', scenarioId)
        // In real app: API call to generate and download report
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
                    />
                </div>
            )}
        </Drawer>
    )
}

export default UserScenariosDrawer
