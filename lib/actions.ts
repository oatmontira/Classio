"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "./supabase-admin";
import type { Database } from "./database.types";
import { getCurrentProfile } from "./current-user";

function requireAdminClient() {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client is not configured. Check SUPABASE_SERVICE_ROLE_KEY.");
  }
  return supabaseAdmin;
}

function asString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalString(formData: FormData, key: string) {
  const value = asString(formData, key);
  return value.length ? value : null;
}

function asBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function revalidateApp() {
  ["/admin", "/teacher", "/student", "/users", "/courses", "/assignments", "/submit", "/review", "/grades", "/notifications"].forEach((path) => revalidatePath(path));
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function createUserAction(formData: FormData) {
  const client = requireAdminClient();
  const email = asString(formData, "email");
  const fullName = asString(formData, "full_name");
  const role = asString(formData, "role") as Database["public"]["Enums"]["user_role"];
  const code = asOptionalString(formData, "code");
  const password = asString(formData, "password") || "Password@12345";

  if (!email || !fullName || !role) throw new Error("Full name, email, and role are required.");

  const { data: authData, error: authError } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Supabase did not return a created user.");

  const { error: profileError } = await client.from("profiles").insert({
    id: authData.user.id,
    full_name: fullName,
    email,
    role,
    student_code: role === "student" ? code : null,
    teacher_code: role === "teacher" ? code : null,
    status: "active"
  });

  if (profileError) throw profileError;

  revalidateApp();
}

export async function updateUserAction(formData: FormData) {
  const client = requireAdminClient();
  const id = asString(formData, "id");
  const role = asString(formData, "role") as Database["public"]["Enums"]["user_role"];
  const code = asOptionalString(formData, "code");

  await client
    .from("profiles")
    .update({
      full_name: asString(formData, "full_name"),
      email: asString(formData, "email"),
      role,
      status: asString(formData, "status") as Database["public"]["Enums"]["account_status"],
      student_code: role === "student" ? code : null,
      teacher_code: role === "teacher" ? code : null
    })
    .eq("id", id);

  revalidateApp();
}

export async function deleteUserAction(formData: FormData) {
  const client = requireAdminClient();
  const id = asString(formData, "id");
  await client.auth.admin.deleteUser(id);
  revalidateApp();
}

export async function createCourseAction(formData: FormData) {
  const client = requireAdminClient();
  const profile = await getCurrentProfile();
  const courseCode = asString(formData, "course_code");
  const courseName = asString(formData, "course_name");
  const teacherId = profile.role === "teacher" ? profile.id : asString(formData, "teacher_id");

  if (!courseCode || !courseName || !teacherId) throw new Error("Course code, name, and teacher are required.");

  const { error } = await client.from("courses").insert({
    course_code: courseCode,
    course_name: courseName,
    description: asOptionalString(formData, "description"),
    term_id: asOptionalString(formData, "term_id"),
    teacher_id: teacherId,
    status: "active"
  });

  if (error) throw error;

  revalidateApp();
}

export async function updateCourseAction(formData: FormData) {
  const client = requireAdminClient();
  await client
    .from("courses")
    .update({
      course_code: asString(formData, "course_code"),
      course_name: asString(formData, "course_name"),
      description: asOptionalString(formData, "description"),
      term_id: asOptionalString(formData, "term_id"),
      teacher_id: asString(formData, "teacher_id"),
      status: asString(formData, "status") as Database["public"]["Enums"]["course_status"]
    })
    .eq("id", asString(formData, "id"));

  revalidateApp();
}

export async function deleteCourseAction(formData: FormData) {
  const client = requireAdminClient();
  await client.from("courses").update({ deleted_at: new Date().toISOString(), status: "archived" }).eq("id", asString(formData, "id"));
  revalidateApp();
}

export async function createAssignmentAction(formData: FormData) {
  const client = requireAdminClient();
  const courseId = asString(formData, "course_id");
  const teacherId = asString(formData, "teacher_id");
  const title = asString(formData, "title");
  const dueAt = asString(formData, "due_at");
  const selectedTypes = formData.getAll("allowed_submission_types").filter((value): value is Database["public"]["Enums"]["submission_type"] => typeof value === "string" && ["pdf", "image", "link", "video"].includes(value));

  if (!courseId || !teacherId || !title || !dueAt) throw new Error("Course, teacher, title, and due date are required.");

  const { error } = await client.from("assignments").insert({
    course_id: courseId,
    teacher_id: teacherId,
    title,
    description: asOptionalString(formData, "description"),
    max_score: Number(asString(formData, "max_score") || 0),
    allowed_submission_types: selectedTypes.length ? selectedTypes : ["pdf"],
    allow_resubmission: asBoolean(formData, "allow_resubmission"),
    allow_late_submission: asBoolean(formData, "allow_late_submission"),
    late_policy: asOptionalString(formData, "late_policy"),
    open_at: asOptionalString(formData, "open_at"),
    due_at: dueAt,
    published_at: asBoolean(formData, "publish") ? new Date().toISOString() : null,
    status: asBoolean(formData, "publish") ? "open" : "draft"
  });

  if (error) throw error;

  revalidateApp();
}

export async function updateAssignmentAction(formData: FormData) {
  const client = requireAdminClient();
  const id = asString(formData, "id");
  const courseId = asString(formData, "course_id");
  const teacherId = asString(formData, "teacher_id");
  const title = asString(formData, "title");
  const dueAt = asString(formData, "due_at");
  const selectedTypes = formData.getAll("allowed_submission_types").filter((value): value is Database["public"]["Enums"]["submission_type"] => typeof value === "string" && ["pdf", "image", "link", "video"].includes(value));

  if (!id || !courseId || !teacherId || !title || !dueAt) throw new Error("Assignment id, course, teacher, title, and due date are required.");

  const { error } = await client
    .from("assignments")
    .update({
      course_id: courseId,
      teacher_id: teacherId,
      title,
      description: asOptionalString(formData, "description"),
      max_score: Number(asString(formData, "max_score") || 0),
      allowed_submission_types: selectedTypes.length ? selectedTypes : ["pdf"],
      allow_resubmission: asBoolean(formData, "allow_resubmission"),
      allow_late_submission: asBoolean(formData, "allow_late_submission"),
      late_policy: asOptionalString(formData, "late_policy"),
      open_at: asOptionalString(formData, "open_at"),
      due_at: dueAt,
      published_at: asBoolean(formData, "publish") ? new Date().toISOString() : null,
      status: asString(formData, "status") as Database["public"]["Enums"]["assignment_status"]
    })
    .eq("id", id);

  if (error) throw error;

  revalidateApp();
}

export async function deleteAssignmentAction(formData: FormData) {
  const client = requireAdminClient();
  await client.from("assignments").update({ deleted_at: new Date().toISOString(), status: "closed" }).eq("id", asString(formData, "id"));
  revalidateApp();
}

export async function createSubmissionAction(formData: FormData) {
  const client = requireAdminClient();
  const profile = await getCurrentProfile();
  const assignmentId = asString(formData, "assignment_id");
  const studentId = profile.id;
  const submissionType = asString(formData, "submission_type") as Database["public"]["Enums"]["submission_type"];
  const linkUrl = asOptionalString(formData, "link_url");
  const files = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);

  if (!assignmentId || !studentId || !submissionType) throw new Error("Assignment, student, and submission type are required.");
  if (submissionType === "link" && !linkUrl) throw new Error("Link URL is required for link submissions.");
  if (submissionType !== "link" && files.length === 0 && !linkUrl) throw new Error("Please upload at least one file or provide a link.");

  const { data: assignment, error: assignmentError } = await client
    .from("assignments")
    .select("course_id")
    .eq("id", assignmentId)
    .single();

  if (assignmentError || !assignment) throw assignmentError ?? new Error("Assignment not found.");

  await client.from("submissions").update({ is_latest: false }).eq("assignment_id", assignmentId).eq("student_id", studentId);

  const { data: submission, error } = await client.from("submissions").insert({
    assignment_id: assignmentId,
    student_id: studentId,
    submission_type: submissionType,
    text_note: asOptionalString(formData, "text_note"),
    link_url: linkUrl,
    submitted_at: new Date().toISOString(),
    status: "submitted",
    is_latest: true
  }).select("id").single();

  if (error) throw error;
  if (!submission) throw new Error("Submission was not created.");

  for (const file of files) {
    const safeName = sanitizeFileName(file.name);
    const storagePath = `${assignment.course_id}/${assignmentId}/${studentId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await client.storage
      .from("submission-files")
      .upload(storagePath, await file.arrayBuffer(), {
        contentType: file.type || "application/octet-stream",
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { error: fileError } = await client.from("submission_files").insert({
      submission_id: submission.id,
      bucket_name: "submission-files",
      storage_path: storagePath,
      original_file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      file_size_bytes: file.size,
      uploaded_by: studentId
    });

    if (fileError) throw fileError;
  }

  revalidateApp();
}

export async function upsertGradeAction(formData: FormData) {
  const client = requireAdminClient();
  const submissionId = asString(formData, "submission_id");
  const teacherId = asString(formData, "teacher_id");
  const score = Number(asString(formData, "score") || 0);

  if (!submissionId || !teacherId) throw new Error("Submission and teacher are required.");

  const { error } = await client.from("grades").upsert(
    {
      submission_id: submissionId,
      teacher_id: teacherId,
      score,
      feedback: asOptionalString(formData, "feedback")
    },
    { onConflict: "submission_id" }
  );

  if (error) throw error;

  await client.from("submissions").update({ status: "graded" }).eq("id", submissionId);

  revalidateApp();
}
