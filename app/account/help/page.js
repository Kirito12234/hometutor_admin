"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/services/api";

export default function HelpPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadSupport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/support-requests");
      setItems(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load support requests.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const resolve = async (id) => {
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/support-requests/${id}/resolve`);
      await loadSupport();
      setMessage("Support request marked as resolved.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to resolve request.");
    }
  };

  useEffect(() => {
    loadSupport();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100">
        <Sidebar />
        <main className="ml-64 p-6">
          <Navbar title="Help" />

          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

          <section className="card mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Need help?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Use the support options below for account issues, payment questions, and admin access help.
            </p>
            <p className="mt-3 text-sm text-slate-700">
              Email support:{" "}
              <a className="font-medium text-brand hover:underline" href="mailto:support@hometutor.com">
                support@hometutor.com
              </a>
            </p>
          </section>

          <section className="card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Support requests from app users</h3>
              <button className="btn-outline" onClick={loadSupport} type="button">
                Refresh
              </button>
            </div>
            {loading && <p className="text-sm text-slate-500">Loading support requests...</p>}
            {!loading && items.length === 0 && <p className="text-sm text-slate-500">No support requests found.</p>}
            {!loading && items.length > 0 && (
              <ul className="space-y-2">
                {items.map((item) => {
                  const resolved = String(item.title || "").toLowerCase().includes("[resolved]");
                  return (
                    <li key={item._id} className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                      <p className="text-sm font-medium text-slate-800">{item.title || "Support Request"}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.message || ""}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                        </p>
                        <button
                          className={resolved ? "btn-outline" : "btn-primary"}
                          disabled={resolved}
                          onClick={() => resolve(item._id)}
                          type="button"
                        >
                          {resolved ? "Resolved" : "Mark resolved"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
