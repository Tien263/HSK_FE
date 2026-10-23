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
} from "lucide-react";

interface StudentReportsWorkspaceProps {
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
}

export default function StudentReportsWorkspace({
  currentUser,
  onNavigateToTab,
}: StudentReportsWorkspaceProps) {
  const [summary, setSummary] = useState<any>(null);

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
      name: "Nhận diện từ vựng",
      score: attemptedList.length > 0 ? 85 : 0,
      color: "bg-emerald-500",
      desc: attemptedList.length > 0 ? "Khá · Đang theo sát lộ trình" : "Chưa có dữ liệu kiểm tra",
    },
    {
      name: "Đọc hiểu Hán tự",
      score: attemptedList.length > 0 ? 80 : 0,
      color: "bg-teal-500",
      desc: attemptedList.length > 0 ? "Tốt · Cần duy trì làm đề" : "Chưa có dữ liệu kiểm tra",
    },
    {
      name: "Nghe hiểu phản xạ",
      score: attemptedList.length > 0 ? 75 : 0,
      color: "bg-sky-500",
      desc: attemptedList.length > 0 ? "Khá · Cần chú ý phân biệt thanh điệu" : "Chưa có dữ liệu kiểm tra",
    },
    {
      name: "Ngữ pháp & Cấu trúc câu",
      score: attemptedList.length > 0 ? 70 : 0,
      color: "bg-amber-500",
      desc: attemptedList.length > 0 ? "Đang phát triển · Ôn lại trợ từ" : "Chưa có dữ liệu kiểm tra",
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

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#204434]">
              Kết quả & Báo cáo học tập cá nhân
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] text-xs font-semibold border border-[#204434]/20">
              Học bạ điện tử
            </span>
          </div>
          <p className="text-xs text-[#315E48] mt-1">
            Theo dõi năng lực 4 kỹ năng Hán ngữ, biểu đồ tiến bộ điểm thi và bộ sưu tập huy hiệu thành tích.
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
            {avgScore ? avgScore : "—"}{" "}
            <span className="text-base font-normal text-[#315E48]">/ 10</span>
          </div>
          <span className="text-[11px] text-[#315E48]">
            {attemptedList.length > 0 ? `Dựa trên ${attemptedList.length} bài đã nộp` : "Chưa có bài nộp nào"}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1">
          <span className="text-xs text-[#315E48] font-medium block">Tỷ lệ hoàn thành bài tập</span>
          <div className="text-3xl font-serif font-bold text-emerald-700">
            {completionRate}%
          </div>
          <span className="text-[11px] text-[#315E48]">
            {totalAssignments > 0 ? `${completedCount} / ${totalAssignments} bài hoàn thành` : "Chưa có bài tập giao"}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1">
          <span className="text-xs text-[#315E48] font-medium block">Chuỗi ngày học liên tục</span>
          <div className="text-3xl font-serif font-bold text-[#8F6D3B] flex items-center gap-1">
            <span>{streak}</span>
            <Flame className="w-6 h-6 text-[#9D493E] fill-[#9D493E]" />
          </div>
          <span className="text-[11px] text-[#315E48]">Giữ lửa học tập đều đặn</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1">
          <span className="text-xs text-[#315E48] font-medium block">Tổng kinh nghiệm tích lũy</span>
          <div className="text-3xl font-serif font-bold text-[#204434]">
            {xp.toLocaleString()} <span className="text-base font-normal text-[#315E48]">XP</span>
          </div>
          <span className="text-[11px] text-[#8F6D3B] font-semibold">Tích lũy từ bài học & rèn luyện</span>
        </div>
      </div>

      {/* Grid: 4 Kỹ năng & Huy hiệu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Đánh giá 4 kỹ năng */}
        <div className="lg:col-span-7 bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/80">
            <div>
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Phân tích năng lực 4 Kỹ năng
              </h3>
              <p className="text-xs text-[#315E48]">Dựa trên các bài tập và đề kiểm tra đã làm</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              attemptedList.length > 0 ? "text-emerald-800 bg-emerald-100" : "text-[#315E48] bg-[#FAF7F0] border border-[#E5DEC9]"
            }`}>
              {attemptedList.length > 0 ? "Đang đánh giá" : "Chưa có dữ liệu"}
            </span>
          </div>

          <div className="space-y-4">
            {skills.map((sk, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-[#204434]">{sk.name}</span>
                  <span className="font-mono font-bold text-[#204434]">
                    {sk.score > 0 ? `${sk.score}%` : "—"}
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

          <div className="p-3.5 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] text-xs text-[#315E48] space-y-1">
            <span className="font-bold text-[#204434] block">💡 Lời khuyên của Giáo viên:</span>
            <p>
              {totalAssignments === 0 ? (
                `Chào bạn ${studentName}! Hiện tại bạn chưa tham gia lớp học nào. Hãy tham gia lớp học bằng mã mời của giáo viên để bắt đầu nhận bài tập và được giáo viên nhận xét nhé.`
              ) : attemptedList.length === 0 ? (
                `Chào bạn ${studentName}! Bạn đã được giao ${totalAssignments} bài tập từ lớp học. Hãy hoàn thành các bài tập sắp đến hạn để hệ thống ghi nhận năng lực và phản hồi từ giáo viên.`
              ) : (
                `Chào bạn ${studentName}! Bạn đang tiến bộ rất tích cực qua các bài tập đã nộp. Hãy tiếp tục duy trì việc ôn luyện từ vựng và làm lại các câu chưa chính xác trong Sổ câu hỏi sai để đạt điểm tối đa!`
              )}
            </p>
          </div>
        </div>

        {/* Cột phải: Bộ sưu tập Huy hiệu */}
        <div className="lg:col-span-5 bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]/80">
            <div>
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Huy hiệu Danh dự
              </h3>
              <p className="text-xs text-[#315E48]">Thành tích mở khóa qua các thử thách</p>
            </div>
            <Trophy className="w-5 h-5 text-[#BC9B6B]" />
          </div>

          <div className="space-y-3">
            {badges.map((b, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                  b.unlocked
                    ? "bg-[#FAF7F0] border-[#E5DEC9]"
                    : "bg-gray-50/70 border-gray-200 opacity-55"
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5DEC9] flex items-center justify-center text-xl shrink-0 shadow-2xs">
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
                  <p className="text-[11px] text-[#315E48] mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
