import { useState, useRef, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ScrollBar from '@/components/ui/ScrollBar'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import wildCardSearch from '@/utils/wildCardSearch'
import classNames from '@/utils/classNames'
import { TbSearch } from 'react-icons/tb'
import debounce from 'lodash/debounce'
import { apiGetCompanyUsers, apiAddTeamMember, apiDeleteTeamMember, apiGetCompanyTeamPerformance } from '@/services/TeamService'
import type { CompanyUser } from '@/services/TeamService'
import type { ChangeEvent } from 'react'

type Member = {
    id: string
    name: string
    email: string
    img?: string
}

type AddTeamMemberContentProps = {
    salesCompanyId: string
    companyTeamId: string
    onUpdate: () => void
    onClose: () => void
}

const AddTeamMemberContent = ({
    salesCompanyId,
    companyTeamId,
    onUpdate,
    onClose,
}: AddTeamMemberContentProps) => {
    const inputRef = useRef(null)

    const [allCompanyMembers, setAllCompanyMembers] = useState<Member[]>([])
    const [teamMemberIds, setTeamMemberIds] = useState<string[]>([])
    const [memberList, setMemberList] = useState<Member[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchData = async () => {
        if (!salesCompanyId || !companyTeamId) return
        setIsLoading(true)
        try {
            // Fetch all users in company
            const companyData = await apiGetCompanyUsers(salesCompanyId)
            const members = companyData.users.map(user => ({
                id: user.user_id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                img: `/img/avatars/thumb-${Math.floor(Math.random() * 5) + 1}.jpg`
            }))
            setAllCompanyMembers(members)
            setMemberList(members)

            // Fetch current team members to know who is already added
            const teamData = await apiGetCompanyTeamPerformance(companyTeamId)
            setTeamMemberIds(teamData.members.map(m => m.user_id))
        } catch (error) {
            console.error('Failed to fetch data for add members:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [salesCompanyId, companyTeamId])

    const handleDebounceFn = (query: string) => {
        setSearchQuery(query)
        const data = wildCardSearch(allCompanyMembers, query, ['name', 'email'])
        setMemberList(data as Member[])
    }

    const debounceFn = debounce(handleDebounceFn, 500)

    const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
        debounceFn(e.target.value)
    }

    const isExistingMember = (id: string) => {
        return teamMemberIds.includes(id)
    }

    const onAddMember = async (member: Member) => {
        try {
            await apiAddTeamMember({
                user_id: member.id,
                company_team_id: companyTeamId
            })
            setTeamMemberIds([...teamMemberIds, member.id])
            toast.push(
                <Notification title="Success" type="success">
                    {member.name} added to team
                </Notification>
            )
            onUpdate()
        } catch (error) {
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to add member
                </Notification>
            )
        }
    }

    const onRemoveMember = async (member: Member) => {
        try {
            await apiDeleteTeamMember(member.id, companyTeamId)
            setTeamMemberIds(teamMemberIds.filter(id => id !== member.id))
            toast.push(
                <Notification title="Success" type="success">
                    {member.name} removed from team
                </Notification>
            )
            onUpdate()
        } catch (error) {
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to remove member
                </Notification>
            )
        }
    }

    const onDone = () => {
        onClose()
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
        <div>
            <div className="text-center mb-6">
                <h4 className="mb-1 text-2xl font-bold">Add team members</h4>
                <p className="text-gray-500">Add existing sales reps to this team.</p>
            </div>
            <Input
                ref={inputRef}
                prefix={<TbSearch className="text-xl text-gray-400" />}
                placeholder="Quick search member"
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
                            {memberList
                                .filter((member) => !isExistingMember(member.id))
                                .map((member) => (
                                    <div
                                        key={member.id}
                                        className="py-3 px-4 mb-2 rounded-xl flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {member.img ? (
                                                <Avatar size={45} shape="circle" src={member.img} />
                                            ) : (
                                                <Avatar size={45} shape="circle">
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
                                            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
                                            onClick={() => onAddMember(member)}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                ))}
                            {memberList.filter((member) => !isExistingMember(member.id)).length === 0 && !isLoading && (
                                <div className="text-center py-10 text-gray-500">
                                    No members found matching your search.
                                </div>
                            )}
                        </ScrollBar>
                    )}
                </div>
                <Button 
                    block 
                    variant="solid" 
                    className="bg-primary hover:bg-primary-deep text-white h-12 text-lg font-bold rounded-xl"
                    onClick={onDone}
                >
                    Done
                </Button>
            </div>
        </div>
    )
}

export default AddTeamMemberContent
