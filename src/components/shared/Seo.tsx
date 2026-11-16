import { useEffect } from 'react'
import {
    SEO_DEFAULT_IMAGE,
    SEO_SITE_NAME,
    SEO_TWITTER_HANDLE,
    absoluteUrl,
    type SeoPageConfig,
} from '@/configs/seo.config'

type SeoProps = SeoPageConfig

const META_ATTR = 'data-sw-seo'
const LINK_ATTR = 'data-sw-seo'
const SCRIPT_ATTR = 'data-sw-seo-jsonld'

function setMeta(
    attr: 'name' | 'property',
    key: string,
    content: string,
) {
    let el = document.head.querySelector<HTMLMetaElement>(
        `meta[${attr}="${key}"][${META_ATTR}]`,
    )
    if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        el.setAttribute(META_ATTR, '1')
        document.head.appendChild(el)
    }
    el.setAttribute('content', content)
}

function setCanonical(href: string) {
    let el = document.head.querySelector<HTMLLinkElement>(
        `link[rel="canonical"][${LINK_ATTR}]`,
    )
    if (!el) {
        // Prefer controlling the static canonical from index.html when present
        el =
            document.head.querySelector<HTMLLinkElement>(
                'link[rel="canonical"]',
            ) ?? null
        if (!el) {
            el = document.createElement('link')
            el.setAttribute('rel', 'canonical')
            document.head.appendChild(el)
        }
        el.setAttribute(LINK_ATTR, '1')
    }
    el.setAttribute('href', href)
}

function setJsonLd(data?: SeoProps['jsonLd']) {
    document.head
        .querySelectorAll(`script[${SCRIPT_ATTR}]`)
        .forEach((node) => node.remove())

    if (!data) return

    const blocks = Array.isArray(data) ? data : [data]
    for (const block of blocks) {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.setAttribute(SCRIPT_ATTR, '1')
        script.text = JSON.stringify(block)
        document.head.appendChild(script)
    }
}

/**
 * Client-side document head manager for public marketing routes.
 * Complements static tags in index.html once React hydrates.
 */
const Seo = ({
    title,
    description,
    path,
    keywords,
    image = SEO_DEFAULT_IMAGE,
    noindex = false,
    jsonLd,
}: SeoProps) => {
    useEffect(() => {
        const url = absoluteUrl(path)
        const ogImage = absoluteUrl(image)

        document.title = title

        setMeta('name', 'description', description)
        if (keywords) setMeta('name', 'keywords', keywords)
        setMeta(
            'name',
            'robots',
            noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
        )
        setCanonical(url)

        setMeta('property', 'og:type', 'website')
        setMeta('property', 'og:site_name', SEO_SITE_NAME)
        setMeta('property', 'og:url', url)
        setMeta('property', 'og:title', title)
        setMeta('property', 'og:description', description)
        setMeta('property', 'og:image', ogImage)

        setMeta('name', 'twitter:card', 'summary_large_image')
        setMeta('name', 'twitter:site', SEO_TWITTER_HANDLE)
        setMeta('name', 'twitter:title', title)
        setMeta('name', 'twitter:description', description)
        setMeta('name', 'twitter:image', ogImage)

        setJsonLd(jsonLd)
    }, [
        title,
        description,
        path,
        keywords,
        image,
        noindex,
        // Stable compare for object/array payloads
        JSON.stringify(jsonLd ?? null),
    ])

    return null
}

export default Seo
