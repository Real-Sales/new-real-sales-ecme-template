import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
    { value: 12400, suffix: '+', label: 'Training sessions run', prefix: '' },
    { value: 34, suffix: '%', label: 'Average win rate increase', prefix: '+' },
    { value: 180, suffix: '+', label: 'Revenue teams onboarded', prefix: '' },
    { value: 4.8, suffix: 'x', label: 'Average reported ROI', prefix: '' },
]

function useCountUp(target: number, duration: number, start: boolean) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!start) return
        const isDecimal = target % 1 !== 0
        const steps = 60
        const stepTime = (duration * 1000) / steps
        let current = 0
        const increment = target / steps

        const timer = setInterval(() => {
            current = Math.min(current + increment, target)
            setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.round(current))
            if (current >= target) clearInterval(timer)
        }, stepTime)

        return () => clearInterval(timer)
    }, [target, duration, start])

    return count
}

const StatItem = ({
    stat,
    index,
    started,
}: {
    stat: (typeof stats)[0]
    index: number
    started: boolean
}) => {
    const count = useCountUp(stat.value, 1.4, started)

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center px-6 py-8"
        >
            <span className="text-4xl md:text-5xl font-bold text-[#F5F5F5] tracking-[-0.02em] tabular-nums">
                {stat.prefix}
                {stat.value % 1 !== 0 ? count.toFixed(1) : count.toLocaleString()}
                {stat.suffix}
            </span>
            <span className="mt-2 text-sm text-[#6B7280] font-medium">{stat.label}</span>
        </motion.div>
    )
}

const StatsSection = () => {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })

    return (
        <section ref={ref} className="py-16 border-y border-white/[0.06]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.06]">
                    {stats.map((stat, i) => (
                        <StatItem key={i} stat={stat} index={i} started={inView} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default StatsSection
