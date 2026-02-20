"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

export default function Navbar({ title }) {
  const [adminName, setAdminName] = useState("Admin");

  const formatAdminName = (value) => {
    const clean = String(value || "").trim();
    if (!clean) {
      return "Admin";
    }
    return clean.replace(/\.\d+$/, "").replace(/\.+$/, "");
  };

  useEffect(() => {
    const loadProfile = async () => {
      const raw = localStorage.getItem("admin_user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.name) {
            setAdminName(formatAdminName(parsed.name));
          }
        } catch (parseError) {
          setAdminName("Admin");
        }
      }

      try {
        const response = await api.get("/admin/profile");
        const user = response.data?.data;
        if (user?.name) {
          setAdminName(formatAdminName(user.name));
          localStorage.setItem("admin_user", JSON.stringify(user));
        }
      } catch (requestError) {
        // Keep local storage fallback value if profile API fails temporarily.
      }
    };

    loadProfile();
  }, []);

  return (
    <header className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">Manage users, approvals and platform operations</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">{adminName}</div>
        </div>
      </div>
    </header>
  );
}

