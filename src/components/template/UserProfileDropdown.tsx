import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useAppSelector } from '@/store/hook'
import { Link } from 'react-router-dom'
import {
    PiUserDuotone,
    PiSignOutDuotone,
    PiCreditCardDuotone,
} from 'react-icons/pi'
// PiUserDuotone kept for the Profile menu item icon
import { useAuth } from '@/auth'
import type { JSX } from 'react'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = [
    {
        label: 'Profile',
        path: '/profile/settings',
        icon: <PiUserDuotone />,
    },
    {
        label: 'Subscription',
        path: '/subscription',
        icon: <PiCreditCardDuotone />,
    },
]

const getInitials = (firstName?: string, lastName?: string, userName?: string) => {
    if (firstName || lastName) {
        return `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`
    }
    return (userName?.[0] ?? '?').toUpperCase()
}

const getRoleLabel = (role?: string) => {
    if (!role) return ''
    return role
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
}

const _UserDropdown = () => {
    const { avatar, userName, email, firstName, lastName, role } = useAppSelector((state) => state.auth.user)

    const { signOut } = useAuth()

    const handleSignOut = () => {
        signOut()
    }

    const initials = getInitials(firstName, lastName, userName)
    const roleLabel = getRoleLabel(role)

    const avatarProps = avatar
        ? { src: avatar, className: 'ring-1 ring-gray-300 dark:ring-gray-600' }
        : { children: initials, className: 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-white ring-2 ring-gray-300 dark:ring-gray-600' }

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            trigger="hover"
            menuClass="min-w-[250px]"
            renderTitle={
                <div className="cursor-pointer flex items-center">
                    <Avatar size={32} {...avatarProps} />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-1.5 px-2 flex items-center gap-3">
                    <Avatar {...avatarProps} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                            {firstName || lastName
                                ? `${firstName ?? ''} ${lastName ?? ''}`.trim()
                                : (userName || 'Anonymous')}
                        </div>
                        {roleLabel && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                                {roleLabel}
                            </div>
                        )}
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            {dropdownItemList.map((item) => (
                <Dropdown.Item
                    key={item.label}
                    eventKey={item.label}
                    className="px-0"
                >
                    <Link className="flex h-full w-full px-2" to={item.path}>
                        <span className="flex gap-2 items-center w-full">
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </span>
                    </Link>
                </Dropdown.Item>
            ))}
            <Dropdown.Item variant="divider" />
            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2"
                onClick={handleSignOut}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>Sign Out</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
