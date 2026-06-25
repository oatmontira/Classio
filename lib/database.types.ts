export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Enums: {
      user_role: "admin" | "teacher" | "student";
      account_status: "active" | "disabled";
      course_status: "active" | "archived" | "completed";
      enrollment_status: "active" | "removed" | "completed";
      assignment_status: "draft" | "scheduled" | "open" | "closed" | "overdue";
      submission_status: "draft" | "submitted" | "late" | "graded" | "returned";
      submission_type: "pdf" | "image" | "link" | "video";
      notification_type:
        | "assignment_published"
        | "deadline_reminder"
        | "submission_received"
        | "grade_released"
        | "assignment_overdue"
        | "system";
    };
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: Database["public"]["Enums"]["user_role"];
          student_code: string | null;
          teacher_code: string | null;
          avatar_url: string | null;
          status: Database["public"]["Enums"]["account_status"];
          last_sign_in_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role: Database["public"]["Enums"]["user_role"];
          student_code?: string | null;
          teacher_code?: string | null;
          avatar_url?: string | null;
          status?: Database["public"]["Enums"]["account_status"];
          last_sign_in_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      academic_terms: {
        Row: {
          id: string;
          academic_year: string;
          semester: string;
          starts_at: string | null;
          ends_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          academic_year: string;
          semester: string;
          starts_at?: string | null;
          ends_at?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["academic_terms"]["Insert"]>;
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          course_code: string;
          course_name: string;
          description: string | null;
          term_id: string | null;
          teacher_id: string;
          status: Database["public"]["Enums"]["course_status"];
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          course_code: string;
          course_name: string;
          description?: string | null;
          term_id?: string | null;
          teacher_id: string;
          status?: Database["public"]["Enums"]["course_status"];
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "courses_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "courses_term_id_fkey";
            columns: ["term_id"];
            isOneToOne: false;
            referencedRelation: "academic_terms";
            referencedColumns: ["id"];
          }
        ];
      };
      enrollments: {
        Row: {
          id: string;
          course_id: string;
          student_id: string;
          status: Database["public"]["Enums"]["enrollment_status"];
          enrolled_by: string | null;
          enrolled_at: string;
          removed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          student_id: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          enrolled_by?: string | null;
          removed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["enrollments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      assignments: {
        Row: {
          id: string;
          course_id: string;
          teacher_id: string;
          title: string;
          description: string | null;
          max_score: number;
          allowed_submission_types: Database["public"]["Enums"]["submission_type"][];
          allow_resubmission: boolean;
          allow_late_submission: boolean;
          late_policy: string | null;
          open_at: string | null;
          due_at: string;
          closed_at: string | null;
          published_at: string | null;
          status: Database["public"]["Enums"]["assignment_status"];
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          teacher_id: string;
          title: string;
          description?: string | null;
          max_score?: number;
          allowed_submission_types?: Database["public"]["Enums"]["submission_type"][];
          allow_resubmission?: boolean;
          allow_late_submission?: boolean;
          late_policy?: string | null;
          open_at?: string | null;
          due_at: string;
          closed_at?: string | null;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["assignment_status"];
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["assignments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignments_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          submission_type: Database["public"]["Enums"]["submission_type"];
          text_note: string | null;
          link_url: string | null;
          submitted_at: string | null;
          status: Database["public"]["Enums"]["submission_status"];
          attempt_no: number;
          is_latest: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          submission_type: Database["public"]["Enums"]["submission_type"];
          text_note?: string | null;
          link_url?: string | null;
          submitted_at?: string | null;
          status?: Database["public"]["Enums"]["submission_status"];
          attempt_no?: number;
          is_latest?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["submissions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      submission_files: {
        Row: {
          id: string;
          submission_id: string;
          bucket_name: string;
          storage_path: string;
          original_file_name: string;
          mime_type: string;
          file_size_bytes: number;
          file_hash: string | null;
          uploaded_by: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          bucket_name?: string;
          storage_path: string;
          original_file_name: string;
          mime_type: string;
          file_size_bytes: number;
          file_hash?: string | null;
          uploaded_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["submission_files"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "submission_files_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          }
        ];
      };
      grades: {
        Row: {
          id: string;
          submission_id: string;
          teacher_id: string;
          score: number;
          feedback: string | null;
          graded_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          teacher_id: string;
          score: number;
          feedback?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["grades"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "grades_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: true;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grades_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          title: string;
          message: string;
          related_course_id: string | null;
          related_assignment_id: string | null;
          related_submission_id: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          title: string;
          message: string;
          related_course_id?: string | null;
          related_assignment_id?: string | null;
          related_submission_id?: string | null;
          is_read?: boolean;
          read_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
