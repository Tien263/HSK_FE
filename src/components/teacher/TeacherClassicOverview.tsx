"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  BookOpen,
  HelpCircle,
  FileCheck2,
  BarChart3,
  Calendar,
  Settings,
  Search,
  Bell,
  Plus,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  X,
  AlertCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Clock,
  Sparkles,
  Trash2,
  Edit3,
  Filter,
  Download,
  LogOut,
  UserPlus,
  FolderArchive,
  FileText,
  Layers,
  Award,
  Flame,
  ShieldCheck,
  RefreshCw,
  Send,
  Menu,
} from "lucide-react";
import {usePortalData} from "@/components/learning/use-portal-data";
import {hskArtwork} from "@/lib/hsk-theme";
import {addDays,vietnamToday} from "@/lib/schedule-core";
export default function TeacherClassicOverview({currentUser,onNavigate,onClass,onCreateClass,onAssign}:{currentUser:any;onNavigate:(tab:string)=>void;onClass:(id:string)=>void;onCreateClass:()=>void;onAssign:(id?:string)=>void}){
 const report=usePortalData<any>("/api/v1/reports/overview"),classes=usePortalData<any>("/api/v1/classes"),assignments=usePortalData<any>("/api/v1/assignments"),catalog=usePortalData<any>("/api/v1/curriculum");
 const today=vietnamToday(),schedule=usePortalData<any>("/api/v1/schedules?from="+today+"&to="+addDays(today,6));
 const overviewStats=report.data?.data?.summary;
 const classesList:any[]=(classes.data?.items||[]).map((row:any)=>{const stats=report.data?.data?.classProgress.find((item:any)=>item.id===row.id);const source=catalog.data?.levels.find((item:any)=>item.level===row.level);return{...row,artwork:hskArtwork(row.level),studentCount:row.totalStudents,completedLessons:stats?.publishedLessons??0,totalLessons:source?.items.length??0,submissionRate:stats?.progress??null};});
 const visibleClasses=classesList,visibleAssignments:any[]=(assignments.data?.items||[]).filter((row:any)=>!["CLOSED","DRAFT","ARCHIVED"].includes(row.status)).map((row:any)=>({...row,status:row.status==="OPEN"?"ACTIVE":row.status}));
 const assignmentsList=visibleAssignments,dynamicSchedules:any[]=(schedule.data?.items||[]).filter((row:any)=>!row.cancelled).map((row:any)=>({...row,mode:row.meetUrl?"ONLINE":"OFFLINE",location:row.room}));
 const dueAssignments=visibleAssignments.slice(0,5).map(row=>({...row,dueText:new Date(row.dueAt).toLocaleDateString("vi-VN"),submittedText:row.submittedCount+"/"+row.totalStudents+" đã nộp"}));
 const visibleStudentsInNeed:any[]=(report.data?.data?.atRiskStudents||[]).map((row:any)=>({...row,id:row.classId+":"+row.id,reason:row.reasons.join("; ")}));
 const setActiveTab=onNavigate,setSelectedClassId=onClass,setIsCreateClassModalOpen=(open:boolean)=>{if(open)onCreateClass();},setIsLessonModalOpen=(open:boolean)=>{if(open)onNavigate("lessons");},setIsAssignModalOpen=(open:boolean)=>{if(open)onAssign();},setAssignClassId=(id:string)=>onAssign(id),setSelectedAssignmentForView=(_row:any)=>onNavigate("assignments"),setSelectedStudentForSupport=(_row:any)=>onNavigate("reports");
 if(report.error||classes.error||assignments.error)return <p role="alert" className="rounded-2xl border border-red-200 p-5 text-sm text-red-700">{report.error||classes.error||assignments.error}</p>;
 if(!overviewStats)return <p className="p-8 text-center text-sm text-[#6B766D]">Đang tải tổng quan…</p>;
 return (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* --------------------------------------------------------------- */}
              {/* CỘT TRÁI (~70% WIDTH - 8 COLS) */}
              {/* --------------------------------------------------------------- */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. BANNER CHÀO MỪNG (SỬ DỤNG phong_cảnh_thủy_mặc_bên_hồ_sương_sớm.png) */}
                <section
                  className="relative rounded-3xl border border-[#E5DEC9] shadow-xs overflow-hidden min-h-[220px] sm:min-h-[240px] flex items-center bg-[#F8F5ED]"
                  style={{
                    backgroundImage: `url('/theme/dashboard/banner-bg.webp')`,
                    backgroundPosition: "right center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {/* Soft gradient overlay on left for high contrast & readability */}
                  <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-center bg-gradient-to-r from-[#F8F5ED]/95 via-[#F8F5ED]/85 to-transparent sm:max-w-2xl">
                    <div className="text-xs text-[#315E48] font-medium mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Intl.DateTimeFormat("vi-VN",{dateStyle:"full",timeZone:"Asia/Ho_Chi_Minh"}).format(new Date())}</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A3D2F] tracking-tight">
                      Chào mừng trở lại, {currentUser?.name || "thầy/cô"}! 🌱
                    </h1>

                    <p className="text-xs sm:text-sm text-[#315E48] leading-relaxed mt-2 max-w-lg">
                      Hôm nay thầy/cô có{" "}
                      <span className="font-bold text-[#204434]">
                        {overviewStats ? overviewStats.totalClasses : classesList.length} lớp học
                      </span>{" "}
                      và{" "}
                      <span className="font-bold text-[#204434]">
                        {overviewStats ? overviewStats.activeAssignments : 0} bài tập
                      </span>{" "}
                      đang diễn ra. Chúc thầy/cô một ngày giảng dạy tràn đầy năng lượng!
                    </p>

                    {/* 2 Main Action Buttons (Spec Section 5) */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsLessonModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] text-xs font-semibold shadow-md shadow-[#204434]/15 transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tạo bài học mới</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAssignModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 hover:bg-white text-[#204434] text-xs font-semibold border border-[#E5DEC9] shadow-2xs transition cursor-pointer"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>Tạo bài tập</span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* 2. BỐN THẺ THỐNG KÊ NHANH (SPEC SECTION 6) */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {/* Thẻ 1: Lớp đang quản lý */}
                  <div
                    onClick={() => setActiveTab("classes")}
                    className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[11px] text-[#315E48] font-medium block">Lớp đang quản lý</span>
                      <div className="text-2xl font-bold font-serif text-[#204434] mt-1">
                        {overviewStats ? overviewStats.totalClasses : visibleClasses.length}{" "}
                        <span className="text-xs font-normal text-[#315E48]">lớp</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Thẻ 2: Tổng học sinh */}
                  <div
                    onClick={() => {
                      setActiveTab("classes");
                      if (classesList.length > 0) setSelectedClassId(classesList[0].id);
                    }}
                    className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[11px] text-[#315E48] font-medium block">Tổng học sinh</span>
                      <div className="text-2xl font-bold font-serif text-[#204434] mt-1">
                        {overviewStats
                          ? overviewStats.totalStudents
                          : visibleClasses.reduce((acc, c) => acc + c.studentCount, 0)}{" "}
                        <span className="text-xs font-normal text-[#315E48]">học viên</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <UserPlus className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Thẻ 3: Bài tập đang giao */}
                  <div
                    onClick={() => setActiveTab("assignments")}
                    className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[11px] text-[#315E48] font-medium block">Bài tập đang giao</span>
                      <div className="text-2xl font-bold font-serif text-[#204434] mt-1">
                        {overviewStats ? overviewStats.activeAssignments : visibleAssignments.length}{" "}
                        <span className="text-xs font-normal text-[#315E48]">bài</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#BC9B6B]/20 text-[#854d0e] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Thẻ 4: Tỷ lệ hoàn thành */}
                  <div
                    onClick={() => setActiveTab("reports")}
                    className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[11px] text-[#315E48] font-medium block">Tỷ lệ hoàn thành</span>
                      <div className="text-2xl font-bold font-serif text-[#204434] mt-1">
                        {overviewStats.completionRate===null?"—":overviewStats.completionRate+"%"}
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {overviewStats.completionRate===null?"—":overviewStats.completionRate+"%"}
                    </div>
                  </div>
                </section>

                {/* 3. LỚP HỌC CỦA TÔI (3 CARDS VỚI 3 ẢNH THỦY MẶC - SPEC SECTION 7) */}
                <section className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#204434]" />
                      <h3 className="font-bold text-sm text-[#204434]">Lớp học của tôi</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsCreateClassModalOpen(true);
                        }}
                        className="text-xs text-[#204434] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tạo lớp</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("classes")}
                        className="text-xs text-[#315E48] hover:text-[#204434] font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>Xem tất cả ({classesList.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Empty state (Unhappy Case) */}
                  {visibleClasses.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#204434]/10 text-[#204434] flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-[#204434]">Bạn chưa có lớp học nào</h4>
                      <p className="text-xs text-[#315E48] max-w-sm mx-auto">
                        Thầy/Cô chưa có lớp học nào do mình phụ trách. Hãy nhấn nút bên dưới để tạo lớp học đầu tiên nhé!
                      </p>
                      <button
                        onClick={() => {
                          setIsCreateClassModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-semibold shadow-xs hover:bg-[#183629] transition"
                      >
                        Tạo lớp học mới
                      </button>
                    </div>
                  ) : (
                    /* 3 Cards displaying the 3 Chinese Watercolor Artworks */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {visibleClasses.slice(0, 3).map((cl) => (
                        <div
                          key={cl.id}
                          onClick={() => {
                            setSelectedClassId(cl.id);
                            setActiveTab("classes");
                          }}
                          className="p-5 rounded-3xl border border-[#E5DEC9] shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[160px] group hover:border-[#204434]/60 transition cursor-pointer bg-[#FFFCF6]"
                          style={{
                            backgroundImage: `url('${cl.artwork}')`,
                            backgroundPosition: "right bottom",
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
                          {/* Content on the left */}
                          <div className="relative z-10 max-w-[65%] space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-[#204434]/10 text-[#204434] text-[10px] font-bold">
                              {cl.track === "HSK" ? "HSK 3.0" : cl.track === "TOPIC" ? "Theo chủ đề" : "Chuyên ngành"}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-[#204434] leading-tight group-hover:text-[#183629] transition">
                              {cl.name}
                            </h4>
                            <p className="text-[11px] text-[#315E48]">
                              {cl.studentCount} học viên · {cl.completedLessons}/{cl.totalLessons} bài học
                            </p>
                          </div>

                          {/* Bottom info */}
                          <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-[#315E48] font-medium">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-[#315E48]">Tỷ lệ nộp bài:</span>
                              <span className="font-bold text-[#204434] text-xs">{cl.submissionRate===null?"—":cl.submissionRate+"%"}</span>
                            </div>
                            <span className="text-xs font-semibold text-[#204434] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              Vào lớp <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* 4. BẢNG BÀI TẬP GẦN ĐÂY (SPEC SECTION 8) */}
                <section className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-[#204434]" />
                      <h3 className="font-bold text-sm text-[#204434]">Bài tập gần đây</h3>
                    </div>
                    <button
                      onClick={() => {
                        setIsAssignModalOpen(true);
                      }}
                      className="text-xs text-[#204434] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Giao bài tập</span>
                    </button>
                  </div>

                  {visibleAssignments.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] text-center space-y-2">
                      <FileCheck2 className="w-8 h-8 text-[#315E48] mx-auto opacity-60" />
                      <p className="text-xs text-[#315E48]">Hiện chưa có bài tập nào đang diễn ra.</p>
                    </div>
                  ) : (
                    <div className="rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[#E5DEC9] bg-[#F8F5ED]/60 text-[#315E48] font-semibold text-[11px]">
                              <th className="py-3 px-4">Tên bài tập</th>
                              <th className="py-3 px-4">Lớp tiếp nhận</th>
                              <th className="py-3 px-4">Đã nộp</th>
                              <th className="py-3 px-4">Hạn nộp</th>
                              <th className="py-3 px-4">Trạng thái</th>
                              <th className="py-3 px-4 text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5DEC9]/50">
                            {visibleAssignments.map((a) => (
                              <tr key={a.id} className="hover:bg-[#F8F5ED]/40 transition">
                                <td className="py-3.5 px-4 font-bold text-[#204434]">{a.title}</td>
                                <td className="py-3.5 px-4 text-[#315E48]">{a.className}</td>
                                <td className="py-3.5 px-4">
                                  <span className="font-bold text-[#204434]">
                                    {a.submittedCount}/{a.totalStudents}
                                  </span>
                                  <span className="text-[10px] text-[#315E48] ml-1">
                                    ({Math.round((a.submittedCount / a.totalStudents) * 100)}%)
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-[#315E48]">{new Date(a.dueAt).toLocaleString("vi-VN")}</td>
                                <td className="py-3.5 px-4">
                                  {a.status === "ACTIVE" && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      Đang diễn ra
                                    </span>
                                  )}
                                  {a.status === "EXPIRING_SOON" && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                      Sắp hết hạn
                                    </span>
                                  )}
                                  {a.status === "CLOSED" && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                                      Đã đóng
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    onClick={() => setSelectedAssignmentForView(a)}
                                    className="px-3 py-1.5 rounded-xl bg-[#204434]/10 hover:bg-[#204434] text-[#204434] hover:text-white font-semibold text-xs transition cursor-pointer"
                                  >
                                    Xem kết quả
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* --------------------------------------------------------------- */}
              {/* CỘT PHẢI (~30% WIDTH - 4 COLS - SPEC SEC 9, 10, 11) */}
              {/* --------------------------------------------------------------- */}
              <div className="lg:col-span-4 space-y-6">
                {/* 1. LỊCH DẠY HÔM NAY (SPEC SECTION 9) */}
                <section className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#204434]" />
                      <h3 className="font-bold text-sm text-[#204434]">Lịch dạy hôm nay</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className="text-xs text-[#315E48] hover:text-[#204434] font-medium"
                    >
                      Xem lịch
                    </button>
                  </div>

                  {(() => {
                    const todayStr = vietnamToday();
                    const todayEvents = dynamicSchedules.filter((s) => s.date === todayStr);

                    if (todayEvents.length === 0) {
                      return (
                        <div className="py-6 text-center space-y-2.5">
                          <Calendar className="w-8 h-8 text-[#315E48]/50 mx-auto" />
                          <p className="text-xs text-[#315E48]">Hôm nay chưa có lịch dạy. Thư giãn hoặc chuẩn bị giáo án nhé! 🌱</p>
                          <button
                            onClick={() => setActiveTab("schedule")}
                            className="px-3 py-1.5 rounded-xl bg-[#204434] text-white text-[11px] font-semibold hover:bg-[#183629] transition cursor-pointer"
                          >
                            + Xem & Lên lịch Apple Calendar
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {todayEvents.map((s) => (
                          <div
                            key={s.id}
                            className="p-3 rounded-2xl bg-[#F8F5ED] border border-[#E5DEC9]/70 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-[10px] text-[#315E48] font-semibold">
                                <span>{s.startTime} - {s.endTime}</span>
                                <span className="w-1 h-1 rounded-full bg-[#BC9B6B]" />
                                <span className={s.mode === "ONLINE" ? "text-emerald-700" : "text-amber-700"}>
                                  {s.mode}
                                </span>
                              </div>
                              <h4 className="font-bold text-xs text-[#204434] truncate mt-0.5">{s.className}</h4>
                              <p className="text-[10px] text-[#8ea394] truncate">{s.location}</p>
                            </div>

                            {s.mode === "ONLINE" ? (
                              <a
                                href={s.meetUrl || "https://meet.google.com/new"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition bg-[#204434] hover:bg-[#183629] text-white shadow-2xs"
                              >
                                Vào lớp
                              </a>
                            ) : (
                              <button
                                onClick={() => setActiveTab("schedule")}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#204434] hover:text-white"
                              >
                                Chi tiết
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </section>

                {/* 2. BÀI TẬP SẮP ĐẾN HẠN (SPEC SECTION 10) */}
                <section className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#BC9B6B]" />
                      <h3 className="font-bold text-sm text-[#204434]">Bài tập sắp đến hạn</h3>
                    </div>
                    <span className="text-xs text-[#315E48] font-medium">{dueAssignments.length} bài</span>
                  </div>

                  <div className="space-y-2.5">
                    {dueAssignments.map((da) => (
                      <div
                        key={da.id}
                        onClick={() => {
                          const target = assignmentsList.find((a) => a.id === da.id);
                          if (target) setSelectedAssignmentForView(target);
                        }}
                        className="p-3 rounded-2xl bg-[#F8F5ED] border border-[#E5DEC9]/70 hover:border-[#204434] transition cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-[#204434] truncate max-w-[200px]">
                            {da.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              da.urgency === "warning"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {da.dueText}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#315E48]">
                          <span>{da.className}</span>
                          <span className="font-semibold text-[#204434]">{da.submittedText}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. HỌC SINH CẦN HỖ TRỢ (SPEC SECTION 11) */}
                <section className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]/60">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#9D493E]" />
                      <h3 className="font-bold text-sm text-[#204434]">Học sinh cần hỗ trợ</h3>
                    </div>
                    <span className="text-[10px] text-[#9D493E] bg-[#9D493E]/10 px-2 py-0.5 rounded-full font-bold">
                      {visibleStudentsInNeed.length} học viên
                    </span>
                  </div>

                  {visibleStudentsInNeed.length === 0 ? (
                    <div className="py-6 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="text-xs text-[#315E48]">Chưa ghi nhận học sinh có bài quá hạn hoặc điểm dưới ngưỡng đã thiết lập.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleStudentsInNeed.map((st) => (
                        <div
                          key={st.id}
                          className="p-3 rounded-2xl bg-[#F8F5ED] border border-[#E5DEC9]/70 flex items-center justify-between gap-2.5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-[#BC9B6B]/40 relative shrink-0">
                              <Image
                                src={st.avatar}
                                alt={st.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 leading-tight">
                              <span className="font-bold text-xs text-[#204434] block truncate">{st.name}</span>
                              <span className="text-[10px] text-[#9D493E] font-medium block truncate mt-0.5">
                                {st.reason}
                              </span>
                              <span className="text-[9px] text-[#8ea394] block truncate">{st.className}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedStudentForSupport(st);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#204434] text-[#204434] hover:text-white border border-[#E5DEC9] text-xs font-semibold shrink-0 transition cursor-pointer shadow-2xs"
                          >
                            Xem
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>);
}
