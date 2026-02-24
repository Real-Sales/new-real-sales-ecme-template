import { combineReducers } from '@reduxjs/toolkit'
import reducer, {
    SLICE_NAME,
    type ScenarioLibraryState,
} from './scenarioLibrarySlice'
import { useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState } from '@/store'

const combinedReducer = combineReducers({
    data: reducer,
})

export const useAppSelector: TypedUseSelectorHook<
    RootState & {
        [SLICE_NAME]: {
            data: ScenarioLibraryState
        }
    }
> = useSelector

export * from './scenarioLibrarySlice'
export { useAppDispatch } from '@/store'
export default combinedReducer
