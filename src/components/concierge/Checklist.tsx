import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TbCheck, TbCircle } from 'react-icons/tb'
import type { ChecklistItem } from './steps'

const routeForItem: Record<string, string> = {
    'run-first-session': '/overview',
    'visit-performance': '/performance',
    'visit-assigned-scenarios': '/assigned-scenarios',
    'visit-scenario-library': '/scenario-library',
    'visit-leaderboard': '/leaderboard',
    'visit-sales-division': '/sales-division',
    'visit-company-members': '/company-members',
}

const Checklist = ({
    items,
    done,
}: {
    items: ChecklistItem[]
    done: Record<string, boolean>
}) => {
    const navigate = useNavigate()
    const completedCount = items.filter((i) => done[i.id]).length
    const progressPct = items.length
        ? Math.round((completedCount / items.length) * 100)
        : 0

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Getting started
                </p>
                <span className="text-xs font-medium text-primary">
                    {completedCount}/{items.length}
                </span>
            </div>

            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                <motion.div
                    className="h-full rounded-full bg-primary"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>

            <ul className="space-y-1.5 max-h-72 overflow-y-auto">
                {items.map((item) => {
                    const isDone = Boolean(done[item.id])
                    return (
                        <li key={item.id}>
                            <button
                                onClick={() => !isDone && navigate(routeForItem[item.id])}
                                disabled={isDone}
                                className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                                    isDone
                                        ? 'cursor-default'
                                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                            >
                                <span
                                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                        isDone
                                            ? 'bg-primary text-white'
                                            : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                >
                                    {isDone ? (
                                        <TbCheck className="h-3 w-3" />
                                    ) : (
                                        <TbCircle className="h-3.5 w-3.5" />
                                    )}
                                </span>
                                <span className="min-w-0">
                                    <p
                                        className={`text-sm font-medium ${
                                            isDone
                                                ? 'text-gray-400 dark:text-gray-500 line-through'
                                                : 'text-gray-900 dark:text-white'
                                        }`}
                                    >
                                        {item.label}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        {item.description}
                                    </p>
                                </span>
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default Checklist
