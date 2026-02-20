"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StudentTable from "@/components/StudentTable";
import api from "@/services/api";
import { getFakeReason, isFakeUser } from "@/utils/identityCheck";

const SESSION_GET_ENDPOINTS = ["/admin/student-sessions", "/admin/sessions", "/admin/scheduled-sessions"];
const SESSION_CREATE_ENDPOINTS = ["/admin/student-sessions", "/admin/sessions"];
const SESSION_UPDATE_ENDPOINTS = ["/admin/student-sessions", "/admin/sessions"];
const SESSION_DELETE_ENDPOINTS = ["/admin/student-sessions", "/admin/sessions"];
const SESSION_CLEAR_ENDPOINTS = ["/admin/student-sessions/clear-all", "/admin/sessions/clear-all"];
const STUDENT_CLEAR_ENDPOINTS = ["/admin/students/clear-all", "/admin/students/clear", "/admin/clear-students"];
const STUDENT_APPROVE_ENDPOINTS = ["/admin/approve-student", "/admin/students/approve", "/admin/approve-user"];

const emptySessionForm = {
  studentId: "",
  courseId: "",
  scheduledAt: "",
  durationMinutes: "60",
  mode: "online",
  notes: ""
};

function isMissingEndpoint(error) {
  const status = error?.response?.status;
  return status === 404 || status === 405;
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function normalizeSessions(payload) {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.sessions)) {
    return payload.sessions;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
}

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionForm, setSessionForm] = useState(emptySessionForm);
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchStudents = async () => {
    const response = await api.get("/admin/students");
    const list = response.data?.data || [];
    setStudents(list);
    return list;
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get("/admin/courses");
      setCourses(response.data?.data || []);
    } catch (requestError) {
      setCourses([]);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await api.get("/admin/enrollments");
      setEnrollments(response.data?.data || []);
    } catch {
      setEnrollments([]);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    let loaded = false;

    for (const endpoint of SESSION_GET_ENDPOINTS) {
      try {
        const response = await api.get(endpoint);
        setSessions(normalizeSessions(response.data));
        loaded = true;
        break;
      } catch (requestError) {
        if (!isMissingEndpoint(requestError)) {
          setError(getErrorMessage(requestError, "Failed to fetch sessions"));
          break;
        }
      }
    }

    if (!loaded) {
      setSessions([]);
    }
    setLoadingSessions(false);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([fetchStudents(), fetchCourses(), fetchEnrollments(), fetchSessions()]);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to fetch students"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const studentNameById = useMemo(() => {
    const map = new Map();
    students.forEach((student) => map.set(String(student._id), student.name));
    return map;
  }, [students]);

  const courseTitleById = useMemo(() => {
    const map = new Map();
    courses.forEach((course) => map.set(String(course._id), course.title));
    return map;
  }, [courses]);

  const groupedStudents = useMemo(() => {
    const requests = [];
    const accepted = [];
    const enrolled = [];

    students.forEach((student) => {
      const status = String(student.status || "").toLowerCase();
      const requestStatus = String(student.requestStatus || "").toLowerCase();
      const paymentStatus = String(student.paymentStatus || "").toLowerCase();
      const isRequest = requestStatus === "pending" || status === "requested" || student.isApproved === false;
      const isEnrolled = paymentStatus === "paid" || status === "enrolled" || student.isEnrolled;

      if (isRequest) {
        requests.push(student);
      }
      if (!student.isBlocked && !isRequest) {
        accepted.push(student);
      }
      if (isEnrolled) {
        enrolled.push(student);
      }
    });

    return { requests, accepted, enrolled };
  }, [students]);

  const handleBlockToggle = async (student) => {
    setActionLoadingId(student._id);
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/block-user/${student._id}`, { isBlocked: !student.isBlocked });
      await fetchStudents();
      setMessage(`Student ${student.isBlocked ? "unblocked" : "blocked"} successfully.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to update student"));
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDelete = async (id) => {
    setActionLoadingId(id);
    setError("");
    setMessage("");
    try {
      await api.delete(`/admin/delete-user/${id}`);
      await fetchStudents();
      setMessage("Student deleted successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to delete student"));
    } finally {
      setActionLoadingId("");
    }
  };

  const handleApprove = async (student) => {
    if (isFakeUser(student)) {
      setError(`Cannot approve fake student record: ${getFakeReason(student)}.`);
      return;
    }

    setActionLoadingId(student._id);
    setError("");
    setMessage("");

    let approved = false;
    let hasActionError = false;
    for (const base of STUDENT_APPROVE_ENDPOINTS) {
      try {
        await api.put(`${base}/${student._id}`);
        approved = true;
        break;
      } catch (requestError) {
        if (!isMissingEndpoint(requestError)) {
          hasActionError = true;
          setError(getErrorMessage(requestError, "Failed to approve student"));
          break;
        }
      }
    }

    if (approved) {
      await fetchStudents();
      setMessage("Student approved successfully.");
    } else if (!hasActionError) {
      setError("Student approval API is not available on backend.");
    }

    setActionLoadingId("");
  };

  const focusSessionForStudent = (student) => {
    setSessionForm((prev) => ({ ...prev, studentId: student._id }));
  };

  const createSession = async () => {
    if (!sessionForm.studentId || !sessionForm.courseId || !sessionForm.scheduledAt) {
      setError("Please select student, course, and schedule date/time.");
      return;
    }

    setIsCreatingSession(true);
    setError("");
    setMessage("");

    const payload = {
      studentId: sessionForm.studentId,
      courseId: sessionForm.courseId,
      scheduledAt: sessionForm.scheduledAt,
      durationMinutes: Number(sessionForm.durationMinutes) || 60,
      mode: sessionForm.mode,
      notes: sessionForm.notes
    };

    let created = false;

    for (const endpoint of SESSION_CREATE_ENDPOINTS) {
      try {
        await api.post(endpoint, payload);
        created = true;
        break;
      } catch (requestError) {
        if (!isMissingEndpoint(requestError)) {
          setError(getErrorMessage(requestError, "Failed to create session"));
          break;
        }
      }
    }

    if (!created && !error) {
      setError("Session API is not available on backend. Add one of: /admin/student-sessions or /admin/sessions");
    }

    if (created) {
      setSessionForm((prev) => ({ ...emptySessionForm, studentId: prev.studentId }));
      await fetchSessions();
      setMessage("Session scheduled successfully.");
    }

    setIsCreatingSession(false);
  };

  const updateSessionStatus = async (sessionId, status) => {
    setActionLoadingId(sessionId);
    setError("");
    setMessage("");

    let updated = false;
    for (const base of SESSION_UPDATE_ENDPOINTS) {
      try {
        await api.put(`${base}/${sessionId}`, { status });
        updated = true;
        break;
      } catch (requestError) {
        if (!isMissingEndpoint(requestError)) {
          setError(getErrorMessage(requestError, "Failed to update session"));
          break;
        }
      }
    }

    if (updated) {
      await fetchSessions();
      setMessage(`Session marked as ${status}.`);
    } else if (!error) {
      setError("Session update API is not available on backend.");
    }

    setActionLoadingId("");
  };

  const deleteSession = async (sessionId) => {
    setActionLoadingId(sessionId);
    setError("");
    setMessage("");

    let deleted = false;
    for (const base of SESSION_DELETE_ENDPOINTS) {
      try {
        await api.delete(`${base}/${sessionId}`);
        deleted = true;
        break;
      } catch (requestError) {
        if (!isMissingEndpoint(requestError)) {
          setError(getErrorMessage(requestError, "Failed to delete session"));
          break;
        }
      }
    }

    if (deleted) {
      await fetchSessions();
      setMessage("Session deleted successfully.");
    } else if (!error) {
      setError("Session delete API is not available on backend.");
    }

    setActionLoadingId("");
  };

  const clearAll = async () => {
    const ok = window.confirm(
      "Clear all student and session data? This removes records from database when supported by backend endpoints."
    );
    if (!ok) {
      return;
    }

    setIsClearingAll(true);
    setError("");
    setMessage("");

    try {
      let studentsCleared = false;
      let sessionsCleared = false;

      for (const endpoint of STUDENT_CLEAR_ENDPOINTS) {
        try {
          await api.delete(endpoint);
          studentsCleared = true;
          break;
        } catch (requestError) {
          if (!isMissingEndpoint(requestError)) {
            throw requestError;
          }
        }
      }

      for (const endpoint of SESSION_CLEAR_ENDPOINTS) {
        try {
          await api.delete(endpoint);
          sessionsCleared = true;
          break;
        } catch (requestError) {
          if (!isMissingEndpoint(requestError)) {
            throw requestError;
          }
        }
      }

      if (!studentsCleared) {
        await Promise.allSettled(students.map((student) => api.delete(`/admin/delete-user/${student._id}`)));
      }

      if (!sessionsCleared) {
        const cleanup = sessions.map((session) => {
          const id = session._id || session.id;
          if (!id) {
            return Promise.resolve();
          }
          return api.delete(`/admin/student-sessions/${id}`).catch(() => api.delete(`/admin/sessions/${id}`));
        });
        await Promise.allSettled(cleanup);
      }

      await fetchAll();
      setSessionForm(emptySessionForm);
      setMessage("All student and session data has been cleared.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to clear all data"));
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleApproveEnrollment = async (enrollment) => {
    setActionLoadingId(enrollment._id);
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/enrollments/${enrollment._id}/approve`);
      await fetchEnrollments();
      setMessage("Enrollment approved by admin.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to approve enrollment"));
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRejectEnrollment = async (enrollment) => {
    setActionLoadingId(enrollment._id);
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/enrollments/${enrollment._id}/reject`);
      await fetchEnrollments();
      setMessage("Enrollment rejected by admin.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to reject enrollment"));
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100">
        <Sidebar />
        <main className="ml-64 p-6">
          <Navbar title="Manage Students" />

          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

          <div className="card mb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Student Lifecycle</h2>
                <p className="text-sm text-slate-600">Track requests, accepted students, paid enrollments, and session schedules.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn-outline" onClick={fetchAll} type="button">
                  Refresh
                </button>
                <button className="btn-danger" disabled={isClearingAll} onClick={clearAll} type="button">
                  {isClearingAll ? "Clearing..." : "Clear Page Data"}
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Student requests</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{groupedStudents.requests.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Accepted students</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{groupedStudents.accepted.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Enrolled students (paid)</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{groupedStudents.enrolled.length}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="card">
              <p className="text-sm text-slate-500">Loading students...</p>
            </div>
          ) : (
            <StudentTable
              loadingId={actionLoadingId}
              onApprove={handleApprove}
              onBlock={handleBlockToggle}
              onDelete={handleDelete}
              onManageSession={focusSessionForStudent}
              students={students}
            />
          )}

          <section className="card mt-4 overflow-x-auto">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Enrollment Approvals</h2>
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Requested</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment._id} className="border-b border-slate-100">
                    <td className="py-3 text-slate-700">{enrollment.student?.name || "Student"}</td>
                    <td className="py-3 text-slate-700">{enrollment.course?.title || "Course"}</td>
                    <td className="py-3 text-slate-700">{enrollment.status}</td>
                    <td className="py-3 text-slate-700">
                      {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          className="btn-primary"
                          disabled={actionLoadingId === enrollment._id || enrollment.status === "active"}
                          onClick={() => handleApproveEnrollment(enrollment)}
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          className="btn-outline"
                          disabled={actionLoadingId === enrollment._id || enrollment.status === "rejected_by_admin"}
                          onClick={() => handleRejectEnrollment(enrollment)}
                          type="button"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!enrollments.length && <p className="pt-2 text-sm text-slate-500">No enrollments found.</p>}
          </section>

          <section className="card mt-4">
            <h2 className="text-lg font-semibold text-slate-900">Course & Session Management</h2>
            <p className="mt-1 text-sm text-slate-600">
              Schedule and manage student sessions with course mapping and status tracking. Data is API-backed when endpoints exist.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Student</label>
                <select
                  className="input"
                  onChange={(event) => setSessionForm((prev) => ({ ...prev, studentId: event.target.value }))}
                  value={sessionForm.studentId}
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Course</label>
                <select
                  className="input"
                  onChange={(event) => setSessionForm((prev) => ({ ...prev, courseId: event.target.value }))}
                  value={sessionForm.courseId}
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule</label>
                <input
                  className="input"
                  onChange={(event) => setSessionForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                  type="datetime-local"
                  value={sessionForm.scheduledAt}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Duration (minutes)</label>
                <select
                  className="input"
                  onChange={(event) => setSessionForm((prev) => ({ ...prev, durationMinutes: event.target.value }))}
                  value={sessionForm.durationMinutes}
                >
                  <option value="30">30</option>
                  <option value="45">45</option>
                  <option value="60">60</option>
                  <option value="90">90</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Mode</label>
                <select
                  className="input"
                  onChange={(event) => setSessionForm((prev) => ({ ...prev, mode: event.target.value }))}
                  value={sessionForm.mode}
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</label>
                <textarea
                  className="input min-h-[90px]"
                  onChange={(event) => setSessionForm((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Add class agenda, joining instructions, or student notes."
                  value={sessionForm.notes}
                />
              </div>
            </div>

            <div className="mt-4">
              <button className="btn-primary" disabled={isCreatingSession} onClick={createSession} type="button">
                {isCreatingSession ? "Scheduling..." : "Schedule Session"}
              </button>
            </div>
          </section>

          <section className="card mt-4 overflow-x-auto">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Scheduled Sessions</h2>
            {loadingSessions ? (
              <p className="text-sm text-slate-500">Loading sessions...</p>
            ) : (
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Course</th>
                    <th className="pb-3">Schedule</th>
                    <th className="pb-3">Mode</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => {
                    const sessionId = session._id || session.id;
                    const studentId = String(session.student?._id || session.studentId || "");
                    const courseId = String(session.course?._id || session.courseId || "");
                    const studentName = session.student?.name || studentNameById.get(studentId) || "Unknown student";
                    const courseTitle = session.course?.title || courseTitleById.get(courseId) || "Unknown course";
                    const scheduleRaw =
                      session.scheduledAt ||
                      session.startTime ||
                      (session.date ? `${session.date}${session.time ? ` ${session.time}` : ""}` : "");
                    const parsedSchedule = scheduleRaw ? new Date(scheduleRaw) : null;
                    const scheduleLabel =
                      parsedSchedule && !Number.isNaN(parsedSchedule.getTime())
                        ? parsedSchedule.toLocaleString()
                        : scheduleRaw || "N/A";
                    const status = session.status || "scheduled";

                    return (
                      <tr key={sessionId || `${studentId}-${courseId}-${schedule}`} className="border-b border-slate-100">
                        <td className="py-3 text-slate-700">{studentName}</td>
                        <td className="py-3 text-slate-700">{courseTitle}</td>
                        <td className="py-3 text-slate-700">{scheduleLabel}</td>
                        <td className="py-3 text-slate-700">{session.mode || "online"}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{status}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="btn-outline"
                              disabled={!sessionId || actionLoadingId === sessionId}
                              onClick={() => updateSessionStatus(sessionId, "completed")}
                              type="button"
                            >
                              Complete
                            </button>
                            <button
                              className="btn-outline"
                              disabled={!sessionId || actionLoadingId === sessionId}
                              onClick={() => updateSessionStatus(sessionId, "cancelled")}
                              type="button"
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-danger"
                              disabled={!sessionId || actionLoadingId === sessionId}
                              onClick={() => deleteSession(sessionId)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {!loadingSessions && !sessions.length && <p className="pt-2 text-sm text-slate-500">No sessions found.</p>}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
