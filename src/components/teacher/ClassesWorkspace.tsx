"use client";

import ClassDiagnosticsModal from "./ClassDiagnosticsModal";

import TeachingMaterialsWorkspace from "@/components/learning/TeachingMaterialsWorkspace";
import AppleScheduleCalendar from "./AppleScheduleCalendar";
import ClassReportWorkspace from "./ClassReportWorkspace";
import ClassSettingsForm from "./classes/ClassSettingsForm";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { getClassArtwork, normalizeDMY } from "@/lib/class-helper";
import { useCurriculumLessons } from "@/lib/use-curriculum";
import { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";

import { ClassDetailItem, StudentRowItem } from "./classes/types";
import ClassesList from "./classes/ClassesList";
import ClassHeader from "./classes/ClassHeader";
import OverviewTab from "./classes/tabs/OverviewTab";
import CurriculumTab from "./classes/tabs/CurriculumTab";
import StudentsTab from "./classes/tabs/StudentsTab";
import AssignmentsTab from "./classes/tabs/AssignmentsTab";
import CreateClassModal from "./classes/modals/CreateClassModal";
import CustomizeLessonModal from "./classes/modals/CustomizeLessonModal";
import ManualStudentModal from "./classes/modals/ManualStudentModal";
import DeleteClassModal from "./classes/modals/DeleteClassModal";

export { type ClassDetailItem, type StudentRowItem } from "./classes/types";

interface ClassesWorkspaceProps {
  currentUser?: any;
  initialClassId?:string;
  initialCreate?:boolean;
  onClassCountChange?: (count: number) => void;
  onAssignNew?: (classId: string) => void;
  onNavigateToAssignments?: (payload?: any) => void;
  onBackToDashboard?: () => void;
}

export default function ClassesWorkspace({
  currentUser,initialClassId,initialCreate,
  onClassCountChange,
  onAssignNew,
  onNavigateToAssignments,
  onBackToDashboard,
}: ClassesWorkspaceProps) {
  // 1. Classes state
  const [classes, setClasses] = useState<ClassDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(initialClassId||null);
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState(false);
  const [selectedBulkClassIds, setSelectedBulkClassIds] = useState<string[]>([]);
  const [isBulkDeletingClasses, setIsBulkDeletingClasses] = useState(false);

  // 2. Class detail subtab
  const [detailSubTab, setDetailSubTab] = useState<
    "overview" | "curriculum" | "students" | "assignments" | "materials" | "schedule" | "reports" | "settings"
  >("overview");

  // 3. Curriculum state
  const [curriculumLessons, setCurriculumLessons] = useState<any[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [customizingLesson, setCustomizingLesson] = useState<Hsk1FullLesson | null>(null);
  const [customVocabs, setCustomVocabs] = useState<string[]>([]);
  const [customGrammars, setCustomGrammars] = useState<string[]>([]);
  const [customHasDialogue, setCustomHasDialogue] = useState(true);
  const [customIncludeCulture,setCustomIncludeCulture]=useState(true);
  const [customTeacherNote, setCustomTeacherNote] = useState("");
  const [customDueDate, setCustomDueDate] = useState("");
  const [savingCurriculumLesson, setSavingCurriculumLesson] = useState(false);

  // 4. Students state
  const [studentsList, setStudentsList] = useState<StudentRowItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // 5. Assignments state
  const [classAssignments, setClassAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // 6. Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialCreate||false);
  const [creatingClass, setCreatingClass] = useState(false);
  const [isManualStudentModalOpen, setIsManualStudentModalOpen] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingClass, setDeletingClass] = useState<ClassDetailItem | null>(null);
  const [isDeletingClass, setIsDeletingClass] = useState(false);

  // 7. Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Stable callback ref to prevent infinite loops
  const onClassCountChangeRef = React.useRef(onClassCountChange);
  useEffect(() => {
    onClassCountChangeRef.current = onClassCountChange;
  }, [onClassCountChange]);

  // Selected Class Memo
  const currentClass = useMemo(() => {
    if (!selectedClassId) return null;
    return classes.find((c) => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // ============================================================================
  // API FETCHERS (Single Source of Truth: PostgreSQL via Prisma API)
  // ============================================================================

  // 1. Fetch Classes for Teacher
  const fetchClasses = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/classes?teacherId=${currentUser.id}`, {
        headers: { "x-user-id": currentUser.id },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const transformed: ClassDetailItem[] = data.items.map((c: any, index: number) => {
          const trackType = c.track || (c.level <= 3 ? "HSK" : c.level === 4 ? "TOPIC" : "MAJOR");
          const art = getClassArtwork(trackType, c.level, index, c.name);
          const hasAssignments = typeof c.totalAssignments === "number" && c.totalAssignments > 0;
          const formattedCode = c.code || c.id.slice(-6).toUpperCase();

          return {
            id: c.id,
            name: c.name,
            level: Number(c.level) || 1,
            track: trackType,
            badgeText: trackType === "HSK" ? `HSK ${c.level}` : trackType === "TOPIC" ? "Chủ đề" : "Chuyên ngành",
            status: c.status || (c.isActive ? "ACTIVE" : "ENDED"),
            statusText: c.statusText || (c.isActive ? "Đang dạy" : "Đã kết thúc"),
            isArchived: Boolean(c.isArchived || c.status === "ARCHIVED"),
            studentCount: c.totalStudents || 0,
            totalAssignments: c.totalAssignments || 0,
            maxStudents: 30,
            startDate: c.startDate || normalizeDMY(c.createdAt),
            endDate: c.endDate || normalizeDMY(new Date(new Date(c.createdAt || Date.now()).getTime() + 180 * 86400000)),
            progressPercent: c.progressPercent ?? null,
            code: formattedCode,
            artwork: art,
            teacherName: c.teacherName || currentUser.name,
            description: c.description || `Lớp học ${c.name} do cô/thầy ${currentUser.name} phụ trách.`,
            autoApprove: true,
            requireRealName: true,
            avatarList: c.avatarList || [],
            createdAt: c.createdAt,
          };
        });

        setClasses(transformed);
        if (onClassCountChangeRef.current) onClassCountChangeRef.current(transformed.length);
      }
    } catch (err) {
      console.error("fetchClasses error:", err);
      showToast("Lỗi kết nối khi tải danh sách lớp.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.name, showToast]);

  const { lessons: sharedLessons } = useCurriculumLessons(currentClass?.level || 1);

  // 2. Fetch Curriculum Lessons for current class
  const fetchCurriculumLessons = useCallback(async (classId: string) => {
    try {
      setLoadingCurriculum(true);
      const res = await fetch(`/api/v1/classes/${classId}/lessons`);
      const data = await res.json();
      if (data.success && Array.isArray(data.lessons)) {
        setCurriculumLessons(data.lessons);
        return;
      }
    } catch (err) {
      console.warn("fetchCurriculumLessons error:", err);
    } finally {
      setLoadingCurriculum(false);
    }

    // Keep an empty result on server failure; bundled data must not resurrect deleted lessons.
    setCurriculumLessons([]);
    setLoadingCurriculum(false);
  }, []);

  // 3. Fetch Students for current class
  const fetchClassStudents = useCallback(async (classId: string) => {
    if (!currentUser?.id) return;
    try {
      setLoadingStudents(true);
      const res = await fetch(`/api/v1/classes/${classId}/students`, {
        headers: { "x-user-id": currentUser.id },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const mapped: StudentRowItem[] = data.items.map((st: any) => {
          const isPending = st.enrollmentStatus === "PENDING" || st.status === "PENDING";
          return {
            id: st.id,
            name: st.name,
            username: st.username,
            email: st.email || "",
            status: isPending ? "PENDING" : st.status === "INACTIVE" ? "INACTIVE" : st.status === "COMPLETED" ? "COMPLETED" : "LEARNING",
            enrollmentStatus: isPending ? "PENDING" : "APPROVED",
            statusText: isPending ? "Chờ duyệt" : st.status === "COMPLETED" ? "Hoàn thành" : "Đang học",
            progressPercent: st.progressPercent ?? null,
            totalAssignments: st.totalAssignments || 0,
            submittedAssignments: st.submittedAssignments || 0,
            joinedDate: st.joinedAt ? new Date(st.joinedAt).toLocaleDateString("vi-VN") : "Hôm nay",
            avatar: st.avatar || "/theme/avatar-student.jpg",
            scoreAvg: st.scoreAvg,
          };
        });
        setStudentsList(mapped);

        // Update studentCount in classes state
        setClasses((prev) =>
          prev.map((c) =>
            c.id === classId
              ? { ...c, studentCount: mapped.filter((s) => s.enrollmentStatus !== "PENDING").length }
              : c
          )
        );
      }
    } catch (err) {
      console.error("fetchClassStudents error:", err);
      setStudentsList([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [currentUser?.id]);

  // 4. Fetch Assignments for current class
  const fetchClassAssignments = useCallback(async (classId: string) => {
    try {
      setLoadingAssignments(true);
      const res = await fetch(`/api/v1/assignments?classId=${encodeURIComponent(classId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setClassAssignments(data.items);
      } else {
        setClassAssignments([]);
      }
    } catch (err) {
      console.error("fetchClassAssignments error:", err);
      setClassAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  // Load classes on mount or user change
  useEffect(() => {
    if (currentUser?.id) {
      fetchClasses();
    } else {
      setLoading(false);
    }
  }, [currentUser?.id, fetchClasses]);

  // Load sub-data when selectedClassId changes
  useEffect(() => {
    if (selectedClassId && currentClass) {
      fetchCurriculumLessons(selectedClassId);
      fetchClassStudents(selectedClassId);
      fetchClassAssignments(selectedClassId);
      setSelectedStudentIds([]);
    } else {
      setCurriculumLessons([]);
      setStudentsList([]);
      setClassAssignments([]);
      setSelectedStudentIds([]);
    }
  }, [selectedClassId, currentClass?.level, fetchCurriculumLessons, fetchClassStudents, fetchClassAssignments]);

  // ============================================================================
  // MUTATION HANDLERS
  // ============================================================================

  // 1. Create Class
  const handleCreateClass = async (formData: {
    name: string;
    level: number;
    track: "HSK" | "TOPIC" | "MAJOR";
    startDate: string;
    endDate: string;
    description: string;
  }) => {
    if (!currentUser?.id) return;
    try {
      setCreatingClass(true);
      const res = await fetch("/api/v1/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({
          ...formData,
          teacherId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("hanyu_portal_changed"));
        showToast(`Tạo lớp "${formData.name}" thành công!`);
        setIsCreateModalOpen(false);
        await fetchClasses();
        if (data.item?.id) {
          setSelectedClassId(data.item.id);
          setDetailSubTab("curriculum");
        }
      } else {
        showToast(data.message || "Lỗi tạo lớp học.");
      }
    } catch (err) {
      showToast("Lỗi kết nối máy chủ khi tạo lớp.");
    } finally {
      setCreatingClass(false);
    }
  };

  useEffect(()=>{if(currentClass?.id)requestAnimationFrame(()=>document.getElementById("teacher-class-detail")?.scrollIntoView({behavior:"smooth",block:"start"}));},[currentClass?.id]);
  // 2. Open Customize Lesson Modal
  const handleOpenCustomizeLesson = (lsNumber: number) => {
    if (!currentClass) return;
    const baseLessons = sharedLessons;
    const fullLesson: Hsk1FullLesson | undefined = baseLessons.find((l) => l.number === lsNumber) || curriculumLessons.find(cl=>cl.lessonNumber===lsNumber)?.content;
    if (!fullLesson) return;

    const existing = curriculumLessons.find((cl) => cl.lessonNumber === lsNumber);
    setCustomizingLesson(fullLesson);

    if (existing && Array.isArray(existing.selectedVocabs)) {
      setCustomVocabs(existing.selectedVocabs.map((v: any) => v.hanzi));
    } else {
      setCustomVocabs(fullLesson.vocabList.map((v) => v.hanzi));
    }

    if (existing && Array.isArray(existing.selectedGrammars)) {
      setCustomGrammars(existing.selectedGrammars.map((g: any) => g.title || g.name));
    } else {
      setCustomGrammars(fullLesson.grammarList.map((g) => g.title));
    }

    setCustomHasDialogue(existing ? existing.hasDialogue !== false : true);
    setCustomIncludeCulture(existing?.content ? Boolean(existing.content.phonetics?.rule || existing.content.culture) : true);
    setCustomTeacherNote(existing?.teacherNote || "");
    setCustomDueDate(existing?.dueDate || "");
  };

  // 3. Save Lesson (Draft or Published)
  const handleSaveCurriculumLesson = async (targetStatus: "PUBLISHED" | "DRAFT") => {
    if (!currentClass || !customizingLesson) return;
    try {
      setSavingCurriculumLesson(true);
      const chosenVocabs = customizingLesson.vocabList.filter((v) =>
        customVocabs.includes(v.hanzi)
      );
      const chosenGrammars = customizingLesson.grammarList.filter((g) =>
        customGrammars.includes(g.title)
      );

      const res = await fetch(`/api/v1/classes/${currentClass.id}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonNumber: customizingLesson.number,
          status: targetStatus,
          selectedVocabs: chosenVocabs,
          selectedGrammars: chosenGrammars,
          hasDialogue: customHasDialogue,
          includeCulture: customIncludeCulture,
          hasReading: true,
          teacherNote: customTeacherNote,
          dueDate: customDueDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("hanyu_portal_changed"));
        showToast(
          targetStatus === "PUBLISHED"
            ? `Đã công bố Bài ${customizingLesson.number} cho lớp ${currentClass.name}!`
            : `Đã lưu bản nháp Bài ${customizingLesson.number}!`
        );
        setCustomizingLesson(null);
        await fetchCurriculumLessons(currentClass.id);
      } else {
        showToast(data.message || "Lỗi lưu bài học.");
      }
    } catch (err) {
      showToast("Lỗi kết nối khi lưu bài học.");
    } finally {
      setSavingCurriculumLesson(false);
    }
  };

  // 4. Revoke / Lock Lesson
  const handleRevokeLesson = async (lessonNumber: number) => {
    if (!currentClass) return;
    if (!confirm(`Bạn có chắc chắn muốn thu hồi (khóa lại) Bài ${lessonNumber}? Học sinh sẽ không thể truy cập nội dung bài này nữa.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/classes/${currentClass.id}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonNumber,
          status: "LOCKED",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("hanyu_portal_changed"));
        showToast(`Đã thu hồi (khóa lại) Bài ${lessonNumber}.`);
        await fetchCurriculumLessons(currentClass.id);
      } else {
        showToast(data.message || "Lỗi thu hồi bài học.");
      }
    } catch (err) {
      showToast("Lỗi kết nối khi thu hồi bài học.");
    }
  };

  // 5. Remove Single Student from Class
  const handleRemoveStudent = async (student: StudentRowItem) => {
    if (!currentClass || !currentUser?.id) return;
    if (!confirm(`Bạn có chắc muốn xóa học sinh "${student.name}" khỏi lớp "${currentClass.name}"? (Tài khoản học sinh vẫn được bảo lưu).`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/classes/${currentClass.id}/students?studentId=${student.id}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUser.id },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("hanyu_portal_changed"));
        showToast(`Đã gỡ học sinh ${student.name} khỏi lớp.`);
        await fetchClassStudents(currentClass.id);
        await fetchClasses();
      } else {
        showToast(data.message || "Lỗi khi gỡ học sinh.");
      }
    } catch (err) {
      showToast("Lỗi kết nối khi gỡ học sinh.");
    }
  };

  // 6. Bulk Remove Students from Class
  const handleBulkRemoveStudents = async () => {
    if (!currentClass || selectedStudentIds.length === 0 || !currentUser?.id) return;
    if (!confirm(`Bạn có chắc muốn xóa ${selectedStudentIds.length} học sinh khỏi lớp "${currentClass.name}"? (Tài khoản học sinh vẫn được bảo lưu).`)) {
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
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("hanyu_portal_changed"));
        showToast(`Đã xóa ${selectedStudentIds.length} học sinh khỏi lớp thành công.`);
        setSelectedStudentIds([]);
        await fetchClassStudents(currentClass.id);
        await fetchClasses();
      } else {
        showToast(data.message || "Lỗi xóa học sinh khỏi lớp.");
      }
    } catch (err) {
      showToast("Lỗi kết nối khi xóa học sinh.");
    }
  };

  // 7. Manual Add Student to Class
  const handleManualAddStudent = async (data: {
    name: string;
    username: string;
    email?: string;
    password?: string;
  }) => {
    if (!currentClass || !currentUser?.id) return;
    try {
      setAddingStudent(true);
      const res = await fetch(`/api/v1/classes/${currentClass.id}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(`Đã thêm học sinh "${data.name}" vào lớp thành công!`);
        setIsManualStudentModalOpen(false);
        await fetchClassStudents(currentClass.id);
        await fetchClasses();
      } else {
        showToast(resData.message || "Lỗi thêm học sinh vào lớp.");
      }
    } catch (err) {
      showToast("Lỗi kết nối khi thêm học sinh.");
    } finally {
      setAddingStudent(false);
    }
  };

  // 7b. Approve Student to Class
  const handleApproveStudent = async (studentId: string) => {
    if (!currentClass || !currentUser?.id) return;
    try {
      const res = await fetch(`/api/v1/classes/${currentClass.id}/students`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({ studentId, action: "APPROVE" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("hanyu_portal_changed"));
        showToast(data.message || "Đã duyệt học sinh vào lớp thành công!");
        await fetchClassStudents(currentClass.id);
        await fetchClasses();
      } else {
        showToast(data.message || "Lỗi phê duyệt học sinh.");
      }
    } catch {
      showToast("Lỗi kết nối khi duyệt học sinh.");
    }
  };

  // 7c. Reject Student Request
  const handleRejectStudent = async (studentId: string) => {
    if (!currentClass || !currentUser?.id) return;
    try {
      const res = await fetch(`/api/v1/classes/${currentClass.id}/students`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify({ studentId, action: "REJECT" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("hanyu_portal_changed"));
        showToast(data.message || "Đã từ chối yêu cầu vào lớp.");
        await fetchClassStudents(currentClass.id);
        await fetchClasses();
      } else {
        showToast(data.message || "Lỗi xử lý từ chối.");
      }
    } catch {
      showToast("Lỗi kết nối khi từ chối học sinh.");
    }
  };

  // 8. Delete Single Class
  const handleDeleteClass = async () => {
    if (!deletingClass || !currentUser?.id) return;
    try {
      setIsDeletingClass(true);
      const res = await fetch(`/api/v1/classes/${deletingClass.id}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUser.id },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.dispatchEvent(new Event("hanyu_portal_changed"));
        showToast(`Đã xóa lớp "${deletingClass.name}" thành công.`);
        setIsDeleteModalOpen(false);
        setDeletingClass(null);
        if (selectedClassId === deletingClass.id) {
          setSelectedClassId(null);
        }
        await fetchClasses();
      } else {
        showToast(data.message || "Lỗi xóa lớp học.");
      }
    } catch (err) {
      showToast("Lỗi kết nối máy chủ khi xóa lớp.");
    } finally {
      setIsDeletingClass(false);
    }
  };

  // 9. Bulk Delete Classes
  const handleBulkDeleteClasses = async () => {
    if (selectedBulkClassIds.length === 0 || !currentUser?.id) return;
    if (!confirm(`Bạn có chắc muốn xóa ${selectedBulkClassIds.length} lớp học đã chọn? Toàn bộ bài học, phân công bài tập và liên kết học sinh sẽ bị xóa an toàn.`)) {
      return;
    }
    try {
      setIsBulkDeletingClasses(true);
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
        window.dispatchEvent(new Event("hanyu_portal_changed"));
        showToast(`Đã xóa ${selectedBulkClassIds.length} lớp học thành công.`);
        setSelectedBulkClassIds([]);
        if (selectedClassId && selectedBulkClassIds.includes(selectedClassId)) {
          setSelectedClassId(null);
        }
        await fetchClasses();
      } else {
        showToast(data.message || "Lỗi xóa hàng loạt lớp.");
      }
    } catch (err) {
      showToast("Lỗi kết nối khi xóa hàng loạt lớp.");
    } finally {
      setIsBulkDeletingClasses(false);
    }
  };

  return (
    <div className="space-y-6 text-[#17382F] font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F513F] text-[#FFFCF7] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW A: DANH SÁCH TẤT CẢ LỚP HỌC                                     */}
      {/* ===================================================================== */}
      {(
        <ClassesList
          classes={classes}
          loading={loading}
          selectedBulkClassIds={selectedBulkClassIds}
          setSelectedBulkClassIds={setSelectedBulkClassIds}
          onSelectClass={(id) => {
            setSelectedClassId(id);
            setDetailSubTab("overview");
          }}
          onOpenCreateClassModal={() => setIsCreateModalOpen(true)}
          onBulkDeleteClasses={handleBulkDeleteClasses}
          isBulkDeleting={isBulkDeletingClasses}
        />
      )}

      {/* ===================================================================== */}
      {/* VIEW B: CHI TIẾT LỚP HỌC ĐANG CHỌN (TRUNG TÂM VẬN HÀNH GIÁO VIÊN)   */}
      {/* ===================================================================== */}
      {selectedClassId && currentClass && (
        <div id="teacher-class-detail" style={{scrollMarginTop:100}} data-class-detail-wrapper className="space-y-6">
          <ClassHeader
            currentClass={currentClass}
            activeSubTab={detailSubTab}
            setActiveSubTab={setDetailSubTab}
            onBackToList={() => {setSelectedClassId(null);window.scrollTo({top:0,behavior:"smooth"});}}
            studentsCount={studentsList.length}
          />

          {/* TAB 1: TỔNG QUAN */}
          {detailSubTab === "overview" && (
            <OverviewTab
              currentClass={currentClass}
              studentsCount={studentsList.length}
              publishedLessonsCount={
                curriculumLessons.filter((l) => l.status === "PUBLISHED" || l.isPublished).length
              }
              assignmentsCount={classAssignments.length}
              onNavigateSubTab={(tab) => setDetailSubTab(tab as any)}
              onOpenManualStudentModal={() => setIsManualStudentModalOpen(true)}
            />
          )}

          {/* TAB 2: LỘ TRÌNH 15 BÀI HỌC (HSK 1 / HSK 2 DYNAMIC) */}
          {detailSubTab === "curriculum" && (
            <CurriculumTab
              currentClass={currentClass}
              curriculumLessons={curriculumLessons}
              loadingCurriculum={loadingCurriculum}
              onOpenCustomizeLesson={handleOpenCustomizeLesson}
              onRevokeLesson={handleRevokeLesson}
            />
          )}

          {/* TAB 3: HỌC SINH */}
          {detailSubTab === "students" && (
            <StudentsTab
              currentClass={currentClass}
              studentsList={studentsList}
              loadingStudents={loadingStudents}
              selectedStudentIds={selectedStudentIds}
              setSelectedStudentIds={setSelectedStudentIds}
              onRemoveStudent={handleRemoveStudent}
              onBulkRemoveStudents={handleBulkRemoveStudents}
              onOpenManualStudentModal={() => setIsManualStudentModalOpen(true)}
              onApproveStudent={handleApproveStudent}
              onRejectStudent={handleRejectStudent}
            />
          )}

          {/* TAB 4: BÀI TẬP & ĐỀ THI */}
          {detailSubTab === "assignments" && (
            <AssignmentsTab
              currentClass={currentClass}
              assignments={classAssignments}
              studentsCount={studentsList.length}
              onAssignNew={() => {
                if (onAssignNew) {
                  onAssignNew(currentClass.id);
                }
              }}
              onGradeAssignment={(asgId, title) => {
                if (onNavigateToAssignments) {
                  onNavigateToAssignments({ classId: currentClass.id, assignmentId: asgId, title });
                } else if (onAssignNew) {
                  onAssignNew(currentClass.id);
                }
              }}
            />
          )}

          {/* TAB 5: TÀI LIỆU */}
          {detailSubTab === "materials" && <TeachingMaterialsWorkspace classId={currentClass.id} />}

          {/* TAB 6: LỊCH HỌC */}
          {detailSubTab === "schedule" && <AppleScheduleCalendar classes={[currentClass]}/>}

          {/* TAB 7: BÁO CÁO */}
          {detailSubTab === "reports" && <ClassReportWorkspace classes={[currentClass]} currentUser={currentUser} showToast={showToast} onNavigateToTab={tab=>setDetailSubTab(tab==="classes"?"students":tab as any)}/>}

          {isDiagnosticsModalOpen && currentClass && (
        <ClassDiagnosticsModal
          isOpen={isDiagnosticsModalOpen}
          onClose={() => setIsDiagnosticsModalOpen(false)}
          classId={currentClass.id}
          className={currentClass.name}
        />
      )}
      {/* TAB 8: CÀI ĐẶT LỚP */}
          {detailSubTab === "settings" && (<div className="space-y-5"><ClassSettingsForm key={currentClass.id} classroom={currentClass} onSaved={()=>{void fetchClasses();}}/>
            <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-4">
              <h3 className="font-serif font-bold text-base text-[#17382F]">
                Cài đặt & Vùng nguy hiểm
              </h3>
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-red-900">Xóa lớp học vĩnh viễn</h4>
                  <p className="text-[11px] text-red-700 mt-0.5">
                    Xóa lớp học khỏi hệ thống. Tài khoản học sinh vẫn được bảo lưu an toàn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingClass(currentClass);
                    setIsDeleteModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer shrink-0"
                >
                  Xóa lớp này
                </button>
              </div>
            </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODALS                                                                */}
      {/* ===================================================================== */}

      {/* Modal 1: Tạo lớp học mới */}
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateClass}
        loading={creatingClass}
        teacherName={currentUser?.name || currentUser?.username}
      />

      {/* Modal 2: Tùy chỉnh & Công bố bài học */}
      <CustomizeLessonModal
        customizingLesson={customizingLesson}
        currentClass={currentClass || ({} as any)}
        customVocabs={customVocabs}
        setCustomVocabs={setCustomVocabs}
        customGrammars={customGrammars}
        setCustomGrammars={setCustomGrammars}
        customIncludeCulture={customIncludeCulture}
        setCustomIncludeCulture={setCustomIncludeCulture}
        customHasDialogue={customHasDialogue}
        setCustomHasDialogue={setCustomHasDialogue}
        customTeacherNote={customTeacherNote}
        setCustomTeacherNote={setCustomTeacherNote}
        customDueDate={customDueDate}
        setCustomDueDate={setCustomDueDate}
        saving={savingCurriculumLesson}
        onSave={handleSaveCurriculumLesson}
        onClose={() => setCustomizingLesson(null)}
      />

      {/* Modal 3: Thêm học sinh thủ công */}
      {currentClass && (
        <ManualStudentModal
          isOpen={isManualStudentModalOpen}
          onClose={() => setIsManualStudentModalOpen(false)}
          currentClass={currentClass}
          onSubmit={handleManualAddStudent}
          loading={addingStudent}
        />
      )}

      {/* Modal 4: Xác nhận xóa lớp */}
      <DeleteClassModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingClass(null);
        }}
        deletingClass={deletingClass}
        onConfirm={handleDeleteClass}
        loading={isDeletingClass}
      />
    </div>
  );
}
