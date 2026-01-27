import { motion } from 'framer-motion'
import { HiPlay } from 'react-icons/hi'
import Container from './LandingContainer'
import type { Mode } from '@/@types/theme'

const VideoSection = ({ mode }: { mode: Mode }) => {
    const handlePlayVideo = () => {
        // Handle video play action
        console.log('Play video')
    }

    return (
        <section className="py-20 md:py-32 bg-white dark:bg-gray-950">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-6xl mx-auto"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            See How RealSales Works
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Watch how sales reps practice real conversations with AI buyers that challenge, interrupt, and negotiate—just like real customers.
                        </p>
                    </div>
                    
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 group cursor-pointer"
                        onClick={handlePlayVideo}
                    >
                        {/* Placeholder Image */}
                        <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                            {/* Placeholder Pattern */}
                            <div 
                                style={{ 
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='${mode === 'light' ? 'rgb(0 0 0 / 0.1)' : 'rgb(255 255 255 / 0.1)'}'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")` 
                                }} 
                                className="absolute inset-0 opacity-50"
                            />
                            
                            {/* Play Button Overlay */}
                            <motion.div
                                className="relative z-10 flex flex-col items-center gap-4"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:bg-primary transition-colors">
                                    <HiPlay className="text-white text-3xl md:text-4xl ml-1" />
                                </div>
                                <p className="text-white font-semibold text-lg md:text-xl drop-shadow-lg">
                                    Watch Demo Video
                                </p>
                            </motion.div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        </div>

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 pointer-events-none" />
                    </div>

                    {/* Optional: Video Description */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400"
                    >
                        Click to play • 2:30 min
                    </motion.p>
                </motion.div>
            </Container>
        </section>
    )
}

export default VideoSection
