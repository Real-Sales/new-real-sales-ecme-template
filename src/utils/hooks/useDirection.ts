import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hook'
import { setDirection } from '@/store/slices/theme/themeSlice'
import type { Direction } from '@/@types/theme'

function useDirection(): [
    direction: Direction,
    setDirectionFn: (dir: Direction) => void,
] {
    const direction = useAppSelector((state) => state.theme.direction)
    const dispatch = useAppDispatch()
    const setDirectionFn = (dir: Direction) => dispatch(setDirection(dir))
    useEffect(() => {
        if (window === undefined) {
            return
        }
        const root = window.document.documentElement
        root.setAttribute('dir', direction)
    }, [direction])
    return [direction, setDirectionFn]
}

export default useDirection
