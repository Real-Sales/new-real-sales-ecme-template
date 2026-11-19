import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { injectReducer } from '@/store'
import { Button, Select, Spinner } from '@/components/ui'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiOutlineSearch, HiArrowLeft } from 'react-icons/hi'
import { useAppSelector, useAppDispatch } from '@/store'
import { fetchIndustries } from '@/store/slices/industriesCatalogSlice'
import { fetchUserProfile } from '@/views/profile/Settings/store/settingsSlice'
import type {
    AIPersona,
    ConversationMode,
} from '@/components/shared/SessionSetupPanel'
import ModeSelectDialog from '@/views/sales/components/ModeSelectDialog'
import {
    apiCreateSession,
    apiRegenerateSessionMemory,
    type SessionResponse,
} from '@/services/SessionService'
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
import AppPremium from '@/components/layouts/PostLoginLayout/components/AppPremium'
import { JourneyCard, PersonaCard } from '@/views/sales/components/PersonaCards'
import JourneyResumeDialog from '@/views/sales/components/JourneyResumeDialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { usePersonaJourneys, type PersonaJourney } from '@/views/sales/personaJourneys'

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
        mode?: string
        scenarios?: string[]
        files?: File[]
        /** Prior mode's session_id — set when arriving via "Continue to next mode" from SessionReport. */
        continueFromSessionId?: string
        /** Persona to auto-continue with, so the rep isn't asked to re-pick who they were talking to. */
        prefillPersonaId?: string
        /** Open on the journeys tab. */
        tab?: 'all' | 'journeys'
    } | null
    const autoContinueTriggeredRef = useRef(false)

    const [creatingPersonaId, setCreatingPersonaId] = useState<string | null>(
        null,
    )
    const [pendingPersona, setPendingPersona] = useState<AIPersona | null>(null)
    const [modeDialogOpen, setModeDialogOpen] = useState(false)
    /** Persona the rep picked while part-way through a journey with them: continue, or start new? */
    const [resumePersona, setResumePersona] = useState<AIPersona | null>(null)
    const [discardTarget, setDiscardTarget] = useState<{
        persona: AIPersona
        journey: PersonaJourney
    } | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedIndustry, setSelectedIndustry] = useState('')
    const [activeTab, setActiveTab] = useState<'all' | 'journeys'>(
        sessionData?.tab === 'journeys' ? 'journeys' : 'all',
    )

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

    // Personas the rep has already practised with, and the mode each one is up to
    const {
        journeys,
        loading: journeysLoading,
        discard: discardJourney,
        restore: restoreJourney,
    } = usePersonaJourneys(
        authUser?.userId || undefined,
        storeModes,
    )
    const personaById = useMemo(() => {
        const map = new Map<string, AIPersona>()
        for (const p of storePersonas ?? []) map.set(p.persona_id, mapPersona(p))
        return map
    }, [storePersonas])
    const journeyRows = useMemo(
        () =>
            journeys
                .map((journey) => ({ journey, persona: personaById.get(journey.personaId) }))
                .filter((row): row is { journey: PersonaJourney; persona: AIPersona } =>
                    Boolean(row.persona),
                ),
        [journeys, personaById],
    )
    // A persona can have several journeys; the list is already most-recent-first
    const openJourneysByPersonaId = useMemo(() => {
        const map = new Map<string, PersonaJourney[]>()
        for (const { persona, journey } of journeyRows) {
            if (journey.completed || !journey.nextMode || !journey.continueFrom) continue
            const list = map.get(persona.id)
            if (list) list.push(journey)
            else map.set(persona.id, [journey])
        }
        return map
    }, [journeyRows])
    const completedPersonaIds = useMemo(
        () => new Set(journeyRows.filter((r) => r.journey.completed).map((r) => r.persona.id)),
        [journeyRows],
    )
    const resumeJourneys = resumePersona
        ? (openJourneysByPersonaId.get(resumePersona.id) ?? [])
        : []
    const inProgressCount = journeyRows.filter((row) => !row.journey.completed).length
    const visibleJourneyRows = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        if (!q) return journeyRows
        return journeyRows.filter(
            ({ persona }) =>
                persona.name.toLowerCase().includes(q) ||
                persona.role.toLowerCase().includes(q) ||
                persona.industry.toLowerCase().includes(q),
        )
    }, [journeyRows, searchQuery])

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

    const handleStartSession = async (
        persona: AIPersona,
        modeOverride?: ConversationMode | string,
        /** Completed session of the previous mode, when continuing a journey from this page. */
        continueFrom?: SessionResponse | null,
    ) => {
        if (creatingPersonaId) return

        const modeName = (modeOverride || sessionData?.mode || '').toLowerCase()
        const matchedMode = interactionModes.find(
            (m) => m.name.toLowerCase() === modeName,
        )
        if (!matchedMode) {
            toast.push(
                <Notification title="Error" type="danger">
                    Interaction mode not found. Please try again.
                </Notification>,
            )
            return
        }

        setCreatingPersonaId(persona.id)
        setModeDialogOpen(false)
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

            // The next mode inherits what the persona remembers; build that summary first if it is missing
            if (continueFrom && !continueFrom.session_memory) {
                try {
                    await apiRegenerateSessionMemory(continueFrom.session_id)
                } catch {
                    /* the create call below reports the reason */
                }
            }

            const session = await apiCreateSession({
                persona_id: persona.id,
                mode_id: matchedMode.mode_id,
                scenario_id: continueFrom ? undefined : sessionData?.scenarios?.[0],
                continue_from_session_id:
                    continueFrom?.session_id ?? sessionData?.continueFromSessionId,
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
                    mode: matchedMode.name,
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
            setPendingPersona(null)
        }
    }

    const handlePersonaSelect = (persona: AIPersona) => {
        if (creatingPersonaId) return
        // Continue-to-next-mode already knows the target mode — skip the picker.
        if (sessionData?.continueFromSessionId && sessionData?.mode) {
            void handleStartSession(persona)
            return
        }
        // Already part-way through with this persona: ask before starting over
        if (openJourneysByPersonaId.get(persona.id)?.length) {
            setResumePersona(persona)
            return
        }
        setPendingPersona(persona)
        setModeDialogOpen(true)
    }

    const handleContinueJourney = (persona: AIPersona, journey: PersonaJourney) => {
        if (creatingPersonaId || !journey.nextMode || !journey.continueFrom) return
        void handleStartSession(persona, journey.nextMode, journey.continueFrom)
    }

    const handleConfirmDiscard = () => {
        if (!discardTarget) return
        const { persona, journey } = discardTarget
        discardJourney(journey.journeyId)
        setDiscardTarget(null)
        // Last open journey with this persona gone: nothing left to ask about
        if ((openJourneysByPersonaId.get(persona.id)?.length ?? 0) <= 1) setResumePersona(null)
        toast.push(
            <Notification title="Journey discarded" type="success" duration={6000}>
                <div className="flex items-center justify-between gap-3">
                    <span>Your scores and reports are kept.</span>
                    <button
                        type="button"
                        className="font-bold text-primary hover:underline"
                        onClick={() => restoreJourney(journey.journeyId)}
                    >
                        Undo
                    </button>
                </div>
            </Notification>,
        )
    }

    const handleModeSelected = (mode: ConversationMode) => {
        if (!pendingPersona) return
        void handleStartSession(pendingPersona, mode)
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

    return (
        <div className="app-premium app-glass-scope relative isolate min-h-screen bg-white dark:bg-[#050505]">
            {/* Same aurora backdrop and glass styles as the rest of the app */}
            <AppPremium />
            {/* Header */}
            <div className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
                <div className="mx-auto w-full px-4 py-4 sm:px-6 sm:py-5 lg:px-8 xl:px-12 2xl:px-16">
                    {/* Title on the left, tabs on the right */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                            <button
                                type="button"
                                aria-label="Back"
                                title="Back"
                                onClick={handleBack}
                                className="app-liquid-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition hover:text-primary dark:text-gray-200"
                            >
                                <HiArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="min-w-0">
                                <h1 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl dark:text-white">
                                    Select your AI persona
                                </h1>
                                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                                    {sessionData?.continueFromSessionId && sessionData?.mode ? (
                                        <>
                                            Continuing your{' '}
                                            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary dark:bg-primary/15">
                                                {sessionData.mode}
                                            </span>{' '}
                                            session. Tap a persona to start.
                                        </>
                                    ) : activeTab === 'journeys' ? (
                                        'Pick up the next mode with a buyer you have already practised with.'
                                    ) : (
                                        'Pick a buyer to practise with, then choose the conversation mode.'
                                    )}
                                </p>
                            </div>
                        </div>

                        <div
                            role="tablist"
                            aria-label="Personas"
                            className="inline-flex max-w-full shrink-0 gap-1 self-start rounded-full border border-gray-200 p-1 lg:self-auto dark:border-white/10"
                        >
                            {(
                                [
                                    { key: 'all', label: 'All personas', count: aiPersonas.length },
                                    { key: 'journeys', label: 'My journeys', count: journeyRows.length },
                                ] as const
                            ).map((tab) => {
                                const active = activeTab === tab.key
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all sm:px-5 ${
                                            active
                                                ? 'bg-primary text-white shadow-[0_6px_20px_rgba(12,175,96,0.35)]'
                                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                                        }`}
                                    >
                                        {tab.label}
                                        <span
                                            className={`rounded-full px-1.5 text-xs font-bold ${
                                                active
                                                    ? 'bg-white/25 text-white'
                                                    : 'bg-gray-900/[0.06] text-gray-600 dark:bg-white/10 dark:text-gray-300'
                                            }`}
                                        >
                                            {tab.count}
                                        </span>
                                        {tab.key === 'journeys' && !active && inProgressCount > 0 && (
                                            <span
                                                aria-label={`${inProgressCount} in progress`}
                                                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-[#050505]"
                                            />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Search and filters on the left, what is showing on the right */}
                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <div className="relative min-w-0 flex-1 md:max-w-md">
                                <HiOutlineSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    aria-label="Search personas"
                                    className="block h-10 w-full rounded-xl border border-gray-200 bg-transparent pl-10 pr-9 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/15 dark:border-white/10 dark:text-gray-100 dark:placeholder-gray-500"
                                    placeholder={
                                        activeTab === 'journeys'
                                            ? 'Search your journeys...'
                                            : 'Search by name, role, company...'
                                    }
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        aria-label="Clear search"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            {activeTab === 'all' && (
                                <Select
                                    size="sm"
                                    placeholder="Role"
                                    options={roleOptions}
                                    value={roleOptions.find((opt) => opt.value === selectedRole)}
                                    onChange={(option) => setSelectedRole(option?.value as string || '')}
                                    className="w-36 shrink-0 sm:w-44"
                                    menuPlacement="auto"
                                    styles={{ menu: (base) => ({ ...base, minWidth: '200px' }), option: (base) => ({ ...base, whiteSpace: 'normal', wordBreak: 'break-word' }) }}
                                />
                            )}
                            {activeTab === 'all' && selectedRole && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="shrink-0 text-sm font-semibold text-gray-500 hover:text-rose-500 dark:text-gray-400"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {activeTab === 'journeys' ? (
                                    <>
                                        <span className="font-bold text-gray-900 dark:text-white">{inProgressCount}</span> in progress ·{' '}
                                        <span className="font-bold text-gray-900 dark:text-white">{journeyRows.length - inProgressCount}</span> completed
                                    </>
                                ) : (
                                    <>
                                        Showing <span className="font-bold text-gray-900 dark:text-white">{filteredPersonas.length}</span> of {aiPersonas.length}
                                    </>
                                )}
                            </p>
                            {activeTab === 'all' && userIndustry && isProfileIndustryFilter && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Matched to your profile
                                </span>
                            )}
                            {activeTab === 'all' && customerSegmentNames.map((name) => (
                                <span
                                    key={name}
                                    className="inline-flex items-center rounded-full border border-indigo-300/50 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:border-indigo-400/25 dark:text-indigo-300"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Personas Grid */}
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-10">
                {noDivisionAssigned ? (
                    <div className="app-liquid-dark flex flex-col items-center justify-center py-32 rounded-3xl border">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Division assignment required
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md text-center text-lg">
                            You need to be assigned to a sales division and team before starting a session. Please contact your manager or company owner.
                        </p>
                    </div>
                ) : divisionSetupIncomplete ? (
                    <div className="app-liquid-dark flex flex-col items-center justify-center py-32 rounded-3xl border">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Division setup incomplete
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md text-center text-lg">
                            Your division is missing a customer segment. Contact your manager.
                        </p>
                    </div>
                ) : activeTab === 'journeys' ? (
                    journeysLoading || isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Spinner size={48} className="text-primary mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading your journeys...</p>
                        </div>
                    ) : visibleJourneyRows.length === 0 ? (
                        <div className="app-liquid-dark mx-auto flex max-w-2xl flex-col items-center rounded-3xl border px-6 py-16 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {journeyRows.length ? 'No journeys match your search' : 'No journeys yet'}
                            </h3>
                            <p className="mt-3 max-w-md text-gray-500 dark:text-gray-400">
                                {journeyRows.length
                                    ? 'Try a different name or role.'
                                    : 'Finish a prospecting session with any persona and it will appear here, ready for discovering and then closing with the same buyer.'}
                            </p>
                            {!journeyRows.length && (
                                <Button variant="solid" className="mt-8" onClick={() => setActiveTab('all')}>
                                    Choose a persona
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {visibleJourneyRows.map(({ journey, persona }) => (
                                <motion.div
                                    key={journey.journeyId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full"
                                >
                                    <JourneyCard
                                        persona={persona}
                                        roleLabel={formatLabel(persona.role)}
                                        journey={journey}
                                        busy={creatingPersonaId === persona.id}
                                        disabled={Boolean(creatingPersonaId)}
                                        onContinue={() => handleContinueJourney(persona, journey)}
                                        onDiscard={() => setDiscardTarget({ persona, journey })}
                                        onOpenReport={(id) => navigate(`/sessions/${id}/report`)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Spinner size={48} className="text-primary mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading personas...</p>
                    </div>
                ) : filteredPersonas.length === 0 ? (
                    <div className="app-liquid-dark flex flex-col items-center justify-center py-32 rounded-3xl border">
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
                            const openJourneys = openJourneysByPersonaId.get(persona.id) ?? []
                            return (
                                <motion.div
                                    key={persona.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full"
                                >
                                    <PersonaCard
                                        persona={persona}
                                        roleLabel={formatLabel(persona.role)}
                                        industryLabel={formatLabel(persona.industry)}
                                        journey={openJourneys[0]}
                                        inProgressCount={openJourneys.length}
                                        hasCompleted={completedPersonaIds.has(persona.id)}
                                        busy={creatingPersonaId === persona.id}
                                        disabled={Boolean(creatingPersonaId)}
                                        choosingMode={pendingPersona?.id === persona.id}
                                        onSelect={() => handlePersonaSelect(persona)}
                                    />
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            <JourneyResumeDialog
                isOpen={Boolean(resumePersona) && resumeJourneys.length > 0 && !discardTarget}
                persona={resumePersona}
                journeys={resumeJourneys}
                onClose={() => setResumePersona(null)}
                onContinue={(journey) => {
                    if (!resumePersona) return
                    const persona = resumePersona
                    setResumePersona(null)
                    handleContinueJourney(persona, journey)
                }}
                onDiscard={(journey) => {
                    if (resumePersona) setDiscardTarget({ persona: resumePersona, journey })
                }}
                onStartNew={() => {
                    if (!resumePersona) return
                    setPendingPersona(resumePersona)
                    setResumePersona(null)
                    setModeDialogOpen(true)
                }}
            />

            <ConfirmDialog
                isOpen={Boolean(discardTarget)}
                type="warning"
                title="Discard this journey?"
                confirmText="Discard"
                cancelText="Keep it"
                onClose={() => setDiscardTarget(null)}
                onRequestClose={() => setDiscardTarget(null)}
                onCancel={() => setDiscardTarget(null)}
                onConfirm={handleConfirmDiscard}
            >
                <p>
                    It will be removed from My journeys and you won&apos;t be asked to continue it
                    with {discardTarget?.persona.name}. The sessions you completed, their scores and
                    reports stay in your performance history.
                </p>
            </ConfirmDialog>

            <ModeSelectDialog
                isOpen={modeDialogOpen}
                persona={pendingPersona}
                recommendedModeName="Prospecting"
                onClose={() => {
                    if (creatingPersonaId) return
                    setModeDialogOpen(false)
                    setPendingPersona(null)
                }}
                onSelectMode={handleModeSelected}
            />
        </div>
    )
}

export default PersonaSelection
