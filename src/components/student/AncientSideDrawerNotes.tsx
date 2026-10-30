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
  Bookmark,
  RotateCcw,
  Eraser,
  Grid,
  FileText,
  Paintbrush,
  Crown,
  Feather,
  Flame,
  Award,
} from "lucide-react";

export type MasterStyleId = "bamboo_langhao" | "silk_zhusha" | "xuan_yanghao" | "stone_qingzhu";

export interface NoteItem {
  id: string;
  lessonNumber: number;
  hskLevel: number;
  styleId?: MasterStyleId;
  paperType: "bamboo" | "silk" | "xuan" | "stone";
  brushType: "langhao" | "zhusha" | "yanghao" | "emerald";
  title: string;
  content: string;
  drawingDataUrl?: string; // Ảnh nét vẽ thư pháp Canvas chất lượng cao
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

// 4 PHONG CÁCH TẠO TÁC CỔ PHONG KINH ĐIỂN
export const MASTER_STYLES: Record<
  MasterStyleId,
  {
    id: MasterStyleId;
    name: string;
    subName: string;
    icon: string;
    quote: string;
    badge: string;
    paperType: "bamboo" | "silk" | "xuan" | "stone";
    brushType: "langhao" | "zhusha" | "yanghao" | "emerald";
    cardBg: string;
    cardBorder: string;
    cardText: string;
    description: string;
  }
> = {
  bamboo_langhao: {
    id: "bamboo_langhao",
    name: "Khắc Họa Cổ Kính & Trầm Mặc",
    subName: "Trúc Chỉ (竹纸) × Lang Hào (狼毫)",
    icon: "🌿",
    quote: "Bút lực gân guốc sắc bén trên sợi tre nghìn năm",
    badge: "Hành Thư · Thảo Thư Bay Bổng",
    paperType: "bamboo",
    brushType: "langhao",
    cardBg: "from-[#F3E7CA] via-[#E8D7B2] to-[#DBC69D]",
    cardBorder: "border-[#A6874E]",
    cardText: "text-[#3D2914]",
    description:
      "Độ nhám mộc mạc của giấy sợi tre kết hợp với ngòi lông sói đàn hồi cao làm nổi bật nét bút dứt khoát, gân guốc, mang đậm dấu ấn thời gian.",
  },
  silk_zhusha: {
    id: "silk_zhusha",
    name: "Hoàng Gia Kiêu Sa & Sang Trọng",
    subName: "Thục Cẩm (蜀锦) × Chu Sa (朱砂)",
    icon: "🌟",
    quote: "Son đỏ quyền uy trên lụa dệt hoa mai vàng óng",
    badge: "Liễn Sắc Phong Triều Đình",
    paperType: "silk",
    brushType: "zhusha",
    cardBg: "from-[#FDF6E2] via-[#F7EAC7] to-[#EEDBB0]",
    cardBorder: "border-[#C99C3D]",
    cardText: "text-[#4A2E05]",
    description:
      "Sắc son đỏ quyền lực của Chu Sa nổi bật rực rỡ trên lụa gấm dệt hoa mai ngũ phúc, tựa như bút tích ngự phê và sắc phong cung đình sang quý.",
  },
  xuan_yanghao: {
    id: "xuan_yanghao",
    name: "Nền Nã, Quy Chuẩn & Điềm Đạm",
    subName: "Tuyên Chỉ (宣纸) × Dương Hào (羊毫)",
    icon: "📜",
    quote: "Nét mực tròn đầy đặn trên ô mễ tự cách chuẩn mực",
    badge: "Chân Thư Khải Tự · Ô Mễ",
    paperType: "xuan",
    brushType: "yanghao",
    cardBg: "from-[#FAF6ED] via-[#F4EDE0] to-[#E9DFCE]",
    cardBorder: "border-[#8F6D3B]",
    cardText: "text-[#204434]",
    description:
      "Ô Mễ Tự Cách (米字格) giúp căn chỉnh tỷ lệ vàng chữ Hán, phối cùng ngòi lông dê ngậm no mực mềm mại, là chuẩn mực số một để rèn Khải thư và viết kinh.",
  },
  stone_qingzhu: {
    id: "stone_qingzhu",
    name: "Kinh Điển & Huyền Bí Thời Đường",
    subName: "Hắc Thiếp (黑帖) × Thanh Trúc (青竹)",
    icon: "🗿",
    quote: "Mực bạc nhũ lấp lánh trên thác bản bia đá tôn nghiêm",
    badge: "Thác Bản Bia Đá Thời Đường",
    paperType: "stone",
    brushType: "emerald",
    cardBg: "from-[#252B28] via-[#1D211F] to-[#141715]",
    cardBorder: "border-[#52635B]",
    cardText: "text-[#E2E8F0]",
    description:
      "Tái hiện kỹ thuật thác bản dập bia đá thời Đường với nền đen huyền bí tôn nghiêm. Nét bút thân trúc kiêm hào mang lại thần vận cứng cỏi của bậc quân tử.",
  },
};

export default function AncientSideDrawerNotes({
  isOpen,
  onClose,
  lessonNumber,
  hskLevel,
  studentId = "default",
  lessonTitle = "Bài học",
}: AncientSideDrawerNotesProps) {
  const [activeTab, setActiveTab] = useState<"write" | "archive">("write");
  const [activeStyleId, setActiveStyleId] = useState<MasterStyleId>("xuan_yanghao");
  const [writeMode, setWriteMode] = useState<"both" | "brush" | "text">("both");

  // Giấy và Bút đồng bộ theo Phong Cách Tạo Tác (hoặc tùy biến)
  const [paperType, setPaperType] = useState<"bamboo" | "silk" | "xuan" | "stone">("xuan");
  const [brushType, setBrushType] = useState<"langhao" | "zhusha" | "yanghao" | "emerald">("yanghao");
  const [brushSize, setBrushSize] = useState<number>(5.5);
  const [activeTool, setActiveTool] = useState<"brush" | "eraser">("brush");
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Ghi chú dạng văn bản & tiêu đề
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [savedNotes, setSavedNotes] = useState<NoteItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<number | "all">("all");

  // Animation con dấu triện son đỏ
  const [isStamping, setIsStamping] = useState(false);
  const [stampedSuccess, setStampedSuccess] = useState(false);

  // Canvas Drawing Refs & State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const lastPointRef = useRef<{ x: number; y: number; time: number; width: number } | null>(null);

  // Khi chọn phong cách tạo tác -> lập tức đồng bộ cả giấy, bút lông và lưới
  const handleSelectMasterStyle = (styleId: MasterStyleId) => {
    setActiveStyleId(styleId);
    const style = MASTER_STYLES[styleId];
    setPaperType(style.paperType);
    setBrushType(style.brushType);
    if (style.paperType === "xuan") {
      setShowGrid(true);
      setBrushSize(5.5);
    } else if (style.paperType === "bamboo") {
      setShowGrid(false);
      setBrushSize(4.5);
    } else if (style.paperType === "silk") {
      setShowGrid(false);
      setBrushSize(6);
    } else if (style.paperType === "stone") {
      setShowGrid(false);
      setBrushSize(5);
    }
    showToast(`Đã chọn tạo tác: ${style.name}`);
  };

  // Load ghi chú từ LocalStorage
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

  // Cấu hình Bề Mặt Giấy Thư Họa
  const paperConfigs = {
    xuan: {
      name: "Tuyên Chỉ (宣纸)",
      sub: "Giấy xuyến ngà kẻ ô mễ truyền thống",
      bgClass: "bg-[#F8F5EC] text-[#1A2E22]",
      lineClass: "border-[#D8C7A5]",
      canvasBg: "#F8F5EC",
      badgeColor: "bg-[#204434] text-[#FAF7EE]",
    },
    bamboo: {
      name: "Trúc Chỉ (竹纸)",
      sub: "Sợi tre trầm mặc vàng ấm nghìn năm",
      bgClass: "bg-[#EFE2C3] text-[#2D1B0E]",
      lineClass: "border-[#C9B38C]",
      canvasBg: "#EFE2C3",
      badgeColor: "bg-[#5A3816] text-[#F9EED4]",
    },
    silk: {
      name: "Thục Cẩm (蜀锦)",
      sub: "Lụa gấm dệt hoa mai ngũ phúc dát vàng",
      bgClass: "bg-[#FCF5E3] text-[#2B1F0F]",
      lineClass: "border-[#DECFA6]",
      canvasBg: "#FCF5E3",
      badgeColor: "bg-[#9A6B1A] text-[#FFF9E6]",
    },
    stone: {
      name: "Hắc Thiếp (黑帖)",
      sub: "Bia đá khắc chữ thác bản thời Đường",
      bgClass: "bg-[#151816] text-[#E0E8E3]",
      lineClass: "border-[#3A453F]",
      canvasBg: "#151816",
      badgeColor: "bg-[#2A342E] text-[#B8C9C0]",
    },
  };

  // Cấu hình Ngòi Bút Lông & Mực Thư Pháp
  const brushConfigs = {
    langhao: {
      name: "Lang Hào (狼毫)",
      desc: "Lông sói đàn hồi, nét đanh sắc bén",
      textColor: paperType === "stone" ? "text-slate-100" : "text-[#0F1713]",
      color: paperType === "stone" ? "#F1F5F9" : "#0F1713",
      strokeCap: "round" as CanvasLineCap,
    },
    zhusha: {
      name: "Chu Sa (朱砂)",
      desc: "Mực son đỏ chu phê hoàng gia",
      textColor: "text-[#B91C1C]",
      color: "#B91C1C",
      strokeCap: "round" as CanvasLineCap,
    },
    yanghao: {
      name: "Dương Hào (羊毫)",
      desc: "Lông dê mềm mại, ngậm no mực",
      textColor: paperType === "stone" ? "text-slate-200" : "text-[#1C2B22]",
      color: paperType === "stone" ? "#E2E8F0" : "#1C2B22",
      strokeCap: "round" as CanvasLineCap,
    },
    emerald: {
      name: "Thanh Trúc (青竹)",
      desc: "Mực ánh bạc nhũ lấp lánh trên nền đá",
      textColor: paperType === "stone" ? "text-slate-100" : "text-[#166534]",
      color: paperType === "stone" ? "#E2E8F0" : "#166534",
      strokeCap: "round" as CanvasLineCap,
    },
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // -------------------------------------------------------------
  // THUẬT TOÁN MÔ PHỎNG NÉT BÚT LÔNG (Velocity & Pressure Dynamics)
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

    // Lưu snapshot cho Undo
    const dataUrl = canvas.toDataURL();
    setCanvasHistory((prev) => [...prev.slice(-15), dataUrl]);

    lastPointRef.current = {
      x: pos.x,
      y: pos.y,
      time: Date.now(),
      width: brushSize,
    };

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    const startRadius = (activeTool === "eraser" ? brushSize * 3.5 : brushSize) / 2;
    ctx.arc(pos.x, pos.y, startRadius, 0, Math.PI * 2);
    ctx.fillStyle = activeTool === "eraser" ? paperConfigs[paperType].canvasBg : brushConfigs[brushType].color;
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const currentPos = getCanvasCoordinates(e);
    const now = Date.now();
    const last = lastPointRef.current;

    // Tính vận tốc di bút: v = quãng đường / thời gian
    const dist = Math.hypot(currentPos.x - last.x, currentPos.y - last.y);
    const timeDiff = Math.max(now - last.time, 1);
    const velocity = dist / timeDiff;

    // Bút lực: Di nhanh thì nét thanh (thin), di chậm thì nét đậm (thick)
    let targetWidth = brushSize;
    if (activeTool === "eraser") {
      targetWidth = brushSize * 4;
    } else {
      // Công thức điều chế nét cọ thư pháp:
      const velocityFactor = Math.max(0.35, Math.min(1.8, 1 - velocity * 0.18));
      targetWidth = brushSize * velocityFactor;
    }

    // Làm mượt độ dày nét cọ
    const smoothedWidth = last.width * 0.6 + targetWidth * 0.4;

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);

    // Dùng điểm trung gian để bo tròn đường cong Bezier
    const midX = (last.x + currentPos.x) / 2;
    const midY = (last.y + currentPos.y) / 2;
    ctx.quadraticCurveTo(last.x, last.y, midX, midY);

    if (activeTool === "eraser") {
      ctx.strokeStyle = paperConfigs[paperType].canvasBg;
      ctx.lineWidth = smoothedWidth;
    } else {
      ctx.strokeStyle = brushConfigs[brushType].color;
      ctx.lineWidth = smoothedWidth;

      // Hiệu ứng ánh bạc phát quang cho Hắc Thiếp bia đá
      if (paperType === "stone") {
        ctx.shadowColor = "rgba(226, 232, 240, 0.45)";
        ctx.shadowBlur = 3;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPointRef.current = {
      x: currentPos.x,
      y: currentPos.y,
      time: now,
      width: smoothedWidth,
    };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
    lastPointRef.current = null;
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
  // ĐÓNG TRIỆN SON ĐỎ & LƯU TÁC PHẨM
  // -------------------------------------------------------------
  const handleSaveNote = () => {
    const hasText = !!noteContent.trim();
    const hasDrawing = !isCanvasEmpty();

    if (!hasText && !hasDrawing) {
      showToast("Vui lòng hạ bút viết chữ hoặc vẽ nét bút lông trước khi đóng ấn lưu!");
      return;
    }

    // Kích hoạt animation con dấu triện son đỏ
    setIsStamping(true);
    setTimeout(() => {
      let drawingDataUrl: string | undefined = undefined;
      if (hasDrawing && canvasRef.current) {
        drawingDataUrl = canvasRef.current.toDataURL("image/png");
      }

      const style = MASTER_STYLES[activeStyleId];
      const newNote: NoteItem = {
        id: Date.now().toString(),
        lessonNumber,
        hskLevel,
        styleId: activeStyleId,
        paperType,
        brushType,
        title: noteTitle.trim() || `Tác phẩm ${style.name} · Bài ${lessonNumber}`,
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

      setIsStamping(false);
      setStampedSuccess(true);
      setTimeout(() => setStampedSuccess(false), 2000);

      setNoteTitle("");
      setNoteContent("");
      handleClearCanvas();
      showToast(`Đã đóng ấn triện '${style.name}' thành công!`);
    }, 700);
  };

  const handleDeleteNote = (id: string) => {
    const updated = savedNotes.filter((n) => n.id !== id);
    setSavedNotes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`hsk_ancient_notes_${studentId}`, JSON.stringify(updated));
    }
    showToast("Đã tiêu hủy bức thư họa.");
  };

  // Tải ảnh thư họa về máy
  const handleDownloadArtwork = (drawingUrl: string, title: string) => {
    const a = document.createElement("a");
    a.href = drawingUrl;
    a.download = `${title.replace(/\s+/g, "_")}_HanyuArt.png`;
    a.click();
  };

  // Ghi chú của bài này
  const currentLessonNotes = useMemo(() => {
    return savedNotes.filter((n) => n.hskLevel === hskLevel && n.lessonNumber === lessonNumber);
  }, [savedNotes, hskLevel, lessonNumber]);

  // Lọc kho lưu trữ
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
      {/* Nền làm mờ nhẹ bên trái */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Side Drawer Thư Phòng Tạo Tác Cổ Phong Hoàng Kim */}
      <aside className="relative z-10 w-full sm:w-[540px] md:w-[600px] h-full bg-[#FAF7F0] border-l-4 border-[#BC9B6B] shadow-2xl flex flex-col justify-between animate-slideInRight overflow-hidden">
        {/* Nẹp Gáy Sách Cổ Chỉ Khâu Chỉ Đỏ & Đinh Tán Đồng 3D */}
        <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-[#422108] via-[#6E3B14] to-[#341704] z-30 flex flex-col justify-around py-5 shadow-lg">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-4 h-2 -ml-0.5 rounded-full bg-[#E5B842] border border-[#8F6D3B] shadow-xs" />
              <div className="w-0.5 h-7 bg-[#B91C1C] opacity-90 shadow-2xs" />
            </div>
          ))}
        </div>

