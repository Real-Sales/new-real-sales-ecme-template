import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type InviteRole = 'sales_manager' | 'sales_person'

export type ValidateInviteResponse = {
    valid: boolean
    email: string
    role: InviteRole
    company_name: string
    company_id: string
}

export type CreateInviteRequest = {
    email: string
    role: InviteRole
}

export type InviteRecord = {
    invite_id: string
    email: string
    role: InviteRole
    status?: string
    created_at?: string
    expires_at?: string
}

export async function apiValidateInvite(token: string) {
    return ApiService.fetchDataWithAxios<ValidateInviteResponse>({
        url: endpointConfig.validateInvite(token),
        method: 'get',
    })
}

export async function apiCreateInvite(data: CreateInviteRequest) {
    return ApiService.fetchDataWithAxios<{ message?: string; invite_id?: string }>({
        url: endpointConfig.invites,
        method: 'post',
        data,
    })
}

export async function apiGetInvites(companyId: string) {
    return ApiService.fetchDataWithAxios<InviteRecord[]>({
        url: endpointConfig.invitesByCompany(companyId),
        method: 'get',
    })
}

export async function apiRevokeInvite(inviteId: string) {
    return ApiService.fetchDataWithAxios<{ message?: string }>({
        url: endpointConfig.inviteById(inviteId),
        method: 'delete',
    })
}
