import { useEffect, useSyncExternalStore } from 'react'

export const AUTH_MOBILE_MQ = '(max-width: 900px)'

export function useIsAuthMobile() {
  return useSyncExternalStore(
    onStoreChange => {
      const mq = window.matchMedia(AUTH_MOBILE_MQ)
      mq.addEventListener('change', onStoreChange)
      return () => mq.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia(AUTH_MOBILE_MQ).matches,
    () => false,
  )
}

/** Prevents sideways document scroll (auth, docs mobile, etc.). */
export function useLockHorizontalScroll() {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const root = document.getElementById('root')

    const prev = {
      htmlOverflowX: html.style.overflowX,
      bodyOverflowX: body.style.overflowX,
      rootOverflowX: root?.style.overflowX ?? '',
      htmlMaxWidth: html.style.maxWidth,
      bodyMaxWidth: body.style.maxWidth,
      rootMaxWidth: root?.style.maxWidth ?? '',
      bodyOverscrollX: body.style.overscrollBehaviorX,
    }

    html.style.overflowX = 'clip'
    html.style.maxWidth = '100%'
    body.style.overflowX = 'clip'
    body.style.maxWidth = '100%'
    body.style.overscrollBehaviorX = 'none'
    if (root) {
      root.style.overflowX = 'clip'
      root.style.maxWidth = '100%'
    }

    html.classList.add('nyra-no-scroll-x')

    return () => {
      html.style.overflowX = prev.htmlOverflowX
      html.style.maxWidth = prev.htmlMaxWidth
      body.style.overflowX = prev.bodyOverflowX
      body.style.maxWidth = prev.bodyMaxWidth
      body.style.overscrollBehaviorX = prev.bodyOverscrollX
      if (root) {
        root.style.overflowX = prev.rootOverflowX
        root.style.maxWidth = prev.rootMaxWidth
      }
      html.classList.remove('nyra-no-scroll-x')
    }
  }, [])
}
