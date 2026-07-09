/**
 * F&B industry merge: `food_and_beverage_Equipment_and_Service_Sales` and
 * `Beverage_CPG_Sales_(Consumer Packaged Goods)` were unified into a single
 * `Food_and_Beverages` industry on the backend. Companies/personas created
 * before the migration may still carry the old strings — normalize them for
 * display.
 */
export const LEGACY_INDUSTRY_ALIASES: Record<string, string> = {
    food_and_beverage_Equipment_and_Service_Sales: 'Food_and_Beverages',
    'Beverage_CPG_Sales_(Consumer Packaged Goods)': 'Food_and_Beverages',
}

export function normalizeIndustryName(name: string): string {
    return LEGACY_INDUSTRY_ALIASES[name] ?? name
}
