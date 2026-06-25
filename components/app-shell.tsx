"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  UploadCloud,
  User,
  Users
} from "lucide-react";
import type { Role } from "@/lib/types";
import { logoutAction } from "@/lib/auth-actions";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

const navByRole = {
  admin: [
    { href: "/admin", labelKey: "navDashboard", icon: LayoutDashboard },
    { href: "/users", labelKey: "navUsers", icon: Users },
    { href: "/courses", labelKey: "navCourses", icon: BookOpen },
    { href: "/assignments", labelKey: "navAssignments", icon: ClipboardList },
    { href: "/notifications", labelKey: "navNotifications", icon: Bell },
    { href: "/profile", labelKey: "navSettings", icon: Settings }
  ],
  teacher: [
    { href: "/teacher", labelKey: "navDashboard", icon: LayoutDashboard },
    { href: "/courses", labelKey: "navMyCourses", icon: BookOpen },
    { href: "/assignments", labelKey: "navAssignments", icon: ClipboardList },
    { href: "/review", labelKey: "navGrading", icon: CheckCircle2 },
    { href: "/notifications", labelKey: "navNotifications", icon: Bell },
    { href: "/profile", labelKey: "navProfile", icon: User }
  ],
  student: [
    { href: "/student", labelKey: "navDashboard", icon: LayoutDashboard },
    { href: "/courses", labelKey: "navMyCourses", icon: BookOpen },
    { href: "/submit", labelKey: "navToSubmit", icon: UploadCloud },
    { href: "/grades", labelKey: "navGrades", icon: GraduationCap },
    { href: "/notifications", labelKey: "navNotifications", icon: Bell },
    { href: "/profile", labelKey: "navProfile", icon: User }
  ]
} as const;

export function AppShell({ role, children, displayName, locale = "th" }: { role: Role; children: React.ReactNode; displayName?: string; locale?: Locale }) {
  const pathname = usePathname();
  const nav = navByRole[role];
  const title = displayName ?? (role === "admin" ? "Admin" : role === "teacher" ? "Teacher" : "Student");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-[#e2e8f0] bg-white px-4 py-5 lg:block">
        <Link href={`/${role}`} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white">
            <Home size={20} />
          </span>
          <span>
            <span className="block text-lg font-bold">SubmitHub</span>
            <span className="block text-xs font-medium text-slate-500">{t(locale, "appSubtitle")}</span>
          </span>
        </Link>
        <nav className="mt-8 grid gap-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition",
                  active ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                )}
              >
                <Icon size={20} />
                {t(locale, item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 border-b border-[#e2e8f0] bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-slate-500 md:max-w-md">
              <Search size={18} />
              <span className="truncate">{t(locale, "searchPlaceholder")}</span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher locale={locale} />
              <Link href="/notifications" className="grid h-10 w-10 place-items-center rounded border border-[#e2e8f0] bg-white text-slate-600">
                <Bell size={18} />
              </Link>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs uppercase tracking-wide text-blue-700">{role}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {title.slice(0, 1)}
              </div>
              <form action={logoutAction}>
                <button className="grid h-10 w-10 place-items-center rounded border border-[#e2e8f0] bg-white text-slate-600 transition hover:bg-slate-50" title={t(locale, "logout")}>
                  <LogOut size={18} />
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#e2e8f0] bg-white px-2 py-2 lg:hidden">
        {nav.slice(0, 5).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={clsx("grid justify-items-center gap-1 rounded py-1.5 text-[11px] font-semibold", active ? "text-blue-700" : "text-slate-500")}>
              <Icon size={19} />
              <span className="max-w-16 truncate">{t(locale, item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
