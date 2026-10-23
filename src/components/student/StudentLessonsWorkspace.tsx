"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  CheckCircle2,
  Play,
  Volume2,
  Sparkles,
  ChevronRight,
  Clock,
  Layers,
  FileCheck2,
  X,
  Bookmark,
} from "lucide-react";

interface StudentLessonsWorkspaceProps {
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
}

export default function StudentLessonsWorkspace({
  currentUser,
  onNavigateToTab,
}: StudentLessonsWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHsk, setSelectedHsk] = useState(1);
  const [selectedLessonModal, setSelectedLessonModal] = useState<any | null>(null);
  const [lessonModalTab, setLessonModalTab] = useState<"VOCAB" | "GRAMMAR" | "DIALOGUE" | "CULTURE">("VOCAB");

  // Sample structured HSK lessons
  const lessons = [
    {
      id: "lesson-01",
      number: 1,
      titleZh: "你好",
      pinyin: "Nǐ hǎo",
      titleVi: "Xin chào",
      desc: "Làm quen với các cách chào hỏi cơ bản, đại từ nhân xưng 你, 我, 他/她 và cách đáp lễ lịch sự.",
      vocabCount: 8,
      grammarCount: 2,
      durationMin: 30,
      status: "COMPLETED",
      vocabList: [
        { hanzi: "你", pinyin: "nǐ", meaning: "Bạn, anh, chị (ngôi thứ 2 số ít)" },
        { hanzi: "好", pinyin: "hǎo", meaning: "Tốt, khỏe, đẹp" },
        { hanzi: "您", pinyin: "nín", meaning: "Ngài, ông, bà (kính ngữ)" },
        { hanzi: "你们", pinyin: "nǐmen", meaning: "Các bạn, các anh" },
        { hanzi: "对不起", pinyin: "duìbuqǐ", meaning: "Xin lỗi" },
        { hanzi: "没关系", pinyin: "méi guānxi", meaning: "Không sao đâu, không có gì" },
      ],
      grammarList: [
        {
          title: "Đại từ nhân xưng và cách chào hỏi",
          structure: "Đại từ + 好！",
          example: "你好！(Chào bạn!) · 老师好！(Chào thầy/cô!)",
        },
        {
          title: "Biến âm thanh 3 (Tam thanh biến điệu)",
          structure: "Thanh 3 + Thanh 3 ➔ Thanh 2 + Thanh 3",
          example: "Nǐ + hǎo ➔ Ní hǎo (viết vẫn giữ nguyên dấu nǐ hǎo)",
        },
      ],
      dialogue: [
        { speaker: "A", zh: "你好！", pinyin: "Nǐ hǎo!", vi: "Xin chào!" },
        { speaker: "B", zh: "你好！很高兴认识你。", pinyin: "Nǐ hǎo! Hěn gāoxìng rènshí nǐ.", vi: "Chào bạn! Rất vui được quen biết bạn." },
      ],
      culture: "Văn hóa cúi chào và kính ngữ 您 (Nín) trong giao tiếp truyền thống Trung Hoa đối với người lớn tuổi và cấp trên.",
    },
    {
      id: "lesson-02",
      number: 2,
      titleZh: "谢谢你",
      pinyin: "Xièxie nǐ",
      titleVi: "Cảm ơn bạn",
      desc: "Học cách bày tỏ lòng cảm ơn, lời đáp từ chối lịch sự 不客气 và từ biệt 再见.",
      vocabCount: 6,
      grammarCount: 2,
      durationMin: 35,
      status: "COMPLETED",
      vocabList: [
        { hanzi: "谢谢", pinyin: "xièxie", meaning: "Cảm ơn" },
        { hanzi: "不", pinyin: "bù", meaning: "Không (phó từ phủ định)" },
        { hanzi: "客气", pinyin: "kèqi", meaning: "Khách khí, khách sáo" },
        { hanzi: "再见", pinyin: "zàijiàn", meaning: "Tạm biệt" },
      ],
      grammarList: [
        {
          title: "Phủ định với phó từ 不 (Bù)",
          structure: "不 + Tính từ / Động từ",
          example: "不好 (Không tốt) · 不客气 (Không cần khách sáo)",
        },
      ],
      dialogue: [
        { speaker: "A", zh: "谢谢你！", pinyin: "Xièxie nǐ!", vi: "Cảm ơn bạn!" },
        { speaker: "B", zh: "不客气！", pinyin: "Bú kèqi!", vi: "Đừng khách sáo!" },
      ],
      culture: "Nghệ thuật cảm ơn và văn hóa đáp từ khi nhận quà trong phong tục Trung Quốc.",
    },
    {
      id: "lesson-03",
      number: 3,
      titleZh: "你叫什么名字？",
      pinyin: "Nǐ jiào shénme míngzi?",
      titleVi: "Bạn tên là gì?",
      desc: "Hỏi và giới thiệu tên tuổi, họ tên, quốc tịch với đại từ nghi vấn 什么 và động từ 是.",
      vocabCount: 10,
      grammarCount: 3,
      durationMin: 45,
      status: "IN_PROGRESS",
      vocabList: [
        { hanzi: "叫", pinyin: "jiào", meaning: "Gọi là, tên là" },
        { hanzi: "什么", pinyin: "shénme", meaning: "Cái gì, gì (đại từ nghi vấn)" },
        { hanzi: "名字", pinyin: "míngzi", meaning: "Tên" },
        { hanzi: "我", pinyin: "wǒ", meaning: "Tôi, mình (ngôi thứ 1)" },
        { hanzi: "是", pinyin: "shì", meaning: "Là (động từ 是)" },
        { hanzi: "老师", pinyin: "lǎoshī", meaning: "Giáo viên, thầy cô" },
        { hanzi: "学生", pinyin: "xuésheng", meaning: "Học sinh, sinh viên" },
      ],
      grammarList: [
        {
          title: "Câu hỏi với đại từ nghi vấn 什么 (Shénme)",
          structure: "Chủ ngữ + Động từ + 什么 + (Danh từ)?",
          example: "你叫什么名字？(Bạn tên là gì?)",
        },
        {
          title: "Câu phán đoán với động từ 是 (Shì)",
          structure: "A + 是 + B",
          example: "我是老师。(Tôi là giáo viên.) · 我不是学生。(Tôi không phải học sinh.)",
        },
      ],
      dialogue: [
        { speaker: "A", zh: "你叫什么名字？", pinyin: "Nǐ jiào shénme míngzi?", vi: "Bạn tên là gì?" },
        { speaker: "B", zh: "我叫李月。你呢？", pinyin: "Wǒ jiào Lǐ Yuè. Nǐ ne?", vi: "Tôi tên là Lý Nguyệt. Còn bạn thì sao?" },
      ],
      culture: "Ý nghĩa của cấu trúc Họ và Tên trong văn hóa chữ Hán: Họ đặt trước, Tên đặt sau.",
    },
    {
      id: "lesson-04",
      number: 4,
      titleZh: "他是我的汉语老师",
      pinyin: "Tā shì wǒ de hànyǔ lǎoshī",
      titleVi: "Thầy ấy là giáo viên tiếng Trung của tôi",
      desc: "Trợ từ kết cấu 的 biểu thị sở hữu, phân biệt 他 (nam) và 她 (nữ), câu hỏi xác nhận 吗.",
      vocabCount: 9,
      grammarCount: 2,
      durationMin: 40,
      status: "NOT_STARTED",
      vocabList: [
        { hanzi: "她", pinyin: "tā", meaning: "Cô ấy, bà ấy (ngôi 3 nữ)" },
        { hanzi: "谁", pinyin: "shéi / shuí", meaning: "Ai (đại từ nghi vấn)" },
        { hanzi: "的", pinyin: "de", meaning: "Của (trợ từ sở hữu)" },
        { hanzi: "汉语", pinyin: "hànyǔ", meaning: "Tiếng Trung, Hán ngữ" },
      ],
      grammarList: [
        {
          title: "Trợ từ sở hữu 的 (De)",
          structure: "Định ngữ + 的 + Trung tâm ngữ",
          example: "我的汉语老师 (Giáo viên tiếng Trung của tôi)",
        },
      ],
      dialogue: [
        { speaker: "A", zh: "她是谁？", pinyin: "Tā shì shéi?", vi: "Cô ấy là ai thế?" },
        { speaker: "B", zh: "她是我的汉语老师。", pinyin: "Tā shì wǒ de hànyǔ lǎoshī.", vi: "Cô ấy là giáo viên tiếng Trung của mình." },
      ],
      culture: "Nguồn gốc tên gọi 'Hán ngữ' (汉语) bắt nguồn từ thời nhà Hán.",
    },
  ];

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#204434]">
              Kho bài học Chuẩn HSK
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#204434]/10 text-[#204434] text-xs font-semibold border border-[#204434]/20">
              Giáo trình điện tử
            </span>
          </div>
          <p className="text-xs text-[#315E48] mt-1">
            Toàn bộ bài giảng chuẩn theo sách Giáo trình Chuẩn HSK Standard Course tích hợp từ vựng, ngữ pháp, audio và văn hóa.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8ea394] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm bài học, chủ điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-xl pl-9 pr-3 py-2 text-xs text-[#204434] focus:outline-hidden w-64 shadow-2xs"
          />
        </div>
      </div>

      {/* Grid bài học */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.map((ls) => {
          const isDone = ls.status === "COMPLETED";
          const isCurrent = ls.status === "IN_PROGRESS";

          return (
            <div
              key={ls.id}
              onClick={() => setSelectedLessonModal(ls)}
              className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#E5DEC9] shadow-2xs hover:border-[#204434] transition cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48]">
                    Bài {ls.number} · HSK {selectedHsk}
                  </span>

                  {isDone ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã học</span>
                    </span>
                  ) : isCurrent ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Đang học
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                      Chưa học
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg text-[#204434] group-hover:underline flex items-baseline gap-2">
                    <span>{ls.titleZh}</span>
                    <span className="text-xs font-sans font-normal text-[#8F6D3B]">
                      {ls.pinyin}
                    </span>
                  </h3>
                  <p className="text-xs font-medium text-[#315E48] mt-0.5">
                    {ls.titleVi}
                  </p>
                  <p className="text-xs text-[#315E48]/80 mt-1.5 line-clamp-2 leading-relaxed">
                    {ls.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5DEC9]/70 flex items-center justify-between text-xs text-[#315E48]">
                <div className="flex items-center gap-3">
                  <span>{ls.vocabCount} từ mới</span>
                  <span>•</span>
                  <span>{ls.grammarCount} ngữ pháp</span>
                  <span>•</span>
                  <span>{ls.durationMin} phút</span>
                </div>

                <span className="text-xs font-bold text-[#204434] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Mở học</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal xem chi tiết bài học */}
      {selectedLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-2xl rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E5DEC9]">
              <div>
                <span className="text-[11px] font-mono uppercase font-bold text-[#8F6D3B]">
                  Bài {selectedLessonModal.number} · HSK {selectedHsk}
                </span>
                <h3 className="font-serif font-bold text-xl text-[#204434] mt-0.5 flex items-baseline gap-2">
                  <span>{selectedLessonModal.titleZh}</span>
                  <span className="text-sm font-sans font-normal text-[#8F6D3B]">
                    {selectedLessonModal.pinyin}
                  </span>
                </h3>
                <p className="text-xs text-[#315E48]">{selectedLessonModal.titleVi}</p>
              </div>

              <button
                onClick={() => setSelectedLessonModal(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Tabs trong bài học */}
            <div className="flex items-center gap-2 border-b border-[#E5DEC9] pb-2">
              {[
                { id: "VOCAB", label: `Từ vựng (${selectedLessonModal.vocabList.length})` },
                { id: "GRAMMAR", label: `Ngữ pháp (${selectedLessonModal.grammarList.length})` },
                { id: "DIALOGUE", label: "Hội thoại mẫu" },
                { id: "CULTURE", label: "Góc văn hóa" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setLessonModalTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    lessonModalTab === t.id
                      ? "bg-[#204434] text-white shadow-xs"
                      : "text-[#315E48] hover:bg-[#FAF7F0] hover:text-[#204434]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Từ vựng */}
            {lessonModalTab === "VOCAB" && (
              <div className="space-y-2">
                {selectedLessonModal.vocabList.map((v: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSpeak(v.hanzi)}
                        className="w-8 h-8 rounded-full bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#204434] hover:text-white transition flex items-center justify-center cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif font-bold text-base text-[#204434]">
                            {v.hanzi}
                          </span>
                          <span className="text-xs font-mono text-[#8F6D3B]">{v.pinyin}</span>
                        </div>
                        <p className="text-xs text-[#315E48] mt-0.5">{v.meaning}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Ngữ pháp */}
            {lessonModalTab === "GRAMMAR" && (
              <div className="space-y-3">
                {selectedLessonModal.grammarList.map((g: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2 text-xs">
                    <h5 className="font-bold text-sm text-[#204434]">{g.title}</h5>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E5DEC9]/80 font-mono text-emerald-900 font-semibold">
                      {g.structure}
                    </div>
                    <p className="text-[#315E48]">{g.example}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Hội thoại */}
            {lessonModalTab === "DIALOGUE" && (
              <div className="space-y-2">
                {selectedLessonModal.dialogue.map((d: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#204434] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {d.speaker}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif font-bold text-sm text-[#204434]">{d.zh}</span>
                        <span className="text-xs text-[#8F6D3B] font-mono">{d.pinyin}</span>
                      </div>
                      <p className="text-xs text-[#315E48]">{d.vi}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Văn hóa */}
            {lessonModalTab === "CULTURE" && (
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9] text-xs text-[#315E48] leading-relaxed">
                <span className="font-bold text-sm text-[#204434] block mb-2">🏮 Văn hóa & Phong tục:</span>
                <p>{selectedLessonModal.culture}</p>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedLessonModal(null);
                  onNavigateToTab?.("practice");
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
                <span>Luyện từ vựng bài này</span>
              </button>

              <button
                onClick={() => {
                  setSelectedLessonModal(null);
                  onNavigateToTab?.("assignments");
                }}
                className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Làm bài tập củng cố</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
