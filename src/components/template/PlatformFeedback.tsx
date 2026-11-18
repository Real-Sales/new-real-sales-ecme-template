import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { HiOutlineUserAdd } from 'react-icons/hi'
import { useAppDispatch, useAppSelector } from '@/store'
import { setCurrentView } from '@/views/profile/Settings/store/settingsSlice'
import { canSendTeamInvite } from '@/utils/inviteAccess'

type PlatformFeedbackProps = {
    /** When true, ignore theme and render with the dark palette (used by the always-dark desktop side nav). */
    forceDark?: boolean
}

const PlatformFeedback = ({ forceDark = false }: PlatformFeedbackProps) => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const userRole = useAppSelector((state) => state.auth.user.role)

    if (!canSendTeamInvite(userRole)) {
        return null
    }

    const handleInviteClick = () => {
        dispatch(setCurrentView('invites'))
        navigate('/profile/settings')
    }

    const containerCls = forceDark
        ? 'p-3 mx-4 mb-2 app-liquid rounded-xl transition-all duration-300'
        : 'p-3 mx-4 mb-2 app-liquid rounded-xl transition-all duration-300'
    const titleCls = forceDark
        ? 'mb-1 font-bold text-sm text-white'
        : 'mb-1 font-bold text-sm text-gray-900 dark:text-white'
    const bodyCls = forceDark
        ? 'mb-2 text-xs text-gray-400'
        : 'mb-2 text-xs text-gray-600 dark:text-gray-400'

    return (
        <div className={containerCls}>
            <h5 className={titleCls}>Invite Team Member</h5>
            <p className={bodyCls}>Grow your team and collaborate together.</p>
            <Button
                block
                size="sm"
                variant="solid"
                className="bg-primary hover:bg-primary-deep text-white border-none flex justify-center items-center gap-1.5 px-2.5 py-1.5 h-auto rounded-md transition-all"
                onClick={handleInviteClick}
            >
                <HiOutlineUserAdd className="text-sm" />
                <span className="text-xs font-semibold">Invite Member</span>
            </Button>
        </div>
    )
}

export default PlatformFeedback
