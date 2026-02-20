"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import TeacherTable from "@/components/TeacherTable";
import StudentTable from "@/components/StudentTable";
import CourseTable from "@/components/CourseTable";
import api from "@/services/api";
import { getFakeReason, isFakeUser } from "@/utils/identityCheck";

const STUDENT_APPROVE_ENDPOINTS = ["/admin/approve-student", "/admin/students/approve", "/admin/approve-user"];

function isMissingEndpoint(error) {
  const status = error?.response?.status;
  return status === 404 || status === 405;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchStats = async () => {
    const response = await api.get("/admin/dashboard-stats");
    setStats(response.data?.data || null);
  };

  const fetchTeachers = async () => {
    const response = await api.get("/admin/teachers");
    setTeachers(response.data?.data || []);
  };

  const fetchStudents = async () => {
    const response = await api.get("/admin/students");
    setStudents(response.data?.data || []);
  };

  const fetchCourses = async () => {
    const response = await api.get("/admin/courses");
    setCourses(response.data?.data || []);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([fetchStats(), fetchTeachers(), fetchStudents(), fetchCourses()]);
    const firstRejected = results.find((result) => result.status === "rejected");
    if (firstRejected && firstRejected.reason) {
      setError(firstRejected.reason.response?.data?.message || "Some dashboard data failed to load");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleApproveTeacher = async (id) => {
    const teacher = teachers.find((entry) => String(entry._id) === String(id));
    if (teacher && isFakeUser(teacher)) {
      setError(`Cannot approve fake teacher record: ${getFakeReason(teacher)}.`);
      return;
    }

    setActionLoadingId(id);
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/approve-teacher/${id}`);
      await fetchAll();
      setMessage("Teacher approved successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to approve teacher");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleApproveStudent = async (student) => {
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
          setError(requestError.response?.data?.message || "Failed to approve student");
          break;
        }
      }
    }

    if (approved) {
      await fetchAll();
      setMessage("Student approved successfully.");
    } else if (!hasActionError) {
      setError("Student approval API is not available on backend.");
    }

    setActionLoadingId("");
  };

  const handleBlockUser = async (user) => {
    setActionLoadingId(user._id);
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/block-user/${user._id}`, { isBlocked: !user.isBlocked });
      await fetchAll();
      setMessage(`User ${user.isBlocked ? "unblocked" : "blocked"} successfully.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update user");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDeleteUser = async (id) => {
    setActionLoadingId(id);
    setError("");
    setMessage("");
    try {
      await api.delete(`/admin/delete-user/${id}`);
      await fetchAll();
      setMessage("User deleted successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleApproveCourse = async (course) => {
    setActionLoadingId(course._id);
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/courses/${course._id}/approve`);
      await fetchAll();
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
      await fetchAll();
      setMessage("Course rejected successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to reject course");
    }
    setActionLoadingId("");
  };

  const handleDeleteCourse = async (id) => {
    setActionLoadingId(id);
    setError("");
    setMessage("");
    try {
      await api.delete(`/admin/courses/${id}`);
      await fetchAll();
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
          <Navbar title="Dashboard" />

          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

          {loading ? (
            <div className="card">
              <p className="text-sm text-slate-500">Loading dashboard data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatsCard title="Total Students" value={stats?.totalStudents || students.length || 0} />
                <StatsCard title="Total Teachers" value={stats?.totalTeachers || teachers.length || 0} color="text-violet-600" />
                <StatsCard title="Approved Teachers" value={stats?.approvedTeachers || 0} color="text-emerald-600" />
                <StatsCard title="Pending Teachers" value={stats?.pendingTeachers || 0} color="text-amber-600" />
                <StatsCard title="Pending Courses" value={stats?.pendingCourseApprovals || 0} color="text-orange-600" />
                <StatsCard title="Pending Enrollments" value={stats?.pendingEnrollmentApprovals || 0} color="text-cyan-600" />
                <StatsCard title="Total Courses" value={stats?.totalCourses || courses.length || 0} color="text-sky-600" />
                <StatsCard title="Total Enrollments" value={stats?.totalEnrollments || 0} color="text-purple-600" />
                <StatsCard title="Total Payments" value={stats?.totalPayments || 0} color="text-indigo-600" />
                <StatsCard title="Paid Payments" value={stats?.paidPayments || 0} color="text-green-600" />
                <StatsCard title="Pending Payments" value={stats?.pendingPayments || 0} color="text-yellow-600" />
                <StatsCard
                  title="Total Revenue"
                  value={`INR ${Number(stats?.totalRevenue || 0).toLocaleString()}`}
                  color="text-fuchsia-600"
                />
              </div>

              <TeacherTable
                loadingId={actionLoadingId}
                onApprove={handleApproveTeacher}
                onBlock={handleBlockUser}
                onDelete={handleDeleteUser}
                teachers={teachers}
              />

              <StudentTable
                loadingId={actionLoadingId}
                onApprove={handleApproveStudent}
                onBlock={handleBlockUser}
                onDelete={handleDeleteUser}
                onManageSession={() => {}}
                showSessionAction={false}
                students={students}
              />

              <CourseTable
                courses={courses}
                loadingId={actionLoadingId}
                onOpen={handleOpenCourse}
                onDelete={handleDeleteCourse}
                onApprove={handleApproveCourse}
                onReject={handleRejectCourse}
              />
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

