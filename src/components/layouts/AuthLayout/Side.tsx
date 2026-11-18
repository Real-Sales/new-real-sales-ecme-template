import { cloneElement, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { TbCheck } from 'react-icons/tb'
import SalesWanaLogo from '@/components/template/SalesWanaLogo'
import { AuthCard, AuthPage, useAuthTheme } from './AuthShell'
import type { CommonProps } from '@/@types/common'

type SideProps = CommonProps

const POINTS = [
    'Practise real buyer conversations by voice',
    'AI personas that push back like real decision-makers',
    'A scored report after every session',
]

const STATS = [
    { value: '12,400+', label: 'Training sessions run' },
    { value: '+34%', label: 'Average win rate increase' },
    { value: '4.8x', label: 'Average reported ROI' },
]

/** Smallest the form card is shrunk to before the column scrolls instead. */
const MIN_FIT = 0.72
/** Largest it grows to on tall screens, and the screen height at which it is shown at its designed size. */
const MAX_GROW = 1.25
const BASE_HEIGHT = 900

/** Sizes the form card to the screen: it grows with the screen height on tall screens (the same amount on
 * every auth page), and when it is taller than the space it has it is scaled down to fit (never below
 * MIN_FIT) instead of growing a scrollbar. Phones are left alone: there the on-screen keyboard changes the
 * screen height, and the page simply scrolls. */
function useFitScale() {
    const boxRef = useRef<HTMLDivElement>(null)
    const cardRef = useRef<HTMLDivElement>(null)
    const [fit, setFit] = useState({ scale: 1, trim: 0 })

    useLayoutEffect(() => {
        const box = boxRef.current
        const card = cardRef.current
        if (!box || !card) return
        const wide = window.matchMedia('(min-width: 768px)')
        const measure = () => {
            // offsetHeight ignores transforms, so this is always the card's natural height
            const natural = card.offsetHeight
            const available = box.clientHeight
            const grow = Math.min(MAX_GROW, Math.max(1, window.innerHeight / BASE_HEIGHT))
            const room = Math.min(available / natural, box.clientWidth / card.offsetWidth)
            const scale = wide.matches ? Math.max(MIN_FIT, Math.min(grow, room)) : 1
            // Layout still reserves the natural height; trim the difference so nothing extra scrolls
            const trim = (natural * (1 - scale)) / 2
            setFit((prev) =>
                Math.abs(prev.scale - scale) < 0.002 && Math.abs(prev.trim - trim) < 0.5 ? prev : { scale, trim },
            )
        }
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(box)
        ro.observe(card)
        wide.addEventListener('change', measure)
        return () => {
            ro.disconnect()
            wide.removeEventListener('change', measure)
        }
    }, [])

    return { boxRef, cardRef, fit }
}

const Side = ({ children, ...rest }: SideProps) => {
    const t = useAuthTheme()
    const { boxRef, cardRef, fit } = useFitScale()

    return (
        <AuthPage className="flex h-full gap-6 p-4 sm:p-6">
            {/* Scrolls only as a last resort (phones, or screens too short even for the smallest fit) */}
            <div
                ref={boxRef}
                className="flex-1 min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {/* At least as tall as the column, so the card is centred; grows (and scrolls) if it cannot fit */}
                <div className="flex min-h-full items-center justify-center">
                <div
                    ref={cardRef}
                    className="w-full max-w-[470px]"
                    style={
                        fit.scale !== 1
                            ? {
                                  transform: `scale(${fit.scale})`,
                                  marginTop: -fit.trim,
                                  marginBottom: -fit.trim,
                              }
                            : undefined
                    }
                >
                    <AuthCard className="w-full px-6 py-8 sm:px-9 sm:py-10">
                        {children
                            ? cloneElement(children as React.ReactElement, {
                                  ...rest,
                              })
                            : null}
                    </AuthCard>
                </div>
                </div>
            </div>

            {/* Brand panel, laptop and up */}
            <AuthCard className="hidden lg:flex flex-1 flex-col justify-between overflow-hidden px-10 py-10 xl:px-14 xl:py-12 xl:max-w-[560px] 2xl:max-w-[720px]">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[520px] -translate-x-1/2"
                    style={{
                        background:
                            'radial-gradient(50% 50% at 50% 50%, rgba(12,175,96,0.28), rgba(34,211,238,0.06) 60%, transparent 100%)',
                    }}
                />
                <Link to="/" className="relative inline-flex w-fit">
                    <SalesWanaLogo mode={t.isLight ? 'light' : 'dark'} type="full" iconSize={44} textSize="1.6rem" />
                </Link>

                <div className="relative">
                    <span
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide"
                        style={{
                            color: t.textMuted,
                            border: `1px solid ${t.border}`,
                            backgroundColor: t.surface,
                        }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.accent }} />
                        AI-POWERED SALES TRAINING
                    </span>
                    <h1
                        className="mt-6 text-4xl xl:text-5xl font-bold tracking-[-0.02em] leading-[1.05]"
                        style={{ color: t.text }}
                    >
                        Train Smarter
                        <br />
                        <span
                            style={{
                                backgroundImage: 'linear-gradient(90deg, #34C779, #22d3ee)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                            }}
                        >
                            Close Faster
                        </span>
                    </h1>
                    <ul className="mt-8 space-y-3.5">
                        {POINTS.map((point) => (
                            <li key={point} className="flex items-start gap-3 text-sm" style={{ color: t.textSecondary }}>
                                <span
                                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                                    style={{ backgroundColor: t.accentSubtle, border: `1px solid ${t.border}` }}
                                >
                                    <TbCheck size={13} style={{ color: t.accent }} />
                                </span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative grid grid-cols-3 border-t" style={{ borderColor: t.border }}>
                    {STATS.map((stat, i) => (
                        <div
                            key={stat.label}
                            className={`pt-6 ${i > 0 ? 'border-l pl-5' : 'pr-5'}`}
                            style={{ borderColor: t.border }}
                        >
                            <div className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: t.text }}>
                                {stat.value}
                            </div>
                            <div className="mt-1 text-xs" style={{ color: t.textFaint }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </AuthCard>
        </AuthPage>
    )
}

export default Side
