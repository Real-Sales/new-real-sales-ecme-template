import { Button } from '@/components/ui'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAppSelector } from '@/store'
import SessionSetupPanel from '@/components/shared/SessionSetupPanel'
import type { ConversationMode, AIPersona } from '@/components/shared/SessionSetupPanel'
import { HiPlay } from 'react-icons/hi'
import type { Mode } from '@/@types/theme'
import Container from './LandingContainer'

const objections = [
    'Why should I switch?',
    'Your competitor is cheaper.',
    'Send me a proposal.',
    'I need to think about it.',
    'What\'s the ROI?',
]

const RealSalesHero = ({ mode }: { mode: Mode }) => {
    const navigate = useNavigate()
    const [showVideo, setShowVideo] = useState(false)
    const [currentObjection, setCurrentObjection] = useState(0)
    const [isSetupOpen, setIsSetupOpen] = useState(false)
    
    // Check if user is authenticated
    const signedIn = useAppSelector((state) => state.auth.session.signedIn)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 25, stiffness: 700 }
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7.5, -7.5]), springConfig)
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7.5, 7.5]), springConfig)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!e.currentTarget) return
        const rect = e.currentTarget.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseXRelative = (e.clientX - rect.left - width / 2) / width
        const mouseYRelative = (e.clientY - rect.top - height / 2) / height
        mouseX.set(mouseXRelative)
        mouseY.set(mouseYRelative)
    }

    const handleEnterSimulator = () => {
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

    const handleSeeInAction = () => {
        setShowVideo(true)
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentObjection((prev) => (prev + 1) % objections.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
            <div 
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='50' height='50' fill='none' stroke='${mode === MODE_LIGHT ? 'rgb(0 0 0 / 0.04)' : 'rgb(255 255 255 / 0.04)'}'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")` 
                }} 
                className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white_5%,transparent_70%)] pointer-events-none select-none"
            />
            <Container>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                            Practice the Sales Conversation{' '}
                            <span className="bg-gradient-to-r from-indigo-600 via-[#be598a] to-[#ff6a55] bg-clip-text text-transparent">
                                Before It Costs You the Deal
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                            RealSales lets sales reps train with AI buyers that behave like real customers—challenging, skeptical, and unpredictable.
                        </p>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-semibold">
                            So when it's game time, confidence isn't optional. It's earned.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                variant="solid"
                                size="lg"
                                className="bg-primary hover:bg-primary-deep text-white"
                                onClick={handleEnterSimulator}
                            >
                                Enter the Sales Simulator
                            </Button>
                            <Button
                                variant="plain"
                                size="lg"
                                className="border border-gray-300 dark:border-gray-600 flex items-center gap-2"
                                onClick={handleSeeInAction}
                            >
                                <HiPlay className="text-lg" />
                                See It in Action
                            </Button>
                        </div>
                    </motion.div>

                    {/* Right Column - 3D Orb Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative h-[500px] flex items-center justify-center"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => {
                            mouseX.set(0)
                            mouseY.set(0)
                        }}
                    >
                        {showVideo ? (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-full h-full rounded-3xl bg-gray-900 flex items-center justify-center"
                            >
                                <p className="text-white">Video Player Placeholder</p>
                            </motion.div>
                        ) : (
                            <>
                                {/* Voice Waveforms Orbiting */}
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute"
                                        style={{
                                            width: '200px',
                                            height: '200px',
                                            rotate: i * 72,
                                        }}
                                        animate={{
                                            rotate: [i * 72, i * 72 + 360],
                                        }}
                                        transition={{
                                            duration: 20,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    >
                                        <motion.div
                                            className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-primary/60 to-transparent rounded-full"
                                            animate={{
                                                height: [32, 64, 32],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                delay: i * 0.2,
                                                ease: 'easeInOut',
                                            }}
                                        />
                                    </motion.div>
                                ))}

                                {/* 3D Conversation Orb */}
                                <motion.div
                                    style={{
                                        rotateX,
                                        rotateY,
                                        transformStyle: 'preserve-3d',
                                    }}
                                    className="relative w-64 h-64"
                                >
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primaryMild/20 backdrop-blur-xl border border-primary/20"
                                        animate={{
                                            scale: [1, 1.05, 1],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                    <motion.div
                                        className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/30 to-primaryMild/30 backdrop-blur-2xl"
                                        animate={{
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{
                                            duration: 2.5,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primaryMild flex items-center justify-center text-white text-2xl font-bold shadow-2xl">
                                            AI
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Floating Objection Phrases */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentObjection}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-32"
                                    >
                                        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            "{objections[currentObjection]}"
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </>
                        )}
                    </motion.div>
                </div>
            </Container>

            {/* Session Setup Panel */}
            <SessionSetupPanel
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                onNavigateToPersonas={handleNavigateToPersonas}
            />
        </section>
    )
}

export default RealSalesHero
