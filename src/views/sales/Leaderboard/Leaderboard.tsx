import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Card,
    Tabs,
    Badge,
    Button,
    Skeleton,
    toast,
    Notification,
} from '@/components/ui'
import Container from '@/components/shared/Container'
import Avatar from '@/components/ui/Avatar'
import { useAppSelector as useAuthSelector } from '@/store/hook'
import {
    TbChevronLeft,
    TbChevronRight,
    TbTrophy,
    TbUsers,
    TbArrowUp,
    TbArrowDown,
    TbMinus,
    TbStar,
    TbChartBar,
    TbCalendar,
    TbSparkles,
    TbCrown,
    TbMedal,
} from 'react-icons/tb'
import { injectReducer } from '@/store'
import leaderboardReducer, {
    useAppSelector,
    useAppDispatch,
    fetchLeaderboard,
    setSelectedMonth,
    resetNotification,
} from './store'
import type { LeaderboardEntry, TeamEntry } from './types'

injectReducer('leaderboard', leaderboardReducer)

/* ─── constants ─────────────────────────────────────────────────── */
const LIMIT = 10
const MAX_LIMIT = 50
const LIMIT_STEP = 10
const BAR_MAX_H = 180 // px — height of the tallest (rank-1) bar

/* ─── helpers ───────────────────────────────────────────────────── */
function getCurrentMonth() {
    return new Date().toISOString().slice(0, 7)
}
function shiftMonth(base: string, delta: number) {
    const [y, m] = base.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function formatMonthLabel(ym: string) {
    const [y, m] = ym.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
    })
}
function getInitials(f: string, l: string) {
    return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase()
}

/* ─── rank-1 gets full height, others scale relative to it ───────── */
const RANK_BAR_RATIO: Record<number, number> = {
    1: 1.0,
    2: 0.72,
    3: 0.55,
}
/* Podium display order: 2 · 1 · 3 */
const PODIUM_ORDER = [2, 1, 3]

/* ─── styles by rank ─────────────────────────────────────────────── */
type RankStyle = {
    barGrad: string
    barGlow: string
    avatarCls: string
    ring: string
    badgeCls: string
    icon: React.ReactNode
    crownColor: string
}
function rankStyle(rank: number): RankStyle {
    if (rank === 1)
        return {
            barGrad: 'from-yellow-300 via-amber-400 to-amber-500',
            barGlow: '0 -8px 32px rgba(251,191,36,0.5)',
            avatarCls: 'bg-yellow-100 text-yellow-700',
            ring: 'ring-yellow-400/70',
            badgeCls: 'bg-yellow-400 text-yellow-900',
            icon: <TbCrown className="text-yellow-400" />,
            crownColor: 'text-yellow-400',
        }
    if (rank === 2)
        return {
            barGrad: 'from-slate-300 via-slate-400 to-slate-500',
            barGlow: '0 -8px 28px rgba(148,163,184,0.4)',
            avatarCls: 'bg-slate-100 text-slate-600',
            ring: 'ring-slate-400/70',
            badgeCls: 'bg-slate-400 text-white',
            icon: <TbMedal className="text-slate-400" />,
            crownColor: 'text-slate-400',
        }
    return {
        barGrad: 'from-orange-300 via-orange-400 to-amber-600',
        barGlow: '0 -8px 28px rgba(251,146,60,0.45)',
        avatarCls: 'bg-orange-100 text-orange-700',
        ring: 'ring-orange-400/70',
        badgeCls: 'bg-orange-500 text-white',
        icon: <TbMedal className="text-orange-400" />,
        crownColor: 'text-orange-400',
    }
}

/* ─── ScoreChange ────────────────────────────────────────────────── */
const ScoreChange = ({ value }: { value: number | null }) => {
    if (value === null)
        return (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-400">
                <TbSparkles className="text-[10px]" />
                New
            </span>
        )
    if (value > 0)
        return (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-500">
                <TbArrowUp className="text-[10px]" />
                {value.toFixed(1)}
            </span>
        )
    if (value < 0)
        return (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-500">
                <TbArrowDown className="text-[10px]" />
                {Math.abs(value).toFixed(1)}
            </span>
        )
    return (
        <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
            <TbMinus className="text-[10px]" />—
        </span>
    )
}

/* ─── Podium bar item type ───────────────────────────────────────── */
type PodiumEntry = {
    rank: number
    initials: string
    name: string
    subtitle: string
    score: number
    change: number | null
}

