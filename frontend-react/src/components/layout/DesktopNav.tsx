import { Link, useNavigate } from 'react-router-dom'
import { useRoleView } from '../../context/RoleViewContext'
import { useTheme } from '../../context/ThemeContext'

function DesktopNav() {
  const navigate = useNavigate()
  const { role, isLoggedIn, authEmail, displayName, setRole, setIsLoggedIn, clearAuthSession } = useRoleView()
  const { theme, toggleTheme } = useTheme()

  const canAccessDirectorView = isLoggedIn && (role === 'admin' || role === 'director')

  const loginIdentity =
    displayName?.trim() ||
    authEmail?.trim() ||
    `${role.charAt(0).toUpperCase()}${role.slice(1)} user`

  const linkStyle: React.CSSProperties = {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.95rem',
  }

  return (
    <nav
      style={{
        padding: '0.75rem 1.5rem',
        background: 'var(--nav-bg)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '1rem' }}>
        Transfer Credit Match
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/about" style={linkStyle}>About</Link>
        <Link to="/match" style={linkStyle}>Match</Link>

        {canAccessDirectorView && (
          <Link to="/dashboard" style={linkStyle}>Director View</Link>
        )}

        <Link to="/institutions" style={linkStyle}>Institutions</Link>
        <Link to="/programs" style={linkStyle}>Programs</Link>
      </div>

      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        {isLoggedIn && (
          <span
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: '999px',
              padding: '0.3rem 0.7rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
            title={loginIdentity}
          >
            Logged in as {loginIdentity}
          </span>
        )}

        <button
          onClick={toggleTheme}
          style={{
            marginLeft: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid var(--link-color)',
            backgroundColor: 'transparent',
            color: 'var(--link-color)',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.25s ease',
          }}
        >
          {theme === 'light' ? '☀️' : '🌙'}
        </button>

        {!isLoggedIn ? (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              clearAuthSession()
              setIsLoggedIn(false)
              setRole('student')
              navigate('/login')
            }}
            style={{
              color: '#fff',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.65)',
              borderRadius: 6,
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}

export default DesktopNav
