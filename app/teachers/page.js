"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import TeacherTable from "@/components/TeacherTable";
import api from "@/services/api";
import { getFakeReason, isFakeUser } from "@/utils/identityCheck";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchTeachers = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await api.get("/admin/teachers");
      setTeachers(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleApprove = async (id) => {
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
      await fetchTeachers();
      setMessage("Teacher approved successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to approve teacher");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleBlockToggle = async (teacher) => {
    setActionLoadingId(teacher._id);
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/block-user/${teacher._id}`, { isBlocked: !teacher.isBlocked });
      await fetchTeachers();
      setMessage(`Teacher ${teacher.isBlocked ? "unblocked" : "blocked"} successfully.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update teacher");
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
      await fetchTeachers();
      setMessage("Teacher deleted successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete teacher");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100">
        <Sidebar />
        <main className="ml-64 p-6">
          <Navbar title="Manage Teachers" />
          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
          {loading ? (
            <div className="card">
              <p className="text-sm text-slate-500">Loading teachers...</p>
            </div>
          ) : (
            <TeacherTable
              loadingId={actionLoadingId}
              onApprove={handleApprove}
              onBlock={handleBlockToggle}
              onDelete={handleDelete}
              teachers={teachers}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

