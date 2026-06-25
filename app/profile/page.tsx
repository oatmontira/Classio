import { AppShell } from "@/components/app-shell";
import { Card, Field, SectionHeader, inputClass } from "@/components/ui";
import { getCurrentProfile } from "@/lib/current-user";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export default async function ProfilePage() {
  const [profile, locale] = await Promise.all([getCurrentProfile(), getLocale()]);
  const roleLabel = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);

  return (
    <AppShell role={profile.role} displayName={profile.name} locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={t(locale, "profileTitle")} eyebrow={t(locale, "accountSettings")} />
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <Card>
            <div className="grid justify-items-center text-center">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-violet-100 text-3xl font-bold text-violet-700">{profile.name.slice(0, 1).toUpperCase()}</div>
              <h2 className="mt-4 text-xl font-semibold">{profile.name}</h2>
              <p className="text-sm text-slate-500">{roleLabel} / {profile.code}</p>
              <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">{t(locale, "basicInformation")}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t(locale, "fullName")}><input className={inputClass} defaultValue={profile.name} readOnly /></Field>
              <Field label={t(locale, "email")}><input className={inputClass} defaultValue={profile.email} readOnly /></Field>
              <Field label={t(locale, "role")}><input className={inputClass} defaultValue={roleLabel} readOnly /></Field>
              <Field label={profile.role === "student" ? t(locale, "code") : profile.role === "teacher" ? t(locale, "code") : t(locale, "accountCode")}><input className={inputClass} defaultValue={profile.code} readOnly /></Field>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
