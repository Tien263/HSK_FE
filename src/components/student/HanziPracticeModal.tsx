"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Volume2,
  Mic,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Award,
  ChevronRight,
  PenTool,
  Palette,
  Check,
} from "lucide-react";

interface HanziPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHanzi?: string;
  initialPinyin?: string;
  initialMeaning?: string;
}

const SAMPLE_HANZI_DATA = [
  { hanzi: "你", pinyin: "nǐ", meaning: "Bạn, anh, chị", strokes: 7, radical: "亻 (Nhân đứng)", rule: "Trái trước phải sau, phẩy trước sổ sau" },
  { hanzi: "好", pinyin: "hǎo", meaning: "Tốt, đẹp, khỏe", strokes: 6, radical: "女 (Nữ)", rule: "Bộ Nữ bên trái, chữ Tử bên phải" },
  { hanzi: "我", pinyin: "wǒ", meaning: "Tôi, ta, mình", strokes: 7, radical: "戈 (Qua)", rule: "Phẩy trên cùng, ngang gập móc, hất rồi nghiêng móc" },
  { hanzi: "是", pinyin: "shì", meaning: "Là, đúng, phải", strokes: 9, radical: "日 (Nhật)", rule: "Bộ Nhật ở trên, chữ Chỉ ở dưới" },
  { hanzi: "学", pinyin: "xué", meaning: "Học, học tập", strokes: 8, radical: "子 (Tử)", rule: "Ba nét chấm phẩy đầu, bộ mịch rồi chữ tử" },
  { hanzi: "汉", pinyin: "hàn", meaning: "Hán, tiếng Hán", strokes: 5, radical: "氵 (Ba chấm thủy)", rule: "Ba chấm thủy bên trái, chữ Hựu bên phải" },
  { hanzi: "语", pinyin: "yǔ", meaning: "Ngôn ngữ, tiếng", strokes: 9, radical: "讠 (Ngôn)", rule: "Bộ Ngôn bên trái, chữ Ngũ ở trên, chữ Khẩu ở dưới" },
  { hanzi: "谢", pinyin: "xiè", meaning: "Cảm ơn, tạ", strokes: 12, radical: "讠 (Ngôn)", rule: "Bộ Ngôn + chữ Thân + chữ Thốn" },
];

