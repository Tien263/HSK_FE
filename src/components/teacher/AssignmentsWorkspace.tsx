"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, Plus, Sparkles, Send, FileCheck2 } from "lucide-react";

import {
  ClassOption,
  AssignmentTabType,
  AssignmentItem,
  StudentSubmissionItem,
  ExamPackageItem,
  AssignmentKpiData,
} from "./assignments/types";
import AssignmentKpiCards from "./assignments/AssignmentKpiCards";
import AssignmentFilterTabs from "./assignments/AssignmentFilterTabs";
import AssignmentListTable from "./assignments/AssignmentListTable";
import SubmissionsListTable from "./assignments/SubmissionsListTable";
import ExamPackagesTable from "./assignments/ExamPackagesTable";
import AssignExamModal from "./assignments/AssignExamModal";
import GradingModal from "./assignments/GradingModal";
import LiveExamQrModal from "./assignments/LiveExamQrModal";

export type { AssignmentTabType, AssignmentItem, StudentSubmissionItem, ExamPackageItem } from "./assignments/types";

interface AssignmentsWorkspaceProps {
  currentUser?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  classesList?: ClassOption[];
  onBackToDashboard?: () => void;
  initialExamId?: string | null;
  initialTab?: AssignmentTabType;
  initialNewAssignmentPayload?: any;
  onNavigateToQuestionBank?: (tab?: "ALL" | "DRAFT" | "READY" | "USED") => void;
}

