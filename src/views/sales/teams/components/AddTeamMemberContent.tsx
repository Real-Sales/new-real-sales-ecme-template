import { useState, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ScrollBar from '@/components/ui/ScrollBar'
import wildCardSearch from '@/utils/wildCardSearch'
import classNames from '@/utils/classNames'
import { TbSearch } from 'react-icons/tb'
import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'
import type { ChangeEvent } from 'react'

type Member = {
    id: string
    name: string
    email: string
    img?: string
}

type AddTeamMemberContentProps = {
    allMembers: Member[]
    teamMembers: Member[]
    onUpdateTeamMembers: (members: Member[]) => void
    onClose: () => void
}

const AddTeamMemberContent = ({
    allMembers,
    teamMembers,
    onUpdateTeamMembers,
    onClose,
}: AddTeamMemberContentProps) => {
    const inputRef = useRef(null)

    const [memberList, setMemberList] = useState(allMembers)

    const debounceFn = debounce(handleDebounceFn, 500)

    function handleDebounceFn(query: string) {
        const data = wildCardSearch(allMembers, query)
        setMemberList(data as Member[])
    }

    const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
        debounceFn(e.target.value)
    }

    const existingMember = (id: string) => {
        return teamMembers.some((member) => member.id === id)
    }

    const onAddMember = (member: Member) => {
        const data = cloneDeep(teamMembers)
        data.push(member)
        onUpdateTeamMembers(data)
    }

    const onRemoveMember = (id: string) => {
        const data = cloneDeep(teamMembers).filter(
            (member) => member.id !== id,
        )
        onUpdateTeamMembers(data)
    }

    const onDone = () => {
        onClose()
    }

    // Generate initials for avatar fallback
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
                <h4 className="mb-1">Add team members</h4>
                <p>Add existing sales reps to this team.</p>
            </div>
            <Input
                ref={inputRef}
                prefix={<TbSearch className="text-lg" />}
                placeholder="Quick search member"
                onChange={onSearch}
            />
            <div className="mt-4">
                <p className="font-semibold uppercase text-xs mb-4">
                    {memberList.length} members available
                </p>
                <div className="mb-6">
                    <ScrollBar className={classNames('overflow-y-auto h-80')}>
                        {memberList.map((member) => (
                            <div
                                key={member.id}
                                className="py-3 pr-5 rounded-lg flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    {member.img ? (
                                        <Avatar shape="circle" src={member.img} />
                                    ) : (
                                        <Avatar shape="circle">
                                            {getInitials(member.name)}
                                        </Avatar>
                                    )}
                                    <div>
                                        <p className="heading-text font-bold">
                                            {member.name}
                                        </p>
                                        <p>{member.email}</p>
                                    </div>
                                </div>
                                {existingMember(member.id) ? (
                                    <Button
                                        size="xs"
                                        customColorClass={() =>
                                            'hover:border-red-500 hover:ring-red-500'
                                        }
                                        onClick={() =>
                                            onRemoveMember(member.id)
                                        }
                                    >
                                        <span className="text-red-500">
                                            Remove
                                        </span>
                                    </Button>
                                ) : (
                                    <Button
                                        size="xs"
                                        onClick={() => onAddMember(member)}
                                    >
                                        Add
                                    </Button>
                                )}
                            </div>
                        ))}
                    </ScrollBar>
                </div>
                <Button block variant="solid" onClick={onDone}>
                    Done
                </Button>
            </div>
        </div>
    )
}

export default AddTeamMemberContent
