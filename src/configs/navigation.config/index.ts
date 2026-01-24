import dashboardsNavigationConfig from './dashboards.navigation.config'
import uiComponentNavigationConfig from './ui-components.navigation.config'
import conceptsNavigationConfig from './concepts.navigation.config'
import authNavigationConfig from './auth.navigation.config'
import othersNavigationConfig from './others.navigation.config'
import guideNavigationConfig from './guide.navigation.config'
import salesNavigationConfig from './sales.navigation.config'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    ...salesNavigationConfig,
    ...dashboardsNavigationConfig,
    ...conceptsNavigationConfig,
    ...uiComponentNavigationConfig,
    ...authNavigationConfig,
    ...othersNavigationConfig,
    ...guideNavigationConfig,
]

export default navigationConfig
