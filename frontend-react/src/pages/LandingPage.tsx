import type { CSSProperties } from 'react'

function LandingPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        fontFamily: '"Times New Roman", Times, serif', 
      }}
    >
      
      {/* HERO SECTION */}
      <section
        style={{
          padding: '3rem 2rem',
          background: '#edf8f0',
          borderRadius: '12px',
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <img
            src="/ru-banner.jpg"
            alt="Roosevelt University Banner"
            style={{
              width: '100%',
              height: 170,
              objectFit: 'contain',
              borderRadius: '10px',
              marginBottom: '1.5rem',
            }}
          />

          <h1 style={{ marginBottom: '0.5rem', color: '#1f4d2e' }}>
            Transfer to Roosevelt University
          </h1>

          <p style={{ margin: 0, color: '#355e3b' }}>
            Explore how your completed coursework transfers into Roosevelt University programs.
          </p>
        </div>
      </section>

      {/* FEATURE SECTIONS */}
      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >

        {/* Learn */}
        <div style={cardStyle}>
          <img src="/learn.jpg" alt="Learn about Roosevelt" style={imageStyle} />

          <h3 style={cardTitleStyle}>Learn About Roosevelt</h3>

          <p style={cardDescriptionStyle}>
            Discover how transfer credits work and understand how Roosevelt evaluates your completed coursework.
          </p>

          <a href="/about" style={cardButtonStyle}>
            Learn More
          </a>
        </div>

        {/* Match */}
        <div style={cardStyle}>
          <img src="/match.jpg" alt="Transfer credit matching" style={imageStyle} />

          <h3 style={cardTitleStyle}>Search Transfer Credits</h3>

          <p style={cardDescriptionStyle}>
            Enter your courses and see how they match Roosevelt University requirements.
          </p>

          <a href="/match" style={cardButtonStyle}>
            Start Matching
          </a>
        </div>

        {/* Programs */}
        <div style={cardStyle}>
          <img src="/programs.jpg" alt="Browse programs" style={imageStyle} />

          <h3 style={cardTitleStyle}>Browse Programs</h3>

          <p style={cardDescriptionStyle}>
            Explore Roosevelt University degree programs and academic pathways.
          </p>

          <a href="/programs" style={cardButtonStyle}>
            View Programs
          </a>
        </div>

      </section>
    </div>
  )
}


const cardStyle: CSSProperties = {
  border: '1px solid #d5ead8',
  borderRadius: '14px',
  padding: '1.2rem',
  background: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  boxShadow: '0 4px 12px rgba(46, 139, 87, 0.08)',
}

const imageStyle: CSSProperties = {
  width: '100%',
  height: 150,
  objectFit: 'cover',
  borderRadius: '10px',
}

const cardTitleStyle: CSSProperties = {
  fontSize: '1.2rem',
  color: '#1f4d2e',
  margin: '0.2rem 0',
}

const cardDescriptionStyle: CSSProperties = {
  color: '#355e3b',
  fontSize: '0.95rem',
  lineHeight: '1.5',
  margin: 0,
}


const cardButtonStyle: CSSProperties = {
  marginTop: 'auto',
  backgroundColor: "#edf8f0",
  color: "#2e6b3a",
  border: "1px solid #7bc47f",
  padding: "10px 14px",
  borderRadius: "8px",
  fontWeight: "700",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
  textAlign: "center",
}

export default LandingPage