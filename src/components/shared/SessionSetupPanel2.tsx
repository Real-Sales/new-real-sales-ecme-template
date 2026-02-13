import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, Button, Input, Upload } from '@/components/ui'
import Select from '@/components/ui/Select'
import {
    HiArrowRight,
    HiArrowLeft,
    HiX,
    HiUser,
    HiPhone,
    HiMail,
    HiAcademicCap,
    HiBriefcase,
    HiPhotograph,
} from 'react-icons/hi'
import type { ReactNode } from 'react'

export type ConversationMode = 'prospecting' | 'discovering' | 'closing'

export interface AIPersona {
    id: string
    name: string
    role: string
    company: string
    industry: string
    personality: string
    avatar?: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
}

interface SessionSetupPanelProps {
    isOpen: boolean
    onClose: () => void
    onNavigateToPersonas: (
        mode: ConversationMode,
        scenarios?: string[],
        files?: File[],
    ) => void
}

// Step definitions
interface StepDef {
    id: number
    label: string
    icon: ReactNode
}

const steps: StepDef[] = [
    {
        id: 1,
        label: 'Personal Information',
        icon: <HiUser className="w-5 h-5" />,
    },
    {
        id: 2,
        label: 'Education',
        icon: <HiAcademicCap className="w-5 h-5" />,
    },
    {
        id: 3,
        label: 'Work Experiences',
        icon: <HiBriefcase className="w-5 h-5" />,
    },
    {
        id: 4,
        label: 'User Photo',
        icon: <HiPhotograph className="w-5 h-5" />,
    },
]

// Generate options for date dropdowns
const dayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1).padStart(2, '0'),
}))
const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1).padStart(2, '0'),
}))
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 80 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
}))
const gradYearOptions = Array.from({ length: 50 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
}))

const degreeOptions = [
    { value: 'highschool', label: 'High School' },
    { value: 'associate', label: "Associate's Degree" },
    { value: 'bachelor', label: "Bachelor's Degree" },
    { value: 'master', label: "Master's Degree" },
    { value: 'doctorate', label: 'Doctorate' },
    { value: 'other', label: 'Other' },
]

const experienceOptions = [
    { value: '0-1', label: '0-1 Years' },
    { value: '1-3', label: '1-3 Years' },
    { value: '3-5', label: '3-5 Years' },
    { value: '5-10', label: '5-10 Years' },
    { value: '10+', label: '10+ Years' },
]

const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'other', label: 'Other' },
]

