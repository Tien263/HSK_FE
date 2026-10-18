"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, FileText, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

interface LevelData {
  level: number;
  title: string;
  hanziTitle: string;
  words: number;
  duration: string;
  desc: string;
  target: string;
  sampleWords: { hanzi: string; pinyin: string; meaning: string }[];
  accentColor: string;
}

const levels: LevelData[] = [
  {
    level: 1,
    title: "HSK Cấp 1",
    hanziTitle: "一级",
    words: 150,
    duration: "2 - 4 tuần",
    desc: "Bước đầu làm quen với phiên âm Pinyin, các nét bút cơ bản và câu giao tiếp đơn giản nhất.",
    target: "Hiểu và sử dụng các câu chào hỏi, giới thiệu bản thân, số đếm, gia đình.",
    sampleWords: [
      { hanzi: "你好", pinyin: "nǐ hǎo", meaning: "Xin chào" },
      { hanzi: "谢谢", pinyin: "xièxie", meaning: "Cảm ơn" },
      { hanzi: "苹果", pinyin: "píngguǒ", meaning: "Quả táo" },
    ],
    accentColor: "from-amber-400 to-amber-600",
  },
  {
    level: 2,
    title: "HSK Cấp 2",
    hanziTitle: "二级",
    words: 300,
    duration: "1 - 2 tháng",
    desc: "Nắm vững ngữ pháp cơ bản, giao tiếp trực tiếp trong các tình huống mua sắm, thời tiết, hỏi đường.",
    target: "Tự tin trao đổi thông tin đơn giản hàng ngày và hoàn thành bài thi 200 điểm.",
    sampleWords: [
      { hanzi: "旅游", pinyin: "lǚyóu", meaning: "Du lịch" },
      { hanzi: "帮助", pinyin: "bāngzhù", meaning: "Giúp đỡ" },
      { hanzi: "准备", pinyin: "zhǔnbèi", meaning: "Chuẩn bị" },
    ],
    accentColor: "from-emerald-400 to-teal-600",
  },
  {
    level: 3,
    title: "HSK Cấp 3",
    hanziTitle: "三级",
    words: 600,
    duration: "2 - 3 tháng",
    desc: "Cột mốc quan trọng: Có thể giao tiếp trôi chảy các chủ đề học tập, làm việc, du lịch tại Trung Quốc.",
    target: "Không còn phụ thuộc vào Pinyin, đọc hiểu các văn bản ngắn và viết đoạn văn.",
    sampleWords: [
      { hanzi: "解决", pinyin: "jiějué", meaning: "Giải quyết" },
      { hanzi: "环境", pinyin: "huánjìng", meaning: "Môi trường" },
      { hanzi: "健康", pinyin: "jiànkāng", meaning: "Sức khỏe" },
    ],
    accentColor: "from-cyan-400 to-blue-600",
  },
  {
    level: 4,
    title: "HSK Cấp 4",
    hanziTitle: "四级",
    words: 1200,
    duration: "3 - 5 tháng",
    desc: "Điều kiện chuẩn để xin học bổng du học đại học tại Trung Quốc. Thảo luận các chủ đề sâu rộng.",
    target: "Giao tiếp thành thạo với người bản xứ, đọc hiểu báo chí cơ bản.",
    sampleWords: [
      { hanzi: "坚持", pinyin: "jiānchí", meaning: "Kiên trì" },
      { hanzi: "成功", pinyin: "chénggōng", meaning: "Thành công" },
      { hanzi: "经济", pinyin: "jīngjì", meaning: "Kinh tế" },
    ],
    accentColor: "from-indigo-400 to-purple-600",
  },
  {
    level: 5,
    title: "HSK Cấp 5",
    hanziTitle: "五级",
    words: 2500,
    duration: "6 - 9 tháng",
    desc: "Trình độ cao cấp: Đọc hiểu báo chí, tạp chí, thưởng thức phim ảnh tiếng Trung không cần phụ đề.",
    target: "Thuyết trình chuyên nghiệp, làm việc trong các doanh nghiệp quốc tế sử dụng tiếng Trung.",
    sampleWords: [
      { hanzi: "挑战", pinyin: "tiǎozhàn", meaning: "Thách thức" },
      { hanzi: "资源", pinyin: "zīyuán", meaning: "Tài nguyên" },
      { hanzi: "珍惜", pinyin: "zhēnxī", meaning: "Trân trọng" },
    ],
    accentColor: "from-rose-400 to-pink-600",
  },
  {
    level: 6,
    title: "HSK Cấp 6",
    hanziTitle: "六级",
    words: 5000,
    duration: "1 năm+",
    desc: "Đỉnh cao Hán ngữ: Dễ dàng tiếp nhận và diễn đạt mọi thông tin bằng lời nói hoặc văn bản phức tạp.",
    target: "Trình độ tương đương cử nhân ngôn ngữ Trung, tự do nghiên cứu chuyên sâu.",
    sampleWords: [
      { hanzi: "渊博", pinyin: "yuānbó", meaning: "Uyên bác" },
      { hanzi: "宏伟", pinyin: "hóngwěi", meaning: "Hùng vĩ" },
      { hanzi: "璀璨", pinyin: "cuǐcàn", meaning: "Rực rỡ" },
    ],
    accentColor: "from-amber-300 to-orange-600",
  },
];

