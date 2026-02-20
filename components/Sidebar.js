"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/teachers", label: "Teachers" },
  { href: "/students", label: "Students" },
  { href: "/courses", label: "Courses" },
  { href: "/payments", label: "Payments" },
  { href: "/account", label: "Account" }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.replace("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-20 h-screen w-64 border-r border-slate-200 bg-white p-5">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-brand text-center text-xl font-bold leading-10 text-white">H</div>
        <div>
          <p className="font-semibold text-slate-900">Home Tutor</p>
          <p className="text-xs text-slate-500">Admin Panel</p>
        </div>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                active ? "bg-brand-soft text-brand-dark" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button className="btn-outline mt-8 w-full" onClick={logout} type="button">
        Logout
      </button>
    </aside>
  );
}
