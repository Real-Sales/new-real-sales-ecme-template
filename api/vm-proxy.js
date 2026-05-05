/**
 * BFF proxy — invoked via vercel.json rewrite from /api/proxy/* → /api/vm-proxy?__p=...
 * Frontend keeps base URL /api/proxy (no code changes there).
 * Set PROXY_TARGET_ORIGIN on Vercel (e.g. http://YOUR_VM_IP:8000), no trailing slash.
 */
const DEFAULT_TARGET = 'http://34.93.171.133:8000'

const SAFE_HEADER_NAMES = new Set([
    'accept',
    'accept-language',
    'authorization',
    'content-type',
    'cookie',
    'user-agent',
    'x-requested-with',
    'x-csrf-token',
])

function getTargetOrigin() {
    const raw = process.env.PROXY_TARGET_ORIGIN || DEFAULT_TARGET
    return raw.replace(/\/$/, '')
}

function normalizeForwardedPath(req) {
    const raw = req.query?.__p
    if (Array.isArray(raw)) {
        return raw.map(String).join('/')
    }
    if (typeof raw === 'string') {
        return raw
    }
    return ''
}

function buildTargetUrl(req) {
    const forwardPath = normalizeForwardedPath(req).replace(/^\/+/, '')
    const rawUrl = req.url || ''
    const internal = new URL(rawUrl, 'http://internal')
    const backendQuery = new URLSearchParams()
    internal.searchParams.forEach((value, key) => {
        if (key !== '__p') {
            backendQuery.append(key, value)
        }
    })
    const qs = backendQuery.toString()
    const queryString = qs ? `?${qs}` : ''
    const origin = getTargetOrigin()
    const pathPart = forwardPath ? `/${forwardPath}` : ''
    return `${origin}${pathPart}${queryString}`
}

function buildForwardHeaders(req) {
    const headers = new Headers()
    const incoming = req.headers || {}

    SAFE_HEADER_NAMES.forEach((name) => {
        const value = incoming[name]
        if (!value) return
        if (Array.isArray(value)) {
            value.forEach((v) => headers.append(name, v))
        } else {
            headers.set(name, value)
        }
    })

    return headers
}

function buildForwardBody(req) {
    const method = (req.method || '').toUpperCase()
    if (method === 'GET' || method === 'HEAD') {
        return undefined
    }
    if (req.body == null) {
        return undefined
    }
    if (typeof req.body === 'string' || req.body instanceof Uint8Array) {
        return req.body
    }
    return JSON.stringify(req.body)
}

function forwardSetCookies(res, upstream) {
    const anyHeaders = upstream.headers
    if (typeof anyHeaders.getSetCookie === 'function') {
        const cookies = anyHeaders.getSetCookie()
        if (cookies?.length) {
            res.setHeader('set-cookie', cookies)
        }
        return
    }
    const single = upstream.headers.get('set-cookie')
    if (single) {
        res.setHeader('set-cookie', single)
    }
}

export default async function handler(req, res) {
    const targetUrl = buildTargetUrl(req)

    try {
        const upstreamResponse = await fetch(targetUrl, {
            method: req.method,
            headers: buildForwardHeaders(req),
            body: buildForwardBody(req),
        })

        const contentType = upstreamResponse.headers.get('content-type')
        if (contentType) {
            res.setHeader('content-type', contentType)
        }

        forwardSetCookies(res, upstreamResponse)

        const responseText = await upstreamResponse.text()
        return res.status(upstreamResponse.status).send(responseText)
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        const code = error && typeof error === 'object' && 'cause' in error ? error.cause : undefined
        console.error('[api/vm-proxy]', targetUrl, msg, code)

        return res.status(502).json({
            message: 'Proxy request failed',
            targetUrl,
            error: msg,
            hint: 'If this is ECONNREFUSED or ETIMEDOUT, open GCP firewall for your API port (e.g. 8000) and ensure the API listens on 0.0.0.0.',
        })
    }
}
