"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/services/api";

const NAME_SUFFIX_REGEX = /\.1$/;
const SETTINGS_STORAGE_KEY = "admin_professional_settings";
const LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Arabic",
  "Portuguese",
  "Chinese",
  "Japanese"
];
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AED", "JPY", "CAD", "AUD"];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const TIME_FORMATS = ["12-hour", "24-hour"];

const formatAdminName = (value) => {
  const clean = String(value || "").trim();
  if (!clean) {
    return "Admin";
  }
  return clean.replace(NAME_SUFFIX_REGEX, "");
};

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState("24-hour");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const raw = localStorage.getItem("admin_user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.name) {
            setName(formatAdminName(parsed.name));
          }
          setEmail(parsed?.email || "");
          setPhone(parsed?.phone || "");
          setCountry(parsed?.country || "");
        } catch (parseError) {
          setName("");
        }
      }

      try {
        const response = await api.get("/admin/profile");
        const user = response.data?.data;
        if (user?.name) {
          const nextName = formatAdminName(user.name);
          setName(nextName);
          setEmail(user.email || "");
          setPhone(user.phone || "");
          setCountry(user.country || "");
          localStorage.setItem("admin_user", JSON.stringify({ ...user, name: nextName }));
        }
      } catch (requestError) {
        // Use local fallback when profile API is temporarily unavailable.
      }

      const localSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          setLanguage(parsed.language || "English");
          setTimezone(parsed.timezone || "Asia/Kolkata");
          setCurrency(parsed.currency || "USD");
          setDateFormat(parsed.dateFormat || "DD/MM/YYYY");
          setTimeFormat(parsed.timeFormat || "24-hour");
          setSessionTimeout(parsed.sessionTimeout || "30");
          setTwoFactorEnabled(Boolean(parsed.twoFactorEnabled));
          setEmailNotifications(parsed.emailNotifications !== false);
          setSmsNotifications(Boolean(parsed.smsNotifications));
        } catch (parseError) {
          setLanguage("English");
          setTimezone("Asia/Kolkata");
          setCurrency("USD");
          setDateFormat("DD/MM/YYYY");
          setTimeFormat("24-hour");
          setSessionTimeout("30");
          setTwoFactorEnabled(false);
          setEmailNotifications(true);
          setSmsNotifications(false);
        }
      }
    };

    loadProfile();
  }, []);

  const saveProfileName = async () => {
    const cleanName = formatAdminName(name);
    if (!cleanName) {
      setError("Name is required");
      setMessage("");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("Confirm password does not match");
      setMessage("");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: cleanName,
        email: String(email || "").trim(),
        phone: String(phone || "").trim(),
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const response = await api.put("/admin/profile", payload);
      const user = response.data?.data || {};
      localStorage.setItem(
        "admin_user",
        JSON.stringify({
          ...user,
          name: cleanName,
          email: email || user.email || "",
          phone: phone || user.phone || "",
          country: country || user.country || ""
        })
      );
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          country,
          language,
          timezone,
          currency,
          dateFormat,
          timeFormat,
          sessionTimeout,
          twoFactorEnabled,
          emailNotifications,
          smsNotifications
        })
      );
      setName(cleanName);
      if (user?.email) setEmail(user.email);
      if (user?.phone) setPhone(user.phone || "");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Settings updated successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update profile name");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100">
        <Sidebar />
        <main className="ml-64 p-6">
          <Navbar title="Account Settings" />

          <section className="card mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <p className="mt-1 text-sm text-slate-600">Professional account identity for dashboard and admin actions.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Display Name</label>
                <input
                  className="input"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter admin name"
                  type="text"
                  value={name}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
                <input
                  className="input"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@company.com"
                  type="email"
                  value={email}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</label>
                <input
                  className="input"
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+91 90000 00000"
                  type="text"
                  value={phone}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Country / Region</label>
                <input
                  className="input"
                  onChange={(event) => setCountry(event.target.value)}
                  placeholder="United States"
                  type="text"
                  value={country}
                />
              </div>
            </div>
          </section>

          <section className="card mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Preferences</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Language</label>
                <select className="input" onChange={(event) => setLanguage(event.target.value)} value={language}>
                  {LANGUAGES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Timezone</label>
                <select className="input" onChange={(event) => setTimezone(event.target.value)} value={timezone}>
                  <option>Asia/Kolkata</option>
                  <option>UTC</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                  <option>Asia/Dubai</option>
                  <option>Asia/Singapore</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Currency</label>
                <select className="input" onChange={(event) => setCurrency(event.target.value)} value={currency}>
                  {CURRENCIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date format</label>
                <select className="input" onChange={(event) => setDateFormat(event.target.value)} value={dateFormat}>
                  {DATE_FORMATS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Time format</label>
                <select className="input" onChange={(event) => setTimeFormat(event.target.value)} value={timeFormat}>
                  {TIME_FORMATS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Session Timeout (minutes)</label>
                <select className="input" onChange={(event) => setSessionTimeout(event.target.value)} value={sessionTimeout}>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="60">60</option>
                </select>
              </div>
              <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-sm text-slate-700">Two-factor authentication</span>
                <input checked={twoFactorEnabled} onChange={() => setTwoFactorEnabled((prev) => !prev)} type="checkbox" />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-sm text-slate-700">Email notifications</span>
                <input checked={emailNotifications} onChange={() => setEmailNotifications((prev) => !prev)} type="checkbox" />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-sm text-slate-700">SMS notifications</span>
                <input checked={smsNotifications} onChange={() => setSmsNotifications((prev) => !prev)} type="checkbox" />
              </label>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Current password</label>
                <input
                  className="input"
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Enter current password"
                  type="password"
                  value={currentPassword}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">New password</label>
                <input
                  className="input"
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Leave blank to keep current"
                  type="password"
                  value={newPassword}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Confirm new password</label>
                <input
                  className="input"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  type="password"
                  value={confirmPassword}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button className="btn-primary" disabled={isSaving} onClick={saveProfileName} type="button">
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
            {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
