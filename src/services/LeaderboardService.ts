import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
    LeaderboardResponse,
    FetchLeaderboardParams,
} from '@/views/sales/Leaderboard/types'

export async function apiGetLeaderboard(params: FetchLeaderboardParams = {}) {
    return ApiService.fetchDataWithAxios<LeaderboardResponse>({
        url: endpointConfig.leaderboard,
        method: 'get',
        params: {
            ...(params.month !== undefined && { month: params.month }),
            ...(params.limit !== undefined && { limit: params.limit }),
        },
    })
}
