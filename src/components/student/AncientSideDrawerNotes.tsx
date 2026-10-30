"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, PenTool, Sparkles, Trash2, Download, Check, BookOpen, Search, FolderOpen, ChevronRight, Bookmark } from "lucide-react";

export interface NoteItem {
  id: string;
  lessonNumber: number;
  hskLevel: number;
  paperType: "xuan" | "bamboo" | "silk" | "stone";
  brushType: "langhao" | "yanghao" | "zhusha" | "emerald";
  title: string;
  content: string;
  createdAt: string;
}

interface AncientSideDrawerNotesProps {
  isOpen: boolean;
  onClose: () => void;
  lessonNumber: number;
  hskLevel: number;
  studentId?: string;
  lessonTitle?: string;
}

export default function AncientSideDrawerNotes({
  isOpen,
  onClose,
  lessonNumber,
  hskLevel,
  studentId = "default",
  lessonTitle = "Bài học",
}: AncientSideDrawerNotesProps) {
  const [activeTab, setActiveTab] = useState<"write" | "archive">("write");
  const [paperType, setPaperType] = useState<"xuan" | "bamboo" | "silk" | "stone">("xuan");
  const [brushType, setBrushType] = useState<"langhao" | "yanghao" | "zhusha" | "emerald">("langhao");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [savedNotes, setSavedNotes] = useState<NoteItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<number | "all">("all");

  // Load danh sách ghi chú từ LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`hsk_ancient_notes_${studentId}`);
        if (stored) {
          setSavedNotes(JSON.parse(stored));
        }
      } catch (e) {}
    }
  }, [studentId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSaveNote = () => {
    if (!noteContent.trim()) {
      showToast("Vui lòng hạ bút viết nội dung trước khi lưu bút ký!");
      return;
    }

    const newNote: NoteItem = {
      id: Date.now().toString(),
      lessonNumber,
      hskLevel,
      paperType,
      brushType,
      title: noteTitle.trim() || `Bút ký HSK ${hskLevel} · Bài ${lessonNumber}`,
      content: noteContent.trim(),
      createdAt: new Date().toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updated = [newNote, ...savedNotes];
    setSavedNotes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`hsk_ancient_notes_${studentId}`, JSON.stringify(updated));
    }

    setNoteTitle("");
    setNoteContent("");
    showToast("Đã đóng ấn triện & lưu vào Thư trai bút ký!");
  };

  const handleDeleteNote = (id: string) => {
    const updated = savedNotes.filter((n) => n.id !== id);
    setSavedNotes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`hsk_ancient_notes_${studentId}`, JSON.stringify(updated));
    }
    showToast("Đã tiêu hủy trang bút ký.");
  };

  // Lọc ghi chú bài này
  const currentLessonNotes = useMemo(() => {
    return savedNotes.filter((n) => n.hskLevel === hskLevel && n.lessonNumber === lessonNumber);
  }, [savedNotes, hskLevel, lessonNumber]);

  // Lọc toàn bộ ghi chú theo tìm kiếm & cấp HSK
  const filteredArchiveNotes = useMemo(() => {
    return savedNotes.filter((n) => {
      const matchLevel = filterLevel === "all" || n.hskLevel === filterLevel;
      const matchQuery =
        !searchQuery.trim() ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchQuery;
    });
  }, [savedNotes, filterLevel, searchQuery]);

  // Cấu hình giấy cổ phong
  const paperConfigs = {
    xuan: {
      name: "Tuyên Chỉ (宣纸)",
      sub: "Giấy xuyến ngà kẻ ô mễ mộc mạc",
      bgClass: "bg-[#F7F2E7] text-[#1A2E22]",
      lineClass: "border-[#D8C7A5]/70",
      guideStyle: {
        backgroundImage: "linear-gradient(to bottom, transparent 27px, #E8DAC2 28px)",
        backgroundSize: "100% 28px",
        lineHeight: "28px",
      },
    },
    bamboo: {
      name: "Trúc Chỉ (竹纸)",
      sub: "Sợi tre cổ phong trầm mặc",
      bgClass: "bg-[#EFE3C8] text-[#241A0E]",
      lineClass: "border-[#C9B38C]/80",
      guideStyle: {
        backgroundImage: "linear-gradient(to bottom, transparent 27px, #D5BF98 28px)",
        backgroundSize: "100% 28px",
        lineHeight: "28px",
      },
    },
    silk: {
      name: "Thục Cẩm (蜀锦)",
      sub: "Lụa dệt hoa mai vàng óng hoàng gia",
      bgClass: "bg-[#FDF9EE] text-[#1A261E]",
      lineClass: "border-[#DECFA6]/80",
      guideStyle: {
        backgroundImage: "linear-gradient(to bottom, transparent 27px, #EFE2BE 28px)",
        backgroundSize: "100% 28px",
        lineHeight: "28px",
      },
    },
    stone: {
      name: "Hắc Thiếp (黑帖)",
      sub: "Bia đá khắc chữ mực bạc thời Đường",
      bgClass: "bg-[#1E2220] text-[#E0E8E3]",
      lineClass: "border-[#3A453F]",
      guideStyle: {
        backgroundImage: "linear-gradient(to bottom, transparent 27px, #2F3832 28px)",
        backgroundSize: "100% 28px",
        lineHeight: "28px",
      },
    },
  };

  // Cấu hình bút lông
  const brushConfigs = {
    langhao: {
      name: "Lang Hào (狼毫)",
      desc: "Mực đen sắc bén",
      textColor: paperType === "stone" ? "text-slate-100" : "text-[#112319]",
      accentColor: "#112319",
    },
    yanghao: {
      name: "Dương Hào (羊毫)",
      desc: "Mực khói mềm mại",
      textColor: paperType === "stone" ? "text-slate-300" : "text-[#3D4D43]",
      accentColor: "#3D4D43",
    },
    zhusha: {
      name: "Chu Sa (朱砂)",
      desc: "Mực son đỏ chu phê",
      textColor: "text-[#B91C1C]",
      accentColor: "#B91C1C",
    },
    emerald: {
      name: "Thanh Trúc (青竹)",
      desc: "Mực ngọc bích thư phòng",
      textColor: paperType === "stone" ? "text-emerald-300" : "text-[#166534]",
      accentColor: "#166534",
    },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Nền làm mờ nhẹ bên trái để học sinh vẫn đọc được bài giảng */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Side Drawer Khung Sách Cổ Phong bên phải */}
      <aside className="relative z-10 w-full sm:w-[480px] md:w-[520px] h-full bg-[#FAF7F0] border-l-4 border-[#BC9B6B] shadow-2xl flex flex-col justify-between animate-slideInRight">
        {/* Viền Gáy Sách Cổ Chỉ Khâu Hoàng Kim */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-[#593418] via-[#8B5A2B] to-[#4A260E] z-20 flex flex-col justify-around py-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-3 h-1 -ml-0.5 rounded-full bg-[#D4AF37] shadow-xs" />
          ))}
        </div>

        {/* 1. Header Bút Ký */}
        <div className="pl-6 pr-5 py-3.5 border-b border-[#BC9B6B]/40 bg-[#F4EDE0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#204434] text-[#D4AF37] flex items-center justify-center font-serif text-sm font-bold shadow-xs">
              墨
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#204434] flex items-center gap-2">
                <span>Thư Trai Bút Ký · Take Note</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#204434] text-[#BC9B6B] font-mono">
                  HSK {hskLevel} · Bài {lessonNumber}
                </span>
              </h3>
              <p className="text-[11px] text-[#315E48] truncate max-w-[280px]">
                {lessonTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#315E48] hover:text-[#204434] hover:bg-[#E5DEC9] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="mx-5 mt-2 p-2 rounded-xl bg-[#204434] text-[#FAF7F0] text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn shadow-md">
            <Check className="w-4 h-4 text-[#D4AF37]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tabs: Viết Ghi Chú vs Kho Lưu Trữ */}
        <div className="px-5 pt-2 flex items-center gap-2 border-b border-[#BC9B6B]/30 bg-[#FAF7F0]">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`pb-2 px-3 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === "write"
                ? "border-[#204434] text-[#204434]"
                : "border-transparent text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-[#8F6D3B]" />
            <span>Hạ bút ghi chú bài này ({currentLessonNotes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("archive")}
            className={`pb-2 px-3 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === "archive"
                ? "border-[#204434] text-[#204434]"
                : "border-transparent text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#8F6D3B]" />
            <span>Kho lưu trữ ({savedNotes.length})</span>
          </button>
        </div>

        {/* 2. Body Nội Dung */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "write" ? (
            <div className="space-y-4">
              {/* Chọn 4 Loại Giấy Cổ Phong */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#204434] uppercase tracking-wider block">
                  Chọn Loại Giấy Thư Họa:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(paperConfigs) as Array<keyof typeof paperConfigs>).map((key) => {
                    const cfg = paperConfigs[key];
                    const isSelected = paperType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPaperType(key)}
                        className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-[#204434] ring-2 ring-[#BC9B6B] shadow-xs bg-white"
                            : "border-[#E5DEC9] bg-[#FAF7F0] hover:bg-white"
                        }`}
                      >
                        <div className="text-xs font-serif font-bold text-[#204434]">
                          {cfg.name}
                        </div>
                        <div className="text-[10px] text-[#315E48] truncate">
                          {cfg.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chọn 4 Loại Bút Lông */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#204434] uppercase tracking-wider block">
                  Chọn Ngòi Bút Lông:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(brushConfigs) as Array<keyof typeof brushConfigs>).map((key) => {
                    const b = brushConfigs[key];
                    const isSelected = brushType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setBrushType(key)}
                        className={`px-3 py-1.5 rounded-xl text-left border text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-[#204434] ring-2 ring-[#BC9B6B] bg-white text-[#204434]"
                            : "border-[#E5DEC9] bg-[#FAF7F0] hover:bg-white text-[#315E48]"
                        }`}
                      >
                        <span>{b.name}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: b.accentColor }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trang Giấy Cổ Phong Viết Ghi Chú */}
              <div
                className={`rounded-2xl p-4 border-2 shadow-inner transition-all duration-300 relative ${paperConfigs[paperType].bgClass} ${paperConfigs[paperType].lineClass}`}
              >
                {/* Dấu Triện Khắc Đỏ Son góc trên */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-md border-2 border-rose-700 text-rose-700 flex items-center justify-center font-serif text-[10px] font-bold rotate-6 opacity-70 select-none">
                  印
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder={`Tiêu đề bút ký (VD: Điểm lưu ý ngữ pháp Bài ${lessonNumber})...`}
                    className={`w-full bg-transparent border-b pb-1 text-xs font-bold focus:outline-hidden placeholder:text-stone-400 font-serif ${brushConfigs[brushType].textColor} ${paperConfigs[paperType].lineClass}`}
                  />

                  <textarea
                    rows={8}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Hạ bút ghi chép từ vựng mới, quy tắc ngữ pháp hoặc mẹo nhớ chữ Hán tại đây..."
                    style={paperConfigs[paperType].guideStyle}
                    className={`w-full bg-transparent resize-none text-xs focus:outline-hidden placeholder:text-stone-400 font-sans ${brushConfigs[brushType].textColor}`}
                  />
                </div>

                {/* Thanh Footer Thao Tác Ghi Chú */}
                <div className="pt-2 flex items-center justify-between border-t border-[#D8C7A5]/60 mt-2">
                  <span className="text-[10px] font-mono opacity-70">
                    HSK {hskLevel} · Bài {lessonNumber} · {paperConfigs[paperType].name}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="px-4 py-1.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Lưu trang bút ký</span>
                    <span className="font-serif text-sm">印</span>
                  </button>
                </div>
              </div>

              {/* Danh sách ghi chú đã có của bài học này */}
              {currentLessonNotes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-[#8F6D3B]" />
                    <span>Các trang bút ký đã lưu của Bài {lessonNumber} ({currentLessonNotes.length}):</span>
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentLessonNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-3 rounded-xl border relative group ${paperConfigs[note.paperType]?.bgClass || "bg-white"} ${paperConfigs[note.paperType]?.lineClass || "border-stone-300"}`}
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-stone-300/60">
                          <h5 className="font-serif font-bold text-xs text-[#204434] truncate max-w-[280px]">
                            {note.title}
                          </h5>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-stone-400 hover:text-red-600 transition p-1 cursor-pointer"
                            title="Xóa trang này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] mt-1.5 whitespace-pre-wrap leading-relaxed text-[#204434]/90">
                          {note.content}
                        </p>
                        <div className="text-[9px] text-[#315E48] mt-1 text-right font-mono">
                          {note.createdAt}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tab: Kho Lưu Trữ Toàn Bộ Bút Ký */
            <div className="space-y-3">
              {/* Thanh Tìm Kiếm & Lọc Cấp Độ */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#315E48] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm nội dung ghi chú..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-xs text-[#204434] focus:outline-hidden"
                  />
                </div>
                <select
                  value={filterLevel}
                  onChange={(e) =>
                    setFilterLevel(e.target.value === "all" ? "all" : Number(e.target.value))
                  }
                  className="bg-white border border-[#E5DEC9] rounded-xl px-2 py-1.5 text-xs font-bold text-[#204434] cursor-pointer"
                >
                  <option value="all">Tất cả HSK</option>
                  {[1, 2, 3, 4, 5, 6].map((l) => (
                    <option key={l} value={l}>
                      HSK {l}
                    </option>
                  ))}
                </select>
              </div>

              {filteredArchiveNotes.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#315E48] space-y-2">
                  <BookOpen className="w-8 h-8 text-[#BC9B6B] mx-auto opacity-70" />
                  <p>Chưa có trang bút ký nào trong kho lưu trữ.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("write")}
                    className="text-xs font-bold text-[#204434] hover:underline"
                  >
                    Hạ bút viết trang đầu tiên ngay &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredArchiveNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3.5 rounded-2xl border relative shadow-xs ${paperConfigs[note.paperType]?.bgClass || "bg-white"} ${paperConfigs[note.paperType]?.lineClass || "border-stone-300"}`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-300/60">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-[#204434] text-[#D4AF37] text-[10px] font-bold">
                            HSK {note.hskLevel} · Bài {note.lessonNumber}
                          </span>
                          <span className="font-serif font-bold text-xs text-[#204434] truncate max-w-[200px]">
                            {note.title}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-stone-400 hover:text-red-600 transition p-1 cursor-pointer"
                          title="Xóa trang này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs mt-2 whitespace-pre-wrap leading-relaxed text-[#204434]/90 font-serif">
                        {note.content}
                      </p>
                      <div className="pt-2 mt-2 flex items-center justify-between text-[10px] text-[#315E48] font-mono border-t border-stone-300/40">
                        <span>{paperConfigs[note.paperType]?.name || "Giấy cổ"}</span>
                        <span>{note.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Footer Bàn Học */}
        <div className="px-5 py-3 border-t border-[#BC9B6B]/40 bg-[#F4EDE0] flex items-center justify-between text-xs text-[#315E48]">
          <span>Sổ tay bút ký cổ phong đính kèm bài học</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#BC9B6B] hover:bg-[#FAF7F0] text-[#204434] font-bold transition cursor-pointer"
          >
            Đóng sổ tay
          </button>
        </div>
      </aside>
    </div>
  );
}
