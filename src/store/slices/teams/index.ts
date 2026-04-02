import { combineReducers } from '@reduxjs/toolkit'
import reducer, {
    SLICE_NAME,
    type TeamsState,
} from './teamsSlice'
import { useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState } from '@/store'

const combinedReducer = combineReducers({
    data: reducer,
})

export const useAppSelector: TypedUseSelectorHook<
    RootState & {
        [SLICE_NAME]: {
            data: TeamsState
        }
    }
> = useSelector

export * from './teamsSlice'
export { useAppDispatch } from '@/store'
export default combinedReducer
