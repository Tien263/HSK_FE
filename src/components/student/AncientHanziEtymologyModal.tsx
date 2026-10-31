"use client";

import { useEffect, useState } from "react";
import { BookOpen, Sparkles, Volume2, X, Feather } from "lucide-react";

interface HanziEtymologyData {
  hanzi: string;
  pinyin: string;
  sinoVietnamese: string; // Âm Hán Việt
  meaning: string;
  radical: string;
  radicalMeaning: string;
  strokeCount: number;
  mnemonicStory: string; // Câu chuyện chiết tự nhớ dai
  components: Array<{ part: string; meaning: string }>;
  collocations: Array<{ zh: string; py: string; vi: string }>;
}

const ETYMOLOGY_DATABASE: Record<string, HanziEtymologyData> = {
  "你": {
    hanzi: "你",
    pinyin: "nǐ",
    sinoVietnamese: "Nhĩ",
    meaning: "Bạn, anh, chị (người đối diện)",
    radical: "亻 (Nhân đứng)",
    radicalMeaning: "Chỉ con người",
    strokeCount: 7,
    mnemonicStory: "Gồm bộ Nhân đứng (亻- con người) đứng cạnh chữ Nhĩ (尔). Khi trò chuyện chân thành, ta hướng thẳng về người đối diện mà xưng 'Bạn'.",
    components: [
      { part: "亻", meaning: "Bộ Nhân đứng - con người" },
      { part: "尔", meaning: "Chữ Nhĩ - bản thể, ngươi" },
    ],
    collocations: [
      { zh: "你好", py: "nǐ hǎo", vi: "Xin chào" },
      { zh: "你们", py: "nǐmen", vi: "Các bạn" },
    ],
  },
  "好": {
    hanzi: "好",
    pinyin: "hǎo",
    sinoVietnamese: "Hảo",
    meaning: "Tốt, đẹp, hay, thân ái",
    radical: "女 (Nữ)",
    radicalMeaning: "Người phụ nữ, người mẹ",
    strokeCount: 6,
    mnemonicStory: "Bên trái là Nữ (女 - người mẹ), bên phải là Tử (子 - đứa con nhỏ). Người mẹ ôm con vào lòng chính là cảnh tượng an bình, tốt đẹp nhất cõi đời (Hảo).",
    components: [
      { part: "女", meaning: "Bộ Nữ - người phụ nữ, người mẹ" },
      { part: "子", meaning: "Bộ Tử - đứa con" },
    ],
    collocations: [
      { zh: "好看", py: "hǎokàn", vi: "Đẹp mắt, ưa nhìn" },
      { zh: "好吃", py: "hǎochī", vi: "Ngon miệng" },
    ],
  },
  "学": {
    hanzi: "学",
    pinyin: "xué",
    sinoVietnamese: "Học",
    meaning: "Học tập, tiếp thu tri thức",
    radical: "子 (Tử)",
    radicalMeaning: "Đứa trẻ, thế hệ sau",
    strokeCount: 8,
    mnemonicStory: "Phía trên là mái trường (宀) và các dấu mộc chấm tay truyền chữ, phía dưới là đứa trẻ (子) chăm chỉ ngồi đọc sách mở mang trí tuệ.",
    components: [
      { part: "⺍", meaning: "Tri thức tỏa sáng" },
      { part: "冖", meaning: "Mái nhà, trường học" },
      { part: "子", meaning: "Đứa trẻ, học trò" },
    ],
    collocations: [
      { zh: "学习", py: "xuéxí", vi: "Học tập" },
      { zh: "学生", py: "xuésheng", vi: "Học sinh" },
      { zh: "学校", py: "xuéxiào", vi: "Trường học" },
    ],
  },
  "家": {
    hanzi: "家",
    pinyin: "jiā",
    sinoVietnamese: "Gia",
    meaning: "Nhà, gia đình",
    radical: "宀 (Miên)",
    radicalMeaning: "Mái nhà che chở",
    strokeCount: 10,
    mnemonicStory: "Phía trên là mái nhà (宀), phía dưới là con lợn (豕 - Thỉ). Thời cổ đại nông nghiệp, nhà nào dưới mái hiên có gia súc chăn nuôi tức là nơi ấm no, sung túc và bình yên (Gia đình).",
    components: [
      { part: "宀", meaning: "Mái nhà che chở mưa nắng" },
      { part: "豕", meaning: "Con heo/lợn (gia súc ấm no)" },
    ],
    collocations: [
      { zh: "家人", py: "jiārén", vi: "Người nhà, gia đình" },
      { zh: "回家", py: "huíjiā", vi: "Về nhà" },
    ],
  },
  "明": {
    hanzi: "明",
    pinyin: "míng",
    sinoVietnamese: "Minh",
    meaning: "Sáng sủa, thấu suốt, ngày mai",
    radical: "日 (Nhật)",
    radicalMeaning: "Mặt trời",
    strokeCount: 8,
    mnemonicStory: "Mặt trời (日) của ban ngày đứng cạnh Mặt trăng (月) của ban đêm. Cả hai vầng nhật nguyệt cùng hội tụ thì muôn phương sáng tỏ, không gì che khuất được.",
    components: [
      { part: "日", meaning: "Mặt trời - dương quang chói lọi" },
      { part: "月", meaning: "Mặt trăng - ánh nguyệt dịu êm" },
    ],
    collocations: [
      { zh: "明天", py: "míngtiān", vi: "Ngày mai" },
      { zh: "明白", py: "míngbai", vi: "Hiểu rõ, thấu suốt" },
    ],
  },
  "休": {
    hanzi: "休",
    pinyin: "xiū",
    sinoVietnamese: "Hưu",
    meaning: "Nghỉ ngơi, ngừng lại",
    radical: "亻 (Nhân)",
    radicalMeaning: "Con người",
    strokeCount: 6,
    mnemonicStory: "Người (亻) đi làm đồng mệt nhọc dựa lưng vào bóng mát của gốc cây (木) để uống bát nước, nghỉ dưỡng sức (Nghỉ ngơi - Hưu trí).",
    components: [
      { part: "亻", meaning: "Con người đi đường mệt" },
      { part: "木", meaning: "Cây xanh che bóng mát" },
    ],
    collocations: [
      { zh: "休息", py: "xiūxi", vi: "Nghỉ ngơi" },
      { zh: "休假", py: "xiūjià", vi: "Nghỉ phép" },
    ],
  },
};

