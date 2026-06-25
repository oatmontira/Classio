export type Role = "admin" | "teacher" | "student";

export type Status =
  | "active"
  | "disabled"
  | "draft"
  | "open"
  | "closed"
  | "overdue"
  | "unsubmitted"
  | "submitted"
  | "late"
  | "graded";

export type SubmissionType = "PDF" | "Image" | "Link" | "Video";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  code: string;
  status: "active" | "disabled";
};

export type Course = {
  id: string;
  teacherId?: string;
  termId?: string | null;
  code: string;
  name: string;
  teacher: string;
  semester: string;
  academicYear: string;
  students: number;
  assignments: number;
  status: "active" | "closed";
};

export type Assignment = {
  id: string;
  courseId?: string;
  teacherId?: string;
  title: string;
  course: string;
  teacher: string;
  dueAt?: string;
  openAt?: string | null;
  dueDate: string;
  openDate: string;
  maxScore: number;
  status: "draft" | "open" | "closed" | "overdue";
  types: SubmissionType[];
  submitted: number;
  total: number;
  pendingReview: number;
};

export type Submission = {
  id: string;
  assignmentId?: string;
  studentId?: string;
  student: string;
  code: string;
  assignment: string;
  course: string;
  submittedAt: string;
  status: "submitted" | "late" | "graded" | "unsubmitted";
  file: string;
  score?: number;
  feedback?: string;
};
