import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Badge, Drawer } from '@/components/ui'
import Container from '@/components/shared/Container'
import CompanyForm, { type CompanyFormSchema } from './CompanyForm'
import {
    HiOfficeBuilding,
    HiUserGroup,
    HiLocationMarker,
    HiPhone,
    HiMail,
    HiCalendar,
    HiPencil,
    HiTrash,
    HiPlus,
} from 'react-icons/hi'

// Stats card component
type StatsCardProps = {
    icon: React.ReactNode
    value: string | number
    label: string
}

const StatsCard = ({ icon, value, label }: StatsCardProps) => {
    return (
        <Card className="hover:shadow-lg transition-shadow duration-300" bodyClass="!p-4">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-xl p-2 text-primary">
                <div className="text-3xl">{icon}</div>
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {value}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {label}
                </p>
             
            </div>
        </div>
    </Card>
    )
}

// Company card component
type CompanyCardProps = {
    id: string
    name: string
    industry: string
    location: string
    phone: string
    email: string
    createdDate: string
    teams: number
    status: 'Active' | 'Inactive'
    onClick: () => void
}

const CompanyCard = ({
    name,
    industry,
    location,
    phone,
    email,
    createdDate,
    teams,
    status,
    onClick,
}: CompanyCardProps) => {
    return (
        <Card
            className="hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-800/60 relative"
            bodyClass="!p-2"
            onClick={onClick}
        >
            {/* Header image */}
            <div className="relative h-23 rounded-2xl bg-slate-100 dark:bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
                <svg
                    className="absolute bottom-0 left-0 w-full h-16"
                    viewBox="0 0 600 120"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <path
                        d="M0,40 C120,120 240,0 360,60 C450,105 525,95 600,70 L600,120 L0,120 Z"
                        style={{ fill: 'var(--primary-mild)', opacity: 0.35 }}
                    >
                        <animate
                            attributeName="d"
                            dur="7s"
                            repeatCount="indefinite"
                            values="
                                M0,40 C120,120 240,0 360,60 C450,105 525,95 600,70 L600,120 L0,120 Z;
                                M0,55 C140,10 260,120 380,60 C460,20 540,110 600,85 L600,120 L0,120 Z;
                                M0,40 C120,120 240,0 360,60 C450,105 525,95 600,70 L600,120 L0,120 Z
                            "
                        />
                    </path>
                    <path
                        d="M0,70 C140,130 260,30 380,80 C470,115 540,110 600,90 L600,120 L0,120 Z"
                        style={{ fill: 'var(--primary)', opacity: 1 }}
                    >
                        <animate
                            attributeName="d"
                            dur="5s"
                            repeatCount="indefinite"
                            values="
                                M0,70 C140,130 260,30 380,80 C470,115 540,110 600,90 L600,120 L0,120 Z;
                                M0,85 C160,10 260,120 380,75 C460,40 540,120 600,100 L600,120 L0,120 Z;
                                M0,70 C140,130 260,30 380,80 C470,115 540,110 600,90 L600,120 L0,120 Z
                            "
                        />
                    </path>
                </svg>
                <div className="absolute top-3 right-3">
                    <Badge
                        innerClass={`${
                            status === 'Active'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        } px-2 py-0.5 text-xs font-medium`}
                        content={status}
                    />
                </div>
            </div>
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 h-17 w-17 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-800 text-primary flex items-center justify-center shadow-sm">
                <HiOfficeBuilding className="text-4xl" />
            </div>

            <div className="px-5 pt-10 pb-4">
                {/* Title */}
                <div className="mb-4 flex flex-col items-center text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {industry}
                    </p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <HiLocationMarker className="text-sm" />
                        <span>{location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <HiPhone className="text-sm" />
                        <span>{phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <HiMail className="text-sm" />
                        <span>{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <HiCalendar className="text-sm" />
                        <span>Created {createdDate}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200/70 dark:border-gray-700/70">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                            {teams}
                        </span>
                        <span className="text-base text-gray-600 dark:text-gray-400">
                            Teams
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiPencil />}
                            className="hover:text-primary"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiTrash className="text-red-500" />}
                            className="hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            </div>
        </Card>
    )
}

const CompanyList = () => {
    const navigate = useNavigate()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    const openDrawer = () => {
        setIsDrawerOpen(true)
    }

    const onDrawerClose = () => {
        setIsDrawerOpen(false)
    }

    const handleCompanyClick = (companyId: string) => {
        navigate(`/company/${companyId}`)
    }

    const handleSubmitClick = () => {
        if (formRef.current) {
            formRef.current.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
            )
        }
    }

    const onCompanySubmit = (values: CompanyFormSchema) => {
        console.log('Company form submitted:', values)
        // Add your API call here
        window.alert(JSON.stringify(values, null, 2))
        onDrawerClose()
    }

    const DrawerFooter = (
        <div className="flex justify-between items-center w-full gap-3 px-2">
            <Button size="sm" className="flex-1" onClick={onDrawerClose}>
                Cancel
            </Button>
            <Button
                size="sm"
                variant="solid"
                className="flex-1 bg-primary hover:bg-primary-deep text-neutral border-none"
                onClick={handleSubmitClick}
            >
                Create
            </Button>
        </div>
    )

    const DrawerTitle = (
        <div>
            <h4 className="mb-2 text-lg font-bold">Create New Company</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to create a new company
            </p>
        </div>
    )

    const stats = [
        {
            icon: <HiOfficeBuilding />,
            value: 2,
            label: 'Total Companies',
        },
        {
            icon: <HiUserGroup />,
            value: 3,
            label: 'Total Teams',
        },
        {
            icon: <HiOfficeBuilding />,
            value: 2,
            label: 'Active Companies',
        },
    ]

    const companies = [
        {
            id: 'company-a',
            name: 'Company "A"',
            industry: 'Healthcare',
            location: 'NY',
            phone: '4565457689',
            email: 'healthcare@gmail.com',
            createdDate: 'Jan 15, 2024',
            teams: 2,
            status: 'Active' as const,
        },
        {
            id: 'company-b',
            name: 'Company "B"',
            industry: 'Food & Beverages',
            location: 'NY',
            phone: '8978675645',
            email: 'oembeverage@gmail.com',
            createdDate: 'Feb 20, 2024',
            teams: 1,
            status: 'Active' as const,
        },
    ]

    return (
        <div className="min-h-full">
            {/* Header Section */}
            <Container className="pb-6 px-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">
                            Company Management
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Create and manage companies under your supervision
                        </p>
                    </div>
                    <Button
                        variant="solid"
                        size="md"
                        icon={<HiPlus />}
                        className="bg-primary hover:bg-primary-deep text-neutral border-none whitespace-nowrap"
                        onClick={openDrawer}
                    >
                        Create Company
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {stats.map((stat, index) => (
                        <StatsCard key={index} {...stat} />
                    ))}
                </div>

                {/* Company Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {companies.map((company) => (
                        <CompanyCard
                            key={company.id}
                            {...company}
                            onClick={() => handleCompanyClick(company.id)}
                        />
                    ))}
                </div>
            </Container>

            {/* Create Company Drawer */}
            <Drawer
                title={DrawerTitle}
                isOpen={isDrawerOpen}
                footer={DrawerFooter}
                headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
                footerClass="!bg-gray-100 dark:!bg-gray-800 !p-3"
                bodyClass="!p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
                <div className="px-2">
                    <form ref={formRef}>
                    <CompanyForm
                        onSubmit={onCompanySubmit}
                            onCancel={onDrawerClose}
                        />
                    </form>
                </div>
            </Drawer>
        </div>
    )
}

export default CompanyList
