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
        <Card className="hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-xl p-2 text-primary">
                <div className="text-xl">{icon}</div>
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
        <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={onClick}>
            <div className="p-2">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-xl p-2 text-primary">
                            <HiOfficeBuilding className="text-4xl" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                {name}
                            </h3>
                            <p className="text-[13px] text-gray-600 dark:text-gray-400 mb-1">
                                {industry}
                            </p>
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
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
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
