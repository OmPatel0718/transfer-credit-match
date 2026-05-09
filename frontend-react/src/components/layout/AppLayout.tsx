// src/components/layout/AppLayout.tsx
import { Outlet, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useRoleView } from '../../context/RoleViewContext';
import { useTheme } from '../../context/ThemeContext';

function AppLayout() {
  const navigate = useNavigate();
  const { role, isLoggedIn, setRole } = useRoleView();
  const { theme, toggleTheme } = useTheme();
  const canAccessDirectorView = isLoggedIn && (role === 'admin' || role === 'director');

  const linkStyle: React.CSSProperties = {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.95rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Global Navigation mirroring legacy HTML structure */}
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
        <div style={{ fontWeight: 600, fontSize: '1rem' }}>Transfer Credit Match</div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/" style={linkStyle}>
            Home
          </Link>
          <Link to="/about" style={linkStyle}>
            About
          </Link>
          <Link to="/match" style={linkStyle}>
            Match
          </Link>
          {canAccessDirectorView && (
            <Link to="/dashboard" style={linkStyle}>
              Director View
            </Link>
          )}
          <Link to="/institutions" style={linkStyle}>
            Institutions
          </Link>
          <Link to="/programs" style={linkStyle}>
            Programs
          </Link>
        </div>

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          {/*dark and light mode theme toggle */}
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

          <Link to="/login" style={linkStyle}>
            Login
          </Link>
          <Link to="/register" style={linkStyle}>
            Register
          </Link>
        </div>
      </nav>

      {isLoggedIn && role === 'student' && (
        <div
          style={{
            backgroundColor: '#2f7e41',
            color: '#fff',
            padding: '0.55rem 1.5rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span>Viewing as Student</span>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              navigate('/dashboard');
            }}
            style={{
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: '#fff',
              padding: '0.3rem 0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Switch to Admin
          </button>
        </div>
      )}

      {/* Main Content Area (Pages will render here) */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet />
      </main>

      {/* Global Footer */}
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
  );
}


export default AppLayout;
