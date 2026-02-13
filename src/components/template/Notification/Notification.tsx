import { useState, useRef } from 'react'
import classNames from 'classnames'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Dropdown from '@/components/ui/Dropdown'
import ScrollBar from '@/components/ui/ScrollBar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import NotificationAvatar from './NotificationAvatar'
import NotificationToggle from './NotificationToggle'
import { HiOutlineMailOpen } from 'react-icons/hi'
import isLastChild from '@/utils/isLastChild'
import useResponsive from '@/utils/hooks/useResponsive'

import type { DropdownRef } from '@/components/ui/Dropdown'

type NotificationList = {
    id: string
    target: string
    description: string
    date: string
    image: string
    type: number
    location: string
    locationLabel: string
    status: string
    readed: boolean
}

// Mock notification data
const mockNotifications: NotificationList[] = [
    {
        id: '1',
        target: 'Jeremiah Minsk',
        description: 'mentioned your in comment.',
        date: '2 minutes ago',
        image: 'thumb-1.jpg',
        type: 0,
        location: '',
        locationLabel: '',
        status: '',
        readed: false,
    },
    {
        id: '2',
        target: 'Max Alexander',
        description: 'invited you to new project.',
        date: '10 minutes ago',
        image: 'thumb-2.jpg',
        type: 0,
        location: '',
        locationLabel: '',
        status: '',
        readed: false,
    },
    {
        id: '3',
        target: '',
        description: 'Please submit your daily report.',
        date: '3 hours ago',
        image: '',
        type: 1,
        location: '',
        locationLabel: '',
        status: '',
        readed: false,
    },
]

const notificationHeight = 'h-[280px]'

const _Notification = ({ className }: { className?: string }) => {
    const [notificationList, setNotificationList] =
        useState<NotificationList[]>(mockNotifications)
    const [unreadNotification, setUnreadNotification] = useState(true)

    const { larger } = useResponsive()

    const onMarkAllAsRead = () => {
        const list = notificationList.map((item: NotificationList) => {
            if (!item.readed) {
                item.readed = true
            }
            return item
        })
        setNotificationList(list)
        setUnreadNotification(false)
    }

    const onMarkAsRead = (id: string) => {
        const list = notificationList.map((item) => {
            if (item.id === id) {
                item.readed = true
            }
            return item
        })
        setNotificationList(list)
        const hasUnread = notificationList.some((item) => !item.readed)

        if (!hasUnread) {
            setUnreadNotification(false)
        }
    }

    const notificationDropdownRef = useRef<DropdownRef>(null)

    const handleViewAllActivity = () => {
        if (notificationDropdownRef.current) {
            notificationDropdownRef.current.handleDropdownClose()
        }
    }

    return (
        <Dropdown
            ref={notificationDropdownRef}
            renderTitle={
                <NotificationToggle
                    dot={unreadNotification}
                    className={className}
                />
            }
            menuClass="min-w-[280px] md:min-w-[340px]"
            placement={larger.md ? 'bottom-end' : 'bottom'}
        >
            <Dropdown.Item variant="header">
                <div className="dark:border-gray-700 px-2 flex items-center justify-between mb-1">
                    <h6>Notifications</h6>
                    <Tooltip title="Mark all as read">
                        <Button
                            variant="plain"
                            shape="circle"
                            size="sm"
                            icon={<HiOutlineMailOpen className="text-xl" />}
                            onClick={onMarkAllAsRead}
                        />
                    </Tooltip>
                </div>
            </Dropdown.Item>
            <ScrollBar
                className={classNames('overflow-y-auto', notificationHeight)}
            >
                {notificationList.length > 0 &&
                    notificationList.map((item, index) => (
                        <div key={item.id}>
                            <div
                                className={`relative rounded-xl flex px-4 py-3 cursor-pointer hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-gray-700`}
                                onClick={() => onMarkAsRead(item.id)}
                            >
                                <div>
                                    <NotificationAvatar {...item} />
                                </div>
                                <div className="mx-3">
                                    <div>
                                        {item.target && (
                                            <span className="font-semibold heading-text">
                                                {item.target}{' '}
                                            </span>
                                        )}
                                        <span>{item.description}</span>
                                    </div>
                                    <span className="text-xs">{item.date}</span>
                                </div>
                                <Badge
                                    className="absolute top-4 ltr:right-4 rtl:left-4 mt-1.5"
                                    innerClass={`${
                                        item.readed
                                            ? 'bg-gray-300 dark:bg-gray-600'
                                            : 'bg-primary'
                                    } `}
                                />
                            </div>
                            {!isLastChild(notificationList, index) ? (
                                <div className="border-b border-gray-200 dark:border-gray-700 my-2" />
                            ) : (
                                ''
                            )}
                        </div>
                    ))}
            </ScrollBar>
            <Dropdown.Item variant="header">
                <div className="pt-4">
                    <Button
                        block
                        variant="solid"
                        onClick={handleViewAllActivity}
                    >
                        View All Activity
                    </Button>
                </div>
            </Dropdown.Item>
        </Dropdown>
    )
}

const Notification = withHeaderItem(_Notification)

export default Notification
