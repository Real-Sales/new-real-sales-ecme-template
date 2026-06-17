import { useState, useRef, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ScrollBar from '@/components/ui/ScrollBar'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import wildCardSearch from '@/utils/wildCardSearch'
import classNames from '@/utils/classNames'
import { TbSearch } from 'react-icons/tb'
import debounce from 'lodash/debounce'
import { apiManagerCreateSession } from '@/services/SessionService'
import { apiAssignScenario, apiGetScenarioAssignmentStatus } from '@/services/ScenarioLibraryService'
import { apiGetCompanyTeams } from '@/services/TeamsService'
import type { Scenario } from '../types'
import type { ChangeEvent } from 'react'
import { useAppSelector } from '@/store'
import { canManageScenarioLibrary } from '@/utils/inviteAccess'

type Member = {
    id: string
    name: string
    email: string
    img?: string
}

function memberFromTeamRow(
    m: {
        user_id: string
        user: { first_name: string; last_name: string; email: string }
    },
    authUser: {
        userId?: string
        email?: string
        firstName?: string
        lastName?: string
        userName?: string
    },
): Member {
    const isSelf = m.user_id === authUser.userId
    const name = `${m.user.first_name} ${m.user.last_name}`.trim()
    const selfName =
        [authUser.firstName, authUser.lastName].filter(Boolean).join(' ').trim() ||
        authUser.userName ||
        'You'

    return {
        id: m.user_id,
        name: isSelf && !name ? selfName : name,
        email: m.user.email || (isSelf ? authUser.email || '' : ''),
        img: `/img/avatars/thumb-${Math.floor(Math.random() * 5) + 1}.jpg`,
    }
}

function selfMemberFromAuth(authUser: {
    userId?: string
    email?: string
    firstName?: string
    lastName?: string
    userName?: string
}): Member | null {
    if (!authUser.userId) return null

    const name =
        [authUser.firstName, authUser.lastName].filter(Boolean).join(' ').trim() ||
        authUser.userName ||
        'You'

    return {
        id: authUser.userId,
        name,
        email: authUser.email || '',
        img: `/img/avatars/thumb-${Math.floor(Math.random() * 5) + 1}.jpg`,
    }
}

type ShareScenarioDialogProps = {
    isOpen: boolean
    onClose: () => void
    scenario: Scenario | null
}

const ShareScenarioDialog = ({
    isOpen,
    onClose,
    scenario,
}: ShareScenarioDialogProps) => {
    const inputRef = useRef(null)
    const authUser = useAppSelector((state) => state.auth.user)
    const companyId = authUser.companyId

    const [allCompanyMembers, setAllCompanyMembers] = useState<Member[]>([])
    const [memberList, setMemberList] = useState<Member[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAssigning, setIsAssigning] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [assignmentMap, setAssignmentMap] = useState<Record<string, boolean>>({})

    const fetchData = async () => {
        if (!companyId || !isOpen || !scenario) return
        setIsLoading(true)
        try {
            const teams = await apiGetCompanyTeams(companyId)
            const memberMap = new Map<string, Member>()

            // Assign list = unique users across all company teams (team.members only).
            teams?.forEach((team) => {
                team.members.forEach((m) => {
                    if (!memberMap.has(m.user_id)) {
                        memberMap.set(m.user_id, memberFromTeamRow(m, authUser))
                    }
                })
            })

            const isOnAnyTeam =
                teams?.some(
                    (team) =>
                        team.manager_id === authUser.userId ||
                        team.members.some((m) => m.user_id === authUser.userId),
                ) ?? false

            // Managers are often team.manager_id but not in team.members — include self when
            // they manage or belong to a team, or when they can manage the library (self-assign).
            if (
                authUser.userId &&
                !memberMap.has(authUser.userId) &&
                (canManageScenarioLibrary(authUser.role) || isOnAnyTeam)
            ) {
                const self = selfMemberFromAuth(authUser)
                if (self) {
                    memberMap.set(authUser.userId, self)
                }
            }

            const members = Array.from(memberMap.values())
            setAllCompanyMembers(members)
            setMemberList(members)

            if (teams && teams.length > 0) {
                const statusResponses = await Promise.all(
                    teams.map(t => apiGetScenarioAssignmentStatus(scenario.scenario_id, t.company_team_id))
                )
                
                // Merge all members from all teams into one status map
                const mergedMap: Record<string, boolean> = {}
                statusResponses.forEach(response => {
                    response.members.forEach(member => {
                        if (member.is_assigned) {
                            mergedMap[member.user_id] = true
                        }
                    })
                })
                setAssignmentMap(mergedMap)
            }
        } catch (error) {
            console.error('Failed to fetch data for share scenario:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchData()
        } else {
            // Reset state when dialog is closed
            setAssignmentMap({})
            setMemberList(allCompanyMembers)
            setSearchQuery('')
        }
    }, [companyId, isOpen, scenario?.scenario_id])

    const handleDebounceFn = (query: string) => {
        setSearchQuery(query)
        const data = wildCardSearch(allCompanyMembers, query, ['name', 'email'])
        setMemberList(data as Member[])
    }

    const debounceFn = debounce(handleDebounceFn, 500)

    const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
        debounceFn(e.target.value)
    }

    const onAssignScenario = async (member: Member) => {
        if (!scenario) return
        
        setIsAssigning(member.id)
        try {
            const resp = await apiManagerCreateSession({
                user_id: member.id,
                persona_id: scenario.persona.persona_id,
                mode_id: scenario.mode.mode_id,
                scenario_id: scenario.scenario_id,
                scenario_text: scenario.scenario_text,
                document_content: scenario.document_content
            })

            if (resp && resp.session_id) {
                await apiAssignScenario(scenario.scenario_id, resp.session_id)
                // Update local assignment map
                setAssignmentMap(prev => ({
                    ...prev,
                    [member.id]: true
                }))
            }
            
            toast.push(
                <Notification title="Success" type="success">
                    Scenario assigned to {member.name} successfully
                </Notification>
            )
        } catch (error) {
            console.error('Failed to assign scenario:', error)
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to assign scenario
                </Notification>
            )
        } finally {
            setIsAssigning(null)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            contentClassName="mt-[10vh]"
        >
            <div className="text-center mb-6">
                <h4 className="mb-1 text-2xl font-bold">Share Scenario</h4>
                <p className="text-gray-500">Pick a team member to assign &quot;{scenario?.title}&quot;</p>
            </div>
            <Input
                ref={inputRef}
                prefix={<TbSearch className="text-xl text-gray-400" />}
                placeholder="Search team member..."
                onChange={onSearch}
                className="bg-gray-50 dark:bg-gray-800"
            />
            <div className="mt-6">
                <p className="font-bold uppercase text-xs text-gray-500 mb-4 tracking-wider">
                    {memberList.length} MEMBERS AVAILABLE
                </p>
                <div className="mb-6">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Spinner size={40} />
                        </div>
                    ) : (
                        <ScrollBar className={classNames('overflow-y-auto h-80 px-2')}>
                            {memberList.map((member) => (
                                <div
                                    key={member.id}
                                    className="py-3 px-4 mb-2 rounded-xl flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {member.img ? (
                                            <Avatar size={45} shape="circle" src={member.img} />
                                        ) : (
                                            <Avatar size={45} shape="circle" className="bg-primary/10 text-primary">
                                                {getInitials(member.name)}
                                            </Avatar>
                                        )}
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                {member.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {member.email}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        loading={isAssigning === member.id}
                                        disabled={assignmentMap[member.id] || (isAssigning !== null && isAssigning !== member.id)}
                                        className={classNames(
                                            "font-semibold",
                                            assignmentMap[member.id] ? "bg-gray-100 dark:bg-gray-700 text-gray-500" : "bg-primary hover:bg-primary-deep text-white"
                                        )}
                                        onClick={() => onAssignScenario(member)}
                                    >
                                        {assignmentMap[member.id] ? 'Assigned' : 'Assign'}
                                    </Button>
                                </div>
                            ))}
                            {memberList.length === 0 && !isLoading && (
                                <div className="text-center py-10 text-gray-500">
                                    {searchQuery
                                        ? 'No members found matching your search.'
                                        : 'No team members found. Add people to a team first.'}
                                </div>
                            )}
                        </ScrollBar>
                    )}
                </div>
                <Button 
                    block 
                    variant="plain" 
                    onClick={onClose}
                >
                    Close
                </Button>
            </div>
        </Dialog>
    )
}

export default ShareScenarioDialog
