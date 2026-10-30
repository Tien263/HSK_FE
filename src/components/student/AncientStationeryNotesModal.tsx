"use client";

import React, { useState, useEffect } from "react";
import { X, PenTool, Sparkles, Trash2, Download, Check, BookOpen } from "lucide-react";

interface NoteItem {
  id: string;
  lessonNumber: number;
  hskLevel: number;
  paperType: "xuan" | "bamboo" | "silk" | "stone";
  brushType: "langhao" | "yanghao" | "zhusha" | "emerald";
  title: string;
  content: string;
  createdAt: string;
}

interface AncientStationeryNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonNumber: number;
  hskLevel: number;
  studentId?: string;
}

export default function AncientStationeryNotesModal({
  isOpen,
  onClose,
  lessonNumber,
  hskLevel,
  studentId = "default",
}: AncientStationeryNotesModalProps) {
  const [paperType, setPaperType] = useState<"xuan" | "bamboo" | "silk" | "stone">("xuan");
  const [brushType, setBrushType] = useState<"langhao" | "yanghao" | "zhusha" | "emerald">("langhao");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [savedNotes, setSavedNotes] = useState<NoteItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
      showToast("Vui lòng hạ bút viết vài nét trước khi lưu!");
      return;
    }

    const newNote: NoteItem = {
      id: Date.now().toString(),
      lessonNumber,
      hskLevel,
      paperType,
      brushType,
      title: noteTitle.trim() || `Bút ký Bài ${lessonNumber} - HSK ${hskLevel}`,
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
    try {
      localStorage.setItem(`hsk_ancient_notes_${studentId}`, JSON.stringify(updated));
    } catch (e) {}

    setNoteTitle("");
    setNoteContent("");
    showToast("Đã lưu nét bút vào Thư phòng thành công!");
  };

  const handleDeleteNote = (id: string) => {
    const updated = savedNotes.filter((n) => n.id !== id);
    setSavedNotes(updated);
    try {
      localStorage.setItem(`hsk_ancient_notes_${studentId}`, JSON.stringify(updated));
    } catch (e) {}
    showToast("Đã tiêu hủy ghi chú!");
  };

  if (!isOpen) return null;

  // Cấu hình phong cách hiển thị theo từng Loại Giấy Cổ Phong
  const getPaperStyles = (type: "xuan" | "bamboo" | "silk" | "stone") => {
    switch (type) {
      case "xuan":
        return {
          bg: "bg-[#F7F2E7] border-[#D4C3A3] text-[#222222]",
          container: "bg-[#F7F2E7] shadow-inner border-[#CFC0A0]",
          name: "Giấy Tuyên Chỉ (宣纸)",
          desc: "Giấy xuyến ngà vàng xơ sợi mộc kinh điển của thư pháp",
        };
      case "bamboo":
        return {
          bg: "bg-[#EFE3C3] border-[#C4AF82] text-[#2C1F0E]",
          container: "bg-[#EFE3C3] shadow-inner border-[#BAA474]",
          name: "Trúc Chỉ (竹纸)",
          desc: "Giấy sợi tre nâu ấm trầm mặc nghìn năm không mục",
        };
      case "silk":
        return {
          bg: "bg-[#FBF4DA] border-[#D8C786] text-[#33250A]",
          container: "bg-[#FBF4DA] shadow-inner border-[#CBB76F]",
          name: "Lụa Thục Cẩm (蜀锦绢帛)",
          desc: "Gấm dệt lụa tơ tằm vàng óng hoàng gia",
        };
      case "stone":
        return {
          bg: "bg-[#25282A] border-[#4A4E52] text-[#E0E2E4]",
          container: "bg-[#1E2022] shadow-inner border-[#3E4246]",
          name: "Hắc Thiếp Mặc Trượng (黑帖)",
          desc: "Bản dập bia đá đen chữ bạc quý hiếm",
        };
    }
  };

  // Cấu hình ngòi bút thư pháp
  const getBrushColor = (brush: "langhao" | "yanghao" | "zhusha" | "emerald", paper: string) => {
    if (paper === "stone") {
      switch (brush) {
        case "zhusha":
          return "text-rose-400 font-serif";
        case "emerald":
          return "text-emerald-300 font-serif";
        default:
          return "text-amber-100 font-serif";
      }
    }
    switch (brush) {
      case "langhao":
        return "text-[#111111] font-serif font-bold";
      case "yanghao":
        return "text-[#3D3A37] font-serif";
      case "zhusha":
        return "text-[#9E2A2B] font-serif font-bold";
      case "emerald":
        return "text-[#204434] font-serif font-bold";
    }
  };

  const currentPaper = getPaperStyles(paperType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#FFFCF6] rounded-3xl shadow-2xl border-2 border-[#BC9B6B] overflow-hidden">
        {/* Header Thư Phòng */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#204434] text-white shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center font-serif text-xl font-bold shadow-xs">
              墨
            </div>
            <div>
              <h2 className="text-base font-bold font-serif flex items-center gap-2">
                <span>Thư Phòng Take Note Cổ Phong · Bút Mực Hán Tự</span>
                <span className="text-xs bg-[#BC9B6B]/30 text-amber-200 px-2 py-0.5 rounded-full font-mono">
                  Bài {lessonNumber} · HSK {hskLevel}
                </span>
              </h2>
              <p className="text-xs text-emerald-100/80">
                Ghi chú kiến thức bằng 4 loại danh chỉ (giấy cổ) & ngòi bút thư pháp danh tiếng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Thanh Chọn Loại Giấy Trung Hoa */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
              <span>1. Chọn loại danh chỉ (Giấy truyền thống):</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "xuan", name: "📜 Giấy Tuyên Chỉ", label: "Tuyên Chỉ ngà" },
                { id: "bamboo", name: "🎋 Trúc Chỉ sợi tre", label: "Trúc Chỉ trầm" },
                { id: "silk", name: "👘 Lụa Thục Cẩm", label: "Gấm Thục vàng" },
                { id: "stone", name: "🌑 Hắc Thiếp bia đá", label: "Hắc Thiếp đen" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaperType(p.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    paperType === p.id
                      ? "bg-[#204434] text-white border-[#204434] shadow-xs font-bold scale-102"
                      : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#FAF7F0] text-xs"
                  }`}
                >
                  <div className="text-xs font-serif font-bold">{p.name}</div>
                  <div className={`text-[10px] mt-0.5 ${paperType === p.id ? "text-amber-200" : "text-slate-500"}`}>
                    {p.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Thanh Chọn Ngòi Bút Lông */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
              <span>2. Chọn ngòi bút & mực thư pháp:</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "langhao", name: "🖌️ Bút Lang Hào", desc: "Mực đậm nét đanh" },
                { id: "yanghao", name: "🖌️ Bút Dương Hào", desc: "Mực khói tao nhã" },
                { id: "zhusha", name: "🔴 Mực Chu Sa Đỏ", desc: "Điểm xuyết chu phê" },
                { id: "emerald", name: "🖋️ Mực Tùng Trúc", desc: "Ngọc bích thư sinh" },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBrushType(b.id as any)}
                  className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs ${
                    brushType === b.id
                      ? "bg-[#BC9B6B] text-white border-[#BC9B6B] shadow-xs font-bold scale-102"
                      : "bg-white text-[#204434] border-[#E5DEC9] hover:bg-[#FAF7F0]"
                  }`}
                >
                  <div className="font-serif font-bold">{b.name}</div>
                  <div className={`text-[10px] ${brushType === b.id ? "text-white" : "text-slate-500"}`}>
                    {b.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Vùng Hạ Bút Viết Ghi Chú mô phỏng mặt giấy thật */}
          <div className={`p-6 rounded-3xl border-2 transition-all duration-300 ${currentPaper.bg}`}>
            <div className="flex items-center justify-between pb-3 border-b border-current/20 mb-3">
              <span className="text-xs font-serif font-bold italic opacity-80">
                {currentPaper.name} · {currentPaper.desc}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">
                Bài {lessonNumber}
              </span>
            </div>

            <input
              type="text"
              placeholder="Tiêu đề bút ký (Ví dụ: Trật tự ngữ pháp câu chữ 把, Mẹo nhớ chữ 谢谢)..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className={`w-full bg-transparent border-b border-current/25 pb-2 text-sm font-serif font-bold focus:outline-hidden mb-3 ${getBrushColor(brushType, paperType)}`}
            />

            <textarea
              rows={5}
              placeholder="Hạ bút ghi chép kiến thức: từ vựng trọng tâm, quy tắc biến âm, cấu trúc câu..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className={`w-full bg-transparent text-sm focus:outline-hidden leading-relaxed resize-none ${getBrushColor(brushType, paperType)}`}
            />

            <div className="flex items-center justify-between pt-3 border-t border-current/20 mt-3">
              <span className="text-[11px] opacity-70 italic">
                Nét chữ sẽ được lưu trữ vĩnh viễn trong Thư phòng của bạn
              </span>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Lưu vào Thư Phòng</span>
              </button>
            </div>
          </div>

          {/* Danh sách các Bút ký đã lưu */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif font-bold text-sm text-[#204434] flex items-center justify-between">
              <span>Bút ký trong thư phòng ({savedNotes.length} bản lưu)</span>
            </h4>

            {savedNotes.length === 0 ? (
              <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-[#E5DEC9] text-xs text-slate-400">
                Chưa có ghi chú nào. Hãy chọn giấy, chấm mực và ghi lại những điều tâm đắc nhé!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {savedNotes.map((note) => {
                  const style = getPaperStyles(note.paperType);
                  return (
                    <div
                      key={note.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 shadow-2xs ${style.bg}`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] opacity-70">
                          <span>Bài {note.lessonNumber} · HSK {note.hskLevel}</span>
                          <span>{note.createdAt}</span>
                        </div>
                        <h5 className="font-serif font-bold text-sm mt-1 line-clamp-1">
                          {note.title}
                        </h5>
                        <p className="text-xs line-clamp-3 mt-1 leading-relaxed opacity-90">
                          {note.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-end pt-2 border-t border-current/15">
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hủy</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Toast thông báo */}
        {toastMsg && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#204434] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg animate-in fade-in duration-200">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}
