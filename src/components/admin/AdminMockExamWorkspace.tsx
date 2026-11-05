"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  FileCheck2,
  ExternalLink,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Volume2,
  ShieldAlert,
  Headphones,
  BookOpen,
  PlusCircle,
  GraduationCap,
  Layers,
  ChevronRight,
  Eye,
} from "lucide-react";

interface ExamItem {
  id: string;
  title: string;
  description: string | null;
  hskLevel: number;
  status: string;
  mode: string;
  totalScore: number;
  createdAt: string;
  totalQuestions: number;
  listeningCount: number;
  readingCount: number;
  writingCount: number;
  sampleAudio: string;
  durationMin: number;
  passScore: number;
  approved: boolean;
  proctorEnabled?: boolean;
}

interface AttemptItem {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  paperTitle: string;
  level: number;
  status: string;
  score: number | null;
  maxScore: number;
  startedAt: string;
  submittedAt: string | null;
  timedOut: boolean;
}

export default function AdminMockExamWorkspace({
  onSwitchToProctor,
}: {
  onSwitchToProctor?: () => void;
}) {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<AttemptItem[]>([]);
  const [stats, setStats] = useState({ totalExams: 0, totalAttempts: 0, levelsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Audio preview state
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/mock-exams", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setExams(data.exams || []);
        setRecentAttempts(data.recentAttempts || []);
        setStats(data.stats || { totalExams: 0, totalAttempts: 0, levelsCount: 0 });
      } else {
        setMessage({ text: data.message || "Không thể tải danh sách đề thi", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi kết nối máy chủ", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleSeedHsk1 = async () => {
    try {
      setSeeding(true);
      setMessage(null);
      const res = await fetch("/api/v1/admin/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seedHsk1" }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        await fetchExams();
      } else {
        setMessage({ text: data.message || "Không thể nạp đề HSK 1", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi trong quá trình nạp đề", type: "error" });
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteExam = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đề thi: "${title}" không?`)) return;
    try {
      const res = await fetch("/api/v1/admin/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteExam", id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        await fetchExams();
      } else {
        setMessage({ text: data.message || "Không thể xóa đề thi", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi khi xóa đề thi", type: "error" });
    }
  };

  const handleToggleProctor = async (examId: string, currentVal: boolean) => {
    try {
      const res = await fetch("/api/v1/admin/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleProctor", id: examId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        setExams((prev) =>
          prev.map((e) => (e.id === examId ? { ...e, proctorEnabled: !currentVal } : e))
        );
      } else {
        setMessage({ text: data.message || "Không thể đổi trạng thái giám thị AI", type: "error" });
      }
    } catch {
      setMessage({ text: "Lỗi kết nối máy chủ", type: "error" });
    }
  };

  const toggleAudio = (audioUrl: string) => {
    if (playingAudio === audioUrl) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setPlayingAudio(null);
      audio.play().catch(() => {});
      setPlayingAudio(audioUrl);
    }
  };

  const hskLevels = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {message && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-2xl border shadow-sm ${
            message.type === "success"
              ? "bg-[#204434]/10 border-[#204434]/30 text-[#163325]"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            {message.type === "success" ? (
              <CheckCircle2 size={16} className="text-[#204434]" />
            ) : (
              <AlertCircle size={16} className="text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 1. HERO BANNER: KẾT NỐI TRỰC TIẾP VÀO PHÒNG THI */}
      <div className="relative overflow-hidden rounded-3xl border border-[#BC9B6B]/40 bg-gradient-to-br from-[#163325] via-[#204434] to-[#2B543F] text-[#FAF7F0] p-6 sm:p-8 shadow-md">
        <div
          className="absolute right-0 top-0 w-96 h-full opacity-15 pointer-events-none bg-cover bg-right"
          style={{ backgroundImage: `url('/theme/exam-bamboo-depth.png')` }}
        />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FAF7F0]/15 px-3 py-1 text-[11px] font-semibold text-[#E5D7B7] backdrop-blur-md border border-[#FAF7F0]/20">
            <FileCheck2 size={14} className="text-[#BC9B6B]" />
            <span>Trung tâm Khảo thí & Phòng thi Thử HSK (CTI Hanban Standard)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#FFFDF9]">
            Phòng thi HSK & Khảo thí Trực tuyến
          </h2>

          <p className="text-xs sm:text-sm text-[#FAF7F0]/85 leading-relaxed">
            Kết nối trực tiếp vào giao diện phòng thi của thí sinh, kiểm tra âm thanh gốc, hình ảnh minh họa CTI, quản lý ngân hàng câu hỏi đề thi và giám sát AI chống gian lận.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            {/* Direct Link to Exam Center */}
            <Link
              href="/s/mock-exam"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FAF7F0] px-5 py-3 text-xs sm:text-sm font-bold text-[#163325] shadow-lg hover:bg-[#FFFDF9] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              <ExternalLink size={16} className="text-[#BC9B6B]" />
              <span>Vào Phòng Thi HSK (Giao diện Thí sinh)</span>
            </Link>

            {/* Quick Test HSK 1 */}
            <Link
              href="/s/mock-exam?view=overview&level=1"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#BC9B6B] px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#A88857] transition cursor-pointer"
            >
              <GraduationCap size={16} />
              <span>Làm thử ngay Đề HSK 1 CTI</span>
            </Link>

            {/* AI Proctor Switch */}
            {onSwitchToProctor && (
              <button
                type="button"
                onClick={onSwitchToProctor}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#FAF7F0]/10 border border-[#FAF7F0]/25 px-4 py-3 text-xs sm:text-sm font-semibold text-[#FAF7F0] hover:bg-[#FAF7F0]/20 transition cursor-pointer"
              >
                <ShieldAlert size={16} className="text-amber-300" />
                <span>Giám sát AI Live</span>
              </button>
            )}

            {/* Re-seed Official HSK 1 */}
            <button
              type="button"
              onClick={handleSeedHsk1}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FAF7F0]/10 border border-[#FAF7F0]/25 px-4 py-3 text-xs sm:text-sm font-semibold text-[#FAF7F0] hover:bg-[#FAF7F0]/20 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={15} className={seeding ? "animate-spin" : ""} />
              <span>{seeding ? "Đang nạp dữ liệu..." : "Nạp lại Đề HSK 1 Chuẩn CTI"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#FFFDF9] border border-[#BC9B6B]/30 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#526c50] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Đề thi trong CSDL</span>
            <FileCheck2 size={16} className="text-[#BC9B6B]" />
          </div>
          <p className="text-2xl font-bold font-serif text-[#163325]">{stats.totalExams}</p>
          <span className="text-[10px] text-[#526c50]">Bao gồm các đề chính thức CTI</span>
        </div>

        <div className="bg-[#FFFDF9] border border-[#BC9B6B]/30 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#526c50] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cấp độ sẵn sàng</span>
            <Layers size={16} className="text-[#BC9B6B]" />
          </div>
          <p className="text-2xl font-bold font-serif text-[#163325]">{stats.levelsCount} / 7</p>
          <span className="text-[10px] text-[#526c50]">HSK 1 đến HSK 7-9</span>
        </div>

        <div className="bg-[#FFFDF9] border border-[#BC9B6B]/30 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#526c50] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lượt thi học viên</span>
            <GraduationCap size={16} className="text-[#BC9B6B]" />
          </div>
          <p className="text-2xl font-bold font-serif text-[#163325]">{stats.totalAttempts}</p>
          <span className="text-[10px] text-[#526c50]">Ghi nhận qua Audit Log</span>
        </div>

        <div className="bg-[#FFFDF9] border border-[#BC9B6B]/30 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#526c50] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Giám thị AI</span>
            <ShieldAlert size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-emerald-700">HOẠT ĐỘNG</p>
          <span className="text-[10px] text-[#526c50]">Âm thanh 70dB & Camera</span>
        </div>
      </div>

      {/* 3. DANH SÁCH ĐỀ THI THEO CẤP ĐỘ HSK (HSK 1 ĐẾN HSK 7-9) */}
      <div className="bg-[#FFFDF9] border border-[#BC9B6B]/30 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#BC9B6B]/20 pb-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-[#163325] flex items-center gap-2">
              <BookOpen size={18} className="text-[#BC9B6B]" />
              <span>Danh mục Đề thi Khảo thí HSK</span>
            </h3>
            <p className="text-xs text-[#526c50] mt-0.5">
              Đề thi chính thức với đầy đủ bản quyền audio và hình ảnh bài thi từ CTI Hanban
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchExams}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl border border-[#BC9B6B]/30 bg-white hover:bg-[#FAF7F0] text-xs font-semibold text-[#163325] flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Làm mới</span>
            </button>

            <Link
              href="/s/mock-exam"
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-[#204434] hover:bg-[#163325] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Xem trang thí sinh</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        {/* Cấp độ HSK Cards */}
        <div className="space-y-4">
          {hskLevels.map((lvl) => {
            const levelExams = exams.filter((e) => (lvl === 7 ? e.hskLevel >= 7 : e.hskLevel === lvl));
            const hasExam = levelExams.length > 0;
            const primaryExam = levelExams[0];
            const audioSrc = `/audio/hsk${lvl <= 6 ? lvl : 7}_exam.mp3`;
            const isAudioPlaying = playingAudio === audioSrc;

            return (
              <div
                key={lvl}
                className={`rounded-2xl border transition-all p-4 sm:p-5 ${
                  hasExam
                    ? "bg-white border-[#BC9B6B]/40 shadow-xs"
                    : "bg-[#FAF7F0]/40 border-[#D7C9AB]/30 opacity-75"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-lg bg-[#204434] text-white px-2.5 py-0.5 text-xs font-bold font-serif">
                        HSK {lvl === 7 ? "7 - 9" : lvl}
                      </span>

                      {hasExam ? (
                        <>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                            ✓ SẴN SÀNG THI
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                              primaryExam.proctorEnabled !== false
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-gray-100 text-gray-600 border-gray-300"
                            }`}
                          >
                            {primaryExam.proctorEnabled !== false ? "🛡️ AI: BẬT" : "🛡️ AI: TẮT"}
                          </span>
                          <span className="text-xs font-semibold text-[#163325]">
                            {primaryExam.title}
                          </span>
                        </>
                      ) : (
                        <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold">
                          Chưa có đề
                        </span>
                      )}
                    </div>

                    {hasExam ? (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#526c50]">
                        <span className="flex items-center gap-1">
                          <FileCheck2 size={13} className="text-[#BC9B6B]" />
                          <strong>{primaryExam.totalQuestions}</strong> câu hỏi (
                          {primaryExam.listeningCount} Nghe + {primaryExam.readingCount} Đọc
                          {primaryExam.writingCount > 0 ? ` + ${primaryExam.writingCount} Viết` : ""})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-[#BC9B6B]" />
                          {primaryExam.durationMin} phút
                        </span>
                        <span>•</span>
                        <span>Thang điểm: <strong>{primaryExam.totalScore}</strong> (Đạt ≥ {primaryExam.passScore})</span>
                      </div>
                    ) : (
                      <p className="text-xs text-[#7B8B77]">
                        Cần nạp đề mẫu hoặc tải tài liệu đề thi cho cấp HSK {lvl === 7 ? "7-9" : lvl}.
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Audio Preview Button */}
                    <button
                      type="button"
                      onClick={() => toggleAudio(audioSrc)}
                      title="Nghe thử file âm thanh phần Nghe của cấp độ này"
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        isAudioPlaying
                          ? "bg-amber-100 border-amber-400 text-amber-900"
                          : "bg-[#FAF7F0] border-[#BC9B6B]/30 hover:bg-[#BC9B6B]/15 text-[#204434]"
                      }`}
                    >
                      {isAudioPlaying ? (
                        <>
                          <Pause size={13} className="text-amber-700" />
                          <span>Dừng Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={13} className="text-[#BC9B6B]" />
                          <span>Nghe Audio CTI</span>
                        </>
                      )}
                    </button>

                    {hasExam ? (
                      <>
                        {/* Toggle AI Proctor */}
                        <button
                          type="button"
                          onClick={() => handleToggleProctor(primaryExam.id, primaryExam.proctorEnabled !== false)}
                          title={
                            primaryExam.proctorEnabled !== false
                              ? "Bấm để TẮT Giám thị AI (Camera & Micro) cho đề này"
                              : "Bấm để BẬT Giám thị AI (Camera & Micro) cho đề này"
                          }
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                            primaryExam.proctorEnabled !== false
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                              : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <ShieldAlert
                            size={14}
                            className={primaryExam.proctorEnabled !== false ? "text-emerald-600" : "text-gray-400"}
                          />
                          <span>{primaryExam.proctorEnabled !== false ? "AI: BẬT" : "AI: TẮT"}</span>
                        </button>

                        {/* Go to Exam */}
                        <Link
                          href={`/s/mock-exam?view=overview&id=${primaryExam.id}&level=${primaryExam.hskLevel}`}
                          target="_blank"
                          className="px-3.5 py-1.5 rounded-xl bg-[#204434] hover:bg-[#163325] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Vào thi thử</span>
                        </Link>

                        {/* Delete Exam */}
                        <button
                          type="button"
                          onClick={() => handleDeleteExam(primaryExam.id, primaryExam.title)}
                          title="Xóa đề thi này"
                          className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      lvl === 1 && (
                        <button
                          type="button"
                          onClick={handleSeedHsk1}
                          disabled={seeding}
                          className="px-3 py-1.5 rounded-xl bg-[#BC9B6B] hover:bg-[#A88857] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <PlusCircle size={13} />
                          <span>Nạp đề chuẩn CTI</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. LỊCH SỬ THI & GIÁM SÁT VI PHẠM GẦN NHẤT */}
      <div className="bg-[#FFFDF9] border border-[#BC9B6B]/30 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-serif text-[#163325] flex items-center gap-2">
              <GraduationCap size={18} className="text-[#BC9B6B]" />
              <span>Lịch sử Thí sinh Thi thử Gần đây</span>
            </h3>
            <p className="text-xs text-[#526c50] mt-0.5">
              Theo dõi kết quả điểm thi và nhật ký phòng thi của học viên
            </p>
          </div>
          <span className="text-xs font-bold text-[#8F6D3B]">
            {recentAttempts.length} lượt thi gần nhất
          </span>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#7B8B77]">
            Chưa có lượt thi thử nào được ghi nhận. Học viên có thể vào phòng thi tại{" "}
            <Link href="/s/mock-exam" target="_blank" className="text-[#204434] font-bold underline">
              /s/mock-exam
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#BC9B6B]/20">
            <table className="w-full text-left text-xs text-[#163325]">
              <thead className="bg-[#FAF7F0] text-[#526c50] uppercase text-[10px] font-bold border-b border-[#BC9B6B]/20">
                <tr>
                  <th className="p-3">Học viên</th>
                  <th className="p-3">Đề thi</th>
                  <th className="p-3 text-center">Cấp độ</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-center">Điểm số</th>
                  <th className="p-3 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BC9B6B]/15">
                {recentAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-[#FAF7F0]/50 transition">
                    <td className="p-3 font-semibold">
                      <div>{att.userName}</div>
                      {att.userEmail && (
                        <div className="text-[10px] text-[#7B8B77]">{att.userEmail}</div>
                      )}
                    </td>
                    <td className="p-3 max-w-xs truncate">{att.paperTitle}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-[#204434] text-white text-[10px] font-bold">
                        HSK {att.level}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {att.status === "GRADED" ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Đã chấm
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                          Đang làm
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-bold">
                      {att.score !== null ? (
                        <span
                          className={
                            att.score >= (att.level <= 2 ? 120 : 180)
                              ? "text-emerald-700"
                              : "text-red-700"
                          }
                        >
                          {att.score} / {att.maxScore}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 text-right text-[11px] text-[#7B8B77]">
                      {new Date(att.startedAt).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
