/**
 * Shared search-field colors — matches Assigned Scenarios / Scenario Library.
 * Use as `className` on `Input` / `DebouceInput` that have prefix or suffix
 * (className lands on the wrapper, so we target `.input` inside).
 */
export const SEARCH_INPUT_CLASSNAME =
    '[&_.input]:!bg-gray-50 [&_.input]:dark:!bg-gray-800/50 [&_.input]:!border [&_.input]:!border-gray-200 [&_.input]:dark:!border-gray-700 [&_.input]:shadow-md [&_.input]:text-gray-900 [&_.input]:dark:!text-gray-200'

/** Direct classes for native <input> (no Input wrapper). */
export const SEARCH_NATIVE_INPUT_CLASSNAME =
    'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md text-gray-900 dark:text-gray-200 placeholder-gray-500'
