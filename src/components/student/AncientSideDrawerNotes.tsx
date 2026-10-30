"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  X,
  PenTool,
  Sparkles,
  Trash2,
  Download,
  Check,
  BookOpen,
  Search,
  FolderOpen,
  ChevronRight,
  Bookmark,
  RotateCcw,
  Eraser,
  Grid,
  Palette,
  Maximize2,
  FileText,
  Paintbrush,
} from "lucide-react";

export interface NoteItem {
  id: string;
  lessonNumber: number;
  hskLevel: number;
  paperType: "xuan" | "bamboo" | "silk" | "stone";
  brushType: "langhao" | "yanghao" | "zhusha" | "emerald";
  title: string;
  content: string;
  drawingDataUrl?: string; // Lưu ảnh nét vẽ bút lông từ HTML5 Canvas
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
  const [writeMode, setWriteMode] = useState<"text" | "brush" | "both">("both");
  const [paperType, setPaperType] = useState<"xuan" | "bamboo" | "silk" | "stone">("xuan");
  const [brushType, setBrushType] = useState<"langhao" | "yanghao" | "zhusha" | "emerald">("langhao");
  const [brushSize, setBrushSize] = useState<number>(4);
  const [activeTool, setActiveTool] = useState<"brush" | "eraser">("brush");
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [savedNotes, setSavedNotes] = useState<NoteItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<number | "all">("all");

  // Canvas Drawing Refs & State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

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

  // Cấu hình 4 loại giấy cổ phong truyền thống
  const paperConfigs = {
    xuan: {
      name: "Tuyên Chỉ (宣纸)",
      sub: "Giấy xuyến ngà kẻ ô mễ truyền thống",
      bgClass: "bg-[#F7F2E7] text-[#1A2E22]",
      lineClass: "border-[#D8C7A5]/80",
      accentBg: "#F7F2E7",
      canvasBg: "#F7F2E7",
      guideStyle: {
        backgroundImage: "linear-gradient(to bottom, transparent 27px, #E8DAC2 28px)",
        backgroundSize: "100% 28px",
        lineHeight: "28px",
      },
    },
    bamboo: {
      name: "Trúc Chỉ (竹纸)",
      sub: "Sợi tre vàng ấm nghìn năm không mục",
      bgClass: "bg-[#EFE3C8] text-[#241A0E]",
      lineClass: "border-[#C9B38C]/90",
      accentBg: "#EFE3C8",
      canvasBg: "#EFE3C8",
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
      accentBg: "#FDF9EE",
      canvasBg: "#FDF9EE",
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
      accentBg: "#1E2220",
      canvasBg: "#1E2220",
      guideStyle: {
        backgroundImage: "linear-gradient(to bottom, transparent 27px, #2F3832 28px)",
        backgroundSize: "100% 28px",
        lineHeight: "28px",
      },
    },
  };

