import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type TourStatus = 'not_started' | 'in_progress' | 'paused' | 'skipped' | 'completed'

export interface ConciergeState {
    tourStatus: TourStatus
    currentStepIndex: number
    /** Step ids the user has already walked through, across any number of logins. */
    completedStepIds: string[]
    /** Interactive checklist item id -> done. Persists and updates from real product usage. */
    checklist: Record<string, boolean>
    hasCelebratedFirstSession: boolean
    /** Bumped whenever we want every mounted ConciergeProvider to re-evaluate signals. */
    lastDismissedAt: string | null
}

const initialState: ConciergeState = {
    tourStatus: 'not_started',
    currentStepIndex: 0,
    completedStepIds: [],
    checklist: {},
    hasCelebratedFirstSession: false,
    lastDismissedAt: null,
}

const conciergeSlice = createSlice({
    name: 'concierge',
    initialState,
    reducers: {
        startTour(state) {
            state.tourStatus = 'in_progress'
            if (state.currentStepIndex === 0 && state.completedStepIds.length === 0) {
                state.currentStepIndex = 0
            }
        },
        goToStep(state, action: PayloadAction<number>) {
            state.currentStepIndex = action.payload
            state.tourStatus = 'in_progress'
        },
        markStepComplete(state, action: PayloadAction<{ stepId: string; nextIndex: number }>) {
            if (!state.completedStepIds.includes(action.payload.stepId)) {
                state.completedStepIds.push(action.payload.stepId)
            }
            state.currentStepIndex = action.payload.nextIndex
        },
        skipTour(state) {
            state.tourStatus = 'skipped'
            state.lastDismissedAt = new Date().toISOString()
        },
        pauseTour(state) {
            // "Resume later" - keep step index and completed ids, just stop showing it now.
            state.tourStatus = 'paused'
            state.lastDismissedAt = new Date().toISOString()
        },
        completeTour(state) {
            state.tourStatus = 'completed'
        },
        toggleChecklistItem(state, action: PayloadAction<{ id: string; done?: boolean }>) {
            const next = action.payload.done ?? !state.checklist[action.payload.id]
            state.checklist[action.payload.id] = next
        },
        setCelebrated(state) {
            state.hasCelebratedFirstSession = true
        },
        resetConcierge() {
            return initialState
        },
    },
})

export const {
    startTour,
    goToStep,
    markStepComplete,
    skipTour,
    pauseTour,
    completeTour,
    toggleChecklistItem,
    setCelebrated,
    resetConcierge,
} = conciergeSlice.actions

export default conciergeSlice.reducer