export default function HskLevelsSection() {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const active = levels.find((l) => l.level === selectedLevel) || levels[0];

  return (
    <section id="levels" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Lộ trình chuẩn Hanban
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
          Chọn Cấp Độ HSK Của Bạn
        </h2>
        <p className="mt-4 text-slate-300 text-base sm:text-lg">
          Lộ trình được thiết kế bài bản theo từng nấc thang từ cơ bản đến cao cấp, giúp bạn nắm chắc
          từ vựng và ngữ pháp trọng tâm mà không bị quá tải.
        </p>
      </div>

      {/* Level Selection Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10">
        {levels.map((item) => {
          const isSelected = item.level === selectedLevel;
          return (
            <button
              key={item.level}
              onClick={() => setSelectedLevel(item.level)}
              className={`py-3.5 px-4 rounded-xl text-center transition-all duration-200 border ${
                isSelected
                  ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg shadow-amber-500/25 scale-105"
                  : "bg-[#14192d]/60 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="text-xs uppercase opacity-75 font-mono">Cấp độ</div>
              <div className="text-lg font-serif font-black">{item.title.split(" ")[2]}</div>
              <div className="text-[11px] font-sans opacity-90">{item.words} từ</div>
            </button>
          );
        })}
      </div>

      {/* Active Level Detail Showcase Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#14192d] to-[#101426] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Subtle Chinese Watermark */}
        <div className="absolute right-4 -bottom-10 text-[14rem] font-serif font-black text-white/[0.03] select-none pointer-events-none">
          {active.hanziTitle}
        </div>

        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Info */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold tracking-wider uppercase border border-amber-400/30">
                {active.title} • {active.hanziTitle}
              </span>
              <span className="text-sm text-slate-400 font-mono">Thời gian dự kiến: {active.duration}</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-4">
              Nắm vững {active.words} từ vựng trọng tâm
            </h3>

            <p className="text-slate-300 text-base leading-relaxed mb-6">{active.desc}</p>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-200">
                  <strong className="text-white">Mục tiêu chuẩn:</strong> {active.target}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-200">
                  Hệ thống đề thi thử mô phỏng 100% thời gian thực và phân tích lỗi sai chi tiết.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#demo-flashcard"
                className="px-6 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 flex items-center gap-2 group"
              >
                <BookOpen className="w-4 h-4" />
                <span>Học từ vựng {active.title}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#exams"
                className="px-6 py-3.5 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 border border-white/15 transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Làm đề thi thử</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Sample Words Interactive Preview */}
          <div className="lg:col-span-5 bg-black/30 rounded-2xl p-6 border border-white/10 backdrop-blur-md">
            <div className="text-xs font-mono uppercase tracking-widest text-amber-300/80 mb-4 flex items-center justify-between">
              <span>Từ vựng tiêu biểu</span>
              <span>Audio chuẩn</span>
            </div>
            <div className="space-y-3">
              {active.sampleWords.map((w, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-amber-400/40 hover:bg-white/10 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-serif font-bold text-white">{w.hanzi}</span>
                    <div>
                      <div className="text-xs font-mono text-amber-300">{w.pinyin}</div>
                      <div className="text-xs text-slate-300">{w.meaning}</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-slate-300">
                    HSK {active.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
