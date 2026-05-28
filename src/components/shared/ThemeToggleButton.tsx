import classNames from '@/utils/classNames'
import useDarkMode from '@/utils/hooks/useDarkMode'
import AnimatedThemeToggler from '@/views/Landing/components/AnimatedThemeToggler'
import type { CommonProps } from '@/@types/common'

const ThemeToggleButton = ({ className }: CommonProps) => {
    const [isDark, onModeChange] = useDarkMode()

    return (
        <AnimatedThemeToggler
            isDark={isDark}
            onModeChange={onModeChange}
            variant="circle"
            duration={500}
            className={classNames(
                'relative inline-flex cursor-pointer items-center justify-center rounded-xl p-2 text-neutral-500 hover:shadow-input dark:text-neutral-500',
                className,
            )}
        />
    )
}

export default ThemeToggleButton
