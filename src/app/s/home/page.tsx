"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Award,
  BookOpen,
  FileCheck2,
  AlertTriangle,
  Gamepad2,
  ArrowRight,
  LogOut,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface SummaryData {
  student: {
    id: string;
    name: string;
    username: string;
    currentHskLevel: number;
    totalXp: number;
    streakDays: number;
  };
  counts: {
    pendingAssignments: number;
    dueVocabs: number;
    wrongQuestions: number;
  };
  assignments: Array<{
    id: string;
    title: string;
    className: string;
    durationMin: number;
    dueAt: string;
    totalQuestions: number;
    hasAttempted: boolean;
    latestScore: number | null;
  }>;
}

export default function StudentHomePage() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/my/summary?username=student")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleStartAssignment = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/v1/assignments/${assignmentId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "student" }),
      });
      const result = await res.json();
      if (result.success && result.attemptId) {
        router.push(`/s/attempts/${result.attemptId}`);
      } else {
        alert("Lỗi bắt đầu làm bài: " + (result.message || "Vui lòng thử lại"));
      }
    } catch {
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061609] text-white flex items-center justify-center text-sm font-medium">
        Đang nạp không gian học tập của em...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061609] text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-[#234a29]/80 bg-[#0a2012]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/s/home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/20 bg-[#0d2816] flex items-center justify-center text-[#c3dc4e] font-black text-xl shadow-md">
              宁
            </div>
            <div>
              <span className="font-bold text-white text-sm block">宁宁老师中文课堂</span>
              <span className="text-[11px] text-[#9cb396] block">Phòng học của em</span>
            </div>
          </Link>

          {/* Student Status Bar */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Streak */}
            <div className="flex items-center gap-1.5 bg-[#14331e] border border-[#2d5c39] px-3 py-1.5 rounded-full text-xs font-bold text-orange-400">
              <Flame className="w-4 h-4 fill-orange-400 text-orange-400" />
              <span>{data?.student.streakDays || 4} ngày</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5 bg-[#14331e] border border-[#2d5c39] px-3 py-1.5 rounded-full text-xs font-bold text-[#c3dc4e]">
              <Award className="w-4 h-4 text-[#c3dc4e]" />
              <span>{data?.student.totalXp || 180} XP</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-xs text-[#9cb396] hover:text-white transition flex items-center gap-1 cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Student Container */}
      <main className="max-w-6xl mx-auto px-6 py-8 w-full flex-1 space-y-8">
        {/* Welcome Student Greeting */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0d2816] via-[#0a2012] to-[#07190c] border border-[#234a29] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c3dc4e]/10 border border-[#c3dc4e]/30 text-xs font-semibold text-[#c3dc4e] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Học sinh HSK {data?.student.currentHskLevel || 1} · Lớp HSK 1A cô Ning Ning</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Chào em, {data?.student.name || "Minh Khang"}! 👋
            </h1>
            <p className="text-sm text-[#9cb396] max-w-lg">
              Hôm nay hãy hoàn thành bài tập cô giao và ôn 5 từ vựng để duy trì chuỗi học tập nhé!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/s/review"
              className="px-5 py-3 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-xs hover:bg-[#b3cb40] transition shadow-lg flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>Ôn từ vựng hôm nay</span>
            </Link>
          </div>
        </div>

        {/* 3 Quick Action Cards: Ôn từ Leitner, Luyện câu sai, Game Center */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Từ vựng Leitner */}
          <Link
            href="/s/review"
            className="p-5 rounded-2xl bg-[#0a2012] border border-[#234a29] hover:border-[#c3dc4e]/60 transition group flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#14331e] text-[#c3dc4e] flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-bold text-base text-white mb-1">Ôn từ vựng hằng ngày</h3>
              <p className="text-xs text-[#9cb396]">
                Phương pháp lặp lại ngắt quãng Leitner 5 hộp.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1b3d24] flex items-center justify-between text-xs">
              <span className="font-bold text-[#c3dc4e]">
                {data?.counts.dueVocabs || 5} từ đến hạn ôn
              </span>
              <ArrowRight className="w-4 h-4 text-[#9cb396] group-hover:text-[#c3dc4e] group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: Luyện lại câu sai */}
          <Link
            href="/s/practice/wrong"
            className="p-5 rounded-2xl bg-[#0a2012] border border-[#234a29] hover:border-orange-500/60 transition group flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-950/60 text-orange-400 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-bold text-base text-white mb-1">Luyện lại câu sai</h3>
              <p className="text-xs text-[#9cb396]">
                Hệ thống gom riêng các câu em làm sai để ôn cho chắc.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1b3d24] flex items-center justify-between text-xs">
              <span className="font-bold text-orange-400">
                {data?.counts.wrongQuestions || 1} câu cần khắc phục
              </span>
              <ArrowRight className="w-4 h-4 text-[#9cb396] group-hover:text-orange-400 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 3: Game Center */}
          <Link
            href="/s/games"
            className="p-5 rounded-2xl bg-[#0a2012] border border-[#234a29] hover:border-purple-500/60 transition group flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 text-purple-400 flex items-center justify-center mb-3">
                <Gamepad2 className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-bold text-base text-white mb-1">Game Center</h3>
              <p className="text-xs text-[#9cb396]">
                Ghép chữ Hán - pinyin, thi đua leo bảng xếp hạng lớp.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1b3d24] flex items-center justify-between text-xs">
              <span className="font-bold text-purple-400">Chơi game nhận XP</span>
              <ArrowRight className="w-4 h-4 text-[#9cb396] group-hover:text-purple-400 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>

        {/* Section: Bài tập được giao cần làm ngay */}
        <div className="bg-[#0a2012] border border-[#234a29] rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#234a29]/80">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Bài tập cô Ning Ning giao</h2>
              <p className="text-xs text-[#9cb396]">
                Làm bài đúng hạn để nhận tối đa điểm kinh nghiệm (XP)
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#c3dc4e]/10 border border-[#c3dc4e]/30 text-xs font-bold text-[#c3dc4e]">
              {data?.assignments.length || 1} bài tập
            </span>
          </div>

          <div className="space-y-4">
            {data?.assignments.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#0d2816]/70 border border-[#234a29] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#c3dc4e]/50 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#14331e] text-[#c3dc4e] flex items-center justify-center shrink-0 mt-0.5">
                    <FileCheck2 className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white mb-1">{item.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#9cb396]">
                      <span>{item.className}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#c3dc4e]" />
                        <span>{item.durationMin} phút ({item.totalQuestions} câu hỏi)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {item.hasAttempted ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#c3dc4e] font-bold">
                        Đã làm: {item.latestScore}đ
                      </span>
                      <button
                        onClick={() => handleStartAssignment(item.id)}
                        className="px-4 py-2 rounded-xl border border-white/25 text-xs font-semibold hover:border-[#c3dc4e] hover:text-white transition cursor-pointer"
                      >
                        Làm lại
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartAssignment(item.id)}
                      className="px-6 py-2.5 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-xs hover:bg-[#b3cb40] transition shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Bắt đầu làm bài</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#234a29]/60 py-6 text-center text-xs text-[#9cb396]/60">
        © 2026 Lớp tiếng Trung cô Ning Ning · Phòng luyện tập học sinh
      </footer>
    </div>
  );
}