interface AncientHanziEtymologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCharacter?: string;
}

export default function AncientHanziEtymologyModal({
  isOpen,
  onClose,
  initialCharacter = "你",
}: AncientHanziEtymologyModalProps) {
  const [selectedChar, setSelectedChar] = useState(initialCharacter);

  useEffect(() => {
    if (initialCharacter) setSelectedChar(initialCharacter);
  }, [initialCharacter]);

  useEffect(() => {
    if (!isOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentData: HanziEtymologyData = ETYMOLOGY_DATABASE[selectedChar] || {
    hanzi: selectedChar,
    pinyin: "—",
    sinoVietnamese: "Hán Tự",
    meaning: "Ý nghĩa từ vựng",
    radical: "Chữ Hán chuẩn",
    radicalMeaning: "Nét cơ bản",
    strokeCount: selectedChar.length,
    mnemonicStory: `Chữ ${selectedChar} mang nét tinh hoa của văn hóa Hán tự cổ phong, từng nét chữ như từng bước đi trên con đường tri thức.`,
    components: [{ part: selectedChar, meaning: "Chữ nguyên bản" }],
    collocations: [],
  };

  const playAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(currentData.hanzi);
      u.lang = "zh-CN";
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="etymology-title"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className="relative z-10 w-full max-w-xl bg-[#FAF4E6] border-2 border-[#BC9B6B] rounded-3xl shadow-2xl overflow-hidden text-[#2B4837]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(188, 155, 107, 0.15) 0%, transparent 65%),
            linear-gradient(to bottom, #FAF4E6 0%, #F5ECDA 100%)
          `,
        }}
      >
        {/* Ancient Scroll Top Roller Bar */}
        <div className="h-5 bg-gradient-to-r from-[#5B3E1F] via-[#A88755] to-[#5B3E1F] flex items-center justify-between px-4 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-[#E8D49E]" />
          <span className="text-[10px] tracking-[0.25em] text-[#FAF4E6]/90 font-serif font-bold uppercase">
            HANYU · THƯ ĐỒNG CHIẾT TỰ · CỔ PHONG TRUNG HOA
          </span>
          <div className="w-2 h-2 rounded-full bg-[#E8D49E]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-7 right-5 p-1.5 rounded-full text-[#8C7A5B] hover:text-[#2B4837] hover:bg-[#EAE0CA] transition cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Selector for Common Characters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-serif font-bold text-[#8C7A5B] shrink-0">Chữ mẫu:</span>
            {Object.keys(ETYMOLOGY_DATABASE).map((ch) => (
              <button
                key={ch}
                onClick={() => setSelectedChar(ch)}
                className={`w-8 h-8 rounded-xl font-serif font-bold text-sm transition cursor-pointer shrink-0 border ${
                  selectedChar === ch
                    ? "bg-[#2B4837] text-[#FAF4E6] border-[#2B4837] shadow-sm"
                    : "bg-[#EFE4D0] text-[#4A3D28] border-[#BC9B6B]/40 hover:bg-[#FAF4E6]"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Large Hero Character Display with Rice Grid (Mễ Tự Cách) */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-[#EFE4D0]/80 border border-[#BC9B6B]/40 shadow-sm">
            {/* The Rice-grid box */}
            <div
              className="relative w-28 h-28 rounded-2xl bg-[#FAF4E6] border-2 border-[#BC9B6B] flex items-center justify-center shrink-0 shadow-inner"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(188, 155, 107, 0.15) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(188, 155, 107, 0.15) 1px, transparent 1px)
                `,
                backgroundSize: "14px 14px",
              }}
            >
              {/* Diagonal guide lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#BC9B6B]/25">
                <line x1="0" y1="0" x2="100%" y2="100%" strokeDasharray="3,3" />
                <line x1="100%" y1="0" x2="0" y2="100%" strokeDasharray="3,3" />
                <line x1="50%" y1="0" x2="50%" y2="100%" strokeDasharray="3,3" />
                <line x1="0" y1="50%" x2="100%" y2="50%" strokeDasharray="3,3" />
              </svg>

              <span className="relative z-10 text-6xl font-serif font-black text-[#2B4837]">
                {currentData.hanzi}
              </span>

              <button
                onClick={playAudio}
                className="absolute -bottom-2 -right-2 p-2 rounded-full bg-[#2B4837] hover:bg-[#1E3326] text-white shadow-md transition cursor-pointer"
                title="Phát âm tiếng Trung"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Linguistic Details */}
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xl font-bold text-[#A87930]">{currentData.pinyin}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#6B5A40] font-bold">
                  Hán Việt: {currentData.sinoVietnamese}
                </span>
              </div>
              <h3 id="etymology-title" className="text-lg font-serif font-bold text-[#2B4837]">
                Nghĩa: {currentData.meaning}
              </h3>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-[#6B5A40]">
                <span>Bộ thủ: <strong className="text-[#2B4837]">{currentData.radical}</strong></span>
                <span>•</span>
                <span>Số nét: <strong className="text-[#2B4837]">{currentData.strokeCount} nét</strong></span>
              </div>
            </div>
          </div>

          {/* Mnemonic Story & Radical Decomposition */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#F5ECDA] border border-[#BC9B6B]/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-wider text-[#943E30]">
                <Sparkles className="w-4 h-4 text-[#943E30]" />
                <span>Câu Chuyện Chiết Tự Ghi Nhớ Sâu</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A3D28] leading-relaxed italic">
                "{currentData.mnemonicStory}"
              </p>
            </div>

            {/* Components Breakdown */}
            <div className="p-4 rounded-2xl bg-[#EFE4D0]/60 border border-[#BC9B6B]/30 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A613E] flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5 text-[#A87930]" />
                Cấu trúc các thành phần
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentData.components.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 border border-[#BC9B6B]/20 text-xs">
                    <span className="w-6 h-6 rounded-lg bg-[#2B4837] text-white flex items-center justify-center font-serif font-bold text-xs shrink-0">
                      {c.part}
                    </span>
                    <span className="text-[#543E1B]">{c.meaning}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collocations */}
            {currentData.collocations.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#E6EFE9]/70 border border-[#5A876B]/30 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#245238] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#2E7A4A]" />
                  Từ ghép kinh điển hay gặp
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentData.collocations.map((item, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-xl bg-white/80 border border-[#5A876B]/30 text-xs flex items-center gap-2">
                      <span className="font-bold text-[#2B4837]">{item.zh}</span>
                      <span className="text-[#8C7A5B]">({item.py})</span>
                      <span className="text-[#245238] font-medium">: {item.vi}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ancient Bottom Roller Bar Decoration */}
        <div className="h-3 bg-gradient-to-r from-[#5B3E1F] via-[#A88755] to-[#5B3E1F] shadow-inner" />
      </div>
    </div>
  );
}
