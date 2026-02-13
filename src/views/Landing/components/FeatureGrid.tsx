import { motion } from 'framer-motion'
import { HiLightBulb, HiVolumeUp, HiCursorClick, HiChartBar } from 'react-icons/hi'
import Container from './LandingContainer'
import type { Mode } from '@/@types/theme'

const features = [
    {
        icon: <HiLightBulb className="text-4xl" />,
        title: 'Real Buyer Behavior',
        description: 'Practice with AI buyers trained to interrupt, doubt, negotiate, and push back—just like real customers.',
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
        icon: <HiVolumeUp className="text-4xl" />,
        title: 'Talk, Don\'t Type',
        description: 'Voice-first conversations that train how you speak, not just what you say.',
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
        icon: <HiCursorClick className="text-4xl" />,
        title: 'Scenario-Based Practice',
        description: 'Cold calls, discovery, objections, closing—pick the moment you want to master.',
        color: 'from-emerald-500 to-teal-500',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        icon: <HiChartBar className="text-4xl" />,
        title: 'Performance Intelligence',
        description: 'Every session turns into insights you can act on, not generic feedback.',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
]

const FeatureGrid = ({ mode }: { mode: Mode }) => {
    return (
        <section className="py-20 md:py-32 bg-white dark:bg-gray-950">
            <Container>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40, scale: 0.96 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative"
                        >
                            <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                {/* Glass-morphic Icon Background */}
                                <motion.div
                                    className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity bg-gradient-to-br ${feature.color}`}
                                    animate={{
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />
                                
                                {/* Icon Container */}
                                <motion.div
                                    className={`relative z-10 w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}
                                    style={{
                                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                                    }}
                                >
                                    {feature.icon}
                                </motion.div>

                                {/* Content */}
                                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white relative z-10">
                                    {feature.title}
                                </h3>
                                <motion.p
                                    initial={{ opacity: 0.7 }}
                                    whileHover={{ opacity: 1 }}
                                    className="text-gray-600 dark:text-gray-400 leading-relaxed relative z-10"
                                >
                                    {feature.description}
                                </motion.p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    )
}

export default FeatureGrid
