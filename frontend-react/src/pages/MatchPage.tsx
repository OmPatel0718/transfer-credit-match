import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useLocation } from 'react-router-dom'
import { Autocomplete, type AutocompleteItem } from '../components/Autocomplete'
import { useRoleView } from '../context/RoleViewContext'
import { ApiError, basicAuthHeader, getJson, postJsonData } from '../lib/api'

type ApiCourse = {
  courseId: number
  courseCode: string
  courseName: string
  programId: number
  institutionId: number
  credits: number
}

type CourseOption = AutocompleteItem & { courseId: number }
type LoadState = 'idle' | 'loading' | 'ok' | 'forbidden' | 'error'
type MatchCoverageResponse = {
  courseIdFrom: number
  courseIdTo: number
  sourceCourseCode: string
  targetCourseCode: string
  coveragePercent: number
  matchedKnowledgeUnits: string[]
  missingFromSource: string[]
  missingFromTarget: string[]
  status: string
}

function MatchPage() {
  const location = useLocation()
  const { authEmail, authPassword, isLoggedIn } = useRoleView()
  const routeProgramId = location.state?.programId as number | undefined
  const routeProgramName = location.state?.programName as string | undefined
  const routeCurrentInstitutionId = location.state?.currentInstitutionId as number | undefined
  const routeTargetInstitutionId = location.state?.targetInstitutionId as number | undefined

  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [fromQuery, setFromQuery] = useState('')
  const [toQuery, setToQuery] = useState('')
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [manualFromId, setManualFromId] = useState('')
  const [manualToId, setManualToId] = useState('')
  const [result, setResult] = useState<MatchCoverageResponse | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authEmail || !authPassword) {
      setCourses([])
      setLoadState('idle')
      return
    }
    let cancelled = false
    setLoadState('loading')
    getJson<ApiCourse[]>('/api/courses', { headers: basicAuthHeader(authEmail, authPassword) })
      .then((data) => {
        if (cancelled) return
        setCourses(data ?? [])
        setLoadState('ok')
      })
      .catch((e) => {
        if (cancelled) return
        if (e instanceof ApiError && e.status === 403) setLoadState('forbidden')
        else setLoadState('error')
        setCourses([])
      })
    return () => {
      cancelled = true
    }
  }, [authEmail, authPassword])

  const { fromOptions, toOptions } = useMemo(() => {
    const targetSet = courses.filter((c) => {
      if (routeTargetInstitutionId != null && c.institutionId !== routeTargetInstitutionId) return false
      if (routeProgramId != null && c.programId !== routeProgramId) return false
      return true
    })
    const fromSet =
      routeCurrentInstitutionId == null
        ? courses.filter((c) => !targetSet.some((targetCourse) => targetCourse.courseId === c.courseId))
        : courses.filter((c) => c.institutionId === routeCurrentInstitutionId)
    const toUse = targetSet.length ? targetSet : courses
    const mapOption = (c: ApiCourse): CourseOption => ({
      id: c.courseId,
      courseId: c.courseId,
      label: `${c.courseCode} - ${c.courseName}`,
      description: `Course ${c.courseId} | Program ${c.programId} | Institution ${c.institutionId}`,
    })
    return {
      fromOptions: fromSet.map(mapOption),
      toOptions: toUse.map(mapOption),
    }
  }, [courses, routeProgramId, routeCurrentInstitutionId, routeTargetInstitutionId])

  function filterOptions(options: CourseOption[], query: string): Promise<CourseOption[]> {
    const q = query.trim().toLowerCase()
    if (!q) return Promise.resolve([])
    return Promise.resolve(options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 20))
  }

  async function submitMatch() {
    setError('')
    setResult(null)
    if (!isLoggedIn || !authEmail || !authPassword) {
      setError('Please sign in first so the request can include Basic auth credentials.')
      return
    }
    const sourceId = Number(loadState === 'ok' && fromId ? fromId : manualFromId.trim())
    const targetId = Number(loadState === 'ok' && toId ? toId : manualToId.trim())
    if (
      !Number.isFinite(sourceId) ||
      !Number.isFinite(targetId) ||
      sourceId <= 0 ||
      targetId <= 0
    ) {
      setError('Select valid source and target courses before running match.')
      return
    }
    setSubmitting(true)
    try {
      const response = await postJsonData<MatchCoverageResponse>(
        '/api/match',
        { courseIdFrom: sourceId, courseIdTo: targetId },
        { headers: basicAuthHeader(authEmail, authPassword) },
      )
      setResult(response)
    } catch (e) {
      if (e instanceof ApiError) setError(e.body || `Request failed with ${e.status}.`)
      else setError('Network error while calling match API.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={pageStyle}>
      <h1 style={{ marginTop: 0 }}>Match Courses</h1>
      <p style={subtitleStyle}>
        Use live backend data to compare transfer courses against target courses.
        {routeProgramName ? ` Current target program: ${routeProgramName}.` : ''}
      </p>

      {loadState === 'loading' && <p>Loading courses...</p>}
      {loadState === 'forbidden' && (
        <p style={warnStyle}>
          Your account cannot list courses (`/api/courses` returned 403). Use manual course IDs below.
        </p>
      )}
      {loadState === 'error' && (
        <p style={errorStyle}>Could not load courses from backend. Confirm backend is running and login is valid.</p>
      )}
      {loadState === 'ok' && courses.length === 0 && (
        <p style={warnStyle}>No courses available. Add courses from the Dashboard first.</p>
      )}

      {loadState === 'ok' && courses.length > 0 && (
        <div style={gridStyle}>
          <div>
            <h4>Source course</h4>
            <Autocomplete<CourseOption>
              value={fromQuery}
              onValueChange={setFromQuery}
              loadOptions={(q) => filterOptions(fromOptions, q)}
              onSelect={(item) => setFromId(String(item.courseId))}
              placeholder="Search source course..."
              minChars={1}
            />
            <p>Selected ID: {fromId || 'None'}</p>
          </div>
          <div>
            <h4>Target course</h4>
            <Autocomplete<CourseOption>
              value={toQuery}
              onValueChange={setToQuery}
              loadOptions={(q) => filterOptions(toOptions, q)}
              onSelect={(item) => setToId(String(item.courseId))}
              placeholder="Search target course..."
              minChars={1}
            />
            <p>Selected ID: {toId || 'None'}</p>
          </div>
        </div>
      )}

      {(loadState === 'idle' || loadState === 'forbidden' || loadState === 'error') && (
        <div style={gridStyle}>
          <div>
            <h4>Source course ID (manual)</h4>
            <input value={manualFromId} onChange={(e) => setManualFromId(e.target.value)} type="number" style={inputStyle} />
          </div>
          <div>
            <h4>Target course ID (manual)</h4>
            <input value={manualToId} onChange={(e) => setManualToId(e.target.value)} type="number" style={inputStyle} />
          </div>
        </div>
      )}

      <button onClick={submitMatch} disabled={submitting} style={buttonStyle}>
        {submitting ? 'Matching...' : 'Run Match'}
      </button>

      {error && <p style={errorStyle}>{error}</p>}
      {result && (
        <div style={resultStyle}>
          <p style={{ marginTop: 0, marginBottom: 6 }}>
            Coverage: <strong>{result.coveragePercent}%</strong> ({result.status})
          </p>
          <p style={{ margin: '4px 0' }}>Source: {result.sourceCourseCode} | Target: {result.targetCourseCode}</p>
          <p style={{ margin: '4px 0' }}>Matched KUs: {result.matchedKnowledgeUnits.join(', ') || 'None'}</p>
          <p style={{ margin: '4px 0' }}>Missing from source: {result.missingFromSource.join(', ') || 'None'}</p>
          <p style={{ margin: '4px 0', marginBottom: 0 }}>Missing from target: {result.missingFromTarget.join(', ') || 'None'}</p>
        </div>
      )}
    </div>
  )
}

const pageStyle: CSSProperties = {
  maxWidth: 980,
  margin: '0 auto',
  padding: '2rem 1rem 3rem',
}

const subtitleStyle: CSSProperties = {
  color: '#445',
  marginBottom: '1rem',
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 16,
  marginBottom: 16,
}

const inputStyle: CSSProperties = {
  width: '100%',
  minHeight: 40,
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  padding: '0 12px',
  boxSizing: 'border-box',
}

const buttonStyle: CSSProperties = {
  minHeight: 40,
  border: 'none',
  borderRadius: 8,
  padding: '0 16px',
  backgroundColor: '#0d6efd',
  color: '#fff',
  cursor: 'pointer',
}

const warnStyle: CSSProperties = {
  color: '#9a6700',
}

const errorStyle: CSSProperties = {
  color: '#b42318',
}

const resultStyle: CSSProperties = {
  marginTop: 12,
  border: '1px solid #b7ebc6',
  backgroundColor: '#edfdf4',
  color: '#166534',
  borderRadius: 8,
  padding: '10px 12px',
}

export default MatchPage