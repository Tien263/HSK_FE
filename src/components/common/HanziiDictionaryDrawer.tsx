"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  X,
  Volume2,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Languages,
  Check,
} from "lucide-react";

interface DictionaryEntry {
  hanzi: string;
  pinyin: string;
  hanViet?: string;
  meaningVi: string;
  partOfSpeech?: string;
  radical?: string;
  strokes?: number;
  examples: { zh: string; pinyin: string; vi: string }[];
}

const COMMON_DICTIONARY_DB: DictionaryEntry[] = [
  {
    hanzi: "你好",
    pinyin: "nǐ hǎo",
    hanViet: "Nễ Hảo",
    meaningVi: "Xin chào",
    partOfSpeech: "Thán từ / Lời chào",
    radical: "亻 (Nhân đứng)",
    strokes: 7,
    examples: [
      { zh: "你好！很高兴认识你。", pinyin: "Nǐ hǎo! Hěn gāoxìng rènshi nǐ.", vi: "Xin chào! Rất vui được làm quen với bạn." },
      { zh: "老师，您好！", pinyin: "Lǎoshī, nín hǎo!", vi: "Em chào thầy/cô ạ!" },
    ],
  },
  {
    hanzi: "谢谢",
    pinyin: "xièxie",
    hanViet: "Tạ Tạ",
    meaningVi: "Cảm ơn",
    partOfSpeech: "Động từ",
    radical: "讠 (Ngôn)",
    strokes: 12,
    examples: [
      { zh: "太谢谢你了！", pinyin: "Tài xièxie nǐ le!", vi: "Cảm ơn bạn rất nhiều!" },
      { zh: "不用谢，不客气。", pinyin: "Bú yòng xiè, bú kèqi.", vi: "Không có chi, đừng khách sáo." },
    ],
  },
  {
    hanzi: "再见",
    pinyin: "zàijiàn",
    hanViet: "Tái Kiến",
    meaningVi: "Tạm biệt, hẹn gặp lại",
    partOfSpeech: "Động từ",
    radical: "冂 (Quynh)",
    strokes: 6,
    examples: [
      { zh: "明天再见！", pinyin: "Míngtiān zàijiàn!", vi: "Ngày mai gặp lại nhé!" },
    ],
  },
  {
    hanzi: "老师",
    pinyin: "lǎoshī",
    hanViet: "Lão Sư",
    meaningVi: "Thầy giáo, cô giáo, giáo viên",
    partOfSpeech: "Danh từ",
    radical: "耂 (Lão)",
    strokes: 6,
    examples: [
      { zh: "王老师是我们的中文老师。", pinyin: "Wáng lǎoshī shì wǒmen de zhōngwén lǎoshī.", vi: "Thầy Vương là giáo viên tiếng Trung của chúng tôi." },
    ],
  },
  {
    hanzi: "学生",
    pinyin: "xuésheng",
    hanViet: "Học Sinh",
    meaningVi: "Học sinh, sinh viên",
    partOfSpeech: "Danh từ",
    radical: "子 (Tử)",
    strokes: 8,
    examples: [
      { zh: "我是北京大学的学生。", pinyin: "Wǒ shì Běijīng Dàxué de xuésheng.", vi: "Tôi là sinh viên của trường Đại học Bắc Kinh." },
    ],
  },
  {
    hanzi: "学习",
    pinyin: "xuéxí",
    hanViet: "Học Tập",
    meaningVi: "Học tập, học hành, rèn luyện",
    partOfSpeech: "Động từ",
    radical: "子 (Tử)",
    strokes: 8,
    examples: [
      { zh: "我们都在努力学习汉语。", pinyin: "Wǒmen dōu zài nǔlì xuéxí Hànyǔ.", vi: "Chúng tôi đều đang nỗ lực học tập tiếng Hán." },
    ],
  },
  {
    hanzi: "汉语",
    pinyin: "Hànyǔ",
    hanViet: "Hán Ngữ",
    meaningVi: "Tiếng Hán, tiếng Trung Quốc",
    partOfSpeech: "Danh từ",
    radical: "氵 (Thủy)",
    strokes: 5,
    examples: [
      { zh: "汉语不难，汉字很有意思。", pinyin: "Hànyǔ bù nán, hànzì hěn yǒu yìsi.", vi: "Tiếng Hán không khó, chữ Hán rất thú vị." },
    ],
  },
  {
    hanzi: "中国",
    pinyin: "Zhōngguó",
    hanViet: "Trung Quốc",
    meaningVi: "Nước Trung Quốc",
    partOfSpeech: "Danh từ riêng",
    radical: "丨 (Cổn)",
    strokes: 4,
    examples: [
      { zh: "我想去中国旅游。", pinyin: "Wǒ xiǎng qù Zhōngguó lǚyóu.", vi: "Tôi muốn đi du lịch Trung Quốc." },
    ],
  },
  {
    hanzi: "朋友",
    pinyin: "péngyou",
    hanViet: "Bằng Hữu",
    meaningVi: "Bạn bè, bạn hữu",
    partOfSpeech: "Danh từ",
    radical: "月 (Nguyệt)",
    strokes: 4,
    examples: [
      { zh: "他是我的好朋友。", pinyin: "Tā shì wǒ de hǎo péngyou.", vi: "Anh ấy là bạn tốt của tôi." },
    ],
  },
  {
    hanzi: "名字",
    pinyin: "míngzi",
    hanViet: "Danh Tự",
    meaningVi: "Tên, tên gọi",
    partOfSpeech: "Danh từ",
    radical: "夕 (Tịch)",
    strokes: 6,
    examples: [
      { zh: "你叫什么名字？", pinyin: "Nǐ jiào shénme míngzi?", vi: "Bạn tên là gì?" },
    ],
  },
  {
    hanzi: "喜欢",
    pinyin: "xǐhuan",
    hanViet: "Hỉ Hoan",
    meaningVi: "Thích, yêu thích",
    partOfSpeech: "Động từ",
    radical: "口 (Khẩu)",
    strokes: 12,
    examples: [
      { zh: "我很喜欢喝中国茶。", pinyin: "Wǒ hěn xǐhuan hē Zhōngguó chá.", vi: "Tôi rất thích uống trà Trung Quốc." },
    ],
  },
  {
    hanzi: "天气",
    pinyin: "tiānqì",
    hanViet: "Thiên Khí",
    meaningVi: "Thời tiết",
    partOfSpeech: "Danh từ",
    radical: "大 (Đại)",
    strokes: 4,
    examples: [
      { zh: "今天天气真好！", pinyin: "Jīntiān tiānqì zhēn hǎo!", vi: "Hôm nay thời tiết thật đẹp!" },
    ],
  },
];

