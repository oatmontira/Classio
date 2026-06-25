import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { t, type Locale } from "@/lib/i18n";
import type { Status } from "@/lib/types";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={clsx("card p-4 md:p-5", className)}>{children}</section>;
}

export function Button({
  children,
  variant = "primary",
  className,
  type = "submit",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary: "bg-[#2563eb] text-white hover:bg-[#1e40af]",
    secondary: "border border-[#e2e8f0] bg-white text-[#0f172a] hover:bg-[#f8fafc]",
    ghost: "text-[#334155] hover:bg-[#f1f5f9]",
    danger: "bg-[#dc2626] text-white hover:bg-[#b91c1c]"
  };

  return (
    <button {...props} type={type} className={clsx("focus-ring inline-flex h-10 items-center justify-center gap-2 rounded px-4 text-sm font-semibold transition", styles[variant], className)}>
      {children}
    </button>
  );
}

const statusStyles: Record<Status, string> = {
  active: "bg-emerald-50 text-emerald-700",
  disabled: "bg-slate-100 text-slate-500",
  draft: "border border-slate-300 bg-white text-slate-600",
  open: "bg-blue-50 text-blue-700",
  closed: "bg-slate-100 text-slate-700",
  overdue: "bg-red-50 text-red-700",
  unsubmitted: "bg-slate-100 text-slate-600",
  submitted: "bg-blue-50 text-blue-700",
  late: "bg-amber-50 text-amber-700",
  graded: "bg-emerald-50 text-emerald-700"
};

const statusLabelKeys: Record<Status, Parameters<typeof t>[1]> = {
  active: "active",
  disabled: "disabled",
  draft: "draft",
  open: "open",
  closed: "closed",
  overdue: "overdue",
  unsubmitted: "unsubmitted",
  submitted: "submitted",
  late: "late",
  graded: "graded"
};

export function Badge({ status, label, locale = "th" }: { status: Status; label?: string; locale?: Locale }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", statusStyles[status])}>
      {label ?? t(locale, statusLabelKeys[status])}
    </span>
  );
}

export function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-800">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
    </label>
  );
}

export const inputClass = "focus-ring h-10 rounded border border-[#e2e8f0] bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400";

export function StatCard({ label, value, note, tone = "blue" }: { label: string; value: string; note: string; tone?: "blue" | "sky" | "purple" | "green" | "amber" }) {
  const dot = {
    blue: "bg-blue-600",
    sky: "bg-sky-400",
    purple: "bg-violet-600",
    green: "bg-emerald-600",
    amber: "bg-amber-500"
  }[tone];

  return (
    <Card className="min-h-28">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className={clsx("h-2.5 w-2.5 rounded-full", dot)} />
      </div>
      <p className="mt-3 text-sm text-slate-500">{note}</p>
    </Card>
  );
}

export function SectionHeader({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        {eyebrow ? <p className="text-sm font-semibold text-blue-700">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
      </div>
      {action}
    </div>
  );
}
