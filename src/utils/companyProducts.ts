import type { ProfileProduct } from '@/@types/auth'
import { formatDisplayLabel } from '@/utils/formatDisplayLabel'

export const MAX_DIVISION_PRODUCTS = 3

export type ProductSelectOption = { value: string; label: string }

export function capDivisionProductIds(ids: string[]): string[] {
    return ids.filter(Boolean).slice(0, MAX_DIVISION_PRODUCTS)
}

export function profileProductsToOptions(
    products: ProfileProduct[] | undefined,
): ProductSelectOption[] {
    return (products ?? [])
        .filter((p) => p.product_id)
        .map((p) => ({
            value: p.product_id,
            label: formatDisplayLabel(p.name),
        }))
}

export function mergeProductOptions(
    ...groups: ProductSelectOption[][]
): ProductSelectOption[] {
    const seen = new Set<string>()
    const merged: ProductSelectOption[] = []
    for (const group of groups) {
        for (const option of group) {
            if (!option.value || seen.has(option.value)) continue
            seen.add(option.value)
            merged.push(option)
        }
    }
    return merged
}