/* ─── Single podium column ───────────────────────────────────────── */
const PodiumBar = ({
    entry,
    delay,
}: {
    entry: PodiumEntry
    delay: number
}) => {
    const s = rankStyle(entry.rank)
    const barH = Math.round((RANK_BAR_RATIO[entry.rank] ?? 0.5) * BAR_MAX_H)
    const avatarSize = entry.rank === 1 ? 60 : 48

    return (
        <motion.div
            className="flex flex-col items-center justify-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.45, ease: 'easeOut' }}
        >
            {/* Rank icon + avatar */}
            <div className="relative mb-2">
                <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xl z-10 ${s.crownColor}`}
                >
                    {s.icon}
                </span>
                <Avatar
                    size={avatarSize}
                    shape="circle"
                    className={`mt-2 ring-4 font-bold ${s.ring} ${s.avatarCls}`}
                >
                    {entry.initials}
                </Avatar>
                <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-black px-1 shadow ${s.badgeCls}`}
                >
                    {entry.rank}
                </span>
            </div>

            {/* Name + team */}
            <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white text-center truncate w-full px-1">
                {entry.name.split(' ')[0]}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center truncate w-full px-1">
                {entry.subtitle}
            </p>

            {/* Score + change */}
            <div className="flex items-baseline gap-1 mt-1 mb-2">
                <span className="text-base font-extrabold text-gray-900 dark:text-white">
                    {entry.score.toFixed(1)}
                </span>
                <ScoreChange value={entry.change} />
            </div>

            {/* Animated bar — grows from bottom, no wrapper so no dead gap */}
            <motion.div
                className={`w-16 sm:w-24 rounded-t-2xl bg-gradient-to-t ${s.barGrad} relative overflow-hidden`}
                style={{ boxShadow: s.barGlow }}
                initial={{ height: 0 }}
                animate={{ height: barH }}
                transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                    delay: delay + 0.1,
                }}
            >
                {/* Shine streak */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent w-1/2 rounded-tr-2xl" />
                {/* Rank label inside bar */}
                <span className="absolute top-3 left-1/2 -translate-x-1/2 text-white/80 font-black text-sm drop-shadow">
                    #{entry.rank}
                </span>
            </motion.div>
        </motion.div>
    )
}

/* ─── Top-3 podium ───────────────────────────────────────────────── */
const Podium = ({ entries }: { entries: PodiumEntry[] }) => {
    if (entries.length === 0) return null

    // Sort into display order: 2, 1, 3
    const ordered = PODIUM_ORDER.map((r) =>
        entries.find((e) => e.rank === r),
    ).filter(Boolean) as PodiumEntry[]

    // If fewer than 3, just show what we have left-to-right by rank
    const displayList =
        ordered.length === entries.length
            ? ordered
            : entries.slice().sort((a, b) => a.rank - b.rank)

    return (
        <div className="rounded-2xl bg-gray-100/80 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 sm:px-8 pt-8 pb-0 overflow-hidden">
            <div
                className="flex items-end justify-center"
                style={{ height: BAR_MAX_H + 180, gap: '50px' }}
            >
                {displayList.map((e, i) => (
                    <PodiumBar
                        key={e.rank}
                        entry={e}
                        delay={
                            /* centre bar last for drama */
                            e.rank === 1 ? 0.15 : i * 0.08
                        }
                    />
                ))}
            </div>
        </div>
    )
}

