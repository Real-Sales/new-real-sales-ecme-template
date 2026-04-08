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
import { apiGetCompanyUsers } from '@/services/TeamService'
import { apiManagerCreateSession } from '@/services/SessionService'
import type { Scenario } from '../types'
import type { ChangeEvent } from 'react'
import { useAppSelector } from '@/store'

type Member = {
    id: string
    name: string
    email: string
    img?: string
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
    const companyId = useAppSelector((state) => state.auth.user.companyId)

    const [allCompanyMembers, setAllCompanyMembers] = useState<Member[]>([])
    const [memberList, setMemberList] = useState<Member[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAssigning, setIsAssigning] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchData = async () => {
        if (!companyId || !isOpen) return
        setIsLoading(true)
        try {
            const companyData = await apiGetCompanyUsers(companyId)
            const members = companyData.users.map(user => ({
                id: user.user_id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                img: `/img/avatars/thumb-${Math.floor(Math.random() * 5) + 1}.jpg`
            }))
            setAllCompanyMembers(members)
            setMemberList(members)
        } catch (error) {
            console.error('Failed to fetch data for share scenario:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [companyId, isOpen])

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
            await apiManagerCreateSession({
                user_id: member.id,
                persona_id: scenario.persona.persona_id,
                mode_id: scenario.mode.mode_id,
                scenario_id: scenario.scenario_id,
                scenario_text: scenario.scenario_text,
                document_content: scenario.document_content
            })
            
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
                                        disabled={isAssigning !== null && isAssigning !== member.id}
                                        className="bg-primary hover:bg-primary-deep text-white font-semibold"
                                        onClick={() => onAssignScenario(member)}
                                    >
                                        Assign
                                    </Button>
                                </div>
                            ))}
                            {memberList.length === 0 && !isLoading && (
                                <div className="text-center py-10 text-gray-500">
                                    No members found matching your search.
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
