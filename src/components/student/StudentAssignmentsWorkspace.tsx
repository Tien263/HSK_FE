"use client";
export interface StudentAssignmentItem {
  id: string;
  title: string;
  className: string;
  classId?: string;
  durationMin: number;
  dueAt: string;
  totalQuestions: number;
  totalPoints?: number;
  hasAttempted: boolean;
  latestScore: number | null;
  status: "OPEN" | "SUBMITTED" | "OVERDUE" | "GRADED";
  submittedAt?: string;
  attemptId?: string;
}


export {default} from "@/components/learning/StudentAssignments";
