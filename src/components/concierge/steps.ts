import {
    MANAGER_ROLES,
} from '@/configs/navigation.config/sales.navigation.config'

export interface TourStep {
    id: string
    /** null = centered panel, not anchored to any element on the page. */
    target: string | null
    /** Page this step lives on. */
    route?: string
    /** If true, the tour itself navigates here the moment this step becomes active - no waiting on the user to find the link. */
    navigateOnEnter?: boolean
    /**
     * If true, open the first sales division detail page (`/sales-division/:id`)
     * when this step becomes active and the user is still on the list.
     */
    openFirstDivisionDetail?: boolean
    /**
     * If true, open the first team detail page (`/teams/:id`) from the
     * division Teams tab when this step becomes active.
     */
    openFirstTeamDetail?: boolean
    title: string
    body: string
    /** Real product event (see conciergeBus) that advances this step automatically. */
    advanceOnEvent?: 'start-training-opened'
    /** Advance automatically the moment the user clicks the spotlighted element itself. */
    advanceOnClick?: boolean
    placement?: 'bottom' | 'top' | 'right' | 'left'
    /** Restrict this step to these roles. Omit for everyone. */
    roles?: string[]
}

/**
 * Tour pattern for every major area:
 *  1. Spotlight the sidebar nav item and explain what it is (stay put — no navigate).
 *  2. Then navigate into the page and spotlight an on-page landmark / CTA.
 *
 * Nav items already expose `data-tour-id="nav-{nav.key}"` from VerticalSingleMenuItem.
 */
const allSteps: TourStep[] = [
    // --- Overview: sidebar first, then the three training modes ---
    {
        id: 'nav-overview',
        target: '[data-tour-id="nav-salesManager.overview"]',
        route: '/overview',
        navigateOnEnter: true,
        title: 'Your home base',
        body: 'Overview is where you start every day — training modes, progress, and what’s next. Let’s look inside.',
        placement: 'right',
    },
    {
        id: 'start-training-intro',
        target: '[data-tour-id="start-training"]',
        route: '/overview',
        title: 'Three ways to train',
        body: 'Every session runs in one of three modes. Let’s look at each one.',
        placement: 'bottom',
    },
    {
        id: 'mode-prospecting',
        target: '[data-tour-id="mode-prospecting"]',
        route: '/overview',
        title: 'Prospecting',
        body: 'Cold outreach and opening conversations. The goal is to build rapport and earn a second call, from nothing.',
        placement: 'bottom',
    },
    {
        id: 'mode-discovering',
        target: '[data-tour-id="mode-discovering"]',
        route: '/overview',
        title: 'Discovery',
        body: 'Uncover what the buyer actually needs and qualify the opportunity, before you pitch anything.',
        placement: 'bottom',
    },
    {
        id: 'mode-closing',
        target: '[data-tour-id="mode-closing"]',
        route: '/overview',
        title: 'Closing',
        body: 'Handle objections and negotiate a real commitment. You can attach deal docs for extra context.',
        placement: 'bottom',
    },
    {
        id: 'start-training-cta',
        target: '[data-tour-id="start-training"]',
        route: '/overview',
        title: 'Try it now',
        body: 'Pick any mode above whenever you are ready to start a live session.',
        advanceOnEvent: 'start-training-opened',
        placement: 'bottom',
    },

    // --- Performance ---
    {
        id: 'nav-performance',
        target: '[data-tour-id="nav-salesManager.performance"]',
        title: 'Performance',
        body: 'This is where your scores live after every session. Open it to see trends by mode.',
        placement: 'right',
    },
    {
        id: 'performance-page',
        target: '[data-tour-id="performance-page"]',
        route: '/performance',
        navigateOnEnter: true,
        title: 'Your scores live here',
        body: 'Every session you complete shows up here, broken down by mode with a full trend line over time.',
        placement: 'bottom',
    },

    // --- Assigned scenarios ---
    {
        id: 'nav-assigned-scenarios',
        target: '[data-tour-id="nav-salesPerson.assignedScenarios"]',
        title: 'Assigned scenarios',
        body: 'Practice work your manager sends you shows up here. Open it to see what’s pending.',
        placement: 'right',
    },
    {
        id: 'assigned-scenarios-page',
        target: '[data-tour-id="assigned-scenarios-page"]',
        route: '/assigned-scenarios',
        navigateOnEnter: true,
        title: 'Scenarios assigned to you',
        body: 'A scenario is a specific situation to practice, like a deal or an objection. Open one to start.',
        placement: 'bottom',
    },

    // --- Scenario library (managers) ---
    {
        id: 'nav-scenario-library',
        target: '[data-tour-id="nav-salesManager.scenarioLibrary"]',
        title: 'Scenario Library',
        body: 'Build the situations your team will practice. Create once, then assign to anyone.',
        placement: 'right',
        roles: MANAGER_ROLES,
    },
    {
        id: 'scenario-library-intro',
        target: '[data-tour-id="scenario-library-page"]',
        route: '/scenario-library',
        navigateOnEnter: true,
        title: 'Build your own scenarios',
        body: 'A scenario describes what your AI buyer already knows: their company, product, and situation.',
        placement: 'bottom',
        roles: MANAGER_ROLES,
    },
    {
        id: 'scenario-library-add',
        target: '[data-tour-id="add-scenario-button"]',
        route: '/scenario-library',
        title: 'Create a scenario',
        body: 'Click here to describe the deal, or upload a doc for context. Once it is saved, assign it to your team.',
        advanceOnClick: true,
        placement: 'left',
        roles: MANAGER_ROLES,
    },

    // --- Leaderboard ---
    {
        id: 'nav-leaderboard',
        target: '[data-tour-id="nav-salesManager.leaderboard"]',
        title: 'Leaderboard',
        body: 'See how you rank against your team. Keep training to climb.',
        placement: 'right',
    },
    {
        id: 'leaderboard-page',
        target: '[data-tour-id="leaderboard-page"]',
        route: '/leaderboard',
        navigateOnEnter: true,
        title: 'See how you rank',
        body: 'Rankings update from real session scores. Check back after you train to see where you stand.',
        placement: 'bottom',
    },

    // --- Company members ---
    {
        id: 'nav-company-members',
        target: '[data-tour-id="nav-companyGroup.members"]',
        title: 'Company Members',
        body: 'Everyone on your company plan is listed here — roles, teams, and credit usage.',
        placement: 'right',
    },
    {
        id: 'company-members-page',
        target: '[data-tour-id="company-members-page"]',
        route: '/company-members',
        navigateOnEnter: true,
        title: 'Everyone on your account',
        body: 'Browse the roster, see who’s active, and how many credits each person has used.',
        placement: 'bottom',
    },

    // --- Sales divisions (managers) ---
    {
        id: 'nav-sales-division',
        target: '[data-tour-id="nav-companyGroup.company"]',
        title: 'Sales Divisions',
        body: 'Organize reps by territory or product line. Inside each division you create teams.',
        placement: 'right',
        roles: MANAGER_ROLES,
    },
    {
        id: 'sales-division-intro',
        target: '[data-tour-id="sales-division-page"]',
        route: '/sales-division',
        navigateOnEnter: true,
        title: 'Divisions and teams',
        body: 'A division groups your people. Compare performance between groups once teams are set up.',
        placement: 'bottom',
        roles: MANAGER_ROLES,
    },
    {
        id: 'sales-division-add',
        target: '[data-tour-id="add-division-button"]',
        route: '/sales-division',
        title: 'Create a division',
        body: 'Click here to set up your first division. You can add teams inside it right after.',
        advanceOnClick: true,
        placement: 'left',
        roles: MANAGER_ROLES,
    },
    {
        id: 'division-teams',
        target: '[data-tour-id="team-card"]',
        route: '/sales-division',
        openFirstDivisionDetail: true,
        title: 'What a team is',
        body: 'Inside a division, a team is a group of reps who train and sell together. Use teams to assign practice scenarios and keep coaching focused.',
        placement: 'top',
        roles: MANAGER_ROLES,
    },
    {
        id: 'team-performance',
        target: '[data-tour-id="team-performance"]',
        route: '/teams',
        openFirstTeamDetail: true,
        title: 'Team performance',
        body: 'Open a team to see its average score, growth by mode, and how each member is doing. This is where you coach the group, not just individuals.',
        placement: 'bottom',
        roles: MANAGER_ROLES,
    },
]

