import Menu from '@/components/ui/Menu'
import ScrollBar from '@/components/ui/ScrollBar'
import { useAppSelector, useAppDispatch } from '@/store/hook'
import { setCurrentView } from '../store/settingsSlice'
import {
    TbUserSquare,
    TbLock,
    TbFileDollar,
    TbUsers,
} from 'react-icons/tb'
import type { View } from '../types'
import type { ReactNode } from 'react'

const { MenuItem } = Menu

const menuList: { label: string; value: View; icon: ReactNode }[] = [
    { label: 'Profile', value: 'profile', icon: <TbUserSquare /> },
    { label: 'Security', value: 'security', icon: <TbLock /> },
    { label: 'Billing', value: 'billing', icon: <TbFileDollar /> },
    { label: 'Team Invites', value: 'invites', icon: <TbUsers /> },
]

export const SettingsMenu = ({ onChange }: { onChange?: () => void }) => {
    const dispatch = useAppDispatch()
    const currentView = useAppSelector((state) => state.settings.currentView)
    const userRole = useAppSelector((state) => state.auth.user.role)
    const visibleMenu = menuList.filter(
        (menu) => !(menu.value === 'invites' && userRole === 'sales_person'),
    )

    const handleSelect = (value: View) => {
        dispatch(setCurrentView(value))
        onChange?.()
    }

    return (
        <div className="flex flex-col justify-between h-full">
            <ScrollBar className="h-full overflow-y-auto">
                <Menu className="mx-2 mb-10">
                    {visibleMenu.map((menu) => (
                        <MenuItem
                            key={menu.value}
                            eventKey={menu.value}
                            className={`mb-2 ${
                                currentView === menu.value
                                    ? 'bg-gray-100 dark:bg-gray-700'
                                    : ''
                            }`}
                            isActive={currentView === menu.value}
                            onSelect={() => handleSelect(menu.value)}
                        >
                            <span className="text-2xl ltr:mr-2 rtl:ml-2">
                                {menu.icon}
                            </span>
                            <span>{menu.label}</span>
                        </MenuItem>
                    ))}
                </Menu>
            </ScrollBar>
        </div>
    )
}

export default SettingsMenu
