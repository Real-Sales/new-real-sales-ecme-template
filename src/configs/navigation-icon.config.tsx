import {
    PiHouseLineDuotone,
    PiArrowsInDuotone,
    PiBookOpenUserDuotone,
    PiBookBookmarkDuotone,
    PiAcornDuotone,
    PiBagSimpleDuotone,
    PiSquaresFourDuotone,
    PiCreditCardDuotone,
    PiChatCircleDuotone,
    PiChartBarDuotone,
    PiTargetDuotone,
    PiUsersDuotone,
    PiBuildingsDuotone,
    PiThumbsUpDuotone,
    PiBooksDuotone,
} from 'react-icons/pi'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiHouseLineDuotone />,
    overview: <PiSquaresFourDuotone />,
    subscription: <PiCreditCardDuotone />,
    sessions: <PiChatCircleDuotone />,
    performance: <PiChartBarDuotone />,
    modes: <PiTargetDuotone />,
    personas: <PiUsersDuotone />,
    scenarioLibrary: <PiBooksDuotone />,
    company: <PiBuildingsDuotone />,
    teams: <PiUsersDuotone />, // Reusing users icon for teams as well
    feedback: <PiThumbsUpDuotone />,
    singleMenu: <PiAcornDuotone />,
    collapseMenu: <PiArrowsInDuotone />,
    groupSingleMenu: <PiBookOpenUserDuotone />,
    groupCollapseMenu: <PiBookBookmarkDuotone />,
    groupMenu: <PiBagSimpleDuotone />,
}

export default navigationIcon
