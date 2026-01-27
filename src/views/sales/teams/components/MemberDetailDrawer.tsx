import Drawer from '@/components/ui/Drawer'
import Avatar from '@/components/ui/Avatar'
import MemberPerformanceChart from './MemberPerformanceChart'
import PerformanceByMode from './PerformanceByMode'
import { memberPerformanceData, modePerformanceData } from './memberPerformanceData'

type TeamMember = {
    id: string
    name: string
    email: string
    score: number
    sessions: number
    img?: string
}

type MemberDetailDrawerProps = {
    isOpen: boolean
    onClose: () => void
    member: TeamMember | null
}

const MemberDetailDrawer = ({ isOpen, onClose, member }: MemberDetailDrawerProps) => {
    // Generate initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const DrawerTitle = member ? (
        <div className="flex items-center gap-4">
            {member.img ? (
                <Avatar size={50} shape="circle" src={member.img} />
            ) : (
                <Avatar size={50} shape="circle">
                    {getInitials(member.name)}
                </Avatar>
            )}
            <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {member.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {member.email}
                </p>
            </div>
        </div>
    ) : null

    return (
        <Drawer
            isOpen={isOpen}
            width={600}
            title={DrawerTitle}
            headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
            bodyClass="!p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onClose={onClose}
            onRequestClose={onClose}
        >
            {member && (
                <>
                    {/* Performance Chart with Stats */}
                    {memberPerformanceData[member.id] && (
                        <MemberPerformanceChart
                            data={memberPerformanceData[member.id]}
                            memberName={member.name}
                            overallScore={member.score}
                            totalSessions={member.sessions}
                        />
                    )}

                    {/* Performance by Mode */}
                    {modePerformanceData[member.id] && (
                        <PerformanceByMode modeData={modePerformanceData[member.id]} />
                    )}
                </>
            )}
        </Drawer>
    )
}

export default MemberDetailDrawer
