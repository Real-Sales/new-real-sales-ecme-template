import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { injectReducer } from '@/store'
import { Button, Select, Avatar, Spinner } from '@/components/ui'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    HiOutlineSearch,
    HiOutlineOfficeBuilding,
    HiOutlineBriefcase,
    HiArrowLeft,
} from 'react-icons/hi'
import { useAppSelector, useAppDispatch } from '@/store'
import { fetchIndustries } from '@/store/slices/industriesCatalogSlice'
import { fetchUserProfile } from '@/views/profile/Settings/store/settingsSlice'
import type { AIPersona } from '@/components/shared/SessionSetupPanel'
import { apiCreateSession } from '@/services/SessionService'
import {
    apiGetCreditsRemaining,
    apiGetMySubscription,
    isCompanyCreditPool,
} from '@/services/SubscriptionService'
import { setActiveUserSubscription } from '@/views/profile/Subscription/store/subscriptionSlice'
import { getApiErrorMessage, isSegmentMismatchError } from '@/utils/getApiErrorMessage'
import type { AiPersonaListItem, InteractionModeListItem } from '@/views/sales/ScenarioList/types'
import scenarioLibraryReducer, {
    useAppSelector as useScenarioSelector,
    fetchPersonas,
    fetchModes,
    type FetchPersonasParams,
} from '@/views/sales/ScenarioList/store'
import { useUserDivisionSegment } from '@/utils/hooks/useUserDivisionSegment'
import { canLoadAllPersonas } from '@/utils/inviteAccess'

injectReducer('scenarioLibrary', scenarioLibraryReducer)

const formatLabel = (value: string) =>
    value
        .replace(/_/g, ' ')
        .split(' ')
        .map((w) => {
            const letters = w.replace(/[^a-zA-Z0-9]/g, '')
            // preserve short all-caps acronyms like B2B, CPG, IT, HR, etc.
            if (letters.length <= 5 && letters === letters.toUpperCase() && /[A-Z]/.test(letters)) {
                return w
            }
            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        })
        .join(' ')

const normalizeIndustryKey = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, '_')

const normalizeForMatch = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]/g, '')

function personaMatchesUserIndustry(personaIndustry: string, userIndustry: string): boolean {
    if (!userIndustry) return true

    const personaLower = personaIndustry.toLowerCase().trim()
    const userLower = userIndustry.toLowerCase().trim()
    const userKey = normalizeIndustryKey(userIndustry)

    if (personaLower === userLower) return true
    if (personaLower === userKey.replace(/_/g, ' ')) return true

    const personaNorm = normalizeForMatch(personaIndustry)
    const userNorm = normalizeForMatch(userIndustry)
    if (personaNorm && userNorm && (personaNorm.includes(userNorm) || userNorm.includes(personaNorm))) {
        return true
    }

    const userTokens = userIndustry
        .toLowerCase()
        .split(/[_\s()]+/)
        .map((t) => normalizeForMatch(t))
        .filter((t) => t.length > 2)
    if (userTokens.some((token) => personaNorm.includes(token))) {
        return true
    }

    const mapped = industryToPersonaIndustries[userKey]
    if (mapped?.some((m) => m.toLowerCase() === personaLower)) return true

    return false
}

// Map user's profile industry to persona industries (strict matching)
const industryToPersonaIndustries: Record<string, string[]> = {
    technology: ['Technology', 'Software'],
    healthcare: ['Technology', 'Software', 'Healthcare'],
    health: ['Healthcare', 'Technology', 'Software'],
    finance: ['Finance'],
    retail: ['Retail'],
    manufacturing: ['Manufacturing', 'Industrial'],
    real_estate: ['Finance'],
    education: ['Technology', 'Software'],
    media: ['Marketing', 'Technology'],
    telecom: ['Technology', 'Software'],
    energy: ['Industrial', 'Manufacturing'],
    automotive: ['Manufacturing', 'Industrial'],
    logistics: ['Industrial', 'Manufacturing'],
    consulting: ['Finance', 'Technology'],
    insurance: ['Finance'],
    food: ['Retail', 'Manufacturing'],
    travel: ['Retail'],
    agriculture: ['Manufacturing', 'Industrial'],
    construction: ['Manufacturing', 'Industrial'],
    other: ['Manufacturing', 'Technology', 'Industrial', 'Finance', 'Software', 'Retail', 'Marketing'],
}

