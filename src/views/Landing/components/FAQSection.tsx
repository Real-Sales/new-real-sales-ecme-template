import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TbPlus, TbMinus } from 'react-icons/tb'

const faqs = [
    {
        question: 'How is RealSales different from role-playing with a colleague?',
        answer:
            'Colleagues avoid being too harsh, forget to stay in character, and are unavailable at 11pm before a big demo. The RealSales AI buyer is always skeptical, never breaks character, and is available on demand. It also scores your performance objectively, which no colleague can do consistently.',
    },
    {
        question: 'What types of sales scenarios can I practice?',
        answer:
            'Cold outreach, warm discovery, objection handling, pricing negotiations, multi-stakeholder meetings, and closing. You can also upload your own product documentation so the AI buyer challenges you on your specific offering instead of a generic product.',
    },
    {
        question: 'How realistic is the AI buyer behavior?',
        answer:
            'Each AI buyer has a unique persona with defined seniority, industry context, buying authority, and skepticism level. They go off-script, push back on vague answers, ask follow-up questions, and behave the way real decision-makers behave when they are not yet sold.',
    },
    {
        question: 'Does it work for enterprise sales teams of 50 or more reps?',
        answer:
            'Yes. The Enterprise plan includes custom AI buyer training on your specific products, a branded scenario library, advanced team analytics, CRM integrations, SSO, and a dedicated success manager to ensure adoption.',
    },
    {
        question: 'How long does a typical training session take?',
        answer:
            'Most sessions run between 8 and 20 minutes. You can do a focused cold call practice in under 10 minutes, or run a full discovery session with multiple objection cycles in 20 to 30 minutes. Sessions fit inside a lunch break or between calls.',
    },
    {
        question: 'What does the performance scoring actually measure?',
        answer:
            'Confidence score based on vocal tone and pacing, objection quality scoring how well you handled each pushback, talk-to-listen ratio, close attempt rate, and specific timestamps flagging where momentum dropped. Managers get aggregated versions of this across their whole team.',
    },
    {
        question: 'Can I create custom scenarios specific to my industry?',
        answer:
            'On the Professional and Enterprise plans, yes. Upload product docs, competitive battle cards, or CRM notes and RealSales will train the AI buyer to challenge you on your actual differentiators, pricing objections, and common deal blockers.',
    },
    {
        question: 'What integrations are currently supported?',
        answer:
            'Native integrations with Salesforce, HubSpot, Outreach, Salesloft, and Gong. Coaching data and session summaries can be pushed directly to your CRM. Slack notifications for manager alerts are also available on the Professional plan.',
    },
]

const FAQItem = ({ faq, index }: { faq: (typeof faqs)[0]; index: number }) => {
    const [open, setOpen] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                aria-expanded={open}
            >
                <span
                    className={[
                        'text-sm font-medium leading-snug transition-colors duration-200',
                        open ? 'text-[#F5F5F5]' : 'text-[#9CA3AF] group-hover:text-[#F5F5F5]',
                    ].join(' ')}
                >
                    {faq.question}
                </span>
                <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/[0.1] shrink-0 transition-all duration-200 group-hover:border-white/[0.2]">
                    {open ? (
                        <TbMinus size={12} className="text-[#9CA3AF]" />
                    ) : (
                        <TbPlus size={12} className="text-[#6B7280]" />
                    )}
                </div>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="text-sm text-[#6B7280] leading-relaxed pb-5 max-w-2xl">
                            {faq.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-px bg-white/[0.06]" />
        </motion.div>
    )
}

const FAQSection = () => {
    return (
        <section id="faq" className="py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-[320px_1fr] gap-16 xl:gap-24">
                    {/* Left - sticky header */}
                    <div className="lg:sticky lg:top-28 h-fit">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-5">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                            <span className="text-xs font-medium text-[#9CA3AF] tracking-wide">FAQ</span>
                        </div>
                        <h2 className="text-3xl font-bold text-[#F5F5F5] tracking-[-0.015em] leading-tight mb-4">
                            Questions we hear a lot
                        </h2>
                        <p className="text-sm text-[#6B7280] leading-relaxed">
                            Still have questions? Email us at{' '}
                            <a
                                href="mailto:hello@realsales.ai"
                                className="text-[#9CA3AF] hover:text-[#F5F5F5] transition-colors underline underline-offset-2"
                            >
                                hello@realsales.ai
                            </a>
                        </p>
                    </div>

                    {/* Right - accordion */}
                    <div>
                        <div className="h-px bg-white/[0.06] mb-0" />
                        {faqs.map((faq, i) => (
                            <FAQItem key={i} faq={faq} index={i} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FAQSection
