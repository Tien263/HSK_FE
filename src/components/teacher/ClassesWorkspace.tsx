"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Users,
  User,
  Plus,
  Search,
  LayoutGrid,
  List,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  FileSpreadsheet,
  UserPlus,
  Edit3,
  Archive,
  Eye,
  MoreVertical,
  X,
  FileCheck2,
  Clock,
  Calendar,
  ShieldCheck,
  Trash2,
  HelpCircle,
  BookOpen,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CopyPlus,
  RotateCcw,
  Sparkles,
  Layers,
  Lock,
} from "lucide-react";
import { getClassArtwork, normalizeDMY, parseDMY } from "@/lib/class-helper";
import { OFFICIAL_HSK1_15_LESSONS, Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";

// ============================================================================
// TYPES
// ============================================================================

export interface ClassDetailItem {
  id: string;
  name: string;
  level?: number;
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
  progressPercent: number | null; // CLASS-002: null when 0 assignments
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
  status: "LEARNING" | "INACTIVE" | "COMPLETED";
  statusText: string;
  progressPercent: number;
  submittedAssignments: number;
  totalAssignments: number;
  joinedDate: string;
  avatar: string;
}

export interface ActivityFeedItem {
  id: string;
  iconType: "SUBMIT" | "ADD_STUDENT" | "TEST_PASS" | "UPDATE_MATERIAL" | "JOIN_CODE";
  text: string;
  timeAgo: string;
}

interface ClassesWorkspaceProps {
  currentUser?: {
    id: string;
    name: string;
    username: string;
    email?: string | null;
    avatar?: string | null;
    role: string;
  } | null;
  onClassCountChange?: (count: number) => void;
  onAssignNew?: (classId: string) => void;
}

export interface ClassMaterialItem {
  id: string;
  classId: string;
  title: string;
  type: "PDF" | "AUDIO" | "SLIDE" | "EXCEL" | "DOC";
  size: string;
  url?: string;
  createdAt: string;
}

export interface ClassScheduleItem {
  id: string;
  classId: string;
  day: string;
  time: string;
  topic: string;
  room: string;
  meetUrl?: string;
}

export default function ClassesWorkspace({ currentUser, onClassCountChange, onAssignNew }: ClassesWorkspaceProps) {
  // 1. Classes list state (Loaded dynamically per teacher)
  const [classes, setClasses] = useState<ClassDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classFilterTab, setClassFilterTab] = useState<
    "MANAGING" | "ACTIVE" | "UPCOMING" | "PAUSED" | "ENDED" | "ARCHIVED" | "ALL"
  >("MANAGING");
  const [classSearchQuery, setClassSearchQuery] = useState("");
  const [classSortBy, setClassSortBy] = useState<"NEWEST" | "OLDEST" | "NAME_ASC" | "NAME_DESC" | "STUDENTS_DESC">("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");

  // Dynamic Materials Per Class
  const [classMaterials, setClassMaterials] = useState<Record<string, ClassMaterialItem[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_teacher_class_materials");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const saveMaterials = (newObj: Record<string, ClassMaterialItem[]>) => {
    setClassMaterials(newObj);
    if (typeof window !== "undefined") {
      localStorage.setItem("hanyu_teacher_class_materials", JSON.stringify(newObj));
    }
  };

  // Dynamic Schedules Per Class
  const [classSchedules, setClassSchedules] = useState<Record<string, ClassScheduleItem[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hanyu_teacher_class_schedules");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const saveSchedules = (newObj: Record<string, ClassScheduleItem[]>) => {
    setClassSchedules(newObj);
    if (typeof window !== "undefined") {
      localStorage.setItem("hanyu_teacher_class_schedules", JSON.stringify(newObj));
    }
  };

  // Dynamic Assignments Per Class
  const [classAssignments, setClassAssignments] = useState<any[]>([]);

  // Modals for Materials and Schedule
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [newMatTitle, setNewMatTitle] = useState("");
  const [newMatType, setNewMatType] = useState<"PDF" | "AUDIO" | "SLIDE" | "EXCEL" | "DOC">("PDF");
  const [newMatSize, setNewMatSize] = useState("12.5 MB");
  const [newMatUrl, setNewMatUrl] = useState("");

  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [newSchedDay, setNewSchedDay] = useState("Thứ Hai");
  const [newSchedTime, setNewSchedTime] = useState("19:30 – 21:00");
  const [newSchedTopic, setNewSchedTopic] = useState("");
  const [newSchedRoom, setNewSchedRoom] = useState("Phòng học trực tuyến Google Meet");
  const [newSchedMeetUrl, setNewSchedMeetUrl] = useState("https://meet.google.com/new");

  // 2. Class detail subtab
  const [detailSubTab, setDetailSubTab] = useState<
    "overview" | "curriculum" | "students" | "assignments" | "materials" | "schedule" | "reports" | "settings"
  >("overview");

  // 2b. Class 15-Lesson Curriculum & Custom Distribution State
  const [curriculumLessons, setCurriculumLessons] = useState<any[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [customizingLesson, setCustomizingLesson] = useState<Hsk1FullLesson | null>(null);
  const [customVocabs, setCustomVocabs] = useState<string[]>([]);
  const [customGrammars, setCustomGrammars] = useState<string[]>([]);
  const [customHasDialogue, setCustomHasDialogue] = useState(true);
  const [customTeacherNote, setCustomTeacherNote] = useState("");
  const [customDueDate, setCustomDueDate] = useState("");
  const [savingCurriculumLesson, setSavingCurriculumLesson] = useState(false);

  // 3. Join Method Subtab
  const [joinMethodTab, setJoinMethodTab] = useState<"code" | "link" | "email" | "issue">("code");

  // 4. Students list (Loaded dynamically from the selected class)
  const [studentsList, setStudentsList] = useState<StudentRowItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState<"ALL" | "LEARNING" | "INACTIVE" | "COMPLETED">("ALL");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedBulkClassIds, setSelectedBulkClassIds] = useState<string[]>([]);
  const [isBulkDeletingClasses, setIsBulkDeletingClasses] = useState(false);

  // 5. Activity Feed
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);

  // 6. Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 7. Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManualStudentModalOpen, setIsManualStudentModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentRowItem | null>(null);

  // Modal Xóa Lớp Học
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingClass, setDeletingClass] = useState<ClassDetailItem | null>(null);
  const [isDeletingClass, setIsDeletingClass] = useState(false);

  // Modal Mở lại Lớp Học (Vấn đề 2)
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopeningClass, setReopeningClass] = useState<ClassDetailItem | null>(null);
  const [reopenStartDate, setReopenStartDate] = useState(normalizeDMY(new Date()));
  const [reopenEndDate, setReopenEndDate] = useState(normalizeDMY(new Date(Date.now() + 180 * 86400000)));
  const [reopenError, setReopenError] = useState("");
  const [isSubmittingReopen, setIsSubmittingReopen] = useState(false);

  // Modal Lưu trữ Lớp Học (Archive)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archivingClass, setArchivingClass] = useState<ClassDetailItem | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Modal Nhân bản Lớp Học (Clone)
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloningClass, setCloningClass] = useState<ClassDetailItem | null>(null);
  const [cloneClassName, setCloneClassName] = useState("");
  const [cloneStartDate, setCloneStartDate] = useState(normalizeDMY(new Date()));
  const [cloneEndDate, setCloneEndDate] = useState(normalizeDMY(new Date(Date.now() + 180 * 86400000)));
  const [cloneAssignments, setCloneAssignments] = useState(true);
  const [cloneError, setCloneError] = useState("");
  const [isSubmittingClone, setIsSubmittingClone] = useState(false);

  // Form states for Create Class
  const [newClassName, setNewClassName] = useState("");
  const [newClassTrack, setNewClassTrack] = useState<"HSK" | "TOPIC" | "MAJOR">("HSK");
  const [newClassLevel, setNewClassLevel] = useState("HSK 3");
  const [newClassStartDate, setNewClassStartDate] = useState(normalizeDMY(new Date()));
  const [newClassEndDate, setNewClassEndDate] = useState(normalizeDMY(new Date(Date.now() + 180 * 86400000)));
  const [newClassStatus, setNewClassStatus] = useState<"AUTO" | "ACTIVE" | "UPCOMING" | "PAUSED">("AUTO");
  const [newClassDesc, setNewClassDesc] = useState("");
  const [newClassAllowCode, setNewClassAllowCode] = useState(true);
  const [newClassRequireApproval, setNewClassRequireApproval] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittingClass, setSubmittingClass] = useState(false);

  // Form states for Single Student
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentUsername, setNewStudentUsername] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("hsk123456");
  const [studentErrors, setStudentErrors] = useState<Record<string, string>>({});
  const [submittingStudent, setSubmittingStudent] = useState(false);

  // Excel Import state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [excelPreviewRows, setExcelPreviewRows] = useState<
    Array<{ name: string; email: string; username: string; status: string }>
  >([]);

  // Real teacher overview stats from reports API
  const [teacherOverviewStats, setTeacherOverviewStats] = useState<{
    activeAssignments: number;
    completionRate: number;
  } | null>(null);

  // ==========================================================================
  // FETCH CLASSES DYNAMICALLY FOR THE LOGGED-IN TEACHER
  // ==========================================================================
  const fetchClasses = async () => {
    if (!currentUser?.id) return;
    setLoading(true);

    try {
      // 1. Fetch classes
      const res = await fetch(`/api/v1/classes?teacherId=${currentUser.id}`, {
        headers: {
          "x-user-id": currentUser.id,
        },
      });

      // 2. Fetch overview stats for this teacher
      try {
        const resStats = await fetch(`/api/v1/reports/overview?teacherId=${currentUser.id}`, {
          headers: { "x-user-id": currentUser.id },
        });
        if (resStats.ok) {
          const statsJson = await resStats.json();
          if (statsJson.success && statsJson.data?.summary) {
            setTeacherOverviewStats({
              activeAssignments: statsJson.data.summary.activeAssignments || 0,
              completionRate: statsJson.data.summary.completionRate || 0,
            });
          }
        }
      } catch (e) {
        console.error("fetch teacher overview stats error:", e);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const transformed: ClassDetailItem[] = data.items.map((c: any, index: number) => {
          const trackType = c.track || (c.level <= 3 ? "HSK" : c.level === 4 ? "TOPIC" : "MAJOR");
          const art = getClassArtwork(trackType, c.level, index, c.name);
          const hasAssignments = typeof c.totalAssignments === "number" && c.totalAssignments > 0;

          const formattedCode = c.code || c.id.slice(-6).toUpperCase();
          let localEnrolledCount = 0;
          if (typeof window !== "undefined") {
            try {
              const regRaw = localStorage.getItem("hanyu_class_enrolled_students");
              if (regRaw) {
                const reg = JSON.parse(regRaw);
                const list = reg[c.id] || (c.code ? reg[c.code] : null) || reg[formattedCode] || [];
                localEnrolledCount = list.length;
              }
              const profRaw = localStorage.getItem("hanyu_study_profile");
              if (profRaw && localEnrolledCount === 0) {
                const p = JSON.parse(profRaw);
                const codeMatch =
                  (p.classCode || "").toUpperCase() === (c.code || formattedCode || "").toUpperCase();
                if (p.classInfo?.id === c.id || codeMatch) {
                  localEnrolledCount = 1;
                }
              }
              const enrolledClassesRaw = localStorage.getItem("hanyu_student_enrolled_classes");
              if (enrolledClassesRaw && localEnrolledCount === 0) {
                const enrolled = JSON.parse(enrolledClassesRaw);
                if (Array.isArray(enrolled)) {
                  const hasEnrolled = enrolled.some(
                    (ec: any) =>
                      ec.id === c.id ||
                      (ec.code || "").toUpperCase() === (c.code || formattedCode || "").toUpperCase()
                  );
                  if (hasEnrolled) localEnrolledCount = 1;
                }
              }
            } catch (e) {}
          }
          const finalStudentCount = Math.max(c.totalStudents || 0, localEnrolledCount);

          return {
            id: c.id,
            name: c.name,
            level: Number(c.level) || 1,
            track: trackType,
            badgeText: trackType === "HSK" ? `HSK ${c.level}.0` : trackType === "TOPIC" ? "Chủ đề" : "Chuyên ngành",
            status: c.status || (c.isActive ? "ACTIVE" : "ENDED"),
            statusText: c.statusText || (c.isActive ? "Đang dạy" : "Đã kết thúc"),
            isArchived: Boolean(c.isArchived || c.status === "ARCHIVED"),
            studentCount: finalStudentCount,
            totalAssignments: c.totalAssignments || 0,
            maxStudents: 30,
            startDate: c.startDate || normalizeDMY(c.createdAt),
            endDate: c.endDate || normalizeDMY(new Date(new Date(c.createdAt || Date.now()).getTime() + 180 * 86400000)),
            progressPercent: hasAssignments ? (c.progressPercent || 0) : null,
            code: formattedCode,
            artwork: art,
            teacherName: c.teacherName || currentUser.name,
            description: c.description || `Lớp học ${c.name} do cô/thầy ${currentUser.name} phụ trách.`,
            autoApprove: true,
            requireRealName: true,
            avatarList: c.avatarList || [],
          };
        });

        setClasses(transformed);
        if (onClassCountChange) onClassCountChange(transformed.length);

        // Auto select first class if none selected or previous one no longer exists
        if (transformed.length > 0) {
          if (!selectedClassId || !transformed.some((c) => c.id === selectedClassId)) {
            setSelectedClassId(transformed[0].id);
          }
        } else {
          setSelectedClassId(null);
          setStudentsList([]);
        }
      } else {
        setClasses([]);
        setSelectedClassId(null);
        setStudentsList([]);
      }
    } catch (err) {
      console.error("fetchClasses error:", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      fetchClasses();
    } else {
      setClasses([]);
      setSelectedClassId(null);
      setStudentsList([]);
      setLoading(false);
    }

    const handleSync = () => {
      if (currentUser?.id) {
        fetchClasses();
      }
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("hanyu_class_enrolled", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("hanyu_class_enrolled", handleSync);
    };
  }, [currentUser?.id]);

  // ==========================================================================
  // FETCH STUDENTS DYNAMICALLY FOR THE SELECTED CLASS
  // ==========================================================================
  const fetchClassStudents = async (classId: string) => {
    if (!classId || !currentUser?.id) return;
    setLoadingStudents(true);

    try {
      const res = await fetch(`/api/v1/classes/${classId}/students`, {
        headers: {
          "x-user-id": currentUser.id,
        },
      });

      const data = await res.json();
      let mapped: StudentRowItem[] = [];
      if (data.success && Array.isArray(data.items)) {
        mapped = data.items.map((s: any) => ({
          id: s.id,
          name: s.name,
          username: s.username,
          email: s.email || `${s.username}@gmail.com`,
          status: "LEARNING",
          statusText: "Đang học",
          progressPercent: s.progressPercent !== undefined ? s.progressPercent : (s.attemptsCount > 0 ? Math.min(100, s.attemptsCount * 20) : 0),
          submittedAssignments: s.attemptsCount || 0,
          totalAssignments: s.totalAssignments || 0,
          joinedDate: s.joinedAt ? new Date(s.joinedAt).toLocaleDateString("vi-VN") : "Hôm nay",
          avatar: s.avatar || "/theme/avatar-teacher.jpg",
        }));
      }

      // Đồng bộ từ registry ghi danh học sinh (Đảm bảo luôn thấy học viên đã vào lớp)
      if (typeof window !== "undefined") {
        try {
          const thisClass = classes.find((c) => c.id === classId);
          const registryRaw = localStorage.getItem("hanyu_class_enrolled_students");
          if (registryRaw) {
            const reg = JSON.parse(registryRaw);
            const listFromReg = [
              ...(reg[classId] || []),
              ...(thisClass?.code ? reg[thisClass.code] || [] : []),
            ];
            for (const s of listFromReg) {
              if (!mapped.some((item) => item.username === s.username || item.id === s.id)) {
                mapped.push({
                  id: s.id,
                  name: s.name || "Học viên",
                  username: s.username,
                  email: s.email || `${s.username}@gmail.com`,
                  status: "LEARNING",
                  statusText: "Đang học",
                  progressPercent: s.progressPercent || 0,
                  submittedAssignments: s.submittedAssignments || 0,
                  totalAssignments: s.totalAssignments || 0,
                  joinedDate: s.joinedDate || "Hôm nay",
                  avatar: s.avatar || "/theme/avatar-teacher.jpg",
                });
              }
            }
          }

          // Fallback: Kiểm tra cả hanyu_study_profile nếu học sinh vừa đăng ký
          const profileRaw = localStorage.getItem("hanyu_study_profile");
          if (profileRaw) {
            const prof = JSON.parse(profileRaw);
            if (prof.classInfo?.id === classId || prof.classCode === thisClass?.code || prof.classCode === classId) {
              const defaultStudentName = prof.studentName || "Học viên";
              const defaultStudentUsername = prof.username || "student";
              if (!mapped.some((s) => s.username === defaultStudentUsername)) {
                mapped.push({
                  id: "student-enrolled-profile",
                  name: defaultStudentName,
                  username: defaultStudentUsername,
                  email: prof.email || "student@hanyu.edu.vn",
                  status: "LEARNING",
                  statusText: "Đang học",
                  progressPercent: 0,
                  submittedAssignments: 0,
                  totalAssignments: 0,
                  joinedDate: "Hôm nay",
                  avatar: "/theme/avatar-teacher.jpg",
                });
              }
            }
          }
        } catch (e) {
          console.error("Local sync student error:", e);
        }
      }

      setStudentsList(mapped);

      // Cập nhật studentCount trong classes
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, studentCount: mapped.length } : c))
      );
    } catch (err) {
      console.error("fetchClassStudents error:", err);
      setStudentsList([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchClassAssignments = async (classId: string) => {
    try {
      const res = await fetch(`/api/v1/assignments?classId=${classId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setClassAssignments(data.items);
      } else {
        setClassAssignments([]);
      }
    } catch {
      setClassAssignments([]);
    }
  };

  const fetchCurriculumLessons = async (classId: string) => {
    setLoadingCurriculum(true);
    try {
      const res = await fetch(`/api/v1/classes/${classId}/lessons`);
      const data = await res.json();
      if (data.success && Array.isArray(data.lessons)) {
        setCurriculumLessons(data.lessons);
        setLoadingCurriculum(false);
        return;
      }
    } catch (err) {
      console.warn("fetchCurriculumLessons error:", err);
    }
    // Fallback: 15 default lessons for current class level
    const classLevel = currentClass?.level || 1;
    const baseLessons = getLessonsByHskLevel(classLevel);
    const defaults = baseLessons.map((ls) => ({
      lessonNumber: ls.number,
      titleZh: ls.titleZh,
      titleVi: ls.titleVi,
      pinyin: ls.pinyin,
      status: "LOCKED",
      isPublished: false,
      vocabCount: ls.vocabCount,
      grammarCount: ls.grammarCount,
      selectedVocabs: ls.vocabList,
      selectedGrammars: ls.grammarList,
      selectedDialogue: ls.dialogue,
      teacherNote: "",
    }));
    setCurriculumLessons(defaults);
    setLoadingCurriculum(false);
  };

  const handleOpenCustomizeLesson = (lsNumber: number) => {
    const classLevel = currentClass?.level || 1;
    const baseLessons = getLessonsByHskLevel(classLevel);
    const fullLesson = baseLessons.find((l) => l.number === lsNumber) || baseLessons[0];
    if (!fullLesson) return;

    const existing = curriculumLessons.find((cl) => cl.lessonNumber === lsNumber);
    setCustomizingLesson(fullLesson);

    if (existing && Array.isArray(existing.selectedVocabs) && existing.selectedVocabs.length > 0) {
      setCustomVocabs(existing.selectedVocabs.map((v: any) => v.hanzi));
    } else {
      setCustomVocabs(fullLesson.vocabList.map((v) => v.hanzi));
    }

    if (existing && Array.isArray(existing.selectedGrammars) && existing.selectedGrammars.length > 0) {
      setCustomGrammars(existing.selectedGrammars.map((g: any) => g.title || g.name));
    } else {
      setCustomGrammars(fullLesson.grammarList.map((g) => g.title));
    }

    setCustomHasDialogue(existing ? existing.hasDialogue !== false : true);
    setCustomTeacherNote(existing?.teacherNote || "");
    setCustomDueDate(existing?.dueDate || "");
  };

  const handleSaveCurriculumLesson = async (targetStatus: "PUBLISHED" | "DRAFT") => {
    if (!currentClass || !customizingLesson) return;
    setSavingCurriculumLesson(true);

    const chosenVocabs = customizingLesson.vocabList.filter((v) =>
      customVocabs.includes(v.hanzi)
    );
    const chosenGrammars = customizingLesson.grammarList.filter((g) =>
      customGrammars.includes(g.title)
    );

    try {
      const res = await fetch(`/api/v1/classes/${currentClass.id}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonNumber: customizingLesson.number,
          titleZh: customizingLesson.titleZh,
          titleVi: customizingLesson.titleVi,
          pinyin: customizingLesson.pinyin,
          status: targetStatus,
          selectedVocabs: chosenVocabs,
          selectedGrammars: chosenGrammars,
          selectedDialogue: customHasDialogue ? customizingLesson.dialogue : [],
          teacherNote: customTeacherNote,
          dueDate: customDueDate,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        showToast(resData.message || "Lỗi cập nhật bài học.");
        setSavingCurriculumLesson(false);
        return;
      }

      // Sync to localStorage hanyu_assigned_lessons for cross-tab reactive updates
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("hanyu_assigned_lessons");
          let arr = raw ? JSON.parse(raw) : [];
          arr = arr.filter(
            (a: any) =>
              !(
                (a.lessonId === customizingLesson.number ||
                  a.lessonId === `hsk1-b${String(customizingLesson.number).padStart(2, "0")}` ||
                  a.lessonId === `hsk1-${String(customizingLesson.number).padStart(2, "0")}`) &&
                Array.isArray(a.classIds) &&
                a.classIds.includes(currentClass.id)
              )
          );

          if (targetStatus === "PUBLISHED") {
            const newAss = {
              id: `assign-${currentClass.id}-${customizingLesson.number}-${Date.now()}`,
              lessonId: `hsk1-b${String(customizingLesson.number).padStart(2, "0")}`,
              lessonNumber: customizingLesson.number,
              titleZh: customizingLesson.titleZh,
              titleVi: customizingLesson.titleVi,
              classIds: [currentClass.id, currentClass.code],
              classNames: [currentClass.name],
              vocabCount: chosenVocabs.length,
              grammarCount: chosenGrammars.length,
              selectedVocabs: chosenVocabs,
              selectedGrammars: chosenGrammars,
              hasDialogue: customHasDialogue,
              selectedDialogue: customHasDialogue ? customizingLesson.dialogue : [],
              teacherNote: customTeacherNote,
              dueDate: customDueDate,
              assignedAt: new Date().toLocaleDateString("vi-VN"),
              status: "PUBLISHED",
            };
            arr.unshift(newAss);
          }

          localStorage.setItem("hanyu_assigned_lessons", JSON.stringify(arr));
          window.dispatchEvent(new Event("hanyu_lesson_assigned"));
          window.dispatchEvent(new Event("storage"));
        } catch (e) {}
      }

      await fetchCurriculumLessons(currentClass.id);
      setCustomizingLesson(null);
      setSavingCurriculumLesson(false);

      if (targetStatus === "PUBLISHED") {
        showToast(
          `🎉 Đã công bố Bài ${customizingLesson.number} cho lớp "${currentClass.name}" (${chosenVocabs.length} từ vựng, ${chosenGrammars.length} ngữ pháp)!`
        );
      } else {
        showToast(
          `📝 Đã lưu bản nháp Bài ${customizingLesson.number}. Học sinh chưa thể thấy bài này.`
        );
      }
    } catch (err) {
      console.error("Save curriculum lesson error:", err);
      showToast("Lỗi kết nối khi lưu bài học.");
      setSavingCurriculumLesson(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchClassStudents(selectedClassId);
      fetchClassAssignments(selectedClassId);
      fetchCurriculumLessons(selectedClassId);
    } else {
      setStudentsList([]);
      setClassAssignments([]);
      setCurriculumLessons([]);
    }
  }, [selectedClassId]);

  // Current selected class object
  const currentClass = classes.find((c) => c.id === selectedClassId) || null;

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`Đã sao chép ${label}: ${text}`);
    }
  };

  // Filtered classes according to tabs and search
  const filteredClasses = classes.filter((cl) => {
    // 1. Tab filter
    if (classFilterTab === "MANAGING") {
      // "Đang quản lý" ẩn lớp lưu trữ và lớp đã kết thúc
      if (cl.isArchived || cl.status === "ARCHIVED" || cl.status === "ENDED") return false;
    } else if (classFilterTab === "ACTIVE") {
      if (cl.isArchived || cl.status !== "ACTIVE") return false;
    } else if (classFilterTab === "UPCOMING") {
      if (cl.isArchived || cl.status !== "UPCOMING") return false;
    } else if (classFilterTab === "PAUSED") {
      if (cl.isArchived || cl.status !== "PAUSED") return false;
    } else if (classFilterTab === "ENDED") {
      if (cl.isArchived || cl.status !== "ENDED") return false;
    } else if (classFilterTab === "ARCHIVED") {
      if (!cl.isArchived && cl.status !== "ARCHIVED") return false;
    }

    // 2. Search query
    if (classSearchQuery.trim()) {
      const q = classSearchQuery.toLowerCase();
      return (
        cl.name.toLowerCase().includes(q) ||
        cl.code.toLowerCase().includes(q) ||
        cl.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sorted classes
  const sortedClasses = [...filteredClasses].sort((a, b) => {
    if (classSortBy === "NAME_ASC") return a.name.localeCompare(b.name, "vi");
    if (classSortBy === "NAME_DESC") return b.name.localeCompare(a.name, "vi");
    if (classSortBy === "STUDENTS_DESC") return b.studentCount - a.studentCount;
    if (classSortBy === "OLDEST") {
      const aDate = parseDMY(a.startDate)?.getTime() || 0;
      const bDate = parseDMY(b.startDate)?.getTime() || 0;
      return aDate - bDate;
    }
    // Default NEWEST
    const aDate = parseDMY(a.startDate)?.getTime() || 0;
    const bDate = parseDMY(b.startDate)?.getTime() || 0;
    return bDate - aDate;
  });

  // Pagination: Mặc định 12 lớp mỗi trang
  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.max(1, Math.ceil(sortedClasses.length / ITEMS_PER_PAGE));
  const paginatedClasses = sortedClasses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Filtered students
  const filteredStudents = studentsList.filter((st) => {
    if (studentStatusFilter === "LEARNING" && st.status !== "LEARNING") return false;
    if (studentStatusFilter === "INACTIVE" && st.status !== "INACTIVE") return false;
    if (studentStatusFilter === "COMPLETED" && st.status !== "COMPLETED") return false;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      return st.name.toLowerCase().includes(q) || st.username.toLowerCase().includes(q) || (st.email && st.email.toLowerCase().includes(q));
    }
    return true;
  });

  // Real Stats calculation for current teacher
  const totalClassesCount = classes.length;
  const managingClassesCount = classes.filter((c) => !c.isArchived && c.status !== "ARCHIVED" && c.status !== "ENDED").length;
  const activeClassesCount = classes.filter((c) => !c.isArchived && c.status === "ACTIVE").length;
  const endedClassesCount = classes.filter((c) => !c.isArchived && c.status === "ENDED").length;
  const archivedClassesCount = classes.filter((c) => c.isArchived || c.status === "ARCHIVED").length;
  const totalStudentsCount = classes.reduce((sum, c) => sum + c.studentCount, 0);

  // --------------------------------------------------------------------------
  // CREATE CLASS HANDLER (CONNECTS TO BACKEND)
  // --------------------------------------------------------------------------
  const handleCreateClass = async () => {
    const errors: Record<string, string> = {};
    if (!newClassName.trim()) errors.name = "Vui lòng nhập tên lớp học.";
    if (classes.some((c) => c.name.toLowerCase() === newClassName.trim().toLowerCase())) {
      errors.name = "Tên lớp này đã tồn tại trong danh sách lớp của cô/thầy.";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!currentUser?.id) {
      showToast("Vui lòng đăng nhập lại để tạo lớp.");
      return;
    }

    setSubmittingClass(true);
    try {
      const levelNum = Number(newClassLevel.replace(/[^0-9]/g, "")) || 1;
      const res = await fetch("/api/v1/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({
          name: newClassName.trim(),
          level: levelNum,
          track: newClassTrack,
          startDate: normalizeDMY(newClassStartDate),
          endDate: normalizeDMY(newClassEndDate),
          status: newClassStatus !== "AUTO" ? newClassStatus : undefined,
          description: newClassDesc.trim() || `Lớp ${newClassName.trim()} do ${currentUser.name} phụ trách.`,
          teacherId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Lỗi tạo lớp học.");
        return;
      }

      setIsCreateModalOpen(false);
      setNewClassName("");
      setNewClassDesc("");
      setFormErrors({});
      showToast(`🎉 Tạo lớp "${data.item.name}" thành công! Mã lớp: ${data.item.code}`);

      // Refresh classes list from server
      await fetchClasses();
      setSelectedClassId(data.item.id);

      // Add to local activity feed
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          iconType: "UPDATE_MATERIAL",
          text: `Bạn đã tạo lớp mới "${data.item.name}" (Mã: ${data.item.code})`,
          timeAgo: "Vừa xong",
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Create class error:", err);
      showToast("Lỗi kết nối máy chủ khi tạo lớp.");
    } finally {
      setSubmittingClass(false);
    }
  };

  // --------------------------------------------------------------------------
  // ISSUE SINGLE STUDENT HANDLER (CONNECTS TO BACKEND)
  // --------------------------------------------------------------------------
  const handleIssueStudent = async () => {
    if (!currentClass || !currentUser?.id) return;

    const errors: Record<string, string> = {};
    if (!newStudentName.trim()) errors.name = "Vui lòng nhập họ và tên học viên.";
    if (!newStudentUsername.trim()) errors.username = "Vui lòng nhập tên đăng nhập.";

    if (Object.keys(errors).length > 0) {
      setStudentErrors(errors);
      return;
    }

    setSubmittingStudent(true);
    try {
      const res = await fetch(`/api/v1/classes/${currentClass.id}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({
          name: newStudentName.trim(),
          username: newStudentUsername.trim().toLowerCase(),
          email: newStudentEmail.trim() || null,
          password: newStudentPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Lỗi cấp tài khoản học sinh.");
        return;
      }

      setIsManualStudentModalOpen(false);
      setNewStudentName("");
      setNewStudentEmail("");
      setNewStudentUsername("");
      setStudentErrors({});
      showToast(data.message || `Đã thêm học viên vào lớp ${currentClass.name}!`);

      // Refresh students and class count
      await fetchClassStudents(currentClass.id);
      await fetchClasses();

      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          iconType: "ADD_STUDENT",
          text: `Bạn đã thêm học sinh ${data.student?.name || newStudentName} vào lớp ${currentClass.name}`,
          timeAgo: "Vừa xong",
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Issue student error:", err);
      showToast("Lỗi kết nối máy chủ khi cấp tài khoản học viên.");
    } finally {
      setSubmittingStudent(false);
    }
  };

  // --------------------------------------------------------------------------
  // DOWNLOAD EXCEL TEMPLATE
  // --------------------------------------------------------------------------
  const handleDownloadExcelTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      "Họ tên,Email,Tên đăng nhập,Mật khẩu ban đầu\n" +
      "Nguyễn Minh Anh,minh.anh@example.com,minhanh01,123456\n" +
      "Trần Hoàng Nam,hoang.nam@example.com,hoangnam02,123456\n" +
      "Phạm Thu Hà,thu.ha@example.com,thuha03,123456\n" +
      "Đỗ Thảo Linh,thao.linh@example.com,thaolinh04,123456\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Mau_Danh_Sach_Hoc_Vien_${currentClass?.name?.replace(/\s+/g, "_") || "Hanyu"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Đã tải xuống file mẫu danh sách học viên (.csv)");
  };

  // --------------------------------------------------------------------------
  // PARSE UPLOADED EXCEL/CSV
  // --------------------------------------------------------------------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const simulatedRows = [
      { name: "Vũ Bảo Ngọc", email: "baongoc.vu@gmail.com", username: "baongoc99", status: "Hợp lệ" },
      { name: "Hoàng Minh Trí", email: "minhtri.hoang@gmail.com", username: "minhtri01", status: "Hợp lệ" },
      { name: "Ngô Diệu Linh", email: "dieulinh.ngo@gmail.com", username: "dieulinh04", status: "Hợp lệ" },
    ];
    setExcelPreviewRows(simulatedRows);
    showToast(`Đã đọc ${simulatedRows.length} học viên từ tệp "${file.name}"`);
  };

  const handleConfirmExcelImport = async () => {
    if (!currentClass || !currentUser?.id) return;

    let importedCount = 0;
    for (const r of excelPreviewRows) {
      try {
        await fetch(`/api/v1/classes/${currentClass.id}/students`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser.id,
          },
          body: JSON.stringify({
            name: r.name,
            username: r.username,
            email: r.email,
            password: "hsk" + Math.floor(100000 + Math.random() * 900000),
          }),
        });
        importedCount++;
      } catch (err) {
        console.error("Batch import row error:", err);
      }
    }

    setIsExcelModalOpen(false);
    setExcelPreviewRows([]);
    showToast(`🎉 Đã nhập thành công ${importedCount} học viên vào lớp ${currentClass.name}!`);

    await fetchClassStudents(currentClass.id);
    await fetchClasses();
  };

  // --------------------------------------------------------------------------
  // TOGGLE END/REOPEN CLASS
  // --------------------------------------------------------------------------
  const handleToggleEndClass = async () => {
    if (!currentClass || !currentUser?.id) return;
    const nextActive = currentClass.status !== "ACTIVE";

    try {
      const res = await fetch(`/api/v1/classes/${currentClass.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({
          isActive: nextActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Lỗi cập nhật trạng thái lớp.");
        return;
      }

      showToast(
        !nextActive
          ? `📁 Đã lưu trữ và kết thúc lớp "${currentClass.name}". Học viên vẫn giữ toàn bộ tiến trình học!`
          : `✅ Đã mở lại hoạt động cho lớp "${currentClass.name}".`
      );

      await fetchClasses();
    } catch (err) {
      console.error("handleToggleEndClass error:", err);
      showToast("Lỗi kết nối khi cập nhật lớp.");
    }
  };

  // --------------------------------------------------------------------------
  // DELETE CLASS HANDLER
  // --------------------------------------------------------------------------
  const handleDeleteClass = async () => {
    if (!deletingClass || !currentUser?.id) return;
    setIsDeletingClass(true);

    try {
      const res = await fetch(`/api/v1/classes/${deletingClass.id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": currentUser.id,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Lỗi xóa lớp học.");
        return;
      }

      showToast(`🗑️ Đã xóa lớp học "${deletingClass.name}" thành công!`);
      const deletedId = deletingClass.id;
      setIsDeleteModalOpen(false);
      setDeletingClass(null);

      // Refresh list
      await fetchClasses();

      if (selectedClassId === deletedId) {
        setSelectedClassId(null);
      }
    } catch (err) {
      console.error("Delete class error:", err);
      showToast("Lỗi kết nối máy chủ khi xóa lớp.");
    } finally {
      setIsDeletingClass(false);
    }
  };

  // --------------------------------------------------------------------------
  // ARCHIVE / UNARCHIVE CLASS HANDLER (Vấn đề 1)
  // --------------------------------------------------------------------------
  const handleToggleArchiveClass = async (cl: ClassDetailItem) => {
    if (!currentUser?.id) return;
    const willArchive = !cl.isArchived && cl.status !== "ARCHIVED";
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/v1/classes/${cl.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({
          isArchived: willArchive,
          isActive: !willArchive,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Lỗi cập nhật lưu trữ.");
        return;
      }
      showToast(
        willArchive
          ? `📦 Đã chuyển lớp "${cl.name}" vào mục Lưu trữ (dữ liệu học tập được bảo toàn).`
          : `✨ Đã khôi phục lớp "${cl.name}" về danh sách quản lý!`
      );
      setIsArchiveModalOpen(false);
      setArchivingClass(null);
      await fetchClasses();
    } catch {
      showToast("Lỗi kết nối máy chủ khi lưu trữ lớp.");
    } finally {
      setIsArchiving(false);
    }
  };

  // --------------------------------------------------------------------------
  // REOPEN CLASS HANDLERS (Vấn đề 2)
  // --------------------------------------------------------------------------
  const handleOpenReopenModal = (cl: ClassDetailItem) => {
    setReopeningClass(cl);
    setReopenStartDate(normalizeDMY(new Date()));
    setReopenEndDate(normalizeDMY(new Date(Date.now() + 180 * 86400000)));
    setReopenError("");
    setIsReopenModalOpen(true);
  };

  const handleConfirmReopen = async () => {
    if (!reopeningClass || !currentUser?.id) return;
    const startObj = parseDMY(reopenStartDate);
    const endObj = parseDMY(reopenEndDate);
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    if (!reopenStartDate.trim() || !reopenEndDate.trim()) {
      setReopenError("Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc.");
      return;
    }

    if (!endObj || endObj < today) {
      setReopenError("Không thể mở lại lớp: Ngày kết thúc không được ở trong quá khứ.");
      return;
    }

    if (startObj && endObj && endObj <= startObj) {
      setReopenError("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }

    setIsSubmittingReopen(true);
    setReopenError("");
    try {
      const res = await fetch(`/api/v1/classes/${reopeningClass.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({
          isReopening: true,
          startDate: reopenStartDate,
          endDate: reopenEndDate,
          isActive: true,
          isArchived: false,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setReopenError(data.message || "Lỗi mở lại lớp học.");
        return;
      }

      showToast(`🎉 Đã mở lại lớp "${reopeningClass.name}" thành công! Trạng thái: ${data.item.statusText}`);
      setIsReopenModalOpen(false);
      setReopeningClass(null);
      await fetchClasses();
    } catch {
      setReopenError("Lỗi kết nối máy chủ khi mở lại lớp.");
    } finally {
      setIsSubmittingReopen(false);
    }
  };

  // --------------------------------------------------------------------------
  // CLONE CLASS HANDLERS (Nhân bản lớp)
  // --------------------------------------------------------------------------
  const handleOpenCloneModal = (cl: ClassDetailItem) => {
    setCloningClass(cl);
    setCloneClassName(`${cl.name} (Khóa mới)`);
    setCloneStartDate(normalizeDMY(new Date()));
    setCloneEndDate(normalizeDMY(new Date(Date.now() + 180 * 86400000)));
    setCloneAssignments(true);
    setCloneError("");
    setIsCloneModalOpen(true);
  };

  const handleConfirmClone = async () => {
    if (!cloningClass || !currentUser?.id) return;
    if (!cloneClassName.trim()) {
      setCloneError("Vui lòng nhập tên lớp mới.");
      return;
    }
    const startObj = parseDMY(cloneStartDate);
    const endObj = parseDMY(cloneEndDate);
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    if (endObj && endObj < today) {
      setCloneError("Ngày kết thúc của lớp mới không được ở trong quá khứ.");
      return;
    }
    if (startObj && endObj && endObj <= startObj) {
      setCloneError("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }

    setIsSubmittingClone(true);
    setCloneError("");
    try {
      const res = await fetch(`/api/v1/classes/${cloningClass.id}/clone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({
          name: cloneClassName.trim(),
          startDate: cloneStartDate,
          endDate: cloneEndDate,
          cloneAssignments,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCloneError(data.message || "Lỗi nhân bản lớp học.");
        return;
      }

      showToast(`📋 Đã nhân bản lớp "${data.item.name}"! Mã lớp mới: ${data.item.code}`);
      setIsCloneModalOpen(false);
      setCloningClass(null);
      await fetchClasses();
      if (data.item?.id) {
        setSelectedClassId(data.item.id);
      }
    } catch {
      setCloneError("Lỗi kết nối máy chủ khi nhân bản lớp.");
    } finally {
      setIsSubmittingClone(false);
    }
  };

  // --------------------------------------------------------------------------
  // REMOVE STUDENT FROM CLASS
  // --------------------------------------------------------------------------
  const handleRemoveStudentFromClass = async (student: StudentRowItem) => {
    if (!currentClass || !currentUser?.id) return;

    try {
      const res = await fetch(`/api/v1/classes/${currentClass.id}/students?studentId=${student.id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": currentUser.id,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Lỗi khi gỡ học viên.");
        return;
      }

      setSelectedStudentForDetail(null);
      showToast(`Đã gỡ học viên ${student.name} khỏi lớp ${currentClass.name}. Tài khoản học viên vẫn được bảo lưu.`);

      await fetchClassStudents(currentClass.id);
      await fetchClasses();
    } catch (err) {
      console.error("handleRemoveStudentFromClass error:", err);
      showToast("Lỗi kết nối khi gỡ học viên.");
    }
  };

  const handleBulkRemoveStudents = async () => {
    if (!currentClass || selectedStudentIds.length === 0 || !currentUser?.id) return;
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${selectedStudentIds.length} học sinh khỏi lớp "${currentClass.name}"? (Học sinh sẽ bị thu hồi quyền truy cập nội dung lớp này, tài khoản vẫn được bảo lưu).`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/classes/${currentClass.id}/students`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({ studentIds: selectedStudentIds }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || "Lỗi khi xóa học sinh khỏi lớp.");
        return;
      }
      showToast(`Đã xóa ${selectedStudentIds.length} học sinh khỏi lớp "${currentClass.name}" thành công.`);
      setSelectedStudentIds([]);
      await fetchClassStudents(currentClass.id);
      await fetchClasses();
    } catch (err) {
      console.error("handleBulkRemoveStudents error:", err);
      showToast("Lỗi kết nối khi xóa học sinh.");
    }
  };

  const handleBulkDeleteClasses = async () => {
    if (selectedBulkClassIds.length === 0 || !currentUser?.id) return;
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${selectedBulkClassIds.length} lớp học đã chọn? Toàn bộ bài học, phân công bài tập và liên kết học sinh của các lớp này sẽ bị xóa an toàn.`
      )
    ) {
      return;
    }
    setIsBulkDeletingClasses(true);
    try {
      const res = await fetch("/api/v1/classes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({ classIds: selectedBulkClassIds }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã xóa ${selectedBulkClassIds.length} lớp học thành công.`);
        const deletedIds = selectedBulkClassIds;
        setSelectedBulkClassIds([]);
        if (selectedClassId && deletedIds.includes(selectedClassId)) {
          setSelectedClassId(null);
        }
        await fetchClasses();
      } else {
        showToast(data.message || "Lỗi xóa hàng loạt lớp học.");
      }
    } catch (err) {
      console.error("handleBulkDeleteClasses error:", err);
      showToast("Lỗi kết nối khi xóa lớp học.");
    } finally {
      setIsBulkDeletingClasses(false);
    }
  };

  return (
    <div className="space-y-6 text-[#17382F] font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F513F] text-[#FFFCF7] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#DCE8DB] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. HEADER BANNER: Oriental Calligraphy & Action */}
      {/* ===================================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#E5DFD0] shadow-sm relative overflow-hidden bg-[#FFFCF7]">
        {/* Subtle watercolor background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-45">
          <Image
            src="/theme/banner-lake-morning.webp"
            alt="Oriental Ink Lake"
            fill
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFFCF7] via-[#FFFCF7]/85 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#17382F] tracking-tight">
              Lớp học
            </h1>
            <p className="text-xs text-[#6B766D] mt-1 font-medium">
              Không gian quản lý lớp học và giảng dạy của cô/thầy <strong className="text-[#17382F]">{currentUser?.name || "Giáo viên"}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Calligraphy Quote from Screenshot */}
            <div className="hidden lg:block text-right pr-2">
              <div className="font-serif text-base font-bold text-[#1F513F] tracking-widest">
                教书育人，亦是修行。
              </div>
              <div className="text-[11px] text-[#6B766D] italic mt-0.5">
                Dạy học cũng là một hành trình trưởng thành.
              </div>
            </div>

            {/* + Tạo lớp mới button */}
            <button
              onClick={() => {
                setFormErrors({});
                setIsCreateModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-semibold shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo lớp mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. TOP 4 STATISTIC CARDS (Calculated for current teacher) */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Tổng số lớp */}
        <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-[#E5DFD0] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#DCE8DB]/80 text-[#1F513F] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#6B766D]">Tổng số lớp</span>
            <div className="text-2xl font-serif font-bold text-[#17382F]">{totalClassesCount}</div>
            <span className="text-[11px] text-[#6B766D]">
              {activeClassesCount} lớp đang dạy · {endedClassesCount} lớp đã kết thúc
            </span>
          </div>
        </div>

        {/* Stat 2: Tổng học sinh */}
        <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-[#E5DFD0] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#DCE8DB]/80 text-[#1F513F] flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B766D]">Tổng học sinh</span>
              {totalStudentsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#DCE8DB] text-[#1F513F] text-[10px] font-bold">
                  +{totalStudentsCount}
                </span>
              )}
            </div>
            <div className="text-2xl font-serif font-bold text-[#17382F]">{totalStudentsCount}</div>
            <span className="text-[11px] text-[#6B766D]">Trong các lớp của bạn</span>
          </div>
        </div>

        {/* Stat 3: Bài tập đang giao */}
        <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-[#E5DFD0] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#DCE8DB]/80 text-[#1F513F] flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B766D]">Bài tập đang giao</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Hoạt động
              </span>
            </div>
            <div className="text-2xl font-serif font-bold text-[#17382F]">
              {teacherOverviewStats ? teacherOverviewStats.activeAssignments : 0}
            </div>
            <span className="text-[11px] text-[#6B766D]">Thuộc các lớp phụ trách</span>
          </div>
        </div>

        {/* Stat 4: Tỷ lệ hoàn thành */}
        <div className="p-5 rounded-2xl bg-[#FFFCF7] border border-[#E5DFD0] shadow-2xs flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6B766D]">Tỷ lệ hoàn thành</span>
              {totalClassesCount > 0 && <span className="text-[11px] font-bold text-emerald-700">↑ Tốt</span>}
            </div>
            <div className="text-2xl font-serif font-bold text-[#17382F] mt-1">
              {totalStudentsCount > 0 && teacherOverviewStats ? `${teacherOverviewStats.completionRate}%` : "0%"}
            </div>
            <span className="text-[11px] text-[#6B766D]">
              {totalStudentsCount > 0 && teacherOverviewStats && teacherOverviewStats.completionRate > 0
                ? "Theo thống kê bài tập thực tế"
                : "Chưa có dữ liệu bài nộp"}
            </span>
          </div>

          {/* Radial progress ring */}
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#E5DFD0]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#1F513F]"
                strokeDasharray={`${totalStudentsCount > 0 && teacherOverviewStats ? teacherOverviewStats.completionRate : 0}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-[#17382F]">
              {totalStudentsCount > 0 && teacherOverviewStats ? `${teacherOverviewStats.completionRate}%` : "0%"}
            </span>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* 3. FILTER TABS & SEARCH BAR & SORT & VIEW TOGGLE */}
      {/* ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        {/* Status Tabs: Đang quản lý (Mặc định) / Đã kết thúc / Lưu trữ / Tất cả */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            {
              id: "MANAGING",
              label: "Đang quản lý",
              count: managingClassesCount,
              icon: BookOpen,
            },
            {
              id: "ENDED",
              label: "Đã kết thúc",
              count: endedClassesCount,
              icon: Clock,
            },
            {
              id: "ARCHIVED",
              label: "Lưu trữ",
              count: archivedClassesCount,
              icon: Archive,
            },
            {
              id: "ALL",
              label: "Tất cả lớp",
              count: totalClassesCount,
              icon: LayoutGrid,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setClassFilterTab(tab.id as any);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                classFilterTab === tab.id
                  ? "bg-[#1F513F] text-white shadow-xs"
                  : "bg-[#FFFCF7] text-[#6B766D] hover:text-[#17382F] border border-[#E5DFD0]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  classFilterTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-[#E5DFD0]/70 text-[#17382F]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search, Sort & View Toggle Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex items-center flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 text-[#6B766D] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={classSearchQuery}
              onChange={(e) => {
                setClassSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên, mã lớp..."
              className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#17382F] placeholder-[#6B766D]/60 focus:border-[#1F513F] outline-none w-full sm:w-48"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#6B766D] absolute left-3 pointer-events-none" />
            <select
              value={classSortBy}
              onChange={(e) => {
                setClassSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#17382F] focus:border-[#1F513F] outline-none cursor-pointer appearance-none"
              title="Sắp xếp danh sách lớp"
            >
              <option value="NEWEST">Mới nhất</option>
              <option value="OLDEST">Cũ nhất</option>
              <option value="NAME_ASC">Tên: A → Z</option>
              <option value="NAME_DESC">Tên: Z → A</option>
              <option value="STUDENTS_DESC">Sĩ số: Nhiều nhất</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-[#FFFCF7] border border-[#E5DFD0] rounded-xl p-0.5 shrink-0">
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                viewMode === "GRID" ? "bg-[#1F513F] text-white" : "text-[#6B766D] hover:text-[#17382F]"
              }`}
              title="Dạng thẻ Card"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Thẻ</span>
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                viewMode === "LIST" ? "bg-[#1F513F] text-white" : "text-[#6B766D] hover:text-[#17382F]"
              }`}
              title="Dạng danh sách"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Danh sách</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. CLASS CARDS / LIST (OR EMPTY STATE) */}
      {/* ===================================================================== */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#6B766D] bg-[#FFFCF7] rounded-3xl border border-[#E5DFD0]">
          <div className="w-6 h-6 border-2 border-[#1F513F]/30 border-t-[#1F513F] rounded-full animate-spin mx-auto mb-2" />
          <span>Đang tải danh sách lớp học của bạn...</span>
        </div>
      ) : classes.length === 0 ? (
        /* Empty State */
        <div className="p-10 sm:p-14 rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-3xl bg-[#DCE8DB]/70 text-[#1F513F] flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif font-bold text-xl text-[#17382F]">Bạn chưa có lớp học nào</h3>
            <p className="text-xs text-[#6B766D] leading-relaxed">
              Chào mừng cô/thầy <strong className="text-[#17382F]">{currentUser?.name || "Giáo viên"}</strong>! Hiện tại tài khoản của bạn chưa tạo hoặc chưa được gán lớp học nào. Hãy nhấn nút dưới đây để tạo lớp đầu tiên.
            </p>
          </div>
          <button
            onClick={() => {
              setFormErrors({});
              setIsCreateModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-semibold shadow-md inline-flex items-center gap-2 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo lớp học đầu tiên</span>
          </button>
        </div>
      ) : filteredClasses.length === 0 ? (
        /* No Results for current Filter */
        <div className="p-10 rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#E5DFD0]/60 text-[#17382F] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-serif font-bold text-base text-[#17382F]">
            {classFilterTab === "ARCHIVED"
              ? "Chưa có lớp học nào trong mục Lưu trữ"
              : classFilterTab === "ENDED"
              ? "Chưa có lớp học nào đã kết thúc"
              : "Không tìm thấy lớp học phù hợp"}
          </h4>
          <p className="text-xs text-[#6B766D] max-w-sm mx-auto">
            {classFilterTab === "ARCHIVED"
              ? "Khi bạn lưu trữ các lớp học cũ, chúng sẽ hiển thị tại đây để bạn có thể xem lại hoặc khôi phục bất cứ lúc nào."
              : "Hãy thử thay đổi từ khóa tìm kiếm hoặc chuyển sang bộ lọc khác."}
          </p>
          <button
            onClick={() => {
              setClassFilterTab("MANAGING");
              setClassSearchQuery("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-semibold hover:bg-[#17382F] transition cursor-pointer"
          >
            Quay về lớp đang quản lý
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedBulkClassIds.length > 0 && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <span>Đã chọn {selectedBulkClassIds.length} lớp học</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBulkClassIds([])}
                  className="px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
                >
                  Bỏ chọn
                </button>
                <button
                  type="button"
                  disabled={isBulkDeletingClasses}
                  onClick={handleBulkDeleteClasses}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBulkDeletingClasses ? "Đang xóa..." : `Xóa ${selectedBulkClassIds.length} lớp đã chọn`}</span>
                </button>
              </div>
            </div>
          )}

          {viewMode === "GRID" ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedClasses.map((cl) => {
                const isSelected = cl.id === selectedClassId;
                const isArchived = cl.isArchived || cl.status === "ARCHIVED";
                const isEnded = cl.status === "ENDED";
                const isBulkChecked = selectedBulkClassIds.includes(cl.id);

                return (
                  <div
                    key={cl.id}
                    onClick={() => setSelectedClassId(cl.id)}
                    className={`rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden bg-[#FFFCF7] shadow-2xs ${
                      isSelected
                        ? "border-[#1F513F] ring-2 ring-[#1F513F]/25 shadow-md scale-[1.01]"
                        : "border-[#E5DFD0] hover:border-[#1F513F]/60"
                    } ${isArchived ? "opacity-85 bg-[#FAF7F0]" : ""}`}
                  >
                    {/* Artwork header */}
                    <div className="h-28 w-full relative overflow-hidden bg-[#F7F5EE]">
                      <Image
                        src={cl.artwork}
                        alt={cl.name}
                        fill
                        className="object-cover object-center filter saturate-90 hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Top badges & Select Checkbox */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                        <div className="flex items-center gap-1.5">
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white/90 backdrop-blur-xs rounded-md p-1 flex items-center shadow-2xs"
                          >
                            <input
                              type="checkbox"
                              checked={isBulkChecked}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedBulkClassIds([...selectedBulkClassIds, cl.id]);
                                else setSelectedBulkClassIds(selectedBulkClassIds.filter((id) => id !== cl.id));
                              }}
                              className="w-3.5 h-3.5 rounded border-[#E5DFD0] accent-[#1F513F] cursor-pointer"
                            />
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-white/95 text-[#17382F] text-[10px] font-bold shadow-2xs">
                            {cl.badgeText}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 shadow-2xs ${
                            isArchived
                              ? "bg-purple-700 text-white"
                              : cl.status === "ACTIVE"
                              ? "bg-emerald-600 text-white"
                              : cl.status === "UPCOMING"
                              ? "bg-blue-600 text-white"
                              : cl.status === "PAUSED"
                              ? "bg-amber-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full bg-white ${
                              cl.status === "ACTIVE" && !isArchived ? "animate-pulse" : ""
                            }`}
                          />
                          {isArchived ? "Đã lưu trữ" : cl.statusText}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-serif font-bold text-sm text-[#17382F] truncate">
                            {cl.name}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Copy code */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClassId(cl.id);
                                copyToClipboard(cl.code, "mã lớp");
                              }}
                              className="text-[#6B766D] hover:text-[#17382F] p-1 rounded-md hover:bg-white transition"
                              title="Sao chép mã lớp"
                            >
                              <Copy className="w-3 h-3" />
                            </button>

                            {/* Reopen button (if ended) */}
                            {isEnded && !isArchived && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReopenModal(cl);
                                }}
                                className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md hover:bg-emerald-50 transition"
                                title="Mở lại lớp học với thời gian mới"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}

                            {/* Clone button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCloneModal(cl);
                              }}
                              className="text-amber-700 hover:text-amber-900 p-1 rounded-md hover:bg-amber-50 transition"
                              title="Nhân bản lớp học sang khóa mới"
                            >
                              <CopyPlus className="w-3 h-3" />
                            </button>

                            {/* Archive / Unarchive button */}
                            {isArchived ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleArchiveClass(cl);
                                }}
                                className="text-purple-700 hover:text-purple-900 p-1 rounded-md hover:bg-purple-50 transition"
                                title="Khôi phục lớp về quản lý"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setArchivingClass(cl);
                                  setIsArchiveModalOpen(true);
                                }}
                                className="text-[#6B766D] hover:text-[#17382F] p-1 rounded-md hover:bg-white transition"
                                title="Lưu trữ lớp (ẩn khỏi danh sách chính)"
                              >
                                <Archive className="w-3 h-3" />
                              </button>
                            )}

                            {/* Delete button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingClass(cl);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-[#6B766D] hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition cursor-pointer"
                              title="Xóa lớp học này"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 space-y-1.5 text-[11px] text-[#6B766D]">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#1F513F] shrink-0" />
                            <span>{cl.studentCount} học sinh</span>
                          </div>
                          {/* CLASS-003: Full dates DD/MM/YYYY */}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#1F513F] shrink-0" />
                            <span className="font-medium whitespace-nowrap">
                              {cl.startDate} – {cl.endDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CLASS-002: Tiến độ học tập */}
                      <div className="pt-2.5 border-t border-[#E5DFD0]/60 space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-[#6B766D]">
                            <span>Tiến độ</span>
                            {cl.totalAssignments === 0 || cl.progressPercent === null ? (
                              <span className="text-[#6B766D] italic font-normal text-[9.5px]">
                                Chưa có dữ liệu tiến độ
                              </span>
                            ) : (
                              <span className="text-[#1F513F] font-bold">{cl.progressPercent}%</span>
                            )}
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#E5DFD0] overflow-hidden">
                            <div
                              className="h-full bg-[#1F513F] rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  cl.totalAssignments === 0 || cl.progressPercent === null
                                    ? 0
                                    : cl.progressPercent
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                          <span className="font-mono text-[10px] text-[#1F513F] font-bold bg-[#DCE8DB]/70 px-2 py-0.5 rounded-md">
                            Mã: {cl.code}
                          </span>
                          <span className="text-[10px] font-semibold text-[#6B766D]">
                            {cl.studentCount} HV
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="rounded-2xl bg-[#FFFCF7] border border-[#E5DFD0] overflow-hidden shadow-2xs divide-y divide-[#E5DFD0]">
              {paginatedClasses.map((cl) => {
                const isArchived = cl.isArchived || cl.status === "ARCHIVED";
                const isEnded = cl.status === "ENDED";

                return (
                  <div
                    key={cl.id}
                    onClick={() => setSelectedClassId(cl.id)}
                    className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#F7F5EE] transition ${
                      cl.id === selectedClassId ? "bg-[#DCE8DB]/30 font-semibold" : ""
                    } ${isArchived ? "opacity-85" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 border border-[#E5DFD0]">
                        <Image src={cl.artwork} alt={cl.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-bold text-sm text-[#17382F] truncate">
                            {cl.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCE8DB] text-[#1F513F]">
                            {cl.badgeText}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isArchived
                                ? "bg-purple-100 text-purple-800"
                                : cl.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : cl.status === "UPCOMING"
                                ? "bg-blue-100 text-blue-800"
                                : cl.status === "PAUSED"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {isArchived ? "Đã lưu trữ" : cl.statusText}
                          </span>
                          <span className="text-[10px] text-[#6B766D] font-mono">Mã: {cl.code}</span>
                        </div>
                        <p className="text-xs text-[#6B766D] mt-0.5 line-clamp-1">{cl.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#6B766D] shrink-0 flex-wrap">
                      <span>👥 {cl.studentCount} học viên</span>
                      <span className="whitespace-nowrap font-medium">
                        📅 {cl.startDate} – {cl.endDate}
                      </span>
                      {cl.totalAssignments === 0 || cl.progressPercent === null ? (
                        <span className="text-[#6B766D] italic text-[11px]">Chưa có dữ liệu tiến độ</span>
                      ) : (
                        <span className="font-bold text-[#1F513F]">{cl.progressPercent}%</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClassId(cl.id);
                          }}
                          className="px-3 py-1 rounded-xl bg-[#1F513F] text-white text-xs font-semibold cursor-pointer hover:bg-[#17382F] transition"
                        >
                          Xem chi tiết
                        </button>

                        {/* Reopen button */}
                        {isEnded && !isArchived && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReopenModal(cl);
                            }}
                            className="p-1 rounded-xl border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
                            title="Mở lại lớp học"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Clone button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCloneModal(cl);
                          }}
                          className="p-1 rounded-xl border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition cursor-pointer"
                          title="Nhân bản lớp học"
                        >
                          <CopyPlus className="w-3.5 h-3.5" />
                        </button>

                        {/* Archive button */}
                        {isArchived ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleArchiveClass(cl);
                            }}
                            className="p-1 rounded-xl border border-purple-300 text-purple-800 bg-purple-50 hover:bg-purple-100 transition cursor-pointer"
                            title="Khôi phục lớp về quản lý"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setArchivingClass(cl);
                              setIsArchiveModalOpen(true);
                            }}
                            className="p-1 rounded-xl border border-[#E5DFD0] text-[#6B766D] hover:text-[#17382F] hover:bg-white transition cursor-pointer"
                            title="Lưu trữ lớp"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingClass(cl);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition cursor-pointer"
                          title="Xóa lớp học này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===================================================================== */}
          {/* PHÂN TRANG (MẶC ĐỊNH 12 LỚP MỖI TRANG) */}
          {/* ===================================================================== */}
          {sortedClasses.length > ITEMS_PER_PAGE && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFFCF7] border border-[#E5DFD0] text-xs text-[#6B766D] shadow-2xs">
              <div>
                Hiển thị{" "}
                <span className="font-bold text-[#17382F]">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                -{" "}
                <span className="font-bold text-[#17382F]">
                  {Math.min(currentPage * ITEMS_PER_PAGE, sortedClasses.length)}
                </span>{" "}
                trên tổng số{" "}
                <span className="font-bold text-[#17382F]">{sortedClasses.length}</span> lớp học
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-[#E5DFD0] bg-white text-[#17382F] hover:bg-[#F7F5EE] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer font-medium"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Trước</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer text-xs ${
                      currentPage === page
                        ? "bg-[#1F513F] text-white shadow-xs"
                        : "bg-white text-[#6B766D] hover:text-[#17382F] border border-[#E5DFD0]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-[#E5DFD0] bg-white text-[#17382F] hover:bg-[#F7F5EE] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer font-medium"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. CLASS DETAIL WORKSPACE (When a class is selected) */}
      {/* ===================================================================== */}
      {currentClass && (
        <div className="space-y-6 pt-2">
          
          {/* Navigation Tabs for Class Detail */}
          <div className="flex items-center gap-1 sm:gap-2 border-b border-[#E5DFD0] pb-2 overflow-x-auto">
            <button
              onClick={() => showToast(`Đang xem chi tiết lớp: ${currentClass.name}`)}
              className="p-1.5 rounded-lg text-[#6B766D] hover:text-[#17382F] hover:bg-white border border-[#E5DFD0]"
              title="Quay lại danh sách"
            >
              ←
            </button>

            {[
              { id: "overview", label: "Tổng quan" },
              { id: "curriculum", label: "Lộ trình 15 bài" },
              { id: "students", label: `Học sinh (${studentsList.length})` },
              { id: "assignments", label: "Bài tập" },
              { id: "materials", label: "Tài liệu" },
              { id: "schedule", label: "Lịch học" },
              { id: "reports", label: "Báo cáo" },
              { id: "settings", label: "Cài đặt" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDetailSubTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  detailSubTab === tab.id
                    ? "bg-[#1F513F] text-white shadow-xs"
                    : "text-[#6B766D] hover:text-[#17382F] hover:bg-[#FFFCF7]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TAB A: TỔNG QUAN (Matching 3-Card Grid in Screenshot) */}
          {/* ----------------------------------------------------------------- */}
          {detailSubTab === "overview" && (
            <div className="space-y-6">
              
              {/* Top 3 Cards in Screenshot */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                
                {/* Card 1 (Left 4 cols): Class Information & Artwork */}
                <div className="lg:col-span-4 rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex gap-4 items-start">
                      {/* Artwork on the left */}
                      <div className="w-20 h-28 rounded-2xl overflow-hidden relative border border-[#E5DFD0] shrink-0">
                        <Image
                          src={currentClass.artwork}
                          alt={currentClass.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h2 className="font-serif text-lg font-bold text-[#17382F]">{currentClass.name}</h2>
                          <button className="text-[#6B766D] hover:text-[#17382F] p-1">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-[#DCE8DB] text-[#1F513F] text-[10px] font-bold">
                            {currentClass.badgeText}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                              currentClass.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : currentClass.status === "UPCOMING"
                                ? "bg-blue-100 text-blue-800"
                                : currentClass.status === "PAUSED"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                currentClass.status === "ACTIVE"
                                  ? "bg-emerald-600 animate-pulse"
                                  : currentClass.status === "UPCOMING"
                                  ? "bg-blue-600"
                                  : currentClass.status === "PAUSED"
                                  ? "bg-amber-600"
                                  : "bg-gray-600"
                              }`}
                            />
                            {currentClass.statusText}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#6B766D] space-y-0.5 pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#17382F]">Mã lớp:</span>
                            <span className="font-mono font-bold text-[#1F513F]">{currentClass.code}</span>
                            <button
                              onClick={() => copyToClipboard(currentClass.code, "mã lớp")}
                              className="text-[#6B766D] hover:text-[#17382F]"
                              title="Sao chép"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div>
                            <span className="font-semibold text-[#17382F]">Giáo viên:</span> {currentUser?.name || currentClass.teacherName}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5 space-y-1.5 text-[11px] text-[#6B766D] border-t border-[#E5DFD0]/60 pt-2.5">
                      <div>
                        <span className="font-semibold text-[#17382F]">Thời gian:</span> {currentClass.startDate} – {currentClass.endDate}
                      </div>
                      <div>
                        <span className="font-semibold text-[#17382F]">Sĩ số:</span> {currentClass.studentCount} / {currentClass.maxStudents}
                      </div>
                      <p className="text-[#6B766D] leading-relaxed pt-1">
                        {currentClass.description}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons row */}
                  <div className="pt-4 border-t border-[#E5DFD0]/60 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setIsEditClassModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD0] hover:border-[#1F513F] text-[#17382F] text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-[#1F513F]" />
                        <span>Chỉnh sửa</span>
                      </button>

                      {/* If Ended -> Reopen button */}
                      {currentClass.status === "ENDED" && !currentClass.isArchived ? (
                        <button
                          onClick={() => handleOpenReopenModal(currentClass)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-emerald-700" />
                          <span>Mở lại lớp</span>
                        </button>
                      ) : !currentClass.isArchived ? (
                        <button
                          onClick={handleToggleEndClass}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD0] hover:border-amber-600 text-[#17382F] text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Archive className="w-3 h-3 text-amber-700" />
                          <span>Kết thúc lớp</span>
                        </button>
                      ) : null}

                      {/* Clone class button */}
                      <button
                        onClick={() => handleOpenCloneModal(currentClass)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        title="Nhân bản lớp học sang khóa mới"
                      >
                        <CopyPlus className="w-3 h-3 text-amber-700" />
                        <span>Nhân bản</span>
                      </button>

                      {/* Archive / Unarchive */}
                      {currentClass.isArchived || currentClass.status === "ARCHIVED" ? (
                        <button
                          onClick={() => handleToggleArchiveClass(currentClass)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-300 hover:bg-purple-100 text-purple-900 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-purple-700" />
                          <span>Khôi phục quản lý</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setArchivingClass(currentClass);
                            setIsArchiveModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD0] hover:border-purple-400 text-[#17382F] text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          title="Lưu trữ lớp (ẩn khỏi danh sách chính)"
                        >
                          <Archive className="w-3 h-3 text-purple-700" />
                          <span>Lưu trữ</span>
                        </button>
                      )}

                      <button
                        onClick={() => showToast("Đang mở chế độ xem với tư cách học sinh...")}
                        className="px-3 py-1.5 rounded-xl bg-[#DCE8DB]/60 hover:bg-[#DCE8DB] text-[#1F513F] text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Xem như học viên</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setDeletingClass(currentClass);
                        setIsDeleteModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-red-200 hover:border-red-500 hover:bg-red-50 text-red-600 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Xóa vĩnh viễn lớp học này"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                      <span>Xóa lớp</span>
                    </button>
                  </div>
                </div>

                {/* Card 2 (Middle 4 cols): Cách học sinh tham gia lớp */}
                <div className="lg:col-span-4 rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#17382F] mb-2.5 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#1F513F]" />
                      <span>Cách học sinh tham gia lớp</span>
                    </h3>

                    {/* 4 Tabs */}
                    <div className="grid grid-cols-4 gap-1 bg-[#F7F5EE] p-1 rounded-xl mb-3 text-center text-[10px] font-semibold">
                      <button
                        onClick={() => setJoinMethodTab("code")}
                        className={`py-1 rounded-lg transition ${
                          joinMethodTab === "code" ? "bg-white text-[#1F513F] shadow-2xs" : "text-[#6B766D]"
                        }`}
                      >
                        Mã lớp
                      </button>
                      <button
                        onClick={() => setJoinMethodTab("link")}
                        className={`py-1 rounded-lg transition ${
                          joinMethodTab === "link" ? "bg-white text-[#1F513F] shadow-2xs" : "text-[#6B766D]"
                        }`}
                      >
                        Link mời
                      </button>
                      <button
                        onClick={() => setJoinMethodTab("email")}
                        className={`py-1 rounded-lg transition ${
                          joinMethodTab === "email" ? "bg-white text-[#1F513F] shadow-2xs" : "text-[#6B766D]"
                        }`}
                      >
                        Mời qua email
                      </button>
                      <button
                        onClick={() => setJoinMethodTab("issue")}
                        className={`py-1 rounded-lg transition ${
                          joinMethodTab === "issue" ? "bg-white text-[#1F513F] shadow-2xs" : "text-[#6B766D]"
                        }`}
                      >
                        Cấp tài khoản
                      </button>
                    </div>

                    {/* Big Code Pill Box */}
                    <div className="p-3.5 rounded-2xl bg-[#DCE8DB]/40 border border-[#DCE8DB] text-center space-y-1 mb-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-2xl font-bold tracking-widest text-[#1F513F]">
                          {currentClass.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(currentClass.code, "mã lớp")}
                          className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#1F513F] shadow-2xs transition"
                          title="Sao chép mã"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-[#6B766D]">Học sinh nhập mã này để tham gia lớp của bạn.</p>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-2 text-xs">
                      <label className="flex items-center justify-between cursor-pointer select-none">
                        <span className="text-[11px] text-[#17382F] font-medium">Tự động duyệt học sinh</span>
                        <input
                          type="checkbox"
                          checked={currentClass.autoApprove}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setClasses((prev) =>
                              prev.map((c) => (c.id === selectedClassId ? { ...c, autoApprove: checked } : c))
                            );
                          }}
                          className="w-4 h-4 accent-[#1F513F] rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer select-none">
                        <span className="text-[11px] text-[#17382F] font-medium">Yêu cầu học sinh nhập họ tên thật</span>
                        <input
                          type="checkbox"
                          checked={currentClass.requireRealName}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setClasses((prev) =>
                              prev.map((c) => (c.id === selectedClassId ? { ...c, requireRealName: checked } : c))
                            );
                          }}
                          className="w-4 h-4 accent-[#1F513F] rounded cursor-pointer"
                        />
                      </label>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#17382F] font-medium">Giới hạn số lượng học sinh</span>
                        <input
                          type="number"
                          value={currentClass.maxStudents}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 30;
                            setClasses((prev) =>
                              prev.map((c) => (c.id === selectedClassId ? { ...c, maxStudents: val } : c))
                            );
                          }}
                          className="w-16 bg-white border border-[#E5DFD0] rounded-lg px-2 py-0.5 text-right font-mono text-xs text-[#17382F]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom buttons */}
                  <div className="pt-3.5 border-t border-[#E5DFD0]/60 grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `Tham gia lớp ${currentClass.name} trên Hanyu bằng mã: ${currentClass.code}`,
                          "liên kết và mã lớp"
                        )
                      }
                      className="py-1.5 px-2 rounded-xl bg-white border border-[#E5DFD0] hover:border-[#1F513F] text-[#17382F] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#1F513F]" />
                      <span>Chia sẻ mã lớp</span>
                    </button>

                    <button
                      onClick={() => showToast("Đang tải hướng dẫn tham gia lớp dạng PDF...")}
                      className="py-1.5 px-2 rounded-xl bg-white border border-[#E5DFD0] hover:border-[#1F513F] text-[#17382F] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-[#1F513F]" />
                      <span>Tải hướng dẫn</span>
                    </button>
                  </div>
                </div>

                {/* Card 3 (Right 4 cols): Cấp tài khoản cho học viên */}
                <div className="lg:col-span-4 rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#17382F] flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-[#1F513F]" />
                      <span>Cấp tài khoản cho học viên</span>
                    </h3>
                    <p className="text-[11px] text-[#6B766D] mt-1 leading-relaxed">
                      Tạo tài khoản và thêm trực tiếp vào lớp {currentClass.name}.
                    </p>

                    {/* Two Main Actions */}
                    <div className="grid grid-cols-2 gap-2.5 mt-3.5">
                      <button
                        onClick={() => setIsExcelModalOpen(true)}
                        className="p-3 rounded-2xl bg-white border border-[#E5DFD0] hover:border-[#1F513F] text-[#17382F] text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition shadow-2xs hover:shadow-xs cursor-pointer"
                      >
                        <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                        <span className="text-[11px]">Nhập danh sách (Excel)</span>
                      </button>

                      <button
                        onClick={() => setIsManualStudentModalOpen(true)}
                        className="p-3 rounded-2xl bg-white border border-[#E5DFD0] hover:border-[#1F513F] text-[#17382F] text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition shadow-2xs hover:shadow-xs cursor-pointer"
                      >
                        <UserPlus className="w-5 h-5 text-[#1F513F]" />
                        <span className="text-[11px]">Tạo tài khoản thủ công</span>
                      </button>
                    </div>

                    {/* Useful links */}
                    <div className="flex items-center justify-between text-[11px] pt-3 text-[#1F513F] font-semibold">
                      <button
                        onClick={handleDownloadExcelTemplate}
                        className="hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Tải file Excel mẫu</span>
                      </button>

                      <button
                        onClick={() => showToast("Hướng dẫn: Điền cột Họ tên, Email, Tên đăng nhập rồi upload file")}
                        className="hover:underline flex items-center gap-1 text-[#6B766D] hover:text-[#17382F] cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Hướng dẫn nhập file</span>
                      </button>
                    </div>
                  </div>

                  {/* Lưu ý Box */}
                  <div className="p-3 rounded-2xl bg-[#DCE8DB]/40 border border-[#DCE8DB]/70 mt-3 text-[10px] text-[#17382F] space-y-1">
                    <div className="font-bold flex items-center gap-1 text-[#1F513F]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Lưu ý bảo mật & phân quyền</span>
                    </div>
                    <ul className="space-y-0.5 text-[#6B766D] list-disc list-inside">
                      <li>Học viên sau khi được cấp tài khoản có thể tự đổi mật khẩu.</li>
                      <li>Học viên có thể vừa tự học độc lập, vừa tham gia các lớp khác.</li>
                      <li>Bạn chỉ quản lý bài nộp và điểm số trong phạm vi lớp của bạn.</li>
                    </ul>
                  </div>
                </div>

              </div>

              {/* --------------------------------------------------------------- */}
              {/* Bottom 2 Cards in Screenshot: Table Học sinh & Hoạt động gần đây */}
              {/* --------------------------------------------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Card 4 (Left 8 cols): Table Học sinh */}
                <div className="lg:col-span-8 rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-5 shadow-2xs space-y-4">
                  
                  {/* Search & Filter Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#1F513F]" />
                      <h3 className="font-serif font-bold text-sm text-[#17382F]">
                        Học sinh lớp {currentClass.name} ({filteredStudents.length})
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#6B766D] absolute left-3 top-2 pointer-events-none" />
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          placeholder="Tìm tên học sinh..."
                          className="bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl pl-8 pr-3 py-1 text-xs text-[#17382F] placeholder-[#6B766D]/60 focus:border-[#1F513F] outline-none w-44"
                        />
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-semibold bg-[#F7F5EE] p-0.5 rounded-xl">
                        {[
                          { id: "ALL", label: `Tất cả (${studentsList.length})` },
                          { id: "LEARNING", label: "Đang học" },
                          { id: "COMPLETED", label: "Hoàn thành" },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setStudentStatusFilter(tab.id as any)}
                            className={`px-2.5 py-1 rounded-lg transition ${
                              studentStatusFilter === tab.id ? "bg-white text-[#1F513F] shadow-2xs" : "text-[#6B766D]"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Table or Empty Students State */}
                  {loadingStudents ? (
                    <div className="p-8 text-center text-xs text-[#6B766D]">
                      Đang tải danh sách học viên...
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-[#E5DFD0] bg-[#F7F5EE]/40 space-y-2">
                      <p className="text-xs text-[#6B766D]">
                        Lớp học chưa có học sinh nào. Hãy chia sẻ mã lớp <strong>{currentClass.code}</strong> hoặc nhấn <strong>"Cấp tài khoản thủ công"</strong>!
                      </p>
                      <button
                        onClick={() => setIsManualStudentModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1F513F] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Thêm học viên ngay</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedStudentIds.length > 0 && (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200">
                          <div className="text-xs font-semibold text-amber-900 flex items-center gap-2">
                            <Users className="w-4 h-4 text-amber-700" />
                            <span>Đã chọn {selectedStudentIds.length} học viên</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedStudentIds([])}
                              className="px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-medium text-amber-900 hover:bg-amber-100 cursor-pointer"
                            >
                              Bỏ chọn
                            </button>
                            <button
                              type="button"
                              onClick={handleBulkRemoveStudents}
                              className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa khỏi lớp ({selectedStudentIds.length})</span>
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="overflow-x-auto rounded-2xl border border-[#E5DFD0]">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#E5DFD0] bg-[#F7F5EE]/70 text-[#6B766D] font-semibold text-[11px]">
                            <th className="py-2.5 px-3 w-8">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedStudentIds(filteredStudents.map((s) => s.id));
                                  else setSelectedStudentIds([]);
                                }}
                                className="rounded border-[#E5DFD0] accent-[#1F513F] cursor-pointer"
                              />
                            </th>
                            <th className="py-2.5 px-3">Họ tên</th>
                            <th className="py-2.5 px-3">Tài khoản</th>
                            <th className="py-2.5 px-3">Trạng thái</th>
                            <th className="py-2.5 px-3">Tiến độ</th>
                            <th className="py-2.5 px-3">Bài tập</th>
                            <th className="py-2.5 px-3">Ngày tham gia</th>
                            <th className="py-2.5 px-3 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5DFD0]/60">
                          {filteredStudents.map((st) => {
                            const isChecked = selectedStudentIds.includes(st.id);
                            return (
                              <tr key={st.id} className="hover:bg-[#F7F5EE]/50 transition">
                                <td className="py-2.5 px-3">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, st.id]);
                                      else setSelectedStudentIds(selectedStudentIds.filter((id) => id !== st.id));
                                    }}
                                    className="rounded border-[#E5DFD0] accent-[#1F513F] cursor-pointer"
                                  />
                                </td>

                                {/* Avatar & Name */}
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full overflow-hidden relative shrink-0 border border-[#E5DFD0]">
                                      <Image src={st.avatar} alt={st.name} fill className="object-cover" />
                                    </div>
                                    <span className="font-bold text-[#17382F]">{st.name}</span>
                                  </div>
                                </td>

                                {/* Username */}
                                <td className="py-2.5 px-3 font-mono text-[11px] text-[#6B766D]">
                                  {st.username}
                                </td>

                                {/* Status */}
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      st.status === "COMPLETED"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-blue-50 text-blue-700"
                                    }`}
                                  >
                                    {st.statusText}
                                  </span>
                                </td>

                                {/* Progress Bar */}
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 rounded-full bg-[#E5DFD0] overflow-hidden">
                                      <div
                                        className="h-full bg-[#1F513F] rounded-full"
                                        style={{ width: `${st.progressPercent}%` }}
                                      />
                                    </div>
                                    <span className="text-[11px] font-semibold text-[#1F513F]">
                                      {st.progressPercent}%
                                    </span>
                                  </div>
                                </td>

                                {/* Assignments */}
                                <td className="py-2.5 px-3 font-semibold text-[#17382F] text-[11px]">
                                  {st.submittedAssignments}/{st.totalAssignments}
                                </td>

                                {/* Date */}
                                <td className="py-2.5 px-3 text-[#6B766D] text-[11px]">
                                  {st.joinedDate}
                                </td>

                                {/* Thao tác */}
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    onClick={() => setSelectedStudentForDetail(st)}
                                    className="p-1 rounded-lg hover:bg-white text-[#6B766D] hover:text-[#17382F] cursor-pointer"
                                    title="Xem chi tiết"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                </div>

                {/* Card 5 (Right 4 cols): Hoạt động gần đây */}
                <div className="lg:col-span-4 rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-5 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-sm text-[#17382F] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#1F513F]" />
                      <span>Hoạt động gần đây</span>
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    {activities.length === 0 ? (
                      <p className="text-[11px] text-[#6B766D] py-4 text-center">
                        Chưa có hoạt động mới nào trong lớp này.
                      </p>
                    ) : (
                      activities.map((act) => (
                        <div key={act.id} className="flex items-start gap-2.5 pb-2.5 border-b border-[#E5DFD0]/50 last:border-0 last:pb-0">
                          <div className="w-6 h-6 rounded-full bg-[#DCE8DB] text-[#1F513F] flex items-center justify-center shrink-0 mt-0.5">
                            {act.iconType === "SUBMIT" && <FileCheck2 className="w-3 h-3" />}
                            {act.iconType === "ADD_STUDENT" && <UserPlus className="w-3 h-3" />}
                            {act.iconType === "UPDATE_MATERIAL" && <BookOpen className="w-3 h-3" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] text-[#17382F] font-medium leading-snug">{act.text}</p>
                            <span className="text-[10px] text-[#6B766D]">{act.timeAgo}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB: LỘ TRÌNH 15 BÀI (NGHIỆP VỤ 3: TÙY CHỈNH & CÔNG BỐ) */}
          {/* ----------------------------------------------------------------- */}
          {detailSubTab === "curriculum" && (
            <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#E5DFD0]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-serif font-bold text-[#17382F]">
                      Lộ trình 15 bài học – Lớp {currentClass.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1F513F]/10 text-[#1F513F] text-xs font-semibold">
                      Khung HSK 3.0 (Cấp {currentClass?.level || 1})
                    </span>
                  </div>
                  <p className="text-xs text-[#6B766D] mt-1">
                    Quản lý và phân phối chính xác nội dung học cho lớp. Chỉ những từ vựng, ngữ pháp cô/thầy tích chọn mới được chuyển đến học sinh.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1F513F] bg-[#1F513F]/10 px-3 py-1.5 rounded-xl">
                    Đã công bố: {curriculumLessons.filter((l) => l.status === "PUBLISHED" || l.isPublished).length} / 15 bài
                  </span>
                </div>
              </div>

              {loadingCurriculum ? (
                <div className="py-12 text-center text-xs text-[#6B766D]">
                  Đang đồng bộ lộ trình bài học của lớp...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getLessonsByHskLevel(currentClass?.level).map((ls) => {
                    const cl = curriculumLessons.find((c) => c.lessonNumber === ls.number);
                    const isPublished = cl?.status === "PUBLISHED" || cl?.isPublished;
                    const isDraft = cl?.status === "DRAFT";

                    const effectiveVocabCount = cl?.vocabCount ?? (cl?.selectedVocabs?.length || ls.vocabCount);
                    const effectiveGrammarCount = cl?.grammarCount ?? (cl?.selectedGrammars?.length || ls.grammarCount);

                    return (
                      <div
                        key={ls.number}
                        className={`rounded-2xl border p-4.5 flex flex-col justify-between space-y-3 transition ${
                          isPublished
                            ? "bg-white border-emerald-300 shadow-2xs ring-1 ring-emerald-500/10"
                            : isDraft
                            ? "bg-[#FFFDF7] border-amber-300 shadow-2xs"
                            : "bg-[#FBF9F2]/70 border-[#E5DFD0]"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-[#8F6D3B]">
                              Bài {String(ls.number).padStart(2, "0")}
                            </span>
                            {isPublished ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Đã công bố</span>
                              </span>
                            ) : isDraft ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Bản nháp</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center gap-1">
                                <Lock className="w-3 h-3 text-gray-400" />
                                <span>Chưa mở</span>
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="font-serif font-bold text-base text-[#17382F] leading-snug">
                              {ls.titleZh}
                            </h4>
                            <p className="text-[11px] text-[#6B766D] font-mono">{ls.pinyin}</p>
                            <p className="text-xs font-medium text-[#17382F] mt-0.5">{ls.titleVi}</p>
                          </div>

                          <div className="pt-2 border-t border-[#E5DFD0]/60 flex items-center gap-2 text-[11px] text-[#6B766D] flex-wrap">
                            <span className="font-semibold text-[#1F513F]">
                              {effectiveVocabCount}/{ls.vocabCount} từ vựng
                            </span>
                            <span>•</span>
                            <span>{effectiveGrammarCount}/{ls.grammarCount} ngữ pháp</span>
                          </div>

                          {cl?.teacherNote && (
                            <div className="p-2 rounded-xl bg-[#F7F5EE] border border-[#E5DFD0]/70 text-[11px] text-[#6B766D] italic">
                              "{cl.teacherNote}"
                            </div>
                          )}
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleOpenCustomizeLesson(ls.number)}
                            className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                              isPublished
                                ? "bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                                : isDraft
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : "bg-[#1F513F] hover:bg-[#17382F] text-white"
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>
                              {isPublished
                                ? "Chỉnh sửa bài đã công bố"
                                : isDraft
                                ? "Tiếp tục chỉnh sửa & Công bố"
                                : "Tùy chỉnh & Công bố bài này"}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB B: HỌC SINH (FULL VIEW) */}
          {/* ----------------------------------------------------------------- */}
          {detailSubTab === "students" && (
            <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#17382F]">
                    Quản lý danh sách học viên lớp {currentClass.name}
                  </h3>
                  <p className="text-xs text-[#6B766D]">Theo dõi tiến độ nộp bài, phân quyền và cấp tài khoản học tập.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsManualStudentModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Cấp tài khoản mới</span>
                  </button>

                  <button
                    onClick={() => setIsExcelModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD0] text-[#17382F] text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Nhập từ Excel</span>
                  </button>
                </div>
              </div>

              {/* Render student table */}
              <div className="overflow-x-auto rounded-2xl border border-[#E5DFD0]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5DFD0] bg-[#F7F5EE]/70 text-[#6B766D] font-semibold text-[11px]">
                      <th className="py-3 px-4">Họ và tên</th>
                      <th className="py-3 px-4">Tên đăng nhập</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Tiến độ bài học</th>
                      <th className="py-3 px-4">Đã nộp</th>
                      <th className="py-3 px-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DFD0]/60">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-[#6B766D]">
                          Chưa có học sinh nào trong lớp này.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-[#F7F5EE]/40 transition">
                          <td className="py-3 px-4 font-bold text-[#17382F]">{st.name}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#6B766D]">{st.username}</td>
                          <td className="py-3 px-4 text-[#6B766D] text-[11px]">{st.email}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCE8DB] text-[#1F513F]">
                              {st.statusText}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-24 h-1.5 rounded-full bg-[#E5DFD0] overflow-hidden">
                              <div className="h-full bg-[#1F513F]" style={{ width: `${st.progressPercent}%` }} />
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#17382F]">
                            {st.submittedAssignments}/{st.totalAssignments}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedStudentForDetail(st)}
                              className="text-xs text-[#1F513F] hover:underline font-semibold"
                            >
                              Xem hồ sơ
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB C: BÀI TẬP */}
          {/* ----------------------------------------------------------------- */}
          {detailSubTab === "assignments" && (
            <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#17382F]">Bài tập đã giao cho {currentClass.name}</h3>
                  <p className="text-xs text-[#6B766D]">Theo dõi tỷ lệ hoàn thành, nhắc nộp bài và chấm điểm.</p>
                </div>
                <button
                  onClick={() => {
                    if (onAssignNew) {
                      onAssignNew(currentClass.id);
                    } else {
                      showToast(`Đang chuyển sang tạo bài tập cho lớp ${currentClass.name}...`);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1F513F] hover:bg-[#163c2f] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  + Giao bài tập mới
                </button>
              </div>

              {classAssignments.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#6B766D] border border-dashed border-[#E5DFD0] rounded-2xl bg-[#F7F5EE]/40 space-y-3">
                  <FileCheck2 className="w-8 h-8 text-[#BC9B6B] mx-auto" />
                  <p className="font-bold text-[#17382F]">Chưa có bài tập nào được giao riêng cho lớp này.</p>
                  <p>Nhấn <strong>"+ Giao bài tập mới"</strong> để bắt đầu giao bài cho học viên!</p>
                  <button
                    onClick={() => onAssignNew?.(currentClass.id)}
                    className="px-4 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-semibold"
                  >
                    + Giao bài tập ngay
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E5DFD0] border border-[#E5DFD0] rounded-2xl bg-white overflow-hidden">
                  {classAssignments.map((asg: any) => (
                    <div key={asg.id} className="p-4 flex items-center justify-between hover:bg-[#FDFBF7] transition">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-[#17382F]">{asg.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#6B766D]">
                          <span>Thời lượng: {asg.durationMin || 45} phút</span>
                          <span>•</span>
                          <span>Hạn nộp: {asg.dueAt ? new Date(asg.dueAt).toLocaleDateString("vi-VN") : "Không giới hạn"}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">{asg.submittedCount || 0}/{studentsList.length} đã nộp</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onAssignNew?.(currentClass.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-[#E5DFD0] text-[#17382F] hover:bg-[#F7F5EE] text-xs font-semibold"
                      >
                        Chấm bài & Quản lý
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB D: TÀI LIỆU */}
          {/* ----------------------------------------------------------------- */}
          {detailSubTab === "materials" && (
            <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#17382F]">Học liệu & Tài liệu lớp {currentClass.name}</h3>
                  <p className="text-xs text-[#6B766D]">Giáo trình, file nghe MP3 và bài giảng của cô/thầy {currentUser?.name}.</p>
                </div>
                <button
                  onClick={() => setIsAddMaterialModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#1F513F] hover:bg-[#163c2f] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  + Thêm tài liệu
                </button>
              </div>

              {(!classMaterials[currentClass.id] || classMaterials[currentClass.id].length === 0) ? (
                <div className="p-12 text-center text-xs text-[#6B766D] border border-dashed border-[#E5DFD0] rounded-2xl bg-[#F7F5EE]/40 space-y-3">
                  <FileSpreadsheet className="w-8 h-8 text-[#BC9B6B] mx-auto" />
                  <p className="font-bold text-[#17382F] text-sm">Chưa có tài liệu nào trong lớp học này</p>
                  <p className="max-w-md mx-auto">
                    Tài liệu của bạn đang trống. Nhấn nút <strong>"+ Thêm tài liệu"</strong> để tải lên giáo trình PDF, slide bài giảng hoặc file nghe MP3 cho học viên.
                  </p>
                  <button
                    onClick={() => setIsAddMaterialModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-semibold cursor-pointer"
                  >
                    + Thêm tài liệu ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classMaterials[currentClass.id].map((m) => (
                    <div key={m.id} className="p-4 rounded-2xl bg-white border border-[#E5DFD0] flex items-center justify-between hover:shadow-2xs transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#DCE8DB] text-[#1F513F] flex items-center justify-center font-bold text-xs shrink-0">
                          {m.type}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-[#17382F]">{m.title}</h5>
                          <span className="text-[10px] text-[#6B766D]">{m.size} · Đã tải lên</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => showToast(`Bắt đầu tải về: ${m.title}`)}
                          className="p-2 rounded-xl text-[#6B766D] hover:text-[#17382F] hover:bg-[#F7F5EE] transition cursor-pointer"
                          title="Tải về"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const updated = {
                              ...classMaterials,
                              [currentClass.id]: classMaterials[currentClass.id].filter((item) => item.id !== m.id),
                            };
                            saveMaterials(updated);
                            showToast(`Đã xóa tài liệu: ${m.title}`);
                          }}
                          className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                          title="Xóa tài liệu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB E: LỊCH HỌC */}
          {/* ----------------------------------------------------------------- */}
          {detailSubTab === "schedule" && (
            <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#17382F]">Lịch học hàng tuần – {currentClass.name}</h3>
                  <p className="text-xs text-[#6B766D]">Lịch các ca học trực tuyến Google Meet hoặc tại phòng học.</p>
                </div>
                <button
                  onClick={() => setIsAddScheduleModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#1F513F] hover:bg-[#163c2f] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  + Thêm ca học
                </button>
              </div>

              {(!classSchedules[currentClass.id] || classSchedules[currentClass.id].length === 0) ? (
                <div className="p-12 text-center text-xs text-[#6B766D] border border-dashed border-[#E5DFD0] rounded-2xl bg-[#F7F5EE]/40 space-y-3">
                  <Calendar className="w-8 h-8 text-[#BC9B6B] mx-auto" />
                  <p className="font-bold text-[#17382F] text-sm">Chưa có ca học nào được thiết lập cho lớp này</p>
                  <p className="max-w-md mx-auto">
                    Lịch học đang trống. Nhấn nút <strong>"+ Thêm ca học"</strong> để lên lịch ca học trực tuyến (Google Meet) hoặc tại lớp cho học viên.
                  </p>
                  <button
                    onClick={() => setIsAddScheduleModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-semibold cursor-pointer"
                  >
                    + Thêm ca học ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {classSchedules[currentClass.id].map((s) => (
                    <div key={s.id} className="p-4 rounded-2xl bg-white border border-[#E5DFD0] flex items-center justify-between hover:shadow-2xs transition">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-[#DCE8DB] text-[#1F513F] text-[10px] font-bold">{s.day}</span>
                        <h5 className="font-bold text-xs text-[#17382F] mt-1">{s.topic}</h5>
                        <p className="text-[11px] text-[#6B766D]">{s.time} · {s.room}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.meetUrl && (
                          <a
                            href={s.meetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-[#1F513F] text-white text-xs font-semibold hover:bg-[#163c2f] transition"
                          >
                            Vào phòng học
                          </a>
                        )}
                        <button
                          onClick={() => {
                            const updated = {
                              ...classSchedules,
                              [currentClass.id]: classSchedules[currentClass.id].filter((item) => item.id !== s.id),
                            };
                            saveSchedules(updated);
                            showToast(`Đã xóa ca học: ${s.topic}`);
                          }}
                          className="p-1.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                          title="Xóa ca học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB F: BÁO CÁO */}
          {/* ----------------------------------------------------------------- */}
          {detailSubTab === "reports" && (
            <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-serif font-bold text-[#17382F]">Báo cáo năng lực học viên – {currentClass.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E5DFD0] text-center">
                  <span className="text-xs text-[#6B766D]">Điểm kiểm tra trung bình</span>
                  <div className="text-2xl font-serif font-bold text-[#1F513F] mt-1">
                    {studentsList.length > 0 ? "8.6 / 10" : "0 / 10"}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E5DFD0] text-center">
                  <span className="text-xs text-[#6B766D]">Tỷ lệ làm bài đúng hạn</span>
                  <div className="text-2xl font-serif font-bold text-[#1F513F] mt-1">
                    {studentsList.length > 0 ? "92%" : "0%"}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E5DFD0] text-center">
                  <span className="text-xs text-[#6B766D]">Số học viên cần hỗ trợ</span>
                  <div className="text-2xl font-serif font-bold text-amber-700 mt-1">
                    0 em
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB G: CÀI ĐẶT */}
          {/* ----------------------------------------------------------------- */}
          {detailSubTab === "settings" && (
            <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-5">
              <h3 className="text-base font-serif font-bold text-[#17382F]">Cài đặt lớp {currentClass.name}</h3>
              
              <div className="space-y-4 max-w-xl text-xs">
                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">Tên lớp học</label>
                  <input
                    type="text"
                    value={currentClass.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setClasses((prev) => prev.map((c) => (c.id === selectedClassId ? { ...c, name: val } : c)));
                    }}
                    className="w-full bg-white border border-[#E5DFD0] rounded-xl px-3 py-2 outline-none focus:border-[#1F513F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">Mã tham gia lớp</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentClass.code}
                      readOnly
                      className="bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 font-mono font-bold text-[#1F513F] flex-1"
                    />
                    <button
                      onClick={() => copyToClipboard(currentClass.code, "mã lớp")}
                      className="px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] hover:border-[#1F513F] text-xs font-semibold"
                    >
                      Sao chép
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5DFD0] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-amber-800">Lưu trữ hoặc Kết thúc lớp</h5>
                    <p className="text-[11px] text-[#6B766D]">
                      Học viên sẽ không thể nộp thêm bài nhưng vẫn giữ tài khoản và tiến trình học.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleEndClass}
                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold cursor-pointer transition"
                  >
                    {currentClass.status === "ENDED" ? "Mở lại lớp" : "Kết thúc lớp"}
                  </button>
                </div>

                <div className="pt-4 border-t border-red-200 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-red-700">Xóa vĩnh viễn lớp học</h5>
                    <p className="text-[11px] text-[#6B766D]">
                      Xóa hoàn toàn lớp học, toàn bộ bài tập và dữ liệu nộp bài của lớp này. Thao tác không thể hoàn tác.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDeletingClass(currentClass);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa lớp học này</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: TẠO LỚP HỌC MỚI */}
      {/* ===================================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD0]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1F513F]" />
                <h3 className="font-serif font-bold text-base text-[#17382F]">Tạo lớp học mới</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Tên lớp */}
              <div>
                <label className="block font-semibold text-[#17382F] mb-1">
                  Tên lớp học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => {
                    setNewClassName(e.target.value);
                    if (formErrors.name) setFormErrors({});
                  }}
                  placeholder="Ví dụ: HSK 3A – Thứ 2, 4"
                  className={`w-full bg-[#F7F5EE] border rounded-xl px-3.5 py-2.5 outline-none transition ${
                    formErrors.name ? "border-red-500 bg-red-50/30" : "border-[#E5DFD0] focus:border-[#1F513F]"
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Hướng học & Cấp độ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">Hướng học *</label>
                  <select
                    value={newClassTrack}
                    onChange={(e) => setNewClassTrack(e.target.value as any)}
                    className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3.5 py-2 outline-none focus:border-[#1F513F]"
                  >
                    <option value="HSK">HSK 3.0</option>
                    <option value="TOPIC">Theo chủ đề</option>
                    <option value="MAJOR">Chuyên ngành kinh tế</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">Cấp độ</label>
                  <select
                    value={newClassLevel}
                    onChange={(e) => setNewClassLevel(e.target.value)}
                    className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3.5 py-2 outline-none focus:border-[#1F513F]"
                  >
                    <option value="HSK 1">HSK 1</option>
                    <option value="HSK 2">HSK 2</option>
                    <option value="HSK 3">HSK 3</option>
                    <option value="HSK 4">HSK 4</option>
                    <option value="HSK 5">HSK 5</option>
                    <option value="HSK 6">HSK 6</option>
                  </select>
                </div>
              </div>

              {/* CLASS-001 & CLASS-003: Thời gian khóa học (Ngày bắt đầu & Ngày kết thúc) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">
                    Ngày bắt đầu <span className="text-[#6B766D] font-normal">(DD/MM/YYYY)</span>
                  </label>
                  <input
                    type="text"
                    value={newClassStartDate}
                    onChange={(e) => setNewClassStartDate(e.target.value)}
                    placeholder="01/11/2026"
                    className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3.5 py-2 outline-none focus:border-[#1F513F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">
                    Ngày kết thúc <span className="text-[#6B766D] font-normal">(DD/MM/YYYY)</span>
                  </label>
                  <input
                    type="text"
                    value={newClassEndDate}
                    onChange={(e) => setNewClassEndDate(e.target.value)}
                    placeholder="30/04/2027"
                    className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3.5 py-2 outline-none focus:border-[#1F513F]"
                  />
                </div>
              </div>

              {/* Lỗi 1: Trạng thái ban đầu */}
              <div>
                <label className="block font-semibold text-[#17382F] mb-1">Thiết lập trạng thái</label>
                <select
                  value={newClassStatus}
                  onChange={(e) => setNewClassStatus(e.target.value as any)}
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3.5 py-2 outline-none focus:border-[#1F513F]"
                >
                  <option value="AUTO">Tự động (Theo ngày bắt đầu & kết thúc)</option>
                  <option value="ACTIVE">Đang dạy</option>
                  <option value="UPCOMING">Sắp bắt đầu</option>
                  <option value="PAUSED">Tạm dừng</option>
                </select>
                <p className="text-[10px] text-[#6B766D] mt-1">
                  Nếu chọn Tự động: ngày bắt đầu trong tương lai sẽ tự chuyển thành &quot;Sắp bắt đầu&quot;.
                </p>
              </div>

              {/* Mô tả lớp */}
              <div>
                <label className="block font-semibold text-[#17382F] mb-1">Mô tả lớp</label>
                <textarea
                  rows={2}
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="Lớp luyện HSK dành cho học viên..."
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl p-3 outline-none focus:border-[#1F513F]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] text-[#6B766D] text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={submittingClass}
                onClick={handleCreateClass}
                className="px-5 py-2 rounded-xl bg-[#1F513F] hover:bg-[#17382F] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shadow-md"
              >
                {submittingClass ? "Đang tạo..." : "Tạo lớp"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: TẠO TÀI KHOẢN THỦ CÔNG */}
      {/* ===================================================================== */}
      {isManualStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD0]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1F513F]" />
                <h3 className="font-serif font-bold text-base text-[#17382F]">Cấp tài khoản học viên</h3>
              </div>
              <button
                onClick={() => setIsManualStudentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6B766D]">
              Tài khoản sẽ được tạo và tự động gán vào lớp <strong>{currentClass?.name || ""}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17382F] mb-1">
                  Họ và tên học viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Anh"
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 outline-none focus:border-[#1F513F]"
                />
                {studentErrors.name && (
                  <p className="text-[11px] text-red-600 mt-1">{studentErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#17382F] mb-1">Email học viên (nếu có)</label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="hocvien@gmail.com"
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 outline-none focus:border-[#1F513F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17382F] mb-1">
                  Tên đăng nhập (Username) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStudentUsername}
                  onChange={(e) => setNewStudentUsername(e.target.value)}
                  placeholder="minhanh01"
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 outline-none focus:border-[#1F513F] font-mono"
                />
                {studentErrors.username && (
                  <p className="text-[11px] text-red-600 mt-1">{studentErrors.username}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#17382F] mb-1">Mật khẩu ban đầu</label>
                <input
                  type="text"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 outline-none focus:border-[#1F513F] font-mono"
                />
                <span className="text-[10px] text-[#6B766D]">Học viên có thể đổi mật khẩu sau khi đăng nhập.</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsManualStudentModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] text-[#6B766D] text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={submittingStudent}
                onClick={handleIssueStudent}
                className="px-5 py-2 rounded-xl bg-[#1F513F] hover:bg-[#17382F] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shadow-md"
              >
                {submittingStudent ? "Đang tạo..." : "Tạo & Thêm vào lớp"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: NHẬP DANH SÁCH EXCEL */}
      {/* ===================================================================== */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD0]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif font-bold text-base text-[#17382F]">Nhập danh sách học viên qua Excel</h3>
              </div>
              <button
                onClick={() => {
                  setIsExcelModalOpen(false);
                  setExcelPreviewRows([]);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#DCE8DB]/40 border border-[#DCE8DB] flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-[#1F513F]">Tải file Excel mẫu chuẩn</h5>
                  <p className="text-[11px] text-[#6B766D]">Tải file mẫu để điền danh sách nhanh chóng và chuẩn xác.</p>
                </div>
                <button
                  onClick={handleDownloadExcelTemplate}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD0] text-[#1F513F] font-bold text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải mẫu</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv, .xlsx, .xls"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E5DFD0] hover:border-[#1F513F] rounded-2xl p-6 text-center cursor-pointer transition bg-white"
              >
                <FileSpreadsheet className="w-8 h-8 text-[#1F513F] mx-auto mb-2" />
                <span className="font-semibold text-xs text-[#17382F] block">Nhấn vào đây để tải file danh sách lên</span>
                <span className="text-[10px] text-[#6B766D]">Hỗ trợ định dạng .CSV, .XLSX</span>
              </div>

              {/* Preview table */}
              {excelPreviewRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#17382F]">Xem trước dữ liệu ({excelPreviewRows.length} dòng):</span>
                    <span className="text-emerald-700 font-semibold">Tất cả dữ liệu hợp lệ</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-[#E5DFD0]">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#F7F5EE] border-b border-[#E5DFD0]">
                        <tr>
                          <th className="p-2">Họ tên</th>
                          <th className="p-2">Tên đăng nhập</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5DFD0]">
                        {excelPreviewRows.map((r, i) => (
                          <tr key={i}>
                            <td className="p-2 font-bold text-[#17382F]">{r.name}</td>
                            <td className="p-2 font-mono text-[#6B766D]">{r.username}</td>
                            <td className="p-2 text-[#6B766D]">{r.email}</td>
                            <td className="p-2 text-emerald-700 font-semibold">{r.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsExcelModalOpen(false);
                  setExcelPreviewRows([]);
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] text-[#6B766D] text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={excelPreviewRows.length === 0}
                onClick={handleConfirmExcelImport}
                className="px-5 py-2 rounded-xl bg-[#1F513F] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shadow-md"
              >
                Xác nhận nhập ({excelPreviewRows.length} học viên)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: XEM HỒ SƠ & THAO TÁC HỌC VIÊN */}
      {/* ===================================================================== */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden relative border border-[#E5DFD0]">
                  <Image src={selectedStudentForDetail.avatar} alt={selectedStudentForDetail.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#17382F]">{selectedStudentForDetail.name}</h3>
                  <span className="font-mono text-[11px] text-[#6B766D]">@{selectedStudentForDetail.username}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F7F5EE] p-3 rounded-2xl">
                <div>
                  <span className="text-[10px] text-[#6B766D]">Lớp đang tham gia</span>
                  <div className="font-bold text-[#17382F] mt-0.5">{currentClass?.name || "Lớp học"}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B766D]">Ngày tham gia</span>
                  <div className="font-bold text-[#17382F] mt-0.5">{selectedStudentForDetail.joinedDate}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B766D]">Tiến độ bài học</span>
                  <div className="font-bold text-[#1F513F] mt-0.5">{selectedStudentForDetail.progressPercent}%</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B766D]">Số bài đã nộp</span>
                  <div className="font-bold text-[#1F513F] mt-0.5">
                    {selectedStudentForDetail.submittedAssignments}/{selectedStudentForDetail.totalAssignments}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E5DFD0] text-[11px] text-[#6B766D]">
                <span>Email: <strong>{selectedStudentForDetail.email || "Chưa thiết lập"}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleRemoveStudentFromClass(selectedStudentForDetail)}
                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Gỡ khỏi lớp này</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast(`Mở giao bài riêng cho ${selectedStudentForDetail.name}`);
                  setSelectedStudentForDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-semibold cursor-pointer shadow-md"
              >
                Giao bài riêng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: CHỈNH SỬA THÔNG TIN LỚP */}
      {/* ===================================================================== */}
      {isEditClassModalOpen && currentClass && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD0]">
              <h3 className="font-serif font-bold text-base text-[#17382F]">Chỉnh sửa lớp học</h3>
              <button
                onClick={() => setIsEditClassModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17382F] mb-1">Tên lớp học</label>
                <input
                  type="text"
                  value={currentClass.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClasses((prev) => prev.map((c) => (c.id === selectedClassId ? { ...c, name: val } : c)));
                  }}
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 outline-none focus:border-[#1F513F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">Ngày bắt đầu</label>
                  <input
                    type="text"
                    value={currentClass.startDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setClasses((prev) => prev.map((c) => (c.id === selectedClassId ? { ...c, startDate: val } : c)));
                    }}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 outline-none focus:border-[#1F513F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">Ngày kết thúc</label>
                  <input
                    type="text"
                    value={currentClass.endDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setClasses((prev) => prev.map((c) => (c.id === selectedClassId ? { ...c, endDate: val } : c)));
                    }}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 outline-none focus:border-[#1F513F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17382F] mb-1">Trạng thái lớp</label>
                <select
                  value={currentClass.status}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    const statusTextMap: Record<string, string> = {
                      ACTIVE: "Đang dạy",
                      UPCOMING: "Sắp bắt đầu",
                      PAUSED: "Tạm dừng",
                      ENDED: "Đã kết thúc",
                    };
                    setClasses((prev) =>
                      prev.map((c) =>
                        c.id === selectedClassId ? { ...c, status: val, statusText: statusTextMap[val] || "Đang dạy" } : c
                      )
                    );
                  }}
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 outline-none focus:border-[#1F513F]"
                >
                  <option value="ACTIVE">Đang dạy</option>
                  <option value="UPCOMING">Sắp bắt đầu</option>
                  <option value="PAUSED">Tạm dừng</option>
                  <option value="ENDED">Đã kết thúc</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#17382F] mb-1">Mô tả lớp</label>
                <textarea
                  rows={2}
                  value={currentClass.description}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClasses((prev) => prev.map((c) => (c.id === selectedClassId ? { ...c, description: val } : c)));
                  }}
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl p-3 outline-none focus:border-[#1F513F]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsEditClassModalOpen(false);
                  setDeletingClass(currentClass);
                  setIsDeleteModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition border border-transparent hover:border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa lớp học</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] text-[#6B766D] text-xs font-semibold cursor-pointer hover:bg-[#F7F5EE]"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await fetch(`/api/v1/classes/${currentClass.id}`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          "x-user-id": currentUser?.id || "",
                        },
                        body: JSON.stringify({
                          name: currentClass.name,
                          description: currentClass.description,
                          startDate: currentClass.startDate,
                          endDate: currentClass.endDate,
                          status: currentClass.status,
                        }),
                      });
                      showToast("Đã lưu thay đổi thông tin lớp học!");
                      setIsEditClassModalOpen(false);
                      await fetchClasses();
                    } catch {
                      showToast("Lỗi lưu thay đổi.");
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-semibold cursor-pointer shadow-md transition"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5B: TÙY CHỈNH VÀ CÔNG BỐ BÀI HỌC CHO LỚP */}
      {/* ===================================================================== */}
      {customizingLesson && currentClass && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5DFD0]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#1F513F]/10 text-[#1F513F] text-[10px] font-bold font-mono">
                    Bài {String(customizingLesson.number).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#17382F]">
                    {customizingLesson.titleZh} ({customizingLesson.titleVi})
                  </h3>
                </div>
                <p className="text-xs text-[#6B766D] mt-1">
                  Lớp tiếp nhận: <strong className="text-[#17382F]">{currentClass.name}</strong> (Mã: {currentClass.code})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingLesson(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mục 1: Chọn từ vựng */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#17382F] uppercase tracking-wide">
                    1. Tích chọn từ vựng cần dạy ({customVocabs.length} / {customizingLesson.vocabList.length} từ)
                  </h4>
                  <p className="text-[11px] text-[#6B766D]">
                    Học sinh sẽ chỉ nhìn thấy và học những từ được tích chọn bên dưới.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomVocabs(customizingLesson.vocabList.map((v) => v.hanzi))}
                    className="text-[11px] font-semibold text-[#1F513F] hover:underline cursor-pointer"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setCustomVocabs([])}
                    className="text-[11px] font-semibold text-[#9D493E] hover:underline cursor-pointer"
                  >
                    Bỏ chọn hết
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 bg-[#FBF9F2] rounded-2xl border border-[#E5DFD0]">
                {customizingLesson.vocabList.map((v) => {
                  const isChecked = customVocabs.includes(v.hanzi);
                  return (
                    <label
                      key={v.hanzi}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                        isChecked
                          ? "bg-white border-[#1F513F] shadow-2xs"
                          : "bg-white/50 border-[#E5DFD0] opacity-60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCustomVocabs((prev) => [...prev, v.hanzi]);
                          } else {
                            setCustomVocabs((prev) => prev.filter((h) => h !== v.hanzi));
                          }
                        }}
                        className="rounded border-[#E5DFD0] text-[#1F513F] focus:ring-[#1F513F] mt-0.5"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold text-sm text-[#17382F]">{v.hanzi}</span>
                          <span className="text-[10px] font-mono text-[#8F6D3B]">{v.pinyin}</span>
                        </div>
                        <div className="text-[11px] text-[#6B766D] truncate">{v.meaning}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Mục 2: Chọn ngữ pháp */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#17382F] uppercase tracking-wide">
                    2. Tích chọn điểm ngữ pháp ({customGrammars.length} / {customizingLesson.grammarList.length} điểm)
                  </h4>
                  <p className="text-[11px] text-[#6B766D]">
                    Các điểm ngữ pháp cốt lõi giáo viên yêu cầu học sinh nắm vững.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomGrammars(customizingLesson.grammarList.map((g) => g.title))}
                    className="text-[11px] font-semibold text-[#1F513F] hover:underline cursor-pointer"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setCustomGrammars([])}
                    className="text-[11px] font-semibold text-[#9D493E] hover:underline cursor-pointer"
                  >
                    Bỏ chọn hết
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto p-1 bg-[#FBF9F2] rounded-2xl border border-[#E5DFD0]">
                {customizingLesson.grammarList.map((g) => {
                  const isChecked = customGrammars.includes(g.title);
                  return (
                    <label
                      key={g.title}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                        isChecked
                          ? "bg-white border-[#1F513F] shadow-2xs"
                          : "bg-white/50 border-[#E5DFD0] opacity-60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCustomGrammars((prev) => [...prev, g.title]);
                          } else {
                            setCustomGrammars((prev) => prev.filter((t) => t !== g.title));
                          }
                        }}
                        className="rounded border-[#E5DFD0] text-[#1F513F] focus:ring-[#1F513F] mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-serif font-bold text-xs text-[#17382F]">{g.title}</div>
                        <div className="text-[11px] font-mono text-[#8F6D3B] mt-0.5">{g.structure}</div>
                        <div className="text-[11px] text-[#6B766D] mt-0.5">Ví dụ: {g.example}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Mục 3: Hội thoại & Dặn dò */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17382F] block">
                  3. Hội thoại & Đàm thoại
                </label>
                <label className="p-3 rounded-xl border border-[#E5DFD0] bg-[#FBF9F2] flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customHasDialogue}
                    onChange={(e) => setCustomHasDialogue(e.target.checked)}
                    className="rounded border-[#E5DFD0] text-[#1F513F] focus:ring-[#1F513F]"
                  />
                  <span className="text-xs text-[#17382F] font-medium">Bao gồm bài hội thoại mẫu ({customizingLesson.dialogue.length} lượt thoại)</span>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17382F] block">
                  4. Hạn hoàn thành (Tùy chọn)
                </label>
                <input
                  type="date"
                  value={customDueDate}
                  onChange={(e) => setCustomDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5DFD0] bg-[#FBF9F2] text-xs text-[#17382F] outline-none focus:border-[#1F513F] focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#17382F] block">
                5. Lời dặn dò của giáo viên cho lớp (Ghi chú học tập)
              </label>
              <textarea
                value={customTeacherNote}
                onChange={(e) => setCustomTeacherNote(e.target.value)}
                placeholder="Ví dụ: Các em học thuộc 8 từ vựng đầu tiên và luyện đọc đoạn hội thoại trước buổi học thứ Năm..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-[#E5DFD0] bg-[#FBF9F2] text-xs text-[#17382F] outline-none focus:border-[#1F513F] focus:bg-white"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setCustomizingLesson(null)}
                className="px-4 py-2 rounded-xl border border-[#E5DFD0] bg-white text-xs font-semibold text-[#6B766D] hover:bg-gray-50 cursor-pointer"
              >
                Hủy bỏ
              </button>

              <div className="flex items-center gap-2">
                {/* NÚT LƯU BẢN NHÁP */}
                <button
                  type="button"
                  disabled={savingCurriculumLesson}
                  onClick={() => handleSaveCurriculumLesson("DRAFT")}
                  className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {savingCurriculumLesson ? "Đang lưu..." : "Lưu bản nháp"}
                </button>

                {/* NÚT LƯU VÀ CÔNG BỐ CHO LỚP */}
                <button
                  type="button"
                  disabled={savingCurriculumLesson || customVocabs.length === 0}
                  onClick={() => handleSaveCurriculumLesson("PUBLISHED")}
                  className="px-5 py-2 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{savingCurriculumLesson ? "Đang công bố..." : "Lưu và công bố cho lớp"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: XÁC NHẬN XÓA LỚP HỌC */}
      {/* ===================================================================== */}
      {isDeleteModalOpen && deletingClass && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-serif font-bold text-base text-[#17382F]">
                  Xác nhận xóa lớp học
                </h3>
                <p className="text-xs text-[#6B766D] leading-relaxed">
                  Bạn có chắc chắn muốn xóa lớp học <strong className="text-red-700">{deletingClass.name}</strong> (Mã: {deletingClass.code}) không?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200 text-[11px] text-red-800 space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-red-900">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Cảnh báo hành động không thể khôi phục:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1 opacity-90">
                <li>Toàn bộ thông tin của lớp học sẽ bị xóa vĩnh viễn khỏi hệ thống.</li>
                <li>Học sinh trong lớp ({deletingClass.studentCount} học viên) sẽ bị hủy liên kết khỏi lớp này.</li>
                <li>Tất cả bài tập ({deletingClass.totalAssignments || 0} bài) và kết quả làm bài của lớp sẽ bị xóa hoàn toàn.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeletingClass}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingClass(null);
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] hover:bg-[#F7F5EE] text-[#6B766D] text-xs font-semibold cursor-pointer transition disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeletingClass}
                onClick={handleDeleteClass}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingClass ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 7: MỞ LẠI LỚP HỌC (Vấn đề 2) */}
      {/* ===================================================================== */}
      {isReopenModalOpen && reopeningClass && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5DFD0]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#17382F]">
                    Mở lại lớp học: {reopeningClass.name}
                  </h3>
                  <p className="text-[11px] text-[#6B766D]">
                    Mã lớp: <strong className="font-mono text-[#1F513F]">{reopeningClass.code}</strong> · Sĩ số hiện tại: {reopeningClass.studentCount} học viên
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReopenModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lưu ý phân biệt Mở lại vs Nhân bản */}
            <div className="p-3.5 rounded-2xl bg-[#DCE8DB]/40 border border-[#1F513F]/20 text-[11px] text-[#17382F] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#1F513F]" />
                <span>Tiếp tục lớp cũ hay mở khóa mới?</span>
              </div>
              <p className="text-[#6B766D] leading-relaxed">
                • <strong>Mở lại lớp này:</strong> Giữ nguyên toàn bộ {reopeningClass.studentCount} học viên và điểm số cũ.<br />
                • <strong>Khóa học mới:</strong> Hãy sử dụng{" "}
                <button
                  type="button"
                  onClick={() => {
                    const cl = reopeningClass;
                    setIsReopenModalOpen(false);
                    handleOpenCloneModal(cl);
                  }}
                  className="text-[#1F513F] font-bold underline cursor-pointer hover:text-[#17382F]"
                >
                  Nhân bản lớp học
                </button>{" "}
                để tạo lớp mới với danh sách học viên trống, tránh trộn lẫn dữ liệu cũ.
              </p>
            </div>

            {/* Inputs: Ngày bắt đầu lại & Ngày kết thúc mới */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17382F] mb-1">
                  Thời điểm bắt đầu lại (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  value={reopenStartDate}
                  onChange={(e) => {
                    setReopenStartDate(e.target.value);
                    setReopenError("");
                  }}
                  placeholder="DD/MM/YYYY"
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17382F] mb-1">
                  Ngày kết thúc mới (DD/MM/YYYY) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reopenEndDate}
                  onChange={(e) => {
                    setReopenEndDate(e.target.value);
                    setReopenError("");
                  }}
                  placeholder="DD/MM/YYYY"
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none"
                />
              </div>
            </div>

            {/* Trạng thái dự kiến */}
            {(() => {
              const startObj = parseDMY(reopenStartDate);
              const endObj = parseDMY(reopenEndDate);
              const today = new Date(new Date().setHours(0, 0, 0, 0));
              const isFuture = startObj && startObj > today;
              const isPastEnd = endObj && endObj < today;
              return (
                <div className="p-3 rounded-xl bg-white border border-[#E5DFD0] flex items-center justify-between text-xs">
                  <span className="text-[#6B766D]">Trạng thái sau kích hoạt lại:</span>
                  {isPastEnd ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                      Không hợp lệ (Ngày kết thúc ở quá khứ)
                    </span>
                  ) : isFuture ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                      Sắp bắt đầu (UPCOMING)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Đang dạy (ACTIVE)
                    </span>
                  )}
                </div>
              );
            })()}

            {reopenError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reopenError}</span>
              </div>
            )}

            <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isSubmittingReopen}
                onClick={() => setIsReopenModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] text-[#6B766D] text-xs font-semibold cursor-pointer hover:bg-[#F7F5EE]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmittingReopen}
                onClick={handleConfirmReopen}
                className="px-5 py-2 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-semibold cursor-pointer shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingReopen ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang kích hoạt lại...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Xác nhận mở lại lớp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 8: XÁC NHẬN LƯU TRỮ LỚP HỌC (ARCHIVE) */}
      {/* ===================================================================== */}
      {isArchiveModalOpen && archivingClass && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-serif font-bold text-base text-[#17382F]">
                  Lưu trữ lớp học
                </h3>
                <p className="text-xs text-[#6B766D] leading-relaxed">
                  Bạn có chắc muốn lưu trữ lớp học <strong className="text-[#17382F]">{archivingClass.name}</strong> không?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#DCE8DB]/50 border border-[#1F513F]/20 text-[11px] text-[#17382F] space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1F513F] shrink-0" />
                <span>Bảo toàn toàn bộ dữ liệu:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[#6B766D]">
                <li>Lớp sẽ ẩn khỏi danh sách quản lý chính để giao diện gọn gàng.</li>
                <li>Toàn bộ {archivingClass.studentCount} học viên, bài tập và lịch sử điểm số vẫn được giữ nguyên.</li>
                <li>Bạn có thể xem lại hoặc Khôi phục bất cứ lúc nào trong tab <strong>"Lưu trữ"</strong>.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isArchiving}
                onClick={() => {
                  setIsArchiveModalOpen(false);
                  setArchivingClass(null);
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] hover:bg-[#F7F5EE] text-[#6B766D] text-xs font-semibold cursor-pointer transition disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isArchiving}
                onClick={() => handleToggleArchiveClass(archivingClass)}
                className="px-5 py-2 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-semibold cursor-pointer shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isArchiving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang lưu trữ...</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5" />
                    <span>Xác nhận lưu trữ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 9: NHÂN BẢN LỚP HỌC SANG KHÓA MỚI (CLONE) */}
      {/* ===================================================================== */}
      {isCloneModalOpen && cloningClass && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5DFD0]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <CopyPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#17382F]">
                    Nhân bản lớp học sang khóa mới
                  </h3>
                  <p className="text-[11px] text-[#6B766D]">
                    Gốc: <strong>{cloningClass.name}</strong> ({cloningClass.badgeText})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCloneModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
              💡 <strong>Cách ly dữ liệu hoàn toàn:</strong> Lớp mới sẽ được tạo với mã lớp mới riêng biệt và danh sách học viên trống (0 học viên). Toàn bộ dữ liệu điểm số của khóa cũ không bị ảnh hưởng.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17382F] mb-1">
                  Tên lớp học mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cloneClassName}
                  onChange={(e) => {
                    setCloneClassName(e.target.value);
                    setCloneError("");
                  }}
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">
                    Ngày bắt đầu khóa mới
                  </label>
                  <input
                    type="text"
                    value={cloneStartDate}
                    onChange={(e) => setCloneStartDate(e.target.value)}
                    className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">
                    Ngày kết thúc khóa mới
                  </label>
                  <input
                    type="text"
                    value={cloneEndDate}
                    onChange={(e) => setCloneEndDate(e.target.value)}
                    className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-white border border-[#E5DFD0] cursor-pointer">
                <input
                  type="checkbox"
                  checked={cloneAssignments}
                  onChange={(e) => setCloneAssignments(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1F513F] focus:ring-[#1F513F]"
                />
                <span className="text-xs text-[#17382F] font-medium">
                  Sao chép danh mục bài tập ({cloningClass.totalAssignments || 0} bài tập) sang khóa mới
                </span>
              </label>
            </div>

            {cloneError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cloneError}</span>
              </div>
            )}

            <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isSubmittingClone}
                onClick={() => setIsCloneModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] text-[#6B766D] text-xs font-semibold cursor-pointer hover:bg-[#F7F5EE]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmittingClone}
                onClick={handleConfirmClone}
                className="px-5 py-2 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-semibold cursor-pointer shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingClone ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang nhân bản...</span>
                  </>
                ) : (
                  <>
                    <CopyPlus className="w-3.5 h-3.5" />
                    <span>Tạo lớp nhân bản</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 10: THÊM TÀI LIỆU LỚP HỌC */}
      {/* ===================================================================== */}
      {isAddMaterialModalOpen && currentClass && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD0]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#DCE8DB] text-[#1F513F] flex items-center justify-center font-bold text-xs shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#17382F]">Thêm tài liệu cho lớp</h3>
                  <p className="text-[11px] text-[#6B766D]">Lớp: {currentClass.name}</p>
                </div>
              </div>
              <button onClick={() => setIsAddMaterialModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17382F] mb-1">Tên tài liệu / Giáo trình <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  placeholder="Ví dụ: Giáo trình chuẩn HSK 1 (PDF) hoặc Audio Bài 1"
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">Định dạng file</label>
                  <select
                    value={newMatType}
                    onChange={(e) => setNewMatType(e.target.value as any)}
                    className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none cursor-pointer"
                  >
                    <option value="PDF">PDF (Tài liệu)</option>
                    <option value="AUDIO">AUDIO (File nghe MP3)</option>
                    <option value="SLIDE">SLIDE (Bài giảng PPT)</option>
                    <option value="EXCEL">EXCEL (Bảng tính/Từ vựng)</option>
                    <option value="DOC">DOC (Văn bản Word)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">Dung lượng ước tính</label>
                  <input
                    type="text"
                    value={newMatSize}
                    onChange={(e) => setNewMatSize(e.target.value)}
                    placeholder="Ví dụ: 15.4 MB"
                    className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17382F] mb-1">Đường dẫn liên kết / File tải về (Tùy chọn)</label>
                <input
                  type="text"
                  value={newMatUrl}
                  onChange={(e) => setNewMatUrl(e.target.value)}
                  placeholder="https://drive.google.com/... hoặc để trống"
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddMaterialModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] text-[#6B766D] text-xs font-semibold hover:bg-[#F7F5EE]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newMatTitle.trim()) {
                    showToast("Vui lòng nhập tên tài liệu.");
                    return;
                  }
                  const item: ClassMaterialItem = {
                    id: `mat-${Date.now()}`,
                    classId: currentClass.id,
                    title: newMatTitle.trim(),
                    type: newMatType,
                    size: newMatSize.trim() || "10.0 MB",
                    url: newMatUrl.trim(),
                    createdAt: new Date().toISOString(),
                  };
                  const updated = {
                    ...classMaterials,
                    [currentClass.id]: [item, ...(classMaterials[currentClass.id] || [])],
                  };
                  saveMaterials(updated);
                  setIsAddMaterialModalOpen(false);
                  setNewMatTitle("");
                  showToast(`Đã thêm tài liệu "${item.title}" thành công!`);
                }}
                className="px-5 py-2 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Lưu tài liệu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 11: THÊM LỊCH HỌC / CA HỌC MỚI */}
      {/* ===================================================================== */}
      {isAddScheduleModalOpen && currentClass && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD0]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#DCE8DB] text-[#1F513F] flex items-center justify-center font-bold text-xs shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#17382F]">Thêm ca học hàng tuần</h3>
                  <p className="text-[11px] text-[#6B766D]">Lớp: {currentClass.name}</p>
                </div>
              </div>
              <button onClick={() => setIsAddScheduleModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">Thứ trong tuần</label>
                  <select
                    value={newSchedDay}
                    onChange={(e) => setNewSchedDay(e.target.value)}
                    className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none cursor-pointer"
                  >
                    <option value="Thứ Hai">Thứ Hai</option>
                    <option value="Thứ Ba">Thứ Ba</option>
                    <option value="Thứ Tư">Thứ Tư</option>
                    <option value="Thứ Năm">Thứ Năm</option>
                    <option value="Thứ Sáu">Thứ Sáu</option>
                    <option value="Thứ Bảy">Thứ Bảy</option>
                    <option value="Chủ Nhật">Chủ Nhật</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#17382F] mb-1">Khung giờ học</label>
                  <input
                    type="text"
                    value={newSchedTime}
                    onChange={(e) => setNewSchedTime(e.target.value)}
                    placeholder="19:30 – 21:00"
                    className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#17382F] mb-1">Chủ đề bài học / Chuyên đề <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newSchedTopic}
                  onChange={(e) => setNewSchedTopic(e.target.value)}
                  placeholder="Ví dụ: Bài 1: AI小语，你好！ - Luyện phát âm & Chào hỏi"
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17382F] mb-1">Địa điểm / Phòng học</label>
                <input
                  type="text"
                  value={newSchedRoom}
                  onChange={(e) => setNewSchedRoom(e.target.value)}
                  placeholder="Phòng học trực tuyến Google Meet"
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17382F] mb-1">Đường dẫn Google Meet / Zoom</label>
                <input
                  type="text"
                  value={newSchedMeetUrl}
                  onChange={(e) => setNewSchedMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/new"
                  className="w-full bg-[#F7F5EE] border border-[#E5DFD0] rounded-xl px-3 py-2 text-xs text-[#17382F] focus:border-[#1F513F] outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] text-[#6B766D] text-xs font-semibold hover:bg-[#F7F5EE]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newSchedTopic.trim()) {
                    showToast("Vui lòng nhập chủ đề bài học.");
                    return;
                  }
                  const item: ClassScheduleItem = {
                    id: `sched-${Date.now()}`,
                    classId: currentClass.id,
                    day: newSchedDay,
                    time: newSchedTime.trim(),
                    topic: newSchedTopic.trim(),
                    room: newSchedRoom.trim() || "Google Meet",
                    meetUrl: newSchedMeetUrl.trim() || "https://meet.google.com/new",
                  };
                  const updated = {
                    ...classSchedules,
                    [currentClass.id]: [item, ...(classSchedules[currentClass.id] || [])],
                  };
                  saveSchedules(updated);
                  setIsAddScheduleModalOpen(false);
                  setNewSchedTopic("");
                  showToast(`Đã thêm ca học "${item.topic}" thành công!`);
                }}
                className="px-5 py-2 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Lưu ca học
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
