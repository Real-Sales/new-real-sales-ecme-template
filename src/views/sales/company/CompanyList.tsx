import { useState, useRef, useEffect, useMemo } from 'react'
import { SURFACE_CARD_CLASSNAME } from '@/constants/surfaceCard.constant'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Badge, toast, Notification } from '@/components/ui'
import Container from '@/components/shared/Container'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { FormDrawer } from '@/components/shared/form'
import DivisionForm, { type CompanyFormSchema } from './DivisionForm'
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
import { fetchUserProfile } from '@/views/profile/Settings/store/settingsSlice'
import type { SalesDivision } from '@/services/SalesDivisionsService'
import { formatDisplayLabel } from '@/utils/formatDisplayLabel'
import Tag from '@/components/ui/Tag'
import dayjs from 'dayjs'

// Inject reducer when component mounts (lazy-loaded)
injectReducer('salesDivisions', salesDivisionsReducer)
injectReducer('teams', teamsReducer)

// Stats card component
type StatsCardProps = {
    icon: React.ReactNode
    value: string | number
    label: string
}

const StatsCard = ({ icon, value, label }: StatsCardProps) => {
    return (
        <Card className={`${SURFACE_CARD_CLASSNAME} hover:shadow-md transition-shadow duration-300`}
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
    customerSegmentName?: string
    products: { id: string; name: string }[]
    createdDate: string
    teams: number
    status: 'Active' | 'Inactive'
    onClick: () => void
    onEdit: (e: React.MouseEvent) => void
    onDelete: (e: React.MouseEvent) => void
}

const CompanyCard = ({
    id,
    name,
    category,
    customerSegmentName,
    products,
    createdDate,
    teams,
    status,
    onClick,
    onEdit,
    onDelete,
}: CompanyCardProps) => {
    return (
        <Card
            className={`${SURFACE_CARD_CLASSNAME} hover:shadow-md transition-shadow duration-300 cursor-pointer overflow-hidden rounded-2xl relative`}
            bodyClass="!p-2"
            onClick={onClick}
            data-tour-id="division-card"
            data-division-id={id}
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
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 h-17 w-17 rounded-full border border-gray-200 dark:border-white/20 bg-white backdrop-blur-md backdrop-saturate-150 dark:bg-black/45 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_24px_rgba(0,0,0,0.35)] text-emerald-700 dark:text-white flex items-center justify-center shadow-lg">
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
                    {customerSegmentName && (
                        <Tag className="mt-1.5 rounded-full border-0 bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {customerSegmentName}
                        </Tag>
                    )}
                    {products.length > 0 ? (
                        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                            {products.map((product) => (
                                <Tag
                                    key={product.id || product.name}
                                    className="rounded-full border-0 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary dark:bg-primary/20 dark:text-primary-mild"
                                >
                                    {product.name}
                                </Tag>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                            No products assigned
                        </p>
                    )}
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
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create')
    const [selectedDivision, setSelectedDivision] = useState<SalesDivision | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [divisionToDelete, setDivisionToDelete] = useState<SalesDivision | null>(null)
    const [deletingDivisionId, setDeletingDivisionId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [formDirty, setFormDirty] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    const companyIdRaw = useAppSelector((state) => state.auth.user.companyId)
    const profileInitialized = useAppSelector(
        (state) => state.settings.profileInitialized,
    )
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
        if (!profileInitialized) {
            dispatch(fetchUserProfile())
        }
    }, [dispatch, profileInitialized])

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
        setFormDirty(false)
        if (mode === 'edit' && division) {
            setSelectedDivision(division)
        } else {
            setSelectedDivision(null)
        }
        setIsDrawerOpen(true)
    }

    const onDrawerClose = () => {
        if (submitting) return
        setIsDrawerOpen(false)
        setSelectedDivision(null)
        setFormDirty(false)
    }

    const closeDrawerAfterSubmit = () => {
        setIsDrawerOpen(false)
        setSelectedDivision(null)
        setFormDirty(false)
    }

    const divisions = divisionsData
    const loading = divisionsLoading

    const handleCompanyClick = (companyId: string) => {
        navigate(`/sales-division/${companyId}`)
    }

    const handleSubmitClick = () => {
        if (submitting) return
        if (formRef.current) {
            formRef.current.requestSubmit()
        }
    }

    const onCompanySubmit = async (values: CompanyFormSchema) => {
        if (!companyId) {
            toast.push(
                <Notification title="Error" type="danger">
                    Company ID is missing. Please log in again.
                </Notification>
            )
            return
        }

        setSubmitting(true)
        try {
            if (drawerMode === 'create') {
                const result = await dispatch(createDivision({
                    name: values.companyName,
                    division_category: values.category,
                    sales_company_id: companyId,
                    is_active: true,
                    product_ids: values.productIds,
                    customer_segment_id: values.customerSegmentId,
                }))
                if (createDivision.fulfilled.match(result)) {
                    closeDrawerAfterSubmit()
                }
            } else if (drawerMode === 'edit' && selectedDivision) {
                const result = await dispatch(updateDivision({
                    divisionId: selectedDivision.sales_division_id,
                    payload: {
                        name: values.companyName,
                        division_category: values.category,
                        sales_company_id: companyId,
                        is_active: selectedDivision.is_active,
                        product_ids: values.productIds,
                        customer_segment_id: values.customerSegmentId,
                    }
                }))
                if (updateDivision.fulfilled.match(result)) {
                    closeDrawerAfterSubmit()
                }
            }
        } catch (error) {
            console.error('Failed to save division:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const openDeleteDialog = (division: SalesDivision) => {
        setDivisionToDelete(division)
        setDeleteDialogOpen(true)
    }

    const closeDeleteDialog = () => {
        if (deletingDivisionId) return
        setDeleteDialogOpen(false)
        setDivisionToDelete(null)
    }

    const handleDeleteDivision = async () => {
        if (!divisionToDelete) return

        const divisionId = divisionToDelete.sales_division_id
        setDeletingDivisionId(divisionId)
        try {
            const result = await dispatch(deleteDivision(divisionId))
            if (deleteDivision.fulfilled.match(result)) {
                setDeleteDialogOpen(false)
                setDivisionToDelete(null)
            }
        } catch (error) {
            console.error('Failed to delete division:', error)
        } finally {
            setDeletingDivisionId(null)
        }
    }

    /** Existing category names, offered as one-tap suggestions in the form. */
    const categorySuggestions = useMemo(
        () => [
            ...new Set(
                divisionsData
                    .map((division) => division.division_category?.trim())
                    .filter((category): category is string => Boolean(category)),
            ),
        ],
        [divisionsData],
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
        customerSegmentName: d.customer_segment?.name,
        products: (d.products ?? []).map((p) => ({
            id: p.product_id,
            name: formatDisplayLabel(p.name),
        })),
        createdDate: dayjs(d.created_at).format('MMM DD, YYYY'),
        teams: teamCountByDivision[d.sales_division_id] ?? 0,
        status: (d.is_active ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
        original: d
    }))

    return (
        <div className="min-h-full">
            {/* Header Section */}
            <Container className="pb-6 px-4">
                <div
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
                    data-tour-id="sales-division-page"
                >
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
                        data-tour-id="add-division-button"
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
                                openDeleteDialog(company.original)
                            }}
                        />
                    ))}
                </div>
            </Container>

            {/* Create / edit sales division */}
            <FormDrawer
                isOpen={isDrawerOpen}
                width={540}
                title={
                    drawerMode === 'create'
                        ? 'New sales division'
                        : 'Edit sales division'
                }
                description={
                    drawerMode === 'create'
                        ? 'Products, segment and teams that sell together.'
                        : 'Applies to every team and scenario in this division.'
                }
                submitLabel={
                    drawerMode === 'create' ? 'Create division' : 'Save changes'
                }
                submitting={submitting}
                isDirty={formDirty}
                footerSlot={
                    drawerMode === 'edit' && formDirty
                        ? 'Unsaved changes'
                        : undefined
                }
                onSubmit={handleSubmitClick}
                onClose={onDrawerClose}
            >
                <DivisionForm
                    key={
                        selectedDivision?.sales_division_id ??
                        `create-${drawerMode}`
                    }
                    ref={formRef}
                    salesCompanyId={companyId ?? ''}
                    categorySuggestions={categorySuggestions}
                    onSubmit={onCompanySubmit}
                    onCancel={onDrawerClose}
                    onDirtyChange={setFormDirty}
                    defaultValues={
                        selectedDivision
                            ? {
                                  companyName: selectedDivision.name,
                                  category: selectedDivision.division_category,
                                  customerSegmentId:
                                      selectedDivision.customer_segment_id ?? '',
                                  productIds: (selectedDivision.products ?? [])
                                      .map((p) => p.product_id)
                                      .filter(Boolean),
                              }
                            : undefined
                    }
                />
            </FormDrawer>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                type="danger"
                title="Delete sales division"
                confirmText="Delete"
                cancelText="Cancel"
                onClose={closeDeleteDialog}
                onRequestClose={closeDeleteDialog}
                onCancel={closeDeleteDialog}
                onConfirm={handleDeleteDivision}
                confirmButtonProps={{ loading: !!deletingDivisionId }}
            >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {divisionToDelete?.name}
                    </span>
                    ?
                    {divisionToDelete &&
                    (teamCountByDivision[divisionToDelete.sales_division_id] ?? 0) >
                        0 ? (
                        <>
                            {' '}
                            This will also remove the{' '}
                            {teamCountByDivision[divisionToDelete.sales_division_id]}{' '}
                            team
                            {teamCountByDivision[
                                divisionToDelete.sales_division_id
                            ] === 1
                                ? ''
                                : 's'}{' '}
                            under this division.
                        </>
                    ) : null}
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default CompanyList
