import { useNavigate } from 'react-router-dom'
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
    const navigate = useNavigate()
    const data = useOverviewData()

    /** Mode is chosen after persona selection — go straight to the listing. */
    const goToPersonaSelection = (_mode?: ConversationMode) => {
        emitTourEvent('start-training-opened', { mode: _mode })
        navigate('/persona-selection')
    }

    return (
        <div
            className="min-h-full overflow-x-hidden"
            style={{
                fontFamily:
                    "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            }}
        >
            <Hero data={data} />
            <div data-tour-id="start-training">
                <StartTraining data={data} onSelectMode={goToPersonaSelection} />
            </div>
            <ProductWalkthrough />
            <InteractiveJourney />
            <InsightsBento data={data} onSelectMode={goToPersonaSelection} />
            <ContinueTraining data={data} />
            <PlatformCapabilities />
            <AICoachPanel data={data} onSelectMode={goToPersonaSelection} />
            <ProgressCharts data={data} />
            <Achievements data={data} />
        </div>
    )
}

export default Overview
