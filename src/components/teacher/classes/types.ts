export interface ClassDetailItem {
  id: string;
  name: string;
  level: number;
  hskLevel?: number;
  track: "HSK" | "TOPIC" | "MAJOR";
  badgeText: string;
  status: "ACTIVE" | "PAUSED" | "UPCOMING" | "ENDED" | "ARCHIVED";
  statusText: string;
  isArchived?: boolean;
  studentCount: number;
  totalAssignments?: number;
  maxStudents: number;
  startDate: string;
  endDate: string;
  progressPercent: number | null;
  code: string;
  artwork: string;
  teacherName: string;
  description: string;
  autoApprove: boolean;
  requireRealName: boolean;
  avatarList: string[];
  createdAt?: string;
}

export interface StudentRowItem {
  id: string;
  name: string;
  username: string;
  email?: string;
  status: "LEARNING" | "INACTIVE" | "COMPLETED" | "PENDING";
  enrollmentStatus?: "PENDING" | "APPROVED" | "REJECTED";
  statusText: string;
  progressPercent: number;
  totalAssignments: number;
  submittedAssignments: number;
  joinedDate: string;
  avatar: string;
  lastActive?: string;
  scoreAvg?: number;
}

export interface ActivityFeedItem {
  id: string;
  studentName: string;
  action: string;
  target: string;
  time: string;
  avatar: string;
  type: "SUBMISSION" | "JOIN" | "MILESTONE";
}

export interface ClassScheduleSession {
  id: string;
  classId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  roomName: string;
  meetUrl: string;
  lessonFocus: string;
  isOnline: boolean;
  attendanceCount: number;
}

export interface AssignmentDetailItem {
  id: string;
  title: string;
  durationMin: number;
  dueAt: string;
  submittedCount: number;
  totalStudents: number;
  status: "ACTIVE" | "CLOSED" | "DRAFT";
  quizSetId?: string;
}
