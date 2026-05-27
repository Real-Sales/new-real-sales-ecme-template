import {
    useCallback,
    useRef,
    type ButtonHTMLAttributes,
    type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import { TbMoon, TbSun } from 'react-icons/tb'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import classNames from '@/utils/classNames'
import type { Mode } from '@/@types/theme'

export type TransitionVariant =
    | 'circle'
    | 'square'
    | 'triangle'
    | 'diamond'
    | 'hexagon'
    | 'rectangle'
    | 'star'

type AnimatedThemeTogglerProps = {
    /** Current mode (light/dark) from useDarkMode. */
    isDark: boolean
    /** Called to switch theme — pass the existing useDarkMode onModeChange. */
    onModeChange: (mode: Mode) => void
    /** Transition duration in ms. Defaults to 400. */
    duration?: number
    /** Clip-path shape used to reveal the new theme. */
    variant?: TransitionVariant
    /** When true, the transition expands from the viewport center instead of the button. */
    fromCenter?: boolean
    /** Override icon rendering — useful for keeping the existing icon style. */
    renderIcon?: (isDark: boolean) => ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>

declare global {
    interface Document {
        startViewTransition?: (callback: () => void) => {
            ready?: Promise<void>
            finished?: Promise<void>
        }
    }
}

function polygonCollapsed(cx: number, cy: number, vertexCount: number): string {
    const pairs = Array.from({ length: vertexCount }, () => `${cx}px ${cy}px`).join(
        ', ',
    )
    return `polygon(${pairs})`
}

function getThemeTransitionClipPaths(
    variant: TransitionVariant,
    cx: number,
    cy: number,
    maxRadius: number,
    viewportWidth: number,
    viewportHeight: number,
): [string, string] {
    switch (variant) {
        case 'circle':
            return [
                `circle(0px at ${cx}px ${cy}px)`,
                `circle(${maxRadius}px at ${cx}px ${cy}px)`,
            ]
        case 'square': {
            const halfW = Math.max(cx, viewportWidth - cx)
            const halfH = Math.max(cy, viewportHeight - cy)
            const halfSide = Math.max(halfW, halfH) * 1.05
            const end = [
                `${cx - halfSide}px ${cy - halfSide}px`,
                `${cx + halfSide}px ${cy - halfSide}px`,
                `${cx + halfSide}px ${cy + halfSide}px`,
                `${cx - halfSide}px ${cy + halfSide}px`,
            ].join(', ')
            return [polygonCollapsed(cx, cy, 4), `polygon(${end})`]
        }
        case 'triangle': {
            const scale = maxRadius * 2.2
            const dx = (Math.sqrt(3) / 2) * scale
            const verts = [
                `${cx}px ${cy - scale}px`,
                `${cx + dx}px ${cy + 0.5 * scale}px`,
                `${cx - dx}px ${cy + 0.5 * scale}px`,
            ].join(', ')
            return [polygonCollapsed(cx, cy, 3), `polygon(${verts})`]
        }
        case 'diamond': {
            const R = maxRadius * Math.SQRT2
            const end = [
                `${cx}px ${cy - R}px`,
                `${cx + R}px ${cy}px`,
                `${cx}px ${cy + R}px`,
                `${cx - R}px ${cy}px`,
            ].join(', ')
            return [polygonCollapsed(cx, cy, 4), `polygon(${end})`]
        }
        case 'hexagon': {
            const R = maxRadius * Math.SQRT2
            const verts: string[] = []
            for (let i = 0; i < 6; i++) {
                const a = -Math.PI / 2 + (i * Math.PI) / 3
                verts.push(
                    `${cx + R * Math.cos(a)}px ${cy + R * Math.sin(a)}px`,
                )
            }
            return [
                polygonCollapsed(cx, cy, 6),
                `polygon(${verts.join(', ')})`,
            ]
        }
        case 'rectangle': {
            const halfW = Math.max(cx, viewportWidth - cx)
            const halfH = Math.max(cy, viewportHeight - cy)
            const end = [
                `${cx - halfW}px ${cy - halfH}px`,
                `${cx + halfW}px ${cy - halfH}px`,
                `${cx + halfW}px ${cy + halfH}px`,
                `${cx - halfW}px ${cy + halfH}px`,
            ].join(', ')
            return [polygonCollapsed(cx, cy, 4), `polygon(${end})`]
        }
        case 'star': {
            const R = maxRadius * Math.SQRT2 * 1.03
            const innerRatio = 0.42
            const starPolygon = (radius: number) => {
                const verts: string[] = []
                for (let i = 0; i < 5; i++) {
                    const outerA = -Math.PI / 2 + (i * 2 * Math.PI) / 5
                    verts.push(
                        `${cx + radius * Math.cos(outerA)}px ${cy + radius * Math.sin(outerA)}px`,
                    )
                    const innerA = outerA + Math.PI / 5
                    verts.push(
                        `${cx + radius * innerRatio * Math.cos(innerA)}px ${cy + radius * innerRatio * Math.sin(innerA)}px`,
                    )
                }
                return `polygon(${verts.join(', ')})`
            }
            const startR = Math.max(2, R * 0.025)
            return [starPolygon(startR), starPolygon(R)]
        }
        default:
            return [
                `circle(0px at ${cx}px ${cy}px)`,
                `circle(${maxRadius}px at ${cx}px ${cy}px)`,
            ]
    }
}

const AnimatedThemeToggler = ({
    isDark,
    onModeChange,
    duration = 400,
    variant = 'circle',
    fromCenter = false,
    className,
    renderIcon,
    ...rest
}: AnimatedThemeTogglerProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const applyTheme = useCallback(() => {
        const nextMode: Mode = isDark ? MODE_LIGHT : MODE_DARK
        // Manually swap the documentElement class so the view-transition
        // snapshot reflects the new theme immediately, before useDarkMode's
        // useEffect runs (it'll subsequently no-op).
        const root = document.documentElement
        root.classList.remove(isDark ? MODE_DARK : MODE_LIGHT)
        root.classList.add(nextMode)
        onModeChange(nextMode)
    }, [isDark, onModeChange])

    const toggleTheme = useCallback(() => {
        const button = buttonRef.current
        if (!button) return

        const viewportWidth = window.visualViewport?.width ?? window.innerWidth
        const viewportHeight =
            window.visualViewport?.height ?? window.innerHeight

        let x: number
        let y: number
        if (fromCenter) {
            x = viewportWidth / 2
            y = viewportHeight / 2
        } else {
            const { top, left, width, height } = button.getBoundingClientRect()
            x = left + width / 2
            y = top + height / 2
        }

        const maxRadius = Math.hypot(
            Math.max(x, viewportWidth - x),
            Math.max(y, viewportHeight - y),
        )

        if (typeof document.startViewTransition !== 'function') {
            applyTheme()
            return
        }

        const clipPath = getThemeTransitionClipPaths(
            variant,
            x,
            y,
            maxRadius,
            viewportWidth,
            viewportHeight,
        )

        const root = document.documentElement
        root.dataset.magicuiThemeVt = 'active'
        root.style.setProperty(
            '--magicui-theme-toggle-vt-duration',
            `${duration}ms`,
        )
        root.style.setProperty('--magicui-theme-vt-clip-from', clipPath[0])
        const cleanup = () => {
            delete root.dataset.magicuiThemeVt
            root.style.removeProperty('--magicui-theme-toggle-vt-duration')
            root.style.removeProperty('--magicui-theme-vt-clip-from')
        }

        const transition = document.startViewTransition(() => {
            flushSync(applyTheme)
        })

        if (transition?.finished?.finally) {
            transition.finished.finally(cleanup)
        } else {
            cleanup()
        }

        const ready = transition?.ready
        if (ready && typeof ready.then === 'function') {
            ready.then(() => {
                document.documentElement.animate(
                    { clipPath },
                    {
                        duration,
                        easing: variant === 'star' ? 'linear' : 'ease-in-out',
                        fill: 'forwards',
                        pseudoElement: '::view-transition-new(root)',
                    },
                )
            })
        }
    }, [applyTheme, fromCenter, duration, variant])

    const icon = renderIcon
        ? renderIcon(isDark)
        : isDark
          ? <TbSun size={18} />
          : <TbMoon size={18} />

    return (
        <button
            type="button"
            ref={buttonRef}
            onClick={toggleTheme}
            className={classNames(className)}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            {...rest}
        >
            {icon}
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}

export default AnimatedThemeToggler
