import { useNavigate } from 'react-router-dom'
import { Card, Button, Badge } from '@/components/ui'
import { HiUserGroup, HiClock, HiPencil, HiTrash } from 'react-icons/hi'
import { SURFACE_CARD_CLASSNAME } from '@/constants/surfaceCard.constant'

export type TeamStatCardProps = {
    icon: React.ReactNode
    value: string | number
    label: string
}

export const TeamStatCard = ({ icon, value, label }: TeamStatCardProps) => {
    return (
        <Card
            className={`${SURFACE_CARD_CLASSNAME} hover:shadow-md transition-shadow duration-300`}
            bodyClass="!p-4"
        >
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-xl p-2 text-primary">
                    <div className="text-3xl">{icon}</div>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        {label}
                    </p>
                </div>
            </div>
        </Card>
    )
}

export type TeamCardProps = {
    id: string
    name: string
    company?: string
    members: number
    avgScore: number
    sessions: number
    performance: number
    status?: 'Focus' | 'Stable' | 'New'
    createdAt: string
    onEdit?: () => void
    onDelete?: () => void
    deleting?: boolean
}

export const TeamCard = ({
    id,
    name,
    members,
    avgScore,
    sessions,
    status,
    createdAt,
    onEdit,
    onDelete,
    deleting = false,
}: TeamCardProps) => {
    const navigate = useNavigate()

    const handleCardClick = () => {
        navigate(`/teams/${id}`)
    }

    return (
        <Card
            className={`${SURFACE_CARD_CLASSNAME} hover:shadow-md transition-shadow duration-300 cursor-pointer overflow-hidden relative`}
            bodyClass="!p-2"
            onClick={handleCardClick}
            data-tour-id="team-card"
            data-team-id={id}
        >
            {/* Header image */}
            <div className="relative h-23 rounded-2xl bg-slate-100 dark:bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
                <svg
                    className="absolute bottom-0 left-0 w-full h-16"
                    viewBox="0 0 600 120"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <path
                        d="M0,40 C120,120 240,0 360,60 C450,105 525,95 600,70 L600,120 L0,120 Z"
                        style={{ fill: 'var(--primary-mild)', opacity: 0.35 }}
                    >
                        <animate
                            attributeName="d"
                            dur="8s"
                            repeatCount="indefinite"
                            calcMode="spline"
                            keyTimes="0;0.33;0.66;1"
                            keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95"
                            values="
                                M0,40 C120,120 240,0 360,60 C450,105 525,95 600,70 L600,120 L0,120 Z;
                                M0,48 C125,35 245,95 365,62 C455,40 540,110 600,82 L600,120 L0,120 Z;
                                M0,52 C140,18 255,115 375,58 C465,28 545,104 600,78 L600,120 L0,120 Z;
                                M0,40 C120,120 240,0 360,60 C450,105 525,95 600,70 L600,120 L0,120 Z
                            "
                        />
                    </path>
                    <path
                        d="M0,70 C140,130 260,30 380,80 C470,115 540,110 600,90 L600,120 L0,120 Z"
                        style={{ fill: 'var(--primary)', opacity: 1 }}
                    >
                        <animate
                            attributeName="d"
                            dur="8s"
                            repeatCount="indefinite"
                            calcMode="spline"
                            keyTimes="0;0.33;0.66;1"
                            keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95"
                            values="
                                M0,70 C140,130 260,30 380,80 C470,115 540,110 600,90 L600,120 L0,120 Z;
                                M0,78 C150,45 260,105 380,78 C462,58 540,118 600,98 L600,120 L0,120 Z;
                                M0,84 C165,20 270,120 390,74 C470,55 545,120 600,100 L600,120 L0,120 Z;
                                M0,70 C140,130 260,30 380,80 C470,115 540,110 600,90 L600,120 L0,120 Z
                            "
                        />
                    </path>
                </svg>
                {status && (
                    <div className="absolute top-3 right-3">
                        <Badge
                            innerClass={`${status === 'Focus'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : status === 'Stable'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                } px-2 py-0.5 text-xs font-medium`}
                            content={status}
                        />
                    </div>
                )}
            </div>

            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 h-17 w-17 rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-primary flex items-center justify-center shadow-lg">
                <HiUserGroup className="text-4xl" />
            </div>

            <div className="px-5 pt-10 pb-4">
                {/* Title */}
                <div className="mb-4 flex flex-col items-center text-center">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {name}
                    </h3>
                </div>

                {/* Metrics */}
                <div className="flex justify-between items-center mb-4 py-3 bg-transparent -mx-5 px-5">
                    <div className="text-center flex-1">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{members}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Members</div>
                    </div>
                    <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
                    <div className="text-center flex-1">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{avgScore}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Avg Score</div>
                    </div>
                    <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
                    <div className="text-center flex-1">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{sessions}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Sessions</div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <HiClock className="text-sm" />
                        <span>{createdAt}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiPencil />}
                            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary border border-gray-200 dark:border-gray-600 transition-all"
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit?.()
                            }}
                        />
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiTrash className="text-red-500 dark:text-red-400" />}
                            className="bg-gray-100 dark:bg-gray-800 hover:bg-red-500 dark:hover:bg-red-600 text-gray-700 dark:text-red-500 hover:text-white border border-gray-200 dark:border-gray-600 transition-all"
                            loading={deleting}
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete?.()
                            }}
                        />
                    </div>
                </div>
            </div>
        </Card>
    )
}
