// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom'
import { ResponsiveSwitch } from '../responsive/Responsive'
import DesktopNav from './DesktopNav'
import MobileNav from './MobileNav'

function AppLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ResponsiveSwitch
        mobile={<MobileNav />}
        desktop={<DesktopNav />}
      />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer
        style={{
          padding: '0.75rem 1.5rem',
          background: 'var(--footer-bg)',
          color: 'white',
          textAlign: 'center',
          fontSize: '0.85rem',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.15)',
        }}
      >
        © {new Date().getFullYear()} Transfer Credit Match. All rights reserved.
      </footer>
    </div>
  )
}

export default AppLayout
