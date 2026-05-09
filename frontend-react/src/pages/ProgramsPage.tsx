import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJson } from '../lib/api'

type ApiInstitution = {
  institutionId: number
  name: string
  location?: string | null
}

type ApiProgram = {
  programId: number
  institutionId: number
  programName: string
}

type ProgramRow = {
  id: number
  name: string
  type: string
  location: string
  description: string
  programDetails: string
}

function ProgramsPage() {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState<ProgramRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [expandedProgramId, setExpandedProgramId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    Promise.all([getJson<ApiInstitution[]>('/api/institutions'), getJson<ApiProgram[]>('/api/programs')])
      .then(([institutions, apiPrograms]) => {
        if (cancelled) return
        const byId = new Map<number, ApiInstitution>()
        ;(institutions ?? []).forEach((i) => byId.set(i.institutionId, i))
        const rows: ProgramRow[] = (apiPrograms ?? []).map((p) => {
          const inst = byId.get(p.institutionId)
          const loc = (inst?.location ?? '').split(',')[0]?.trim() || '—'
          const instName = inst?.name ?? `Institution ${p.institutionId}`
          return {
            id: p.programId,
            name: p.programName,
            type: '',
            location: loc,
            description: `Program at ${instName}.`,
            programDetails: `Institution: ${instName}. Transfer credit matching uses courses linked to this program in the database.`,
          }
        })
        setPrograms(rows)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : String(err))
        setPrograms([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const locationOptions = useMemo(() => {
    const set = new Set<string>()
    programs.forEach((p) => {
      if (p.location && p.location !== '—') set.add(p.location)
    })
    return ['All', ...Array.from(set).sort()]
  }, [programs])

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesSearch =
        program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesLocation = selectedLocation === 'All' || program.location === selectedLocation

      return matchesSearch && matchesLocation
    })
  }, [programs, searchTerm, selectedLocation])

  const handleStartMatching = (program: ProgramRow) => {
    navigate('/match', {
      state: {
        programId: program.id,
        programName: program.name,
        selectedProgram: program.name,
      },
    })
  }

  const toggleDetails = (programId: number) => {
    setExpandedProgramId(expandedProgramId === programId ? null : programId)
  }

  return (
    <div style={pageStyle}>
      <section style={heroStyle}>
        <h1 style={heroTitleStyle}>TRANSFER PROGRAMS</h1>
        <p style={heroSubtitleStyle}>
          Browse programs from participating institutions and start the transfer matching process.
        </p>
      </section>

      {loadError && (
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '16px 20px',
            color: '#b42318',
            background: '#fdecea',
            borderRadius: 8,
          }}
        >
          Could not load programs: {loadError}
        </div>
      )}

      <section style={topControlsWrapperStyle}>
        <div style={topButtonRowStyle}>
          <button
            style={primaryButtonStyle}
            onClick={() => {
              setSearchTerm('')
              setSelectedLocation('All')
            }}
          >
            SHOW ALL PROGRAMS
          </button>

          <button type="button" style={secondaryTopButtonStyle}>
            PROGRAMS BY TYPE
          </button>
        </div>
      </section>

      <section style={filterBarStyle}>
        <div style={searchRowStyle}>
          <input
            type="text"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
            disabled={loading}
          />

          <select style={selectStyle} defaultValue="">
            <option value="">Programs by Type</option>
          </select>
        </div>

        <div style={locationRowStyle}>
          <span style={locationLabelStyle}>Filter by location:</span>

          {locationOptions.map((location) => (
            <button
              key={location}
              type="button"
              onClick={() => setSelectedLocation(location)}
              style={{
                ...locationButtonStyle,
                ...(selectedLocation === location ? activeLocationButtonStyle : {}),
              }}
            >
              {location.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      <section style={gridStyle}>
        {loading ? (
          <div style={emptyStateStyle}>Loading programs…</div>
        ) : filteredPrograms.length > 0 ? (
          filteredPrograms.map((program) => (
            <div key={program.id} style={cardStyle}>
              <div>
                <h3 style={cardTitleStyle}>{program.name}</h3>
                <p style={cardLocationStyle}>{program.location}</p>
                <p style={cardDescriptionStyle}>{program.description}</p>
              </div>

              <div style={buttonGroupStyle}>
                <button type="button" style={detailsButtonStyle} onClick={() => toggleDetails(program.id)}>
                  {expandedProgramId === program.id ? 'HIDE COURSE DETAILS' : 'VIEW COURSE DETAILS'}
                </button>

                <button type="button" style={matchButtonStyle} onClick={() => handleStartMatching(program)}>
                  START MATCHING
                </button>
              </div>

              {expandedProgramId === program.id && (
                <div style={detailsBoxStyle}>
                  <h4 style={detailsHeadingStyle}>Program details</h4>
                  <p style={detailsTextStyle}>{program.programDetails}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={emptyStateStyle}>No programs match your current search or filters.</div>
        )}
      </section>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f4fbf6',
  paddingBottom: '50px',
}

const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(to bottom, #effaf1 0%, #e6f7ea 100%)',
  textAlign: 'center',
  padding: '70px 20px 45px',
  borderBottom: '2px solid #24844f',
}

const heroTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
  fontWeight: '800',
  letterSpacing: '1px',
  color: '#1f5f3f',
}

const heroSubtitleStyle: React.CSSProperties = {
  margin: '18px auto 0',
  maxWidth: '760px',
  color: '#2e6b45',
  fontSize: '1.05rem',
  lineHeight: '1.6',
}

const topControlsWrapperStyle: React.CSSProperties = {
  padding: '26px 20px 10px',
}

const topButtonRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '14px',
  flexWrap: 'wrap',
}

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#2f6f44',
  border: '2px solid #3f8d58',
  color: 'white',
  fontWeight: '700',
  padding: '14px 24px',
  cursor: 'pointer',
  borderRadius: '8px',
}

const secondaryTopButtonStyle: React.CSSProperties = {
  backgroundColor: '#eaf8ec',
  border: '2px solid #92b898',
  color: '#2f6f44',
  fontWeight: '700',
  padding: '14px 24px',
  cursor: 'pointer',
  borderRadius: '8px',
}

const filterBarStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '26px 20px 10px',
}

const searchRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '14px',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginBottom: '24px',
}

const searchInputStyle: React.CSSProperties = {
  minWidth: '300px',
  maxWidth: '500px',
  width: '100%',
  padding: '14px 16px',
  borderRadius: '8px',
  border: '1px solid #b8d8bf',
  backgroundColor: 'white',
  color: '#1f1f1f',
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  minWidth: '220px',
  padding: '14px 16px',
  borderRadius: '8px',
  border: '1px solid #b8d8bf',
  backgroundColor: 'white',
  color: '#1f1f1f',
  outline: 'none',
}

const locationRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  color: '#355e3b',
  marginBottom: '30px',
}

const locationLabelStyle: React.CSSProperties = {
  fontWeight: '700',
  marginRight: '6px',
}

const locationButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid transparent',
  color: '#2f6f44',
  padding: '8px 10px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '0.85rem',
}

