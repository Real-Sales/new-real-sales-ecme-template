import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, Button } from '@/components/ui'
import Container from '@/components/shared/Container'
import SessionSetupPanel from '@/components/shared/SessionSetupPanel'
import type { ConversationMode } from '@/components/shared/SessionSetupPanel'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store'
import {
    HiTrendingUp,
    HiUsers,
    HiChatAlt2,
    HiChartBar,
    HiArrowRight,
    HiLightningBolt,
    HiBeaker,
    HiPresentationChartLine,
    HiPlay,
    HiAdjustments,
    HiUserCircle,
    HiOutlineChatAlt2,
    HiOutlineChartBar,
} from 'react-icons/hi'
import { HiSparkles } from 'react-icons/hi2'

// Metric card component
type MetricCardProps = {
    icon: React.ReactNode
    value: string
    label: string
    description: string
    iconBg: string
}

const MetricCard = ({
    icon,
    value,
    label,
    description,
    iconBg,
}: MetricCardProps) => {
    return (
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col items-center text-center py-2">
                <div
                    className={`${iconBg} rounded-2xl p-3 mb-4 text-primary`}
                >
                    <div className="text-2xl">{icon}</div>
                </div>
                <h3 className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">
                    {value}
                </h3>
                <p className="text-base font-semibold mb-1 text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {label}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {description}
                </p>
            </div>
        </Card>
    )
}

