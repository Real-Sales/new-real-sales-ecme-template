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
import { useAppSelector } from '@/store'
import type { AIPersona } from '@/components/shared/SessionSetupPanel'
import { apiCreateSession } from '@/services/SessionService'
import type { AiPersonaListItem, InteractionModeListItem } from '@/views/sales/ScenarioList/types'
import scenarioLibraryReducer, {
    useAppSelector as useScenarioSelector,
    useAppDispatch,
    fetchPersonas,
    fetchModes,
} from '@/views/sales/ScenarioList/store'

injectReducer('scenarioLibrary', scenarioLibraryReducer)

// Map user's profile industry to persona industries (strict matching)
const industryToPersonaIndustries: Record<string, string[]> = {
    technology: ['Technology', 'Software'],
    healthcare: ['Technology', 'Software'],
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

// Map product types to persona industries (for category filtering)
const productToPersonaIndustries: Record<string, string[]> = {
    saas: ['Technology', 'Software'],
    cloud: ['Technology', 'Software'],
    ai_ml: ['Technology', 'Software'],
    cybersecurity: ['Technology', 'Software'],
    devtools: ['Technology', 'Software'],
    data_analytics: ['Technology', 'Software', 'Finance'],
    ehr: ['Technology', 'Software'],
    telehealth: ['Technology', 'Software'],
    medical_devices: ['Manufacturing', 'Technology'],
    pharma: ['Manufacturing', 'Finance'],
    health_analytics: ['Technology', 'Software'],
    fintech: ['Finance', 'Technology'],
    payments: ['Finance', 'Technology'],
    lending: ['Finance'],
    wealth_mgmt: ['Finance'],
    regtech: ['Finance', 'Technology'],
    ecommerce: ['Retail', 'Technology'],
    pos: ['Retail', 'Technology'],
    inventory: ['Manufacturing', 'Retail'],
    crm: ['Technology', 'Software'],
    crm_general: ['Technology', 'Software'],
    loyalty: ['Retail', 'Marketing'],
    erp: ['Manufacturing', 'Technology'],
    supply_chain: ['Manufacturing', 'Industrial'],
    quality: ['Manufacturing', 'Industrial'],
    iot: ['Technology', 'Industrial'],
    proptech: ['Technology', 'Finance'],
    property_mgmt: ['Technology', 'Finance'],
    crm_re: ['Technology', 'Software'],
    listings: ['Technology', 'Retail'],
    lms: ['Technology', 'Software'],
    edtech: ['Technology', 'Software'],
    assessment: ['Technology', 'Software'],
    tutoring: ['Technology', 'Marketing'],
    marketing: ['Marketing'],
    project_mgmt: ['Technology', 'Manufacturing'],
    communication: ['Technology'],
    hr_tools: ['Technology', 'Marketing'],
    accounting: ['Finance', 'Technology'],
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

const difficultyOptions = [
    { value: '', label: 'All Levels' },
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' },
]

const PersonaSelection = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()
    const authUser = useAppSelector((state) => state.auth.user)
    const settingsProfile = useAppSelector((state) => state.settings.profile)

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

    const userIndustry = settingsProfile?.industry || authUser?.industry || ''
    const userProducts: string[] = (settingsProfile?.products?.map((p) => p.value) ?? authUser?.industryProducts ?? []).filter(Boolean)

    const sessionData = location.state as {
        mode: string
        scenarios?: string[]
        files?: File[]
    }

    const [creatingPersonaId, setCreatingPersonaId] = useState<string | null>(
        null,
    )
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedIndustry, setSelectedIndustry] = useState('')
    const [selectedDifficulty, setSelectedDifficulty] = useState('')

    /** After a failed fetch, loading is false and data stays empty — avoid re-dispatching forever. */
    const personasFetchDispatchedRef = useRef(false)
    const modesFetchDispatchedRef = useRef(false)

    useEffect(() => {
        if (
            !storePersonas?.length &&
            !personasLoading &&
            !personasFetchDispatchedRef.current
        ) {
            personasFetchDispatchedRef.current = true
            dispatch(fetchPersonas())
        }
        if (!storeModes?.length && !modesLoading && !modesFetchDispatchedRef.current) {
            modesFetchDispatchedRef.current = true
            dispatch(fetchModes())
        }
    }, [dispatch, storePersonas?.length, personasLoading, storeModes?.length, modesLoading])

    const aiPersonas = useMemo(() => {
        if (!storePersonas?.length) return []
        return storePersonas.filter((p) => p.status_active).map(mapPersona)
    }, [storePersonas])

    const interactionModes = useMemo(() => {
        if (!storeModes?.length) return []
        return storeModes.filter((m) => m.status_active)
    }, [storeModes])

    const isLoading = (personasLoading ?? false) || (modesLoading ?? false)

    const roleOptions = useMemo(() => {
        const roles = [...new Set(aiPersonas.map((p) => p.role))].sort()
        return [{ value: '', label: 'All Roles' }, ...roles.map((r) => ({ value: r, label: r }))]
    }, [aiPersonas])

    const allIndustryOptions = useMemo(() => {
        const industries = [...new Set(aiPersonas.map((p) => p.industry))].sort()
        return [{ value: '', label: 'All Industries' }, ...industries.map((i) => ({ value: i, label: i }))]
    }, [aiPersonas])

    const relatedPersonas = useMemo(() => {
        if (!userIndustry && userProducts.length === 0) {
            return aiPersonas
        }
        const allowedIndustries = new Set<string>()
        if (userIndustry && industryToPersonaIndustries[userIndustry]) {
            industryToPersonaIndustries[userIndustry].forEach((i) =>
                allowedIndustries.add(i)
            )
        }
        userProducts.forEach((product) => {
            const industries = productToPersonaIndustries[product]
            if (industries) {
                industries.forEach((i) => allowedIndustries.add(i))
            }
        })
        if (allowedIndustries.size === 0) return aiPersonas
        const filtered = aiPersonas.filter((persona) =>
            allowedIndustries.has(persona.industry)
        )
        return filtered.length > 0 ? filtered : aiPersonas
    }, [userIndustry, userProducts, aiPersonas])

    // Filter and search personas (within related personas only)
    const filteredPersonas = useMemo(() => {
        return relatedPersonas.filter((persona) => {
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
            const matchesIndustry =
                selectedIndustry === '' || persona.industry === selectedIndustry
            const matchesDifficulty =
                selectedDifficulty === '' ||
                persona.difficulty === selectedDifficulty

            return (
                matchesSearch &&
                matchesRole &&
                matchesIndustry &&
                matchesDifficulty
            )
        })
    }, [relatedPersonas, searchQuery, selectedRole, selectedIndustry, selectedDifficulty])

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
            const session = await apiCreateSession({
                persona_id: persona.id,
                mode_id: matchedMode.mode_id,
                scenario_id: sessionData?.scenarios?.[0],
            })
            navigate(`/audio-visualizer/${session.session_id}`, {
                state: {
                    ...sessionData,
                    persona,
                },
            })
        } catch (err: unknown) {
            console.error('Failed to create session:', err)
            const detail =
                err &&
                typeof err === 'object' &&
                'response' in err &&
                err.response &&
                typeof err.response === 'object' &&
                'data' in err.response &&
                err.response.data &&
                typeof err.response.data === 'object' &&
                'detail' in err.response.data
                    ? String(
                          (err.response.data as { detail?: string }).detail,
                      )
                    : null
            toast.push(
                <Notification title="Error" type="danger">
                    {detail || 'Failed to create session. Please try again.'}
                </Notification>,
            )
        } finally {
            setCreatingPersonaId(null)
        }
    }

    const handleBack = () => {
        navigate(-1)
    }

    const handleClearFilters = () => {
        setSearchQuery('')
        setSelectedRole('')
        setSelectedIndustry('')
        setSelectedDifficulty('')
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
                                <span className="font-semibold text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
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
                                />
                                <Select
                                    size="sm"
                                    placeholder="Industry"
                                    options={allIndustryOptions}
                                    value={allIndustryOptions.find((opt) => opt.value === selectedIndustry)}
                                    onChange={(option) => setSelectedIndustry(option?.value as string || '')}
                                    className="w-[calc(50%-0.25rem)] sm:w-40"
                                />
                                <Select
                                    size="sm"
                                    placeholder="Difficulty"
                                    options={difficultyOptions}
                                    value={difficultyOptions.find((opt) => opt.value === selectedDifficulty)}
                                    onChange={(option) => setSelectedDifficulty(option?.value as string || '')}
                                    className="w-[calc(50%-0.25rem)] sm:w-32"
                                />
                                {(searchQuery || selectedRole || selectedIndustry || selectedDifficulty) && (
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
                                {filteredPersonas.length} of {relatedPersonas.length} personas
                            </p>
                            {(userIndustry || userProducts.length > 0) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/30 text-[10px] sm:text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                    Filtered by profile
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Personas Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {isLoading ? (
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
                            {relatedPersonas.length === 0
                                ? "No personas match your industry and product category. Try updating your company profile in Settings."
                                : "We couldn't find any personas matching your current filters. Try adjusting your search."}
                        </p>
                        {(searchQuery || selectedRole || selectedIndustry || selectedDifficulty) && (
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
                                            group relative h-full flex flex-col bg-white dark:bg-gray-800 rounded-3xl transition-all duration-300 overflow-hidden border-2
                                            ${
                                                creatingPersonaId
                                                    ? 'cursor-wait opacity-90'
                                                    : 'cursor-pointer'
                                            }
                                            ${
                                                isBusy
                                                    ? 'border-primary shadow-xl shadow-primary/10'
                                                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 shadow-md hover:shadow-xl hover:translate-y-[-4px]'
                                            }
                                        `}
                                    >
                                        {/* Decorative Header Background */}
                                        <div className="h-24 w-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-800 absolute top-0 left-0 transition-opacity duration-300 group-hover:opacity-80" />

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
                                                    mb-5 mx-auto ring-4 shadow-lg transition-all duration-300 bg-white dark:bg-gray-800
                                                    ring-white dark:ring-gray-800 group-hover:ring-primary/10
                                                `}
                                            />
                                            
                                            <div className="text-center mb-6">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                                                    {persona.name}
                                                </h3>
                                                <p className="text-sm font-semibold text-primary dark:text-blue-400">
                                                    {persona.role}
                                                </p>
                                            </div>

                                            <div className="w-full bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4 mb-6 border border-gray-100 dark:border-gray-700/50 flex-grow">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
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
                                                    <div className="mt-0.5 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                                        <HiOutlineBriefcase className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col text-left overflow-hidden">
                                                        <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-0.5">Industry</span>
                                                        <span className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate" title={persona.industry}>
                                                            {persona.industry}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {persona.personality && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 italic text-center px-2">
                                                    "{persona.personality}"
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
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