  // Cấu hình 4 loại bút lông cổ phong
  const brushConfigs = {
    langhao: {
      name: "Lang Hào (狼毫)",
      desc: "Mực đen sắc bén",
      textColor: paperType === "stone" ? "text-slate-100" : "text-[#112319]",
      color: paperType === "stone" ? "#E2E8F0" : "#112319",
    },
    yanghao: {
      name: "Dương Hào (羊毫)",
      desc: "Mực khói mềm mại",
      textColor: paperType === "stone" ? "text-slate-300" : "text-[#3D4D43]",
      color: paperType === "stone" ? "#CBD5E1" : "#3D4D43",
    },
    zhusha: {
      name: "Chu Sa (朱砂)",
      desc: "Mực son đỏ chu phê",
      textColor: "text-[#B91C1C]",
      color: "#B91C1C",
    },
    emerald: {
      name: "Thanh Trúc (青竹)",
      desc: "Mực ngọc bích thư phòng",
      textColor: paperType === "stone" ? "text-emerald-300" : "text-[#166534]",
      color: paperType === "stone" ? "#6EE7B7" : "#166534",
    },
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // -------------------------------------------------------------
  // CANVAS DRAWING LOGIC (Viết nét bút lông trực tiếp trên màn hình)
  // -------------------------------------------------------------
  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const pos = getCanvasCoordinates(e);
    lastPosRef.current = pos;

    // Lưu snapshot cho Undo
    const dataUrl = canvas.toDataURL();
    setCanvasHistory((prev) => [...prev.slice(-10), dataUrl]);

    // Vẽ điểm đầu tiên
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (activeTool === "eraser" ? brushSize * 3 : brushSize) / 2, 0, Math.PI * 2);
    ctx.fillStyle = activeTool === "eraser" ? paperConfigs[paperType].canvasBg : brushConfigs[brushType].color;
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const currentPos = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);

    if (activeTool === "eraser") {
      ctx.strokeStyle = paperConfigs[paperType].canvasBg;
      ctx.lineWidth = brushSize * 4;
    } else {
      ctx.strokeStyle = brushConfigs[brushType].color;
      ctx.lineWidth = brushSize;
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPosRef.current = currentPos;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasHistory([]);
  };

  const handleUndoCanvas = () => {
    if (canvasHistory.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const lastState = canvasHistory[canvasHistory.length - 1];
    setCanvasHistory((prev) => prev.slice(0, -1));

    const img = new window.Image();
    img.src = lastState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  // Kiểm tra canvas có nét vẽ không
  const isCanvasEmpty = () => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext("2d");
    if (!ctx) return true;
    const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    return !pixelBuffer.some((color) => color !== 0);
  };

  // -------------------------------------------------------------
  // LƯU GHI CHÚ (Text + Canvas Image)
  // -------------------------------------------------------------
  const handleSaveNote = () => {
    const hasText = !!noteContent.trim();
    const hasDrawing = !isCanvasEmpty();

    if (!hasText && !hasDrawing) {
      showToast("Vui lòng hạ bút viết chữ hoặc vẽ nét bút lông trước khi đóng ấn lưu!");
      return;
    }

    let drawingDataUrl: string | undefined = undefined;
    if (hasDrawing && canvasRef.current) {
      drawingDataUrl = canvasRef.current.toDataURL("image/png");
    }

    const newNote: NoteItem = {
      id: Date.now().toString(),
      lessonNumber,
      hskLevel,
      paperType,
      brushType,
      title: noteTitle.trim() || `Bút ký HSK ${hskLevel} · Bài ${lessonNumber}`,
      content: noteContent.trim(),
      drawingDataUrl,
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
    handleClearCanvas();
    showToast("Đã đóng ấn triện son đỏ & lưu vào Sách bút ký cổ!");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Nền làm mờ nhẹ bên trái để học sinh vẫn đọc được bài giảng */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Side Drawer Khung Sách Cổ Phong bên phải mô phỏng Quyển Vở Chỉ Khâu Hoàng Kim */}
      <aside className="relative z-10 w-full sm:w-[500px] md:w-[560px] h-full bg-[#FAF7F0] border-l-4 border-[#BC9B6B] shadow-2xl flex flex-col justify-between animate-slideInRight">
        {/* Viền Gáy Sách Cổ Khâu Chỉ Đỏ Son & Chỉ Vàng Hoàng Tộc */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#4A260E] via-[#7B461E] to-[#391C08] z-20 flex flex-col justify-around py-4 shadow-md">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-3.5 h-1.5 -ml-0.5 rounded-full bg-[#D4AF37] shadow-xs" />
              <div className="w-0.5 h-6 bg-[#B91C1C] opacity-80" />
            </div>
          ))}
        </div>

        {/* 1. Header Bút Ký */}
        <div className="pl-7 pr-5 py-3.5 border-b border-[#BC9B6B]/40 bg-[#F4EDE0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#204434] text-[#D4AF37] flex items-center justify-center font-serif text-sm font-bold shadow-xs">
              墨
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#204434] flex items-center gap-2">
                <span>Thư Trai Bút Ký · Quyển Vở Cổ Phong</span>
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
          <div className="mx-6 mt-2 p-2 rounded-xl bg-[#204434] text-[#FAF7F0] text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn shadow-md">
            <Check className="w-4 h-4 text-[#D4AF37]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tabs: Viết Ghi Chú vs Kho Lưu Trữ */}
        <div className="pl-7 pr-5 pt-2 flex items-center gap-2 border-b border-[#BC9B6B]/30 bg-[#FAF7F0]">
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
            <span>Hạ bút ghi chép bài này ({currentLessonNotes.length})</span>
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
        <div className="flex-1 overflow-y-auto pl-7 pr-5 py-4 space-y-4">
          {activeTab === "write" ? (
            <div className="space-y-4">
              {/* Chọn 4 Loại Giấy Cổ Phong */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#204434] uppercase tracking-wider block">
                    1. Loại Giấy Thư Họa:
                  </label>
                  <span className="text-[10px] text-[#8F6D3B] font-serif">
                    {paperConfigs[paperType].name}
                  </span>
                </div>
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

              {/* Chọn Ngòi Bút Lông & Màu Mực Cổ */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#204434] uppercase tracking-wider block">
                    2. Ngòi Bút Lông & Mực:
                  </label>
                  <span className="text-[10px] text-[#8F6D3B] font-serif">
                    {brushConfigs[brushType].name}
                  </span>
                </div>
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
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: b.color }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chuyển Chế Độ Ghi Chép: Gõ Chữ / Vẽ Bút Lông / Kết Hợp */}
              <div className="bg-[#EFE8DC] p-1 rounded-xl flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setWriteMode("both")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      writeMode === "both"
                        ? "bg-[#204434] text-white shadow-xs"
                        : "text-[#315E48] hover:text-[#204434]"
                    }`}
                  >
                    Kết hợp (Vẽ + Gõ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWriteMode("brush")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                      writeMode === "brush"
                        ? "bg-[#204434] text-white shadow-xs"
                        : "text-[#315E48] hover:text-[#204434]"
                    }`}
                  >
                    <Paintbrush className="w-3.5 h-3.5" />
                    <span>Nét Bút Lông</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWriteMode("text")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                      writeMode === "text"
                        ? "bg-[#204434] text-white shadow-xs"
                        : "text-[#315E48] hover:text-[#204434]"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Gõ Chữ</span>
                  </button>
                </div>

                {writeMode !== "text" && (
                  <div className="flex items-center gap-1 pr-1">
                    <button
                      type="button"
                      onClick={() => setShowGrid(!showGrid)}
                      className={`p-1.5 rounded-lg border text-[11px] transition cursor-pointer ${
                        showGrid ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-stone-300 text-stone-500"
                      }`}
                      title="Bật/Tắt Ô Ly Mễ Tự Cách (米字格)"
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* THANH CÔNG CỤ NÉT BÚT LÔNG (Brush Width & Tools) */}
              {writeMode !== "text" && (
                <div className="p-2.5 rounded-xl bg-white border border-[#BC9B6B]/40 flex items-center justify-between gap-2 flex-wrap">
                  {/* Độ dày nét cọ */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#204434]">
                    <span className="text-[11px] text-[#8F6D3B]">Nét cọ:</span>
                    {[
                      { label: "Tiểu", size: 2 },
                      { label: "Trung", size: 4 },
                      { label: "Đại", size: 8 },
                    ].map((b) => (
                      <button
                        key={b.size}
                        type="button"
                        onClick={() => {
                          setBrushSize(b.size);
                          setActiveTool("brush");
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                          brushSize === b.size && activeTool === "brush"
                            ? "bg-[#204434] text-white border-[#204434]"
                            : "bg-[#FAF7F0] border-stone-200 text-[#315E48]"
                        }`}
                      >
                        {b.label} ({b.size}px)
                      </button>
                    ))}
                  </div>

                  {/* Công cụ vẽ / xóa / hoàn tác */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveTool(activeTool === "eraser" ? "brush" : "eraser")}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        activeTool === "eraser"
                          ? "bg-rose-100 border-rose-400 text-rose-800"
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                      title={activeTool === "eraser" ? "Đang chọn Tẩy nét" : "Bấm để chọn Tẩy"}
                    >
                      <Eraser className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleUndoCanvas}
                      disabled={canvasHistory.length === 0}
                      className="p-1.5 rounded-lg border bg-white border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition cursor-pointer"
                      title="Hoàn tác nét vẽ vừa hạ"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleClearCanvas}
                      className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer"
                    >
                      Xóa bảng vẽ
                    </button>
                  </div>
                </div>
              )}

              {/* TRANG GIẤY CỔ PHONG CHÍNH (Vở Khâu Chỉ 3D) */}
              <div
                className={`rounded-2xl p-4 border-2 shadow-inner transition-all duration-300 relative ${paperConfigs[paperType].bgClass} ${paperConfigs[paperType].lineClass}`}
              >
                {/* Dấu Triện Khắc Đỏ Son góc trên */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-md border-2 border-rose-700 text-rose-700 flex items-center justify-center font-serif text-[10px] font-bold rotate-6 opacity-70 select-none pointer-events-none">
                  印
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder={`Tiêu đề bút ký (VD: Điểm lưu ý ngữ pháp Bài ${lessonNumber})...`}
                    className={`w-full bg-transparent border-b pb-1.5 text-xs font-bold focus:outline-hidden placeholder:text-stone-400 font-serif ${brushConfigs[brushType].textColor} ${paperConfigs[paperType].lineClass}`}
                  />

                  {/* VÙNG VẼ BÚT LÔNG (CANVAS) */}
                  {writeMode !== "text" && (
                    <div className="relative rounded-xl overflow-hidden border border-[#BC9B6B]/30 shadow-inner bg-white/40">
                      {/* Lưới Ô Ly Mễ Tự Cách mờ (Traditional Rice Grid) */}
                      {showGrid && (
                        <div
                          className="absolute inset-0 pointer-events-none opacity-20"
                          style={{
                            backgroundImage: `
                              linear-gradient(to right, #B91C1C 1px, transparent 1px),
                              linear-gradient(to bottom, #B91C1C 1px, transparent 1px)
                            `,
                            backgroundSize: "60px 60px",
                          }}
                        />
                      )}

                      <canvas
                        ref={canvasRef}
                        width={460}
                        height={220}
                        className="w-full h-[220px] touch-none cursor-crosshair block"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                      />

                      <div className="absolute bottom-1 right-2 text-[10px] font-serif text-stone-500 opacity-60 pointer-events-none">
                        🖌️ Hạ bút lông trực tiếp tại đây
                      </div>
                    </div>
                  )}

                  {/* VÙNG GÕ CHỮ THƯ PHÒNG (TEXTAREA) */}
                  {writeMode !== "brush" && (
                    <textarea
                      rows={writeMode === "both" ? 4 : 8}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Gõ chữ ghi chú từ vựng, ngữ pháp, mẹo nhớ phiên âm HSK tại đây..."
                      style={paperConfigs[paperType].guideStyle}
                      className={`w-full bg-transparent resize-none text-xs focus:outline-hidden placeholder:text-stone-400 font-sans ${brushConfigs[brushType].textColor}`}
                    />
                  )}
                </div>

                {/* Thanh Footer Thao Tác Ghi Chú */}
                <div className="pt-2.5 flex items-center justify-between border-t border-[#D8C7A5]/60 mt-2">
                  <span className="text-[10px] font-mono opacity-70">
                    HSK {hskLevel} · Bài {lessonNumber} · {paperConfigs[paperType].name}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Đóng triện lưu bút ký</span>
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
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {currentLessonNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-3.5 rounded-xl border relative group ${paperConfigs[note.paperType]?.bgClass || "bg-white"} ${paperConfigs[note.paperType]?.lineClass || "border-stone-300"}`}
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

                        {/* Ảnh nét vẽ bút lông nếu có */}
                        {note.drawingDataUrl && (
                          <div className="my-2 p-1 rounded-lg bg-white/60 border border-stone-200">
                            <img
                              src={note.drawingDataUrl}
                              alt="Nét vẽ bút lông"
                              className="max-h-24 w-auto rounded object-contain mx-auto"
                            />
                          </div>
                        )}

                        {note.content && (
                          <p className="text-[11px] mt-1.5 whitespace-pre-wrap leading-relaxed text-[#204434]/90">
                            {note.content}
                          </p>
                        )}

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
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-xs font-semibold text-[#204434] focus:outline-hidden"
                >
                  <option value="all">Tất cả HSK</option>
                  {[1, 2, 3, 4, 5, 6].map((l) => (
                    <option key={l} value={l}>
                      HSK {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Danh Sách Toàn Bộ Bút Ký Đã Lưu */}
              {filteredArchiveNotes.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8F6D3B] bg-[#FAF7F0] rounded-2xl border border-dashed border-[#BC9B6B]/40">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-[#8F6D3B]/60" />
                  Chưa có trang bút ký nào phù hợp. Hãy hạ bút lưu lại trang đầu tiên!
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredArchiveNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-2xl border relative ${paperConfigs[note.paperType]?.bgClass || "bg-white"} ${paperConfigs[note.paperType]?.lineClass || "border-stone-300"} shadow-xs`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-300/60">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-[#204434] text-[#BC9B6B] text-[10px] font-bold font-mono">
                            HSK {note.hskLevel} · B{note.lessonNumber}
                          </span>
                          <h5 className="font-serif font-bold text-xs text-[#204434]">
                            {note.title}
                          </h5>
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

                      {/* Ảnh nét vẽ bút lông nếu có */}
                      {note.drawingDataUrl && (
                        <div className="my-2.5 p-1.5 rounded-xl bg-white/70 border border-stone-200">
                          <img
                            src={note.drawingDataUrl}
                            alt="Nét vẽ bút lông"
                            className="max-h-32 w-auto rounded object-contain mx-auto"
                          />
                        </div>
                      )}

                      {note.content && (
                        <p className="text-xs mt-2 whitespace-pre-wrap leading-relaxed text-[#204434]/90">
                          {note.content}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-stone-300/50 mt-2 text-[10px] text-[#315E48]">
                        <span className="font-serif">
                          Giấy: {paperConfigs[note.paperType]?.name} · Bút: {brushConfigs[note.brushType]?.name}
                        </span>
                        <span className="font-mono">{note.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
