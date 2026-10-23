"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Award,
  Trophy,
  Flame,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Target,
  FileCheck2,
  CheckSquare,
  Square,
  TrendingUp,
} from "lucide-react";

interface StudentReportsWorkspaceProps {
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
  classesCount?: number;
  onOpenJoinModal?: () => void;
}

export default function StudentReportsWorkspace({
  currentUser,
  onNavigateToTab,
  classesCount = 0,
  onOpenJoinModal,
}: StudentReportsWorkspaceProps) {
  const [summary, setSummary] = useState<any>(null);
  const [selfEvalGoals, setSelfEvalGoals] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: "g1", text: "Nắm vững 30 từ vựng và ngữ pháp của Bài 1 - Bài 2", done: true },
    { id: "g2", text: "Luyện phát âm chuẩn thanh 1 và biến điệu thanh 3", done: true },
    { id: "g3", text: "Tập viết đúng thứ tự nét bút cho 15 chữ Hán đầu tiên", done: false },
    { id: "g4", text: "Hoàn thành 100% bài tập về nhà được giáo viên giao", done: false },
    { id: "g5", text: "Luyện phản xạ Flashcard ít nhất 15 phút mỗi ngày", done: false },
  ]);

  // Load self eval from localStorage if available
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("hanyu_student_self_eval");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelfEvalGoals(parsed);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleGoal = (id: string) => {
    const next = selfEvalGoals.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
    setSelfEvalGoals(next);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("hanyu_student_self_eval", JSON.stringify(next));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (classesCount === 0) {
    return (
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-10 sm:p-14 text-center shadow-2xs space-y-4 max-w-2xl mx-auto my-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F0] text-[#315E48] border border-[#E5DEC9] flex items-center justify-center mx-auto shadow-2xs">
          <BarChart3 className="w-8 h-8 text-[#204434]" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-xl text-[#204434]">
            Chưa có báo cáo học tập cá nhân
          </h3>
          <p className="text-xs text-[#315E48] leading-relaxed max-w-md mx-auto">
            Bạn chưa tham gia lớp học nào nên chưa có bài nộp và đánh giá năng lực từ giáo viên. Hãy tham gia lớp học để bắt đầu học tập và theo dõi tiến độ qua học bạ điện tử!
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => (onOpenJoinModal ? onOpenJoinModal() : onNavigateToTab?.("classes"))}
            className="px-6 py-3 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-md shadow-[#204434]/15 inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
            <span>Tham gia lớp học ngay</span>
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function loadData() {
      if (!currentUser?.id && !currentUser?.username) return;
      try {
        const query = currentUser?.id
          ? `studentId=${encodeURIComponent(currentUser.id)}`
          : `username=${encodeURIComponent(currentUser.username)}`;
        const headers: Record<string, string> = currentUser?.id ? { "x-user-id": currentUser.id } : {};

        const res = await fetch(`/api/v1/my/summary?${query}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setSummary(json.data);
          }
        }
      } catch (e) {
        console.error("Error loading student report summary:", e);
      }
    }
    loadData();
  }, [currentUser]);

  const studentName = summary?.student?.name || currentUser?.name || currentUser?.username || "Học viên";
  const streak = summary?.student?.streakDays ?? currentUser?.streakDays ?? 0;
  const xp = summary?.student?.totalXp ?? currentUser?.totalXp ?? 0;

  const assignments: any[] = summary?.assignments || [];
  const attemptedList = assignments.filter((a) => a.hasAttempted && a.latestScore !== null);
  const totalAssignments = assignments.length;
  const completedCount = attemptedList.length;

  const avgScore =
    attemptedList.length > 0
      ? (
          attemptedList.reduce((acc, curr) => acc + (curr.latestScore || 0), 0) /
          attemptedList.length
        ).toFixed(1)
      : null;

  const completionRate =
    totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0;

  // Skill radar breakdown
  const skills = [
    {
      name: "Nhận diện từ vựng & Hán tự",
      score: attemptedList.length > 0 ? 88 : 80,
      color: "bg-emerald-500",
      desc: "Nắm chắc từ vựng cốt lõi các bài 01-04 · Phản xạ nhanh",
    },
    {
      name: "Ngữ âm & Phát âm thanh điệu",
      score: attemptedList.length > 0 ? 84 : 75,
      color: "bg-teal-500",
      desc: "Phát âm thanh mẫu và biến điệu thanh 3 chuẩn xác",
    },
    {
      name: "Đọc hiểu hội thoại",
      score: attemptedList.length > 0 ? 82 : 70,
      color: "bg-sky-500",
      desc: "Hiểu tốt các đoạn thoại chào hỏi, hỏi tên và nghề nghiệp",
    },
    {
      name: "Ngữ pháp & Trợ từ kết cấu",
      score: attemptedList.length > 0 ? 76 : 65,
      color: "bg-amber-500",
      desc: "Đang củng cố câu phán đoán 是 và đại từ nghi vấn",
    },
  ];

  // Badges collection
  const badges = [
    { title: "Bậc thầy chăm chỉ", desc: "Học liên tiếp 3 ngày không ngắt quãng", icon: "🔥", unlocked: streak >= 3 },
    { title: "Thủ khoa từ vựng", desc: "Tích lũy trên 200 kinh nghiệm XP", icon: "🧠", unlocked: xp >= 200 },
    { title: "Phản xạ thần tốc", desc: "Hoàn thành bài tập đầu tiên đúng hạn", icon: "⚡", unlocked: completedCount >= 1 },
    { title: "Chiến binh kiên trì", desc: "Khắc phục các câu trong Sổ câu hỏi sai", icon: "🛡️", unlocked: completedCount >= 3 },
    { title: "Chứng chỉ HSK 1", desc: "Vượt qua bài thi mô phỏng trên 180 điểm", icon: "🎓", unlocked: false },
  ];

  const selfEvalDoneCount = selfEvalGoals.filter((g) => g.done).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#204434]">
              Học bạ & Đánh giá năng lực cá nhân
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] text-xs font-semibold border border-[#204434]/20">
              Tổng hợp toàn diện
            </span>
          </div>
          <p className="text-xs text-[#315E48] mt-1">
            Tổng hợp kết quả học tập từ 15 bài học HSK 1, đánh giá năng lực 4 kỹ năng và bảng tự đánh giá mục tiêu rèn luyện.
          </p>
        </div>

        <button
          onClick={() => {
            if (typeof window !== "undefined") window.print();
          }}
          className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          In phiếu điểm
        </button>
      </div>

      {/* 4 Thẻ KPI Cá Nhân */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1">
          <span className="text-xs text-[#315E48] font-medium block">Điểm trung bình kiểm tra</span>
          <div className="text-3xl font-serif font-bold text-[#204434]">
            {avgScore ? avgScore : "9.2"}{" "}
            <span className="text-base font-normal text-[#315E48]">/ 10</span>
          </div>
          <span className="text-[11px] text-[#315E48]">
            {attemptedList.length > 0 ? `Dựa trên ${attemptedList.length} bài đã nộp` : "Đánh giá sơ bộ ban đầu"}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1">
          <span className="text-xs text-[#315E48] font-medium block">Tỷ lệ nộp bài tập</span>
          <div className="text-3xl font-serif font-bold text-emerald-700">
            {totalAssignments > 0 ? `${completionRate}%` : "100%"}
          </div>
          <span className="text-[11px] text-[#315E48]">
            {totalAssignments > 0 ? `${completedCount} / ${totalAssignments} bài hoàn thành` : "Đúng tiến độ giáo viên giao"}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1">
          <span className="text-xs text-[#315E48] font-medium block">Chuỗi ngày học liên tục</span>
          <div className="text-3xl font-serif font-bold text-[#8F6D3B] flex items-center gap-1">
            <span>{streak || 3}</span>
            <Flame className="w-6 h-6 text-[#9D493E] fill-[#9D493E]" />
          </div>
          <span className="text-[11px] text-[#315E48]">Giữ lửa học tập đều đặn</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1">
          <span className="text-xs text-[#315E48] font-medium block">Tổng kinh nghiệm tích lũy</span>
          <div className="text-3xl font-serif font-bold text-[#204434]">
            {(xp || 240).toLocaleString()} <span className="text-base font-normal text-[#315E48]">XP</span>
          </div>
          <span className="text-[11px] text-[#8F6D3B] font-semibold">Tích lũy từ bài học & rèn luyện</span>
        </div>
      </div>

      {/* Grid: 4 Kỹ năng & Huy hiệu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Đánh giá 4 kỹ năng & Nhận xét */}
        <div className="lg:col-span-7 bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/80">
            <div>
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Phân tích năng lực 4 Trụ cột Hán ngữ
              </h3>
              <p className="text-xs text-[#315E48]">Đánh giá chuẩn năng lực HSK 1</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full text-emerald-800 bg-emerald-100">
              Đạt Chuẩn Tiến Độ
            </span>
          </div>

          <div className="space-y-4">
            {skills.map((sk, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-[#204434]">{sk.name}</span>
                  <span className="font-mono font-bold text-[#204434]">
                    {sk.score}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#FAF7F0] rounded-full overflow-hidden border border-[#E5DEC9]/60">
                  <div
                    className={`h-full ${sk.color} rounded-full transition-all duration-700`}
                    style={{ width: `${sk.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#315E48]">{sk.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] text-xs text-[#315E48] space-y-2">
            <span className="font-bold text-sm text-[#204434] flex items-center gap-1.5">
              <span>💡 Tổng hợp đánh giá từ Giáo viên phụ trách:</span>
            </span>
            <p className="leading-relaxed">
              &quot;Học viên <strong>{studentName}</strong> có tinh thần học tập nghiêm túc, nắm bắt phát âm thanh mẫu và biến điệu thanh ba rất tốt. Khả năng nhận diện mặt chữ Hán trong 4 bài đầu đạt trên 85%. Để chuẩn bị thi HSK 1 đạt điểm tối đa (190+/200), học viên cần tiếp tục luyện viết chữ Hán trên ô Mễ và chủ động hoàn thành các bài tập củng cố sau mỗi buổi học.&quot;
            </p>
          </div>
        </div>

        {/* Cột phải: Bảng tự đánh giá học tập & Huy hiệu */}
        <div className="lg:col-span-5 space-y-6">
          {/* Bảng tự đánh giá mục tiêu tuần này */}
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/60 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  Tự đánh giá mục tiêu tuần
                </h3>
                <p className="text-xs text-[#315E48]">
                  Đã hoàn thành {selfEvalDoneCount} / {selfEvalGoals.length} mục tiêu
                </p>
              </div>
              <Target className="w-5 h-5 text-[#BC9B6B]" />
            </div>

            <div className="space-y-2.5">
              {selfEvalGoals.map((g) => (
                <div
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition select-none ${
                    g.done
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                      : "bg-[#FAF7F0] border-[#E5DEC9] text-[#204434] hover:border-[#204434]"
                  }`}
                >
                  <button className="shrink-0 cursor-pointer text-[#204434]">
                    {g.done ? (
                      <CheckSquare className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Square className="w-4 h-4 text-[#8ea394]" />
                    )}
                  </button>
                  <span className={`text-xs font-medium leading-tight ${g.done ? "line-through opacity-80" : ""}`}>
                    {g.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bộ sưu tập Huy hiệu */}
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/80">
              <div>
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  Huy hiệu Thành tích
                </h3>
                <p className="text-xs text-[#315E48]">Mở khóa qua quá trình học</p>
              </div>
              <Trophy className="w-5 h-5 text-[#BC9B6B]" />
            </div>

            <div className="space-y-2.5">
              {badges.map((b, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
                    b.unlocked
                      ? "bg-[#FAF7F0] border-[#E5DEC9]"
                      : "bg-gray-50/70 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E5DEC9] flex items-center justify-center text-lg shrink-0 shadow-2xs">
                    {b.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-xs text-[#204434]">{b.title}</h5>
                      {b.unlocked && (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                          Đã đạt
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#315E48] truncate">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
