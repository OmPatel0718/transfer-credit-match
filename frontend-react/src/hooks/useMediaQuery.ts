import { useEffect, useState } from 'react'

/**
 * Subscribe to a CSS media query and return whether it currently matches.
 * Uses `matchMedia` so the browser only notifies us when the boolean flips,
 * which is far cheaper than listening to every `resize` event.
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const getInitial = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return defaultValue
    }
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(getInitial)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const mql = window.matchMedia(query)
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)

    setMatches(mql.matches)

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    }

    // Safari < 14 fallback
    mql.addListener(handler)
    return () => mql.removeListener(handler)
  }, [query])

  return matches
}
