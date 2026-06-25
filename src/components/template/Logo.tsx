import SalesWanaLogo from './SalesWanaLogo'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
    iconSize?: number
    textSize?: string
}

const Logo = (props: LogoProps) => {
    const {
        type = 'full',
        mode = 'light',
        className,
        imgClass,
        style,
        logoWidth,
        iconSize,
        textSize,
    } = props

    return (
        <SalesWanaLogo
            type={type}
            mode={mode}
            logoWidth={logoWidth}
            iconSize={iconSize}
            textSize={textSize}
            imgClass={imgClass}
            className={className}
            style={style}
        />
    )
}

export default Logo