const SessionSetupPanel = ({
    isOpen,
    onClose,
    onNavigateToPersonas,
}: SessionSetupPanelProps) => {
    const [currentStep, setCurrentStep] = useState(1)

    // Step 1: Personal Info
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [dobDay, setDobDay] = useState<string | null>(null)
    const [dobMonth, setDobMonth] = useState<string | null>(null)
    const [dobYear, setDobYear] = useState<string | null>(null)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [telephoneNumber, setTelephoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [confirmEmail, setConfirmEmail] = useState('')

    // Step 2: Education
    const [degree, setDegree] = useState<string | null>(null)
    const [institution, setInstitution] = useState('')
    const [fieldOfStudy, setFieldOfStudy] = useState('')
    const [graduationYear, setGraduationYear] = useState<string | null>(null)

    // Step 3: Work
    const [currentCompany, setCurrentCompany] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [experience, setExperience] = useState<string | null>(null)
    const [industry, setIndustry] = useState<string | null>(null)
    const [salesExperience, setSalesExperience] = useState<string | null>(null)

    // Step 4: Photo
    const [uploadedPhoto, setUploadedPhoto] = useState<File[]>([])

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)
        }
    }

    const handleSubmit = () => {
        // On completion, navigate to personas with default mode
        onNavigateToPersonas('prospecting', [], uploadedPhoto)
        handleClose()
    }

    const handleClose = () => {
        setTimeout(() => {
            setCurrentStep(1)
            setFirstName('')
            setLastName('')
            setDobDay(null)
            setDobMonth(null)
            setDobYear(null)
            setPhoneNumber('')
            setTelephoneNumber('')
            setEmail('')
            setConfirmEmail('')
            setDegree(null)
            setInstitution('')
            setFieldOfStudy('')
            setGraduationYear(null)
            setCurrentCompany('')
            setJobTitle('')
            setExperience(null)
            setIndustry(null)
            setSalesExperience(null)
            setUploadedPhoto([])
        }, 300)
        onClose()
    }

    const handlePhotoChange = (files: File[]) => {
        setUploadedPhoto(files)
    }

    const stepDescriptions: Record<number, { title: string; subtitle: string }> =
        {
            1: {
                title: 'Personal Information',
                subtitle:
                    'Enter your Personal Information to get closer to Contractors',
            },
            2: {
                title: 'Education',
                subtitle: 'Tell us about your educational background',
            },
            3: {
                title: 'Work Experiences',
                subtitle:
                    'Share your professional experience and industry expertise',
            },
            4: {
                title: 'User Photo',
                subtitle: 'Upload a profile photo to personalize your account',
            },
        }

    // Custom select styles for dark background
    const selectStyles = {
        control: (provided: Record<string, unknown>) => ({
            ...provided,
            backgroundColor: 'white',
            borderColor: '#e2e8f0',
            minHeight: '44px',
        }),
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            width={960}
            closable={false}
            contentClassName="p-0"
            className="overflow-hidden"
        >
            <div className="flex flex-col lg:flex-row min-h-[600px] max-h-[90vh] bg-[#0a1628]">
                {/* ---- Left Sidebar ---- */}
                <div className="lg:w-[360px] w-full flex-shrink-0 flex flex-col lg:flex-row">
                    {/* Steps content */}
                    <div className="flex-1 p-6 lg:p-8">
                        {/* Step title */}
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-white">
                                Step {currentStep}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                                {stepDescriptions[currentStep].subtitle}
                            </p>
                        </div>

                        {/* Step indicators - horizontal on mobile, vertical on desktop */}
                        <div className="flex lg:flex-col flex-row lg:gap-0 gap-4 justify-between lg:justify-start">
                            {steps.map((step, index) => {
                                const isActive = currentStep === step.id
                                const isCompleted = currentStep > step.id
                                const isLast = index === steps.length - 1

                                return (
                                    <div key={step.id}>
                                        {/* Step row: label + icon */}
                                        <div className="flex lg:flex-row flex-col items-center gap-3 lg:gap-4">
                                            {/* Label (hidden on mobile, shown on desktop - left of icon) */}
                                            <span
                                                className={`hidden lg:block text-sm font-medium text-right min-w-[140px] transition-colors duration-300 ${
                                                    isActive
                                                        ? 'text-white'
                                                        : isCompleted
                                                          ? 'text-emerald-400'
                                                          : 'text-gray-500'
                                                }`}
                                            >
                                                {step.label}
                                            </span>
                                            {/* Icon circle */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCurrentStep(
                                                        step.id as 1 | 2 | 3 | 4,
                                                    )
                                                }
                                                className={`
                                                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer flex-shrink-0
                                                    ${
                                                        isActive
                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                            : isCompleted
                                                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                                              : 'bg-white/5 text-gray-500 border border-white/10'
                                                    }
                                                `}
                                            >
                                                {step.icon}
                                            </button>
                                            {/* Label (shown on mobile, hidden on desktop - below icon) */}
                                            <span
                                                className={`lg:hidden text-xs font-medium text-center transition-colors duration-300 ${
                                                    isActive
                                                        ? 'text-white'
                                                        : isCompleted
                                                          ? 'text-emerald-400'
                                                          : 'text-gray-500'
                                                }`}
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                        {/* Connecting line between icons (desktop only) */}
                                        {!isLast && (
                                            <div className="hidden lg:flex justify-end pr-[23px]">
                                                <div className="w-px h-10 relative">
                                                    <div className="absolute inset-0 bg-white/10" />
                                                    {isCompleted && (
                                                        <motion.div
                                                            className="absolute inset-0 bg-emerald-500"
                                                            initial={{ height: '0%' }}
                                                            animate={{ height: '100%' }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Vertical divider line with dots (desktop only) */}
                    <div className="hidden lg:flex flex-col items-center py-8 relative">
                        {/* Base vertical line */}
                        <div className="absolute top-0 bottom-0 w-px bg-white/10" />
                        
                        {/* Line segments that turn green based on progress */}
                        {steps.map((step, index) => {
                            const stepIndex = step.id - 1
                            
                            // Calculate if this segment should be green
                            // Segment above dot 1 (top to dot 1): green when currentStep >= 1
                            // Segment between dot 1 and dot 2: green when currentStep >= 2
                            // Segment between dot 2 and dot 3: green when currentStep >= 3
                            // etc.
                            const shouldBeGreen = currentStep > stepIndex
                            
                            // Position: segments start from top of their respective dot
                            const startOffset = stepIndex === 0 ? 0 : 120 + (stepIndex - 1) * 82
                            const endOffset = 120 + stepIndex * 82
                            const lineHeight = endOffset - startOffset

                            return (
                                <div
                                    key={`line-${step.id}`}
                                    className="absolute left-1/2 -translate-x-1/2"
                                    style={{ 
                                        top: `${startOffset}px`,
                                        height: `${lineHeight}px`
                                    }}
                                >
                                    {shouldBeGreen && (
                                        <motion.div
                                            className="w-px h-full bg-emerald-500"
                                            initial={{ height: '0%' }}
                                            animate={{ height: '100%' }}
                                            transition={{ duration: 0.4 }}
                                        />
                                    )}
                                </div>
                            )
                        })}
                        
                        {/* Dots positioned at each step level */}
                        {steps.map((step) => {
                            const isActive = currentStep === step.id
                            const isCompleted = currentStep > step.id
                            const stepIndex = step.id - 1
                            // Position each dot: first dot at ~120px (after title area), then every ~82px
                            const topOffset = 120 + stepIndex * 82

                            return (
                                <div
                                    key={`dot-${step.id}`}
                                    className="absolute left-1/2 -translate-x-1/2 z-10"
                                    style={{ top: `${topOffset}px` }}
                                >
                                    <div
                                        className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                                            isActive
                                                ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/50'
                                                : isCompleted
                                                  ? 'bg-emerald-500 border-emerald-500'
                                                  : 'bg-[#0a1628] border-white/30'
                                        }`}
                                    />
                                </div>
                            )
                        })}
                    </div>

                    {/* Horizontal divider (mobile only) */}
                    <div className="lg:hidden border-b border-white/10" />
                </div>

                {/* ---- Right Content ---- */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Close button */}
                    <div className="flex justify-end p-4 pb-0">
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-white transition-colors p-1"
                        >
                            <HiX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto px-6 lg:px-10 pb-6">
                        {/* Step heading */}
                        <div className="mb-8">
                            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                                {stepDescriptions[currentStep].title}
                            </h2>
                            <p className="text-gray-400 text-sm lg:text-base">
                                {stepDescriptions[currentStep].subtitle}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {/* ---- STEP 1: Personal Information ---- */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                First Name
                                            </label>
                                            <Input
                                                placeholder="Enter Your First Name"
                                                prefix={
                                                    <HiUser className="text-gray-400" />
                                                }
                                                value={firstName}
                                                onChange={(e) =>
                                                    setFirstName(
                                                        (
                                                            e.target as HTMLInputElement
                                                        ).value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Last Name
                                            </label>
                                            <Input
                                                placeholder="Enter Your Last Name"
                                                prefix={
                                                    <HiUser className="text-gray-400" />
                                                }
                                                value={lastName}
                                                onChange={(e) =>
                                                    setLastName(
                                                        (
                                                            e.target as HTMLInputElement
                                                        ).value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Date of Birth
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <Select
                                                placeholder="DD"
                                                options={dayOptions}
                                                value={dayOptions.find(
                                                    (o) => o.value === dobDay,
                                                )}
                                                onChange={(opt) =>
                                                    setDobDay(
                                                        opt ? opt.value : null,
                                                    )
                                                }
                                                styles={selectStyles}
                                            />
                                            <Select
                                                placeholder="MM"
                                                options={monthOptions}
                                                value={monthOptions.find(
                                                    (o) => o.value === dobMonth,
                                                )}
                                                onChange={(opt) =>
                                                    setDobMonth(
                                                        opt ? opt.value : null,
                                                    )
                                                }
                                                styles={selectStyles}
                                            />
                                            <Select
                                                placeholder="YYYY"
                                                options={yearOptions}
                                                value={yearOptions.find(
                                                    (o) => o.value === dobYear,
                                                )}
                                                onChange={(opt) =>
                                                    setDobYear(
                                                        opt ? opt.value : null,
                                                    )
                                                }
                                                styles={selectStyles}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Phone Number
                                            </label>
                                            <Input
                                                placeholder="Enter Your Mobile Number"
                                                prefix={
                                                    <HiPhone className="text-gray-400" />
                                                }
                                                value={phoneNumber}
                                                onChange={(e) =>
                                                    setPhoneNumber(
                                                        (
                                                            e.target as HTMLInputElement
                                                        ).value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Telephone Number
                                            </label>
                                            <Input
                                                placeholder="Enter Your Telephone Number"
                                                prefix={
                                                    <HiPhone className="text-gray-400" />
                                                }
                                                value={telephoneNumber}
                                                onChange={(e) =>
                                                    setTelephoneNumber(
                                                        (
                                                            e.target as HTMLInputElement
                                                        ).value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                E-Mail
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="Enter Your E-mail Address"
                                                prefix={
                                                    <HiMail className="text-gray-400" />
                                                }
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(
                                                        (
                                                            e.target as HTMLInputElement
                                                        ).value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Confirm E-Mail
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="Re-enter Your Email Address"
                                                prefix={
                                                    <HiMail className="text-gray-400" />
                                                }
                                                value={confirmEmail}
                                                onChange={(e) =>
                                                    setConfirmEmail(
                                                        (
                                                            e.target as HTMLInputElement
                                                        ).value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ---- STEP 2: Education ---- */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Degree
                                            </label>
                                            <Select
                                                placeholder="Select Your Degree"
                                                options={degreeOptions}
                                                value={degreeOptions.find(
                                                    (o) => o.value === degree,
                                                )}
                                                onChange={(opt) =>
                                                    setDegree(
                                                        opt ? opt.value : null,
                                                    )
                                                }
                                                styles={selectStyles}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Graduation Year
                                            </label>
                                            <Select
                                                placeholder="Select Year"
                                                options={gradYearOptions}
                                                value={gradYearOptions.find(
                                                    (o) =>
                                                        o.value ===
                                                        graduationYear,
                                                )}
                                                onChange={(opt) =>
                                                    setGraduationYear(
                                                        opt ? opt.value : null,
                                                    )
                                                }
                                                styles={selectStyles}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Institution Name
                                        </label>
                                        <Input
                                            placeholder="Enter Your Institution Name"
                                            prefix={
                                                <HiAcademicCap className="text-gray-400" />
                                            }
                                            value={institution}
                                            onChange={(e) =>
                                                setInstitution(
                                                    (
                                                        e.target as HTMLInputElement
                                                    ).value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Field of Study
                                        </label>
                                        <Input
                                            placeholder="Enter Your Field of Study"
                                            prefix={
                                                <HiAcademicCap className="text-gray-400" />
                                            }
                                            value={fieldOfStudy}
                                            onChange={(e) =>
                                                setFieldOfStudy(
                                                    (
                                                        e.target as HTMLInputElement
                                                    ).value,
                                                )
                                            }
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* ---- STEP 3: Work Experiences ---- */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Current Company
                                            </label>
                                            <Input
                                                placeholder="Enter Company Name"
                                                prefix={
                                                    <HiBriefcase className="text-gray-400" />
                                                }
                                                value={currentCompany}
                                                onChange={(e) =>
                                                    setCurrentCompany(
                                                        (
                                                            e.target as HTMLInputElement
                                                        ).value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Job Title
                                            </label>
                                            <Input
                                                placeholder="Enter Your Job Title"
                                                prefix={
                                                    <HiBriefcase className="text-gray-400" />
                                                }
                                                value={jobTitle}
                                                onChange={(e) =>
                                                    setJobTitle(
                                                        (
                                                            e.target as HTMLInputElement
                                                        ).value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Total Experience
                                            </label>
                                            <Select
                                                placeholder="Select Experience"
                                                options={experienceOptions}
                                                value={experienceOptions.find(
                                                    (o) =>
                                                        o.value === experience,
                                                )}
                                                onChange={(opt) =>
                                                    setExperience(
                                                        opt ? opt.value : null,
                                                    )
                                                }
                                                styles={selectStyles}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Industry
                                            </label>
                                            <Select
                                                placeholder="Select Industry"
                                                options={industryOptions}
                                                value={industryOptions.find(
                                                    (o) =>
                                                        o.value === industry,
                                                )}
                                                onChange={(opt) =>
                                                    setIndustry(
                                                        opt ? opt.value : null,
                                                    )
                                                }
                                                styles={selectStyles}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Sales Experience
                                        </label>
                                        <Select
                                            placeholder="Select Sales Experience Level"
                                            options={experienceOptions}
                                            value={experienceOptions.find(
                                                (o) =>
                                                    o.value === salesExperience,
                                            )}
                                            onChange={(opt) =>
                                                setSalesExperience(
                                                    opt ? opt.value : null,
                                                )
                                            }
                                            styles={selectStyles}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* ---- STEP 4: User Photo ---- */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-6"
                                >
                                    <div className="flex flex-col items-center">
                                        {/* Preview */}
                                        <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center mb-6 overflow-hidden">
                                            {uploadedPhoto.length > 0 ? (
                                                <img
                                                    src={URL.createObjectURL(
                                                        uploadedPhoto[0],
                                                    )}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <HiUser className="w-12 h-12 text-gray-600" />
                                            )}
                                        </div>

                                        {/* Upload area */}
                                        <div className="w-full max-w-md">
                                            <Upload
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                showList={false}
                                                className="border-2 border-dashed border-white/20 rounded-xl hover:border-emerald-500/50 transition-colors"
                                            >
                                                <div className="py-10 text-center">
                                                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                                        <HiPhotograph className="w-7 h-7 text-emerald-400" />
                                                    </div>
                                                    <p className="text-sm text-gray-300 font-medium">
                                                        Drop your photo here or{' '}
                                                        <span className="text-emerald-400">
                                                            click to browse
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        PNG, JPG or WEBP (max.
                                                        5MB)
                                                    </p>
                                                </div>
                                            </Upload>
                                        </div>

                                        {uploadedPhoto.length > 0 && (
                                            <div className="mt-4 flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                                                <HiPhotograph className="text-emerald-400" />
                                                <span className="text-sm text-gray-300">
                                                    {uploadedPhoto[0].name}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setUploadedPhoto([])
                                                    }
                                                    className="text-gray-500 hover:text-red-400 transition-colors ml-2"
                                                >
                                                    <HiX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ---- Footer with navigation buttons ---- */}
                    <div className="flex items-center justify-between px-6 lg:px-10 py-5 border-t border-white/10 flex-shrink-0">
                        {currentStep > 1 ? (
                            <Button
                                variant="plain"
                                size="md"
                                onClick={handlePrevious}
                                icon={<HiArrowLeft className="w-4 h-4" />}
                                className="text-gray-400 hover:text-white"
                            >
                                Previous
                            </Button>
                        ) : (
                            <div />
                        )}

                        {currentStep < 4 ? (
                            <Button
                                variant="solid"
                                size="md"
                                onClick={handleNext}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-8"
                                icon={<HiArrowRight className="w-4 h-4" />}
                                iconAlignment="end"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                variant="solid"
                                size="md"
                                onClick={handleSubmit}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-8"
                                icon={<HiArrowRight className="w-4 h-4" />}
                                iconAlignment="end"
                            >
                                Submit
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default SessionSetupPanel
