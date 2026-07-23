import { useEffect } from 'react'

/** Absolute origin used for og:image / og:url. Update if the production domain changes. */
const SITE_URL = 'https://nyrawallet.com'

type PageMeta = {
  title: string
  description: string
  /** Path to the share image under /public, e.g. "og-pricing.jpg". */
  image: string
  /** Route path for og:url, e.g. "/pricing". */
  path: string
}

function setTag(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Keeps the document title and social-share meta tags in sync with the current
 * page during client-side navigation. Note: static crawlers that do not run JS
 * read the defaults baked into index.html — per-page delivery to those requires
 * server-side rendering or prerendering.
 */
export function usePageMeta({ title, description, image, path }: PageMeta) {
  useEffect(() => {
    const imageUrl = `${SITE_URL}/${image}`
    const pageUrl = `${SITE_URL}${path}`

    document.title = title
    setTag('meta[name="description"]', 'name', 'description', description)

    setTag('meta[property="og:title"]', 'property', 'og:title', title)
    setTag('meta[property="og:description"]', 'property', 'og:description', description)
    setTag('meta[property="og:image"]', 'property', 'og:image', imageUrl)
    setTag('meta[property="og:url"]', 'property', 'og:url', pageUrl)

    setTag('meta[property="twitter:title"]', 'property', 'twitter:title', title)
    setTag('meta[property="twitter:description"]', 'property', 'twitter:description', description)
    setTag('meta[property="twitter:image"]', 'property', 'twitter:image', imageUrl)
  }, [title, description, image, path])
}
