const SESSION_ERROR_HINTS: Record<string, string> = {
    'User must be assigned to a team with a sales division before starting a session.':
        'You must be assigned to a team under a sales division before starting a session. Ask your manager to add you to a team.',
    'Division has no products configured.':
        'Your sales division has no products configured. Ask your manager to add products to the division.',
}

export function getApiErrorMessage(
    err: unknown,
    fallback = 'Something went wrong. Please try again.',
): string {
    const data =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response
            ? (err.response as { data?: { detail?: string; message?: string } }).data
            : undefined

    const raw = data?.detail || data?.message || fallback
    return SESSION_ERROR_HINTS[raw] ?? raw
}
