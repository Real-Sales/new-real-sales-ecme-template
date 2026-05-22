import navigationConfig from '@/configs/navigation.config'
import type { NavigationTree } from '@/@types/navigation'
import { getNavSectionTitle } from '@/utils/navRoleLabel'

/** Navigation tree with role-aware group labels (e.g. Sales Rep vs Sales Manager). */
export function getNavigationTree(userRole?: string): NavigationTree[] {
    const sectionTitle = getNavSectionTitle(userRole)
    return navigationConfig.map((group) => {
        if (group.key !== 'salesManager') return group
        return { ...group, title: sectionTitle }
    })
}
