"use client";

import Link from "next/link";
import { Clock, HelpCircle, Headphones, Award, ArrowUpRight, CheckCircle } from "lucide-react";

interface ExamCard {
  id: string;
  title: string;
  level: number;
  duration: number;
  questions: number;
  listeningCount: number;
  readingCount: number;
  badgeText: string;
}

const featuredExams: ExamCard[] = [
  {
    id: "hsk1-01",
    title: "Đề thi thử HSK 1 - Mã H11001",
    level: 1,
    duration: 35,
    questions: 40,
    listeningCount: 20,
    readingCount: 20,
    badgeText: "Có audio chuẩn",
  },
  {
    id: "hsk2-01",
    title: "Đề thi thử HSK 2 - Mã H21002",
    level: 2,
    duration: 50,
    questions: 60,
    listeningCount: 35,
    readingCount: 25,
    badgeText: "Phổ biến nhất",
  },
  {
    id: "hsk3-01",
    title: "Đề thi thử HSK 3 - Mã H31003",
    level: 3,
    duration: 85,
    questions: 80,
    listeningCount: 40,
    readingCount: 30,
    badgeText: "Mới cập nhật",
  },
  {
    id: "hsk4-01",
    title: "Đề thi thử HSK 4 - Mã H41004",
    level: 4,
    duration: 100,
    questions: 100,
    listeningCount: 45,
    readingCount: 40,
    badgeText: "Đề chuẩn Hanban",
  },
];

export default function MockExamsSection() {
  return (
    <section id="exams" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-3">
            <Award className="w-3.5 h-3.5" />
            Phòng thi thực chiến Online
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Thư Viện Đề Thi Thử HSK
          </h2>
          <p className="mt-3 text-slate-300 text-base max-w-xl">
            Mô phỏng 100% áp lực phòng thi thật với đồng hồ đếm ngược, file nghe audio chất lượng cao
            và hệ thống chấm điểm tự động kèm giải thích chi tiết.
          </p>
        </div>

        <Link
          href="#levels"
          className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 font-semibold text-sm group shrink-0"
        >
          <span>Xem tất cả 100+ đề thi</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid of Exams */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredExams.map((exam) => (
          <div
            key={exam.id}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#151b32] to-[#101426] border border-white/10 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:-translate-y-1"
          >
            <div>
              {/* Badge & Level tag */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  HSK {exam.level}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-md">
                  {exam.badgeText}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-serif font-bold text-white group-hover:text-amber-300 transition mb-4">
                {exam.title}
              </h3>

              {/* Exam specs */}
              <div className="space-y-2.5 py-4 border-y border-white/5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Thời gian làm bài:
                  </span>
                  <span className="font-mono font-semibold text-white">{exam.duration} phút</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    Tổng số câu hỏi:
                  </span>
                  <span className="font-mono font-semibold text-white">{exam.questions} câu</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Headphones className="w-3.5 h-3.5 text-amber-400" />
                    Phần thi nghe:
                  </span>
                  <span className="font-mono text-slate-300">{exam.listeningCount} câu</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Link
                href="/s/home?tab=assignments"
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold text-sm transition-all duration-200 text-center block border border-white/10 group-hover:border-transparent cursor-pointer"
              >
                Vào thi thử ngay
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
