import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import { useRoleView } from "../context/RoleViewContext";
import { ApiError, basicAuthHeader, getJson, postJsonText } from "../lib/api";

type ApiCourse = {
  courseId: number;
  courseCode: string;
  courseName: string;
  programId: number;
  institutionId: number;
  credits: number;
};

type ApiCoursesLoadState = "idle" | "loading" | "ok" | "forbidden" | "error";

type DemoProgramKey =
  | "Program 1"
  | "Program 2"
  | "Program 3"
  | "Program 4"
  | "Program 5"
  | "Program 6";

type DemoProgramData = {
  fromCourses: string[];
  toCourses: string[];
  matches: Record<string, { to: string; type: string }>;
};

type SavedPlan = {
  id: number;
  program: string;
  fromCourses: string[];
  toCourse: string;
};

function MatchPage() {
  const location = useLocation();
  const { authEmail, authPassword, isLoggedIn, role } = useRoleView();
  const routeProgramId = location.state?.programId as number | undefined;
  const routeProgramName = location.state?.programName as string | undefined;

  const [apiCourses, setApiCourses] = useState<ApiCourse[]>([]);
  const [apiCoursesStatus, setApiCoursesStatus] =
    useState<ApiCoursesLoadState>("idle");
  const [apiFromCourseId, setApiFromCourseId] = useState("");
  const [apiToCourseId, setApiToCourseId] = useState("");
  const [manualFromId, setManualFromId] = useState("");
  const [manualToId, setManualToId] = useState("");
  const [serverMatchMessage, setServerMatchMessage] = useState("");
  const [serverMatchError, setServerMatchError] = useState("");
  const [apiMatchSubmitting, setApiMatchSubmitting] = useState(false);

  useEffect(() => {
    if (!authEmail || !authPassword) {
      setApiCoursesStatus("idle");
      setApiCourses([]);
      return;
    }
    let cancelled = false;
    setApiCoursesStatus("loading");
    getJson<ApiCourse[]>("/api/courses", {
      headers: basicAuthHeader(authEmail, authPassword),
    })
      .then((data) => {
        if (cancelled) return;
        setApiCourses(data ?? []);
        setApiCoursesStatus("ok");
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 403) {
          setApiCoursesStatus("forbidden");
        } else {
          setApiCoursesStatus("error");
        }
        setApiCourses([]);
      });
    return () => {
      cancelled = true;
    };
  }, [authEmail, authPassword]);

  const { transferCourseOptions, targetCourseOptions } = useMemo(() => {
    if (!apiCourses.length) {
      return { transferCourseOptions: [], targetCourseOptions: [] };
    }
    if (routeProgramId != null) {
      const target = apiCourses.filter((c) => c.programId === routeProgramId);
      const transfer = apiCourses.filter((c) => c.programId !== routeProgramId);
      return {
        transferCourseOptions: transfer,
        targetCourseOptions: target.length ? target : apiCourses,
      };
    }
    return {
      transferCourseOptions: apiCourses,
      targetCourseOptions: apiCourses,
    };
  }, [apiCourses, routeProgramId]);

  const formatCourseLabel = (c: ApiCourse) =>
    `${c.courseCode} — ${c.courseName} (id ${c.courseId})`;

  const handleBackendMatch = async () => {
    setServerMatchError("");
    setServerMatchMessage("");
    if (!isLoggedIn || !authEmail || !authPassword) {
      setServerMatchError("Log in to use the live match API (HTTP Basic).");
      return;
    }
    const fromStr =
      apiCoursesStatus === "ok" && apiFromCourseId
        ? apiFromCourseId
        : manualFromId.trim();
    const toStr =
      apiCoursesStatus === "ok" && apiToCourseId
        ? apiToCourseId
        : manualToId.trim();
    const courseIdFrom = Number(fromStr);
    const courseIdTo = Number(toStr);
    if (!Number.isFinite(courseIdFrom) || !Number.isFinite(courseIdTo)) {
      setServerMatchError("Enter valid numeric course IDs for both courses.");
      return;
    }
    setApiMatchSubmitting(true);
    try {
      const text = await postJsonText(
        "/api/match",
        { courseIdFrom, courseIdTo },
        { headers: basicAuthHeader(authEmail, authPassword) }
      );
      setServerMatchMessage(text);
    } catch (e) {
      if (e instanceof ApiError) {
        setServerMatchError(e.body || `Request failed (${e.status})`);
      } else {
        setServerMatchError("Network error. Is the backend running?");
      }
    } finally {
      setApiMatchSubmitting(false);
    }
  };

  const sharedProgramData: DemoProgramData = {
    fromCourses: [
      "Course 1",
      "Course 2",
      "Course 3",
      "Course 4",
      "Course 5",
      "Course 6",
    ],
    toCourses: ["RU_C1", "RU_C2", "RU_C3", "RU_C4"],
    matches: {
      "Course 1": { to: "RU_C2", type: "Full Match" },
      "Course 2": { to: "RU_C1", type: "Partial Match" },
      "Course 3": { to: "RU_C1", type: "Full Match" },
      "Course 4": { to: "RU_C1", type: "Partial Match" },
      "Course 5": { to: "RU_C3", type: "Full Match" },
      "Course 6": { to: "RU_C4", type: "Full Match" },
    },
  };

  const programCourseData: Record<DemoProgramKey, DemoProgramData> = {
    "Program 1": sharedProgramData,
    "Program 2": sharedProgramData,
    "Program 3": sharedProgramData,
    "Program 4": sharedProgramData,
    "Program 5": sharedProgramData,
    "Program 6": sharedProgramData,
  };

  const programOptions = Object.keys(programCourseData) as DemoProgramKey[];

  function isDemoProgramKey(name: string): name is DemoProgramKey {
    return Object.prototype.hasOwnProperty.call(programCourseData, name);
  }

  const initialProgram: DemoProgramKey =
    location.state?.selectedProgram && isDemoProgramKey(String(location.state.selectedProgram))
      ? String(location.state.selectedProgram) as DemoProgramKey
      : "Program 1";

  const [program, setProgram] = useState<DemoProgramKey>(initialProgram);
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [selectedFromCourses, setSelectedFromCourses] = useState<string[]>([]);
  const [selectedToCourse, setSelectedToCourse] = useState("");
  const [matchResult, setMatchResult] = useState("");
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [showAlternativeCourses, setShowAlternativeCourses] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [savedTransferPlans, setSavedTransferPlans] = useState<SavedPlan[]>([]);

  const currentProgramData = programCourseData[program];

  useEffect(() => {
    setSelectedFromCourses([]);
    setSelectedToCourse("");
    setFromSearch("");
    setToSearch("");
    setMatchResult("");
    setShowCourseDetails(false);
    setShowAlternativeCourses(false);
    setSavedMessage("");
  }, [program]);

  const filteredFromCourses = useMemo(() => {
    return currentProgramData.fromCourses.filter((course) =>
      course.toLowerCase().includes(fromSearch.toLowerCase())
    );
  }, [currentProgramData.fromCourses, fromSearch]);

  const filteredToCourses = useMemo(() => {
    return currentProgramData.toCourses.filter((course) =>
      course.toLowerCase().includes(toSearch.toLowerCase())
    );
  }, [currentProgramData.toCourses, toSearch]);

  const handleFromCourseToggle = (course: string) => {
    setSelectedFromCourses((prev) =>
      prev.includes(course)
        ? prev.filter((item) => item !== course)
        : [...prev, course]
    );
  };

  const handleMatch = () => {
    setSavedMessage("");
    setShowCourseDetails(false);
    setShowAlternativeCourses(false);

    if (selectedFromCourses.length === 0 || !selectedToCourse) {
      setMatchResult("Please select at least one course and one Roosevelt course.");
      return;
    }

    if (selectedToCourse === "RU_C1") {
      const hasCourse2 = selectedFromCourses.includes("Course 2");
      const hasCourse3 = selectedFromCourses.includes("Course 3");
      const hasCourse4 = selectedFromCourses.includes("Course 4");

      if (hasCourse3) {
        setMatchResult("Full Match ✅\nSave your transfer plan.");
        return;
      }

      if (hasCourse2 && hasCourse4) {
        setMatchResult(
          "Full Match ✅\nCombined partial matches complete the requirement. Save your transfer plan."
        );
        return;
      }

      if (hasCourse2 || hasCourse4) {
        setMatchResult(
          "Partial Match ⚠️\nBrowse other courses to complete your match."
        );
        return;
      }
    }

    if (
      selectedFromCourses.length === 1 &&
      selectedFromCourses.includes("Course 1") &&
      selectedToCourse === "RU_C2"
    ) {
      setMatchResult("Full Match ✅\nSave your transfer plan.");
      return;
    }

    if (
      selectedFromCourses.length === 1 &&
      selectedFromCourses.includes("Course 5") &&
      selectedToCourse === "RU_C3"
    ) {
      setMatchResult("Full Match ✅\nSave your transfer plan.");
      return;
    }

    if (
      selectedFromCourses.length === 1 &&
      selectedFromCourses.includes("Course 6") &&
      selectedToCourse === "RU_C4"
    ) {
      setMatchResult("Full Match ✅\nSave your transfer plan.");
      return;
    }

    if (
      selectedFromCourses.includes("Course 2") ||
      selectedFromCourses.includes("Course 4")
    ) {
      setMatchResult(
        "Partial Match ⚠️\nBrowse other courses to complete your match."
      );
      return;
    }

    setMatchResult("No Match ❌\nBrowse other courses to find your match.");
  };

  const handleSavePlan = () => {
    if (!matchResult.includes("Full Match")) {
      setSavedMessage("Only full matches can be saved to the transfer plan.");
      return;
    }

    if (selectedFromCourses.length === 0 || !selectedToCourse) {
      setSavedMessage("Please complete your course selection first.");
      return;
    }

    const newPlan = {
      id: Date.now(),
      program,
      fromCourses: [...selectedFromCourses],
      toCourse: selectedToCourse,
    };

    setSavedTransferPlans((prev) => [...prev, newPlan]);
    setSavedMessage("Transfer plan saved successfully.");
  };

  const handleReset = () => {
    setFromSearch("");
    setToSearch("");
    setSelectedFromCourses([]);
    setSelectedToCourse("");
    setMatchResult("");
    setShowCourseDetails(false);
    setShowAlternativeCourses(false);
    setSavedMessage("");
  };

  const handleRemovePlan = (id: number) => {
    setSavedTransferPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const getResultStyle = (): CSSProperties => {
    if (matchResult.includes("Full Match")) {
      return {
        backgroundColor: "#edfdf4",
        border: "1px solid #b7ebc6",
        color: "#166534",
      };
    }
    if (matchResult.includes("Partial Match")) {
      return {
        backgroundColor: "#fff8e8",
        border: "1px solid #f7d08a",
        color: "#9a6700",
      };
    }
    if (matchResult.includes("No Match")) {
      return {
        backgroundColor: "#fff1f2",
        border: "1px solid #fecdd3",
        color: "#be123c",
      };
    }
    return {
      backgroundColor: "#f8fafc",
      border: "1px solid #dbe4ee",
      color: "#334155",
    };
  };

  const selectedMappings = selectedFromCourses.map((course) => {
    const mapping = currentProgramData.matches[course];
    return {
      course,
      to: mapping?.to ?? "No direct match",
      type: mapping?.type ?? "No Match",
    };
  });

  const alternativeCourses = currentProgramData.toCourses.filter(
    (course) => course !== selectedToCourse
  );

  return (
    <div style={pageStyle}>
      <div style={heroStyle}>
        <h1 style={heroTitleStyle}>Match Courses</h1>
        <p style={heroSubtitleStyle}>
          Compare transfer courses to Roosevelt University requirements and build
          a sample transfer plan.
        </p>
      </div>

      <div style={sectionCardStyle}>
        <h3 style={sectionTitleStyle}>Live backend match</h3>
        <p style={{ ...summaryTextStyle, marginTop: 0 }}>
          Uses <code>GET /api/courses</code> and <code>POST /api/match</code> on your local Spring
          server (via Vite proxy). Course list requires an <strong>admin</strong> or{" "}
          <strong>director</strong> account; students can still call match if they enter two course
          IDs manually.
        </p>
        {routeProgramName && (
          <p style={summaryTextStyle}>
            <strong>Route context:</strong> {routeProgramName}
            {routeProgramId != null ? ` (program id ${routeProgramId})` : ""}
          </p>
        )}
        {!isLoggedIn && (
          <p style={{ ...savedMessageStyle, color: "#9a6700" }}>
            You are not logged in. Sign in so the app can send HTTP Basic credentials with API
            requests.
          </p>
        )}
        {isLoggedIn && apiCoursesStatus === "loading" && (
          <p style={summaryTextStyle}>Loading courses from API…</p>
        )}
        {apiCoursesStatus === "forbidden" && (
          <p style={{ ...savedMessageStyle, color: "#9a6700" }}>
            Your account cannot list courses (403). Log in as director or admin to populate
            dropdowns, or use manual course IDs below.
          </p>
        )}
        {apiCoursesStatus === "error" && (
          <p style={{ ...savedMessageStyle, color: "#b42318" }}>
            Could not load courses. Check that the backend is running and you are logged in.
          </p>
        )}
        {apiCoursesStatus === "ok" && transferCourseOptions.length > 0 && (
          <div style={{ ...gridStyle, marginTop: 12 }}>
            <div style={panelStyle}>
              <h4 style={panelHeadingStyle}>Transfer course (from)</h4>
              <select
                value={apiFromCourseId}
                onChange={(e) => setApiFromCourseId(e.target.value)}
                style={selectStyle}
              >
                <option value="">Select course</option>
                {transferCourseOptions.map((c) => (
                  <option key={c.courseId} value={String(c.courseId)}>
                    {formatCourseLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div style={panelStyle}>
              <h4 style={panelHeadingStyle}>Target course (to)</h4>
              <select
                value={apiToCourseId}
                onChange={(e) => setApiToCourseId(e.target.value)}
                style={selectStyle}
              >
                <option value="">Select course</option>
                {targetCourseOptions.map((c) => (
                  <option key={c.courseId} value={String(c.courseId)}>
                    {formatCourseLabel(c)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {(apiCoursesStatus === "forbidden" ||
          apiCoursesStatus === "idle" ||
          apiCoursesStatus === "error") &&
          isLoggedIn && (
          <div style={{ ...gridStyle, marginTop: 12 }}>
            <div style={panelStyle}>
              <h4 style={panelHeadingStyle}>Transfer course ID (manual)</h4>
              <input
                type="number"
                placeholder="e.g. 1"
                value={manualFromId}
                onChange={(e) => setManualFromId(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={panelStyle}>
              <h4 style={panelHeadingStyle}>Target course ID (manual)</h4>
              <input
                type="number"
                placeholder="e.g. 2"
                value={manualToId}
                onChange={(e) => setManualToId(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        )}
        {apiCoursesStatus === "ok" && role === "student" && (
          <p style={{ ...summaryTextStyle, fontSize: "0.9rem" }}>
            Optional: you can still adjust IDs manually if needed.
          </p>
        )}
        <div style={{ ...buttonRowStyle, marginTop: 16 }}>
          <button
            type="button"
            style={primaryButtonStyle}
            disabled={apiMatchSubmitting}
            onClick={handleBackendMatch}
          >
            {apiMatchSubmitting ? "Requesting…" : "Get match from server"}
          </button>
        </div>
        {serverMatchError && (
          <p style={{ ...savedMessageStyle, color: "#b42318", marginTop: 12 }}>
            {serverMatchError}
          </p>
        )}
        {serverMatchMessage && (
          <div
            style={{
              ...resultBoxStyle,
              marginTop: 12,
              backgroundColor: "#edfdf4",
              border: "1px solid #b7ebc6",
              color: "#166534",
            }}
          >
            {serverMatchMessage}
          </div>
        )}
      </div>

      <div style={summaryCardStyle}>
        <div style={programRowStyle}>
          <label style={programLabelStyle}>Selected Roosevelt Program</label>
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value as DemoProgramKey)}
            style={programSelectStyle}
          >
            {programOptions.map((programName) => (
              <option key={programName} value={programName}>
                {programName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={sectionCardStyle}>
        <h3 style={sectionTitleStyle}>Course Selection</h3>

        <div style={gridStyle}>
          <div style={panelStyle}>
            <h4 style={panelHeadingStyle}>Transfer Courses</h4>
            <input
              type="text"
              placeholder="Search transfer courses..."
              value={fromSearch}
              onChange={(e) => setFromSearch(e.target.value)}
              style={inputStyle}
            />

            <div style={checkboxListStyle}>
              {filteredFromCourses.map((course) => (
                <label key={course} style={checkboxCardStyle}>
                  <input
                    type="checkbox"
                    checked={selectedFromCourses.includes(course)}
                    onChange={() => handleFromCourseToggle(course)}
                  />
                  <span>{course}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={panelStyle}>
            <h4 style={panelHeadingStyle}>Roosevelt Courses</h4>
            <input
              type="text"
              placeholder="Search Roosevelt courses..."
              value={toSearch}
              onChange={(e) => setToSearch(e.target.value)}
              style={inputStyle}
            />

            <select
              value={selectedToCourse}
              onChange={(e) => setSelectedToCourse(e.target.value)}
              style={selectStyle}
            >
              <option value="">Select Roosevelt Course</option>
              {filteredToCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={selectionSummaryStyle}>
          <p style={summaryTextStyle}>
            <strong>Selected Transfer Course(s):</strong>{" "}
            {selectedFromCourses.length > 0
              ? selectedFromCourses.join(", ")
              : "None selected"}
          </p>
          <p style={summaryTextStyle}>
            <strong>Selected Roosevelt Course:</strong>{" "}
            {selectedToCourse || "None selected"}
          </p>
        </div>

        <div style={buttonRowStyle}>
          <button style={primaryButtonStyle} onClick={handleMatch}>
            Submit Match Request
          </button>
          <button style={saveButtonStyle} onClick={handleSavePlan}>
            Save Transfer Plan
          </button>
          <button style={secondaryButtonStyle} onClick={handleReset}>
            Reset
          </button>
        </div>

        {savedMessage && <p style={savedMessageStyle}>{savedMessage}</p>}
      </div>

      <div style={sectionCardStyle}>
        <h3 style={sectionTitleStyle}>Match Result</h3>
        <div style={{ ...resultBoxStyle, ...getResultStyle() }}>
          {matchResult || "No result yet. Submit a match request to view results."}
        </div>

        {matchResult && (
          <div style={{ ...buttonRowStyle, marginTop: "16px" }}>
            <button
              style={secondaryButtonStyle}
              onClick={() => setShowCourseDetails((prev) => !prev)}
            >
              {showCourseDetails ? "Hide Course Details" : "View Course Details"}
            </button>

            {(matchResult.includes("No Match") ||
              matchResult.includes("Partial Match")) && (
              <button
                style={ghostButtonStyle}
                onClick={() => setShowAlternativeCourses((prev) => !prev)}
              >
                {showAlternativeCourses
                  ? "Hide Other Courses"
                  : "Browse Other Courses"}
              </button>
            )}
          </div>
        )}

        {showCourseDetails && (
          <div style={detailsCardStyle}>
            <h4 style={detailsHeadingStyle}>Course Details</h4>

            <div style={detailsGridStyle}>
              <div style={detailColumnStyle}>
                <h5 style={detailSubheadingStyle}>Selected Transfer Course(s)</h5>

                {selectedFromCourses.length > 0 ? (
                  selectedMappings.map((item) => (
                    <div key={item.course} style={detailItemStyle}>
                      <p style={detailTitleStyle}>{item.course}</p>
                      <p style={detailTextStyle}>
                        <strong>Description:</strong>
                      </p>
                      <p style={detailTextStyle}>
                        <strong>Credits:</strong>
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={emptyTextStyle}>No transfer courses selected.</p>
                )}
              </div>

              <div style={detailColumnStyle}>
                <h5 style={detailSubheadingStyle}>Selected Roosevelt Course</h5>

                {selectedToCourse ? (
                  <div style={detailItemStyle}>
                    <p style={detailTitleStyle}>{selectedToCourse}</p>
                    <p style={detailTextStyle}>
                      <strong>Description:</strong>
                    </p>
                    <p style={detailTextStyle}>
                      <strong>Credits:</strong>
                    </p>
                  </div>
                ) : (
                  <p style={emptyTextStyle}>No Roosevelt course selected.</p>
                )}
              </div>
            </div>
          </div>
        )}
        {showAlternativeCourses && (
          <div style={detailsCardStyle}>
            <h4 style={detailsHeadingStyle}>Other Roosevelt Course Options</h4>
            <div style={detailsListStyle}>
              {alternativeCourses.map((course) => (
                <div key={course} style={detailItemStyle}>
                  <p style={detailTitleStyle}>{course}</p>
                  <p style={detailTextStyle}>
                    <strong>Description:</strong>
                  </p>
                  <p style={detailTextStyle}>
                    <strong>Credits:</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={sectionCardStyle}>
        <h3 style={sectionTitleStyle}>Saved Transfer Plans</h3>

        {savedTransferPlans.length === 0 ? (
          <p style={emptyTextStyle}>No transfer plans saved yet.</p>
        ) : (
          <div style={plansListStyle}>
            {savedTransferPlans.map((plan) => (
              <div key={plan.id} style={planCardStyle}>
                <div>
                  <p style={planTextStyle}>
                    <strong>Program:</strong> {plan.program}
                  </p>
                  <p style={planTextStyle}>
                    <strong>Transfer Course(s):</strong> {plan.fromCourses.join(", ")}
                  </p>
                  <p style={planTextStyle}>
                    <strong>Roosevelt Course:</strong> {plan.toCourse}
                  </p>
                </div>

                <button
                  style={removeButtonStyle}
                  onClick={() => handleRemovePlan(plan.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  padding: "36px 20px 56px",
  maxWidth: "1150px",
  margin: "0 auto",
  backgroundColor: "#f7faf8",
  minHeight: "100vh",
};

const heroStyle: CSSProperties = {
  background:
    "linear-gradient(135deg, #f5fff5 0%, #e8f8e7 55%, #dff1dc 100%)",
  border: "1px solid #c9e5d4",
  borderRadius: "24px",
  padding: "42px 28px",
  marginBottom: "20px",
  boxShadow: "0 18px 40px rgba(16, 24, 40, 0.06)",
};

const heroTitleStyle: CSSProperties = {
  margin: "0 0 10px 0",
  fontSize: "clamp(2rem, 5vw, 3.25rem)",
  fontWeight: "800",
  color: "#111827",
};

const heroSubtitleStyle: CSSProperties = {
  margin: 0,
  maxWidth: "720px",
  color: "#4b5563",
  fontSize: "1.02rem",
  lineHeight: "1.7",
};

const summaryCardStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #dfe7e2",
  borderRadius: "18px",
  padding: "18px 20px",
  marginBottom: "20px",
  boxShadow: "0 8px 24px rgba(16, 24, 40, 0.04)",
};

const programRowStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  flexWrap: "wrap",
};

const programLabelStyle: CSSProperties = {
  fontWeight: "700",
  color: "#111827",
};

const programSelectStyle: CSSProperties = {
  minWidth: "220px",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cad8cf",
  backgroundColor: "#fff",
  color: "#111827",
  outline: "none",
};

const sectionCardStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #dfe7e2",
  borderRadius: "20px",
  padding: "24px",
  marginBottom: "20px",
  boxShadow: "0 10px 28px rgba(16, 24, 40, 0.04)",
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: "18px",
  color: "#111827",
  fontSize: "1.2rem",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: "20px",
  marginBottom: "20px",
};

const panelStyle: CSSProperties = {
  backgroundColor: "#f9fcfa",
  border: "1px solid #dfe7e2",
  borderRadius: "16px",
  padding: "18px",
};

const panelHeadingStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: "14px",
  color: "#1f2937",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cad8cf",
  backgroundColor: "#fff",
  marginBottom: "12px",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cad8cf",
  backgroundColor: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

const checkboxListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  maxHeight: "260px",
  overflowY: "auto",
};

const checkboxCardStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 14px",
  border: "1px solid #e3ebe5",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  color: "#1f2937",
};

const selectionSummaryStyle: CSSProperties = {
  backgroundColor: "#f7faf8",
  border: "1px solid #dfe7e2",
  borderRadius: "14px",
  padding: "14px 16px",
  marginBottom: "18px",
};

const summaryTextStyle: CSSProperties = {
  margin: "6px 0",
  color: "#4b5563",
  lineHeight: "1.6",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const primaryButtonStyle: CSSProperties = {
  backgroundColor: "#2f7e41",
  color: "#ffffff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(47, 126, 65, 0.22)",
};

const saveButtonStyle: CSSProperties = {
  backgroundColor: "#2f7e41",
  color: "#ffffff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#374151",
  border: "1px solid #cad8cf",
  padding: "12px 18px",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer",
};

const ghostButtonStyle: CSSProperties = {
  backgroundColor: "#fefce8",
  color: "#854d0e",
  border: "1px solid #f5d58b",
  padding: "12px 18px",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer",
};

const savedMessageStyle: CSSProperties = {
  marginTop: "14px",
  color: "#374151",
  fontWeight: "600",
};

const resultBoxStyle: CSSProperties = {
  minHeight: "88px",
  borderRadius: "14px",
  padding: "18px",
  display: "flex",
  alignItems: "center",
  fontWeight: "700",
  whiteSpace: "pre-line",
  lineHeight: "1.6",
};

const detailsCardStyle: CSSProperties = {
  marginTop: "16px",
  padding: "16px",
  border: "1px solid #dfe7e2",
  borderRadius: "16px",
  backgroundColor: "#f9fcfa",
};

const detailsHeadingStyle: CSSProperties = {
  margin: "0 0 12px 0",
  color: "#111827",
};

const detailsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginTop: "12px",
};

const detailColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const detailSubheadingStyle: CSSProperties = {
  margin: "0 0 4px 0",
  fontSize: "1rem",
  fontWeight: "700",
  color: "#111827",
};

const detailsListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "12px",
};

const detailItemStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e3ebe5",
  borderRadius: "14px",
  padding: "14px",
};

const detailTitleStyle: CSSProperties = {
  margin: "0 0 8px 0",
  fontWeight: "700",
  color: "#111827",
};

const detailTextStyle: CSSProperties = {
  margin: "4px 0",
  color: "#4b5563",
  lineHeight: "1.6",
};

const emptyTextStyle: CSSProperties = {
  color: "#6b7280",
  margin: 0,
};

const plansListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const planCardStyle: CSSProperties = {
  border: "1px solid #e3ebe5",
  backgroundColor: "#f9fcfa",
  borderRadius: "16px",
  padding: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const planTextStyle: CSSProperties = {
  margin: "4px 0",
  color: "#4b5563",
};

const removeButtonStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#374151",
  border: "1px solid #cad8cf",
  padding: "10px 14px",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer",
};

export default MatchPage;