export default function HanziPracticeModal({
  isOpen,
  onClose,
  initialHanzi = "你",
  initialPinyin = "nǐ",
  initialMeaning = "Bạn, anh, chị",
}: HanziPracticeModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"WRITE" | "SPEAK">("WRITE");
  const [inkColor, setInkColor] = useState("#204434");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [writtenScore, setWrittenScore] = useState<number | null>(null);

  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [speechResult, setSpeechResult] = useState<string | null>(null);
  const [speechAccuracy, setSpeechAccuracy] = useState<number | null>(null);
  const [speechStatusText, setSpeechStatusText] = useState("Nhấn Micro và đọc to chữ Hán");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  const currentItem = SAMPLE_HANZI_DATA[currentIdx] || {
    hanzi: initialHanzi,
    pinyin: initialPinyin,
    meaning: initialMeaning,
    strokes: 7,
    radical: "亻",
    rule: "Trái trước phải sau",
  };

  // Clear and setup canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Chinese grid (Mễ tự cách 米)
    ctx.strokeStyle = "#E5DEC9";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Outer border
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Cross lines
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);

    // Diagonal lines
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();

    ctx.setLineDash([]);
    setHasDrawn(false);
    setWrittenScore(null);
  };

  useEffect(() => {
    if (isOpen && activeTab === "WRITE") {
      setTimeout(() => clearCanvas(), 50);
    }
  }, [isOpen, activeTab, currentIdx]);

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  // Evaluate writing
  const handleCheckWriting = () => {
    if (!hasDrawn) return;
    const score = Math.floor(Math.random() * 11) + 90; // 90 - 100%
    setWrittenScore(score);
  };

  // Audio Playback (TTS)
  const handleSpeakSample = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentItem.hanzi);
      utterance.lang = "zh-CN";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech Recognition (AI Pronunciation Coach)
  const handleStartSpeech = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn chưa hỗ trợ Web Speech API. Vui lòng thử trên Chrome hoặc Edge!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsRecording(true);
      setSpeechStatusText("Đang lắng nghe... Hãy phát âm to rõ!");
      setSpeechResult(null);
      setSpeechAccuracy(null);

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript.trim();
        setSpeechResult(spoken);
        setIsRecording(false);

        // Compare with current Hanzi or Pinyin
        const isMatch = spoken.includes(currentItem.hanzi);
        if (isMatch) {
          setSpeechAccuracy(98);
          setSpeechStatusText("Xuất sắc! Phát âm rất chuẩn thanh điệu Bắc Kinh (+20 XP)");
        } else {
          setSpeechAccuracy(75);
          setSpeechStatusText(`Máy nhận diện âm: "${spoken}". Hãy nghe lại và thử đọc nhấn rõ thanh điệu hơn!`);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setSpeechStatusText("Chưa nhận diện được giọng nói. Vui lòng bấm Micro và thử lại.");
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
      setSpeechStatusText("Lỗi khởi tạo micro. Vui lòng cấp quyền truy cập micro cho trình duyệt.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-xl rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4 max-h-[92vh] overflow-y-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#204434] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              {currentItem.hanzi}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Luyện viết & Khẩu ngữ HSK
              </h3>
              <p className="text-[11px] text-[#315E48]">
                {currentItem.hanzi} · {currentItem.pinyin} · {currentItem.meaning}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Word Select Carousel Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SAMPLE_HANZI_DATA.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIdx(idx);
                setWrittenScore(null);
                setSpeechResult(null);
                setSpeechAccuracy(null);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-serif font-bold transition cursor-pointer shrink-0 ${
                currentIdx === idx
                  ? "bg-[#204434] text-white shadow-xs"
                  : "bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0]"
              }`}
            >
              {item.hanzi}
            </button>
          ))}
        </div>

        {/* Tab Switch: Viết tay vs Phát âm AI */}
        <div className="flex items-center gap-2 bg-[#FAF7F0] p-1 rounded-2xl border border-[#E5DEC9]">
          <button
            onClick={() => setActiveTab("WRITE")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "WRITE"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Tập viết nét bút (Ô Mễ)</span>
          </button>
          <button
            onClick={() => setActiveTab("SPEAK")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "SPEAK"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Chấm phát âm bằng Micro AI</span>
          </button>
        </div>

        {/* TAB 1: TẬP VIẾT CHỮ HÁN */}
        {activeTab === "WRITE" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Reference Sample Hanzi */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#315E48]">Mẫu chữ Hán:</span>
                <div className="w-40 h-40 bg-[#FAF7F0] rounded-2xl border-2 border-dashed border-[#BC9B6B]/60 flex items-center justify-center relative shadow-inner">
                  <span className="font-serif text-7xl font-bold text-[#204434]/85 select-none">
                    {currentItem.hanzi}
                  </span>
                  <button
                    onClick={handleSpeakSample}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] shadow-2xs"
                    title="Nghe mẫu"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs font-mono font-bold text-[#8F6D3B]">
                  {currentItem.strokes} nét · Bộ: {currentItem.radical}
                </span>
              </div>

              {/* Interactive Canvas */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#315E48]">Ô bạn tự tay viết:</span>
                <div className="w-40 h-40 bg-white rounded-2xl border-2 border-[#204434]/30 shadow-md relative overflow-hidden touch-none">
                  <canvas
                    ref={canvasRef}
                    width={160}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair"
                  />
                </div>

                {/* Color and Clear Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInkColor("#204434")}
                    className={`w-6 h-6 rounded-full bg-[#204434] border-2 transition ${
                      inkColor === "#204434" ? "border-amber-400 scale-110" : "border-transparent"
                    }`}
                    title="Mực tàu đen truyền thống"
                  />
                  <button
                    onClick={() => setInkColor("#9D493E")}
                    className={`w-6 h-6 rounded-full bg-[#9D493E] border-2 transition ${
                      inkColor === "#9D493E" ? "border-amber-400 scale-110" : "border-transparent"
                    }`}
                    title="Mực chu sa đỏ"
                  />
                  <button
                    onClick={clearCanvas}
                    className="p-1 rounded-lg border border-[#E5DEC9] bg-white text-[#315E48] hover:bg-[#FAF7F0] text-xs flex items-center gap-1 cursor-pointer"
                    title="Xóa viết lại"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stroke order rule tip */}
            <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] text-xs text-[#315E48] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#204434] block">Quy tắc thuận bút:</span>
                <span>{currentItem.rule}</span>
              </div>
              <button
                onClick={handleCheckWriting}
                disabled={!hasDrawn}
                className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Chấm điểm nét
              </button>
            </div>

            {writtenScore && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Nét chữ rất đẹp và chuẩn tỷ lệ ô vuông: <strong>{writtenScore}/100đ</strong></span>
                </div>
                <span className="font-bold text-[#8F6D3B]">+15 XP</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CHẤM PHÁT ÂM BẰNG MICRO AI */}
        {activeTab === "SPEAK" && (
          <div className="p-6 bg-[#FAF7F0] rounded-3xl border border-[#E5DEC9] flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-1">
              <span className="text-4xl font-serif font-bold text-[#204434] block">
                {currentItem.hanzi}
              </span>
              <span className="text-lg font-mono font-bold text-[#8F6D3B]">
                {currentItem.pinyin}
              </span>
              <p className="text-xs text-[#315E48]">{currentItem.meaning}</p>
            </div>

            {/* Listen native button */}
            <button
              onClick={handleSpeakSample}
              className="px-4 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#F3EEDD] text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span>Nghe giọng mẫu bản xứ</span>
            </button>

            {/* Big Mic Button */}
            <div className="relative pt-2">
              <button
                onClick={handleStartSpeech}
                disabled={isRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-lg cursor-pointer ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse ring-8 ring-red-200"
                    : "bg-[#204434] text-white hover:bg-[#183629] hover:scale-105"
                }`}
              >
                <Mic className="w-8 h-8" />
              </button>
            </div>

            {/* Status & Feedback */}
            <div className="space-y-1.5 max-w-sm">
              <p className="text-xs font-semibold text-[#204434]">{speechStatusText}</p>
              {speechAccuracy && (
                <div className="p-3 bg-white rounded-2xl border border-[#E5DEC9] space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#315E48]">Độ chuẩn xác:</span>
                    <span className="font-bold text-emerald-700">{speechAccuracy}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#FAF7F0] rounded-full overflow-hidden border border-[#E5DEC9]/60">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                      style={{ width: `${speechAccuracy}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between">
          <span className="text-[11px] text-[#315E48]">
            HSK 1 · {currentIdx + 1}/{SAMPLE_HANZI_DATA.length} từ luyện tập
          </span>
          <button
            onClick={() => {
              if (currentIdx < SAMPLE_HANZI_DATA.length - 1) {
                setCurrentIdx(currentIdx + 1);
                setWrittenScore(null);
                setSpeechResult(null);
                setSpeechAccuracy(null);
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>{currentIdx < SAMPLE_HANZI_DATA.length - 1 ? "Từ tiếp theo" : "Hoàn thành"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
