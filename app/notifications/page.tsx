import { AppShell } from "@/components/app-shell";
import { Card, SectionHeader } from "@/components/ui";
import { getCurrentProfile } from "@/lib/current-user";
import { getLocale } from "@/lib/i18n-server";
import { getNotifications } from "@/lib/queries";
import { Bell, CalendarClock, CheckCircle2 } from "lucide-react";

export default async function NotificationsPage() {
  const [profile, notifications, locale] = await Promise.all([getCurrentProfile(), getNotifications(), getLocale()]);

  return (
    <AppShell role={profile.role} displayName={profile.name} locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title="Notifications" eyebrow={notifications.source === "supabase" ? "Supabase inbox" : "Supabase not configured"} />
        <Card className="p-0">
          <div className="divide-y divide-slate-100">
            {notifications.data.map((notification) => {
              const Icon = notification.type === "deadline_reminder" || notification.type === "deadline" ? CalendarClock : notification.type === "grade_released" || notification.type === "grade" ? CheckCircle2 : Bell;
              return (
                <div key={notification.id} className={`flex gap-4 p-4 ${notification.unread ? "bg-blue-50/50" : "bg-white"}`}>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-blue-700 ring-1 ring-blue-100"><Icon size={18} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{notification.body}</p>
                    <p className="mt-2 text-xs text-slate-500">{notification.time}</p>
                  </div>
                  {notification.unread ? <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-600" /> : null}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
