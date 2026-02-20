"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function AdminCourseDetailPage() {
  const params = useParams();
  const courseId = String(params?.id || "");
  const frontendBase = process.env.NEXT_PUBLIC_WEB_BASE_URL || "http://localhost:3000";
  const adminDashboardUrl = process.env.NEXT_PUBLIC_ADMIN_BASE_URL || "http://localhost:3001/dashboard";
  const iframeUrl = `${frontendBase}/dashboard/tutor/course/${courseId}?returnTo=${encodeURIComponent(adminDashboardUrl)}`;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100">
        <Sidebar />
        <main className="ml-64 p-6">
          <Navbar title="Course Detail" />

          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-slate-600">Course ID: <span className="font-semibold text-slate-900">{courseId}</span></p>
            <Link href="/dashboard" className="btn-outline">Back to Dashboard</Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <iframe
              title="Course Detail"
              src={iframeUrl}
              className="h-[calc(100vh-240px)] w-full"
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
