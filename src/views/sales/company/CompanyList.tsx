import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Badge, Drawer, toast, Notification } from '@/components/ui'
import Container from '@/components/shared/Container'
import CompanyForm, { type CompanyFormSchema } from './CompanyForm'
import {
    HiOfficeBuilding,
    HiUserGroup,
    HiCalendar,
    HiPencil,
    HiTrash,
    HiPlus,
} from 'react-icons/hi'
import { injectReducer } from '@/store'
import salesDivisionsReducer, {
    useAppSelector,
    useAppDispatch,
    fetchSalesDivisions,
    createDivision,
    updateDivision,
    deleteDivision,
    resetNotification,
} from '@/store/slices/salesDivisions'
import teamsReducer, { fetchTeams } from '@/store/slices/teams'
import type { SalesDivision } from '@/services/SalesDivisionsService'
import dayjs from 'dayjs'

// Inject reducer when component mounts (lazy-loaded)
injectReducer('salesDivisions', salesDivisionsReducer)
injectReducer('teams', teamsReducer)

console.log('DEBUG: CompanyList.tsx file loaded')

// Stats card component
type StatsCardProps = {
    icon: React.ReactNode
    value: string | number
    label: string
}

const StatsCard = ({ icon, value, label }: StatsCardProps) => {
    return (
        <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300"
            bodyClass="!p-4"
        >
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

type CompanyCardProps = {
    id: string
    name: string
    category: string
    createdDate: string
    teams: number
    status: 'Active' | 'Inactive'
    onClick: () => void
    onEdit: (e: React.MouseEvent) => void
    onDelete: (e: React.MouseEvent) => void
}

const CompanyCard = ({
    name,
    category,
    createdDate,
    teams,
    status,
    onClick,
    onEdit,
    onDelete,
}: CompanyCardProps) => {
    return (
        <Card
            className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl relative"
            bodyClass="!p-2"
            onClick={onClick}
        >
            {/* Header image removed for brevity in search, will replace carefully */}
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
                        innerClass={`${status === 'Active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            } px-2 py-0.5 text-xs font-medium`}
                        content={status}
                    />
                </div>
            </div>
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 h-17 w-17 rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-primary flex items-center justify-center shadow-lg">
                <HiOfficeBuilding className="text-4xl" />
            </div>

            <div className="px-5 pt-10 pb-4">
                {/* Title */}
                <div className="mb-4 flex flex-col items-center text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category}
                    </p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
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
                            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary border border-gray-200 dark:border-gray-600 transition-all"
                            onClick={onEdit}
                        />
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiTrash className="text-red-500 dark:text-red-400" />}
                            className="bg-gray-100 dark:bg-gray-800 hover:bg-red-500 dark:hover:bg-red-600 text-gray-700 dark:text-red-500 hover:text-white border border-gray-200 dark:border-gray-600 transition-all"
                            onClick={onDelete}
                        />
                    </div>
                </div>
            </div>
        </Card>
    )
}

const CompanyList = () => {
    console.log('CompanyList component rendering...')
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create')
    const [selectedDivision, setSelectedDivision] = useState<SalesDivision | null>(null)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        console.log('CompanyList component mounted')
    }, [])

    const companyIdRaw = useAppSelector((state) => state.auth.user.companyId)
    const companyId =
        typeof companyIdRaw === 'string' ? companyIdRaw.trim() : companyIdRaw

    const {
        divisionsData,
        divisionsLoading,
        initialized,
        notification,
    } = useAppSelector(
        (state) =>
            state.salesDivisions?.data ?? {
                divisionsData: [],
                divisionsLoading: false,
                initialized: false,
                divisionInfo: {},
                infoLoading: false,
                error: null,
                notification: null,
            }
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { teamsData, teamsInitialized } = useAppSelector((state: any) => ({
        teamsData: state.teams?.data?.teamsData ?? [],
        teamsInitialized: state.teams?.data?.initialized ?? false,
    }))

    useEffect(() => {
        if (!companyId || initialized || divisionsLoading) {
            return
        }
        dispatch(fetchSalesDivisions(companyId))
    }, [dispatch, companyId, initialized, divisionsLoading])

    useEffect(() => {
        if (!companyId || teamsInitialized) return
        dispatch(fetchTeams(companyId))
    }, [dispatch, companyId, teamsInitialized])

    const teamCountByDivision = useMemo(() => {
        const counts: Record<string, number> = {}
        for (const team of teamsData) {
            const divId = team.sales_division_id
            if (divId) {
                counts[divId] = (counts[divId] ?? 0) + 1
            }
        }
        return counts
    }, [teamsData])

    useEffect(() => {
        if (notification) {
            const type = (notification.type || 'info') as 'success' | 'warning' | 'danger' | 'info'
            toast.push(
                <Notification title={type.charAt(0).toUpperCase() + type.slice(1)} type={type}>
                    {notification.message}
                </Notification>
            )
            dispatch(resetNotification())
        }
    }, [notification, dispatch])

    const openDrawer = (mode: 'create' | 'edit', division?: SalesDivision) => {
        setDrawerMode(mode)
        if (mode === 'edit' && division) {
            setSelectedDivision(division)
        } else {
            setSelectedDivision(null)
        }
        setIsDrawerOpen(true)
    }

    const onDrawerClose = () => {
        setIsDrawerOpen(false)
        setSelectedDivision(null)
    }

    const divisions = divisionsData
    const loading = divisionsLoading

    const handleCompanyClick = (companyId: string) => {
        navigate(`/sales-division/${companyId}`)
    }

    const handleSubmitClick = () => {
        console.log('handleSubmitClick called, formRef.current:', formRef.current)
        if (formRef.current) {
            formRef.current.requestSubmit()
        }
    }

    const onCompanySubmit = async (values: CompanyFormSchema) => {
        console.log('Company form submitted:', values)
        if (!companyId) {
            toast.push(
                <Notification title="Error" type="danger">
                    Company ID is missing. Please log in again.
                </Notification>
            )
            return
        }

        try {
            if (drawerMode === 'create') {
                await dispatch(createDivision({
                    name: values.companyName,
                    division_category: values.category,
                    sales_company_id: companyId,
                    is_active: true
                }))
            } else if (drawerMode === 'edit' && selectedDivision) {
                await dispatch(updateDivision({
                    divisionId: selectedDivision.sales_division_id,
                    payload: {
                        name: values.companyName,
                        division_category: values.category,
                        sales_company_id: companyId,
                        is_active: selectedDivision.is_active
                    }
                }))
            }
            onDrawerClose()
        } catch (error) {
            console.error('Failed to save division:', error)
        }
    }

    const handleDelete = async (division: SalesDivision) => {
        if (confirm(`Are you sure you want to delete "${division.name}"?`)) {
            try {
                await dispatch(deleteDivision(division.sales_division_id))
            } catch (error) {
                console.error('Failed to delete division:', error)
            }
        }
    }

    const DrawerFooter = (
        <div className="flex justify-between items-center w-full gap-3 px-2">
            <Button
                size="sm"
                variant="default"
                className="flex-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-gray-200 dark:hover:!bg-gray-700 dark:hover:!border-gray-500"
                onClick={onDrawerClose}
            >
                Cancel
            </Button>
            <Button
                size="sm"
                variant="solid"
                className="flex-1 bg-primary hover:bg-primary-deep text-neutral border-none"
                onClick={handleSubmitClick}
            >
                {drawerMode === 'create' ? 'Create' : 'Save'}
            </Button>
        </div>
    )

    const DrawerTitle = (
        <div>
            <h4 className="mb-2 text-lg font-bold">
                {drawerMode === 'create' ? 'Create New Sales Division' : 'Edit Sales Division'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {drawerMode === 'create' 
                    ? 'Fill in the details to create a new sales division'
                    : 'Update the details of the sales division'}
            </p>
        </div>
    )

    const stats = [
        {
            icon: <HiOfficeBuilding />,
            value: loading ? '...' : divisions.length,
            label: 'Total Sales Divisions',
        },
        {
            icon: <HiUserGroup />,
            value: teamsData.length,
            label: 'Total Teams',
        },
        {
            icon: <HiOfficeBuilding />,
            value: loading ? '...' : divisions.filter(d => d.is_active).length,
            label: 'Active Sales Divisions',
        },
    ]

    const companies = divisions.map(d => ({
        id: d.sales_division_id,
        name: d.name,
        category: d.division_category,
        createdDate: dayjs(d.created_at).format('MMM DD, YYYY'),
        teams: teamCountByDivision[d.sales_division_id] ?? 0,
        status: (d.is_active ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
        original: d
    }))

    return (
        <div className="min-h-full">
            {/* Header Section */}
            <Container className="pb-6 px-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">
                            Sales Division Management
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Create and manage sales divisions under your supervision
                        </p>
                    </div>
                    <Button
                        variant="solid"
                        size="sm"
                        icon={<HiPlus />}
                        className="bg-primary hover:bg-primary-deep text-neutral border-none whitespace-nowrap rounded-md"
                        onClick={() => openDrawer('create')}
                    >
                        Create Sales Division
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
                            onEdit={(e) => {
                                e.stopPropagation()
                                openDrawer('edit', company.original)
                            }}
                            onDelete={(e) => {
                                e.stopPropagation()
                                handleDelete(company.original)
                            }}
                        />
                    ))}
                </div>
            </Container>

            {/* Create Sales Division Drawer */}
            <Drawer
                title={DrawerTitle}
                isOpen={isDrawerOpen}
                footer={DrawerFooter}
                headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
                footerClass="!bg-gray-100 dark:!bg-gray-900 !p-3"
                bodyClass="!p-4 !bg-gray-100 dark:!bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
                <div className="px-2">
                    <CompanyForm
                        key={
                            selectedDivision?.sales_division_id ??
                            `create-${drawerMode}`
                        }
                        ref={formRef}
                        onSubmit={onCompanySubmit}
                        onCancel={onDrawerClose}
                        defaultValues={
                            selectedDivision
                                ? {
                                      companyName: selectedDivision.name,
                                      category:
                                          selectedDivision.division_category,
                                  }
                                : undefined
                        }
                    />
                </div>
            </Drawer>
        </div>
    )
}

export default CompanyList
