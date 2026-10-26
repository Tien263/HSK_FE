"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  BookOpen,
  RotateCcw,
  Volume2,
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Award,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface VocabItem {
  progressId: string;
  vocabId: string;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  wordType: string | null;
  exampleHanzi: string | null;
  exampleMeaning: string | null;
  leitnerBox: number;
  correctStreak: number;
  nextReviewAt: string;
  lastReviewedAt: string;
}

interface VocabStats {
  total: number;
  box1: number;
  box2: number;
  box3: number;
  box4: number;
  box5: number;
}

interface VocabNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentUsername?: string;
  onWordAdded?: () => void;
}

export default function VocabNotebookModal({
  isOpen,
  onClose,
  studentId,
  studentUsername,
  onWordAdded,
}: VocabNotebookModalProps) {
  const [activeTab, setActiveTab] = useState<"flashcards" | "list" | "add">("flashcards");
  const [items, setItems] = useState<VocabItem[]>([]);
  const [stats, setStats] = useState<VocabStats>({
    total: 0,
    box1: 0,
    box2: 0,
    box3: 0,
    box4: 0,
    box5: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedBoxFilter, setSelectedBoxFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Flashcard state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [answeredFeedback, setAnsweredFeedback] = useState<string | null>(null);

  // Add new word form state
  const [newHanzi, setNewHanzi] = useState("");
  const [newPinyin, setNewPinyin] = useState("");
  const [newMeaningVi, setNewMeaningVi] = useState("");
  const [newWordType, setNewWordType] = useState("Danh từ");
  const [newExampleHanzi, setNewExampleHanzi] = useState("");
  const [newExampleMeaning, setNewExampleMeaning] = useState("");
  const [addingWord, setAddingWord] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState("");

  const fetchNotebook = useCallback(async () => {
    setLoading(true);
    try {
      let query = `box=${selectedBoxFilter}`;
      if (studentId) query += `&studentId=${encodeURIComponent(studentId)}`;
      else if (studentUsername) query += `&username=${encodeURIComponent(studentUsername)}`;

      const res = await fetch(`/api/v1/my/vocab-notebook?${query}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        if (data.stats) setStats(data.stats);
        if (currentIndex >= (data.items || []).length) {
          setCurrentIndex(0);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedBoxFilter, studentId, studentUsername, currentIndex]);

  useEffect(() => {
    if (isOpen) {
      fetchNotebook();
    }
  }, [isOpen, fetchNotebook]);

  // Handle Speech
  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle Answer in Flashcards
  const handleAnswerCard = async (remembered: boolean) => {
    const currentItem = items[currentIndex];
    if (!currentItem) return;

    try {
      const res = await fetch("/api/v1/my/vocab-review/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressId: currentItem.progressId,
          remembered,
        }),
      });
      const data = await res.json();
      if (data.success && data.updated) {
        setAnsweredFeedback(remembered ? "🎉 Xuất sắc! Thẻ đã thăng hạng!" : "💪 Đừng nản, từ này sẽ ôn lại sớm!");
        setTimeout(() => setAnsweredFeedback(null), 1500);

        // Update local item
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === currentIndex
              ? { ...it, leitnerBox: data.updated.leitnerBox, correctStreak: data.updated.correctStreak }
              : it
          )
        );
      }
    } catch (e) {
      console.error(e);
    }

    setIsFlipped(false);
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Delete word from notebook
  const handleDeleteWord = async (progressId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa từ vựng này khỏi Sổ tay ôn tập?")) return;
    try {
      const res = await fetch(`/api/v1/my/vocab-notebook?progressId=${progressId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((it) => it.progressId !== progressId));
        setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add new word
  const handleCreateWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHanzi.trim() || !newMeaningVi.trim()) return;

    setAddingWord(true);
    setAddSuccessMsg("");
    try {
      const res = await fetch("/api/v1/my/vocab-notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          username: studentUsername,
          hanzi: newHanzi,
          pinyin: newPinyin,
          meaningVi: newMeaningVi,
          wordType: newWordType,
          exampleHanzi: newExampleHanzi,
          exampleMeaning: newExampleMeaning,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddSuccessMsg(data.message || "Đã lưu từ vựng vào Sổ tay!");
        setNewHanzi("");
        setNewPinyin("");
        setNewMeaningVi("");
        setNewExampleHanzi("");
        setNewExampleMeaning("");
        fetchNotebook();
        if (onWordAdded) onWordAdded();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingWord(false);
    }
  };

  if (!isOpen) return null;

  const filteredItems = items.filter(
    (it) =>
      it.hanzi.includes(searchTerm) ||
      it.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.meaningVi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentCard = items[currentIndex];

  const getBoxColor = (box: number) => {
    switch (box) {
      case 1:
        return "bg-rose-100 text-rose-700 border-rose-300";
      case 2:
        return "bg-amber-100 text-amber-700 border-amber-300";
      case 3:
        return "bg-sky-100 text-sky-700 border-sky-300";
      case 4:
        return "bg-indigo-100 text-indigo-700 border-indigo-300";
      case 5:
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl shadow-inner">
              📖
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Sổ tay Từ vựng Cá nhân & Thẻ Flashcard SRS
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                  {stats.total} từ
                </span>
              </h2>
              <p className="text-xs text-teal-100">
                Thuật toán Lặp lại ngắt quãng (Leitner SRS 5 Hộp) — Học sâu nhớ lâu, không lo quên chữ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leitner Box Badges Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="font-semibold text-slate-600">Hộp ghi nhớ:</span>
            <button
              onClick={() => setSelectedBoxFilter("all")}
              className={`px-3 py-1 rounded-xl font-medium transition-all ${
                selectedBoxFilter === "all"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              onClick={() => setSelectedBoxFilter("1")}
              className={`px-2.5 py-1 rounded-xl font-medium border transition-all ${
                selectedBoxFilter === "1" ? "bg-rose-500 text-white border-rose-600" : "bg-white text-rose-700 border-rose-200"
              }`}
            >
              Hộp 1 ({stats.box1})
            </button>
            <button
              onClick={() => setSelectedBoxFilter("2")}
              className={`px-2.5 py-1 rounded-xl font-medium border transition-all ${
                selectedBoxFilter === "2" ? "bg-amber-500 text-white border-amber-600" : "bg-white text-amber-700 border-amber-200"
              }`}
            >
              Hộp 2 ({stats.box2})
            </button>
            <button
              onClick={() => setSelectedBoxFilter("3")}
              className={`px-2.5 py-1 rounded-xl font-medium border transition-all ${
                selectedBoxFilter === "3" ? "bg-sky-500 text-white border-sky-600" : "bg-white text-sky-700 border-sky-200"
              }`}
            >
              Hộp 3 ({stats.box3})
            </button>
            <button
              onClick={() => setSelectedBoxFilter("4")}
              className={`px-2.5 py-1 rounded-xl font-medium border transition-all ${
                selectedBoxFilter === "4" ? "bg-indigo-500 text-white border-indigo-600" : "bg-white text-indigo-700 border-indigo-200"
              }`}
            >
              Hộp 4 ({stats.box4})
            </button>
            <button
              onClick={() => setSelectedBoxFilter("5")}
              className={`px-2.5 py-1 rounded-xl font-medium border transition-all ${
                selectedBoxFilter === "5" ? "bg-emerald-500 text-white border-emerald-600" : "bg-white text-emerald-700 border-emerald-200"
              }`}
            >
              Hộp 5 ({stats.box5})
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === "flashcards" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🗂️ Thẻ Flashcard
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === "list" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📋 Danh sách từ
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === "add" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ➕ Thêm từ mới
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              <div className="animate-spin text-3xl mb-2">⏳</div>
              <p className="text-sm font-medium">Đang tải sổ tay từ vựng...</p>
            </div>
          ) : activeTab === "flashcards" ? (
            /* TAB 1: FLASHCARD SRS */
            items.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
                <div className="text-4xl mb-3">🌱</div>
                <h3 className="text-base font-bold text-slate-800">Chưa có từ vựng nào trong Hộp này</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Hãy chuyển sang tab "Tất cả" hoặc "Thêm từ mới" để bổ sung từ vào sổ tay ôn tập nhé!
                </p>
                <button
                  onClick={() => setSelectedBoxFilter("all")}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition"
                >
                  Xem tất cả từ vựng
                </button>
              </div>
            ) : currentCard ? (
              <div className="max-w-xl mx-auto flex flex-col items-center">
                {/* Progress Bar & Indicators */}
                <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-700">
                      Thẻ {currentIndex + 1} / {items.length}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold border text-[11px] ${getBoxColor(currentCard.leitnerBox)}`}>
                      Hộp {currentCard.leitnerBox} (Thuộc liên tiếp: {currentCard.correctStreak} lần)
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPinyin(!showPinyin)}
                    className="flex items-center gap-1 text-slate-600 hover:text-teal-700 font-medium"
                  >
                    {showPinyin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showPinyin ? "Ẩn Pinyin" : "Hiện Pinyin"}
                  </button>
                </div>

                {answeredFeedback && (
                  <div className="w-full mb-3 text-center py-2 px-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-2xl text-xs font-bold animate-in fade-in zoom-in-95">
                    {answeredFeedback}
                  </div>
                )}

                {/* The 3D Interactive Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`w-full min-h-[300px] bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 p-8 flex flex-col items-center justify-center cursor-pointer select-none relative group hover:border-teal-400 hover:shadow-2xl ${
                    isFlipped ? "border-emerald-300 bg-gradient-to-b from-white to-emerald-50/30" : "border-slate-200"
                  }`}
                >
                  <div className="absolute top-4 right-4 text-xs text-slate-400 group-hover:text-teal-600 transition flex items-center gap-1 font-medium">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Bấm để lật thẻ
                  </div>

                  {!isFlipped ? (
                    /* Mặt trước: Chữ Hán & Pinyin */
                    <div className="text-center flex flex-col items-center">
                      <div className="text-6xl font-black text-slate-800 tracking-wider mb-2 font-serif">
                        {currentCard.hanzi}
                      </div>

                      {showPinyin && (
                        <div className="text-xl font-medium text-teal-600 mb-3 tracking-wide">
                          {currentCard.pinyin}
                        </div>
                      )}

                      {currentCard.wordType && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                          {currentCard.wordType}
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(currentCard.hanzi);
                        }}
                        className="mt-5 w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>

                      <p className="mt-4 text-xs text-slate-400">
                        (Chạm để xem nghĩa tiếng Việt & ví dụ câu)
                      </p>
                    </div>
                  ) : (
                    /* Mặt sau: Nghĩa & Câu ví dụ */
                    <div className="text-center flex flex-col items-center w-full">
                      <div className="text-3xl font-black text-slate-800 mb-1">
                        {currentCard.hanzi}
                      </div>
                      <div className="text-sm font-medium text-teal-600 mb-3">
                        {currentCard.pinyin}
                      </div>

                      <div className="text-xl font-bold text-slate-900 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200/80 mb-4 max-w-md">
                        {currentCard.meaningVi}
                      </div>

                      {currentCard.exampleHanzi && (
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 w-full text-left max-w-md mb-2">
                          <div className="text-xs font-semibold text-slate-500 mb-1">Ví dụ ngữ cảnh:</div>
                          <div className="text-sm font-medium text-slate-800 mb-0.5">
                            {currentCard.exampleHanzi}
                          </div>
                          {currentCard.exampleMeaning && (
                            <div className="text-xs text-slate-500">
                              {currentCard.exampleMeaning}
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(currentCard.exampleHanzi || currentCard.hanzi);
                        }}
                        className="mt-1 flex items-center gap-1.5 text-xs text-teal-700 font-semibold hover:underline"
                      >
                        <Volume2 className="w-4 h-4" /> Nghe ví dụ câu
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons: Chưa nhớ vs Đã thuộc */}
                <div className="w-full flex items-center justify-between gap-4 mt-5">
                  <button
                    onClick={() => handleAnswerCard(false)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                  >
                    <span>❌ Chưa nhớ</span>
                    <span className="text-[11px] opacity-75 font-normal">(Về Hộp 1)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
                    }}
                    className="w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition shadow-sm"
                    title="Thẻ trước"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
                    }}
                    className="w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition shadow-sm"
                    title="Thẻ kế tiếp"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleAnswerCard(true)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                  >
                    <span>✅ Đã thuộc</span>
                    <span className="text-[11px] opacity-85 font-normal">(Lên Hộp {Math.min(5, currentCard.leitnerBox + 1)})</span>
                  </button>
                </div>
              </div>
            ) : null
          ) : activeTab === "list" ? (
            /* TAB 2: DANH SÁCH TỪ VỰNG */
            <div>
              {/* Search bar */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Tìm theo chữ Hán, Pinyin, hoặc nghĩa tiếng Việt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Không tìm thấy từ vựng nào khớp với tìm kiếm.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.progressId}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSpeak(item.hanzi)}
                          className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white flex items-center justify-center transition flex-shrink-0"
                          title="Phát âm"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-slate-900 font-serif">{item.hanzi}</span>
                            <span className="text-xs text-teal-600 font-medium">{item.pinyin}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getBoxColor(item.leitnerBox)}`}>
                              Hộp {item.leitnerBox}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 font-medium mt-0.5">
                            {item.meaningVi}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteWord(item.progressId)}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                          title="Xóa khỏi Sổ tay"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TAB 3: THÊM TỪ MỚI */
            <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-600" />
                Thêm từ vựng mới vào Sổ tay SRS
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Từ mới sẽ bắt đầu tại <strong>Hộp 1</strong> và được xếp lịch nhắc ôn theo thuật toán Leitner.
              </p>

              {addSuccessMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {addSuccessMsg}
                </div>
              )}

              <form onSubmit={handleCreateWord} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Chữ Hán (Simplified) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: 苹果"
                      value={newHanzi}
                      onChange={(e) => setNewHanzi(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-serif"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Phiên âm Pinyin
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: píngguǒ"
                      value={newPinyin}
                      onChange={(e) => setNewPinyin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nghĩa tiếng Việt <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Quả táo"
                      value={newMeaningVi}
                      onChange={(e) => setNewMeaningVi(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Từ loại
                    </label>
                    <select
                      value={newWordType}
                      onChange={(e) => setNewWordType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      <option value="Danh từ">Danh từ</option>
                      <option value="Động từ">Động từ</option>
                      <option value="Tính từ">Tính từ</option>
                      <option value="Đại từ">Đại từ</option>
                      <option value="Số từ">Số từ</option>
                      <option value="Lượng từ">Lượng từ</option>
                      <option value="Phó từ">Phó từ</option>
                      <option value="Cụm từ">Cụm từ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Câu ví dụ tiếng Trung (nếu có)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 这儿的苹果真甜！"
                    value={newExampleHanzi}
                    onChange={(e) => setNewExampleHanzi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nghĩa câu ví dụ
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Táo ở đây ngọt thật đấy!"
                    value={newExampleMeaning}
                    onChange={(e) => setNewExampleMeaning(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={addingWord}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                  >
                    {addingWord ? "Đang lưu..." : "Lưu vào Sổ tay"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
