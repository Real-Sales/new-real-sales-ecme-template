export const contextTipFor = (pathname: string): string => {
    if (pathname.startsWith('/overview')) {
        return 'Ready for a rep? Pick a mode below and I will drop you into a live session.'
    }
    if (pathname.startsWith('/performance')) {
        return 'This is your full score history. Switch the trend view to compare modes side by side.'
    }
    if (pathname.startsWith('/leaderboard')) {
        return 'Rankings update as your team completes sessions. Keep your streak alive to climb.'
    }
    if (pathname.startsWith('/persona-selection')) {
        return 'Pick a persona that matches the hardest conversation you have this week.'
    }
    if (pathname.startsWith('/assigned-scenarios')) {
        return 'These are the scenarios your manager wants you to practice. Open one to start.'
    }
    if (pathname.startsWith('/scenario-library')) {
        return 'Create a scenario by describing the deal or uploading a doc, then assign it to your team.'
    }
    if (pathname.startsWith('/sales-division')) {
        return 'Divisions and teams group your people so you can compare performance between groups.'
    }
    if (pathname.startsWith('/company-members')) {
        return 'Everyone on your company plan is listed here, along with their role.'
    }
    if (pathname.startsWith('/sessions/')) {
        return 'Your coaching notes are below the score. Look for the one thing to fix next time.'
    }
    return 'Ask me anything, or use the checklist below to see what is left to explore.'
}
