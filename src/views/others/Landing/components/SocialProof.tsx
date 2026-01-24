import { motion } from 'framer-motion'
import Container from './LandingContainer'
import type { Mode } from '@/@types/theme'

const companyLogos = [
    'Company A',
    'Company B',
    'Company C',
    'Company D',
    'Company E',
]

const signalPhrases = [
    'Used for onboarding',
    'Daily practice tool',
    'Manager-approved',
    'Team-wide adoption',
    'ROI proven',
]

const quotes = [
    {
        text: 'This is the first time sales practice actually felt stressful—in a good way. It exposed gaps I didn\'t know I had.',
        author: 'Mid-Market Account Executive',
    },
    {
        text: 'We stopped guessing who needed coaching. The data made it obvious.',
        author: 'Sales Manager',
    },
]

const SocialProof = ({ mode }: { mode: Mode }) => {
    return (
        <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
            <Container>
                {/* Signal Strip - Horizontal Ticker */}
                <div className="mb-20 overflow-hidden">
                    <div className="flex gap-8">
                        {/* First Row */}
                        <motion.div
                            className="flex gap-8 whitespace-nowrap"
                            animate={{
                                x: [0, -50 * 8],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        >
                            {[...companyLogos, ...signalPhrases, ...companyLogos].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="px-6 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                                >
                                    {item}
                                </div>
                            ))}
                        </motion.div>
                        <motion.div
                            className="flex gap-8 whitespace-nowrap"
                            animate={{
                                x: [0, -50 * 8],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        >
                            {[...companyLogos, ...signalPhrases, ...companyLogos].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="px-6 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                                >
                                    {item}
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Power Quotes */}
                <div className="grid md:grid-cols-2 gap-8">
                    {quotes.map((quote, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg"
                        >
                            <p className="text-xl font-medium text-gray-900 dark:text-white mb-6 leading-relaxed">
                                "{quote.text}"
                            </p>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                — {quote.author}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    )
}

export default SocialProof
