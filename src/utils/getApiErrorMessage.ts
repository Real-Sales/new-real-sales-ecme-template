const SESSION_ERROR_HINTS: Record<string, string> = {
    'User must be assigned to a team with a sales division before starting a session.':
        'You must be assigned to a team under a sales division before starting a session. Ask your manager to add you to a team.',
    'Division has no products configured.':
        'Your sales division has no products configured. Ask your manager to add products to the division.',
}

/** Substring match for messages whose exact backend wording may vary slightly. */
const SESSION_ERROR_HINT_PATTERNS: Array<{ test: RegExp; message: string }> = [
    {
        test: /persona.*customer segment.*does not match/i,
        message:
            "This persona doesn't match your division's target buyers. Choose a different persona.",
    },
]

export function isSegmentMismatchError(err: unknown): boolean {
    const raw = getRawDetail(err)
    return Boolean(raw && SESSION_ERROR_HINT_PATTERNS[0].test.test(raw))
}

function getRawDetail(err: unknown): string | undefined {
    const data =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response
            ? (err.response as { data?: { detail?: string; message?: string } }).data
            : undefined

    return data?.detail || data?.message
}

export function getApiErrorMessage(
    err: unknown,
    fallback = 'Something went wrong. Please try again.',
): string {
    const raw = getRawDetail(err) || fallback
    if (SESSION_ERROR_HINTS[raw]) return SESSION_ERROR_HINTS[raw]
    const patternMatch = SESSION_ERROR_HINT_PATTERNS.find((p) => p.test.test(raw))
    if (patternMatch) return patternMatch.message
    return raw
}
