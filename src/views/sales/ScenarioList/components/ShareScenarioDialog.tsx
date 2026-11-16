import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import ScrollBar from '@/components/ui/ScrollBar'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import toast from '@/components/ui/toast'
import classNames from '@/utils/classNames'
import { TbSearch, TbFilter } from 'react-icons/tb'
import debounce from 'lodash/debounce'
import type { MultiValue } from 'react-select'
import { apiManagerCreateSession } from '@/services/SessionService'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { apiAssignScenario } from '@/services/ScenarioLibraryService'
import type { Scenario } from '../types'
import type { ChangeEvent } from 'react'
import {
    useAppSelector,
    useAppDispatch,
    fetchScenarioAssignmentStatus,
    invalidateAssignScenarioCache,
    markScenarioMemberAssigned,
    isAssignScenarioCacheFresh,
} from '../store'
import Tag from '@/components/ui/Tag'
import { SEARCH_INPUT_CLASSNAME } from '@/constants/searchInput.constant'
import { SURFACE_INNER_TILE_CLASSNAME } from '@/constants/surfaceCard.constant'

type ProductOption = { value: string; label: string }

type ShareScenarioDialogProps = {
    isOpen: boolean
    onClose: () => void
    scenario: Scenario | null
}

const selectClassName =
    '[&>div]:!bg-gray-50 [&>div]:dark:!bg-gray-800/50 [&>div]:border [&>div]:border-gray-200 [&>div]:dark:border-gray-700 [&>div]:shadow-md'

const FILTER_FORM_ID = 'assign-scenario-product-filter'

