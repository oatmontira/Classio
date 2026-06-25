import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { loginAction } from "@/lib/auth-actions";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button, Card, Field, inputClass } from "@/components/ui";

const errorText: Record<string, string> = {
  missing_credentials: "กรุณากรอกอีเมลและรหัสผ่าน",
  invalid_credentials: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  profile_not_active: "บัญชีนี้ยังไม่พร้อมใช้งานหรือถูกปิดใช้งาน"
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; registered?: string }> }) {
  const [params, locale] = await Promise.all([searchParams, getLocale()]);
  const errorMessage = params.error ? errorText[params.error] ?? "ไม่สามารถเข้าสู่ระบบได้" : null;

  return (
    <main className="grid min-h-screen bg-[#f8fafc] lg:grid-cols-[1fr_520px]">
      <section className="flex items-center px-6 py-10 md:px-12">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-10 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600 text-white"><BookOpen size={22} /></span>
            <div>
              <p className="text-xl font-bold text-slate-950">SubmitHub</p>
              <p className="text-sm text-slate-500">{t(locale, "appSubtitle")}</p>
            </div>
            <div className="ml-auto"><LanguageSwitcher locale={locale} /></div>
          </div>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{t(locale, "loginHero")}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {t(locale, "loginHeroBody")}
          </p>
        </div>
      </section>

      <section className="flex items-center border-l border-[#e2e8f0] bg-white px-6 py-10">
        <Card className="mx-auto w-full max-w-md">
          <div className="mb-6">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-blue-700"><ShieldCheck size={24} /></div>
            <h2 className="text-2xl font-semibold text-slate-950">{t(locale, "loginTitle")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t(locale, "loginIntro")}</p>
          </div>
          {params.registered ? <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{t(locale, "registered")}</div> : null}
          {errorMessage ? <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div> : null}
          <form action={loginAction} className="grid gap-4">
            <Field label={t(locale, "email")}><input name="email" className={inputClass} placeholder="name@university.ac.th" type="email" required /></Field>
            <Field label={t(locale, "password")}><input name="password" className={inputClass} placeholder="Password" type="password" required /></Field>
            <Button className="w-full">{t(locale, "login")} <ArrowRight size={16} /></Button>
          </form>
          <div className="mt-6 flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-500">{t(locale, "noAccount")}</span>
            <Link href="/register" className="font-semibold text-blue-700 hover:text-blue-900">{t(locale, "register")}</Link>
          </div>
        </Card>
      </section>
    </main>
  );
}
