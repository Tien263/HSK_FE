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
      try {
        const username = currentUser?.username || "student";
        const res = await fetch(`/api/v1/my/summary?username=${username}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setSummary(json);
          }
        }
      } catch (e) {
        console.error("Error loading student report summary:", e);
      }
    }
    loadData();
  }, [currentUser]);

  // Skill radar breakdown
  const skills = [
    { name: "Nhận diện từ vựng", score: 95, color: "bg-emerald-500", desc: "Xuất sắc · Đạt mục tiêu HSK 1" },
    { name: "Đọc hiểu Hán tự", score: 88, color: "bg-teal-500", desc: "Tốt · Tốc độ đọc 65 chữ/phút" },
    { name: "Nghe hiểu phản xạ", score: 82, color: "bg-sky-500", desc: "Khá · Cần chú ý phân biệt âm thanh 2 và thanh 3" },
    { name: "Ngữ pháp & Cấu trúc câu", score: 78, color: "bg-amber-500", desc: "Trung bình khá · Cần củng cố trợ từ 的 và 了" },
  ];

  // Badges collection
  const badges = [
    { title: "Bậc thầy chăm chỉ", desc: "Học liên tiếp 5 ngày không ngắt quãng", icon: "🔥", unlocked: true },
    { title: "Thủ khoa từ vựng", desc: "Ghi nhớ trên 100 từ vựng HSK 1", icon: "🧠", unlocked: true },
    { title: "Phản xạ thần tốc", desc: "Đạt chuỗi 10 combo trong Game ghép từ", icon: "⚡", unlocked: true },
    { title: "Chiến binh kiên trì", desc: "Khắc phục toàn bộ các câu trong Sổ câu hỏi sai", icon: "🛡️", unlocked: false },
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
            8.5 <span className="text-base font-normal text-[#315E48]">/ 10</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <span>↑ Tăng 0.8đ so với tháng trước</span>
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1">
          <span className="text-xs text-[#315E48] font-medium block">Tỷ lệ hoàn thành bài tập</span>
          <div className="text-3xl font-serif font-bold text-emerald-700">
            92%
          </div>
          <span className="text-[11px] text-[#315E48]">11 / 12 bài nộp đúng hạn</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1">
          <span className="text-xs text-[#315E48] font-medium block">Chuỗi ngày học liên tục</span>
          <div className="text-3xl font-serif font-bold text-[#8F6D3B] flex items-center gap-1">
            <span>{summary?.student?.streakDays || 5}</span>
            <Flame className="w-6 h-6 text-[#9D493E] fill-[#9D493E]" />
          </div>
          <span className="text-[11px] text-[#315E48]">Giữ lửa học tập đều đặn</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs space-y-1">
          <span className="text-xs text-[#315E48] font-medium block">Tổng kinh nghiệm tích lũy</span>
          <div className="text-3xl font-serif font-bold text-[#204434]">
            {summary?.student?.totalXp || 1250} <span className="text-base font-normal text-[#315E48]">XP</span>
          </div>
          <span className="text-[11px] text-[#8F6D3B] font-semibold">Hạng 3 trong lớp HSK 1A</span>
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
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Tổng thể: Giỏi
            </span>
          </div>

          <div className="space-y-4">
            {skills.map((sk, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-[#204434]">{sk.name}</span>
                  <span className="font-mono font-bold text-[#204434]">{sk.score}%</span>
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
              Minh Khang có khả năng ghi nhớ mặt chữ Hán và vốn từ rất tốt. Em nên dành thêm 15 phút mỗi ngày trong Phòng luyện tập để nghe file audio của bài 4 và bài 5 để nâng cao độ nhạy với các biến âm thanh điệu.
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
