import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

/**
 * Pixel cutoffs (inclusive lower bound).
 *  - mobile : 0       … 767px
 *  - tablet : 768px   … 1023px
 *  - desktop: 1024px  … ∞
 *
 * Tweak here to retune the whole app at once.
 */
export const VIEWPORT_BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const

export type ViewportState = {
  breakpoint: Breakpoint
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTabletOrSmaller: boolean
  isTabletOrLarger: boolean
}

const ViewportContext = createContext<ViewportState | undefined>(undefined)

type ViewportProviderProps = {
  children: ReactNode
  /** Override the default breakpoint at which mobile UI is delivered. */
  mobileMaxWidth?: number
  /** Override the default breakpoint at which desktop UI is delivered. */
  desktopMinWidth?: number
}

export function ViewportProvider({
  children,
  mobileMaxWidth = VIEWPORT_BREAKPOINTS.tablet - 1,
  desktopMinWidth = VIEWPORT_BREAKPOINTS.desktop,
}: ViewportProviderProps) {
  const isMobile = useMediaQuery(`(max-width: ${mobileMaxWidth}px)`)
  const isDesktop = useMediaQuery(`(min-width: ${desktopMinWidth}px)`)
  const isTablet = !isMobile && !isDesktop

  const value = useMemo<ViewportState>(() => {
    const breakpoint: Breakpoint = isMobile ? 'mobile' : isDesktop ? 'desktop' : 'tablet'
    return {
      breakpoint,
      isMobile,
      isTablet,
      isDesktop,
      isTabletOrSmaller: isMobile || isTablet,
      isTabletOrLarger: isTablet || isDesktop,
    }
  }, [isMobile, isTablet, isDesktop])

  return <ViewportContext.Provider value={value}>{children}</ViewportContext.Provider>
}

export function useViewport(): ViewportState {
  const ctx = useContext(ViewportContext)
  if (!ctx) {
    throw new Error('useViewport must be used inside a <ViewportProvider>')
  }
  return ctx
}