/** Steps for this user, in order, filtered to what their role can actually see. */
export const buildTourSteps = (role?: string | null): TourStep[] =>
    allSteps.filter((step) => !step.roles || step.roles.includes(role ?? ''))

export interface ChecklistItem {
    id: string
    label: string
    description: string
    roles?: string[]
}

const allChecklistItems: ChecklistItem[] = [
    {
        id: 'run-first-session',
        label: 'Run your first training session',
        description: 'Start a live roleplay in any mode.',
    },
    {
        id: 'visit-performance',
        label: 'Check your performance trend',
        description: 'Open the Performance page at least once.',
    },
    {
        id: 'visit-assigned-scenarios',
        label: 'Check your assigned scenarios',
        description: 'See what your manager has lined up for you.',
    },
    {
        id: 'visit-scenario-library',
        label: 'Create a scenario',
        description: 'Build one and assign it to your team.',
        roles: MANAGER_ROLES,
    },
    {
        id: 'visit-leaderboard',
        label: 'See the leaderboard',
        description: 'Find out where you rank on your team.',
    },
    {
        id: 'visit-sales-division',
        label: 'Set up a division or team',
        description: 'Organize your people by territory or product.',
        roles: MANAGER_ROLES,
    },
    {
        id: 'visit-company-members',
        label: 'View company members',
        description: 'See everyone on your account.',
    },
]

export const buildChecklistItems = (role?: string | null): ChecklistItem[] =>
    allChecklistItems.filter((item) => !item.roles || item.roles.includes(role ?? ''))
