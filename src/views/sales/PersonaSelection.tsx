import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Input, Button, Select, Avatar, Card } from '@/components/ui'
import {
    HiOutlineSearch,
    HiOutlineOfficeBuilding,
    HiOutlineBriefcase,
    HiOutlineCheckCircle,
    HiArrowLeft,
} from 'react-icons/hi'
import type { AIPersona } from '@/components/shared/SessionSetupPanel'

// Mock AI Personas - Replace with API data
const aiPersonas: AIPersona[] = [
    {
        id: 'tony-romano',
        name: 'Tony Romano',
        role: 'Operations Manager',
        company: 'TechCorp Industries',
        industry: 'Manufacturing',
        personality: 'Analytical, detail-oriented, budget-conscious',
        difficulty: 'Medium',
        avatar: '/img/avatars/thumb-1.jpg',
    },
    {
        id: 'sarah-chen',
        name: 'Sarah Chen',
        role: 'VP of Sales',
        company: 'Global Enterprises',
        industry: 'Technology',
        personality: 'Direct, results-driven, competitive',
        difficulty: 'Hard',
        avatar: '/img/avatars/thumb-2.jpg',
    },
    {
        id: 'michael-foster',
        name: 'Michael Foster',
        role: 'Plant Manager',
        company: 'Midwest Manufacturing',
        industry: 'Industrial',
        personality: 'Practical, skeptical, values proven solutions',
        difficulty: 'Medium',
        avatar: '/img/avatars/thumb-3.jpg',
    },
    {
        id: 'jessica-park',
        name: 'Jessica Park',
        role: 'Chief Procurement Officer',
        company: 'Fortune Solutions',
        industry: 'Finance',
        personality: 'Strategic, relationship-focused, long-term thinker',
        difficulty: 'Hard',
        avatar: '/img/avatars/thumb-4.jpg',
    },
    {
        id: 'david-miller',
        name: 'David Miller',
        role: 'IT Director',
        company: 'NextGen Systems',
        industry: 'Software',
        personality: 'Technical, curious, open to innovation',
        difficulty: 'Easy',
        avatar: '/img/avatars/thumb-5.jpg',
    },
    {
        id: 'emily-rodriguez',
        name: 'Emily Rodriguez',
        role: 'Business Owner',
        company: 'Rodriguez & Co',
        industry: 'Retail',
        personality: 'Cautious, value-driven, hands-on',
        difficulty: 'Medium',
        avatar: '/img/avatars/thumb-6.jpg',
    },
    {
        id: 'robert-johnson',
        name: 'Robert Johnson',
        role: 'CTO',
        company: 'Tech Innovations',
        industry: 'Technology',
        personality: 'Visionary, fast-paced, innovation-focused',
        difficulty: 'Hard',
        avatar: '/img/avatars/thumb-7.jpg',
    },
    {
        id: 'lisa-martinez',
        name: 'Lisa Martinez',
        role: 'Purchasing Director',
        company: 'Global Manufacturing',
        industry: 'Manufacturing',
        personality: 'Methodical, risk-averse, compliance-focused',
        difficulty: 'Medium',
        avatar: '/img/avatars/thumb-8.jpg',
    },
    {
        id: 'james-wilson',
        name: 'James Wilson',
        role: 'Operations VP',
        company: 'Wilson Industries',
        industry: 'Industrial',
        personality: 'No-nonsense, efficiency-driven, results-oriented',
        difficulty: 'Hard',
        avatar: '/img/avatars/thumb-9.jpg',
    },
    {
        id: 'amanda-lee',
        name: 'Amanda Lee',
        role: 'Marketing Director',
        company: 'Creative Solutions',
        industry: 'Marketing',
        personality: 'Creative, collaborative, brand-conscious',
        difficulty: 'Easy',
        avatar: '/img/avatars/thumb-10.jpg',
    },
    {
        id: 'kevin-brown',
        name: 'Kevin Brown',
        role: 'CFO',
        company: 'Financial Corp',
        industry: 'Finance',
        personality: 'Numbers-driven, conservative, ROI-focused',
        difficulty: 'Hard',
        avatar: '/img/avatars/thumb-11.jpg',
    },
    {
        id: 'maria-garcia',
        name: 'Maria Garcia',
        role: 'Store Manager',
        company: 'Retail Plus',
        industry: 'Retail',
        personality: 'Customer-focused, practical, cost-conscious',
        difficulty: 'Easy',
        avatar: '/img/avatars/thumb-12.jpg',
    },
]

const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'Operations Manager', label: 'Operations Manager' },
    { value: 'VP of Sales', label: 'VP of Sales' },
    { value: 'Plant Manager', label: 'Plant Manager' },
    { value: 'Chief Procurement Officer', label: 'Chief Procurement Officer' },
    { value: 'IT Director', label: 'IT Director' },
    { value: 'Business Owner', label: 'Business Owner' },
    { value: 'CTO', label: 'CTO' },
    { value: 'Purchasing Director', label: 'Purchasing Director' },
    { value: 'Operations VP', label: 'Operations VP' },
    { value: 'Marketing Director', label: 'Marketing Director' },
    { value: 'CFO', label: 'CFO' },
    { value: 'Store Manager', label: 'Store Manager' },
]

const industryOptions = [
    { value: '', label: 'All Industries' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Industrial', label: 'Industrial' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Software', label: 'Software' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Marketing', label: 'Marketing' },
]

const difficultyOptions = [
    { value: '', label: 'All Levels' },
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' },
]

const PersonaSelection = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const sessionData = location.state as {
        mode: string
        scenarios?: string[]
        files?: File[]
    }

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedIndustry, setSelectedIndustry] = useState('')
    const [selectedDifficulty, setSelectedDifficulty] = useState('')
    const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(
        null
    )
    const [hoveredPersona, setHoveredPersona] = useState<string | null>(null)

    // Filter and search personas
    const filteredPersonas = useMemo(() => {
        return aiPersonas.filter((persona) => {
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
    }, [searchQuery, selectedRole, selectedIndustry, selectedDifficulty])

    const handleStartSession = () => {
        if (selectedPersona) {
            console.log('Starting session:', {
                ...sessionData,
                persona: selectedPersona,
            })
            // Navigate to audio visualizer with all session data
            navigate('/audio-visualizer', {
                state: {
                    ...sessionData,
                    persona: selectedPersona,
                },
            })
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
                                options={industryOptions}
                                value={industryOptions.find(
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
                            {aiPersonas.length} personas
                        </p>
                        {selectedPersona && (
                            <Button
                                variant="solid"
                                size="lg"
                                onClick={handleStartSession}
                                className="bg-primary hover:bg-primary-deep text-white"
                            >
                                Start Session with {selectedPersona.name}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Personas Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {filteredPersonas.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                            <HiOutlineSearch className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No personas found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Try adjusting your filters or search query
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
                        className="bg-primary hover:bg-primary-deep text-white shadow-2xl"
                    >
                        Start Session with {selectedPersona.name}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default PersonaSelection
