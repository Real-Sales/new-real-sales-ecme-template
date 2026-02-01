import { useState } from 'react'
import NavigationBar from './components/NavigationBar'
import LandingFooter from './components/LandingFooter'
import Container from './components/LandingContainer'
import { Button } from '@/components/ui'
import SessionSetupPanel from '@/components/shared/SessionSetupPanel'
import type { ConversationMode, AIPersona } from '@/components/shared/SessionSetupPanel'
import { motion } from 'framer-motion'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store'
import {
    HiX,
    HiLightBulb,
    HiChartBar,
    HiUser,
    HiUserGroup,
    HiOfficeBuilding,
    HiTrendingUp,
    HiArrowRight,
    HiPlay,
} from 'react-icons/hi'
import type { Mode } from '@/@types/theme'

const About = () => {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const navigate = useNavigate()
    const [isSetupOpen, setIsSetupOpen] = useState(false)
    
    // Check if user is authenticated
    const signedIn = useAppSelector((state) => state.auth.session.signedIn)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    const handleStartSession = () => {
        // Check if user is authenticated
        if (!signedIn) {
            // Redirect to sign in with return URL
            navigate('/sign-in?redirect=/audio-visualizer')
            return
        }
        setIsSetupOpen(true)
    }

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

    const handleBookDemo = () => {
        // Handle book demo action
        console.log('Book a demo')
    }

    return (
        <main className="px-4 lg:px-0 text-base">
            <NavigationBar toggleMode={toggleMode} mode={mode} />
            
            {/* Hero Section */}
            <section id="about" className="relative pt-32 pb-20 md:pt-40 md:pb-32">
                <div style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='50' height='50' fill='none' stroke='${mode === MODE_LIGHT ? 'rgb(0 0 0 / 0.04)' : 'rgb(255 255 255 / 0.04)'}'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`}} className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white_5%,transparent_70%)] pointer-events-none select-none"></div>
                <Container>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                                Sales Training That{' '}
                                <span className="bg-gradient-to-r from-indigo-600 via-[#be598a] to-[#ff6a55] bg-clip-text text-transparent">
                                    Feels Like the Real Deal
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                RealSales uses AI-driven buyer conversations to help sales teams practice real scenarios, handle real objections, and build real confidence—before they ever talk to a customer.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    variant="solid"
                                    size="lg"
                                    className="bg-primary hover:bg-primary-deep text-white"
                                    onClick={handleStartSession}
                                >
                                    Start a Session
                                </Button>
                                <Button
                                    variant="plain"
                                    size="lg"
                                    className="border border-gray-300 dark:border-gray-600"
                                    icon={<HiPlay />}
                                >
                                    Watch How It Works
                                </Button>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 h-96 flex items-center justify-center">
                                <div className="space-y-4 w-full">
                                    <div className="flex gap-2 justify-center">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-2 h-16 bg-gradient-to-b from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-700 rounded-full"
                                                animate={{
                                                    height: [32, 64, 32],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    delay: i * 0.1,
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-3 justify-center mt-8">
                                        {['Objections', 'Discovery', 'Closing', 'Negotiation'].map((word, idx) => (
                                            <motion.span
                                                key={word}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 + idx * 0.1 }}
                                                className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm"
                                            >
                                                {word}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </section>

            {/* The Problem Section */}
            <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            The Gap Between Training and Real Conversations
                        </h2>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <HiX className="text-3xl" />,
                                title: 'Scripted Role-Plays',
                                description: 'Practice that doesn\'t reflect real buyer behavior',
                            },
                            {
                                icon: <HiX className="text-3xl" />,
                                title: 'Delayed Feedback',
                                description: 'Coaching happens weeks after deals are lost',
                            },
                            {
                                icon: <HiX className="text-3xl" />,
                                title: 'No Performance Data',
                                description: 'Managers can\'t measure real readiness',
                            },
                        ].map((problem, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40, rotate: -2 }}
                                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                whileHover={{ rotate: 1, scale: 1.02 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 opacity-75 hover:opacity-100 transition-opacity"
                            >
                                <div className="text-red-500 mb-4">{problem.icon}</div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                    {problem.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {problem.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* The RealSales Approach */}
            <section className="py-20 md:py-32">
                <Container>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
                                Built for How Buyers Actually Think
                            </h2>
                            <div className="space-y-6">
                                {[
                                    {
                                        icon: <HiLightBulb className="text-2xl" />,
                                        title: 'AI Buyer Personas',
                                        description: 'Trained on real-world buyer psychology and industry patterns',
                                    },
                                    {
                                        icon: <HiChartBar className="text-2xl" />,
                                        title: 'Scenario-Based Practice',
                                        description: 'Prospecting, discovery, objections, closing—on demand',
                                    },
                                    {
                                        icon: <HiTrendingUp className="text-2xl" />,
                                        title: 'Performance Intelligence',
                                        description: 'Every session produces measurable insights',
                                    },
                                ].map((point, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        className="flex gap-4"
                                    >
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                            idx === 0 
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                                : idx === 1
                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                                        }`}>
                                            {point.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                                {point.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {point.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8">
                                <div className="space-y-6">
                                    {['Scenario', 'Conversation', 'Insights'].map((step, idx) => (
                                        <motion.div
                                            key={step}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.2 }}
                                            className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                                    idx === 0 
                                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                                        : idx === 1
                                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                                        : 'bg-gradient-to-br from-violet-500 to-purple-600'
                                                }`}>
                                                    {idx + 1}
                                                </div>
                                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {step}
                                                </span>
                                                {idx < 2 && (
                                                    <HiArrowRight className="ml-auto text-gray-400" />
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </section>

            {/* How RealSales Works */}
            <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            How RealSales Works
                        </h2>
                    </motion.div>
                    <div className="relative">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    step: '1',
                                    title: 'Choose the Scenario',
                                    description: 'Pick industry, deal stage, and buyer type',
                                },
                                {
                                    step: '2',
                                    title: 'Talk to the AI Buyer',
                                    description: 'Live voice conversations with dynamic objections',
                                },
                                {
                                    step: '3',
                                    title: 'Get Actionable Feedback',
                                    description: 'Strengths, gaps, and improvement areas instantly',
                                },
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.2 }}
                                    className="relative"
                                >
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 relative overflow-hidden group">
                                        <div className={`absolute top-0 left-0 w-full h-1 ${
                                            idx === 0 
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                                : idx === 1
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                                : 'bg-gradient-to-r from-violet-500 to-purple-500'
                                        }`}></div>
                                        <div className={`text-6xl font-bold mb-4 bg-gradient-to-br bg-clip-text text-transparent ${
                                            idx === 0 
                                                ? 'from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400'
                                                : idx === 1
                                                ? 'from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'
                                                : 'from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400'
                                        }`}>
                                            {item.step}
                                        </div>
                                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {item.description}
                                        </p>
                                    </div>
                                    {idx < 2 && (
                                        <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                            <HiArrowRight className="text-3xl text-gray-400" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* Who It's For */}
            <section className="py-20 md:py-32">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            Designed for Modern Revenue Teams
                        </h2>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <HiUser className="text-4xl" />,
                                title: 'Sales Reps',
                                description: 'Practice without pressure. Improve faster.',
                                hoverText: 'Build confidence through realistic practice scenarios',
                            },
                            {
                                icon: <HiUserGroup className="text-4xl" />,
                                title: 'Sales Managers',
                                description: 'Coach with data, not guesswork.',
                                hoverText: 'Track team performance with actionable insights',
                            },
                            {
                                icon: <HiOfficeBuilding className="text-4xl" />,
                                title: 'Revenue Leaders',
                                description: 'Scale performance without scaling costs.',
                                hoverText: 'Drive consistent execution across your organization',
                            },
                        ].map((persona, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow group relative overflow-hidden"
                            >
                                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity ${
                                            idx === 0 
                                                ? 'bg-blue-400'
                                                : idx === 1
                                                ? 'bg-rose-400'
                                                : 'bg-cyan-400'
                                        }`}></div>
                                        <div className={`mb-4 relative z-10 ${
                                            idx === 0 
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : idx === 1
                                                ? 'text-rose-600 dark:text-rose-400'
                                                : 'text-cyan-600 dark:text-cyan-400'
                                        }`}>{persona.icon}</div>
                                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white relative z-10">
                                    {persona.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-2 relative z-10">
                                    {persona.description}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                                    {persona.hoverText}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Why It Matters - Metrics */}
            <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            Why It Matters
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Early customer data / pilot results
                        </p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                metric: '30–50%',
                                label: 'Faster Ramp Time',
                                icon: <HiTrendingUp className="text-4xl" />,
                            },
                            {
                                metric: 'Higher',
                                label: 'Objection Success Rates',
                                icon: <HiChartBar className="text-4xl" />,
                            },
                            {
                                metric: 'More',
                                label: 'Consistent Sales Execution',
                                icon: <HiLightBulb className="text-4xl" />,
                            },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="text-center"
                            >
                                <div className={`mb-4 flex justify-center ${
                                    idx === 0 
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : idx === 1
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-blue-600 dark:text-blue-400'
                                }`}>
                                    {stat.icon}
                                </div>
                                <div className={`text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-br bg-clip-text text-transparent ${
                                    idx === 0 
                                        ? 'from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400'
                                        : idx === 1
                                        ? 'from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500'
                                        : 'from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'
                                }`}>
                                    {stat.metric}
                                </div>
                                <p className="text-xl text-gray-600 dark:text-gray-400">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Brand Belief */}
            <section className="py-20 md:py-32">
                <Container>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 md:p-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white italic">
                                "Great sales conversations aren't improvised.
                                <br />
                                They're practiced."
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                Confidence comes from preparation. Mastery comes from repetition. RealSales gives your team the practice they need to turn every customer interaction into an opportunity to win. Build the skills that matter, measure what works, and scale what drives results.
                            </p>
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* Final CTA */}
            <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                            Practice Before It Costs You a Deal
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                            <Button
                                variant="solid"
                                size="lg"
                                className="bg-primary hover:bg-primary-dark text-white"
                                onClick={handleStartSession}
                            >
                                Start Practicing Now
                            </Button>
                            <Button
                                variant="plain"
                                size="lg"
                                className="border border-gray-300 dark:border-gray-600"
                                onClick={handleBookDemo}
                            >
                                Book a Demo
                            </Button>
                        </div>
                    </motion.div>
                </Container>
            </section>

            <LandingFooter mode={mode} />

            {/* Session Setup Panel */}
            <SessionSetupPanel
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                onNavigateToPersonas={handleNavigateToPersonas}
            />
        </main>
    )
}

export default About
