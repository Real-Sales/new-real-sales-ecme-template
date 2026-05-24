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
import {
    apiAssignCompanyMember,
    apiGetCompanyMembers,
} from '@/services/SalesCompanyService'
import type { ChangeEvent } from 'react'

type Member = {
    id: string
    name: string
    email: string
}

type AddDivisionMemberContentProps = {
    salesCompanyId: string
    salesDivisionId: string
    divisionMemberIds: string[]
    onUpdate: () => void
    onClose: () => void
}

const AddDivisionMemberContent = ({
    salesCompanyId,
    salesDivisionId,
    divisionMemberIds,
    onUpdate,
    onClose,
}: AddDivisionMemberContentProps) => {
    const inputRef = useRef(null)

    const [allCompanyMembers, setAllCompanyMembers] = useState<Member[]>([])
    const [assignedMemberIds, setAssignedMemberIds] =
        useState<string[]>(divisionMemberIds)
    const [memberList, setMemberList] = useState<Member[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchData = async () => {
        if (!salesCompanyId) return
        setIsLoading(true)
        try {
            const data = await apiGetCompanyMembers(salesCompanyId)
            const members = (data.members ?? []).map((user) => ({
                id: user.user_id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
            }))
            setAllCompanyMembers(members)
            setMemberList(members)
            setAssignedMemberIds(divisionMemberIds)
        } catch (error) {
            console.error('Failed to fetch company members:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [salesCompanyId])

    useEffect(() => {
        setAssignedMemberIds(divisionMemberIds)
    }, [divisionMemberIds])

    const handleDebounceFn = (query: string) => {
        const data = wildCardSearch(allCompanyMembers, query, ['name', 'email'])
        setMemberList(data as Member[])
    }

    const debounceFn = debounce(handleDebounceFn, 500)

    const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
        debounceFn(e.target.value)
    }

    const isExistingMember = (id: string) => assignedMemberIds.includes(id)

    const onAddMember = async (member: Member) => {
        try {
            await apiAssignCompanyMember(salesCompanyId, member.id, {
                sales_division_id: salesDivisionId,
            })
            setAssignedMemberIds([...assignedMemberIds, member.id])
            toast.push(
                <Notification title="Success" type="success">
                    {member.name} added to division
                </Notification>,
            )
            onUpdate()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } }
            toast.push(
                <Notification title="Error" type="danger">
                    {err.response?.data?.detail || 'Failed to add member'}
                </Notification>,
            )
        }
    }

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

    const availableMembers = memberList.filter(
        (member) => !isExistingMember(member.id),
    )

    return (
        <div>
            <div className="text-center mb-6">
                <h4 className="mb-1 text-2xl font-bold">Add division members</h4>
                <p className="text-gray-500">
                    Add existing company members to this division.
                </p>
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
                    {availableMembers.length} MEMBERS AVAILABLE
                </p>
                <div className="mb-6">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Spinner size={40} />
                        </div>
                    ) : (
                        <ScrollBar
                            className={classNames('overflow-y-auto h-80 px-2')}
                        >
                            {availableMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="py-3 px-4 mb-2 rounded-xl flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar size={45} shape="circle">
                                            {getInitials(member.name)}
                                        </Avatar>
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
                            {availableMembers.length === 0 && !isLoading && (
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
                    onClick={onClose}
                >
                    Done
                </Button>
            </div>
        </div>
    )
}

export default AddDivisionMemberContent
