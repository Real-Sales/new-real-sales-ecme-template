export const SEO_SITE_URL = 'https://www.saleswana.com'
export const SEO_SITE_NAME = 'SalesWana'
export const SEO_DEFAULT_IMAGE = `${SEO_SITE_URL}/img/logo/logo-dark-full.png`
export const SEO_TWITTER_HANDLE = '@saleswana'

export type SeoPageConfig = {
    title: string
    description: string
    path: string
    keywords?: string
    image?: string
    noindex?: boolean
    jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

const defaultKeywords =
    'AI sales training, sales roleplay, AI buyer simulation, sales enablement, sales coaching, voice sales practice, SalesWana'

export const seoPages = {
    home: {
        title: 'SalesWana — AI Sales Training Platform | Train Smarter. Close Faster.',
        description:
            'Practice high-stakes sales conversations with AI buyers that challenge, interrupt, and negotiate like real prospects. Voice-first roleplay, scoring, and team analytics for revenue teams.',
        path: '/',
        keywords: defaultKeywords,
    },
    landing: {
        title: 'SalesWana — AI Sales Training Platform | Train Smarter. Close Faster.',
        description:
            'Practice high-stakes sales conversations with AI buyers that challenge, interrupt, and negotiate like real prospects. Voice-first roleplay, scoring, and team analytics for revenue teams.',
        path: '/landing',
        keywords: defaultKeywords,
    },
    about: {
        title: 'About SalesWana | How AI Sales Roleplay Works',
        description:
            'Learn how SalesWana helps revenue teams practice discovery, objection handling, and closing with realistic AI buyers — and why it beats peer roleplay.',
        path: '/about',
        keywords:
            'about SalesWana, AI sales roleplay, sales training platform, sales enablement software',
    },
    faqs: {
        title: 'SalesWana FAQs | AI Sales Training Questions Answered',
        description:
            'Answers about SalesWana AI sales training: how sessions work, scoring, enterprise plans, custom scenarios, and who the platform is built for.',
        path: '/faqs',
        keywords:
            'SalesWana FAQ, AI sales training questions, sales roleplay FAQ',
    },
    bookDemo: {
        title: 'Book a SalesWana Demo | AI Sales Training for Teams',
        description:
            'See SalesWana live. Book a demo to explore AI buyer simulations, coaching analytics, and team rollout for your revenue org.',
        path: '/book-demo',
        keywords:
            'SalesWana demo, book sales training demo, AI sales coaching demo',
    },
    foodAndBeverages: {
        title: 'AI Sales Training for Food & Beverage | SalesWana',
        description:
            'Practice buyer conversations for food and beverage sales with industry-specific AI personas, objections, and coaching feedback.',
        path: '/industries/food-and-beverages',
        keywords:
            'food and beverage sales training, F&B sales roleplay, AI sales training industry',
    },
} satisfies Record<string, SeoPageConfig>

export function absoluteUrl(path: string): string {
    if (path.startsWith('http')) return path
    const normalized = path.startsWith('/') ? path : `/${path}`
    return `${SEO_SITE_URL}${normalized}`
}

export function organizationJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SEO_SITE_NAME,
        url: SEO_SITE_URL,
        logo: SEO_DEFAULT_IMAGE,
        email: 'hello@saleswana.com',
        description:
            'AI-powered sales training platform with realistic buyer roleplay, scoring, and team analytics.',
        contactPoint: {
            '@type': 'ContactPoint',
            email: 'hello@saleswana.com',
            contactType: 'customer support',
            availableLanguage: 'English',
        },
    }
}

export function websiteJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SEO_SITE_NAME,
        url: SEO_SITE_URL,
        description:
            'AI sales training with live buyer simulations for modern revenue teams.',
        publisher: {
            '@type': 'Organization',
            name: SEO_SITE_NAME,
            url: SEO_SITE_URL,
        },
    }
}

export function softwareApplicationJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: SEO_SITE_NAME,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: absoluteUrl('/'),
        description:
            'AI-powered sales training platform with realistic buyer roleplay, scoring, and team analytics.',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free tier with training sessions available',
        },
        publisher: {
            '@type': 'Organization',
            name: SEO_SITE_NAME,
            url: SEO_SITE_URL,
            email: 'hello@saleswana.com',
        },
    }
}

export function faqPageJsonLd(
    faqs: Array<{ question: string; answer: string }>,
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer.replace(/\n+/g, ' ').trim(),
            },
        })),
    }
}