/* ─── UserRow ────────────────────────────────────────────────────── */
const UserRow = ({
    entry,
    isMe,
    delay = 0,
}: {
    entry: LeaderboardEntry
    isMe?: boolean
    delay?: number
}) => (
    <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.25 }}
        className={`flex items-center gap-3 px-3 sm:px-4 py-3 rounded-2xl border transition-all duration-200 ${
            isMe
                ? 'bg-primary/5 border-primary/25 ring-1 ring-primary/15'
                : 'bg-gray-100/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-primary/40 hover:shadow-sm'
        }`}
    >
        {/* Rank */}
        <div className="w-8 shrink-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                #{entry.rank}
            </span>
        </div>

        <Avatar
            size={38}
            shape="circle"
            className={`shrink-0 font-semibold text-sm ${
                isMe ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
            }`}
        >
            {getInitials(entry.first_name, entry.last_name)}
        </Avatar>

        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {entry.first_name} {entry.last_name}
                </span>
                {isMe && (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-primary bg-primary/10 rounded-full px-1.5 py-0.5 shrink-0">
                        You
                    </span>
                )}
                {entry.teams.length > 0 ? (
                    entry.teams.map((t) => (
                        <Badge
                            key={t}
                            className="text-[10px] font-medium bg-primary/8 text-primary border-0 px-1.5 py-0.5 shrink-0"
                        >
                            {t}
                        </Badge>
                    ))
                ) : (
                    <span className="text-[10px] text-gray-400 italic">
                        No team
                    </span>
                )}
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                {entry.email}
            </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-5 shrink-0">
            <div className="hidden md:flex flex-col items-center gap-0">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <TbStar className="text-amber-400 text-xs" />
                    {entry.best_score.toFixed(0)}
                </span>
                <span className="text-[9px] text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    PB
                </span>
            </div>
            <div className="hidden md:flex flex-col items-center gap-0">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <TbChartBar className="text-blue-400 text-xs" />
                    {entry.sessions_count}
                </span>
                <span className="text-[9px] text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    sessions
                </span>
            </div>
            <div className="text-right min-w-[52px]">
                <p className="text-base font-extrabold text-gray-900 dark:text-white leading-none">
                    {entry.avg_score.toFixed(1)}
                </p>
                <div className="mt-1 flex justify-end">
                    <ScoreChange value={entry.score_change} />
                </div>
            </div>
        </div>
    </motion.div>
)

/* ─── TeamRow ────────────────────────────────────────────────────── */
const TeamRow = ({
    entry,
    delay = 0,
}: {
    entry: TeamEntry
    delay?: number
}) => (
    <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.25 }}
        className="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-2xl border bg-gray-100/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-primary/40 hover:shadow-sm transition-all duration-200"
    >
        <div className="w-8 shrink-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                #{entry.rank}
            </span>
        </div>

        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 shrink-0">
            <TbUsers className="text-primary" />
        </div>

        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {entry.team_name}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
                {entry.active_members} member
                {entry.active_members !== 1 ? 's' : ''} ·{' '}
                {entry.sessions_count} session
                {entry.sessions_count !== 1 ? 's' : ''}
            </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-5 shrink-0">
            <div className="hidden md:flex flex-col items-center gap-0">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <TbStar className="text-amber-400 text-xs" />
                    {entry.best_score.toFixed(0)}
                </span>
                <span className="text-[9px] text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    best
                </span>
            </div>
            <div className="text-right min-w-[52px]">
                <p className="text-base font-extrabold text-gray-900 dark:text-white leading-none">
                    {entry.avg_score.toFixed(1)}
                </p>
                <div className="mt-1 flex justify-end">
                    <ScoreChange value={entry.score_change} />
                </div>
            </div>
        </div>
    </motion.div>
)

/* ─── misc ───────────────────────────────────────────────────────── */
const Divider = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3 my-4">
        <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-600" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {label}
        </span>
        <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-600" />
    </div>
)

const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center mb-4">
            <TbTrophy className="text-3xl text-primary/40" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
)

const PodiumSkeleton = () => (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-800/50 px-8 pt-8 pb-0">
        <div className="flex items-end gap-6 justify-center" style={{ height: BAR_MAX_H + 120 }}>
            {[0.72, 1.0, 0.55].map((ratio, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                    <Skeleton variant="circle" className="w-12 h-12 mb-2" />
                    <Skeleton className="h-2.5 w-14 rounded" />
                    <Skeleton className="h-2 w-10 rounded" />
                    <Skeleton
                        className="w-full max-w-[56px] rounded-t-2xl"
                        style={{ height: Math.round(ratio * BAR_MAX_H) }}
                    />
                </div>
            ))}
        </div>
    </div>
)

const ListSkeleton = () => (
    <div className="flex flex-col gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
            <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700"
            >
                <Skeleton className="w-6 h-4 rounded" />
                <Skeleton variant="circle" className="w-9 h-9" />
                <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-3 w-1/3 rounded" />
                    <Skeleton className="h-2 w-1/2 rounded" />
                </div>
                <Skeleton className="h-5 w-10 rounded" />
            </div>
        ))}
    </div>
)

