import { useState } from 'react'
import NavigationBar from './components/NavigationBar'
import LandingNavSentinel from './components/LandingNavSentinel'
import LandingFooter from './components/LandingFooter'
import Container from './components/LandingContainer'
import { Button } from '@/components/ui'
import SessionSetupPanel from '@/components/shared/SessionSetupPanel'
import type { ConversationMode, AIPersona } from '@/components/shared/SessionSetupPanel'
import { motion, AnimatePresence } from 'framer-motion'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store'
import { HiChevronDown } from 'react-icons/hi'
import { HiSparkles } from 'react-icons/hi2'
import type { Mode } from '@/@types/theme'

interface FAQItem {
    id: number
    question: string
    answer: string
}

const faqData: FAQItem[] = [
    {
        id: 1,
        question: 'What is SalesWana?',
        answer: 'SalesWana is an AI-powered sales practice platform that lets sales professionals rehearse real buyer conversations using live, voice-based AI personas. It helps reps improve discovery, objection handling, negotiation, and closing skills in realistic, risk-free scenarios.',
    },
    {
        id: 2,
        question: 'How is this different from traditional sales training?',
        answer: 'Traditional sales training is static and theory-driven. SalesWana is interactive and adaptive. Instead of watching videos or role-playing with peers, reps engage in dynamic conversations that evolve based on what they say—just like real buyers do.',
    },
    {
        id: 3,
        question: 'Who is SalesWana built for?',
        answer: 'SalesWana is designed for:\n\n• Sales representatives looking to sharpen real-world selling skills\n• Sales managers who want measurable coaching insights\n• Revenue leaders aiming to improve consistency and reduce ramp time\n\nIt works for individuals as well as growing sales teams.',
    },
    {
        id: 4,
        question: 'Does SalesWana use scripts or predefined answers?',
        answer: 'No. SalesWana does not rely on scripts. Each AI buyer responds dynamically based on your tone, logic, confidence, and strategy. This ensures every conversation feels natural, unpredictable, and realistic.',
    },
    {
        id: 5,
        question: 'Can SalesWana adapt to different industries and products?',
        answer: 'Yes. SalesWana supports multiple industries, deal types, and sales motions. Scenarios can be customized based on product complexity, buyer persona, and stage of the sales cycle.',
    },
    {
        id: 6,
        question: 'Is SalesWana voice-based or text-based?',
        answer: 'SalesWana primarily supports voice-based conversations to simulate real sales calls. This helps reps practice delivery, confidence, and real-time thinking—not just what to say, but how to say it.',
    },
    {
        id: 7,
        question: 'What kind of feedback do users get after a session?',
        answer: 'After each session, SalesWana provides structured feedback across key areas such as:\n\n• Discovery quality\n• Objection handling\n• Value articulation\n• Close readiness\n\nThis helps reps understand what worked and what to improve immediately.',
    },
    {
        id: 8,
        question: 'Can managers track team performance?',
        answer: 'Yes. Managers get visibility into individual and team-level performance trends, making it easier to identify coaching opportunities and measure progress over time.',
    },
    {
        id: 9,
        question: 'Is SalesWana meant to replace sales managers or coaches?',
        answer: 'No. SalesWana complements human coaching. It handles repetitive practice and performance analysis, allowing managers to focus on higher-impact coaching and strategy.',
    },
    {
        id: 10,
        question: 'How quickly can teams get started?',
        answer: 'Teams can get started within minutes. There\'s no complex setup required—reps can choose a scenario and begin practicing immediately.',
    },
    {
        id: 11,
        question: 'Is SalesWana suitable for remote or distributed teams?',
        answer: 'Absolutely. SalesWana is cloud-based and works equally well for in-office, remote, and hybrid sales teams.',
    },
    {
        id: 12,
        question: 'How is data privacy handled?',
        answer: 'All conversations and performance data are securely processed and stored. SalesWana follows best practices for data security and access control to ensure user information remains protected.',
    },
    {
        id: 13,
        question: 'Can SalesWana be used for onboarding new hires?',
        answer: 'Yes. Many teams use SalesWana to reduce ramp-up time by allowing new hires to practice real scenarios before speaking with actual customers.',
    },
    {
        id: 14,
        question: 'Do I need technical knowledge to use SalesWana?',
        answer: 'No. SalesWana is designed to be intuitive and easy to use. If you can have a sales conversation, you can use SalesWana.',
    },
    {
        id: 15,
        question: 'How do I get access to SalesWana?',
        answer: 'You can start by booking a demo or signing up directly from the platform. Our team will help you choose the right setup based on your goals.',
    },
]

