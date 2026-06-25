import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server";
import type { Role } from "./types";

export type CurrentProfile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  code: string;
  avatarUrl: string | null;
};

export async function getCurrentProfile(): Promise<CurrentProfile> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, student_code, teacher_code, avatar_url, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.status !== "active") redirect("/login?error=profile_not_active");

  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
    code: profile.student_code ?? profile.teacher_code ?? "-",
    avatarUrl: profile.avatar_url
  };
}
