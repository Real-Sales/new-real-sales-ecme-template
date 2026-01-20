import store from '@/store'
import { setUser } from '@/store/slices/auth/userSlice'
import type { AxiosError } from 'axios'

const unauthorizedCode = [401, 419, 440]

const AxiosResponseIntrceptorErrorCallback = (error: AxiosError) => {
    const { response } = error

    if (response && unauthorizedCode.includes(response.status)) {
        store.dispatch(setUser({}))
    }
}

export default AxiosResponseIntrceptorErrorCallback
