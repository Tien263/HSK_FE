"use client";

import ExamComposer from "./ExamComposer";
import {portalFetch} from "@/components/learning/use-portal-data";
import React, { useState, useEffect, useMemo, useCallback,useRef } from "react";
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

  const [composing,setComposing]=useState(false);
  // Fetch Assignments & Submissions
  const fetchData = useCallback(async()=>{setLoading(true);try{const [assigned,exams,attempts]=await Promise.all([portalFetch<any>("/api/v1/assignments"),portalFetch<any>("/api/v1/exams"),portalFetch<any>("/api/v1/attempts")]);setAssignments(assigned.items.map((row:any)=>({...row,examId:row.quizSetId,openDate:row.openAt?new Date(row.openAt).toLocaleString("vi-VN"):"—",dueDate:new Date(row.dueAt).toLocaleString("vi-VN"),gradedCount:attempts.items.filter((attempt:any)=>attempt.assignmentId===row.id&&attempt.status==="GRADED").length,scorePolicy:"AFTER_SUBMIT",allowLate:row.latePolicy==="ALLOW"})));setExamPackages(exams.items.filter((row:any)=>row.canEdit).map((row:any)=>({...row,questionsCount:row.questions.length,questionCount:row.questions.length,totalPoints:row.totalScore,createdAt:new Date(row.createdAt).toLocaleString("vi-VN"),updatedAt:row.updatedAt?new Date(row.updatedAt).toLocaleString("vi-VN"):"—"})));setSubmissions(attempts.items.map((row:any)=>({...row,submittedAt:row.submittedAt||null,submissionStatus:row.status==="IN_PROGRESS"?"NOT_STARTED":"SUBMITTED",gradingStatus:row.status==="GRADED"?"GRADED":"WAITING_MANUAL",gradingStatusText:row.status==="GRADED"?"Đã chấm":"Chờ chấm",attemptNumber:row.attemptNumber,answers:Object.fromEntries(row.answers.map((answer:any)=>[answer.questionId,answer.userAnswer])),answerDetails:row.answers})));}catch(error){showToast((error as Error).message);}finally{setLoading(false);}},[currentUser?.id]);

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

  const handledPayload=useRef<any>(null);
  useEffect(()=>{const payload=initialNewAssignmentPayload;if(!payload||handledPayload.current===payload)return;handledPayload.current=payload;if(payload.lessonTitle||payload.vocabList?.length||payload.reading){setComposing(true);}else if(payload.classId)setIsAssignModalOpen(true);},[initialNewAssignmentPayload]);
  // Dynamic KPI Metrics
  const kpiMetrics: AssignmentKpiData = useMemo(() => {
    const totalAssigned = assignments.filter((a) => a.status !== "ARCHIVED").length;
    const totalOpen = assignments.filter((a) => a.status === "ACTIVE" || a.status === "OPEN").length;
    const totalWaitingGrade = submissions.filter(
      (s) => s.gradingStatus === "WAITING_MANUAL" && s.submissionStatus === "SUBMITTED"
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
  const handleAssignExam = async(values:any)=>{try{await portalFetch("/api/v1/assignments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:values.title,classId:values.classId,quizSetId:values.examId,openAt:values.openDate,dueAt:values.dueDate,durationMin:values.durationMin,maxAttempts:values.maxAttempts})});setIsAssignModalOpen(false);await fetchData();showToast("Đã giao bài và lưu database.");}catch(error){showToast((error as Error).message);throw error;}};

  const handleDeleteAssignment = async(asg:AssignmentItem)=>{if(!confirm("Xóa bài tập chưa có lượt làm?"))return;try{await portalFetch("/api/v1/assignments?id="+asg.id,{method:"DELETE"});await fetchData();showToast("Đã xóa bài tập.");}catch(error){showToast((error as Error).message);}};

  const handleFinalizeExam = async(pkg:ExamPackageItem)=>{try{await portalFetch("/api/v1/exams/"+pkg.id,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...pkg,totalScore:pkg.totalPoints,status:"READY"})});await fetchData();showToast("Đã chuyển bộ đề sang hoàn thiện.");}catch(error){showToast((error as Error).message);}};

  const handleRevertToDraft = async(pkg:ExamPackageItem)=>{try{await portalFetch("/api/v1/exams/"+pkg.id,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...pkg,totalScore:pkg.totalPoints,status:"DRAFT"})});await fetchData();showToast("Đã chuyển bộ đề về bản nháp.");}catch(error){showToast((error as Error).message);}};

  const handleDeleteExam = async(pkg:ExamPackageItem)=>{if(!confirm("Xóa bộ đề chưa sử dụng?"))return;try{await portalFetch("/api/v1/exams/"+pkg.id,{method:"DELETE"});await fetchData();showToast("Đã xóa bộ đề.");}catch(error){showToast((error as Error).message);}};

  const handleSaveGrading = async(id:string,score:number,feedback:string,answers?:{questionId:string;score:number}[])=>{try{await portalFetch("/api/v1/attempts/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({answers,teacherNote:feedback})});await fetchData();setIsGradingModalOpen(false);showToast("Đã lưu điểm và nhận xét vào database.");}catch(error){showToast((error as Error).message);throw error;}};

  if(composing)return <ExamComposer source={initialNewAssignmentPayload} onClose={()=>setComposing(false)} onSaved={()=>void fetchData()} onBank={()=>onNavigateToQuestionBank?.("READY")}/>;
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
        onOpenCreateExam={() => setComposing(true)}
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
        preselectedClassId={initialNewAssignmentPayload?.classId}
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
