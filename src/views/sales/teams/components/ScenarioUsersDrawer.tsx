import { useState } from 'react'
import Drawer from '@/components/ui/Drawer'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ScenarioDetail from '@/views/sales/ScenarioList/components/ScenarioDetail'
import classNames from '@/utils/classNames'
import { TbChevronDown, TbAlertCircle, TbChecks, TbTrash, TbDownload, TbClock, TbCalendar } from 'react-icons/tb'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import type { ScenarioSession } from '@/views/sales/ScenarioList/types'

type UserAssignment = {
    userId: string
    userName: string
    userEmail: string
    userImg?: string
    isCompleted: boolean
    score?: number
    completedAt?: string
    daysRemaining?: number
    assignedAt?: string
    sessionId: string
}

type ScenarioUsersDrawerProps = {
    isOpen: boolean
    onClose: () => void
    scenario: any | null
    users: UserAssignment[]
    onUnassignScenario?: (sessionId: string) => void
}

type AccordionItemProps = {
    title: string
    count: number
    icon: React.ReactNode
    iconBgColor: string
    borderColor: string
    users: UserAssignment[]
    defaultOpen?: boolean
    showDeleteButton?: boolean
    showDownloadButton?: boolean
    onDeleteUser?: (sessionId: string) => void
    onDownloadReport?: (sessionId: string) => void
}

const AccordionItem = ({ 
    title, 
    count, 
    icon, 
    iconBgColor, 
    borderColor, 
    users, 
    defaultOpen = false,
    showDeleteButton = false,
    showDownloadButton = false,
    onDeleteUser,
    onDownloadReport
}: AccordionItemProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

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
                            {count} {count === 1 ? 'user' : 'users'}
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
                            {users.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No users found
                                </div>
                            ) : (
                                users.map((user, index) => (
                                    <div
                                        key={user.userId}
                                        className={`${
                                            index !== users.length - 1
                                                ? 'pb-4 border-b border-gray-200 dark:border-gray-700'
                                                : ''
                                        }`}
                                    >
                                        {/* User Card with Buttons */}
                                        <div className="flex items-center gap-4">
                                            {user.userImg ? (
                                                <Avatar size={50} shape="circle" src={user.userImg} />
                                            ) : (
                                                <Avatar size={50} shape="circle" className="bg-blue-100 dark:bg-blue-500/20">
                                                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                                        {getInitials(user.userName)}
                                                    </span>
                                                </Avatar>
                                            )}
                                            <div className="flex-1">
                                                <h5 className="font-bold text-gray-900 dark:text-white">
                                                    {user.userName}
                                                </h5>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {user.userEmail}
                                                </p>
                                                {user.assignedAt && (
                                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <TbCalendar className="text-sm" />
                                                        <span>Assigned {dayjs(user.assignedAt).format('MMM DD, YYYY')}</span>
                                                    </div>
                                                )}
                                                {!user.isCompleted && user.daysRemaining !== undefined && (
                                                    <div className="mt-2">
                                                        <div className={classNames(
                                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold",
                                                            user.daysRemaining <= 0 
                                                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                                : user.daysRemaining <= 2
                                                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                                : user.daysRemaining <= 4
                                                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                                                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                        )}>
                                                            <TbClock className="text-sm" />
                                                            <span>{Math.max(0, user.daysRemaining)} {Math.max(0, user.daysRemaining) === 1 ? 'day' : 'days'} left</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {user.isCompleted && user.score !== undefined && (
                                                    <div className="mt-2">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                                            <TbChecks className="text-sm" />
                                                            <span>Score: {user.score}/100</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            {(showDeleteButton || showDownloadButton) && (
                                                <div className="flex gap-2">
                                                    {showDeleteButton && onDeleteUser && (
                                                        <Button
                                                            size="sm"
                                                            variant="solid"
                                                            icon={<TbTrash />}
                                                            className="bg-red-500 hover:bg-red-600 text-white border-0"
                                                            onClick={() => onDeleteUser(user.sessionId)}
                                                        >
                                                            Unassign
                                                        </Button>
                                                    )}
                                                    {showDownloadButton && onDownloadReport && (
                                                        <Button
                                                            size="sm"
                                                            variant="solid"
                                                            icon={<TbDownload />}
                                                            className="bg-primary hover:bg-primary-deep text-white border-0"
                                                            onClick={() => onDownloadReport(user.userId)}
                                                        >
                                                            Download Report
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
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

const ScenarioUsersDrawer = ({ isOpen, onClose, scenario, users, onUnassignScenario }: ScenarioUsersDrawerProps) => {
    // Separate users into pending/overdue and completed
    const pendingUsers = users.filter(u => !u.isCompleted)
    const completedUsers = users.filter(u => u.isCompleted)

    // Handlers for user actions
    const handleDeleteUser = (sessionId: string) => {
        if (onUnassignScenario) {
            onUnassignScenario(sessionId)
        }
    }

    const handleDownloadReport = (sessionId: string) => {
        console.log('Download performance report for session:', sessionId)
    }

    const DrawerTitle = scenario ? (
        <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {scenario.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Scenario Details & User Assignments
            </p>
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
            {scenario && (
                <div className="space-y-6">
                    {/* Scenario Details */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            Scenario Details
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Complete information about this scenario
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <ScenarioDetail scenario={scenario} />
                        </div>
                    </div>

                    {/* User Assignments */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            User Assignments
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Users assigned to this scenario
                        </p>

                        <div className="space-y-4">
                            <AccordionItem
                                title="Pending / Overdue"
                                count={pendingUsers.length}
                                icon={<TbAlertCircle className="text-xl" />}
                                iconBgColor="bg-blue-500"
                                borderColor="border-l-blue-500"
                                users={pendingUsers}
                                defaultOpen={true}
                                showDeleteButton={true}
                                onDeleteUser={handleDeleteUser}
                            />

                            <AccordionItem
                                title="Completed"
                                count={completedUsers.length}
                                icon={<TbChecks className="text-xl" />}
                                iconBgColor="bg-emerald-500"
                                borderColor="border-l-emerald-500"
                                users={completedUsers}
                                showDownloadButton={true}
                                onDownloadReport={handleDownloadReport}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Drawer>
    )
}

export default ScenarioUsersDrawer
