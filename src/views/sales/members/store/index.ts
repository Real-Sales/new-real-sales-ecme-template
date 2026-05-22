import { combineReducers } from '@reduxjs/toolkit'
import reducer, {
    SLICE_NAME,
    type CompanyMembersState,
} from './companyMembersSlice'
import { useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState } from '@/store'

const combinedReducer = combineReducers({
    data: reducer,
})

export const useAppSelector: TypedUseSelectorHook<
    RootState & {
        [SLICE_NAME]: {
            data: CompanyMembersState
        }
    }
> = useSelector

export * from './companyMembersSlice'
export { useAppDispatch } from '@/store'
export default combinedReducer
