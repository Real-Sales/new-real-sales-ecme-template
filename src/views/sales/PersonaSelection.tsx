import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { injectReducer } from '@/store'
import { Input, Button, Select, Avatar, Card, Spinner } from '@/components/ui'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    HiOutlineSearch,
    HiOutlineOfficeBuilding,
    HiOutlineBriefcase,
    HiOutlineCheckCircle,
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

    const [isCreatingSession, setIsCreatingSession] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedIndustry, setSelectedIndustry] = useState('')
    const [selectedDifficulty, setSelectedDifficulty] = useState('')
    const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null)
    const [hoveredPersona, setHoveredPersona] = useState<string | null>(null)

    useEffect(() => {
        if (!storePersonas?.length && !personasLoading) {
            dispatch(fetchPersonas())
        }
        if (!storeModes?.length && !modesLoading) {
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

    const handleStartSession = async () => {
        if (!selectedPersona || isCreatingSession) return

        const matchedMode = interactionModes.find(
            (m) => m.name.toLowerCase() === sessionData?.mode,
        )
        if (!matchedMode) {
            toast.push(
                <Notification title="Error" type="danger">
                    Interaction mode not found. Please go back and try again.
                </Notification>,
            )
            return
        }

        setIsCreatingSession(true)
        try {
            const session = await apiCreateSession({
                persona_id: selectedPersona.id,
                mode_id: matchedMode.mode_id,
                scenario_id: sessionData?.scenarios?.[0],
            })
            navigate(`/audio-visualizer/${session.session_id}`, {
                state: {
                    ...sessionData,
                    persona: selectedPersona,
                },
            })
        } catch (err: any) {
            console.error('Failed to create session:', err)
            toast.push(
                <Notification title="Error" type="danger">
                    {err?.response?.data?.detail || 'Failed to create session. Please try again.'}
                </Notification>,
            )
        } finally {
            setIsCreatingSession(false)
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
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'Medium':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'Hard':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            default:
                return ''
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Select Your AI Persona
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Choose who you'd like to practice with for your{' '}
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {sessionData?.mode}
                                </span>{' '}
                                session
                            </p>
                        </div>
                        <Button
                            variant="plain"
                            size="lg"
                            onClick={handleBack}
                            icon={<HiArrowLeft className="w-5 h-5" />}
                            className="text-gray-600 dark:text-gray-400"
                        >
                            Back
                        </Button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                size="lg"
                                placeholder="Search by name, role, company, or industry..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                prefix={
                                    <HiOutlineSearch className="text-gray-400" />
                                }
                            />
                        </div>
                        <div className="flex gap-3">
                            <Select
                                size="lg"
                                placeholder="Role"
                                options={roleOptions}
                                value={roleOptions.find(
                                    (opt) => opt.value === selectedRole
                                )}
                                onChange={(option) =>
                                    setSelectedRole(
                                        option?.value as string || ''
                                    )
                                }
                                className="w-48"
                            />
                            <Select
                                size="lg"
                                placeholder="Industry"
                                options={allIndustryOptions}
                                value={allIndustryOptions.find(
                                    (opt) => opt.value === selectedIndustry
                                )}
                                onChange={(option) =>
                                    setSelectedIndustry(
                                        option?.value as string || ''
                                    )
                                }
                                className="w-48"
                            />
                            <Select
                                size="lg"
                                placeholder="Difficulty"
                                options={difficultyOptions}
                                value={difficultyOptions.find(
                                    (opt) => opt.value === selectedDifficulty
                                )}
                                onChange={(option) =>
                                    setSelectedDifficulty(
                                        option?.value as string || ''
                                    )
                                }
                                className="w-40"
                            />
                            {(searchQuery ||
                                selectedRole ||
                                selectedIndustry ||
                                selectedDifficulty) && (
                                <Button
                                    variant="plain"
                                    size="lg"
                                    onClick={handleClearFilters}
                                    className="text-gray-600 dark:text-gray-400"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {filteredPersonas.length} of{' '}
                            {relatedPersonas.length} related personas
                            {(userIndustry || userProducts.length > 0) && (
                                <span className="block text-xs mt-0.5 text-gray-500 dark:text-gray-500">
                                    (filtered by your industry & products)
                                </span>
                            )}
                        </p>
                        {selectedPersona && (
                            <Button
                                variant="solid"
                                size="lg"
                                onClick={handleStartSession}
                                loading={isCreatingSession}
                                className="bg-primary hover:bg-primary-deep text-white"
                            >
                                {isCreatingSession ? 'Creating Session...' : `Start Session with ${selectedPersona.name}`}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Personas Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Spinner size={40} />
                    </div>
                ) : filteredPersonas.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                            <HiOutlineSearch className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No personas found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {relatedPersonas.length === 0
                                ? "No personas match your industry and product category. Try updating your company profile in Settings."
                                : 'Try adjusting your filters or search query'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPersonas.map((persona) => {
                            const isSelected =
                                selectedPersona?.id === persona.id
                            const isHovered = hoveredPersona === persona.id

                            return (
                                <motion.div
                                    key={persona.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card
                                        clickable
                                        onClick={() =>
                                            setSelectedPersona(persona)
                                        }
                                        onMouseEnter={() =>
                                            setHoveredPersona(persona.id)
                                        }
                                        onMouseLeave={() =>
                                            setHoveredPersona(null)
                                        }
                                        className={`
                                            relative h-full transition-all duration-300 cursor-pointer
                                            ${
                                                isSelected
                                                    ? 'ring-2 ring-blue-500 shadow-xl bg-blue-50 dark:bg-blue-500/10'
                                                    : 'hover:shadow-lg'
                                            }
                                        `}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg z-10"
                                            >
                                                <HiOutlineCheckCircle className="w-6 h-6 text-white" />
                                            </motion.div>
                                        )}

                                        <div className="flex flex-col items-center text-center p-6">
                                            <Avatar
                                                size={80}
                                                src={persona.avatar}
                                                shape="circle"
                                                className="mb-4 ring-4 ring-white dark:ring-gray-700"
                                            />
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                                {persona.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                {persona.role}
                                            </p>

                                            <div className="w-full space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <HiOutlineOfficeBuilding className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {persona.company}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <HiOutlineBriefcase className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {persona.industry}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                                {persona.personality}
                                            </p>

                                            <span
                                                className={`text-xs px-3 py-1 rounded-full font-medium ${getDifficultyColor(
                                                    persona.difficulty
                                                )}`}
                                            >
                                                {persona.difficulty}
                                            </span>

                                            {(isSelected || isHovered) && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400"
                                                >
                                                    {isSelected
                                                        ? '✓ Selected'
                                                        : 'Click to select'}
                                                </motion.div>
                                            )}
                                        </div>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Floating Action Button for Mobile */}
            {selectedPersona && (
                <div className="lg:hidden fixed bottom-6 left-6 right-6 z-20">
                    <Button
                        block
                        variant="solid"
                        size="lg"
                        onClick={handleStartSession}
                        loading={isCreatingSession}
                        className="bg-primary hover:bg-primary-deep text-white shadow-2xl"
                    >
                        {isCreatingSession ? 'Creating Session...' : `Start Session with ${selectedPersona.name}`}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default PersonaSelection