export default function HanziiDictionaryDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && text) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "zh-CN";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  // Lọc kết quả tìm kiếm
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return COMMON_DICTIONARY_DB.slice(0, 6);
    const q = searchQuery.toLowerCase().trim();
    return COMMON_DICTIONARY_DB.filter(
      (item) =>
        item.hanzi.toLowerCase().includes(q) ||
        item.pinyin.toLowerCase().includes(q) ||
        (item.hanViet && item.hanViet.toLowerCase().includes(q)) ||
        item.meaningVi.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Đường link trực tiếp tới Hanzii.net với từ khóa đang tìm
  const hanziiExternalUrl = searchQuery.trim()
    ? `https://hanzii.net/search/word?hl=vi&keyword=${encodeURIComponent(searchQuery.trim())}`
    : `https://hanzii.net`;

  return (
    <>
      {/* Nút nổi mở từ điển ở góc màn hình */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#204434] hover:bg-[#17382F] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 cursor-pointer border border-[#BC9B6B]/40 group"
        title="Mở Từ điển tiếng Trung Hanzii"
      >
        <BookOpen className="w-5 h-5 text-[#BC9B6B] group-hover:rotate-6 transition-transform" />
        <span className="font-serif font-bold text-xs sm:text-sm tracking-wide">Từ điển Hanzii</span>
      </button>

      {/* Drawer trượt từ bên phải */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-md sm:max-w-lg bg-[#FFFCF6] h-full shadow-2xl flex flex-col border-l border-[#BC9B6B]/30 animate-slideLeft">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#FAF7F0] to-[#FFFCF6] border-b border-[#E5DEC9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#204434] text-white flex items-center justify-center font-bold">
                  <Languages className="w-4 h-4 text-[#BC9B6B]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#204434]">
                    Từ điển Hán ngữ Hanzii
                  </h3>
                  <p className="text-[11px] text-[#315E48]">
                    Tra cứu Chữ Hán, Pinyin, Hán Việt và mẫu câu
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ô tìm kiếm */}
            <div className="p-4 border-b border-[#E5DEC9] bg-white space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Gõ Chữ Hán, Pinyin hoặc Tiếng Việt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0]/50 text-xs sm:text-sm focus:bg-white focus:border-[#204434] outline-none transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Nút liên kết trực tiếp sang Hanzii.net */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] text-slate-500">
                  {searchResults.length} kết quả tra nhanh
                </span>
                <a
                  href={hanziiExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#204434] font-bold hover:text-[#8F6D3B] flex items-center gap-1 text-[11px] transition"
                  title="Mở rộng tra cứu đầy đủ bộ thủ, thứ tự nét vẽ và ngữ pháp trên Hanzii.net"
                >
                  <span>Mở trên Hanzii.net</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Danh sách kết quả tra cứu */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {searchResults.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <p className="text-xs text-[#315E48]">
                    Không tìm thấy từ &quot;<strong>{searchQuery}</strong>&quot; trong kho tra nhanh.
                  </p>
                  <a
                    href={hanziiExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#17382F] transition shadow-xs"
                  >
                    <span>Tra &quot;{searchQuery}&quot; trên Hanzii.net</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                searchResults.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3 hover:border-[#204434] transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-baseline gap-2.5">
                          <span className="font-serif font-bold text-2xl text-[#204434]">
                            {entry.hanzi}
                          </span>
                          <span className="font-mono font-bold text-sm text-[#8F6D3B]">
                            {entry.pinyin}
                          </span>
                          {entry.hanViet && (
                            <span className="text-xs text-slate-500">
                              [{entry.hanViet}]
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-sm text-[#204434] mt-1">
                          {entry.meaningVi}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSpeak(entry.hanzi)}
                          className="p-1.5 rounded-lg border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#204434] transition cursor-pointer"
                          title="Phát âm từ này"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://hanzii.net/search/word?hl=vi&keyword=${encodeURIComponent(entry.hanzi)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#8F6D3B] transition cursor-pointer"
                          title="Xem phân tích nét vẽ trên Hanzii.net"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Metadata: Từ loại, bộ thủ, số nét */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {entry.partOfSpeech && (
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#315E48] font-medium border border-[#E5DEC9]">
                          {entry.partOfSpeech}
                        </span>
                      )}
                      {entry.radical && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-medium border border-amber-200">
                          Bộ: {entry.radical}
                        </span>
                      )}
                      {entry.strokes && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 font-medium border border-slate-200">
                          {entry.strokes} nét
                        </span>
                      )}
                    </div>

                    {/* Câu ví dụ ứng dụng */}
                    {entry.examples && entry.examples.length > 0 && (
                      <div className="pt-2 border-t border-[#E5DEC9]/80 space-y-1.5 text-xs">
                        <span className="font-bold text-[#8F6D3B] text-[11px] block">
                          Câu ví dụ minh họa:
                        </span>
                        {entry.examples.map((ex, exIdx) => (
                          <div key={exIdx} className="bg-[#FAF7F0]/60 p-2 rounded-xl space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-bold text-[#204434]">
                                {ex.zh}
                              </span>
                              <button
                                onClick={() => handleSpeak(ex.zh)}
                                className="text-[#8F6D3B] hover:text-[#204434] p-0.5"
                                title="Nghe câu ví dụ"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="font-mono text-[11px] text-[#8F6D3B]">{ex.pinyin}</p>
                            <p className="text-[11px] text-[#315E48] italic">({ex.vi})</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-[#FAF7F0] border-t border-[#E5DEC9] flex items-center justify-between text-xs text-slate-500">
              <span>Hỗ trợ tra cứu nhanh HSK 1 - 6</span>
              <a
                href="https://hanzii.net"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#204434] hover:underline flex items-center gap-1"
              >
                <span>Trang chủ Hanzii.net</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
