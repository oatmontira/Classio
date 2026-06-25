"use server";

import { redirect } from "next/navigation";
import { roleHome } from "./auth";
import { supabaseAdmin } from "./supabase-admin";
import { createSupabaseServerClient } from "./supabase-server";
import type { Role } from "./types";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateRegisterRole(value: string): Extract<Role, "teacher" | "student"> {
  if (value === "teacher" || value === "student") return value;
  throw new Error("Register role must be student or teacher.");
}

export async function loginAction(formData: FormData) {
  const email = readString(formData, "email");
  const password = readString(formData, "password");

  if (!email || !password) redirect("/login?error=missing_credentials");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=invalid_credentials");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("email", email)
    .maybeSingle();

  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirect("/login?error=profile_not_active");
  }

  redirect(roleHome[profile.role]);
}

export async function registerAction(formData: FormData) {
  if (!supabaseAdmin) redirect("/register?error=supabase_not_configured");

  const fullName = readString(formData, "full_name");
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const role = validateRegisterRole(readString(formData, "role"));
  const code = readString(formData, "code");

  if (!fullName || !email || !password || !code) redirect("/register?error=missing_fields");
  if (password.length < 8) redirect("/register?error=password_too_short");

  const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role }
  });

  if (createError || !createdUser.user) redirect("/register?error=create_user_failed");

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: createdUser.user.id,
    full_name: fullName,
    email,
    role,
    student_code: role === "student" ? code : null,
    teacher_code: role === "teacher" ? code : null,
    status: "active"
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
    redirect("/register?error=create_profile_failed");
  }

  redirect("/login?registered=1");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
