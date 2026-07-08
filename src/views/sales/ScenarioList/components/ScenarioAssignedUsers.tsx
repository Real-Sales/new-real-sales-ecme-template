import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import ScrollBar from '@/components/ui/ScrollBar'
import toast from '@/components/ui/toast'
import { TbUserOff, TbUsers } from 'react-icons/tb'
import { apiUnassignScenario } from '@/services/ScenarioLibraryService'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
    useAppSelector,
    useAppDispatch,
    markScenarioMemberUnassigned,
    isAssignScenarioCacheFresh,
} from '../store'

type ScenarioAssignedUsersProps = {
    scenarioId: string
}

const getInitials = (name: string) =>
    name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

const ScenarioAssignedUsers = ({ scenarioId }: ScenarioAssignedUsersProps) => {
    const dispatch = useAppDispatch()
    const [unassigning, setUnassigning] = useState<string | null>(null)

    const { assignScenarioById, assignScenarioLoadingScenarioId, assignScenarioError } =
        useAppSelector(
            (state) =>
                state.scenarioLibrary?.data ?? {
                    assignScenarioById: {},
                    assignScenarioLoadingScenarioId: null,
                    assignScenarioError: null,
                },
        )

    const cacheEntry = assignScenarioById[scenarioId]
    const hasCachedMembers = isAssignScenarioCacheFresh(cacheEntry)
    const isLoading = !hasCachedMembers && assignScenarioLoadingScenarioId === scenarioId

    // Only pending assignments can be unassigned; hide active/completed/etc.
    const assignedMembers = hasCachedMembers
        ? cacheEntry!.members.filter(
              (m) =>
                  !m.canAssign &&
                  m.sessionId &&
                  m.sessionStatus?.toLowerCase() === 'pending',
          )
        : []

    const handleUnassign = async (sessionId: string, memberName: string) => {
        setUnassigning(sessionId)
        try {
            await apiUnassignScenario(sessionId)
            dispatch(markScenarioMemberUnassigned({ scenarioId, sessionId }))
            toast.push(
                <Notification title="Success" type="success">
                    Scenario unassigned from {memberName}
                </Notification>,
            )
        } catch (error) {
            toast.push(
                <Notification title="Error" type="danger">
                    {getApiErrorMessage(error, 'Failed to unassign scenario')}
                </Notification>,
            )
        } finally {
            setUnassigning(null)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TbUsers className="text-base text-gray-400 dark:text-gray-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Assigned Users
                    </span>
                </div>
                {hasCachedMembers && (
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums">
                        {assignedMembers.length}{' '}
                        {assignedMembers.length === 1 ? 'user' : 'users'}
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Spinner size={24} />
                </div>
            ) : assignScenarioError && !hasCachedMembers ? (
                <p className="text-sm text-red-500 dark:text-red-400 text-center py-6">
                    {assignScenarioError}
                </p>
            ) : assignedMembers.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 py-10">
                    <TbUsers className="text-2xl text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        No pending assignments
                    </p>
                </div>
            ) : (
                <ScrollBar className="overflow-y-auto max-h-72">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
                        {assignedMembers.map((member) => {
                            const isUnassigning = unassigning === member.sessionId
                            const isDisabled =
                                unassigning !== null && unassigning !== member.sessionId

                            return (
                                <div
                                    key={member.userId}
                                    className="flex items-center justify-between gap-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar
                                            size={36}
                                            shape="circle"
                                            className="bg-primary/10 text-primary text-sm font-semibold shrink-0"
                                        >
                                            {getInitials(member.name)}
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate leading-snug">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate leading-snug">
                                                {member.salesDivision !== '—'
                                                    ? member.salesDivision
                                                    : member.email}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        size="xs"
                                        variant="solid"
                                        loading={isUnassigning}
                                        disabled={isDisabled}
                                        icon={!isUnassigning ? <TbUserOff /> : undefined}
                                        className="shrink-0 bg-red-500 hover:bg-red-600 text-white border-none font-semibold"
                                        onClick={() =>
                                            member.sessionId &&
                                            handleUnassign(member.sessionId, member.name)
                                        }
                                    >
                                        Unassign
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                </ScrollBar>
            )}
        </div>
    )
}

export default ScenarioAssignedUsers