const ShareScenarioDialog = ({
    isOpen,
    onClose,
    scenario,
}: ShareScenarioDialogProps) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const dispatch = useAppDispatch()
    const scenarioId = scenario?.scenario_id
    const {
        assignScenarioById,
        assignScenarioLoadingScenarioId,
        assignScenarioError,
    } = useAppSelector(
        (state) =>
            state.scenarioLibrary?.data ?? {
                assignScenarioById: {},
                assignScenarioLoadingScenarioId: null,
                assignScenarioError: null,
            },
    )

    const cacheEntry = scenarioId ? assignScenarioById[scenarioId] : undefined
    const hasCachedMembers = isAssignScenarioCacheFresh(cacheEntry)
    const members = hasCachedMembers ? cacheEntry!.members : []
    const assignDivisionName = cacheEntry?.salesDivisionName?.trim() || null
    const isLoading =
        Boolean(scenarioId) &&
        !hasCachedMembers &&
        assignScenarioLoadingScenarioId === scenarioId
    const loadError = assignScenarioError

    const [searchQuery, setSearchQuery] = useState('')
    const [productFilterIds, setProductFilterIds] = useState<string[]>([])
    const [draftProductFilterIds, setDraftProductFilterIds] = useState<string[]>([])
    const [filterOpen, setFilterOpen] = useState(false)
    const [isAssigning, setIsAssigning] = useState<string | null>(null)

    const resetDialogUiState = useCallback(() => {
        setSearchQuery('')
        setProductFilterIds([])
        setDraftProductFilterIds([])
        setFilterOpen(false)
        setIsAssigning(null)
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }, [])

    useEffect(() => {
        if (!isOpen) {
            resetDialogUiState()
            return
        }

        if (!scenarioId) return

        const scenarioDivisionId = scenario?.sales_division_id ?? null
        const cacheDivisionMismatch =
            Boolean(cacheEntry?.salesDivisionId) &&
            Boolean(scenarioDivisionId) &&
            cacheEntry!.salesDivisionId !== scenarioDivisionId

        if (cacheDivisionMismatch) {
            dispatch(invalidateAssignScenarioCache(scenarioId))
        }

        dispatch(fetchScenarioAssignmentStatus(scenarioId))
    }, [
        cacheEntry?.salesDivisionId,
        dispatch,
        isOpen,
        resetDialogUiState,
        scenario?.sales_division_id,
        scenarioId,
    ])

    const productFilterOptions: ProductOption[] = useMemo(() => {
        const seen = new Map<string, string>()
        for (const member of members) {
            for (const product of member.products) {
                if (!seen.has(product.id)) {
                    seen.set(product.id, product.name)
                }
            }
        }
        return Array.from(seen.entries()).map(([value, label]) => ({
            value,
            label,
        }))
    }, [members])

    const memberList = useMemo(() => {
        let list = members

        if (productFilterIds.length > 0) {
            list = list.filter((member) =>
                member.products.some((product) =>
                    productFilterIds.includes(product.id),
                ),
            )
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            list = list.filter(
                (member) =>
                    member.name.toLowerCase().includes(q) ||
                    member.salesDivision.toLowerCase().includes(q) ||
                    member.products.some((product) =>
                        product.name.toLowerCase().includes(q),
                    ),
            )
        }

        return list
    }, [members, productFilterIds, searchQuery])

    const debouncedSearch = useMemo(
        () =>
            debounce((query: string) => {
                setSearchQuery(query)
            }, 500),
        [],
    )

    useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch])

    const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value)
    }

    const toggleFilter = () => {
        setFilterOpen((prev) => {
            if (!prev) {
                setDraftProductFilterIds(productFilterIds)
            }
            return !prev
        })
    }

    const applyProductFilter = () => {
        setProductFilterIds(draftProductFilterIds)
        setFilterOpen(false)
    }

    const resetProductFilter = () => {
        setDraftProductFilterIds([])
        setProductFilterIds([])
        setFilterOpen(false)
    }

    const onAssignScenario = async (userId: string, memberName: string) => {
        if (!scenario) return

        setIsAssigning(userId)
        try {
            const resp = await apiManagerCreateSession({
                user_id: userId,
                persona_id: scenario.persona.persona_id,
                mode_id: scenario.mode.mode_id,
                scenario_id: scenario.scenario_id,
                scenario_text: scenario.scenario_text,
                document_content: scenario.document_content,
            })

            if (resp?.session_id) {
                await apiAssignScenario(scenario.scenario_id, resp.session_id)
                dispatch(
                    markScenarioMemberAssigned({
                        scenarioId: scenario.scenario_id,
                        userId,
                        sessionId: resp.session_id,
                    }),
                )
            }

            toast.push(
                <Notification title="Success" type="success">
                    Scenario assigned to {memberName} successfully
                </Notification>,
            )
        } catch (error) {
            console.error('Failed to assign scenario:', error)
            toast.push(
                <Notification title="Error" type="danger">
                    {getApiErrorMessage(error, 'Failed to assign scenario')}
                </Notification>,
            )
        } finally {
            setIsAssigning(null)
        }
    }

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

    const activeFilterCount = productFilterIds.length

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            contentClassName="mt-[8vh] max-w-lg !bg-white dark:!bg-gray-900/60 !border-gray-200 dark:!border-white/10"
        >
            <div className="text-center mb-6">
                <h4 className="mb-1 text-2xl font-bold">Assign Scenario</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Pick a team member to assign &quot;{scenario?.title}&quot;
                    {assignDivisionName ? (
                        <>
                            <br />
                            <span className="text-xs">
                                Showing members in <span className="font-semibold">{assignDivisionName}</span>
                            </span>
                        </>
                    ) : null}
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Spinner size={40} />
                </div>
            ) : loadError ? (
                <p className="text-sm text-red-500 dark:text-red-400 text-center py-8">
                    {loadError}
                </p>
            ) : (
                <>
                    <div className="flex gap-2 mb-4">
                        <Input
                            ref={inputRef}
                            className={`flex-1 ${SEARCH_INPUT_CLASSNAME}`}
                            prefix={<TbSearch className="text-lg" />}
                            placeholder="Search team members..."
                            onChange={onSearch}
                        />
                        <Button
                            size="sm"
                            icon={<TbFilter />}
                            className={classNames(
                                'rounded-md shrink-0 !bg-gray-50 dark:!bg-gray-800/50 !border !border-gray-200 dark:!border-gray-700 shadow-md',
                                (activeFilterCount > 0 || filterOpen) &&
                                    '!border-primary dark:!border-primary',
                            )}
                            onClick={toggleFilter}
                        >
                            Filter
                            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                        </Button>
                    </div>

                    {filterOpen && (
                        <div className={`mb-4 ${SURFACE_INNER_TILE_CLASSNAME} p-4`}>
                            <Form id={FILTER_FORM_ID} onSubmit={(e) => e.preventDefault()}>
                                <FormItem label="Products">
                                    <Select<ProductOption, true>
                                        isMulti
                                        placeholder={
                                            productFilterOptions.length === 0
                                                ? 'No products on team members'
                                                : 'Select products'
                                        }
                                        options={productFilterOptions}
                                        isDisabled={productFilterOptions.length === 0}
                                        value={productFilterOptions.filter((opt) =>
                                            draftProductFilterIds.includes(opt.value),
                                        )}
                                        onChange={(options: MultiValue<ProductOption>) => {
                                            setDraftProductFilterIds(
                                                options.map((opt) => opt.value),
                                            )
                                        }}
                                        className={selectClassName}
                                    />
                                </FormItem>
                            </Form>
                            <div className="flex gap-2 mt-2">
                                <Button
                                    size="sm"
                                    variant="default"
                                    type="button"
                                    className="flex-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-gray-200"
                                    onClick={resetProductFilter}
                                >
                                    Reset
                                </Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    type="button"
                                    className="flex-1 bg-primary hover:bg-primary-deep text-neutral border-none"
                                    onClick={applyProductFilter}
                                >
                                    Apply
                                </Button>
                            </div>
                        </div>
                    )}

                    <p className="font-bold uppercase text-xs text-gray-500 dark:text-gray-400 mb-4 tracking-wider">
                        {memberList.length} member
                        {memberList.length === 1 ? '' : 's'} available
                    </p>

                    <div className="mb-6">
                        <ScrollBar className={classNames('overflow-y-auto h-80 px-1')}>
                            {memberList.map((member) => (
                                <div
                                    key={member.userId}
                                    className="py-3 px-4 mb-2 rounded-xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar
                                            size={45}
                                            shape="circle"
                                            className="bg-primary/10 text-primary shrink-0"
                                        >
                                            {getInitials(member.name)}
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white truncate">
                                                {member.name}
                                            </p>
                                            {member.products.length > 0 ? (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {member.products.map((product) => (
                                                        <Tag
                                                            key={product.id}
                                                            className="rounded-full border-0 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary dark:bg-primary/20 dark:text-primary-mild"
                                                        >
                                                            {product.name}
                                                        </Tag>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    —
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                                                {member.salesDivision}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        loading={isAssigning === member.userId}
                                        disabled={
                                            !member.canAssign ||
                                            (isAssigning !== null &&
                                                isAssigning !== member.userId)
                                        }
                                        className={classNames(
                                            'font-semibold shrink-0 ml-2',
                                            member.canAssign
                                                ? 'bg-primary hover:bg-primary-deep text-white'
                                                : '!bg-gray-50 dark:!bg-gray-800/50 !border !border-gray-200 dark:!border-white/10 text-gray-500',
                                        )}
                                        onClick={() =>
                                            onAssignScenario(
                                                member.userId,
                                                member.name,
                                            )
                                        }
                                    >
                                        {member.canAssign ? 'Assign' : 'Assigned'}
                                    </Button>
                                </div>
                            ))}
                            {memberList.length === 0 && (
                                <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
                                    {searchQuery || productFilterIds.length > 0
                                        ? 'No members match your search or filters.'
                                        : 'No team members found. Add people to a team first.'}
                                </div>
                            )}
                        </ScrollBar>
                    </div>
                </>
            )}

            <Button block variant="plain" onClick={onClose}>
                Close
            </Button>
        </Dialog>
    )
}

export default ShareScenarioDialog