const activeLocationButtonStyle: React.CSSProperties = {
  color: '#2f6f44',
  borderBottom: '2px solid #2f6f44',
}

const gridStyle: React.CSSProperties = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '0 20px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '18px',
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  border: '1px solid #d5ead8',
  borderRadius: '14px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  boxShadow: '0 4px 12px rgba(46, 139, 87, 0.08)',
}

const cardTitleStyle: React.CSSProperties = {
  fontSize: '1.6rem',
  margin: '0 0 10px 0',
  color: '#1f4d2e',
}

const cardLocationStyle: React.CSSProperties = {
  color: '#4f7a57',
  fontSize: '0.95rem',
  fontWeight: '600',
  marginBottom: '14px',
}

const cardDescriptionStyle: React.CSSProperties = {
  color: '#355e3b',
  lineHeight: '1.6',
  fontSize: '0.97rem',
  margin: 0,
}

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
}

const detailsButtonStyle: React.CSSProperties = {
  backgroundColor: '#edf8f0',
  color: '#2e6b3a',
  border: '1px solid #7bc47f',
  padding: '12px 16px',
  borderRadius: '8px',
  fontWeight: '700',
  cursor: 'pointer',
}

const matchButtonStyle: React.CSSProperties = {
  backgroundColor: '#2e8b57',
  color: 'white',
  border: 'none',
  padding: '12px 16px',
  borderRadius: '8px',
  fontWeight: '800',
  cursor: 'pointer',
}

const detailsBoxStyle: React.CSSProperties = {
  marginTop: '4px',
  padding: '16px',
  borderRadius: '10px',
  backgroundColor: '#f3fbf5',
  border: '1px solid #cfe7d4',
}

const detailsHeadingStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  color: '#1f4d2e',
  fontSize: '1rem',
}

const detailsTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#355e3b',
  lineHeight: '1.6',
}

const emptyStateStyle: React.CSSProperties = {
  gridColumn: '1 / -1',
  textAlign: 'center',
  padding: '40px 20px',
  color: '#355e3b',
  border: '1px solid #d5ead8',
  backgroundColor: 'white',
  borderRadius: '12px',
}

export default ProgramsPage
