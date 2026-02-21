"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/services/api";

const REFRESH_INTERVAL_MS = 15000;

function getCoursePayload(responseData) {
  const nested = responseData?.data?.data ?? responseData?.data ?? responseData;
  return nested?.course ?? nested;
}

function extractLessons(course) {
  if (Array.isArray(course?.lessons)) return course.lessons;
  if (Array.isArray(course?.modules)) {
    return course.modules.flatMap((moduleItem) => moduleItem?.lessons || []);
  }
  return [];
}

async function fetchCourseById(courseId) {
  const endpoints = [`/admin/courses/${courseId}`, `/courses/${courseId}`];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      return getCoursePayload(response.data);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404 || status === 405) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error("Unable to find course details");
}

export default function AdminCourseDetailPage() {
  const params = useParams();
  const courseId = String(params?.id || "");
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState("");

  const loadCourse = useCallback(
    async (silent = false) => {
      if (!courseId) return;
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        const nextCourse = await fetchCourseById(courseId);
        setCourse(nextCourse || null);
        setLessons(extractLessons(nextCourse));
        setLastSyncedAt(new Date().toLocaleString());
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load course details");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [courseId]
  );

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  useEffect(() => {
    if (!courseId) return undefined;
    const interval = setInterval(() => {
      loadCourse(true);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [courseId, loadCourse]);

  const approvalStatus = useMemo(() => {
    if (!course) return "Unknown";
    const state = course.approvalStatus || (course.isPublished ? "approved" : "pending");
    if (state === "approved") return "Approved";
    if (state === "rejected") return "Rejected";
    return "Pending Admin";
  }, [course]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100">
        <Sidebar />
        <main className="ml-64 p-6">
          <Navbar title="Course Detail (Live)" />

          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-slate-600">
              Course ID: <span className="font-semibold text-slate-900">{courseId}</span>
            </p>
            <div className="flex items-center gap-2">
              <button className="btn-outline" onClick={() => loadCourse(true)} type="button">
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <Link href="/dashboard" className="btn-outline">Back to Dashboard</Link>
            </div>
          </div>

          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          {loading ? (
            <div className="card">
              <p className="text-sm text-slate-500">Loading course...</p>
            </div>
          ) : (
            <>
              <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">{course?.title || "Untitled Course"}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Last synced: {lastSyncedAt || "Not synced yet"}
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-3">
                  <p>Teacher: <span className="font-medium text-slate-900">{course?.teacher?.name || "Unassigned"}</span></p>
                  <p>Subject: <span className="font-medium text-slate-900">{course?.subject || "N/A"}</span></p>
                  <p>Status: <span className="font-medium text-slate-900">{approvalStatus}</span></p>
                  <p>Price: <span className="font-medium text-slate-900">{course?.price ?? 0} INR</span></p>
                  <p>Duration: <span className="font-medium text-slate-900">{course?.durationInWeeks ?? 0} weeks</span></p>
                  <p>Total lessons: <span className="font-medium text-slate-900">{lessons.length}</span></p>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h3 className="text-base font-semibold text-slate-900">Lessons</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessons.map((lesson, index) => (
                        <tr key={String(lesson?._id || lesson?.id || index)} className="border-b border-slate-100">
                          <td className="px-4 py-3 font-medium text-slate-800">{lesson?.title || lesson?.name || `Lesson ${index + 1}`}</td>
                          <td className="px-4 py-3 text-slate-600">{lesson?.type || "Lesson"}</td>
                          <td className="px-4 py-3 text-slate-600">{lesson?.duration || lesson?.durationInMinutes || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {lesson?.updatedAt ? new Date(lesson.updatedAt).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!lessons.length && (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">
                    No lessons available yet. This view auto-refreshes every 15 seconds.
                  </p>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
