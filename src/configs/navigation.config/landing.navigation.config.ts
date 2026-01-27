import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

const landingNavigationConfig: NavigationTree[] = [
    {
        key: 'landing',
        path: '',
        title: 'Landing Pages',
        translateKey: 'nav.landing.landing',
        icon: 'landing',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [],
        subMenu: [
            {
                key: 'landing.home',
                path: `/landing`,
                title: 'Landing Home',
                translateKey: 'nav.landing.home',
                icon: 'landing',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                meta: {
                    description: {
                        translateKey: 'nav.landing.homeDesc',
                        label: 'Main landing page',
                    },
                },
                subMenu: [],
            },
            {
                key: 'landing.about',
                path: `/about`,
                title: 'About',
                translateKey: 'nav.landing.about',
                icon: 'about',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                meta: {
                    description: {
                        translateKey: 'nav.landing.aboutDesc',
                        label: 'About page',
                    },
                },
                subMenu: [],
            },
            {
                key: 'landing.faqs',
                path: `/faqs`,
                title: 'FAQs',
                translateKey: 'nav.landing.faqs',
                icon: 'faqs',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                meta: {
                    description: {
                        translateKey: 'nav.landing.faqsDesc',
                        label: 'Frequently asked questions',
                    },
                },
                subMenu: [],
            },
            {
                key: 'landing.caseStudy',
                path: `/case-study/food-beverage`,
                title: 'Case Study',
                translateKey: 'nav.landing.caseStudy',
                icon: 'caseStudy',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                meta: {
                    description: {
                        translateKey: 'nav.landing.caseStudyDesc',
                        label: 'Case study - Food & Beverage',
                    },
                },
                subMenu: [],
            },
        ],
    },
]

export default landingNavigationConfig
