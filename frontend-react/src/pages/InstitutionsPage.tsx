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

function formatInstitutionLabel(inst?: Institution) {
  if (!inst) return ''
  return inst.name + (inst.location ? ` (${inst.location})` : '')
}

function InstitutionsPage() {
  const navigate = useNavigate()
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [allPrograms, setAllPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentInstitutionId, setCurrentInstitutionId] = useState('')
  const [targetInstitutionId, setTargetInstitutionId] = useState('')
  const [targetProgramValue, setTargetProgramValue] = useState('')
  const [selectionSummary, setSelectionSummary] = useState(
    'Select your current and target institutions, then a target program.',
  )

  const institutionsById = useMemo(() => {
    const map: Record<string, Institution> = {}
    institutions.forEach((inst) => {
      map[String(inst.institutionId)] = inst
    })
    return map
  }, [institutions])

  const targetPrograms = useMemo(() => {
    if (!targetInstitutionId) return []
    return allPrograms.filter(
      (p) => String(p.institutionId) === String(targetInstitutionId),
    )
  }, [allPrograms, targetInstitutionId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      getJson<Institution[]>('/api/institutions'),
      getJson<Program[]>('/api/programs'),
    ])
      .then(([loadedInstitutions, loadedPrograms]) => {
        if (cancelled) return
        setInstitutions(loadedInstitutions ?? [])
        setAllPrograms(loadedPrograms ?? [])
        setSelectionSummary('Select your current and target institutions, then a target program.')
      })
      .catch((err) => {
        if (cancelled) return
        const msg =
          err instanceof Error
            ? `Error loading institutions/programs: ${err.message}`
            : `Error loading institutions/programs: ${String(err)}`
        setError(msg)
        setSelectionSummary(msg)
        setInstitutions([])
        setAllPrograms([])
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
    setTargetProgramValue('')
    if (!targetInstitutionId) {
      setSelectionSummary('Select a target institution to see available programs.')
      return
    }
    if (targetPrograms.length === 0) {
      setSelectionSummary('No programs for this institution.')
      return
    }
    setSelectionSummary('')
  }, [targetInstitutionId, targetPrograms.length])

  const canConfirm = Boolean(currentInstitutionId && targetInstitutionId && targetProgramValue)

  function handleConfirmSelection() {
    if (!canConfirm) {
      setSelectionSummary(
        'Please select current institution, target institution, and a target program.',
      )
      return
    }

    const currentInst = institutionsById[String(currentInstitutionId)]
    const targetInst = institutionsById[String(targetInstitutionId)]
    const targetProgram = allPrograms.find(
      (p) =>
        String(p.institutionId) === String(targetInstitutionId) &&
        String(p.id ?? p.programId ?? p.programName) === String(targetProgramValue),
    )

    const currentLabel = currentInst
      ? formatInstitutionLabel(currentInst)
      : `Institution ${currentInstitutionId}`
    const targetLabel = targetInst
      ? formatInstitutionLabel(targetInst)
      : `Institution ${targetInstitutionId}`
    const targetProgramLabel = targetProgram
      ? targetProgram.programName
      : `Program ${targetProgramValue}`

    setSelectionSummary(
      `Current: ${currentLabel} → Target: ${targetLabel} | Target Program: ${targetProgramLabel}`,
    )

    const programId = targetProgram ? Number(targetProgram.id ?? targetProgram.programId) : undefined
    if (programId !== undefined && !Number.isNaN(programId)) {
      navigate('/match', {
        state: {
          programId,
          programName: targetProgramLabel,
          currentInstitutionId: Number(currentInstitutionId),
          targetInstitutionId: Number(targetInstitutionId),
        },
      })
    }
  }

  return (
    <div style={{ background: '#F8F9FA', paddingTop: 60 }}>
      <div
        style={{
          position: 'relative',
          height: 300,
          background:
            "url('https://d13kjxnqnhcmn2.cloudfront.net/AcuCustom/Sitename/DAM/055/Uni_students_-_Main.png') no-repeat center center/cover",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          color: 'white',
        }}
      >
        <div style={{ width: '100%', height: '100%', zIndex: 0 }} />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'Merriweather, serif',
            fontSize: 48,
            fontWeight: 700,
            zIndex: 1,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            padding: '0 1rem',
          }}
        >
          Select Institution &amp; Program
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '3rem auto', padding: '0 1rem' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 10,
            padding: 24,
            boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
          }}
        >
          <h3 style={{ margin: '0 0 0.75rem' }}>Plan Your Transfer Path</h3>
          <p style={{ color: '#6c757d', margin: '0 0 1.5rem' }}>
            Choose your <strong>current institution</strong>, your <strong>target institution</strong>, and the{' '}
            <strong>target program</strong> you want to transfer into.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <h5 style={{ margin: '0 0 0.5rem' }}>Current Institution</h5>
              <label htmlFor="currentInstitutionSelect" style={{ display: 'block', marginBottom: 6 }}>
                Current Institution
              </label>
              <select
                id="currentInstitutionSelect"
                value={currentInstitutionId}
                onChange={(e) => setCurrentInstitutionId(e.target.value)}
                disabled={loading || Boolean(error)}
                style={{ width: '100%', minHeight: 40, borderRadius: 6, border: '1px solid #ced4da' }}
              >
                <option value="">
                  {loading
                    ? 'Loading institutions...'
                    : error
                      ? 'Unable to load institutions'
                      : 'Select Institution'}
                </option>
                {institutions.map((inst) => (
                  <option key={String(inst.institutionId)} value={String(inst.institutionId)}>
                    {formatInstitutionLabel(inst)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h5 style={{ margin: '0 0 0.5rem' }}>Target Institution</h5>
              <label htmlFor="targetInstitutionSelect" style={{ display: 'block', marginBottom: 6 }}>
                Target Institution
              </label>
              <select
                id="targetInstitutionSelect"
                value={targetInstitutionId}
                onChange={(e) => setTargetInstitutionId(e.target.value)}
                disabled={loading || Boolean(error)}
                style={{ width: '100%', minHeight: 40, borderRadius: 6, border: '1px solid #ced4da' }}
              >
                <option value="">
                  {loading
                    ? 'Loading institutions...'
                    : error
                      ? 'Unable to load institutions'
                      : 'Select Institution'}
                </option>
                {institutions.map((inst) => (
                  <option key={String(inst.institutionId)} value={String(inst.institutionId)}>
                    {formatInstitutionLabel(inst)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <h5 style={{ margin: '0 0 0.5rem' }}>Target Program</h5>
              <label htmlFor="targetProgramSelect" style={{ display: 'block', marginBottom: 6 }}>
                Program at Target Institution
              </label>
              <select
                id="targetProgramSelect"
                value={targetProgramValue}
                onChange={(e) => setTargetProgramValue(e.target.value)}
                disabled={
                  loading || Boolean(error) || !targetInstitutionId || targetPrograms.length === 0
                }
                style={{ width: '100%', minHeight: 40, borderRadius: 6, border: '1px solid #ced4da' }}
              >
                {!targetInstitutionId ? (
                  <option value="">Select a target institution first</option>
                ) : targetPrograms.length === 0 ? (
                  <option value="">No programs for this institution</option>
                ) : (
                  <>
                    <option value="">Select Program</option>
                    {targetPrograms.map((p) => {
                      const value = String(p.id ?? p.programId ?? p.programName)
                      return (
                        <option key={`${String(p.institutionId)}:${value}`} value={value}>
                          {p.programName} (Institution ID: {String(p.institutionId)})
                        </option>
                      )
                    })}
                  </>
                )}
              </select>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!canConfirm}
              style={{
                minHeight: 40,
                padding: '0 16px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: canConfirm ? '#0d6efd' : '#9ec5fe',
                color: '#fff',
                cursor: canConfirm ? 'pointer' : 'not-allowed',
              }}
            >
              Confirm Transfer Goal
            </button>
            <div style={{ color: error ? '#dc3545' : '#6c757d', fontSize: 12 }}>
              {error ?? selectionSummary}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstitutionsPage
