"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Mic,
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Plus,
  Edit3,
  Trash2,
  MessageSquare,
  Award,
  BookOpen,
  Send,
  HelpCircle,
  Headphones,
  Check,
} from "lucide-react";
import { LessonDialogueLine } from "@/lib/hsk1-full-lessons";

interface AiDialogueRoleplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDialogue?: LessonDialogueLine[];
  lessonTitle?: string;
  lessonNumber?: number;
  hskLevel?: number;
  studentId?: string;
}

export default function AiDialogueRoleplayModal({
  isOpen,
  onClose,
  initialDialogue = [],
  lessonTitle = "Bài học HSK",
  lessonNumber = 1,
  hskLevel = 1,
  studentId,
}: AiDialogueRoleplayModalProps) {
  // Chế độ: THEO HỘI THOẠI BÀI HỌC (LESSON) vs TRÒ CHUYỆN TỰ DO KHÔNG GIỚI HẠN (FREE_TALK)
  const [talkMode, setTalkMode] = useState<"LESSON" | "FREE_TALK">("LESSON");

  // Danh sách câu thoại (cho phép người dùng thêm hoặc sửa theo ý muốn)
  const [dialogueLines, setDialogueLines] = useState<LessonDialogueLine[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState<number>(0);
  const [myRole, setMyRole] = useState<string>("");

  // Trạng thái thu âm và kết quả AI
  const [isRecording, setIsRecording] = useState(false);
  const [spokenResult, setSpokenResult] = useState<string>("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);

  // Form Thêm / Sửa câu thoại
  const [isEditingLine, setIsEditingLine] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editSpeaker, setEditSpeaker] = useState("");
  const [editZh, setEditZh] = useState("");
  const [editPinyin, setEditPinyin] = useState("");
  const [editVi, setEditVi] = useState("");

  // Free talk chat history
  const [freeChatHistory, setFreeChatHistory] = useState<
    Array<{
      sender: "STUDENT" | "AI";
      zh: string;
      pinyin?: string;
      vi?: string;
      score?: number;
      vocab?: any[];
    }>
  >([]);

  // Khởi tạo dialogue từ bài học
  useEffect(() => {
    if (initialDialogue && initialDialogue.length > 0) {
      setDialogueLines(initialDialogue);
      setCurrentLineIdx(0);
      setMyRole(initialDialogue[1]?.speaker || initialDialogue[0]?.speaker || "Tôi");
    } else {
      setDialogueLines([
        { speaker: "王老师", zh: "同学们好！", pinyin: "Tóngxuémen hǎo!", vi: "Chào các em học sinh!" },
        { speaker: "学生们", zh: "老师好！", pinyin: "Lǎoshī hǎo!", vi: "Chúng em chào thầy ạ!" },
        { speaker: "王老师", zh: "今天我们学习第一课。", pinyin: "Jīntiān wǒmen xuéxí dì-yī kè.", vi: "Hôm nay chúng ta học bài 1." },
        { speaker: "学生们", zh: "好的，谢谢老师！", pinyin: "Hǎo de, xièxie lǎoshī!", vi: "Vâng ạ, cảm ơn thầy!" },
      ]);
      setMyRole("学生们");
    }
    setCheckResult(null);
    setSpokenResult("");
  }, [initialDialogue, isOpen]);

  const currentLine = dialogueLines[currentLineIdx] || dialogueLines[0];
  const isMyTurn = currentLine && currentLine.speaker === myRole;

  // Phát âm câu thoại qua Web SpeechSynthesis
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Thu âm qua Web Speech Recognition
  const handleStartRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt chưa hỗ trợ Web Speech API. Vui lòng mở trang web trên Google Chrome hoặc Edge!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsRecording(true);
      setSpokenResult("");
      setCheckResult(null);

      recognition.onresult = async (event: any) => {
        const spoken = event.results[0][0].transcript || "";
        setSpokenResult(spoken);
        setIsRecording(false);
        await verifySpeechWithBackend(spoken);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
      alert("Lỗi khởi tạo micro. Vui lòng cấp quyền truy cập micro cho trình duyệt.");
    }
  };

  // Gửi âm thanh lên backend đối chiếu kho từ điển và chấm điểm
  const verifySpeechWithBackend = async (spokenText: string) => {
    setChecking(true);
    try {
      const targetText = talkMode === "LESSON" ? currentLine?.zh || "" : "";
      const res = await fetch("/api/v1/ai/dialogue-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spokenText,
          targetText,
          mode: talkMode === "LESSON" ? "DIALOGUE" : "FREE_TALK",
          speaker: myRole,
          lessonNumber,
          hskLevel,
          studentId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCheckResult(data);

        if (talkMode === "FREE_TALK") {
          // Thêm vào lịch sử trò chuyện tự do
          setFreeChatHistory((prev) => [
            ...prev,
            {
              sender: "STUDENT",
              zh: spokenText,
              score: data.score,
              vocab: data.vocabDetected,
            },
            ...(data.aiReplyZh
              ? [
                  {
                    sender: "AI" as const,
                    zh: data.aiReplyZh,
                    pinyin: data.aiReplyPinyin,
                    vi: data.aiReplyVi,
                  },
                ]
              : []),
          ]);

          // Tự động phát âm câu đối đáp của AI
          if (data.aiReplyZh) {
            setTimeout(() => speakText(data.aiReplyZh), 600);
          }
        }
      }
    } catch (e) {
      console.warn("verifySpeechWithBackend error:", e);
    } finally {
      setChecking(false);
    }
  };

  // Lưu hoặc thêm câu thoại mới
  const handleSaveDialogueLine = () => {
    if (!editSpeaker.trim() || !editZh.trim()) {
      alert("Vui lòng nhập tên người nói và câu thoại chữ Hán.");
      return;
    }

    const newLine: LessonDialogueLine = {
      speaker: editSpeaker.trim(),
      zh: editZh.trim(),
      pinyin: editPinyin.trim(),
      vi: editVi.trim(),
    };

    if (editingIndex !== null) {
      // Sửa câu có sẵn
      setDialogueLines((prev) => {
        const copy = [...prev];
        copy[editingIndex] = newLine;
        return copy;
      });
    } else {
      // Thêm câu mới vào cuối đoạn hội thoại
      setDialogueLines((prev) => [...prev, newLine]);
    }

    setIsEditingLine(false);
    setEditingIndex(null);
  };

  const handleOpenEdit = (idx: number) => {
    const item = dialogueLines[idx];
    if (!item) return;
    setEditingIndex(idx);
    setEditSpeaker(item.speaker);
    setEditZh(item.zh);
    setEditPinyin(item.pinyin);
    setEditVi(item.vi);
    setIsEditingLine(true);
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setEditSpeaker(myRole || "Tôi");
    setEditZh("");
    setEditPinyin("");
    setEditVi("");
    setIsEditingLine(true);
  };

  const handleDeleteLine = (idx: number) => {
    if (dialogueLines.length <= 1) {
      alert("Cần giữ lại ít nhất 1 câu thoại.");
      return;
    }
    setDialogueLines((prev) => prev.filter((_, i) => i !== idx));
    if (currentLineIdx >= dialogueLines.length - 1) {
      setCurrentLineIdx(Math.max(0, dialogueLines.length - 2));
    }
  };

  if (!isOpen) return null;

  // Lấy danh sách các nhân vật trong đoạn hội thoại
  const allSpeakers = Array.from(new Set(dialogueLines.map((l) => l.speaker)));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-3xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4 max-h-[94vh] overflow-y-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#204434] text-[#BC9B6B] flex items-center justify-center shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#204434]">
                  Luyện Khẩu Ngữ & Hội Thoại AI
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#BC9B6B]/20 text-[#8F6D3B] font-bold">
                  Kho Từ Điển Live
                </span>
              </div>
              <p className="text-xs text-[#315E48]">
                {lessonTitle} · Kết nối trực tiếp dữ liệu từ điển đối chiếu thanh điệu và từ vựng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chuyển đổi 2 chế độ: Theo bài học vs Trò chuyện tự do */}
        <div className="flex items-center gap-2 bg-[#FAF7F0] p-1.5 rounded-2xl border border-[#E5DEC9]">
          <button
            onClick={() => {
              setTalkMode("LESSON");
              setCheckResult(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              talkMode === "LESSON"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Đoạn hội thoại bài học ({dialogueLines.length} câu)</span>
          </button>

          <button
            onClick={() => {
              setTalkMode("FREE_TALK");
              setCheckResult(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              talkMode === "FREE_TALK"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Trò chuyện tự do không giới hạn chủ đề</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* CHẾ ĐỘ 1: LUYỆN HỘI THOẠI THEO BÀI HỌC                              */}
        {/* =================================================================== */}
        {talkMode === "LESSON" && (
          <div className="space-y-4">
            {/* Thanh chọn nhân vật đóng vai & Nút Thêm câu mới */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-2xl border border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#8F6D3B]">Bạn muốn đóng vai:</span>
                <div className="flex items-center gap-1.5">
                  {allSpeakers.map((spk, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMyRole(spk)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        myRole === spk
                          ? "bg-[#204434] text-white shadow-xs"
                          : "bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:bg-white"
                      }`}
                    >
                      {spk}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleOpenAdd}
                className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                title="Thêm câu thoại mới vào đoạn hội thoại"
              >
                <Plus className="w-3.5 h-3.5 text-amber-700" />
                <span>Thêm câu thoại mới</span>
              </button>
            </div>

            {/* Danh sách câu thoại tuần tự */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {dialogueLines.map((line, idx) => {
                const isCurrent = currentLineIdx === idx;
                const isMine = line.speaker === myRole;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentLineIdx(idx);
                      setCheckResult(null);
                    }}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      isCurrent
                        ? "bg-amber-50/70 border-amber-300 shadow-xs"
                        : "bg-white border-[#E5DEC9] hover:bg-[#FAF7F0]"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isMine
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-[#204434] text-white"
                          }`}
                        >
                          {line.speaker} {isMine && "(Vai của bạn)"}
                        </span>
                        <span className="text-[11px] font-mono text-[#8F6D3B]">{line.pinyin}</span>
                      </div>
                      <p className="font-serif font-bold text-base text-[#204434]">{line.zh}</p>
                      <p className="text-xs text-[#315E48]">{line.vi}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(line.zh);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#FAF7F0] cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#8F6D3B]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(idx);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] cursor-pointer"
                        title="Sửa câu thoại này"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLine(idx);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Xóa câu này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ô tương tác nói câu hiện tại */}
            <div className="p-4 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] text-center space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#8F6D3B] block">
                  {isMyTurn ? "👉 Đến lượt bạn nói:" : `🤖 AI đang nói (${currentLine?.speaker}):`}
                </span>
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#204434] block">
                  {currentLine?.zh}
                </span>
                <span className="text-sm font-mono font-bold text-[#8F6D3B] block">
                  {currentLine?.pinyin}
                </span>
                <p className="text-xs text-[#315E48]">{currentLine?.vi}</p>
              </div>

              {/* Nút bấm Micro hoặc Nghe mẫu */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => speakText(currentLine?.zh || "")}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] hover:bg-[#F3EEDD] text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-[#BC9B6B]" />
                  <span>Nghe giọng mẫu</span>
                </button>

                <button
                  onClick={handleStartRecording}
                  disabled={isRecording || checking}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-[#204434] hover:bg-[#183629] text-white"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{isRecording ? "Đang lắng nghe bạn..." : "Bấm Micro để nói câu này"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* CHẾ ĐỘ 2: TRÒ CHUYỆN TỰ DO KHÔNG GIỚI HẠN CHỦ ĐỀ                    */}
        {/* =================================================================== */}
        {talkMode === "FREE_TALK" && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-[#8F6D3B] flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Bạn có thể nói <strong>bất kỳ câu tiếng Trung nào</strong>. Hệ thống sẽ tra cứu kho từ điển để đối chiếu từ vựng, chấm điểm thanh điệu và AI sẽ đối đáp lại tự nhiên!
              </span>
            </div>

            {/* Danh sách hội thoại tự do */}
            <div className="space-y-3 min-h-[180px] max-h-60 overflow-y-auto p-3 bg-white rounded-2xl border border-[#E5DEC9]">
              {freeChatHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#315E48]">
                  Chưa có hội thoại nào. Hãy bấm Micro bên dưới và bắt đầu nói chuyện với AI!
                </div>
              ) : (
                freeChatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.sender === "STUDENT" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-2xs ${
                        msg.sender === "STUDENT"
                          ? "bg-[#204434] text-white"
                          : "bg-[#FAF7F0] border border-[#E5DEC9] text-[#204434]"
                      }`}
                    >
                      <span className="font-serif font-bold text-sm block">{msg.zh}</span>
                      {msg.pinyin && (
                        <span className="font-mono text-[11px] block opacity-90">{msg.pinyin}</span>
                      )}
                      {msg.vi && <p className="text-[11px] opacity-80">{msg.vi}</p>}

                      {msg.score && (
                        <div className="pt-1 text-[10px] text-amber-300 font-bold">
                          Điểm phát âm: {msg.score}/100đ
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Nút Micro thu âm tự do */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={handleStartRecording}
                disabled={isRecording || checking}
                className={`px-8 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-[#204434] hover:bg-[#183629] text-white"
                }`}
              >
                <Mic className="w-5 h-5" />
                <span>
                  {isRecording
                    ? "Đang lắng nghe... Nói bất kỳ điều gì bằng tiếng Trung"
                    : "Bấm Micro và bắt đầu nói chuyện tự do"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* KẾT QUẢ ĐỐI CHIẾU KHO TỪ ĐIỂN & CHẤM ĐIỂM AI */}
        {checkResult && (
          <div className="p-4 bg-white rounded-2xl border border-[#E5DEC9] shadow-xs space-y-3 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-[#204434]">
                  Kết quả đối chiếu Kho từ điển & Phát âm AI:
                </span>
              </div>
              <span className="font-bold text-emerald-700 text-sm">
                {checkResult.score}/100đ
              </span>
            </div>

            <p className="text-[#315E48] font-medium leading-relaxed">{checkResult.feedback}</p>

            {/* Danh sách từ vựng tra cứu được trong câu */}
            {checkResult.vocabDetected && checkResult.vocabDetected.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#8F6D3B]">
                  Từ vựng nhận diện trong câu từ Kho Từ Điển ({checkResult.vocabDetected.length} từ):
                </span>
                <div className="flex flex-wrap gap-2">
                  {checkResult.vocabDetected.map((v: any, vIdx: number) => (
                    <div
                      key={vIdx}
                      className="px-2.5 py-1 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center gap-1.5"
                    >
                      <strong className="font-serif text-[#204434]">{v.hanzi}</strong>
                      <span className="font-mono text-[#8F6D3B] text-[10px]">({v.pinyin})</span>
                      <span className="text-[10px] text-[#315E48]">: {v.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Thêm / Sửa câu thoại */}
        {isEditingLine && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 w-full max-w-md border border-[#E5DEC9] shadow-2xl space-y-3">
              <h4 className="font-serif font-bold text-base text-[#204434]">
                {editingIndex !== null ? "Chỉnh sửa câu thoại" : "Thêm câu thoại mới vào bài"}
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-bold text-[#315E48] block mb-1">Người nói / Nhân vật:</label>
                  <input
                    type="text"
                    value={editSpeaker}
                    onChange={(e) => setEditSpeaker(e.target.value)}
                    placeholder="Ví dụ: 王老师, 学生, 小语, Tôi..."
                    className="w-full p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-[#204434]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#315E48] block mb-1">Câu thoại Chữ Hán:</label>
                  <input
                    type="text"
                    value={editZh}
                    onChange={(e) => setEditZh(e.target.value)}
                    placeholder="Ví dụ: 你好，请问这个多少钱？"
                    className="w-full p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-[#204434] font-serif"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#315E48] block mb-1">Phiên âm Pinyin:</label>
                  <input
                    type="text"
                    value={editPinyin}
                    onChange={(e) => setEditPinyin(e.target.value)}
                    placeholder="Ví dụ: Nǐ hǎo, qǐngwèn zhège duōshao qián?"
                    className="w-full p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-[#204434] font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#315E48] block mb-1">Nghĩa tiếng Việt:</label>
                  <input
                    type="text"
                    value={editVi}
                    onChange={(e) => setEditVi(e.target.value)}
                    placeholder="Ví dụ: Xin chào, xin hỏi cái này bao nhiêu tiền?"
                    className="w-full p-2.5 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] text-[#204434]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditingLine(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveDialogueLine}
                  className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Lưu câu thoại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between">
          <span className="text-xs text-[#315E48]">
            HSK {hskLevel} · Bài {lessonNumber} · Luyện tập phản xạ trực tiếp
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold shadow-xs cursor-pointer transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