function mapPersona(p: AiPersonaListItem): AIPersona {
    return {
        id: p.persona_id,
        name: p.name,
        role: p.ai_role?.name || 'Role',
        company: p.company_size_new?.name || p.geography || 'Company',
        industry: p.industry?.name || 'General',
        personality: p.behavioral_detail || '',
        difficulty: 'Medium' as const,
        avatar: p.profile_pic,
    }
}

const PersonaSelection = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()
    const authUser = useAppSelector((state) => state.auth.user)
    const settingsProfile = useAppSelector((state) => state.settings.profile)
    const profileInitialized = useAppSelector(
        (state) => state.settings.profileInitialized,
    )
    const profileLoading = useAppSelector((state) => state.settings.profileLoading)
    const industriesCatalog = useAppSelector(
        (state) => state.industriesCatalog.industries,
    )
    const industriesInitialized = useAppSelector(
        (state) => state.industriesCatalog.initialized,
    )
    const industriesLoading = useAppSelector(
        (state) => state.industriesCatalog.loading,
    )

    const {
        customerSegmentId,
        customerSegments,
        salesDivisionId,
        loading: divisionSegmentLoading,
    } = useUserDivisionSegment()

    const customerSegmentIds = useMemo(
        () => customerSegments.map((s) => s.id),
        [customerSegments],
    )
    const customerSegmentNames = useMemo(
        () => customerSegments.map((s) => s.name),
        [customerSegments],
    )

    const storePersonas = useScenarioSelector(
        (state) => state.scenarioLibrary?.data?.personasData,
    )
    const storeModes = useScenarioSelector(
        (state) => state.scenarioLibrary?.data?.modesData,
    )
    const personasLoading = useScenarioSelector(
        (state) => state.scenarioLibrary?.data?.personasLoading,
    )
    const modesLoading = useScenarioSelector(
        (state) => state.scenarioLibrary?.data?.modesLoading,
    )
    const companyIndustryId = useAppSelector(
        (state) =>
            state.auth.user.industryId || state.settings.profile?.companyIndustryId,
    )
    const activeUserSubscription = useAppSelector(
        (state) => state.subscription.activeUserSubscription,
    )

    const userIndustry =
        settingsProfile?.companyIndustry ||
        authUser?.industry ||
        settingsProfile?.industryLabel ||
        settingsProfile?.industry ||
        ''

    const resolvedIndustryId = useMemo(() => {
        if (companyIndustryId) return companyIndustryId
        if (!userIndustry || !industriesCatalog.length) return ''
        const match = industriesCatalog.find(
            (item) =>
                item.name === userIndustry ||
                normalizeIndustryKey(item.name) === normalizeIndustryKey(userIndustry),
        )
        return match?.industry_id ?? ''
    }, [companyIndustryId, userIndustry, industriesCatalog])
    const sessionData = location.state as {
        mode: string
        scenarios?: string[]
        files?: File[]
        /** Prior mode's session_id — set when arriving via "Continue to next mode" from SessionReport. */
        continueFromSessionId?: string
        /** Persona to auto-continue with, so the rep isn't asked to re-pick who they were talking to. */
        prefillPersonaId?: string
    }
    const autoContinueTriggeredRef = useRef(false)

    const [creatingPersonaId, setCreatingPersonaId] = useState<string | null>(
        null,
    )
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedIndustry, setSelectedIndustry] = useState('')

    const lastPersonasFetchKeyRef = useRef<string | null>(null)
    const modesFetchDispatchedRef = useRef(false)

    useEffect(() => {
        if (!profileInitialized && !profileLoading) {
            dispatch(fetchUserProfile())
        }
    }, [dispatch, profileInitialized, profileLoading])

    useEffect(() => {
        if (
            userIndustry &&
            !industriesInitialized &&
            !industriesLoading
        ) {
            dispatch(fetchIndustries())
        }
    }, [dispatch, userIndustry, industriesInitialized, industriesLoading])

    useEffect(() => {
        if (divisionSegmentLoading || customerSegmentIds.length === 0) return

        if (
            !resolvedIndustryId &&
            !canLoadAllPersonas(authUser.role) &&
            !profileInitialized
        ) {
            dispatch(fetchUserProfile())
            return
        }

        const segmentKey = [...customerSegmentIds].sort().join(',')
        const fetchKey = `${segmentKey}|${resolvedIndustryId || 'all'}`
        if (lastPersonasFetchKeyRef.current === fetchKey) return

        const params: FetchPersonasParams = {
            customerSegmentIds,
        }
        if (!canLoadAllPersonas(authUser.role) && resolvedIndustryId) {
            params.industryId = resolvedIndustryId
        }

        lastPersonasFetchKeyRef.current = fetchKey
        dispatch(fetchPersonas(params))
    }, [
        dispatch,
        divisionSegmentLoading,
        customerSegmentIds,
        resolvedIndustryId,
        profileInitialized,
        authUser.role,
    ])

    useEffect(() => {
        if (!storeModes?.length && !modesLoading && !modesFetchDispatchedRef.current) {
            modesFetchDispatchedRef.current = true
            dispatch(fetchModes())
        }
    }, [dispatch, storeModes?.length, modesLoading])

    const aiPersonas = useMemo(() => {
        if (!storePersonas?.length) return []
        return storePersonas.filter((p) => p.status_active).map(mapPersona)
    }, [storePersonas])

    const interactionModes = useMemo(() => {
        if (!storeModes?.length) return []
        return storeModes.filter((m) => m.status_active)
    }, [storeModes])

    const isLoading =
        (personasLoading ?? false) || (modesLoading ?? false) || divisionSegmentLoading
    const divisionSetupIncomplete =
        !divisionSegmentLoading &&
        Boolean(salesDivisionId) &&
        customerSegmentIds.length === 0
    const noDivisionAssigned =
        !divisionSegmentLoading && !salesDivisionId

    const catalogIndustry = useMemo(() => {
        if (resolvedIndustryId) {
            return industriesCatalog.find(
                (item) => item.industry_id === resolvedIndustryId,
            )
        }
        if (!userIndustry) return undefined
        return industriesCatalog.find(
            (item) =>
                item.name === userIndustry ||
                normalizeIndustryKey(item.name) === normalizeIndustryKey(userIndustry),
        )
    }, [resolvedIndustryId, industriesCatalog, userIndustry])

    const relatedPersonas = useMemo(() => {
        if (!userIndustry && !resolvedIndustryId) {
            return aiPersonas
        }

        const industryFiltered = aiPersonas.filter((persona) => {
            const rawPersona = storePersonas?.find((p) => p.persona_id === persona.id)
            if (catalogIndustry && rawPersona?.industry?.industry_id) {
                return rawPersona.industry.industry_id === catalogIndustry.industry_id
            }
            return personaMatchesUserIndustry(persona.industry, userIndustry)
        })

        return industryFiltered.length > 0 ? industryFiltered : aiPersonas
    }, [userIndustry, resolvedIndustryId, aiPersonas, storePersonas, catalogIndustry])

    const profilePersonaIndustry = useMemo(() => {
        if ((!userIndustry && !resolvedIndustryId) || !aiPersonas.length) return ''

        if (catalogIndustry) {
            const match = aiPersonas.find((persona) => {
                const raw = storePersonas?.find((p) => p.persona_id === persona.id)
                return raw?.industry?.industry_id === catalogIndustry.industry_id
            })
            if (match) return match.industry
        }

        const fromRelated = relatedPersonas.find((persona) =>
            personaMatchesUserIndustry(persona.industry, userIndustry),
        )
        if (fromRelated) return fromRelated.industry

        return relatedPersonas[0]?.industry ?? ''
    }, [
        userIndustry,
        resolvedIndustryId,
        aiPersonas,
        storePersonas,
        catalogIndustry,
        relatedPersonas,
    ])

    useEffect(() => {
        if (!profilePersonaIndustry || !aiPersonas.length) {
            return
        }
        setSelectedIndustry(profilePersonaIndustry)
    }, [profilePersonaIndustry, aiPersonas.length, profileInitialized])

    const isProfileIndustryFilter =
        Boolean(userIndustry) &&
        Boolean(profilePersonaIndustry) &&
        selectedIndustry === profilePersonaIndustry

    const personaPool = useMemo(() => {
        if (isProfileIndustryFilter) {
            return relatedPersonas
        }
        if (selectedIndustry) {
            return aiPersonas.filter((persona) => persona.industry === selectedIndustry)
        }
        return aiPersonas
    }, [
        isProfileIndustryFilter,
        selectedIndustry,
        relatedPersonas,
        aiPersonas,
    ])

    const roleOptions = useMemo(() => {
        const roles = [...new Set(personaPool.map((p) => p.role))].sort()
        return [{ value: '', label: 'All Roles' }, ...roles.map((r) => ({ value: r, label: formatLabel(r) }))]
    }, [personaPool])

    // Filter and search personas (profile industry applied automatically)
    const filteredPersonas = useMemo(() => {
        return personaPool.filter((persona) => {
            const matchesSearch =
                searchQuery === '' ||
                persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                persona.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                persona.company
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                persona.industry
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())

            const matchesRole =
                selectedRole === '' || persona.role === selectedRole

            return matchesSearch && matchesRole
        })
    }, [personaPool, searchQuery, selectedRole])

    const handleStartSession = async (persona: AIPersona) => {
        if (creatingPersonaId) return

        const matchedMode = interactionModes.find(
            (m) => m.name.toLowerCase() === sessionData?.mode?.toLowerCase(),
        )
        if (!matchedMode) {
            toast.push(
                <Notification title="Error" type="danger">
                    Interaction mode not found. Please go back and try again.
                </Notification>,
            )
            return
        }

        setCreatingPersonaId(persona.id)
        try {
            let remaining =
                activeUserSubscription?.credits_remaining != null
                    ? Number(activeUserSubscription.credits_remaining)
                    : null
            if (remaining == null) {
                try {
                    const credits = await apiGetCreditsRemaining()
                    remaining = Number(credits.credits_remaining ?? 0)
                } catch {
                    remaining = null
                }
            }
            if (remaining != null && remaining <= 0) {
                const poolHint = isCompanyCreditPool(activeUserSubscription)
                    ? ' Ask your company owner to upgrade shared credits.'
                    : ' Upgrade your plan to continue.'
                toast.push(
                    <Notification title="No credits remaining" type="warning">
                        No credits remaining.{poolHint}
                    </Notification>,
                )
                return
            }

            const session = await apiCreateSession({
                persona_id: persona.id,
                mode_id: matchedMode.mode_id,
                scenario_id: sessionData?.scenarios?.[0],
                continue_from_session_id: sessionData?.continueFromSessionId,
            })

            try {
                const refreshed = await apiGetMySubscription()
                dispatch(setActiveUserSubscription(refreshed))
            } catch {
                /* badge refresh is best-effort */
            }

            navigate(`/audio-visualizer/${session.session_id}`, {
                state: {
                    ...sessionData,
                    persona,
                },
            })
        } catch (err: unknown) {
            console.error('Failed to create session:', err)
            const message = getApiErrorMessage(
                err,
                'Failed to create session. Please try again.',
            )
            const isCreditsError = /credit/i.test(message)
            toast.push(
                <Notification
                    title={isCreditsError ? 'No credits remaining' : 'Error'}
                    type={isCreditsError ? 'warning' : 'danger'}
                >
                    {isCreditsError
                        ? `${message}${
                              isCompanyCreditPool(activeUserSubscription)
                                  ? ' Ask your company owner to upgrade.'
                                  : ''
                          }`
                        : message}
                </Notification>,
            )
        } finally {
            setCreatingPersonaId(null)
        }
    }

    // Arriving from SessionReport's "Continue to next mode" CTA: skip the
    // persona-picker click and immediately resume with the same persona.
    useEffect(() => {
        if (
            autoContinueTriggeredRef.current ||
            !sessionData?.continueFromSessionId ||
            !sessionData?.prefillPersonaId ||
            !aiPersonas.length ||
            !interactionModes.length
        ) {
            return
        }
        const prefillPersona = aiPersonas.find(
            (p) => p.id === sessionData.prefillPersonaId,
        )
        if (!prefillPersona) return
        autoContinueTriggeredRef.current = true
        void handleStartSession(prefillPersona)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aiPersonas, interactionModes, sessionData?.continueFromSessionId, sessionData?.prefillPersonaId])

    const handleBack = () => {
        navigate(-1)
    }

    const handleClearFilters = () => {
        setSearchQuery('')
        setSelectedRole('')
        setSelectedIndustry(profilePersonaIndustry || '')
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
            case 'Medium':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
            case 'Hard':
                return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="min-w-0 flex-1 pr-2">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
                                Select Your AI Persona
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl">
                                Choose who you'd like to practice with for your{' '}
                                <span className="font-semibold text-primary bg-primary/10 dark:bg-primary/15 px-2 py-0.5 rounded-md">
                                    {sessionData?.mode}
                                </span>{' '}
                                session. Tap a persona to start.
                            </p>
                        </div>
                        <Button
                            variant="plain"
                            size="sm"
                            onClick={handleBack}
                            icon={<HiArrowLeft className="w-5 h-5" />}
                            className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                        >
                            Back
                        </Button>
                    </div>

                    {/* Search, Filters, and Results count */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div className="flex flex-col lg:flex-row flex-1 w-full gap-3">
                            <div className="relative w-full lg:max-w-xs xl:max-w-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm shadow-sm"
                                    placeholder="Search by name, role, company..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto">
                                <Select
                                    size="sm"
                                    placeholder="Role"
                                    options={roleOptions}
                                    value={roleOptions.find((opt) => opt.value === selectedRole)}
                                    onChange={(option) => setSelectedRole(option?.value as string || '')}
                                    className="w-[calc(50%-0.25rem)] sm:w-36"
                                    menuPlacement="auto"
                                    styles={{ menu: (base) => ({ ...base, minWidth: '200px' }), option: (base) => ({ ...base, whiteSpace: 'normal', wordBreak: 'break-word' }) }}
                                />
                                {(searchQuery || selectedRole) && (
                                    <Button
                                        variant="plain"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 whitespace-nowrap self-end xl:self-auto">
                            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                {filteredPersonas.length} of {aiPersonas.length} personas
                            </p>
                            {userIndustry && isProfileIndustryFilter && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded border border-primary/20 dark:border-primary/30 text-[10px] sm:text-xs font-medium bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary">
                                    Filtered by profile
                                </span>
                            )}
                            {customerSegmentNames.map((name) => (
                                <span
                                    key={name}
                                    className="inline-flex items-center px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/30 text-[10px] sm:text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Personas Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {noDivisionAssigned ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Division assignment required
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md text-center text-lg">
                            You need to be assigned to a sales division and team before starting a session. Please contact your manager or company owner.
                        </p>
                    </div>
                ) : divisionSetupIncomplete ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Division setup incomplete
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md text-center text-lg">
                            Your division is missing a customer segment. Contact your manager.
                        </p>
                    </div>
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Spinner size={48} className="text-primary mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading personas...</p>
                    </div>
                ) : filteredPersonas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                            <HiOutlineSearch className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            No personas found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md text-center text-lg">
                            {relatedPersonas.length === 0 && isProfileIndustryFilter
                                ? "No personas match your industry and product category. Try updating your company profile in Settings."
                                : "We couldn't find any personas matching your current filters. Try adjusting your search."}
                        </p>
                        {(searchQuery || selectedRole) && (
                            <Button variant="default" className="mt-8" onClick={handleClearFilters}>
                                Clear all filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPersonas.map((persona) => {
                            const isBusy = creatingPersonaId === persona.id

                            return (
                                <motion.div
                                    key={persona.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full"
                                >
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                            if (!creatingPersonaId) {
                                                void handleStartSession(persona)
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (
                                                (e.key === 'Enter' ||
                                                    e.key === ' ') &&
                                                !creatingPersonaId
                                            ) {
                                                e.preventDefault()
                                                void handleStartSession(
                                                    persona,
                                                )
                                            }
                                        }}
                                        aria-busy={isBusy}
                                        aria-label={`Start session with ${persona.name}`}
                                        className={`
                                            group relative h-full flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-2xl transition-all duration-300 overflow-hidden border shadow-md
                                            ${
                                                creatingPersonaId
                                                    ? 'cursor-wait opacity-90'
                                                    : 'cursor-pointer'
                                            }
                                            ${
                                                isBusy
                                                    ? 'border-primary shadow-xl shadow-primary/10'
                                                    : 'border-gray-200 dark:border-gray-700 hover:shadow-xl hover:translate-y-[-4px]'
                                            }
                                        `}
                                    >
                                        {/* Decorative Header Background */}
                                        <div className="h-24 w-full bg-gradient-to-br from-slate-100 via-primary/5 to-slate-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 absolute top-0 left-0 transition-opacity duration-300 group-hover:opacity-80" />

                                        {isBusy && (
                                            <div className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 shadow-lg">
                                                <Spinner
                                                    size={20}
                                                    enableTheme={false}
                                                    className="text-white"
                                                />
                                            </div>
                                        )}

                                        <div className="relative z-10 flex flex-col flex-grow pt-10 px-6 pb-6">
                                            <Avatar
                                                size={96}
                                                src={persona.avatar}
                                                shape="circle"
                                                className={`
                                                    mb-5 mx-auto ring-4 shadow-lg transition-all duration-300 bg-white dark:bg-gray-900
                                                    ring-white dark:ring-gray-800/50 group-hover:ring-primary/10
                                                `}
                                            />
                                            
                                            <div className="text-center mb-6">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                                                    {persona.name}
                                                </h3>
                                                <p className="text-sm font-semibold text-primary">
                                                    {formatLabel(persona.role)}
                                                </p>
                                            </div>

                                            <div className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 space-y-4 mb-6 border border-gray-200 dark:border-gray-700 flex-grow">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                                                        <HiOutlineOfficeBuilding className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col text-left overflow-hidden">
                                                        <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-0.5">Company Size</span>
                                                        <span className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate" title={persona.company}>
                                                            {persona.company}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                                                        <HiOutlineBriefcase className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col text-left overflow-hidden">
                                                        <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-0.5">Industry</span>
                                                        <span className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate" title={formatLabel(persona.industry)}>
                                                            {formatLabel(persona.industry)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {persona.personality && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 italic text-center px-2">
                                                    "{persona.personality}"
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <span
                                                    className={`text-xs px-3 py-1.5 rounded-lg font-bold uppercase tracking-wide border ${
                                                        getDifficultyColor(persona.difficulty)
                                                    } ${
                                                        persona.difficulty === 'Easy' ? 'border-emerald-200 dark:border-emerald-800/30' :
                                                        persona.difficulty === 'Medium' ? 'border-amber-200 dark:border-amber-800/30' :
                                                        'border-rose-200 dark:border-rose-800/30'
                                                    }`}
                                                >
                                                    {persona.difficulty}
                                                </span>

                                                <div
                                                    className={`text-sm font-bold flex items-center gap-1 transition-all duration-300 ${
                                                        isBusy
                                                            ? 'text-primary'
                                                            : 'text-gray-400 group-hover:text-primary'
                                                    }`}
                                                >
                                                    {isBusy
                                                        ? 'Starting…'
                                                        : 'Start session'}
                                                    {!isBusy && (
                                                        <span className="text-lg opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                                                            →
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

        </div>
    )
}

export default PersonaSelection
