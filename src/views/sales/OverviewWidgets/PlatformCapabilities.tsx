import { motion } from 'framer-motion'
import { TbSparkles, TbFlask2, TbChartInfographic, TbBolt } from 'react-icons/tb'
import { Reveal, StaggerGroup, StaggerItem, SectionHeading, EASE_OUT } from './common'

const capabilities = [
    {
        icon: TbSparkles,
        title: 'Smart acceleration',
        description:
            'AI-powered personalized learning paths that adapt to your individual performance patterns.',
    },
    {
        icon: TbFlask2,
        title: 'Real scenarios',
        description:
            'Practice with industry-specific simulations based on actual sales interactions.',
    },
    {
        icon: TbChartInfographic,
        title: 'Deep analytics',
        description:
            'Comprehensive performance tracking with actionable insights and recommendations.',
    },
    {
        icon: TbBolt,
        title: 'Instant feedback',
        description: 'Real-time coaching with evidence-based improvement strategies.',
    },
]

const PlatformCapabilities = () => {
    return (
        <section className="px-4 py-16 md:py-20">
            <div className="max-w-7xl mx-auto">
                <Reveal className="mb-10">
                    <SectionHeading
                        heading="What the platform handles for you"
                        description="Every session runs on the same engine underneath: adaptive scenarios, real-time analysis, and coaching that keeps up with your pace."
                    />
                </Reveal>

                <StaggerGroup className="grid gap-4 sm:grid-cols-2" gap={0.08}>
                    {capabilities.map((cap) => {
                        const Icon = cap.icon
                        return (
                            <StaggerItem key={cap.title}>
                                <div className="group relative overflow-hidden rounded-[1.5rem] border app-liquid-dark p-6 shadow-sm hover:shadow-xl hover:border-primary/30 transition-shadow duration-300">
                                    <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative flex items-start gap-4">
                                        <motion.div
                                            whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
                                            transition={{ duration: 0.5, ease: EASE_OUT }}
                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                                        >
                                            <Icon className="h-6 w-6" />
                                        </motion.div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                {cap.title}
                                            </h3>
                                            <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                                {cap.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </StaggerItem>
                        )
                    })}
                </StaggerGroup>

                <p className="mt-10 text-center text-xs text-gray-400 dark:text-gray-500">
                    Powered by advanced machine learning and natural language processing.
                </p>
            </div>
        </section>
    )
}

export default PlatformCapabilities
