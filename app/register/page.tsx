import Link from "next/link";
import { BookOpen, UserPlus } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { registerAction } from "@/lib/auth-actions";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

const errorText: Record<string, string> = {
  supabase_not_configured: "ยังไม่ได้ตั้งค่า Supabase service role",
  missing_fields: "กรุณากรอกข้อมูลให้ครบ",
  password_too_short: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
  create_user_failed: "ไม่สามารถสร้างบัญชีผู้ใช้ได้ อีเมลอาจถูกใช้งานแล้ว",
  create_profile_failed: "สร้างบัญชีได้แล้วแต่สร้าง profile ไม่สำเร็จ กรุณาลองใหม่"
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [params, locale] = await Promise.all([searchParams, getLocale()]);
  const errorMessage = params.error ? errorText[params.error] ?? "สมัครสมาชิกไม่สำเร็จ" : null;

  return (
    <main className="grid min-h-screen bg-[#f8fafc] lg:grid-cols-[1fr_560px]">
      <section className="flex items-center px-6 py-10 md:px-12">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-10 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600 text-white"><BookOpen size={22} /></span>
            <div>
              <p className="text-xl font-bold text-slate-950">SubmitHub</p>
              <p className="text-sm text-slate-500">{t(locale, "registerTitle")}</p>
            </div>
            <div className="ml-auto"><LanguageSwitcher locale={locale} /></div>
          </div>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{t(locale, "registerHero")}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {t(locale, "registerHeroBody")}
          </p>
        </div>
      </section>

      <section className="flex items-center border-l border-[#e2e8f0] bg-white px-6 py-10">
        <Card className="mx-auto w-full max-w-md">
          <div className="mb-6">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-blue-700"><UserPlus size={24} /></div>
            <h2 className="text-2xl font-semibold text-slate-950">{t(locale, "registerTitle")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t(locale, "registerAdminNote")}</p>
          </div>
          {errorMessage ? <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div> : null}
          <form action={registerAction} className="grid gap-4">
            <Field label={t(locale, "fullName")}><input name="full_name" className={inputClass} placeholder="Nicha Boonmee" required /></Field>
            <Field label={t(locale, "email")}><input name="email" className={inputClass} placeholder="name@university.ac.th" type="email" required /></Field>
            <Field label={t(locale, "password")}><input name="password" className={inputClass} placeholder="At least 8 characters" type="password" minLength={8} required /></Field>
            <Field label={t(locale, "role")}>
              <select name="role" className={inputClass} defaultValue="student" required>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </Field>
            <Field label={t(locale, "code")}><input name="code" className={inputClass} placeholder="661234001 or T-204" required /></Field>
            <Button className="w-full">{t(locale, "createAccount")}</Button>
          </form>
          <div className="mt-6 flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-500">{t(locale, "alreadyHaveAccount")}</span>
            <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-900">{t(locale, "login")}</Link>
          </div>
        </Card>
      </section>
    </main>
  );
}
