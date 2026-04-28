import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from './hook'
import { setLang } from './slices/locale/localeSlice'

type LocaleStore = {
    currentLang: string
    setLang: (lang: string) => void
}

export function useLocaleStore<T>(selector: (state: LocaleStore) => T): T {
    const dispatch = useAppDispatch()
    const currentLang = useAppSelector((s) => s.locale.currentLang)

    const store: LocaleStore = useMemo(
        () => ({
            currentLang,
            setLang: (payload) => dispatch(setLang(payload)),
        }),
        [currentLang, dispatch],
    )

    return selector(store)
}
