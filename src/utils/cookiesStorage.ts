import Cookies from 'js-cookie'

const cookiesStorage = {
    getItem: (name: string) => Promise.resolve(Cookies.get(name) ?? null),
    setItem: (name: string, value: string) => Promise.resolve(Cookies.set(name, value, { expires: 1 })),
    removeItem: (name: string) => Promise.resolve(Cookies.remove(name)),
}

export default cookiesStorage