const FAQs = () => {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const navigate = useNavigate()
    const [openItems, setOpenItems] = useState<Set<number>>(new Set())
    const [isSetupOpen, setIsSetupOpen] = useState(false)
    
    // Check if user is authenticated
    const signedIn = useAppSelector((state) => state.auth.session.signedIn)

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    const toggleItem = (id: number) => {
        setOpenItems((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    const handleBookDemo = () => {
        navigate('/book-demo')
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

    return (
        <main className="px-4 lg:px-0 text-base min-h-screen">
            <LandingNavSentinel />
            <NavigationBar toggleMode={toggleMode} mode={mode} />
            
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 md:pt-40 md:pb-24">
                <div 
                    style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='50' height='50' fill='none' stroke='${mode === MODE_LIGHT ? 'rgb(0 0 0 / 0.04)' : 'rgb(255 255 255 / 0.04)'}'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")` 
                    }} 
                    className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white_5%,transparent_70%)] pointer-events-none select-none"
                />
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 mb-6">
                            <HiSparkles className="text-gray-700 dark:text-gray-300 text-2xl" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Knowledge Base
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                            Frequently Asked{' '}
                            <span className="bg-gradient-to-r from-indigo-600 via-[#be598a] to-[#ff6a55] bg-clip-text text-transparent">
                                Questions
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Everything you need to know about SalesWana, answered in one place.
                        </p>
                    </motion.div>
                </Container>
            </section>

            {/* FAQ Section */}
            <section className="py-12 md:py-20 pb-32">
                <Container>
                    <div className="max-w-4xl mx-auto space-y-4">
                        {faqData.map((item, index) => {
                            const isOpen = openItems.has(item.id)
                            const hasOtherOpen = openItems.size > 0 && !isOpen

                            return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.05,
                                            ease: [0.175, 0.885, 0.32, 1.275],
                                        }}
                                        whileHover={!isOpen ? { 
                                            y: -4,
                                            transition: { duration: 0.2 }
                                        } : {}}
                                        className="relative group"
                                    >
                                        {/* Glow effect when open */}
                                        {isOpen && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute -inset-1 bg-gradient-to-r from-gray-200/50 via-gray-100/30 to-gray-200/50 dark:from-gray-700/50 dark:via-gray-600/30 dark:to-gray-700/50 rounded-2xl blur-xl -z-10"
                                            />
                                        )}

                                        {/* FAQ Card */}
                                        <div
                                            className={`
                                                relative overflow-hidden
                                                backdrop-blur-xl
                                                rounded-2xl
                                                border
                                                transition-all duration-400
                                                cursor-pointer
                                                ${
                                                    isOpen
                                                        ? 'bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50'
                                                        : hasOtherOpen
                                                        ? 'bg-white/60 dark:bg-gray-800/60 border-gray-200/50 dark:border-gray-700/50 shadow-lg opacity-60'
                                                        : 'bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl'
                                                }
                                            `}
                                            style={{
                                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            }}
                                            onClick={() => toggleItem(item.id)}
                                        >
                                            {/* Question Header */}
                                            <div className="flex items-center justify-between p-6 md:p-8">
                                                <h3
                                                    className={`
                                                        text-lg md:text-xl font-bold
                                                        pr-8
                                                        transition-colors duration-300
                                                    ${
                                                        isOpen
                                                            ? 'text-primary'
                                                            : 'text-gray-900 dark:text-white'
                                                    }
                                                    `}
                                                    style={{
                                                        fontFamily: 'system-ui, -apple-system, sans-serif',
                                                        letterSpacing: '-0.02em',
                                                        lineHeight: '1.3',
                                                    }}
                                                >
                                                    {item.question}
                                                </h3>
                                                <motion.div
                                                    animate={{
                                                        rotate: isOpen ? 180 : 0,
                                                        scale: isOpen ? 1.1 : 1,
                                                    }}
                                                    transition={{
                                                        duration: 0.4,
                                                        ease: [0.175, 0.885, 0.32, 1.275],
                                                    }}
                                                    className={`
                                                        flex-shrink-0
                                                        w-10 h-10
                                                        rounded-full
                                                        flex items-center justify-center
                                                        transition-all duration-300
                                                        ${
                                                            isOpen
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'
                                                        }
                                                    `}
                                                >
                                                    <HiChevronDown className="text-xl" />
                                                </motion.div>
                                            </div>

                                            {/* Answer Content */}
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ 
                                                            height: 'auto', 
                                                            opacity: 1,
                                                        }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{
                                                            duration: 0.5,
                                                            ease: [0.175, 0.885, 0.32, 1.275],
                                                        }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-6 md:px-8 pb-6 md:pb-8">
                                                            <div
                                                                className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6"
                                                                style={{
                                                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                                                    fontSize: '1rem',
                                                                    lineHeight: '1.75',
                                                                    color: mode === MODE_LIGHT ? '#4b5563' : '#d1d5db',
                                                                    fontWeight: '400',
                                                                }}
                                                            >
                                                                {item.answer.split('\n').map((line, idx) => (
                                                                    <motion.p
                                                                        key={idx}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{
                                                                            delay: idx * 0.05,
                                                                            duration: 0.3,
                                                                        }}
                                                                        className={line.startsWith('•') ? 'ml-4 mb-2' : 'mb-3 last:mb-0'}
                                                                    >
                                                                        {line}
                                                                    </motion.p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )
                            })}
                    </div>
                </Container>
            </section>

            {/* CTA Section */}
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
                            Still have questions?
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                            Get in touch with our team and we'll help you find the answers.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

export default FAQs
