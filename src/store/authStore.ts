import { useAppSelector } from './hook'

export const useSessionUser = () => useAppSelector((state) => state.auth.user) 