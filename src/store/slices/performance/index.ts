import { combineReducers } from '@reduxjs/toolkit'
import reducer, {
    SLICE_NAME,
    type PerformanceState,
} from './performanceSlice'
import { useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState } from '@/store'

const combinedReducer = combineReducers({
    data: reducer,
})

export const useAppSelector: TypedUseSelectorHook<
    RootState & {
        [SLICE_NAME]: {
            data: PerformanceState
        }
    }
> = useSelector

export * from './performanceSlice'
export { useAppDispatch } from '@/store'
export default combinedReducer