        {/* 1. Header Bàn Học Thư Phòng */}
        <div className="pl-8 pr-5 py-3.5 border-b border-[#BC9B6B]/40 bg-[#F4EDE0] flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#204434] text-[#E5B842] flex items-center justify-center font-serif text-base font-bold shadow-sm border border-[#BC9B6B]/40">
              墨
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#204434] flex items-center gap-2">
                <span>Thư Trai Bút Ký · Tạo Tác Thư Họa</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#204434] text-[#E5B842] font-mono font-bold shadow-2xs">
                  HSK {hskLevel} · Bài {lessonNumber}
                </span>
              </h3>
              <p className="text-[11px] text-[#315E48] truncate max-w-[300px]">
                {lessonTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#315E48] hover:text-[#204434] hover:bg-[#E5DEC9] transition cursor-pointer"
              title="Đóng thư phòng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="mx-8 mt-2 p-2.5 rounded-xl bg-[#204434] text-[#FAF7F0] text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn shadow-md z-20">
            <Check className="w-4 h-4 text-[#E5B842]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tabs: Tạo Tác Ghi Chép vs Kho Thư Họa Lưu Trữ */}
        <div className="pl-8 pr-5 pt-2 flex items-center gap-2 border-b border-[#BC9B6B]/30 bg-[#FAF7F0] z-20">
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
            <span>Tạo Tác Thư Pháp ({currentLessonNotes.length})</span>
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
            <span>Kho Tác Phẩm Đã Lưu ({savedNotes.length})</span>
          </button>
        </div>

        {/* 2. Body Nội Dung */}
        <div className="flex-1 overflow-y-auto pl-8 pr-5 py-4 space-y-4">
          {activeTab === "write" ? (
            <div className="space-y-4">
              {/* BỘ 4 PHONG CÁCH TẠO TÁC CỔ PHONG HOÀNG KIM */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#204434] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chọn Phong Cách Tạo Tác Thư Họa:</span>
                  </label>
                  <span className="text-[10px] text-[#8F6D3B] font-serif font-bold">
                    {MASTER_STYLES[activeStyleId].badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {(Object.keys(MASTER_STYLES) as MasterStyleId[]).map((sId) => {
                    const st = MASTER_STYLES[sId];
                    const isSelected = activeStyleId === sId;
                    return (
                      <div
                        key={sId}
                        onClick={() => handleSelectMasterStyle(sId)}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? "bg-gradient-to-br ring-2 ring-[#BC9B6B] shadow-md scale-101 border-[#204434]"
                            : "bg-white border-[#E5DEC9] hover:border-[#BC9B6B]/70 hover:shadow-xs"
                        } ${st.cardBg}`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#204434] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                            ✓
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-base">{st.icon}</span>
                            <h4 className={`font-serif font-bold text-xs truncate ${st.cardText}`}>
                              {st.name}
                            </h4>
                          </div>

                          <div className="text-[10px] font-semibold text-[#8F6D3B] truncate">
                            {st.subName}
                          </div>

                          <p className="text-[10px] text-[#315E48] mt-1.5 line-clamp-2 leading-relaxed">
                            {st.description}
                          </p>
                        </div>

                        <div className="pt-2 mt-2 border-t border-black/10 flex items-center justify-between text-[9px] font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-white/70 font-bold text-[#204434] shadow-2xs">
                            {st.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chuyển Đổi Chế Độ Tạo Tác: Cọ Lông / Gõ Chữ / Cả Hai */}
              <div className="bg-[#EFE8DC] p-1 rounded-xl flex items-center justify-between text-xs font-bold shadow-inner">
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
                    Kết hợp (Cọ + Chữ)
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
                    <span>Gõ Chữ Thư Phòng</span>
                  </button>
                </div>

                {writeMode !== "text" && (
                  <button
                    type="button"
                    onClick={() => setShowGrid(!showGrid)}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                      showGrid ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-stone-300 text-stone-500"
                    }`}
                    title="Bật/Tắt Ô Ly Mễ Tự Cách (米字格)"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ô Mễ</span>
                  </button>
                )}
              </div>

              {/* THANH ĐIỀU CHẾ BÚT LỰC & CÔNG CỤ THƯ TRAI */}
              {writeMode !== "text" && (
                <div className="p-3 rounded-2xl bg-white border border-[#BC9B6B]/40 flex items-center justify-between gap-2 flex-wrap shadow-2xs">
                  {/* Lựa chọn cỡ ngòi bút cọ */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#204434]">
                    <span className="text-[11px] text-[#8F6D3B] font-bold">Bút lực:</span>
                    {[
                      { label: "Tiểu Khải", size: 2.5 },
                      { label: "Trung Khải", size: 5.5 },
                      { label: "Đại Khải", size: 10 },
                    ].map((b) => (
                      <button
                        key={b.size}
                        type="button"
                        onClick={() => {
                          setBrushSize(b.size);
                          setActiveTool("brush");
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          brushSize === b.size && activeTool === "brush"
                            ? "bg-[#204434] text-white border-[#204434] shadow-xs"
                            : "bg-[#FAF7F0] border-stone-200 text-[#315E48] hover:bg-[#F2ECE1]"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>

                  {/* Màu mực & Công cụ cọ */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: brushConfigs[brushType].color }}
                      title={`Màu mực: ${brushConfigs[brushType].name}`}
                    />

                    <button
                      type="button"
                      onClick={() => setActiveTool(activeTool === "eraser" ? "brush" : "eraser")}
                      className={`p-1.5 rounded-xl border transition cursor-pointer ${
                        activeTool === "eraser"
                          ? "bg-rose-100 border-rose-400 text-rose-800 ring-2 ring-rose-300"
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                      title={activeTool === "eraser" ? "Đang chọn Tẩy nét" : "Bấm để chọn Tẩy nét cọ"}
                    >
                      <Eraser className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleUndoCanvas}
                      disabled={canvasHistory.length === 0}
                      className="p-1.5 rounded-xl border bg-white border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition cursor-pointer"
                      title="Hoàn tác nét cọ trước"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleClearCanvas}
                      className="px-2.5 py-1 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer"
                    >
                      Rửa bút
                    </button>
                  </div>
                </div>
              )}

              {/* KHUNG TRANH THƯ HỌA HOÀNG KIM (The Antique Paper Canvas) */}
              <div
                className={`rounded-3xl p-5 border-2 shadow-xl transition-all duration-300 relative overflow-hidden ${paperConfigs[paperType].bgClass} ${paperConfigs[paperType].lineClass}`}
              >
                {/* Dấu Triện Son Đỏ Góc Phải (Imperial Seal Stamp) */}
                <div
                  className={`absolute top-4 right-4 w-10 h-10 rounded-md border-2 border-rose-700 text-rose-700 flex items-center justify-center font-serif text-xs font-bold select-none transition-all duration-300 ${
                    isStamping ? "scale-150 rotate-0 shadow-2xl opacity-100" : "rotate-6 opacity-85 shadow-sm"
                  } ${stampedSuccess ? "ring-4 ring-rose-400 bg-rose-50/50" : ""}`}
                >
                  {isStamping ? "御賞" : "印"}
                </div>

                <div className="space-y-3 relative z-10">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder={`Tiêu đề tác phẩm (VD: Khải Thư Bài ${lessonNumber} · ${lessonTitle})...`}
                    className={`w-full bg-transparent border-b pb-1.5 text-xs font-bold focus:outline-hidden placeholder:text-stone-400 font-serif ${brushConfigs[brushType].textColor} ${paperConfigs[paperType].lineClass}`}
                  />

                  {/* CANVAS VẼ BÚT LÔNG NGHỆ THUẬT */}
                  {writeMode !== "text" && (
                    <div className="relative rounded-2xl overflow-hidden border border-[#BC9B6B]/40 shadow-inner bg-white/20">
                      {/* Lưới Ô Mễ Tự Cách (Traditional Rice Grid) */}
                      {showGrid && (
                        <div
                          className="absolute inset-0 pointer-events-none opacity-25"
                          style={{
                            backgroundImage: `
                              linear-gradient(to right, #B91C1C 1px, transparent 1px),
                              linear-gradient(to bottom, #B91C1C 1px, transparent 1px)
                            `,
                            backgroundSize: "70px 70px",
                          }}
                        />
                      )}

                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={240}
                        className="w-full h-[240px] touch-none cursor-crosshair block"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                      />

                      <div className="absolute bottom-1.5 right-3 text-[10px] font-serif opacity-60 pointer-events-none flex items-center gap-1">
                        <span>🖌️</span>
                        <span>{brushConfigs[brushType].desc}</span>
                      </div>
                    </div>
                  )}

                  {/* TEXTAREA GÕ CHỮ THƯ PHÒNG */}
                  {writeMode !== "brush" && (
                    <textarea
                      rows={writeMode === "both" ? 4 : 8}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Gõ chú thích từ vựng, điểm ngữ pháp hoặc thơ đề kèm theo tại đây..."
                      className={`w-full bg-transparent resize-none text-xs focus:outline-hidden placeholder:text-stone-400 font-sans leading-relaxed ${brushConfigs[brushType].textColor}`}
                    />
                  )}
                </div>

                {/* THANH FOOTER THAO TÁC: ĐÓNG TRIỆN SON LƯU */}
                <div className="pt-3 flex items-center justify-between border-t border-[#D8C7A5]/60 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono opacity-80 font-bold">
                      {MASTER_STYLES[activeStyleId].name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveNote}
                    disabled={isStamping}
                    className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer hover:scale-102 active:scale-98 disabled:opacity-50"
                  >
                    <span>Đóng Triện Son Lưu Tác Phẩm</span>
                    <span className="font-serif text-sm text-[#E5B842]">印</span>
                  </button>
                </div>
              </div>

              {/* DANH SÁCH BÚT TÍCH ĐÃ LƯU CỦA BÀI HỌC NÀY */}
              {currentLessonNotes.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-[#8F6D3B]" />
                    <span>Các bức thư họa đã lưu của Bài {lessonNumber} ({currentLessonNotes.length}):</span>
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {currentLessonNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-4 rounded-2xl border-2 relative group shadow-xs ${paperConfigs[note.paperType]?.bgClass || "bg-white"} ${paperConfigs[note.paperType]?.lineClass || "border-stone-300"}`}
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-stone-300/60">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border border-rose-700 text-rose-700 flex items-center justify-center font-serif text-[9px] font-bold">
                              印
                            </span>
                            <h5 className="font-serif font-bold text-xs text-[#204434] truncate max-w-[260px]">
                              {note.title}
                            </h5>
                          </div>
                          <div className="flex items-center gap-1">
                            {note.drawingDataUrl && (
                              <button
                                type="button"
                                onClick={() => handleDownloadArtwork(note.drawingDataUrl!, note.title)}
                                className="p-1 rounded-lg text-stone-500 hover:text-[#204434] hover:bg-black/5 transition cursor-pointer"
                                title="Tải ảnh thư họa về máy"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-stone-400 hover:text-red-600 transition p-1 cursor-pointer"
                              title="Xóa tác phẩm này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Ảnh nét vẽ thư pháp nếu có */}
                        {note.drawingDataUrl && (
                          <div className="my-2.5 p-1 rounded-xl bg-white/60 border border-stone-200">
                            <img
                              src={note.drawingDataUrl}
                              alt="Nét vẽ thư pháp"
                              className="max-h-28 w-auto rounded object-contain mx-auto"
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
            /* TAB 2: KHO LƯU TRỮ TOÀN BỘ TÁC PHẨM THƯ HỌA */
            <div className="space-y-3.5">
              {/* Thanh Tìm Kiếm & Lọc Cấp Độ */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#315E48] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm tác phẩm, thơ đề, ghi chú..."
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

              {/* Danh Sách Thư Họa Đã Lưu */}
              {filteredArchiveNotes.length === 0 ? (
                <div className="p-10 text-center text-xs text-[#8F6D3B] bg-[#FAF7F0] rounded-3xl border-2 border-dashed border-[#BC9B6B]/40 space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-[#8F6D3B]/60" />
                  <p className="font-serif font-bold text-sm text-[#204434]">Chưa có bức thư họa nào trong kho lưu trữ</p>
                  <p className="text-[11px] text-[#315E48]">Hãy chọn một trong 4 phong cách cổ phong và hạ bút lưu lại tác phẩm đầu tiên!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredArchiveNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-3xl border-2 relative ${paperConfigs[note.paperType]?.bgClass || "bg-white"} ${paperConfigs[note.paperType]?.lineClass || "border-stone-300"} shadow-sm`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-stone-300/60">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#204434] text-[#E5B842] text-[10px] font-bold font-mono">
                            HSK {note.hskLevel} · B{note.lessonNumber}
                          </span>
                          <h5 className="font-serif font-bold text-xs text-[#204434]">
                            {note.title}
                          </h5>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {note.drawingDataUrl && (
                            <button
                              type="button"
                              onClick={() => handleDownloadArtwork(note.drawingDataUrl!, note.title)}
                              className="p-1 rounded-lg text-stone-500 hover:text-[#204434] hover:bg-black/5 transition cursor-pointer"
                              title="Tải ảnh về máy"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-stone-400 hover:text-red-600 transition p-1 cursor-pointer"
                            title="Xóa tác phẩm này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Ảnh nét vẽ thư pháp nếu có */}
                      {note.drawingDataUrl && (
                        <div className="my-2.5 p-1.5 rounded-2xl bg-white/70 border border-stone-200">
                          <img
                            src={note.drawingDataUrl}
                            alt="Nét vẽ thư pháp"
                            className="max-h-36 w-auto rounded object-contain mx-auto"
                          />
                        </div>
                      )}

                      {note.content && (
                        <p className="text-xs mt-2 whitespace-pre-wrap leading-relaxed text-[#204434]/90">
                          {note.content}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-stone-300/50 mt-2 text-[10px] text-[#315E48]">
                        <span className="font-serif font-semibold">
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