/* ─── Leaderboard page ───────────────────────────────────────────── */
const Leaderboard = () => {
    const dispatch = useAppDispatch()
    const currentUserId = useAuthSelector(
        (state) => state.auth?.user?.userId as string | undefined,
    )

    const { loading, data, selectedMonth, initialized, notification } =
        useAppSelector(
            (state) =>
                state.leaderboard?.data ?? {
                    loading: false,
                    initialized: false,
                    selectedMonth: getCurrentMonth(),
                    data: null,
                    error: null,
                    notification: null,
                },
        )

    const [limit, setLimit] = useState(LIMIT)
    const currentMonth = getCurrentMonth()
    const isCurrentMonth = selectedMonth === currentMonth

    useEffect(() => {
        setLimit(LIMIT)
    }, [selectedMonth])

    useEffect(() => {
        dispatch(fetchLeaderboard({ month: selectedMonth, limit }))
    }, [dispatch, selectedMonth, limit])

    useEffect(() => {
        if (notification) {
            const type = (notification.type || 'info') as
                | 'success'
                | 'warning'
                | 'danger'
                | 'info'
            toast.push(
                <Notification
                    title={type.charAt(0).toUpperCase() + type.slice(1)}
                    type={type}
                >
                    {notification.message}
                </Notification>,
            )
            dispatch(resetNotification())
        }
    }, [notification, dispatch])

    const handlePrev = () =>
        dispatch(setSelectedMonth(shiftMonth(selectedMonth, -1)))
    const handleNext = () => {
        if (!isCurrentMonth)
            dispatch(setSelectedMonth(shiftMonth(selectedMonth, 1)))
    }
    const handleLoadMore = () =>
        setLimit((p) => Math.min(p + LIMIT_STEP, MAX_LIMIT))

    // Top-3 podium entries
    const top3Users: PodiumEntry[] = (data?.entries ?? [])
        .filter((e) => e.rank <= 3)
        .map((e) => ({
            rank: e.rank,
            initials: getInitials(e.first_name, e.last_name),
            name: `${e.first_name} ${e.last_name}`,
            subtitle: e.teams[0] ?? 'No team',
            score: e.avg_score,
            change: e.score_change,
        }))

    const restUsers = (data?.entries ?? []).filter((e) => e.rank > 3)

    const top3Teams: PodiumEntry[] = (data?.team_entries ?? [])
        .filter((t) => t.rank <= 3)
        .map((t) => ({
            rank: t.rank,
            initials: t.team_name.slice(0, 2).toUpperCase(),
            name: t.team_name,
            subtitle: `${t.active_members} members`,
            score: t.avg_score,
            change: t.score_change,
        }))

    const restTeams = (data?.team_entries ?? []).filter((t) => t.rank > 3)

    const showPinnedUser =
        data?.current_user_entry &&
        data.current_user_rank !== null &&
        data.current_user_rank > data.entries.length

    const canLoadMore = Boolean(
        data &&
            data.entries.length < Math.min(data.total_participants, MAX_LIMIT),
    )

    const isCurrentUser = (userId: string) =>
        data?.current_user_entry?.user_id === userId ||
        userId === currentUserId

    return (
        <Container>
            <div className="flex flex-col gap-5">

                {/* ── Hero header ─────────────────────────────────── */}
                <div
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-deep p-6 sm:p-8 shadow-xl"
                    data-tour-id="leaderboard-page"
                >
                    <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-16 -left-8 w-60 h-60 rounded-full bg-black/10 blur-3xl pointer-events-none" />
                    <TbTrophy className="absolute right-4 bottom-0 text-white/8 text-[160px] pointer-events-none select-none" />

                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm">
                                <TbTrophy className="text-3xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    Leaderboard
                                </h1>
                                <p className="text-sm text-white/75 mt-0.5">
                                    {initialized && data
                                        ? `${data.total_participants} participant${data.total_participants !== 1 ? 's' : ''} · ${formatMonthLabel(selectedMonth)}`
                                        : 'Loading rankings…'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Rank chip */}
                            {initialized && data && (
                                <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2.5">
                                    <TbStar className="text-yellow-300 text-xl shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-white/65 uppercase tracking-widest font-semibold">
                                            Your rank
                                        </p>
                                        <p className="text-lg font-extrabold text-white leading-none">
                                            {data.current_user_rank !== null
                                                ? `#${data.current_user_rank}`
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Month nav */}
                            <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-2xl p-1 gap-0.5">
                                <Button
                                    size="sm"
                                    variant="plain"
                                    icon={<TbChevronLeft />}
                                    onClick={handlePrev}
                                    className="!p-2 !text-white rounded-xl hover:!bg-white/20"
                                />
                                <div className="flex items-center gap-1.5 px-2 min-w-[116px] justify-center">
                                    <TbCalendar className="text-white/70 text-sm shrink-0" />
                                    <span className="text-sm font-semibold text-white whitespace-nowrap">
                                        {formatMonthLabel(selectedMonth)}
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="plain"
                                    icon={<TbChevronRight />}
                                    onClick={handleNext}
                                    disabled={isCurrentMonth}
                                    className="!p-2 !text-white rounded-xl hover:!bg-white/20 disabled:opacity-35 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main card ────────────────────────────────────── */}
                <Card
                    className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm"
                    bodyClass="!p-0"
                >
                    {loading && !initialized ? (
                        <div className="p-4 flex flex-col gap-4">
                            <PodiumSkeleton />
                            <ListSkeleton />
                        </div>
                    ) : (
                        <Tabs defaultValue="users">
                            <div className="px-4 pt-4">
                                <Tabs.TabList>
                                    <Tabs.TabNav value="users">
                                        <span className="flex items-center gap-1.5">
                                            <TbUsers className="text-sm" />
                                            Users
                                            {data && (
                                                <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                                                    {data.entries.length}
                                                </span>
                                            )}
                                        </span>
                                    </Tabs.TabNav>
                                    <Tabs.TabNav value="teams">
                                        <span className="flex items-center gap-1.5">
                                            <TbTrophy className="text-sm" />
                                            Teams
                                            {data && (
                                                <span className="text-[10px] font-bold bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                                                    {data.team_entries.length}
                                                </span>
                                            )}
                                        </span>
                                    </Tabs.TabNav>
                                </Tabs.TabList>
                            </div>

                            {/* ── Users tab ── */}
                            <Tabs.TabContent value="users">
                                <div className="p-3 sm:p-4 flex flex-col gap-3">
                                    {initialized && data ? (
                                        data.entries.length > 0 ? (
                                            <>
                                                {/* Top-3 podium bars */}
                                                {top3Users.length > 0 && (
                                                    <Podium entries={top3Users} />
                                                )}

                                                {/* Full ranked list */}
                                                {data.entries.length > 0 && (
                                                    <div className="flex flex-col gap-1.5 mt-2">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-0.5">
                                                            Full Rankings
                                                        </p>
                                                        {data.entries.map(
                                                            (e, i) => (
                                                                <UserRow
                                                                    key={e.user_id}
                                                                    entry={e}
                                                                    isMe={isCurrentUser(e.user_id)}
                                                                    delay={i * 0.04}
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                )}

                                                {/* Load more + count */}
                                                <div className="flex flex-col items-center gap-2 pt-1">
                                                    {canLoadMore && (
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            loading={loading}
                                                            onClick={handleLoadMore}
                                                            className="rounded-full px-6"
                                                        >
                                                            Load more
                                                        </Button>
                                                    )}
                                                    <p className="text-[11px] text-gray-400">
                                                        Showing {data.entries.length} of {data.total_participants} participant{data.total_participants !== 1 ? 's' : ''}
                                                    </p>
                                                </div>

                                                {/* Pinned current user */}
                                                {showPinnedUser && data.current_user_entry && (
                                                    <>
                                                        <Divider label="Your position" />
                                                        <UserRow
                                                            entry={data.current_user_entry}
                                                            isMe
                                                        />
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <EmptyState message="No participants this month yet." />
                                        )
                                    ) : initialized ? (
                                        <EmptyState message="Could not load leaderboard." />
                                    ) : null}
                                </div>
                            </Tabs.TabContent>

                            {/* ── Teams tab ── */}
                            <Tabs.TabContent value="teams">
                                <div className="p-3 sm:p-4 flex flex-col gap-3">
                                    {initialized && data ? (
                                        data.team_entries.length > 0 ? (
                                            <>
                                                {top3Teams.length > 0 && (
                                                    <Podium entries={top3Teams} />
                                                )}
                                                {data.team_entries.length > 0 && (
                                                    <div className="flex flex-col gap-1.5 mt-2">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-0.5">
                                                            All Teams
                                                        </p>
                                                        {data.team_entries.map(
                                                            (t, i) => (
                                                                <TeamRow
                                                                    key={t.team_id}
                                                                    entry={t}
                                                                    delay={i * 0.04}
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <EmptyState message="No team activity this month yet." />
                                        )
                                    ) : initialized ? (
                                        <EmptyState message="Could not load leaderboard." />
                                    ) : null}
                                </div>
                            </Tabs.TabContent>
                        </Tabs>
                    )}
                </Card>
            </div>
        </Container>
    )
}

export default Leaderboard
