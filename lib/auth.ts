import type { Role } from "./types";

export const roleHome: Record<Role, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student"
};

export function canAccessPath(role: Role, pathname: string) {
  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/users" || pathname.startsWith("/users/")) {
    return role === "admin";
  }

  if (pathname === "/teacher" || pathname.startsWith("/teacher/") || pathname === "/review" || pathname.startsWith("/review/") || pathname === "/assignments/new") {
    return role === "teacher";
  }

  if (pathname === "/student" || pathname.startsWith("/student/") || pathname === "/submit" || pathname.startsWith("/submit/") || pathname === "/grades" || pathname.startsWith("/grades/")) {
    return role === "student";
  }

  if (pathname === "/courses" || pathname.startsWith("/courses/") || pathname === "/assignments" || pathname.startsWith("/assignments/") || pathname === "/notifications" || pathname.startsWith("/notifications/") || pathname === "/profile") {
    return true;
  }

  return false;
}

export function isPublicPath(pathname: string) {
  return pathname === "/login" || pathname === "/register";
}
