import type { Scenario } from '@/views/sales/ScenarioList/types'

export type AudioVizSessionState = {
    mode?: string
    persona?: {
        name?: string
        role?: string
        avatar?: string
    }
    scenarios?: string[]
    scenario_text?: string
}

export function scenarioToAudioVizState(scenario: Scenario): AudioVizSessionState {
    return {
        mode: scenario.mode?.name,
        persona: {
            name: scenario.persona?.name,
            role: scenario.persona?.ai_role?.name,
            avatar: scenario.persona?.profile_pic,
        },
        scenarios: scenario.scenario_id ? [scenario.scenario_id] : undefined,
        scenario_text: scenario.scenario_text,
    }
}
