export interface ClassOption {
  id: string;
  name: string;
  code?: string;
  studentCount?: number;
}

export type AssignmentTabType =
  | "ALL"
  | "OPEN"
  | "SUBMISSIONS"
  | "CLOSED"
  | "DRAFT_EXAMS"
  | "READY_EXAMS"
  | "ARCHIVED";

export interface AssignmentItem {
  id: string;
  title: string;
  examId?: string;
  classId: string;
  className: string;
  hskLevel: number;
  totalQuestions: number;
  totalPoints: number;
  durationMin: number;
  openDate: string;
  dueDate: string;
  status: "OPEN" | "ACTIVE" | "CLOSED" | "UPCOMING" | "ARCHIVED";
  statusText?: string;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  maxAttempts: number;
  allowLate: boolean;
  scorePolicy: "AFTER_SUBMIT" | "AFTER_PUBLISH" | "NEVER";
}

export interface StudentSubmissionItem {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentUsername?: string;
  studentAvatar?: string;
  classId: string;
  className: string;
  submittedAt: string;
  score: number | null;
  maxScore: number;
  submissionStatus: "NOT_STARTED" | "SUBMITTED" | "RESUBMISSION_REQUIRED";
  gradingStatus: "WAITING_MANUAL" | "AUTO_GRADED" | "GRADED" | "PUBLISHED";
  gradingStatusText?: string;
  attemptNumber: number;
  feedback?: string;
  answers?: Record<string, any>;
  answerDetails?: {questionId:string;content:string;userAnswer:string;correctAnswer:string;points:number;scoreEarned:number}[];
}

export interface ExamPackageItem {
  id: string;
  title: string;
  description: string;
  curriculum: string;
  hskLevel: number;
  status: "DRAFT" | "READY" | "USED";
  questionCount: number;
  questionsCount?: number;
  totalPoints: number;
  updatedAt: string;
  createdAt?: string;
  questions?: any[];
}

export interface AssignmentKpiData {
  totalExams: number;
  totalOpen: number;
  totalWaitingGrade: number;
  totalClosed: number;
  totalDrafts: number;
  totalReady: number;
  totalAssigned: number;
  totalSubmitted: number;
  totalGraded: number;
}
