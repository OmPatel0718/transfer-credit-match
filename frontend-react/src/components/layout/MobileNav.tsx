import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useRoleView } from '../../context/RoleViewContext'
import { useTheme } from '../../context/ThemeContext'

type NavItem = { to: string; label: string }

function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { role, isLoggedIn, authEmail, displayName, setRole, setIsLoggedIn, clearAuthSession } = useRoleView()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const canAccessDirectorView = isLoggedIn && (role === 'admin' || role === 'director')
  const loginIdentity =
    displayName?.trim() ||
    authEmail?.trim() ||
    `${role.charAt(0).toUpperCase()}${role.slice(1)} user`

  const items: NavItem[] = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/match', label: 'Match' },
    ...(canAccessDirectorView ? [{ to: '/dashboard', label: 'Director View' }] : []),
    { to: '/institutions', label: 'Institutions' },
    { to: '/programs', label: 'Programs' },
  ]

  const handleLogout = () => {
    clearAuthSession()
    setIsLoggedIn(false)
    setRole('student')
    setOpen(false)
    navigate('/login')
  }

  return (
    <>
      <style>{`
        .mn-bar{
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.65rem 1rem;
          background: var(--nav-bg);
          color: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        }
        .mn-brand{
          font-weight: 700;
          font-size: 1rem;
          margin-right: auto;
          color: #fff;
          text-decoration: none;
        }
        .mn-iconbtn{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.35);
          background: transparent;
          color: #fff;
          cursor: pointer;
          font-size: 1.1rem;
        }
        .mn-iconbtn:active{ transform: translateY(1px); }
        .mn-burger-lines{
          display: inline-flex;
          flex-direction: column;
          gap: 4px;
        }
        .mn-burger-lines span{
          width: 20px;
          height: 2px;
          background: #fff;
          border-radius: 2px;
        }
        .mn-overlay{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 60;
          opacity: 0;
          pointer-events: none;
          transition: opacity 180ms ease;
        }
        .mn-overlay.is-open{ opacity: 1; pointer-events: auto; }
        .mn-drawer{
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          width: min(82vw, 320px);
          background: var(--mm-surface, #fff);
          color: var(--mm-text, #0f172a);
          z-index: 61;
          transform: translateX(100%);
          transition: transform 220ms ease;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 30px rgba(0,0,0,0.18);
        }
        .mn-drawer.is-open{ transform: translateX(0%); }
        .mn-drawer-head{
          display: flex;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(15,23,42,0.08);
        }
        .mn-drawer-title{
          font-weight: 700;
          font-size: 1rem;
          margin-right: auto;
        }
        .mn-close{
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(15,23,42,0.15);
          background: transparent;
          cursor: pointer;
          font-size: 1.2rem;
        }
        .mn-identity{
          padding: 10px 16px;
          font-size: 0.85rem;
          color: rgba(15,23,42,0.7);
          border-bottom: 1px solid rgba(15,23,42,0.08);
        }
        .mn-list{
          list-style: none;
          margin: 0;
          padding: 8px 0;
          flex: 1;
          overflow-y: auto;
        }
        .mn-link{
          display: block;
          padding: 14px 18px;
          color: var(--mm-text, #0f172a);
          text-decoration: none;
          font-size: 1rem;
          border-left: 3px solid transparent;
        }
        .mn-link.is-active{
          background: rgba(154, 210, 138, 0.18);
          border-left-color: var(--mm-green, #9ad28a);
          font-weight: 600;
        }
        .mn-actions{
          padding: 12px 16px 18px;
          border-top: 1px solid rgba(15,23,42,0.08);
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .mn-btn{
          flex: 1 1 auto;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(15,23,42,0.18);
          background: transparent;
          color: var(--mm-text, #0f172a);
          text-align: center;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
        }
        .mn-btn.is-primary{
          background: var(--mm-green, #9ad28a);
          border-color: transparent;
          color: #0b0f14;
        }
      `}</style>

      <nav className="mn-bar" aria-label="Primary">
        <Link to="/" className="mn-brand">Transfer Credit Match</Link>

        <button
          type="button"
          className="mn-iconbtn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '☀️' : '🌙'}
        </button>

        <button
          type="button"
          className="mn-iconbtn"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
        >
          <span className="mn-burger-lines" aria-hidden="true">
            <span /><span /><span />
          </span>
        </button>
      </nav>

      <div
        className={`mn-overlay${open ? ' is-open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside
        id="mobile-nav-drawer"
        className={`mn-drawer${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="mn-drawer-head">
          <span className="mn-drawer-title">Menu</span>
          <button
            type="button"
            className="mn-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {isLoggedIn && (
          <div className="mn-identity" title={loginIdentity}>
            Logged in as <strong>{loginIdentity}</strong>
          </div>
        )}

        <ul className="mn-list">
          {items.map((item) => {
            const active = location.pathname === item.to
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`mn-link${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mn-actions">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="mn-btn">Login</Link>
              <Link to="/register" className="mn-btn is-primary">Register</Link>
            </>
          ) : (
            <button type="button" className="mn-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

export default MobileNav
