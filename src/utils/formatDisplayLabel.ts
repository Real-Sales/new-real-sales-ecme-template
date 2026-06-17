/** Turn API snake_case keys into readable labels (e.g. B2B_Sales_(Generic) → B2B Sales (Generic)). */
export const formatDisplayLabel = (value: string) =>
    value
        .replace(/_/g, ' ')
        .split(' ')
        .map((w) => {
            const letters = w.replace(/[^a-zA-Z0-9]/g, '')
            if (
                letters.length <= 5 &&
                letters === letters.toUpperCase() &&
                /[A-Z]/.test(letters)
            ) {
                return w
            }
            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        })
        .join(' ')
