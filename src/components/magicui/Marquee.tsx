import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import classNames from '@/utils/classNames'

export interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
    className?: string
    reverse?: boolean
    pauseOnHover?: boolean
    vertical?: boolean
    /** How many times to repeat the children in the track (for seamless loop). */
    repeat?: number
    children?: ReactNode
}

export function Marquee({
    className,
    reverse = false,
    pauseOnHover = false,
    vertical = false,
    repeat = 4,
    children,
    ...props
}: MarqueeProps) {
    return (
        <div
            {...props}
            className={classNames(
                'flex overflow-x-hidden overflow-y-visible px-2 py-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]',
                vertical ? 'flex-col' : 'flex-row',
                pauseOnHover && 'marquee-pause-on-hover',
                className,
            )}
        >
            {Array.from({ length: repeat }, (_, i) => (
                <div
                    key={i}
                    className={classNames(
                        'marquee-track flex shrink-0 justify-around [gap:var(--gap)]',
                        vertical
                            ? 'animate-marquee-vertical flex-col'
                            : reverse
                              ? 'animate-marquee-reverse flex-row'
                              : 'animate-marquee flex-row',
                    )}
                >
                    {children}
                </div>
            ))}
        </div>
    )
}

export default Marquee
