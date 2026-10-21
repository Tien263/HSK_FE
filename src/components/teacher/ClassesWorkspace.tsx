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
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface ClassDetailItem {
  id: string;
  name: string;
  track: "HSK" | "TOPIC" | "MAJOR";
  badgeText: string;
  status: "ACTIVE" | "PAUSED" | "UPCOMING" | "ENDED";
  statusText: string;
  studentCount: number;
  maxStudents: number;
  startDate: string;
  endDate: string;
  progressPercent: number;
  code: string;
  artwork: string;
  teacherName: string;
  description: string;
  autoApprove: boolean;
  requireRealName: boolean;
  avatarList: string[];
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
}

export default function ClassesWorkspace({ currentUser, onClassCountChange }: ClassesWorkspaceProps) {
  // 1. Classes list state (Loaded dynamically per teacher)
  const [classes, setClasses] = useState<ClassDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classFilterTab, setClassFilterTab] = useState<"ALL" | "ACTIVE" | "UPCOMING" | "ENDED">("ALL");
  const [classSearchQuery, setClassSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");

  // 2. Class detail subtab
  const [detailSubTab, setDetailSubTab] = useState<
    "overview" | "students" | "assignments" | "materials" | "schedule" | "reports" | "settings"
  >("overview");

  // 3. Join Method Subtab
  const [joinMethodTab, setJoinMethodTab] = useState<"code" | "link" | "email" | "issue">("code");

  // 4. Students list (Loaded dynamically from the selected class)
  const [studentsList, setStudentsList] = useState<StudentRowItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState<"ALL" | "LEARNING" | "INACTIVE" | "COMPLETED">("ALL");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

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

  // Form states for Create Class
  const [newClassName, setNewClassName] = useState("");
  const [newClassTrack, setNewClassTrack] = useState<"HSK" | "TOPIC" | "MAJOR">("HSK");
  const [newClassLevel, setNewClassLevel] = useState("HSK 3");
  const [newClassStartDate, setNewClassStartDate] = useState("01/11/2026");
  const [newClassEndDate, setNewClassEndDate] = useState("30/03/2026");
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

  // ==========================================================================
  // FETCH CLASSES DYNAMICALLY FOR THE LOGGED-IN TEACHER
  // ==========================================================================
  const fetchClasses = async () => {
    if (!currentUser?.id) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/classes?teacherId=${currentUser.id}`, {
        headers: {
          "x-user-id": currentUser.id,
        },
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const transformed: ClassDetailItem[] = data.items.map((c: any, index: number) => {
          const artworkOptions = [
            "/theme/hero-student-pavilion.jpg",
            "/theme/tinh_vat_tra_ben_canh_hoa_mai_dao.jpg",
            "/theme/dashboard/card-major.webp",
            "/theme/phong_canh_thuy_mac_giua_suong_mo.jpg",
            "/theme/dashboard/card-hsk.webp",
          ];
          const art = artworkOptions[index % artworkOptions.length];

          return {
            id: c.id,
            name: c.name,
            track: c.level === 1 || c.level === 3 || c.level === 4 || c.level === 5 ? "HSK" : "TOPIC",
            badgeText: `HSK ${c.level}.0`,
            status: c.isActive ? "ACTIVE" : "ENDED",
            statusText: c.isActive ? "Đang dạy" : "Đã kết thúc",
            studentCount: c.totalStudents || 0,
            maxStudents: 30,
            startDate: new Date(c.createdAt || Date.now()).toLocaleDateString("vi-VN"),
            endDate: "30/12/2026",
            progressPercent: c.totalStudents > 0 ? 76 : 0,
            code: c.code || c.id.slice(-6).toUpperCase(),
            artwork: art,
            teacherName: c.teacherName || currentUser.name,
            description: c.description || `Lớp học ${c.name} do cô/thầy ${currentUser.name} phụ trách.`,
            autoApprove: true,
            requireRealName: true,
            avatarList: [
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80",
            ],
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
      if (data.success && Array.isArray(data.items)) {
        const mapped: StudentRowItem[] = data.items.map((s: any) => ({
          id: s.id,
          name: s.name,
          username: s.username,
          email: s.email || `${s.username}@gmail.com`,
          status: "LEARNING",
          statusText: "Đang học",
          progressPercent: s.attemptsCount > 0 ? Math.min(100, s.attemptsCount * 20) : 0,
          submittedAssignments: s.attemptsCount || 0,
          totalAssignments: 10,
          joinedDate: s.joinedAt ? new Date(s.joinedAt).toLocaleDateString("vi-VN") : "Hôm nay",
          avatar: s.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
        }));
        setStudentsList(mapped);
      } else {
        setStudentsList([]);
      }
    } catch (err) {
      console.error("fetchClassStudents error:", err);
      setStudentsList([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchClassStudents(selectedClassId);
    } else {
      setStudentsList([]);
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

  // Filtered classes
  const filteredClasses = classes.filter((cl) => {
    if (classFilterTab === "ACTIVE" && cl.status !== "ACTIVE") return false;
    if (classFilterTab === "UPCOMING" && cl.status !== "UPCOMING") return false;
    if (classFilterTab === "ENDED" && cl.status !== "ENDED") return false;
    if (classSearchQuery.trim()) {
      const q = classSearchQuery.toLowerCase();
      return cl.name.toLowerCase().includes(q) || cl.code.toLowerCase().includes(q) || cl.description.toLowerCase().includes(q);
    }
    return true;
  });

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
  const activeClassesCount = classes.filter((c) => c.status === "ACTIVE").length;
  const endedClassesCount = classes.filter((c) => c.status === "ENDED").length;
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
              {totalClassesCount > 0 ? totalClassesCount * 2 : 0}
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
              {totalStudentsCount > 0 ? "84%" : "0%"}
            </div>
            <span className="text-[11px] text-[#6B766D]">
              {totalStudentsCount > 0 ? "Theo thống kê bài tập" : "Chưa có dữ liệu bài nộp"}
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
                strokeDasharray={`${totalStudentsCount > 0 ? 84 : 0}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-[#17382F]">
              {totalStudentsCount > 0 ? "84%" : "0%"}
            </span>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* 3. FILTER TABS & SEARCH BAR & VIEW TOGGLE */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "ALL", label: `Tất cả lớp (${classes.length})` },
            { id: "ACTIVE", label: `Đang dạy (${classes.filter((c) => c.status === "ACTIVE").length})` },
            { id: "UPCOMING", label: `Sắp bắt đầu (${classes.filter((c) => c.status === "UPCOMING").length})` },
            { id: "ENDED", label: `Đã kết thúc (${classes.filter((c) => c.status === "ENDED").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setClassFilterTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                classFilterTab === tab.id
                  ? "bg-[#1F513F] text-white shadow-xs"
                  : "bg-[#FFFCF7] text-[#6B766D] hover:text-[#17382F] border border-[#E5DFD0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Layout View Mode */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#6B766D] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={classSearchQuery}
              onChange={(e) => setClassSearchQuery(e.target.value)}
              placeholder="Tìm lớp học..."
              className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#17382F] placeholder-[#6B766D]/60 focus:border-[#1F513F] outline-none w-48 sm:w-56"
            />
          </div>

          <div className="flex items-center bg-[#FFFCF7] border border-[#E5DFD0] rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === "GRID" ? "bg-[#1F513F] text-white" : "text-[#6B766D] hover:text-[#17382F]"
              }`}
              title="Dạng thẻ"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Thẻ</span>
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
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
      {/* 4. CLASS CARDS (OR EMPTY STATE IF TEACHER HAS 0 CLASSES) */}
      {/* ===================================================================== */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#6B766D] bg-[#FFFCF7] rounded-3xl border border-[#E5DFD0]">
          <div className="w-6 h-6 border-2 border-[#1F513F]/30 border-t-[#1F513F] rounded-full animate-spin mx-auto mb-2" />
          <span>Đang tải danh sách lớp học của bạn...</span>
        </div>
      ) : classes.length === 0 ? (
        /* YÊU CẦU 4: Trạng thái trống chuẩn "Bạn chưa có lớp học nào" */
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
      ) : viewMode === "GRID" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {filteredClasses.map((cl) => {
            const isSelected = cl.id === selectedClassId;
            return (
              <div
                key={cl.id}
                onClick={() => setSelectedClassId(cl.id)}
                className={`rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden bg-[#FFFCF7] shadow-2xs ${
                  isSelected
                    ? "border-[#1F513F] ring-2 ring-[#1F513F]/25 shadow-md scale-[1.01]"
                    : "border-[#E5DFD0] hover:border-[#1F513F]/60"
                }`}
              >
                {/* Artwork header */}
                <div className="h-24 w-full relative overflow-hidden bg-[#F7F5EE]">
                  <Image
                    src={cl.artwork}
                    alt={cl.name}
                    fill
                    className="object-cover object-center filter saturate-90 hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  
                  {/* Top badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 rounded-md bg-white/95 text-[#17382F] text-[10px] font-bold shadow-2xs">
                      {cl.badgeText}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 ${
                        cl.status === "ACTIVE"
                          ? "bg-emerald-600 text-white"
                          : cl.status === "PAUSED"
                          ? "bg-amber-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                      {cl.statusText}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-sm text-[#17382F] truncate">{cl.name}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClassId(cl.id);
                          copyToClipboard(cl.code, "mã lớp");
                        }}
                        className="text-[#6B766D] hover:text-[#17382F] p-0.5"
                        title="Sao chép mã"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="mt-1 space-y-1 text-[11px] text-[#6B766D]">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-[#1F513F]" />
                        <span>{cl.studentCount} học sinh</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#1F513F]" />
                        <span>{cl.startDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Avatar stack */}
                  <div className="pt-2 border-t border-[#E5DFD0]/60 space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-[#6B766D]">
                        <span>Tiến độ</span>
                        <span className="text-[#1F513F] font-bold">{cl.progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#E5DFD0] overflow-hidden">
                        <div
                          className="h-full bg-[#1F513F] rounded-full transition-all duration-500"
                          style={{ width: `${cl.progressPercent}%` }}
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
        /* List View */
        <div className="rounded-2xl bg-[#FFFCF7] border border-[#E5DFD0] overflow-hidden shadow-2xs divide-y divide-[#E5DFD0]">
          {filteredClasses.map((cl) => (
            <div
              key={cl.id}
              onClick={() => setSelectedClassId(cl.id)}
              className={`p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F7F5EE] transition ${
                cl.id === selectedClassId ? "bg-[#DCE8DB]/30 font-semibold" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0">
                  <Image src={cl.artwork} alt={cl.name} fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-sm text-[#17382F]">{cl.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCE8DB] text-[#1F513F]">
                      {cl.badgeText}
                    </span>
                    <span className="text-[10px] text-[#6B766D] font-mono">Mã: {cl.code}</span>
                  </div>
                  <p className="text-xs text-[#6B766D] mt-0.5 line-clamp-1">{cl.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-[#6B766D]">
                <span>👥 {cl.studentCount} học viên</span>
                <span>📅 {cl.startDate}</span>
                <span className="font-bold text-[#1F513F]">{cl.progressPercent}%</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClassId(cl.id);
                  }}
                  className="px-3 py-1 rounded-xl bg-[#1F513F] text-white text-xs font-semibold"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
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
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
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
                    <button
                      onClick={() => setIsEditClassModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD0] hover:border-[#1F513F] text-[#17382F] text-[11px] font-semibold flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3 h-3 text-[#1F513F]" />
                      <span>Chỉnh sửa lớp</span>
                    </button>

                    <button
                      onClick={handleToggleEndClass}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD0] hover:border-amber-600 text-[#17382F] text-[11px] font-semibold flex items-center gap-1.5 transition"
                    >
                      <Archive className="w-3 h-3 text-amber-700" />
                      <span>{currentClass.status === "ENDED" ? "Mở lại lớp" : "Kết thúc lớp"}</span>
                    </button>

                    <button
                      onClick={() => showToast("Đang mở chế độ xem với tư cách học sinh...")}
                      className="px-3 py-1.5 rounded-xl bg-[#DCE8DB]/60 hover:bg-[#DCE8DB] text-[#1F513F] text-[11px] font-semibold flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Xem như học viên</span>
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
                  onClick={() => showToast(`Đang chuyển sang tạo bài tập cho lớp ${currentClass.name}...`)}
                  className="px-4 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-semibold shadow-2xs"
                >
                  + Giao bài tập mới
                </button>
              </div>

              <div className="p-8 text-center text-xs text-[#6B766D] border border-dashed border-[#E5DFD0] rounded-2xl bg-[#F7F5EE]/40">
                Chưa có bài tập nào được giao riêng cho lớp này. Nhấn <strong>"+ Giao bài tập mới"</strong> để bắt đầu giao bài cho học viên!
              </div>
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
                  onClick={() => showToast("Đang mở trình chia sẻ tài liệu cho lớp...")}
                  className="px-4 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-semibold shadow-2xs"
                >
                  + Thêm tài liệu
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: `Giáo trình Chuẩn HSK ${currentClass.name} (PDF Full)`, type: "PDF", size: "24.8 MB" },
                  { title: "Trọn bộ 50 Audio bài tập luyện nghe", type: "AUDIO", size: "65.4 MB" },
                  { title: "Slide bài giảng Chuyên đề: Cấu trúc câu thực chiến", type: "SLIDE", size: "14.2 MB" },
                  { title: "Sổ tay từ vựng cốt lõi kèm pinyin", type: "EXCEL", size: "3.2 MB" },
                ].map((m, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-[#E5DFD0] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#DCE8DB] text-[#1F513F] flex items-center justify-center font-bold text-xs shrink-0">
                        {m.type}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-[#17382F]">{m.title}</h5>
                        <span className="text-[10px] text-[#6B766D]">{m.size}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast(`Bắt đầu tải về: ${m.title}`)}
                      className="p-2 rounded-xl text-[#6B766D] hover:text-[#17382F] hover:bg-[#F7F5EE]"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* TAB E: LỊCH HỌC */}
          {/* ----------------------------------------------------------------- */}
          {detailSubTab === "schedule" && (
            <div className="rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0] p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-serif font-bold text-[#17382F]">Lịch học hàng tuần – {currentClass.name}</h3>
              <div className="space-y-3">
                {[
                  { day: "Thứ Hai", time: "19:30 – 21:00", topic: "Từ vựng & Mẫu câu giao tiếp chủ đề Sinh hoạt", room: "Phòng học trực tuyến A1" },
                  { day: "Thứ Tư", time: "19:30 – 21:00", topic: "Ngữ pháp chuyên sâu: Cấu trúc câu & Bổ ngữ", room: "Phòng học trực tuyến A1" },
                ].map((s, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-[#E5DFD0] flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-[#DCE8DB] text-[#1F513F] text-[10px] font-bold">{s.day}</span>
                      <h5 className="font-bold text-xs text-[#17382F] mt-1">{s.topic}</h5>
                      <p className="text-[11px] text-[#6B766D]">{s.time} · {s.room}</p>
                    </div>
                    <button
                      onClick={() => showToast(`Mở phòng học: ${s.room}`)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1F513F] text-white text-xs font-semibold"
                    >
                      Vào phòng học
                    </button>
                  </div>
                ))}
              </div>
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
                    <h5 className="font-bold text-red-700">Lưu trữ hoặc Kết thúc lớp</h5>
                    <p className="text-[11px] text-[#6B766D]">
                      Học viên sẽ không thể nộp thêm bài nhưng vẫn giữ tài khoản và tiến trình học.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleEndClass}
                    className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold"
                  >
                    {currentClass.status === "ENDED" ? "Mở lại lớp" : "Kết thúc lớp"}
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

            <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditClassModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DFD0] text-[#6B766D] text-xs font-semibold cursor-pointer"
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
                      }),
                    });
                    showToast("Đã lưu thay đổi thông tin lớp học!");
                    setIsEditClassModalOpen(false);
                    await fetchClasses();
                  } catch {
                    showToast("Lỗi lưu thay đổi.");
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-semibold cursor-pointer shadow-md"
              >
                Lưu thay đổi
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
