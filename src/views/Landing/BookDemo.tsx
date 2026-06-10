import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TbCheck, TbCalendar, TbClock, TbArrowRight, TbUsers, TbMail, TbBuilding } from 'react-icons/tb'
import { LandingThemeProvider, useLandingTheme } from './LandingThemeProvider'
import NavigationBar from './components/NavigationBar'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import type { Mode } from '@/@types/theme'

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM',
]

const TEAM_SIZES = ['Just me', '2–10', '11–50', '51–200', '200+']

const PROOF_ITEMS = [
    { metric: '3×', label: 'faster ramp for new reps' },
    { metric: '40%', label: 'higher close rates' },
    { metric: '15 min', label: 'to first training session' },
]

// ─── Calendar strip ───────────────────────────────────────────────────────────

function buildDays() {
    const today = new Date()
    const days: { date: Date; label: string; day: string; disabled: boolean }[] = []
    for (let i = 1; i <= 14; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        const dow = d.getDay()
        if (dow === 0 || dow === 6) continue
        days.push({
            date: d,
            label: d.getDate().toString(),
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            disabled: false,
        })
    }
    return days
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function BookDemoContent({ mode, toggleMode }: { mode: Mode; toggleMode: () => void }) {
    const t = useLandingTheme()
    const navigate = useNavigate()

    const [step, setStep] = useState<'form' | 'confirm'>('form')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [company, setCompany] = useState('')
    const [teamSize, setTeamSize] = useState('')
    const [selectedDay, setSelectedDay] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState('')
    const [focused, setFocused] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)

    const days = buildDays()

    const canSubmit = name && email && company && teamSize && selectedDay && selectedTime

    useEffect(() => {
        const prev = document.body.style.backgroundColor
        document.body.style.backgroundColor = t.bg
        return () => { document.body.style.backgroundColor = prev }
    }, [t.bg])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSubmit) return
        setStep('confirm')
    }

    const inputStyle = (field: string) => ({
        backgroundColor: focused === field ? t.bgElevated : t.surface,
        border: `1px solid ${focused === field ? t.accent : t.border}`,
        color: t.text,
        outline: 'none',
        transition: 'border 0.2s, background 0.2s',
    })

    return (
        <div
            className="min-h-screen w-full relative overflow-x-clip flex flex-col transition-colors duration-300"
            style={{ backgroundColor: t.bg, color: t.text, fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
        >
            {/* Subtle background glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute"
                    style={{ width: 800, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(12,175,96,0.045) 0%, transparent 70%)', top: -200, left: '50%', transform: 'translateX(-50%)', filter: 'blur(60px)' }}
                />
                <div
                    className="absolute inset-0 opacity-[0.018]"
                    style={{ backgroundImage: `radial-gradient(${t.isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
                />
            </div>

            {/* ── Nav ── */}
            <NavigationBar mode={mode} toggleMode={toggleMode} />

            {/* ── Body ── */}
            <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-4 md:px-8 py-8 lg:py-12">
                <AnimatePresence mode="wait">
                    {step === 'form' ? (
                        <motion.div
                            key="form"
                            className="w-full"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="grid lg:grid-cols-[1fr_1.35fr] gap-10 xl:gap-20 items-center">

                                {/* ── Left: value prop ── */}
                                <div className="flex flex-col justify-center lg:py-6">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        {/* Badge */}
                                        <div
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-6"
                                            style={{ background: 'rgba(12,175,96,0.09)', border: '1px solid rgba(12,175,96,0.22)', color: '#0CAF60' }}
                                        >
                                            <motion.span
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ background: '#0CAF60' }}
                                                animate={{ opacity: [1, 0.3, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                            30-min session
                                        </div>

                                        <h1 className="text-4xl md:text-5xl xl:text-[3.25rem] font-bold tracking-tight leading-[1.1] mb-5" style={{ color: t.text }}>
                                            See RealSales<br />
                                            <span style={{ color: '#0CAF60' }}>live in 30 min</span>
                                        </h1>

                                        <p className="text-base md:text-lg leading-relaxed mb-10 max-w-md" style={{ color: t.textMuted }}>
                                            We'll show you exactly how your team can practice real conversations and walk into every deal prepared.
                                        </p>

                                        {/* Metrics */}
                                        <div className="flex flex-col gap-4 mb-10">
                                            {PROOF_ITEMS.map((item, i) => (
                                                <motion.div
                                                    key={item.label}
                                                    initial={{ opacity: 0, x: -16 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.35 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                    className="flex items-center gap-4"
                                                >
                                                    <div
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                        style={{ background: 'rgba(12,175,96,0.1)', border: '1px solid rgba(12,175,96,0.2)' }}
                                                    >
                                                        <TbCheck size={16} style={{ color: '#0CAF60' }} />
                                                    </div>
                                                    <div>
                                                        <span className="text-lg font-bold mr-2 tracking-tight" style={{ color: '#0CAF60' }}>{item.metric}</span>
                                                        <span className="text-sm" style={{ color: t.textMuted }}>{item.label}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Social proof avatars */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.7 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex -space-x-2">
                                                {['JD', 'SM', 'AR', 'KL'].map((ini) => (
                                                    <div
                                                        key={ini}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
                                                        style={{
                                                            background: t.isLight
                                                                ? 'linear-gradient(135deg, #e6f9f1, #d1f5e6)'
                                                                : 'linear-gradient(135deg, rgba(12,175,96,0.2), rgba(12,175,96,0.08))',
                                                            border: `2px solid ${t.bg}`,
                                                            color: '#0CAF60',
                                                        }}
                                                    >
                                                        {ini}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs" style={{ color: t.textFaint }}>
                                                Joined this week by <span style={{ color: t.textMuted, fontWeight: 600 }}>120+ sales teams</span>
                                            </p>
                                        </motion.div>
                                    </motion.div>
                                </div>

                                {/* ── Right: form ── */}
                                <motion.div
                                    className="w-full"
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <form
                                        onSubmit={handleSubmit}
                                        className="rounded-3xl p-7 md:p-9 lg:p-10 w-full"
                                        style={{
                                            backgroundColor: t.isLight ? '#fff' : t.bgElevated,
                                            border: `1px solid ${t.border}`,
                                            boxShadow: t.isLight
                                                ? '0 4px 40px rgba(0,0,0,0.07)'
                                                : '0 4px 40px rgba(0,0,0,0.4)',
                                        }}
                                    >
                                        {/* ── Basic info ── */}
                                        <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: t.textFaint }}>Your info</p>
                                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Full name</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Alex Johnson"
                                                        value={name}
                                                        onChange={e => setName(e.target.value)}
                                                        onFocus={() => setFocused('name')}
                                                        onBlur={() => setFocused(null)}
                                                        required
                                                        className="w-full text-sm rounded-xl px-4 py-3 placeholder:opacity-40"
                                                        style={inputStyle('name')}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Work email</label>
                                                <div className="relative">
                                                    <TbMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.textDim }} />
                                                    <input
                                                        type="email"
                                                        placeholder="alex@company.com"
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        onFocus={() => setFocused('email')}
                                                        onBlur={() => setFocused(null)}
                                                        required
                                                        className="w-full text-sm rounded-xl px-4 py-3 pl-9 placeholder:opacity-40"
                                                        style={inputStyle('email')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4 mb-8">
                                            <div>
                                                <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Company</label>
                                                <div className="relative">
                                                    <TbBuilding size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.textDim }} />
                                                    <input
                                                        type="text"
                                                        placeholder="Acme Corp"
                                                        value={company}
                                                        onChange={e => setCompany(e.target.value)}
                                                        onFocus={() => setFocused('company')}
                                                        onBlur={() => setFocused(null)}
                                                        required
                                                        className="w-full text-sm rounded-xl px-4 py-3 pl-9 placeholder:opacity-40"
                                                        style={inputStyle('company')}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>
                                                    <TbUsers size={13} className="inline mr-1 -mt-0.5" />
                                                    Team size
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {TEAM_SIZES.map(s => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => setTeamSize(s)}
                                                            className="text-xs px-3 py-2 rounded-lg font-medium transition-all duration-150"
                                                            style={{
                                                                background: teamSize === s ? 'rgba(12,175,96,0.12)' : t.surface,
                                                                border: teamSize === s ? '1px solid rgba(12,175,96,0.35)' : `1px solid ${t.border}`,
                                                                color: teamSize === s ? '#0CAF60' : t.textMuted,
                                                            }}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Date ── */}
                                        <div className="mb-7">
                                            <p className="text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: t.textFaint }}>
                                                <TbCalendar size={13} />
                                                Pick a date
                                            </p>
                                            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                                {days.map((d) => {
                                                    const isSelected = selectedDay?.toDateString() === d.date.toDateString()
                                                    return (
                                                        <button
                                                            key={d.date.toISOString()}
                                                            type="button"
                                                            onClick={() => setSelectedDay(d.date)}
                                                            className="flex-shrink-0 flex flex-col items-center gap-1 px-3.5 py-3 rounded-2xl transition-all duration-200"
                                                            style={{
                                                                minWidth: 56,
                                                                background: isSelected ? 'rgba(12,175,96,0.12)' : t.surface,
                                                                border: isSelected ? '1px solid rgba(12,175,96,0.35)' : `1px solid ${t.border}`,
                                                                boxShadow: isSelected ? '0 0 12px rgba(12,175,96,0.15)' : 'none',
                                                            }}
                                                        >
                                                            <span className="text-[10px] font-medium uppercase" style={{ color: isSelected ? '#0CAF60' : t.textFaint }}>
                                                                {d.day}
                                                            </span>
                                                            <span className="text-base font-bold tracking-tight" style={{ color: isSelected ? '#0CAF60' : t.text }}>
                                                                {d.label}
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* ── Time ── */}
                                        <AnimatePresence>
                                            {selectedDay && (
                                                <motion.div
                                                    key="time"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                                    className="overflow-hidden mb-8"
                                                >
                                                    <p className="text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: t.textFaint }}>
                                                        <TbClock size={13} />
                                                        Available times <span style={{ color: t.textDim, textTransform: 'none', letterSpacing: 0 }}>· {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                                    </p>
                                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                                        {TIME_SLOTS.map(slot => {
                                                            const isSelected = selectedTime === slot
                                                            return (
                                                                <button
                                                                    key={slot}
                                                                    type="button"
                                                                    onClick={() => setSelectedTime(slot)}
                                                                    className="text-xs font-medium py-2.5 rounded-xl transition-all duration-150"
                                                                    style={{
                                                                        background: isSelected ? 'rgba(12,175,96,0.12)' : t.surface,
                                                                        border: isSelected ? '1px solid rgba(12,175,96,0.35)' : `1px solid ${t.border}`,
                                                                        color: isSelected ? '#0CAF60' : t.textMuted,
                                                                        boxShadow: isSelected ? '0 0 10px rgba(12,175,96,0.12)' : 'none',
                                                                    }}
                                                                >
                                                                    {slot}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* ── Submit ── */}
                                        <motion.button
                                            type="submit"
                                            disabled={!canSubmit}
                                            whileHover={canSubmit ? { scale: 1.02 } : {}}
                                            whileTap={canSubmit ? { scale: 0.98 } : {}}
                                            className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-200"
                                            style={{
                                                background: canSubmit
                                                    ? 'linear-gradient(135deg, #0CAF60, #088d50)'
                                                    : t.surface,
                                                color: canSubmit ? '#fff' : t.textDim,
                                                border: canSubmit ? 'none' : `1px solid ${t.border}`,
                                                boxShadow: canSubmit ? '0 0 24px rgba(12,175,96,0.3)' : 'none',
                                                cursor: canSubmit ? 'pointer' : 'not-allowed',
                                            }}
                                        >
                                            Confirm demo booking
                                            <TbArrowRight size={16} />
                                        </motion.button>
                                    </form>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        /* ── Confirmation screen ── */
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-lg w-full mx-auto py-8 text-center"
                        >
                            {/* Success ring */}
                            <div className="relative inline-flex items-center justify-center mb-8">
                                <motion.div
                                    className="absolute inset-0 rounded-full"
                                    style={{ border: '1px solid rgba(12,175,96,0.3)' }}
                                    animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                                />
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                                    className="w-20 h-20 rounded-full flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, rgba(12,175,96,0.2), rgba(12,175,96,0.06))', border: '1px solid rgba(12,175,96,0.3)' }}
                                >
                                    <TbCheck size={36} style={{ color: '#0CAF60' }} strokeWidth={2.5} />
                                </motion.div>
                            </div>

                            <motion.h2
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.5 }}
                                className="text-3xl font-bold tracking-tight mb-3"
                                style={{ color: t.text }}
                            >
                                You're booked!
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35, duration: 0.5 }}
                                className="text-base mb-8"
                                style={{ color: t.textMuted }}
                            >
                                We'll see you on{' '}
                                <span style={{ color: t.text, fontWeight: 600 }}>
                                    {selectedDay?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>{' '}
                                at <span style={{ color: t.text, fontWeight: 600 }}>{selectedTime}</span>.
                                <br />A calendar invite is on its way to <span style={{ color: t.text, fontWeight: 600 }}>{email}</span>.
                            </motion.p>

                            {/* Booking summary card */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45, duration: 0.5 }}
                                className="rounded-2xl p-6 mb-8 text-left"
                                style={{
                                    background: t.isLight ? t.bgCard : t.bgElevated,
                                    border: `1px solid ${t.border}`,
                                }}
                            >
                                {[
                                    ['Name', name],
                                    ['Company', company],
                                    ['Date', selectedDay?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) ?? ''],
                                    ['Time', selectedTime],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${t.border}` }}>
                                        <span className="text-xs font-medium" style={{ color: t.textFaint }}>{label}</span>
                                        <span className="text-sm font-semibold" style={{ color: t.text }}>{value}</span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between pt-2.5">
                                    <span className="text-xs font-medium" style={{ color: t.textFaint }}>Duration</span>
                                    <span className="text-sm font-semibold" style={{ color: t.text }}>30 minutes</span>
                                </div>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                onClick={() => navigate('/landing')}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
                                style={{
                                    background: 'rgba(12,175,96,0.1)',
                                    border: '1px solid rgba(12,175,96,0.25)',
                                    color: '#0CAF60',
                                }}
                            >
                                Back to home
                                <TbArrowRight size={15} />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// ─── Themed wrapper ───────────────────────────────────────────────────────────

function BookDemo() {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    return (
        <LandingThemeProvider mode={mode}>
            <BookDemoContent mode={mode} toggleMode={toggleMode} />
        </LandingThemeProvider>
    )
}

export default BookDemo
