import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { basicAuthHeader, deleteRequest, getJson, postJsonData, putJsonData, readErrorBody } from '../lib/api'
import { useRoleView } from '../context/RoleViewContext'

type Institution = { institutionId: number; name: string; location?: string | null }
type Program = { programId: number; institutionId: number; programName: string }
type Course = { courseId: number; institutionId: number; programId: number; courseCode: string; courseName: string; credits: number; skillEarned?: string | null }
type KnowledgeUnit = { kuId: number; kuName: string; kuDescription?: string | null }
type CourseKu = { courseId: number; kuId: number; kuName?: string; kuDescription?: string | null }

function DashboardPage() {
  const navigate = useNavigate()
  const { role, setRole, authEmail, authPassword } = useRoleView()
  const authHeaders = useMemo(
    () => (authEmail && authPassword ? basicAuthHeader(authEmail, authPassword) : undefined),
    [authEmail, authPassword],
  )

  const roleLabel = role === 'admin' ? 'Admin' : role === 'director' ? 'Director' : 'Student'

  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [knowledgeUnits, setKnowledgeUnits] = useState<KnowledgeUnit[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const [newInstitution, setNewInstitution] = useState({ name: '', location: '' })
  const [newProgram, setNewProgram] = useState({ institutionId: '', programName: '' })
  const [newCourse, setNewCourse] = useState({ institutionId: '', programId: '', courseCode: '', courseName: '', credits: '3' })
  const [newKu, setNewKu] = useState({ kuName: '', kuDescription: '' })
  const [editingInstitutionId, setEditingInstitutionId] = useState<number | null>(null)
  const [editingInstitution, setEditingInstitution] = useState({ name: '', location: '' })
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null)
  const [editingProgram, setEditingProgram] = useState({ institutionId: '', programName: '' })
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null)
  const [editingCourse, setEditingCourse] = useState({ institutionId: '', programId: '', courseCode: '', courseName: '', credits: '3', skillEarned: '' })
  const [editingKuId, setEditingKuId] = useState<number | null>(null)
  const [editingKu, setEditingKu] = useState({ kuName: '', kuDescription: '' })
  const [selectedCourseIdForKu, setSelectedCourseIdForKu] = useState<string>('')
  const [selectedKuIdForCourse, setSelectedKuIdForCourse] = useState<string>('')
  const [courseKuMappings, setCourseKuMappings] = useState<CourseKu[]>([])

  async function loadAll() {
    setError('')
    try {
      const [inst, prog, ku] = await Promise.all([
        getJson<Institution[]>('/api/institutions'),
        getJson<Program[]>('/api/programs'),
        getJson<KnowledgeUnit[]>('/api/knowledge_units'),
      ])
      setInstitutions(inst ?? [])
      setPrograms(prog ?? [])
      setKnowledgeUnits(ku ?? [])

      if (authHeaders) {
        try {
          const c = await getJson<Course[]>('/api/courses', { headers: authHeaders })
          setCourses(c ?? [])
          const preferredCourseId = selectedCourseIdForKu || String(c?.[0]?.courseId ?? '')
          if (preferredCourseId) {
            setSelectedCourseIdForKu(preferredCourseId)
            const mappings = await getJson<CourseKu[]>(`/api/match/course-ku?courseId=${preferredCourseId}`, { headers: authHeaders })
            setCourseKuMappings(mappings ?? [])
          } else {
            setCourseKuMappings([])
          }
        } catch {
          setCourses([])
          setCourseKuMappings([])
        }
      } else {
        setCourses([])
        setCourseKuMappings([])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  useEffect(() => {
    void loadAll()
  }, [authHeaders])

  async function withAuthRequest(run: () => Promise<void>) {
    if (!authHeaders) {
      setError('Login as admin/director to perform dashboard write actions.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await run()
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function addInstitution() {
    if (!newInstitution.name.trim()) return
    await withAuthRequest(async () => {
      await postJsonData<Institution>(
        '/api/institutions',
        { name: newInstitution.name.trim(), location: newInstitution.location.trim() || null },
        { headers: authHeaders },
      )
      setNewInstitution({ name: '', location: '' })
    })
  }

  async function addProgram() {
    const institutionId = Number(newProgram.institutionId)
    if (!newProgram.programName.trim() || !Number.isFinite(institutionId)) return
    await withAuthRequest(async () => {
      await postJsonData<Program>(
        '/api/programs',
        { institutionId, programName: newProgram.programName.trim() },
        { headers: authHeaders },
      )
      setNewProgram({ institutionId: '', programName: '' })
    })
  }

  async function addCourse() {
    const institutionId = Number(newCourse.institutionId)
    const programId = Number(newCourse.programId)
    const credits = Number(newCourse.credits)
    if (!newCourse.courseCode.trim() || !newCourse.courseName.trim() || !Number.isFinite(institutionId) || !Number.isFinite(programId) || !Number.isFinite(credits)) return
    await withAuthRequest(async () => {
      await postJsonData<Course>(
        '/api/courses',
        {
          institutionId,
          programId,
          courseCode: newCourse.courseCode.trim(),
          courseName: newCourse.courseName.trim(),
          credits,
        },
        { headers: authHeaders },
      )
      setNewCourse({ institutionId: '', programId: '', courseCode: '', courseName: '', credits: '3' })
    })
  }

  async function addKnowledgeUnit() {
    if (!newKu.kuName.trim()) return
    await withAuthRequest(async () => {
      await postJsonData<KnowledgeUnit>(
        '/api/knowledge_units',
        { kuName: newKu.kuName.trim(), kuDescription: newKu.kuDescription.trim() || null },
        { headers: authHeaders },
      )
      setNewKu({ kuName: '', kuDescription: '' })
    })
  }

  async function remove(path: string) {
    await withAuthRequest(async () => {
      const res = await deleteRequest(path, { headers: authHeaders })
      if (!res.ok) throw new Error(await readErrorBody(res))
    })
  }

  async function saveCourse(courseId: number) {
    const institutionId = Number(editingCourse.institutionId)
    const programId = Number(editingCourse.programId)
    const credits = Number(editingCourse.credits)
    if (!Number.isFinite(institutionId) || !Number.isFinite(programId) || !Number.isFinite(credits)) return
    await withAuthRequest(async () => {
      await putJsonData(`/api/courses/${courseId}`, {
        institutionId,
        programId,
        courseCode: editingCourse.courseCode.trim(),
        courseName: editingCourse.courseName.trim(),
        credits,
        skillEarned: editingCourse.skillEarned.trim() || null,
      })
      setEditingCourseId(null)
    })
  }

  async function saveKnowledgeUnit(kuId: number) {
    await withAuthRequest(async () => {
      await putJsonData(`/api/knowledge_units/${kuId}`, {
        kuName: editingKu.kuName.trim(),
        kuDescription: editingKu.kuDescription.trim() || null,
      })
      setEditingKuId(null)
    })
  }

  async function saveInstitution(institutionId: number) {
    await withAuthRequest(async () => {
      await putJsonData(`/api/institutions/${institutionId}`, {
        name: editingInstitution.name.trim(),
        location: editingInstitution.location.trim() || null,
      })
      setEditingInstitutionId(null)
    })
  }

  async function saveProgram(programId: number) {
    const institutionId = Number(editingProgram.institutionId)
    if (!Number.isFinite(institutionId)) return
    await withAuthRequest(async () => {
      await putJsonData(`/api/programs/${programId}`, {
        institutionId,
        programName: editingProgram.programName.trim(),
      })
      setEditingProgramId(null)
    })
  }

  async function addCourseKuMapping() {
    const courseId = Number(selectedCourseIdForKu)
    const kuId = Number(selectedKuIdForCourse)
    if (!Number.isFinite(courseId) || !Number.isFinite(kuId)) return
    await withAuthRequest(async () => {
      await postJsonData('/api/match/course-ku', { courseId, kuId }, { headers: authHeaders })
      setSelectedKuIdForCourse('')
      const updated = await getJson<CourseKu[]>(`/api/match/course-ku?courseId=${courseId}`, { headers: authHeaders })
      setCourseKuMappings(updated ?? [])
    })
  }

  async function removeCourseKuMapping(kuId: number) {
    const courseId = Number(selectedCourseIdForKu)
    if (!Number.isFinite(courseId)) return
    await withAuthRequest(async () => {
      const res = await deleteRequest(`/api/match/course-ku?courseId=${courseId}&kuId=${kuId}`, { headers: authHeaders })
      if (!res.ok) throw new Error(await readErrorBody(res))
      const updated = await getJson<CourseKu[]>(`/api/match/course-ku?courseId=${courseId}`, { headers: authHeaders })
      setCourseKuMappings(updated ?? [])
    })
  }

  const filteredNewCoursePrograms = useMemo(() => {
    if (!newCourse.institutionId) return []
    return programs.filter((p) => String(p.institutionId) === String(newCourse.institutionId))
  }, [programs, newCourse.institutionId])

  const filteredEditingPrograms = useMemo(() => {
    if (!editingCourse.institutionId) return []
    return programs.filter((p) => String(p.institutionId) === String(editingCourse.institutionId))
  }, [programs, editingCourse.institutionId])

  const coursesStatValue = authHeaders ? String(courses.length) : '0'
  const statCards: Array<{ label: string; value: string }> = [
    { label: 'Institutions', value: String(institutions.length) },
    { label: 'Programs', value: String(programs.length) },
    { label: 'Courses', value: coursesStatValue },
    { label: 'Knowledge Units', value: String(knowledgeUnits.length) },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem 3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 1.3fr) minmax(280px, 1fr)',
          gap: '1rem',
          alignItems: 'stretch',
        }}
      >
        <section
          style={{
            border: '1px solid #b8dcc4',
            borderRadius: 20,
            background: 'linear-gradient(145deg, #f9fffb 0%, #e5f8eb 62%, #d8f0df 100%)',
            padding: '1.2rem 1.15rem',
            boxShadow: '0 12px 28px rgba(33, 104, 61, 0.1)',
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <p
            style={{
              margin: 0,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 800,
              color: '#2f7e41',
              fontSize: '0.78rem',
            }}
          >
            {roleLabel}
          </p>
          <h1 style={{ margin: '0.35rem 0 0 0', fontSize: '2.5rem', lineHeight: 1, color: '#0f172a' }}>
            Dashboard
          </h1>
          <p style={{ margin: '0.75rem 0 0 0', color: '#385b43', fontSize: '0.95rem' }}>
            Manage institutions, programs, courses, and knowledge units using live backend endpoints.
          </p>

          <div
            style={{
              marginTop: '1.1rem',
              display: 'flex',
              gap: '0.45rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                border: '1px solid #9ec7ab',
                borderRadius: 999,
                padding: '0.35rem 0.7rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#1b4f2c',
                background: '#ecfaf0',
                whiteSpace: 'nowrap',
              }}
            >
              Current role: {roleLabel}
            </span>
            <button
              type="button"
              onClick={() => setRole('admin')}
              style={{
                borderRadius: 999,
                border: role === 'admin' ? '1px solid #2f7e41' : '1px solid #bbd8c3',
                background: role === 'admin' ? '#2f7e41' : '#ffffff',
                color: role === 'admin' ? '#fff' : '#174125',
                padding: '0.3rem 0.65rem',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              View as Admin
            </button>
            <button
              type="button"
              onClick={() => setRole('director')}
              style={{
                borderRadius: 999,
                border: role === 'director' ? '1px solid #2f7e41' : '1px solid #bbd8c3',
                background: role === 'director' ? '#2f7e41' : '#ffffff',
                color: role === 'director' ? '#fff' : '#174125',
                padding: '0.3rem 0.65rem',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              View as Director
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('student')
                navigate('/')
              }}
              style={{
                borderRadius: 999,
                border: '1px solid #bbd8c3',
                background: '#fff',
                color: '#174125',
                padding: '0.3rem 0.65rem',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              View as Student
            </button>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(130px, 1fr))',
            gap: '0.7rem',
            alignContent: 'start',
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                border: '1.5px solid #7faf92',
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '0.8rem 0.7rem',
                minHeight: 90,
                boxShadow: '0 8px 18px rgba(33, 104, 61, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {card.value}
              </p>
              <p style={{ margin: '0.35rem 0 0 0', color: '#334155', fontSize: '0.88rem' }}>{card.label}</p>
            </div>
          ))}
        </section>
      </div>

      {error && <p style={{ color: '#b42318' }}>{error}</p>}

      <section style={card}>
        <h3>Institutions ({institutions.length})</h3>
        <div style={row}>
          <input placeholder="Institution name" value={newInstitution.name} onChange={(e) => setNewInstitution((p) => ({ ...p, name: e.target.value }))} style={input} />
          <input placeholder="Location" value={newInstitution.location} onChange={(e) => setNewInstitution((p) => ({ ...p, location: e.target.value }))} style={input} />
          <button onClick={addInstitution} disabled={busy}>Add</button>
        </div>
        {institutions.map((i) => (
          <div key={i.institutionId} style={listRow}>
            {editingInstitutionId === i.institutionId ? (
              <div style={{ ...row, width: '100%' }}>
                <input value={editingInstitution.name} onChange={(e) => setEditingInstitution((p) => ({ ...p, name: e.target.value }))} style={input} />
                <input value={editingInstitution.location} onChange={(e) => setEditingInstitution((p) => ({ ...p, location: e.target.value }))} style={input} />
                <button onClick={() => saveInstitution(i.institutionId)} disabled={busy}>Save</button>
                <button onClick={() => setEditingInstitutionId(null)} disabled={busy}>Cancel</button>
              </div>
            ) : (
              <>
                <span>{i.name} {i.location ? `(${i.location})` : ''}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => {
                    setEditingInstitutionId(i.institutionId)
                    setEditingInstitution({ name: i.name, location: i.location ?? '' })
                  }} disabled={busy}>Edit</button>
                  <button onClick={() => remove(`/api/institutions/${i.institutionId}`)} disabled={busy}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </section>

      <section style={card}>
        <h3>Programs ({programs.length})</h3>
        <div style={row}>
          <select value={newProgram.institutionId} onChange={(e) => setNewProgram((p) => ({ ...p, institutionId: e.target.value }))} style={input}>
            <option value="">Institution</option>
            {institutions.map((institution) => (
              <option key={institution.institutionId} value={institution.institutionId}>{institution.name}</option>
            ))}
          </select>
          <input placeholder="Program name" value={newProgram.programName} onChange={(e) => setNewProgram((p) => ({ ...p, programName: e.target.value }))} style={input} />
          <button onClick={addProgram} disabled={busy}>Add</button>
        </div>
        {programs.map((p) => (
          <div key={p.programId} style={listRow}>
            {editingProgramId === p.programId ? (
              <div style={{ ...row, width: '100%' }}>
                <select value={editingProgram.institutionId} onChange={(e) => setEditingProgram((prev) => ({ ...prev, institutionId: e.target.value }))} style={input}>
                  <option value="">Institution</option>
                  {institutions.map((institution) => (
                    <option key={institution.institutionId} value={institution.institutionId}>{institution.name}</option>
                  ))}
                </select>
                <input value={editingProgram.programName} onChange={(e) => setEditingProgram((prev) => ({ ...prev, programName: e.target.value }))} style={input} />
                <button onClick={() => saveProgram(p.programId)} disabled={busy}>Save</button>
                <button onClick={() => setEditingProgramId(null)} disabled={busy}>Cancel</button>
              </div>
            ) : (
              <>
                <span>{p.programName} (Institution {p.institutionId})</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => {
                    setEditingProgramId(p.programId)
                    setEditingProgram({ institutionId: String(p.institutionId), programName: p.programName })
                  }} disabled={busy}>Edit</button>
                  <button onClick={() => remove(`/api/programs/${p.programId}`)} disabled={busy}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </section>

      <section style={card}>
        <h3>Courses ({courses.length})</h3>
        <div style={row}>
          <select
            value={newCourse.institutionId}
            onChange={(e) =>
              setNewCourse((p) => ({ ...p, institutionId: e.target.value, programId: '' }))
            }
            style={input}
          >
            <option value="">Institution</option>
            {institutions.map((institution) => (
              <option key={institution.institutionId} value={institution.institutionId}>{institution.name}</option>
            ))}
          </select>
          <select
            value={newCourse.programId}
            onChange={(e) => setNewCourse((p) => ({ ...p, programId: e.target.value }))}
            style={input}
            disabled={!newCourse.institutionId}
          >
            <option value="">Program</option>
            {filteredNewCoursePrograms.map((program) => (
              <option key={program.programId} value={program.programId}>{program.programName}</option>
            ))}
          </select>
          <input placeholder="Code" value={newCourse.courseCode} onChange={(e) => setNewCourse((p) => ({ ...p, courseCode: e.target.value }))} style={input} />
          <input placeholder="Name" value={newCourse.courseName} onChange={(e) => setNewCourse((p) => ({ ...p, courseName: e.target.value }))} style={input} />
          <input placeholder="Credits" value={newCourse.credits} onChange={(e) => setNewCourse((p) => ({ ...p, credits: e.target.value }))} style={input} />
          <button onClick={addCourse} disabled={busy}>Add</button>
        </div>
        {courses.map((c) => (
          <div key={c.courseId} style={listRow}>
            {editingCourseId === c.courseId ? (
              <div style={{ ...row, width: '100%' }}>
                <select
                  value={editingCourse.institutionId}
                  onChange={(e) => setEditingCourse((p) => ({ ...p, institutionId: e.target.value, programId: '' }))}
                  style={input}
                >
                  <option value="">Institution</option>
                  {institutions.map((institution) => (
                    <option key={institution.institutionId} value={institution.institutionId}>{institution.name}</option>
                  ))}
                </select>
                <select
                  value={editingCourse.programId}
                  onChange={(e) => setEditingCourse((p) => ({ ...p, programId: e.target.value }))}
                  style={input}
                >
                  <option value="">Program</option>
                  {filteredEditingPrograms.map((program) => (
                    <option key={program.programId} value={program.programId}>{program.programName}</option>
                  ))}
                </select>
                <input value={editingCourse.courseCode} onChange={(e) => setEditingCourse((p) => ({ ...p, courseCode: e.target.value }))} style={input} />
                <input value={editingCourse.courseName} onChange={(e) => setEditingCourse((p) => ({ ...p, courseName: e.target.value }))} style={input} />
                <input value={editingCourse.credits} onChange={(e) => setEditingCourse((p) => ({ ...p, credits: e.target.value }))} style={input} />
                <input value={editingCourse.skillEarned} onChange={(e) => setEditingCourse((p) => ({ ...p, skillEarned: e.target.value }))} style={input} placeholder="Skill" />
                <button onClick={() => saveCourse(c.courseId)} disabled={busy}>Save</button>
                <button onClick={() => setEditingCourseId(null)} disabled={busy}>Cancel</button>
              </div>
            ) : (
              <>
                <span>{c.courseCode} - {c.courseName} (Program {c.programId})</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      setEditingCourseId(c.courseId)
                      setEditingCourse({
                        institutionId: String(c.institutionId),
                        programId: String(c.programId),
                        courseCode: c.courseCode,
                        courseName: c.courseName,
                        credits: String(c.credits),
                        skillEarned: c.skillEarned ?? '',
                      })
                    }}
                    disabled={busy}
                  >
                    Edit
                  </button>
                  <button onClick={() => remove(`/api/courses/${c.courseId}`)} disabled={busy}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </section>

      <section style={card}>
        <h3>Knowledge Units ({knowledgeUnits.length})</h3>
        <div style={row}>
          <input placeholder="KU name" value={newKu.kuName} onChange={(e) => setNewKu((p) => ({ ...p, kuName: e.target.value }))} style={input} />
          <input placeholder="Description" value={newKu.kuDescription} onChange={(e) => setNewKu((p) => ({ ...p, kuDescription: e.target.value }))} style={input} />
          <button onClick={addKnowledgeUnit} disabled={busy}>Add</button>
        </div>
        {knowledgeUnits.map((k) => (
          <div key={k.kuId} style={listRow}>
            {editingKuId === k.kuId ? (
              <div style={{ ...row, width: '100%' }}>
                <input value={editingKu.kuName} onChange={(e) => setEditingKu((p) => ({ ...p, kuName: e.target.value }))} style={input} />
                <input value={editingKu.kuDescription} onChange={(e) => setEditingKu((p) => ({ ...p, kuDescription: e.target.value }))} style={input} />
                <button onClick={() => saveKnowledgeUnit(k.kuId)} disabled={busy}>Save</button>
                <button onClick={() => setEditingKuId(null)} disabled={busy}>Cancel</button>
              </div>
            ) : (
              <>
                <span>{k.kuName}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      setEditingKuId(k.kuId)
                      setEditingKu({ kuName: k.kuName, kuDescription: k.kuDescription ?? '' })
                    }}
                    disabled={busy}
                  >
                    Edit
                  </button>
                  <button onClick={() => remove(`/api/knowledge_units/${k.kuId}`)} disabled={busy}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </section>

      <section style={card}>
        <h3>Course Knowledge Unit Mappings</h3>
        <div style={row}>
          <select
            value={selectedCourseIdForKu}
            onChange={async (e) => {
              const courseId = e.target.value
              setSelectedCourseIdForKu(courseId)
              if (!courseId || !authHeaders) {
                setCourseKuMappings([])
                return
              }
              try {
                const mappings = await getJson<CourseKu[]>(`/api/match/course-ku?courseId=${courseId}`, { headers: authHeaders })
                setCourseKuMappings(mappings ?? [])
              } catch {
                setCourseKuMappings([])
              }
            }}
            style={input}
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>{course.courseCode} - {course.courseName}</option>
            ))}
          </select>
          <select
            value={selectedKuIdForCourse}
            onChange={(e) => setSelectedKuIdForCourse(e.target.value)}
            style={input}
            disabled={!selectedCourseIdForKu}
          >
            <option value="">Select knowledge unit</option>
            {knowledgeUnits.map((ku) => (
              <option key={ku.kuId} value={ku.kuId}>{ku.kuName}</option>
            ))}
          </select>
          <button onClick={addCourseKuMapping} disabled={busy || !selectedCourseIdForKu || !selectedKuIdForCourse}>Add Mapping</button>
        </div>
        {courseKuMappings.map((mapping) => (
          <div key={`${mapping.courseId}-${mapping.kuId}`} style={listRow}>
            <span>{mapping.kuName ?? `KU ${mapping.kuId}`}</span>
            <button onClick={() => removeCourseKuMapping(mapping.kuId)} disabled={busy}>Remove</button>
          </div>
        ))}
      </section>
    </div>
  )
}

const card: React.CSSProperties = {
  border: '1px solid #dbe3ef',
  borderRadius: 10,
  padding: 14,
  marginBottom: 14,
  background: '#fff',
}

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 8,
  marginBottom: 10,
}

const input: React.CSSProperties = {
  minHeight: 36,
  borderRadius: 6,
  border: '1px solid #cbd5e1',
  padding: '0 10px',
}

const listRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
  alignItems: 'center',
  padding: '8px 0',
  borderTop: '1px solid #eef2f7',
}

export default DashboardPage
