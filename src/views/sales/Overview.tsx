import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SessionSetupPanel from '@/components/shared/SessionSetupPanel'
import type { ConversationMode } from '@/components/shared/SessionSetupPanel'
import { emitTourEvent } from '@/components/concierge/conciergeBus'
import { useOverviewData } from './OverviewWidgets/useOverviewData'
import Hero from './OverviewWidgets/Hero'
import StartTraining from './OverviewWidgets/StartTraining'
import ProductWalkthrough from './OverviewWidgets/ProductWalkthrough'
import InteractiveJourney from './OverviewWidgets/InteractiveJourney'
import InsightsBento from './OverviewWidgets/InsightsBento'
import ContinueTraining from './OverviewWidgets/ContinueTraining'
import PlatformCapabilities from './OverviewWidgets/PlatformCapabilities'
import AICoachPanel from './OverviewWidgets/AICoachPanel'
import ProgressCharts from './OverviewWidgets/ProgressCharts'
import Achievements from './OverviewWidgets/Achievements'

const Overview = () => {
    const [isSetupOpen, setIsSetupOpen] = useState(false)
    const [initialMode, setInitialMode] = useState<ConversationMode | undefined>(
        undefined,
    )
    const navigate = useNavigate()
    const data = useOverviewData()

    const handleNavigateToPersonas = (
        mode: ConversationMode,
        scenarios?: string[],
        files?: File[],
    ) => {
        navigate('/persona-selection', {
            state: {
                mode,
                scenarios,
                files,
            },
        })
    }

    const openSessionSetup = (mode?: ConversationMode) => {
        setInitialMode(mode)
        setIsSetupOpen(true)
        emitTourEvent('start-training-opened', { mode })
    }

    return (
        <div className="min-h-full overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}>
            <Hero data={data} />
            <div data-tour-id="start-training">
                <StartTraining data={data} onSelectMode={openSessionSetup} />
            </div>
            <ProductWalkthrough />
            <InteractiveJourney />
            <InsightsBento data={data} onSelectMode={openSessionSetup} />
            <ContinueTraining data={data} />
            <PlatformCapabilities />
            <AICoachPanel data={data} onSelectMode={openSessionSetup} />
            <ProgressCharts data={data} />
            <Achievements data={data} />

            <SessionSetupPanel
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                onNavigateToPersonas={handleNavigateToPersonas}
                initialMode={initialMode}
            />
        </div>
    )
}

export default Overview
