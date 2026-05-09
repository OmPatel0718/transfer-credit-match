import type { ReactNode } from 'react'
import { useViewport } from '../../context/ViewportContext'

type GuardProps = { children: ReactNode }

/** Renders children only on viewports the provider classifies as `mobile`. */
export function Mobile({ children }: GuardProps) {
  const { isMobile } = useViewport()
  return isMobile ? <>{children}</> : null
}

/** Renders children only on viewports the provider classifies as `tablet`. */
export function Tablet({ children }: GuardProps) {
  const { isTablet } = useViewport()
  return isTablet ? <>{children}</> : null
}

/** Renders children only on viewports the provider classifies as `desktop`. */
export function Desktop({ children }: GuardProps) {
  const { isDesktop } = useViewport()
  return isDesktop ? <>{children}</> : null
}

/** Mobile + tablet (i.e. anything that isn't desktop). */
export function TabletOrSmaller({ children }: GuardProps) {
  const { isTabletOrSmaller } = useViewport()
  return isTabletOrSmaller ? <>{children}</> : null
}

/** Tablet + desktop (i.e. anything that isn't mobile). */
export function TabletOrLarger({ children }: GuardProps) {
  const { isTabletOrLarger } = useViewport()
  return isTabletOrLarger ? <>{children}</> : null
}

type ResponsiveSwitchProps = {
  mobile: ReactNode
  desktop: ReactNode
  /**
   * Optional tablet override. When omitted, tablet falls back to `desktop`,
   * which matches the "deliver the desktop layout unless the screen is small"
   * default most pages want.
   */
  tablet?: ReactNode
}

/**
 * Pick exactly one subtree to render based on the active breakpoint.
 *
 * @example
 *   <ResponsiveSwitch mobile={<MobileNav />} desktop={<DesktopNav />} />
 */
export function ResponsiveSwitch({ mobile, tablet, desktop }: ResponsiveSwitchProps) {
  const { breakpoint } = useViewport()
  if (breakpoint === 'mobile') return <>{mobile}</>
  if (breakpoint === 'tablet') return <>{tablet ?? desktop}</>
  return <>{desktop}</>
}
