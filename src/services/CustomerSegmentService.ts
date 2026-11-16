import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type CustomerSegment = {
    customer_segment_id: string
    name: string
    description: string
    created_at?: string
    updated_at?: string
}

export type CustomerSegmentSlim = {
    customer_segment_id: string
    name: string
}

export const CUSTOMER_SEGMENT_IDS = {
    B2B_MANUFACTURER: 'a0000001-0000-4000-8000-000000000001',
    B2B_RETAIL_CHANNEL: 'a0000002-0000-4000-8000-000000000002',
    INSTITUTIONAL: 'a0000003-0000-4000-8000-000000000003',
    CHANNEL_PARTNERS: 'a0000004-0000-4000-8000-000000000004',
    PUBLIC_GOVERNMENT: 'a0000005-0000-4000-8000-000000000005',
    ENTERPRISE_B2B: 'a0000006-0000-4000-8000-000000000006',
} as const

/**
 * Stable seed data for manager-facing dropdowns. GET /customer-segments
 * currently requires super_admin, so division forms (sales_manager+) use
 * this fallback list instead of calling the API.
 */
export const CUSTOMER_SEGMENT_SEED_OPTIONS: CustomerSegmentSlim[] = [
    { customer_segment_id: CUSTOMER_SEGMENT_IDS.B2B_MANUFACTURER, name: 'B2B Manufacturer' },
    { customer_segment_id: CUSTOMER_SEGMENT_IDS.B2B_RETAIL_CHANNEL, name: 'B2B Retail and Channel' },
    { customer_segment_id: CUSTOMER_SEGMENT_IDS.INSTITUTIONAL, name: 'Institutional / Hospitality' },
    { customer_segment_id: CUSTOMER_SEGMENT_IDS.CHANNEL_PARTNERS, name: 'Channel Partners' },
    { customer_segment_id: CUSTOMER_SEGMENT_IDS.PUBLIC_GOVERNMENT, name: 'Public and Government' },
    { customer_segment_id: CUSTOMER_SEGMENT_IDS.ENTERPRISE_B2B, name: 'Enterprise B2B' },
]

export async function apiGetCustomerSegments() {
    return ApiService.fetchDataWithAxios<CustomerSegment[]>({
        url: endpointConfig.customerSegments,
        method: 'get',
    })
}

export async function apiGetCustomerSegmentById(customerSegmentId: string) {
    return ApiService.fetchDataWithAxios<CustomerSegment>({
        url: endpointConfig.customerSegmentById(customerSegmentId),
        method: 'get',
    })
}
