"use client";

import { useState, useEffect } from "react";
import {
  X,
  Clock,
  Calendar,
  BookOpen,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  FileText,
  UserCheck,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface StudentAnalyticsModalProps {
  userId: string | null;
  onClose: () => void;
}

export default function StudentAnalyticsModal({
  userId,
  onClose,
}: StudentAnalyticsModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"assignments" | "vocab" | "xp" | "classes">("assignments");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/v1/admin/users/${userId}/analytics`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch((err) => console.error("Lỗi tải chi tiết học viên:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa có";
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  };

  const timeAgo = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa xác định";
    const now = Date.now();
    const past = new Date(dateStr).getTime();
    const diffMin = Math.floor((now - past) / (1000 * 60));
    if (diffMin < 1) return "Vừa truy cập tức thì";
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#204434] to-[#163325] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#9D493E] text-white flex items-center justify-center font-serif text-xl font-bold shadow-md shrink-0">
              {data?.user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.user.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span>{data?.user?.name ? data.user.name.charAt(0).toUpperCase() : "H"}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg sm:text-xl">
                  {data?.user?.name || "Chi tiết học viên"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  HSK {data?.user?.currentHskLevel || 1}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  data?.user?.status === "ACTIVE" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                }`}>
                  {data?.user?.status === "ACTIVE" ? "Hoạt động" : "Tạm khóa"}
                </span>
              </div>
              <div className="text-xs text-emerald-200/80 font-mono mt-0.5">
                @{data?.user?.username} · {data?.user?.email || "Chưa có email"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-16 text-center text-xs text-[#526c50] flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#204434] border-t-transparent rounded-full animate-spin" />
            <span>Đang trích xuất toàn bộ dữ liệu học tập và thời gian truy cập...</span>
          </div>
        ) : !data?.user ? (
          <div className="p-12 text-center text-xs text-red-700">
            Không tìm thấy dữ liệu học viên.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Access Timestamp */}
              <div className="p-3.5 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/30">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Truy cập gần nhất</span>
                </div>
                <div className="text-xs font-bold text-[#204434] truncate">
                  {timeAgo(data.user.updatedAt)}
                </div>
                <div className="text-[10px] text-[#526c50] font-mono mt-0.5">
                  {formatDate(data.user.updatedAt)}
                </div>
              </div>

              {/* Total XP & Streak */}
              <div className="p-3.5 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/30">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wider mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Điểm XP & Streak</span>
                </div>
                <div className="text-xs font-bold text-[#204434] flex items-center gap-2">
                  <span>{data.user.totalXp.toLocaleString()} XP</span>
                  <span className="text-amber-700 flex items-center text-[11px]">
                    🔥 {data.user.streakDays} ngày
                  </span>
                </div>
                <div className="text-[10px] text-[#526c50] mt-0.5">
                  AI hôm nay: {data.user.aiUsageToday}/{data.user.dailyAiQuota} lượt
                </div>
              </div>

              {/* Vocab Mastered */}
              <div className="p-3.5 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/30">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wider mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                  <span>Từ vựng đã học</span>
                </div>
                <div className="text-xs font-bold text-[#204434]">
                  {data.vocabStats.mastered} đã thuộc
                </div>
                <div className="text-[10px] text-[#526c50] mt-0.5">
                  Tổng {data.vocabStats.total} từ ghi nhớ
                </div>
              </div>

              {/* Assignments Done */}
              <div className="p-3.5 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/30">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8F6D3B] uppercase tracking-wider mb-1">
                  <FileText className="w-3.5 h-3.5 text-red-700" />
                  <span>Bài nộp / Đề thi</span>
                </div>
                <div className="text-xs font-bold text-[#204434]">
                  {data.user._count.attempts} lượt hoàn thành
                </div>
                <div className="text-[10px] text-[#526c50] mt-0.5">
                  Đăng ký: {formatDate(data.user.createdAt)}
                </div>
              </div>
            </div>

            {/* Navigation Tabs Inside Modal */}
            <div className="flex items-center gap-2 border-b border-[#BC9B6B]/25 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("assignments")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "assignments"
                    ? "bg-[#204434] text-white shadow-xs"
                    : "text-[#526c50] hover:bg-[#204434]/10"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bài tập & Đề thi ({data.user.attempts?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("vocab")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "vocab"
                    ? "bg-[#204434] text-white shadow-xs"
                    : "text-[#526c50] hover:bg-[#204434]/10"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Từ vựng đã học ({data.vocabStats.total})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("xp")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "xp"
                    ? "bg-[#204434] text-white shadow-xs"
                    : "text-[#526c50] hover:bg-[#204434]/10"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Lịch sử học & Tích lũy XP ({data.user.xpLogs?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("classes")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "classes"
                    ? "bg-[#204434] text-white shadow-xs"
                    : "text-[#526c50] hover:bg-[#204434]/10"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Lớp học ({data.user.enrolledClasses?.length || 0})</span>
              </button>
            </div>

            {/* TAB 1: ASSIGNMENTS & EXAMS */}
            {activeTab === "assignments" && (
              <div className="space-y-3">
                {(!data.user.attempts || data.user.attempts.length === 0) ? (
                  <div className="p-8 rounded-2xl bg-[#F8F5ED] text-center text-xs text-[#526c50]">
                    Học viên chưa nộp bài tập hoặc đề thi nào.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#BC9B6B]/30 overflow-hidden bg-white shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F5ED] text-[#204434] font-bold border-b border-[#BC9B6B]/25 text-[11px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Tên bài tập / Đề thi</th>
                          <th className="py-2.5 px-3">Điểm số</th>
                          <th className="py-2.5 px-3">Thời gian nộp</th>
                          <th className="py-2.5 px-3">Nhận xét của giáo viên</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#BC9B6B]/15 text-[#204434]">
                        {data.user.attempts.map((att: any) => (
                          <tr key={att.id} className="hover:bg-[#F8F5ED]/50 transition">
                            <td className="py-3 px-3 font-semibold">
                              {att.assignment?.title || "Bài luyện tập"}
                              <span className="block text-[10px] text-[#526c50] font-normal">
                                Chế độ: {att.assignment?.mode === "EXAM" ? "Thi bấm giờ" : "Luyện tập"}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-xs">
                                {att.score != null ? `${att.score} đ` : "Chờ chấm"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[#526c50] text-[11px] font-mono">
                              {formatDate(att.submittedAt || att.startedAt)}
                            </td>
                            <td className="py-3 px-3 text-xs italic text-[#526c50] max-w-xs truncate">
                              {att.teacherNote || att.feedback || "Chưa có lời phê"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: VOCABULARY PROGRESS */}
            {activeTab === "vocab" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#526c50]">
                  <span>
                    Đang học: <strong>{data.vocabStats.learning} từ</strong> · Đã thuộc làu:{" "}
                    <strong>{data.vocabStats.mastered} từ</strong>
                  </span>
                  <span className="text-[11px]">Hiển thị 15 từ gần nhất vừa ôn</span>
                </div>

                {(!data.vocabStats.recent || data.vocabStats.recent.length === 0) ? (
                  <div className="p-8 rounded-2xl bg-[#F8F5ED] text-center text-xs text-[#526c50]">
                    Học viên chưa lưu hoặc học từ vựng nào trong kho Flashcard.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {data.vocabStats.recent.map((vp: any) => (
                      <div
                        key={vp.id}
                        className="p-3 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/30 flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="text-lg font-serif font-bold text-[#204434]">
                            {vp.vocabulary?.hanzi}
                          </div>
                          <div className="text-xs text-[#526c50] font-mono">
                            {vp.vocabulary?.pinyin}
                          </div>
                          <div className="text-xs text-[#204434] mt-0.5 line-clamp-1">
                            {vp.vocabulary?.meaningVi}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              vp.leitnerBox >= 4
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {vp.leitnerBox >= 4 ? "Đã thuộc" : "Đang học"}
                          </span>
                          <span className="block text-[10px] text-gray-500 mt-1">
                            Hộp {vp.leitnerBox}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: XP LOGS & TIMELINE */}
            {activeTab === "xp" && (
              <div className="space-y-3">
                {(!data.user.xpLogs || data.user.xpLogs.length === 0) ? (
                  <div className="p-8 rounded-2xl bg-[#F8F5ED] text-center text-xs text-[#526c50]">
                    Chưa có nhật ký tích lũy điểm kinh nghiệm XP.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#BC9B6B]/30 p-3 bg-white space-y-2 max-h-96 overflow-y-auto">
                    {data.user.xpLogs.map((xp: any) => (
                      <div
                        key={xp.id}
                        className="p-2.5 rounded-xl bg-[#F8F5ED]/70 border border-[#BC9B6B]/20 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 font-bold flex items-center justify-center text-xs">
                            ⚡
                          </span>
                          <div>
                            <span className="font-bold text-[#204434]">{xp.reason || "Hoạt động học tập"}</span>
                            <span className="block text-[10px] text-[#526c50] font-mono">
                              {formatDate(xp.createdAt)}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-xs border border-emerald-200">
                          +{xp.amount} XP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ENROLLED CLASSES */}
            {activeTab === "classes" && (
              <div className="space-y-3">
                {(!data.user.enrolledClasses || data.user.enrolledClasses.length === 0) ? (
                  <div className="p-8 rounded-2xl bg-[#F8F5ED] text-center text-xs text-[#526c50]">
                    Học viên chưa tham gia lớp học có giáo viên nào (Hiện đang ở chế độ Tự học tự do).
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.user.enrolledClasses.map((ec: any) => (
                      <div
                        key={ec.id}
                        className="p-4 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/30 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-[#204434]">{ec.class?.name}</h4>
                            <span className="text-[11px] font-mono text-[#526c50]">
                              Trình độ: HSK {ec.class?.level || 1}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                            Đang học
                          </span>
                        </div>
                        <div className="text-xs text-[#204434] pt-2 border-t border-[#BC9B6B]/20">
                          Giáo viên phụ trách: <strong>{ec.class?.teacher?.name || "Cô Ning Ning"}</strong>
                        </div>
                        <div className="text-[10px] text-[#526c50]">
                          Ngày vào lớp: {formatDate(ec.joinedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-[#F8F5ED] border-t border-[#BC9B6B]/25 flex items-center justify-between text-xs shrink-0">
          <span className="text-[#526c50]">
            Hồ sơ học tập nội bộ · Dữ liệu thời gian thực
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#204434] text-white font-bold text-xs hover:bg-[#183629] transition shadow-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