const Overview = () => {
    const [isSetupOpen, setIsSetupOpen] = useState(false)
    const [isVideoPlaying, setIsVideoPlaying] = useState(false)
    const navigate = useNavigate()
    const mode = useAppSelector((state) => state.theme.mode)

    const handleNavigateToPersonas = (
        mode: ConversationMode,
        scenarios?: string[],
        files?: File[]
    ) => {
        // Navigate to persona selection page with session data
        navigate('/persona-selection', {
            state: {
                mode,
                scenarios,
                files,
            },
        })
    }

    const metrics = [
        {
            icon: <HiTrendingUp />,
            value: '55%',
            label: 'Sales Performance',
            description: 'Average improvement',
            iconBg: 'bg-gray-100 dark:bg-gray-700/50',
        },
        {
            icon: <HiUsers />,
            value: '20+',
            label: 'Active Users',
            description: 'Worldwide',
            iconBg: 'bg-gray-100 dark:bg-gray-700/50',
        },
        {
            icon: <HiChatAlt2 />,
            value: '1k+',
            label: 'AI Sessions',
            description: 'Completed',
            iconBg: 'bg-gray-100 dark:bg-gray-700/50',
        },
        {
            icon: <HiChartBar />,
            value: '25',
            label: 'Persona Available',
            description: 'Across all modes',
            iconBg: 'bg-gray-100 dark:bg-gray-700/50',
        },
    ]

    return (
        <div className="min-h-full">
            {/* Hero Section */}
            <section className="py-8 px-4">
                <Container>
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                            Realsales AI Platform
                        </h1>
                        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            Advanced AI-driven sales acceleration platform
                            designed to elevate team performance through
                            personalized coaching and real-time analytics.
                        </p>
                    </div>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="py-6 px-4">
                <Container>
                <Card className="bg-primary border-none">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4">
                        <div className="text-center md:text-left">
                            <h2 className="text-xl md:text-2xl font-bold mb-1 text-neutral">
                                Ready to Begin Your Sales Acceleration?
                            </h2>
                            <p className="text-sm text-neutral opacity-90">
                                Join thousands of sales professionals improving
                                their performance with AI
                            </p>
                        </div>
                        <Button
                            variant="solid"
                            size="md"
                            className="bg-gray-800 hover:bg-gray-700 text-white border-none whitespace-nowrap"
                            icon={<HiArrowRight />}
                            iconAlignment="end"
                            onClick={() => setIsSetupOpen(true)}
                        >
                            Get Started Now
                        </Button>
                    </div>
                </Card>
                </Container>
            </section>

            {/* Demo Video Section - inline playback */}
            <section className="py-6 px-4">
                <Container>
                    <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                                        Watch the Demo
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        See how Realsales AI transforms sales training with realistic AI conversations
                                    </p>
                                </div>
                                <Badge
                                    className="self-start md:self-center"
                                    innerClass="bg-primary/20 text-primary border border-primary px-3 py-1 text-xs font-medium"
                                    content="2:30 min"
                                />
                            </div>
                            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg bg-black">
                                <div className="aspect-video w-full">
                                    {isVideoPlaying ? (
                                        <iframe
                                            title="Realsales Demo Video"
                                            className="w-full h-full"
                                            src="https://www.youtube.com/embed/4zd9hzngFwY?autoplay=1"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div
                                            className="relative w-full h-full flex items-center justify-center cursor-pointer group bg-cover bg-center"
                                            style={{
                                                backgroundImage: 'url("https://img.youtube.com/vi/4zd9hzngFwY/hqdefault.jpg")',
                                            }}
                                            onClick={() => setIsVideoPlaying(true)}
                                        >
                                            <motion.div
                                                className="relative z-10 flex flex-col items-center gap-2"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-xl group-hover:bg-primary transition-colors">
                                                    <HiPlay className="text-white text-2xl ml-1" />
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-200 font-semibold text-sm">
                                                    Click to Play
                                                </p>
                                            </motion.div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Container>
            </section>

            {/* How It Works */}
            <section className="py-10 px-4">
                <Container>
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                            How It Works
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                            From choosing your scenario to reviewing your results — in four steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                        {/* Step 1 */}
                        <div className="relative flex flex-col items-start bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <HiAdjustments className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">Step 1</span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Choose Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Select Prospecting, Discovering, or Closing to match your training focus
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex flex-col items-start bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <HiUserCircle className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Step 2</span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Pick a Persona</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Choose from AI buyers with different profiles and negotiation styles
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex flex-col items-start bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <HiOutlineChatAlt2 className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-purple-500 uppercase tracking-widest">Step 3</span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Communicate with Persona</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Have a real conversation with your AI buyer — practice exactly as you would with real customers
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="relative flex flex-col items-start bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <HiOutlineChartBar className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-green-500 uppercase tracking-widest">Step 4</span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">See Your Performance Report</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Get instant feedback, actionable insights, and track your improvement over time
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Platform Overview Section */}
            <section className="py-6 px-4">
                <Container>
                <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
                        <div>
                            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                                Platform Overview
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Key metrics and performance indicators
                            </p>
                        </div>
                        <Badge
                            className="self-start md:self-center"
                            innerClass="bg-primary/20 text-primary border-2 border-primary px-3 py-1 text-sm font-medium"
                            content="Live Data"
                        />
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-2 pt-0">
                        {metrics.map((metric, index) => (
                            <MetricCard key={index} {...metric} />
                        ))}
                    </div>
                </Card>
                </Container>
            </section>

            {/* Platform Capabilities Section */}
            <section className="py-6 px-4">
                <Container>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                        Platform Capabilities
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        Comprehensive tools designed for modern sales excellence
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-4 p-4">
                            <div className="flex-shrink-0">
                                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl p-3 text-primary">
                                    <div className="text-2xl">
                                        <HiSparkles />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                    Smart Acceleration
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    AI-powered personalized learning paths that adapt to individual performance patterns
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-4 p-4">
                            <div className="flex-shrink-0">
                                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl p-3 text-primary">
                                    <div className="text-2xl">
                                        <HiBeaker />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                    Real Scenarios
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Practice with industry-specific simulations based on actual sales interactions
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-4 p-4">
                            <div className="flex-shrink-0">
                                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl p-3 text-primary">
                                    <div className="text-2xl">
                                        <HiPresentationChartLine />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                    Deep Analytics
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Comprehensive performance tracking with actionable insights and recommendations
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center gap-4 p-4">
                            <div className="flex-shrink-0">
                                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl p-3 text-primary">
                                    <div className="text-2xl">
                                        <HiLightningBolt />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                    Instant Feedback
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Real-time coaching with evidence-based improvement strategies
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Powered by advanced machine learning algorithms and natural language processing
                    </p>
                </div>
                </Container>
            </section>

            {/* Session Setup Panel */}
            <SessionSetupPanel
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                onNavigateToPersonas={handleNavigateToPersonas}
            />
        </div>
    )
}

export default Overview
