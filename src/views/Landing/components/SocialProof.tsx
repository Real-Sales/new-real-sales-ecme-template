import { motion } from 'framer-motion'
import type { Mode } from '@/@types/theme'

const testimonials = [
    {
        quote:
            'We cut our ramp time by 40 percent. New reps reach quota in 6 weeks instead of 12. The AI buyer is legitimately harder to handle than most real prospects.',
        name: 'James Kowalski',
        role: 'VP of Sales',
        company: 'Meridian Software',
        initials: 'JK',
    },
    {
        quote:
            'My team used to dread cold calls. Now they compete over who can handle the toughest objection scenarios. Confidence went through the roof inside 3 weeks.',
        name: 'Priya Nair',
        role: 'Director of Revenue',
        company: 'Patchwork Labs',
        initials: 'PN',
    },
    {
        quote:
            'We stopped guessing who needed coaching. The conversation analytics made it completely obvious. This replaced two manual review processes overnight.',
        name: 'Sarah Chen',
        role: 'Sales Manager',
        company: 'Covey Systems',
        initials: 'SC',
    },
    {
        quote:
            'The AI buyer feels genuinely hostile at times. That is exactly what my reps need before they face real executives. Nothing else on the market does this.',
        name: 'Marcus Wheeler',
        role: 'Chief Revenue Officer',
        company: 'Forefront AI',
        initials: 'MW',
    },
    {
        quote:
            'Best ROI we have seen from any sales enablement tool. 4.8x return in the first 90 days, tracked directly through pipeline data.',
        name: 'Alex Okonkwo',
        role: 'Revenue Operations',
        company: 'TrueNorth Capital',
        initials: 'AO',
    },
    {
        quote:
            'I use it before every big deal. Having a hard conversation with an AI buyer resets my confidence completely. It is the closest thing to real pressure I have found.',
        name: 'Lauren Park',
        role: 'Enterprise Account Executive',
        company: 'Stratus Cloud',
        initials: 'LP',
    },
]

const integrationNames = [
    'Salesforce', 'HubSpot', 'Outreach', 'Salesloft', 'Gong', 'Chorus',
    'Zoom', 'Microsoft Teams', 'Slack', 'Pipedrive', 'Salesforce', 'HubSpot',
]

const SocialProof = ({ mode }: { mode: Mode }) => {
    return (
        <section className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        <span className="text-xs font-medium text-[#9CA3AF] tracking-wide">Testimonials</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#F5F5F5] tracking-[-0.015em] leading-tight mb-4">
                        What top sales teams say
                    </h2>
                    <p className="text-[#6B7280] max-w-md mx-auto">
                        Revenue teams across industries use RealSales to train faster and close more.
                    </p>
                </div>

                {/* 3-column testimonial grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-300 p-6 flex flex-col"
                        >
                            {/* Quote marks */}
                            <div className="text-4xl leading-none text-white/10 font-serif mb-3 select-none">
                                &ldquo;
                            </div>
                            <p className="text-sm text-[#D1D5DB] leading-relaxed flex-1 mb-6">
                                {t.quote}
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs font-semibold text-[#9CA3AF] shrink-0">
                                    {t.initials}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#F5F5F5]">{t.name}</p>
                                    <p className="text-[10px] text-[#6B7280]">
                                        {t.role}, {t.company}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Integrations marquee */}
                <div className="mt-20 pt-16 border-t border-white/[0.06]">
                    <p className="text-xs text-[#4B5563] text-center mb-8 uppercase tracking-[0.2em]">
                        Works with your existing stack
                    </p>
                    <div className="overflow-hidden">
                        <div className="flex gap-8 items-center">
                            <motion.div
                                className="flex gap-8 items-center shrink-0"
                                animate={{ x: ['0%', '-50%'] }}
                                transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                            >
                                {[...integrationNames, ...integrationNames].map((name, i) => (
                                    <div
                                        key={i}
                                        className="px-5 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-sm text-[#6B7280] font-medium whitespace-nowrap shrink-0"
                                    >
                                        {name}
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SocialProof
