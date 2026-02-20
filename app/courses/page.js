"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import CourseTable from "@/components/CourseTable";
import api from "@/services/api";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/courses");
      setCourses(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleApproveCourse = async (course) => {
    setActionLoadingId(course._id);
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/courses/${course._id}/approve`);
      await fetchCourses();
      setMessage("Course approved successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to approve course");
    }
    setActionLoadingId("");
  };

  const handleRejectCourse = async (course) => {
    setActionLoadingId(course._id);
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/courses/${course._id}/reject`);
      await fetchCourses();
      setMessage("Course rejected successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to reject course");
    }
    setActionLoadingId("");
  };

  const handleDelete = async (id) => {
    setActionLoadingId(id);
    setError("");
    setMessage("");
    try {
      await api.delete(`/admin/courses/${id}`);
      await fetchCourses();
      setMessage("Course deleted successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete course");
    } finally {
      setActionLoadingId("");
    }
  };
  const handleOpenCourse = (course) => {
    if (!course?._id) return;
    router.push(`/courses/${course._id}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100">
        <Sidebar />
        <main className="ml-64 p-6">
          <Navbar title="Manage Courses" />
          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
          {loading ? (
            <div className="card">
              <p className="text-sm text-slate-500">Loading courses...</p>
            </div>
          ) : (
            <CourseTable
              courses={courses}
              loadingId={actionLoadingId}
              onOpen={handleOpenCourse}
              onDelete={handleDelete}
              onApprove={handleApproveCourse}
              onReject={handleRejectCourse}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

