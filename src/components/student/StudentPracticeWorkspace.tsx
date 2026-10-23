"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dumbbell,
  BookOpen,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Volume2,
  Gamepad2,
  Layers,
  GraduationCap,
  Play,
  Clock,
  PenTool,
  Mic,
} from "lucide-react";
import HanziPracticeModal from "./HanziPracticeModal";

interface StudentPracticeWorkspaceProps {
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
}

export default function StudentPracticeWorkspace({
  currentUser,
  onNavigateToTab,
}: StudentPracticeWorkspaceProps) {
  const [dueVocabCount, setDueVocabCount] = useState(0);
  const [wrongQuestionCount, setWrongQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHanziModalOpen, setIsHanziModalOpen] = useState(false);

  useEffect(() => {
    async function loadPracticeStats() {
      if (!currentUser?.id && !currentUser?.username) {
        setDueVocabCount(0);
        setWrongQuestionCount(0);
        setLoading(false);
        return;
      }

      try {
        const query = currentUser?.id
          ? `studentId=${encodeURIComponent(currentUser.id)}`
          : `username=${encodeURIComponent(currentUser.username)}`;
        const headers: Record<string, string> = currentUser?.id ? { "x-user-id": currentUser.id } : {};

        const [resVocab, resWrong] = await Promise.all([
          fetch(`/api/v1/my/vocab-review/today?${query}`, { headers }),
          fetch(`/api/v1/my/wrong-questions?${query}`, { headers }),
        ]);

        if (resVocab.ok) {
          const vocabData = await resVocab.json();
          if (vocabData.success && vocabData.items) {
            setDueVocabCount(vocabData.items.length);
          } else {
            setDueVocabCount(0);
          }
        }

        if (resWrong.ok) {
          const wrongData = await resWrong.json();
          if (wrongData.success && wrongData.items) {
            setWrongQuestionCount(wrongData.items.length);
          } else {
            setWrongQuestionCount(0);
          }
        }
      } catch (err) {
        console.error("Error loading practice stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPracticeStats();
  }, [currentUser]);

  const streak = currentUser?.streakDays || 0;
  const xp = currentUser?.totalXp || 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DEC9]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#204434] flex items-center gap-2">
            <span>Phòng luyện tập phản xạ</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-semibold border border-[#BC9B6B]/40 font-sans">
              AI Spaced Repetition
            </span>
          </h1>
          <p className="text-xs text-[#315E48] mt-1">
            Ôn luyện từ vựng theo thuật toán ghi nhớ ngắt quãng, sửa câu hỏi sai và thi đua điểm phản xạ.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs text-xs font-semibold text-[#8F6D3B]">
            <Flame className="w-4 h-4 text-[#9D493E] fill-[#9D493E]" />
            <span>{streak} ngày liên tục</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs text-xs font-semibold text-[#204434]">
            <Trophy className="w-4 h-4 text-[#BC9B6B]" />
            <span>+{xp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* 4 Trạm rèn luyện chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Trạm 1: Ôn tập từ vựng ngắt quãng */}
        <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                dueVocabCount > 0 ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}>
                {dueVocabCount > 0 ? `${dueVocabCount} từ cần ôn hôm nay` : "Đã hoàn thành ôn tập"}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-[#204434] group-hover:text-emerald-900 transition">
                Ôn từ vựng Flashcard (Spaced Repetition)
              </h3>
              <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                Hệ thống tự động tính toán chu kỳ quên và đưa ra những từ vựng bạn chuẩn bị quên theo thuật toán hộp Leitner thông minh.
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9]/70 flex items-center justify-between text-xs text-[#315E48]">
              <span>Từ vựng cần ôn trong ngày:</span>
              <span className="font-bold text-[#204434]">
                {dueVocabCount > 0 ? `${dueVocabCount} từ đang chờ` : "0 từ cần ôn"}
              </span>
            </div>
          </div>

          <Link
            href="/s/review"
            className="w-full py-3 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Play className="w-4 h-4 text-[#BC9B6B] fill-[#BC9B6B]" />
            <span>Bắt đầu ôn flashcard ngay</span>
          </Link>
        </div>

        {/* Trạm 2: Đấu trí ghép từ (Game Center) */}
        <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#8F6D3B] transition flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                Tốc độ & Phản xạ
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-[#204434] group-hover:text-[#8F6D3B] transition">
                Game ghép cặp Hán tự - Pinyin - Nghĩa
              </h3>
              <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                Trò chơi ghép chữ Hán với phiên âm Pinyin và ngữ nghĩa tiếng Việt. Rèn luyện khả năng nhận mặt chữ và gặt hái Combo XP cực lớn!
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9]/70 flex items-center justify-between text-xs text-[#315E48]">
              <span>Chế độ luyện tập:</span>
              <span className="font-bold text-[#8F6D3B]">Tự do & Bảng xếp hạng</span>
            </div>
          </div>

          <Link
            href="/s/games"
            className="w-full py-3 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B] hover:bg-[#FAF7F0] text-[#8F6D3B] text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
            <span>Chơi game ghép thẻ phản xạ</span>
          </Link>
        </div>

        {/* Trạm 3: Sổ câu hỏi sai (Mistake Notebook) */}
        <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-red-400 transition flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                wrongQuestionCount > 0 ? "bg-red-100 text-red-800 border-red-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}>
                {wrongQuestionCount > 0 ? `${wrongQuestionCount} câu cần làm lại` : "Không có câu sai"}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-[#204434] group-hover:text-red-800 transition">
                Sổ tay câu hỏi làm sai (Luyện đến khi đúng)
              </h3>
              <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                Tất cả câu trắc nghiệm và bài tập bạn làm sai trong các bài kiểm tra được gom tự động về đây để bạn làm lại cho tới khi nhuần nhuyễn.
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9]/70 flex items-center justify-between text-xs text-[#315E48]">
              <span>Tình trạng sổ câu sai:</span>
              <span className={`font-bold ${wrongQuestionCount > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                {wrongQuestionCount > 0 ? `${wrongQuestionCount} câu cần khắc phục` : "Chưa có câu sai nào"}
              </span>
            </div>
          </div>

          <Link
            href="/s/practice/wrong"
            className="w-full py-3 rounded-2xl bg-white border border-[#E5DEC9] hover:bg-red-50 hover:border-red-300 text-red-700 text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mở sổ câu sai & làm lại</span>
          </Link>
        </div>

        {/* Trạm 4: Luyện viết chữ Hán & Chấm khẩu ngữ Micro AI */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFFCF6] to-[#FFF9EE] border-2 border-[#BC9B6B]/70 shadow-2xs hover:border-[#204434] transition flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#204434] text-white flex items-center justify-center">
                <PenTool className="w-6 h-6 text-[#BC9B6B]" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#BC9B6B]/20 text-[#8F6D3B] border border-[#BC9B6B]/40 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Viết ô Mễ & Micro AI</span>
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-[#204434] group-hover:text-[#183629] transition">
                Tập viết nét chữ & Khẩu ngữ Micro AI
              </h3>
              <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                Tập viết chữ Hán trên ô Mễ tự cách (米), học quy tắc thuận bút và luyện nói trực tiếp vào Micro để AI nhận diện giọng đọc chuẩn Bắc Kinh.
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-[#E5DEC9] flex items-center justify-between text-xs text-[#315E48]">
              <span>Kho chữ Hán luyện tập:</span>
              <span className="font-bold text-[#204434]">150 chữ cốt lõi HSK 1</span>
            </div>
          </div>

          <button
            onClick={() => setIsHanziModalOpen(true)}
            className="w-full py-3 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-md shadow-[#204434]/15 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <PenTool className="w-4 h-4 text-[#BC9B6B]" />
            <span>Mở bàn tập viết & Micro ngay</span>
          </button>
        </div>

        {/* Trạm 5: Luyện đề mô phỏng HSK 3.0 */}
        <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-800 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                Chuẩn HSK 3.0 mới
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-[#204434] group-hover:text-sky-900 transition">
                Luyện đề kiểm tra mô phỏng (Thi thử)
              </h3>
              <p className="text-xs text-[#315E48] mt-1 leading-relaxed">
                Hệ thống đề thi mô phỏng theo cấu trúc đề thật của Bộ Giáo dục Trung Quốc với đầy đủ các phần Nghe hiểu, Đọc hiểu và Viết tự luận.
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9]/70 flex items-center justify-between text-xs text-[#315E48]">
              <span>Đề thi được giao từ lớp:</span>
              <span className="font-bold text-[#204434]">Theo dõi trong tab Bài tập</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab?.("assignments")}
            className="w-full py-3 rounded-2xl bg-white border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#204434] text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#BC9B6B]" />
            <span>Xem danh sách đề thi thử & bài tập</span>
          </button>
        </div>
      </div>

      {/* Modal Tập viết chữ Hán & Micro AI */}
      <HanziPracticeModal
        isOpen={isHanziModalOpen}
        onClose={() => setIsHanziModalOpen(false)}
      />
    </div>
  );
}
