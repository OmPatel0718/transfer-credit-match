import { Link } from 'react-router-dom';

const NAV_GREEN = 'var(--nav-bg)';
const LANDING_PAGE_GRADIENT = `
  radial-gradient(
    circle at bottom left,
    rgba(34, 197, 94, 0.25) 0%,
    rgba(34, 197, 94, 0.12) 25%,
    rgba(255, 255, 255, 0.95) 60%
  )
`;

function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: LANDING_PAGE_GRADIENT }}>
      <div
        style={{
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
          padding: 'clamp(1.25rem, 2vw, 2rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
          boxSizing: 'border-box',
        }}
      >
      {/* Hero */}
      <section
        style={{
          padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem)',
          backgroundColor: '#e8f5e9',
          backgroundImage: 'none',
          borderRadius: '12px',
          textAlign: 'center',
          borderBottom: `3px solid ${NAV_GREEN}`,
          boxShadow: '0 4px 24px rgba(6, 88, 43, 0.12)',
        }}
      >
        <h1
          style={{
            margin: '0 0 0.75rem',
            fontSize: 'clamp(1.75rem, 2.5vw + 1rem, 2.35rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            color: '#1a1a1a',
          }}
        >
          About Transfer Credit Match
        </h1>
        <p
          style={{
            margin: '0 auto 1.5rem',
            maxWidth: 520,
            color: '#4a5568',
            fontSize: 'clamp(1rem, 1vw + 0.85rem, 1.125rem)',
            lineHeight: 1.5,
            letterSpacing: '0.02em',
          }}
        >
          Know where you stand before you transfer
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem 2rem',
            marginBottom: '1.75rem',
          }}
        >
          {[
            ['Built for', 'Roosevelt University'],
            ['Focus', 'What you learned'],
            ['Goal', 'Fewer lost credits'],
          ].map(([label, value]) => (
            <div key={value} style={{ textAlign: 'center', minWidth: 120 }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: NAV_GREEN,
                  fontWeight: 600,
                  marginBottom: '0.2rem',
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2d3748' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
        <Link
          to="/match"
          style={{
            display: 'inline-block',
            padding: '0.65rem 1.35rem',
            background: 'var(--nav-bg)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(6, 88, 43, 0.35)',
          }}
        >
          Try the match tool
        </Link>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: NAV_GREEN,
            fontWeight: 600,
          }}
        >
          Learn more
        </p>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Mission */}
          <article
            style={{
              background: '#fff',
              border: '1px solid #e2e8e0',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)',
              borderTop: `4px solid ${NAV_GREEN}`,
            }}
          >
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                margin: '0 0 0.85rem',
                color: '#1a202c',
                paddingBottom: '0.5rem',
                borderBottom: `2px solid ${NAV_GREEN}`,
                display: 'inline-block',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              Mission
            </h2>
            <p
              style={{
                margin: 0,
                color: '#4a5568',
                lineHeight: 1.6,
                maxWidth: '42em',
              }}
            >
              To empower students by translating their prior learning into meaningful
              credit opportunities, reducing lost credits and accelerating their path
              to graduation.
            </p>
          </article>

          {/* How it works */}
          <article
            style={{
              background: '#fff',
              borderWidth: '4px 1px 1px',
              borderStyle: 'solid',
              borderColor: 'var(--nav-bg)',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)',
            }}
          >
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                margin: '0 0 0.85rem',
                color: '#1a202c',
                paddingBottom: '0.5rem',
                borderBottom: `2px solid ${NAV_GREEN}`,
                display: 'inline-block',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              How it works
            </h2>
            <ol
              style={{
                margin: 0,
                paddingLeft: '1.25rem',
                color: '#4a5568',
                lineHeight: 1.65,
                maxWidth: '42em',
              }}
            >
              <li style={{ marginBottom: '0.65rem' }}>
                Enter or upload your completed coursework.
              </li>
              <li style={{ marginBottom: '0.65rem' }}>
                We analyze it using knowledge units against Roosevelt University degree
                requirements.
              </li>
              <li style={{ marginBottom: 0 }}>
                See how credits transfer and what you still need to graduate—based on
                what you learned, not just course titles.
              </li>
            </ol>
          </article>

          {/* Who it is for */}
          <article
            style={{
              background: '#fff',
              borderWidth: '4px 1px 1px',
              borderStyle: 'solid',
              borderColor: 'var(--nav-bg)',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)',
            }}
          >
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                margin: '0 0 0.85rem',
                color: '#1a202c',
                paddingBottom: '0.5rem',
                borderBottom: `2px solid ${NAV_GREEN}`,
                display: 'inline-block',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              Who it is for
            </h2>
            <p
              style={{
                margin: 0,
                color: '#4a5568',
                lineHeight: 1.6,
                maxWidth: '42em',
              }}
            >
              Transfer Credit Match is built for transfer students, adult learners, and
              anyone bringing credits from prior coursework who wants a clear picture of
              how those credits apply toward a Roosevelt University degree.
            </p>
          </article>
        </section>
      </div>

        <div style={{ textAlign: 'center', paddingBottom: '0.25rem' }}>
          <Link
            to="/match"
            style={{
              color: NAV_GREEN,
              fontWeight: 600,
              textDecoration: 'none',
              borderBottom: `2px solid ${NAV_GREEN}`,
              paddingBottom: '2px',
            }}
          >
            Start matching your credits
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
