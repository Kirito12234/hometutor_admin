"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const STORAGE_KEY = "admin_privacy_settings";

const defaultPrivacy = {
  activityTracking: true,
  securityAlerts: true,
  profileVisibility: "team",
  paymentDataMasking: true,
  dataRetentionMonths: "12",
  complianceMode: "GDPR",
  dataResidency: "Global",
  allowDataExport: true
};

export default function PrivacyPage() {
  const [privacy, setPrivacy] = useState(defaultPrivacy);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setPrivacy({
        activityTracking: Boolean(parsed.activityTracking),
        securityAlerts: Boolean(parsed.securityAlerts),
        profileVisibility: parsed.profileVisibility || "team",
        paymentDataMasking: parsed.paymentDataMasking !== false,
        dataRetentionMonths: parsed.dataRetentionMonths || "12",
        complianceMode: parsed.complianceMode || "GDPR",
        dataResidency: parsed.dataResidency || "Global",
        allowDataExport: parsed.allowDataExport !== false
      });
    } catch (parseError) {
      setPrivacy(defaultPrivacy);
    }
  }, []);

  const toggle = (key) => {
    setSaved(false);
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(privacy));
    setSaved(true);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100">
        <Sidebar />
        <main className="ml-64 p-6">
          <Navbar title="Privacy" />

          <section className="card">
            <h2 className="text-lg font-semibold text-slate-900">Privacy Controls</h2>
            <p className="mt-1 text-sm text-slate-600">Manage professional privacy controls for this admin account.</p>

            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-sm text-slate-700">Allow activity tracking for analytics</span>
                <input checked={privacy.activityTracking} onChange={() => toggle("activityTracking")} type="checkbox" />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-sm text-slate-700">Enable security alert notifications</span>
                <input checked={privacy.securityAlerts} onChange={() => toggle("securityAlerts")} type="checkbox" />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-sm text-slate-700">Mask sensitive payment details</span>
                <input checked={privacy.paymentDataMasking} onChange={() => toggle("paymentDataMasking")} type="checkbox" />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-sm text-slate-700">Allow user data export requests</span>
                <input checked={privacy.allowDataExport} onChange={() => toggle("allowDataExport")} type="checkbox" />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Profile visibility</label>
                <select
                  className="input"
                  onChange={(event) => {
                    setSaved(false);
                    setPrivacy((prev) => ({ ...prev, profileVisibility: event.target.value }));
                  }}
                  value={privacy.profileVisibility}
                >
                  <option value="private">Only me</option>
                  <option value="team">Admin team</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Data retention</label>
                <select
                  className="input"
                  onChange={(event) => {
                    setSaved(false);
                    setPrivacy((prev) => ({ ...prev, dataRetentionMonths: event.target.value }));
                  }}
                  value={privacy.dataRetentionMonths}
                >
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Compliance mode</label>
                <select
                  className="input"
                  onChange={(event) => {
                    setSaved(false);
                    setPrivacy((prev) => ({ ...prev, complianceMode: event.target.value }));
                  }}
                  value={privacy.complianceMode}
                >
                  <option value="GDPR">GDPR (EU)</option>
                  <option value="CCPA">CCPA (California)</option>
                  <option value="PDPA">PDPA (APAC)</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Data residency</label>
                <select
                  className="input"
                  onChange={(event) => {
                    setSaved(false);
                    setPrivacy((prev) => ({ ...prev, dataResidency: event.target.value }));
                  }}
                  value={privacy.dataResidency}
                >
                  <option value="Global">Global</option>
                  <option value="US">United States</option>
                  <option value="EU">European Union</option>
                  <option value="India">India</option>
                  <option value="MiddleEast">Middle East</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button className="btn-primary" onClick={save} type="button">
                Save Privacy Settings
              </button>
              {saved && <p className="mt-2 text-sm text-green-700">Privacy settings saved.</p>}
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
