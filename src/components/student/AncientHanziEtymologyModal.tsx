"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { BookOpen, Sparkles, Volume2, X, Feather, Search, Loader2, PenTool, Move } from "lucide-react";

export interface HanziEtymologyData {
  hanzi: string;
  pinyin: string;
  pinyinNum?: string;
  sinoVietnamese: string;
  meaning: string;
  radical: string;
  radicalMeaning: string;
  strokeCount: number;
  mnemonicStory: string;
  components: Array<{ part: string; meaning: string }>;
  collocations: Array<{ zh: string; py: string; vi: string }>;
}

interface AncientHanziEtymologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCharacter?: string;
  onOpenWritingPractice?: (char: string, pinyin?: string, meaning?: string) => void;
}

export default function AncientHanziEtymologyModal({
  isOpen,
  onClose,
  initialCharacter = "你",
  onOpenWritingPractice,
}: AncientHanziEtymologyModalProps) {
  const [inputChar, setInputChar] = useState(initialCharacter);
  const [data, setData] = useState<HanziEtymologyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Vị trí kéo thả di chuyển modal trên màn hình
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initX: 0, initY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) return;
    const touch = e.touches[0];
    if (!touch) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initX: position.x,
      initY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      setPosition({
        x: dragStartRef.current.initX + dx,
        y: dragStartRef.current.initY + dy,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;
      setPosition({
        x: dragStartRef.current.initX + dx,
        y: dragStartRef.current.initY + dy,
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  const fetchEtymology = useCallback(async (charToFetch: string) => {
    const clean = [...charToFetch.trim()].filter((c) => /\p{Script=Han}/u.test(c))[0];
    if (!clean) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/v1/ai/etymology?char=${encodeURIComponent(clean)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.message || "Chưa có thông tin chiết tự cho chữ này.");
      }
    } catch {
      setError("Lỗi kết nối khi tra cứu chiết tự.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCharacter) {
      const firstHanzi = [...initialCharacter].find((c) => /\p{Script=Han}/u.test(c)) || "你";
      setInputChar(firstHanzi);
      if (isOpen) {
        setPosition({ x: 0, y: 0 });
        fetchEtymology(firstHanzi);
      }
    }
  }, [initialCharacter, isOpen, fetchEtymology]);

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

  const playAudio = () => {
    if (!data?.hanzi) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(data.hanzi);
      u.lang = "zh-CN";
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEtymology(inputChar);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="etymology-modal-title"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className="relative z-10 w-full max-w-xl bg-[#FAF4E6] border-2 border-[#BC9B6B] rounded-3xl shadow-2xl overflow-hidden text-[#2B4837] max-h-[92vh] flex flex-col transition-shadow"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(188, 155, 107, 0.15) 0%, transparent 65%),
            linear-gradient(to bottom, #FAF4E6 0%, #F5ECDA 100%)
          `,
        }}
      >
        {/* Ancient Header with Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="h-7 bg-gradient-to-r from-[#5B3E1F] via-[#A88755] to-[#5B3E1F] flex items-center justify-between px-4 shadow-inner cursor-grab active:cursor-grabbing select-none shrink-0"
          title="Kéo thả thanh này để di chuyển bảng chiết tự"
        >
          <div className="flex items-center gap-1.5 text-[#E8D49E]">
            <Move className="w-3 h-3" />
            <span className="text-[10px] tracking-[0.2em] font-serif font-bold uppercase text-[#FAF4E6]/90">
              HANYU · THƯ ĐỒNG CHIẾT TỰ ĐỘNG · KÉO ĐỂ DI CHUYỂN
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#E8D49E]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-5 p-1.5 rounded-full text-[#8C7A5B] hover:text-[#2B4837] hover:bg-[#EAE0CA] transition cursor-pointer z-20"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-7 space-y-4 overflow-y-auto max-h-[calc(92vh-40px)] pr-2 scrollbar-thin">
          {/* Dynamic Search Input for ANY Chinese Character */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputChar}
                onChange={(e) => setInputChar(e.target.value)}
                placeholder="Tra cứu bất kỳ chữ Hán nào (VD: 爱, 龙, 福, 国, 水, 朋)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#BC9B6B]/40 text-sm text-[#2B4837] placeholder-[#8C7A5B]/70 focus:outline-none focus:ring-2 focus:ring-[#BC9B6B] shadow-inner"
              />
              <Search className="w-4 h-4 text-[#8C7A5B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-[#2B4837] hover:bg-[#1E3326] text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Chiết Tự</span>}
            </button>
          </form>

          {error && (
            <div className="p-3 rounded-2xl bg-[#943E30]/10 border border-[#943E30]/30 text-xs text-[#943E30] text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#A87930]" />
              <p className="text-xs text-[#8C7A5B] font-serif">
                Thư đồng đang tra cứu giáp cốt văn và phân rã bộ thủ chữ Hán...
              </p>
            </div>
          ) : data ? (
            <>
              {/* Hero Character Display with Rice Grid */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 sm:p-6 rounded-3xl bg-[#EFE4D0]/80 border border-[#BC9B6B]/40 shadow-sm">
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
                  <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#BC9B6B]/25">
                    <line x1="0" y1="0" x2="100%" y2="100%" strokeDasharray="3,3" />
                    <line x1="100%" y1="0" x2="0" y2="100%" strokeDasharray="3,3" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" strokeDasharray="3,3" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" strokeDasharray="3,3" />
                  </svg>

                  <span className="relative z-10 text-6xl font-serif font-black text-[#2B4837]">
                    {data.hanzi}
                  </span>

                  <button
                    onClick={playAudio}
                    className="absolute -bottom-2 -right-2 p-2 rounded-full bg-[#2B4837] hover:bg-[#1E3326] text-white shadow-md transition cursor-pointer"
                    title="Phát âm tiếng Trung chuẩn"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xl font-bold text-[#A87930]">{data.pinyin}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#6B5A40] font-bold">
                      Hán Việt: {data.sinoVietnamese}
                    </span>
                  </div>
                  <h3 id="etymology-modal-title" className="text-base sm:text-lg font-serif font-bold text-[#2B4837]">
                    {data.meaning}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-[#6B5A40]">
                    <span>Bộ thủ: <strong className="text-[#2B4837]">{data.radical}</strong></span>
                    <span>•</span>
                    <span>Tổng số nét: <strong className="text-[#2B4837]">{data.strokeCount} nét</strong></span>
                  </div>

                  {onOpenWritingPractice && (
                    <div className="pt-1.5 flex items-center justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => onOpenWritingPractice(data.hanzi, data.pinyin, data.meaning)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2B4837] hover:bg-[#1E3326] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        title="Mở phòng luyện viết từng nét theo quy tắc thuận bút"
                      >
                        <PenTool className="w-3.5 h-3.5 text-[#BC9B6B]" />
                        <span>Luyện viết thuận bút chữ này</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mnemonic Story */}
              <div className="p-4 rounded-2xl bg-[#F5ECDA] border border-[#BC9B6B]/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-wider text-[#943E30]">
                  <Sparkles className="w-4 h-4 text-[#943E30]" />
                  <span>Diễn Giải Tượng Hình & Câu Chuyện Chiết Tự</span>
                </div>
                <p className="text-xs sm:text-sm text-[#4A3D28] leading-relaxed italic">
                  "{data.mnemonicStory}"
                </p>
              </div>

              {/* Components Decomposition */}
              {data.components && data.components.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#EFE4D0]/60 border border-[#BC9B6B]/30 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A613E] flex items-center gap-1.5">
                    <Feather className="w-3.5 h-3.5 text-[#A87930]" />
                    Phân tách cấu trúc các thành phần
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.components.map((c, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-[#BC9B6B]/20 text-xs">
                        <span className="w-6 h-6 rounded-lg bg-[#2B4837] text-white flex items-center justify-center font-serif font-bold text-xs shrink-0">
                          {c.part}
                        </span>
                        <span className="text-[#543E1B]">{c.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Collocations */}
              {data.collocations && data.collocations.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#E6EFE9]/70 border border-[#5A876B]/30 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#245238] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#2E7A4A]" />
                    Từ ghép hay gặp trong giáo trình
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {data.collocations.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setInputChar(item.zh);
                          fetchEtymology(item.zh);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/80 border border-[#5A876B]/30 text-xs flex items-center gap-2 cursor-pointer hover:bg-[#E6EFE9] transition"
                        title="Bấm để xem chiết tự từ này"
                      >
                        <span className="font-bold text-[#2B4837]">{item.zh}</span>
                        <span className="text-[#8C7A5B]">({item.py})</span>
                        <span className="text-[#245238] font-medium">: {item.vi}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Ancient Bottom Roller Bar Decoration */}
        <div className="h-3 bg-gradient-to-r from-[#5B3E1F] via-[#A88755] to-[#5B3E1F] shadow-inner" />
      </div>
    </div>
  );
}
