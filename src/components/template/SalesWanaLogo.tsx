import { memo } from 'react'
import type { CommonProps } from '@/@types/common'

interface SalesWanaLogoProps extends CommonProps {
    /** 'full' = icon + wordmark | 'streamline' = icon only */
    type?: 'full' | 'streamline'
    /** 'light' = dark text | 'dark' = light text */
    mode?: 'light' | 'dark'
    /** Height of the icon in pixels. Controls scale of the whole logo. */
    iconSize?: number
    /** Legacy prop: used as iconSize when type='streamline' */
    logoWidth?: number | string
    /** CSS font-size for the wordmark (e.g. '1.25rem' or '22px') */
    textSize?: string
    imgClass?: string
}

const ICON_SRC = '/img/logo/saleswana-icon.png'
const FONT = "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"

const SalesWanaLogo = memo(
    ({
        type = 'full',
        mode = 'light',
        iconSize,
        logoWidth,
        textSize = '1.5rem',
        className,
        imgClass,
        style,
    }: SalesWanaLogoProps) => {
        const salesColor = mode === 'dark' ? '#F5F5F5' : '#111827'
        const wanaColor  = '#0CAF60'

        /* ── Streamline: icon only ─────────────────────────────────────── */
        if (type === 'streamline') {
            // honour legacy logoWidth prop as icon size
            const sz =
                iconSize ??
                (typeof logoWidth === 'number' ? logoWidth : 46)

            return (
                <img
                    src={ICON_SRC}
                    width={sz}
                    height={sz}
                    alt="SalesWana"
                    className={imgClass ?? className}
                    style={style}
                    draggable={false}
                />
            )
        }

        /* ── Full: icon + wordmark ─────────────────────────────────────── */
        const sz = iconSize ?? 46

        return (
            <div
                className={className}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: `${Math.round(sz * 0.22)}px`,
                    ...style,
                }}
            >
                <img
                    src={ICON_SRC}
                    width={sz}
                    height={sz}
                    alt=""
                    draggable={false}
                    className={imgClass}
                />
                <span
                    style={{
                        fontFamily: FONT,
                        fontWeight: 700,
                        fontSize: textSize,
                        letterSpacing: '-0.025em',
                        lineHeight: 1,
                        userSelect: 'none',
                    }}
                >
                    <span style={{ color: salesColor }}>Sales</span>
                    <span style={{ color: wanaColor }}>Wana</span>
                </span>
            </div>
        )
    },
)

SalesWanaLogo.displayName = 'SalesWanaLogo'

export default SalesWanaLogo
