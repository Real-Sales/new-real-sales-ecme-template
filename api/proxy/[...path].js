const TARGET_ORIGIN = 'http://34.93.171.133:8080'

const HOP_BY_HOP_HEADERS = new Set([
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
    'host',
    'content-length',
])

function buildTargetUrl(req) {
    const path = Array.isArray(req.query.path) ? req.query.path.join('/') : ''
    const queryString = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
    return `${TARGET_ORIGIN}/${path}${queryString}`
}

function buildForwardHeaders(req) {
    const headers = new Headers()

    Object.entries(req.headers || {}).forEach(([key, value]) => {
        if (!value || HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
            return
        }
        if (Array.isArray(value)) {
            value.forEach((item) => headers.append(key, item))
        } else {
            headers.set(key, value)
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

export default async function handler(req, res) {
    try {
        const upstreamResponse = await fetch(buildTargetUrl(req), {
            method: req.method,
            headers: buildForwardHeaders(req),
            body: buildForwardBody(req),
        })

        const contentType = upstreamResponse.headers.get('content-type')
        if (contentType) {
            res.setHeader('content-type', contentType)
        }

        const setCookie = upstreamResponse.headers.get('set-cookie')
        if (setCookie) {
            res.setHeader('set-cookie', setCookie)
        }

        const responseText = await upstreamResponse.text()
        res.status(upstreamResponse.status).send(responseText)
    } catch (error) {
        res.status(502).json({
            message: 'Proxy request failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}
