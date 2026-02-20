"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const accountItems = [
  {
    href: "/account/settings",
    title: "Settings",
    description: "Manage profile, session, and dashboard preferences."
  },
  {
    href: "/account/privacy",
    title: "Privacy",
    description: "Control analytics, alerts, and data retention options."
  },
  {
    href: "/account/help",
    title: "Help",
    description: "Read support requests from students and teachers."
  },
  {
    href: "/account/favorites",
    title: "Favorites",
    description: "Save quick admin notes and shortcuts."
  }
];

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100">
        <Sidebar />
        <main className="ml-64 p-6">
          <Navbar title="Account" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {accountItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="card transition hover:border-brand hover:shadow"
              >
                <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
