import { combineReducers } from '@reduxjs/toolkit'
import reducer, {
    SLICE_NAME,
    type LeaderboardState,
} from './leaderboardSlice'
import { useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState } from '@/store'

const combinedReducer = combineReducers({
    data: reducer,
})

export const useAppSelector: TypedUseSelectorHook<
    RootState & {
        [SLICE_NAME]: {
            data: LeaderboardState
        }
    }
> = useSelector

export * from './leaderboardSlice'
export { useAppDispatch } from '@/store'
export default combinedReducer
