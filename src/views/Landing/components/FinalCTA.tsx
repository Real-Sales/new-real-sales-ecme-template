import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store'
import SessionSetupPanel from '@/components/shared/SessionSetupPanel'
import type { ConversationMode, AIPersona } from '@/components/shared/SessionSetupPanel'
import Container from './LandingContainer'
import type { Mode } from '@/@types/theme'

const FinalCTA = ({ mode }: { mode: Mode }) => {
    const navigate = useNavigate()
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })
    const [pulseGlow, setPulseGlow] = useState(false)
    const [isSetupOpen, setIsSetupOpen] = useState(false)
    
    // Check if user is authenticated
    const signedIn = useAppSelector((state) => state.auth.session.signedIn)

    useEffect(() => {
        if (isInView) {
            setPulseGlow(true)
        }
    }, [isInView])

    const handleStartPracticing = () => {
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

    const handleBookWalkthrough = () => {
        // Handle book walkthrough
        console.log('Book a live walkthrough')
    }

    return (
        <section ref={ref} className="py-20 md:py-32 bg-white dark:bg-gray-950 relative overflow-hidden">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto relative z-10"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                        You Don't Lose Deals Because You're Bad at Sales.
                    </h2>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-gray-900 dark:text-white leading-tight">
                        You Lose Them Because You Didn't Get to Practice.
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
                        RealSales gives your team a place to fail, learn, and improve—before real revenue is on the line.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.div
                            animate={pulseGlow ? {
                                boxShadow: [
                                    '0 0 0 0 rgba(42, 133, 255, 0.4)',
                                    '0 0 0 10px rgba(42, 133, 255, 0)',
                                    '0 0 0 0 rgba(42, 133, 255, 0)',
                                ],
                            } : {}}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="relative"
                        >
                            <Button
                                variant="solid"
                                size="lg"
                                className="bg-primary hover:bg-primary-deep text-white relative overflow-hidden"
                                onClick={handleStartPracticing}
                            >
                                <motion.span
                                    className="absolute inset-0 bg-white/20"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileTap={{ scale: 2, opacity: [1, 0] }}
                                    transition={{ duration: 0.6 }}
                                />
                                <span className="relative z-10">Start Practicing Now</span>
                            </Button>
                        </motion.div>
                        <Button
                            variant="plain"
                            size="lg"
                            className="border border-gray-300 dark:border-gray-600"
                            onClick={handleBookWalkthrough}
                        >
                            Book a Live Walkthrough
                        </Button>
                    </div>
                </motion.div>
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

export default FinalCTA