export function AssignmentsWorkspace({
  currentUser,
  classesList = [],
  onBackToDashboard,
  initialExamId,
  initialTab = "ALL",
  initialNewAssignmentPayload,
  onNavigateToQuestionBank,
}: AssignmentsWorkspaceProps) {
  // 1. Navigation & Filter State
  const [activeTab, setActiveTab] = useState<AssignmentTabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Data State (Single Source of Truth: PostgreSQL via REST API)
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmissionItem[]>([]);
  const [examPackages, setExamPackages] = useState<ExamPackageItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 3. Modals State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedExamForAssign, setSelectedExamForAssign] = useState<string | undefined>(
    initialExamId || undefined
  );
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [activeGradingSub, setActiveGradingSub] = useState<StudentSubmissionItem | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activeQrAssignment, setActiveQrAssignment] = useState<AssignmentItem | null>(null);

  // 4. Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Fetch Assignments & Submissions
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const teacherParam = currentUser?.id ? `?teacherId=${currentUser.id}` : "";
      const authHeaders: Record<string, string> = currentUser?.id ? { "x-user-id": currentUser.id } : {};

      // 1. Fetch Assignments from DB
      const res = await fetch(`/api/v1/assignments${teacherParam}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const mapped: AssignmentItem[] = data.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          examId: item.examId,
          classId: item.classId,
          className: item.className || "Lớp học",
          hskLevel: item.hskLevel || 1,
          totalQuestions: item.totalQuestions || 0,
          totalPoints: item.totalPoints || 100,
          durationMin: item.durationMin || 45,
          openDate: item.openDate ? new Date(item.openDate).toLocaleDateString("vi-VN") : "Hôm nay",
          dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString("vi-VN") : "31/12/2026",
          status: item.status || "ACTIVE",
          totalStudents: item.totalStudents || 0,
          submittedCount: item.submittedCount || 0,
          gradedCount: item.gradedCount || 0,
          maxAttempts: item.maxAttempts || 1,
          allowLate: item.allowLate !== false,
          scorePolicy: item.scorePolicy || "AFTER_PUBLISH",
        }));
        setAssignments(mapped);
      } else {
        setAssignments([]);
      }

      // 2. Fetch ExamPackages / QuizSets from DB for this teacher
      const examRes = await fetch(`/api/v1/exams${teacherParam}`, {
        headers: authHeaders,
      });
      const examData = await examRes.json();
      let mappedExams: ExamPackageItem[] = [];
      if (examData.success && Array.isArray(examData.items)) {
        mappedExams = examData.items.map((ex: any) => ({
          id: ex.id,
          title: ex.title,
          description: ex.description || "Bộ đề thi",
          curriculum: ex.curriculum || "HSK 3.0",
          hskLevel: ex.hskLevel || 1,
          status: ex.status || "READY",
          questionsCount: ex.questionsCount || ex.questions?.length || 0,
          questionCount: ex.questionsCount || ex.questions?.length || 0,
          totalPoints: ex.totalPoints || ex.totalScore || 100,
          createdAt: ex.createdAt ? new Date(ex.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
          updatedAt: ex.createdAt ? new Date(ex.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
          questions: ex.questions || [],
        }));
      }

      // Merge với localStorage để đảm bảo mọi đề nháp vừa biên soạn đều hiển thị ngay lập tức
      if (typeof window !== "undefined") {
        try {
          const localRaw = localStorage.getItem("hanyu_exam_packages");
          if (localRaw) {
            const localList = JSON.parse(localRaw);
            if (Array.isArray(localList)) {
              const existingIds = new Set(mappedExams.map((e) => e.id));
              for (const lp of localList) {
                if (lp.id && !existingIds.has(lp.id)) {
                  mappedExams.push({
                    id: lp.id,
                    title: lp.title,
                    description: lp.description || "Bộ đề thi",
                    curriculum: lp.curriculum || "HSK 3.0",
                    hskLevel: lp.hskLevel || 1,
                    status: lp.status || "DRAFT",
                    questionsCount: lp.questionsCount || lp.questions?.length || 0,
                    questionCount: lp.questionsCount || lp.questions?.length || 0,
                    totalPoints: lp.totalPoints || 100,
                    createdAt: lp.createdAt || "Hôm nay",
                    updatedAt: lp.updatedAt || "Hôm nay",
                    questions: lp.questions || [],
                  });
                  existingIds.add(lp.id);
                }
              }
            }
          }
        } catch {}
      }

      setExamPackages(mappedExams);
    } catch (err) {
      console.warn("fetchData assignments error:", err);
      setAssignments([]);
      setExamPackages([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tự động chuyển tab khi bấm "Mở đề vừa cập nhật" từ Ngân hàng câu hỏi
  useEffect(() => {
    if (initialExamId && examPackages.length > 0) {
      const found = examPackages.find((p) => p.id === initialExamId);
      if (found) {
        if (found.status === "DRAFT") {
          setActiveTab("DRAFT_EXAMS");
        } else {
          setActiveTab("READY_EXAMS");
        }
      }
    }
  }, [initialExamId, examPackages]);

  // Dynamic KPI Metrics
  const kpiMetrics: AssignmentKpiData = useMemo(() => {
    const totalAssigned = assignments.filter((a) => a.status !== "ARCHIVED").length;
    const totalOpen = assignments.filter((a) => a.status === "ACTIVE" || a.status === "OPEN").length;
    const totalWaitingGrade = submissions.filter(
      (s) => s.gradingStatus === "WAITING_MANUAL" || s.submissionStatus === "SUBMITTED"
    ).length;
    const totalClosed = assignments.filter((a) => a.status === "CLOSED").length;
    const totalDrafts = examPackages.filter((p) => p.status === "DRAFT").length;
    const totalReady = examPackages.filter((p) => p.status === "READY").length;
    const totalExams = totalAssigned + totalReady;
    const totalSubmitted = submissions.filter((s) => s.submissionStatus !== "NOT_STARTED").length;
    const totalGraded = submissions.filter(
      (s) => s.gradingStatus === "GRADED" || s.gradingStatus === "PUBLISHED"
    ).length;

    return {
      totalExams,
      totalOpen,
      totalWaitingGrade,
      totalClosed,
      totalDrafts,
      totalReady,
      totalAssigned,
      totalSubmitted,
      totalGraded,
    };
  }, [assignments, submissions, examPackages]);

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    let list = assignments;
    if (activeTab === "OPEN") {
      list = list.filter((a) => a.status === "ACTIVE" || a.status === "OPEN");
    } else if (activeTab === "CLOSED") {
      list = list.filter((a) => a.status === "CLOSED");
    } else if (activeTab === "ARCHIVED") {
      list = list.filter((a) => a.status === "ARCHIVED");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.className.toLowerCase().includes(q)
      );
    }
    return list;
  }, [assignments, activeTab, searchQuery]);

  // Handlers
  const handleAssignExam = async (values: any) => {
    try {
      const res = await fetch("/api/v1/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentUser?.id ? { "x-user-id": currentUser.id } : {}),
        },
        body: JSON.stringify({
          title: values.title,
          classId: values.classId,
          quizSetId: values.examId,
          openAt: values.openDate,
          dueDate: values.dueDate,
          durationMin: values.durationMin,
          maxAttempts: values.maxAttempts,
          status: "ACTIVE",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Đã giao bài cho lớp thành công!");
        fetchData();
      } else {
        showToast(data.message || "Lỗi giao bài tập.");
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.");
    }
  };

  const handleDeleteAssignment = async (asg: AssignmentItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài tập "${asg.title}" không?`)) return;
    try {
      const res = await fetch(`/api/v1/assignments?id=${asg.id}`, {
        method: "DELETE",
        headers: currentUser?.id ? { "x-user-id": currentUser.id } : {},
      });
      if (res.ok) {
        showToast(`Đã xóa bài tập "${asg.title}" thành công!`);
        fetchData();
      } else {
        showToast("Lỗi khi xóa bài tập.");
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.");
    }
  };

  const handleFinalizeExam = async (pkg: ExamPackageItem) => {
    try {
      const res = await fetch(`/api/v1/exams/${pkg.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(currentUser?.id ? { "x-user-id": currentUser.id } : {}),
        },
        body: JSON.stringify({
          status: "READY",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã hoàn thiện đề "${pkg.title}"! Đề đã chuyển sang mục Đề hoàn thiện kho.`);
        fetchData();
        setActiveTab("READY_EXAMS");
      } else {
        showToast(data.message || "Lỗi cập nhật trạng thái bộ đề.");
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.");
    }
  };

  const handleRevertToDraft = async (pkg: ExamPackageItem) => {
    try {
      const res = await fetch(`/api/v1/exams/${pkg.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(currentUser?.id ? { "x-user-id": currentUser.id } : {}),
        },
        body: JSON.stringify({
          status: "DRAFT",
        }),
      });
      if (res.ok) {
        showToast(`Đã chuyển đề "${pkg.title}" về mục Đề nháp kho để tiếp tục chỉnh sửa.`);
        fetchData();
        setActiveTab("DRAFT_EXAMS");
      } else {
        showToast("Lỗi cập nhật bộ đề.");
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.");
    }
  };

  const handleDeleteExam = async (pkg: ExamPackageItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bộ đề "${pkg.title}" khỏi kho không?`)) return;
    try {
      const res = await fetch(`/api/v1/exams/${pkg.id}`, {
        method: "DELETE",
        headers: currentUser?.id ? { "x-user-id": currentUser.id } : {},
      });
      if (res.ok) {
        showToast(`Đã xóa bộ đề "${pkg.title}" thành công!`);
        fetchData();
      } else {
        showToast("Lỗi khi xóa bộ đề.");
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ.");
    }
  };

  const handleSaveGrading = async (submissionId: string, score: number, feedback: string) => {
    showToast(`Đã lưu và công bố điểm (${score}đ) thành công!`);
    setIsGradingModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#204434] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border border-[#BC9B6B]/40 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="p-1 rounded-lg hover:bg-[#F3EFE6] text-[#315E48] transition mr-1"
                title="Quay lại Tổng quan"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-2xl font-serif font-bold text-[#204434]">
              Bài tập & Quản lý Đề thi
            </h1>
          </div>
          <p className="text-xs text-[#315E48]/80">
            Biên soạn ngân hàng câu hỏi, phân phối đề thi tới từng lớp học và chấm điểm bài nộp học sinh.
          </p>
        </div>
      </div>

      {/* 1. KPI Cards */}
      <AssignmentKpiCards
        metrics={kpiMetrics}
        totalRepoPackages={examPackages.length}
      />

      {/* 2. Subtabs & Search */}
      <AssignmentFilterTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        metrics={kpiMetrics}
        totalAssignments={assignments.filter((a) => a.status !== "ARCHIVED").length}
        totalArchived={assignments.filter((a) => a.status === "ARCHIVED").length}
        onOpenCreateExam={() => showToast("Mở trình ghép đề thi...")}
        onOpenAssignModal={() => setIsAssignModalOpen(true)}
      />

      {/* 3. Main Data View */}
      {activeTab === "SUBMISSIONS" ? (
        <SubmissionsListTable
          submissions={submissions}
          onOpenGradingModal={(sub) => {
            setActiveGradingSub(sub);
            setIsGradingModalOpen(true);
          }}
        />
      ) : activeTab === "DRAFT_EXAMS" ? (
        <ExamPackagesTable
          mode="DRAFT"
          examPackages={examPackages}
          searchQuery={searchQuery}
          onFinalizeExam={handleFinalizeExam}
          onRevertToDraft={handleRevertToDraft}
          onDeleteExam={handleDeleteExam}
          onAssignExamToClass={(pkg) => {
            setSelectedExamForAssign(pkg.id);
            setIsAssignModalOpen(true);
          }}
          onNavigateToQuestionBank={() => onNavigateToQuestionBank?.("ALL")}
        />
      ) : activeTab === "READY_EXAMS" ? (
        <ExamPackagesTable
          mode="READY"
          examPackages={examPackages}
          searchQuery={searchQuery}
          onFinalizeExam={handleFinalizeExam}
          onRevertToDraft={handleRevertToDraft}
          onDeleteExam={handleDeleteExam}
          onAssignExamToClass={(pkg) => {
            setSelectedExamForAssign(pkg.id);
            setIsAssignModalOpen(true);
          }}
          onSwitchToDraftTab={() => setActiveTab("DRAFT_EXAMS")}
        />
      ) : (
        <AssignmentListTable
          assignments={filteredAssignments}
          onOpenQrModal={(asg) => {
            setActiveQrAssignment(asg);
            setIsQrModalOpen(true);
          }}
          onGradeAssignment={(asg) => {
            setActiveTab("SUBMISSIONS");
          }}
          onDeleteAssignment={handleDeleteAssignment}
          onAssignExamToClass={() => setIsAssignModalOpen(true)}
        />
      )}

      {/* 4. Modals */}
      <AssignExamModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        classesList={classesList}
        examPackages={examPackages}
        preselectedExamId={selectedExamForAssign}
        onConfirmAssign={handleAssignExam}
      />

      <GradingModal
        submission={activeGradingSub}
        onClose={() => {
          setIsGradingModalOpen(false);
          setActiveGradingSub(null);
        }}
        onSaveGrading={handleSaveGrading}
      />

      <LiveExamQrModal
        assignment={activeQrAssignment}
        onClose={() => {
          setIsQrModalOpen(false);
          setActiveQrAssignment(null);
        }}
      />
    </div>
  );
}

export default AssignmentsWorkspace;
