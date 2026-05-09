import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJson } from '../lib/api'

type Institution = {
  institutionId: number | string
  name: string
  location?: string | null
}

type Program = {
  institutionId: number | string
  programId?: number | string
  id?: number | string
  programName: string
}

function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function InstitutionsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [currentInstitutionId, setCurrentInstitutionId] = useState('')
  const [currentInstitutionQuery, setCurrentInstitutionQuery] = useState('')
  const [currentProgramValue, setCurrentProgramValue] = useState('')
  const [targetInstitutionId, setTargetInstitutionId] = useState('')
  const [targetInstitutionQuery, setTargetInstitutionQuery] = useState('')
  const [targetProgramValue, setTargetProgramValue] = useState('')
  const [selectionSummary, setSelectionSummary] = useState(
    'Select your current institution/program and target institution/program, then confirm.',
  )

  const currentInstitutionItems = useMemo(() => {
    const backendItems = institutions.map((institution) => ({
      value: String(institution.institutionId),
      display: institution.location
        ? `${institution.name} (${institution.location})`
        : institution.name,
    }))
    const seen = new Set<string>()
    const merged = backendItems.filter((item) => {
      const key = normalizeForSearch(item.display)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    return merged
  }, [institutions])

  const suggestedCurrentInstitutionItems = useMemo(() => {
    const query = normalizeForSearch(currentInstitutionQuery)
    if (!query) return currentInstitutionItems
    return currentInstitutionItems.filter((item) =>
      normalizeForSearch(item.display).includes(query),
    )
  }, [currentInstitutionItems, currentInstitutionQuery])

  const suggestedTargetInstitutionItems = useMemo(() => {
    const query = normalizeForSearch(targetInstitutionQuery)
    if (!query) return currentInstitutionItems
    return currentInstitutionItems.filter((item) =>
      normalizeForSearch(item.display).includes(query),
    )
  }, [currentInstitutionItems, targetInstitutionQuery])

  const currentProgramItems = useMemo(() => {
    if (!currentInstitutionId) return []
    return programs
      .filter((program) => String(program.institutionId) === String(currentInstitutionId))
      .map((program, index) => ({
        value: String(program.programId ?? program.id ?? `cp-${index}`),
        display: program.programName,
      }))
  }, [programs, currentInstitutionId])

  const targetProgramItems = useMemo(() => {
    if (!targetInstitutionId) return []
    return programs
      .filter((program) => String(program.institutionId) === String(targetInstitutionId))
      .map((program, index) => ({
        value: String(program.programId ?? program.id ?? `tp-${index}`),
        display: program.programName,
      }))
  }, [programs, targetInstitutionId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')
    Promise.all([getJson<Institution[]>('/api/institutions'), getJson<Program[]>('/api/programs')])
      .then(([loadedInstitutions, loadedPrograms]) => {
        if (cancelled) return
        setInstitutions(loadedInstitutions ?? [])
        setPrograms(loadedPrograms ?? [])
        const roosevelt = (loadedInstitutions ?? []).find((institution) =>
          normalizeForSearch(institution.name).includes('roosevelt'),
        )
        if (roosevelt) {
          setTargetInstitutionId(String(roosevelt.institutionId))
          setTargetInstitutionQuery(
            roosevelt.location ? `${roosevelt.name} (${roosevelt.location})` : roosevelt.name,
          )
        }
        const defaultCurrentInstitution = (loadedInstitutions ?? []).find(
          (institution) => !normalizeForSearch(institution.name).includes('roosevelt'),
        ) ?? (loadedInstitutions ?? [])[0]
        if (defaultCurrentInstitution) {
          setCurrentInstitutionId(String(defaultCurrentInstitution.institutionId))
          setCurrentInstitutionQuery(
            defaultCurrentInstitution.location
              ? `${defaultCurrentInstitution.name} (${defaultCurrentInstitution.location})`
              : defaultCurrentInstitution.name,
          )
        }
      })
      .catch((error) => {
        if (cancelled) return
        const message =
          error instanceof Error
            ? `Could not load institutions/programs: ${error.message}`
            : `Could not load institutions/programs: ${String(error)}`
        setLoadError(message)
        setSelectionSummary(message)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setCurrentProgramValue('')
  }, [currentInstitutionId])

  useEffect(() => {
    setTargetProgramValue('')
  }, [targetInstitutionId])

  useEffect(() => {
    if (!currentProgramValue && currentProgramItems.length > 0) {
      setCurrentProgramValue(currentProgramItems[0].value)
    }
  }, [currentProgramItems, currentProgramValue])

  useEffect(() => {
    if (!targetProgramValue && targetProgramItems.length > 0) {
      setTargetProgramValue(targetProgramItems[0].value)
    }
  }, [targetProgramItems, targetProgramValue])

  useEffect(() => {
    if (!loading && institutions.length === 0) {
      setSelectionSummary('No institutions are available in the backend yet.')
      return
    }
    if (!loading && targetInstitutionId && targetProgramItems.length === 0) {
      setSelectionSummary('No programs are available for the selected target institution.')
      return
    }
    setSelectionSummary('Select your current institution/program and target institution/program, then confirm.')
  }, [loading, institutions.length, targetInstitutionId, targetProgramItems.length])

  const canConfirm = Boolean(currentInstitutionId && currentProgramValue && targetInstitutionId && targetProgramValue)

  function handleConfirmSelection() {
    if (!canConfirm) {
      setSelectionSummary('Please select your current institution and a target program.')
      return
    }

    const currentItem = currentInstitutionItems.find(
      (item) => item.value === currentInstitutionId,
    )
    const currentLabel = currentItem ? currentItem.display : currentInstitutionId
    const currentProgramMatch = currentProgramItems.find((item) => item.value === currentProgramValue)
    const currentProgramLabel = currentProgramMatch ? currentProgramMatch.display : currentProgramValue
    const targetItem = currentInstitutionItems.find((item) => item.value === targetInstitutionId)
    const targetLabel = targetItem ? targetItem.display : targetInstitutionId
    const targetProgramMatch = targetProgramItems.find((item) => item.value === targetProgramValue)
    const targetProgramLabel = targetProgramMatch ? targetProgramMatch.display : targetProgramValue

    setSelectionSummary(
      `Current: ${currentLabel} (${currentProgramLabel}) → Target: ${targetLabel} | Target Program: ${targetProgramLabel}`,
    )

    const programId = Number(targetProgramValue)
    const currentInstitutionNumericId = Number(currentInstitutionId)
    const targetInstitutionNumericId = Number(targetInstitutionId)
    if (
      !Number.isFinite(programId) ||
      !Number.isFinite(currentInstitutionNumericId) ||
      !Number.isFinite(targetInstitutionNumericId)
    ) {
      setSelectionSummary('Selections must map to backend institutions and programs.')
      return
    }
    navigate('/match', {
      state: {
        programId,
        programName: targetProgramLabel,
        currentInstitutionId: currentInstitutionNumericId,
        targetInstitutionId: targetInstitutionNumericId,
        currentInstitutionLabel: currentLabel,
      },
    })
  }

  return (
    <>
      <style>{`
        :root{
          --mm-bg: #f3fbf4;
          --mm-surface: #ffffff;
          --mm-text: #0f172a;
          --mm-muted: rgba(15, 23, 42, 0.7);
          --mm-shadow: 0 18px 40px rgba(15, 23, 42, 0.10);
          --mm-green: #9ad28a;
          --mm-pill: rgba(15, 23, 42, 0.06);
        }
        .mm-page {
          background:
            radial-gradient(900px 260px at 0% 0%, #ffffff 0%, #ffffff 45%, rgba(255,255,255,0) 100%),
            linear-gradient(#ffffff, #ffffff) top / 100% 120px no-repeat,
            radial-gradient(1200px 500px at 20% 0%, rgba(154, 210, 138, 0.30), transparent 60%),
            radial-gradient(900px 420px at 90% 20%, rgba(154, 210, 138, 0.22), transparent 60%),
            linear-gradient(180deg, #ffffff 0%, var(--mm-bg) 45%, rgba(154, 210, 138, 0.25) 100%);
          color: var(--mm-text);
        }
        .mm-container{
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        .mm-title{
          font-weight: 800;
          letter-spacing: -0.02em;
          font-size: clamp(44px, 5vw, 74px);
          margin: 26px 0 14px 0;
        }
        .mm-hero{
          position: relative;
          height: 240px;
          border-radius: 16px;
          overflow:hidden;
          background:
            linear-gradient(90deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.70) 100%),
            url('https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=2400&q=70') center/cover no-repeat;
          box-shadow: var(--mm-shadow);
        }
        .mm-hero-content{
          position:absolute;
          inset:0;
          display:flex;
          align-items:center;
          justify-content:flex-end;
          padding: 20px 24px;
          color:#fff;
          text-align:right;
        }
        .mm-hero h2{
          margin:0;
          font-weight:900;
          letter-spacing:-0.02em;
          font-size: clamp(34px, 4vw, 58px);
        }
        .mm-hero p{
          margin: 10px 0 0 0;
          max-width: 520px;
          color: rgba(255,255,255,0.88);
          line-height: 1.35;
          font-size: 14px;
        }
        .mm-grid{
          display:grid;
          grid-template-columns: minmax(280px, 1fr) minmax(70px, 90px) minmax(280px, 1fr);
          gap: 16px;
          align-items: stretch;
        }
        .mm-card{
          background: var(--mm-surface);
          border: 2px solid rgba(15, 23, 42, 0.35);
          border-radius: 18px;
          padding: 22px 22px 18px 22px;
          box-shadow: var(--mm-shadow);
        }
        .mm-card h5{
          font-size: 16px;
          margin-bottom: 10px;
          color: rgba(15, 23, 42, 0.82);
          font-weight: 700;
        }
        .mm-input{
          width:100%;
          min-height:40px;
          border-radius:10px;
          border:1px solid rgba(15,23,42,0.30);
          padding: 8px 10px;
          box-sizing: border-box;
        }
        .mm-arrow{
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:34px;
          color: rgba(15,23,42,0.75);
        }
        .mm-bottom{
          margin-top: 12px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          flex-wrap:wrap;
          gap: 12px;
        }
        .mm-cta{
          border: 0;
          background: var(--mm-green);
          color: #0b0f14;
          border-radius: 999px;
          padding: 10px 20px;
          font-weight: 700;
          opacity: 1;
        }
        .mm-cta:disabled{
          opacity: 0.55;
        }
        .mm-summary{
          color: var(--mm-muted);
          font-size: 12px;
        }
        .mm-footer{
          color: rgba(15, 23, 42, 0.65);
          font-size: 12px;
          padding: 18px 0 26px 0;
          text-align:center;
        }
        @media (max-width: 991.98px){
          .mm-grid{
            grid-template-columns: 1fr;
          }
          .mm-arrow{
            display:none;
          }
          .mm-hero{
            height:210px;
          }
        }
        @media (max-width: 600px){
          .mm-title{
            font-size: 36px;
            margin: 18px 0 10px 0;
          }
          .mm-hero{
            height: 160px;
          }
          .mm-hero-content{
            padding: 14px 16px;
            justify-content: center;
            text-align: center;
          }
          .mm-hero h2{
            font-size: 28px;
          }
          .mm-hero p{
            display: none;
          }
          .mm-card{
            padding: 16px 16px 14px 16px;
            border-radius: 14px;
          }
          .mm-input{
            min-height: 44px;
            font-size: 16px;
          }
          .mm-cta{
            width: 100%;
            padding: 12px 16px;
          }
          .mm-bottom{
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
      <div className="mm-page">
        <main className="mm-container">
          <h1 className="mm-title">FIND YOUR</h1>
          <section className="mm-hero" aria-label="Transfer path hero">
            <div className="mm-hero-content">
              <div>
                <h2>TRANSFER PATH</h2>
                <p>
                  Choose your current institution, your target institution, and the target program you want to transfer into.
                </p>
              </div>
            </div>
          </section>

          <section style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="mm-grid">
              <div className="mm-card">
                <h5>Current Institution</h5>
                <select
                  id="currentInstitutionSelect"
                  className="mm-input"
                  value={currentInstitutionId}
                  onChange={(e) => {
                    const selectedId = e.target.value
                    setCurrentInstitutionId(selectedId)
                    const selected = currentInstitutionItems.find((item) => item.value === selectedId)
                    setCurrentInstitutionQuery(selected?.display ?? '')
                  }}
                >
                  <option value="">Select current institution</option>
                  {suggestedCurrentInstitutionItems.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.display}
                    </option>
                  ))}
                </select>

                <h5 style={{ marginTop: 12 }}>Current Program</h5>
                <select
                  id="currentProgramSelect"
                  className="mm-input"
                  value={currentProgramValue}
                  onChange={(e) => {
                    const selectedValue = e.target.value
                    setCurrentProgramValue(selectedValue)
                  }}
                  disabled={loading}
                >
                  <option value="">Select current program</option>
                  {currentProgramItems.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.display}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mm-arrow">→</div>

              <div className="mm-card">
                <h5>Target Institution</h5>
                <select
                  id="targetInstitutionSelect"
                  className="mm-input"
                  value={targetInstitutionId}
                  onChange={(e) => {
                    const selectedId = e.target.value
                    setTargetInstitutionId(selectedId)
                    const selected = currentInstitutionItems.find((item) => item.value === selectedId)
                    setTargetInstitutionQuery(selected?.display ?? '')
                  }}
                  disabled={loading}
                >
                  <option value="">Select target institution</option>
                  {suggestedTargetInstitutionItems.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.display}
                    </option>
                  ))}
                </select>

                <h5 style={{ marginTop: 12 }}>Target Program</h5>
                <select
                  id="targetProgramSelect"
                  className="mm-input"
                  value={targetProgramValue}
                  onChange={(e) => {
                    const selectedValue = e.target.value
                    setTargetProgramValue(selectedValue)
                  }}
                  disabled={loading || !targetInstitutionId || targetProgramItems.length === 0}
                >
                  <option value="">Select target program</option>
                  {targetProgramItems.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.display}
                    </option>
                  ))}
                </select>

                <div className="mm-bottom">
                  <button id="confirmSelectionBtn" className="mm-cta" onClick={handleConfirmSelection} disabled={!canConfirm}>
                    Confirm Transfer Goal
                  </button>
                  <div id="selectionSummary" className="mm-summary">{loadError || selectionSummary}</div>
                </div>
              </div>
            </div>
          </section>

          <footer className="mm-footer">
            <div>© 2026 Transfer Credit Match. All rights reserved.</div>
          </footer>
        </main>
      </div>
    </>
  )
}

export default InstitutionsPage
