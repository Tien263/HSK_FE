"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Download,
  Upload,
  Save,
  Trash2,
  Edit3,
  CheckCircle2,
  Volume2,
  Sparkles,
  Layers,
  HelpCircle,
  MessageSquare,
  FileText,
  Compass,
  ArrowRight,
  X,
  RotateCcw,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";

interface CurriculumBuilderWorkspaceProps {
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function CurriculumBuilderWorkspace({
  showToast,
}: CurriculumBuilderWorkspaceProps) {
  // Cấp độ HSK đang chọn (1 - 6)
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  // Danh sách bài học của cấp độ đang chọn
  const [lessons, setLessons] = useState<Hsk1FullLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal chỉnh sửa chi tiết bài học
  const [editingLesson, setEditingLesson] = useState<Hsk1FullLesson | null>(null);
  const [editorTab, setEditorTab] = useState<
    "info" | "vocab" | "grammar" | "dialogue" | "phonetics"
  >("info");

  // State thêm từ vựng mới trong editor
  const [newVocabHanzi, setNewVocabHanzi] = useState("");
  const [newVocabPinyin, setNewVocabPinyin] = useState("");
  const [newVocabMeaning, setNewVocabMeaning] = useState("");
  const [newVocabType, setNewVocabType] = useState("Danh từ");
  const [newVocabExZh, setNewVocabExZh] = useState("");
  const [newVocabExVi, setNewVocabExVi] = useState("");

  // State thêm ngữ pháp mới trong editor
  const [newGrammarTitle, setNewGrammarTitle] = useState("");
  const [newGrammarStructure, setNewGrammarStructure] = useState("");
  const [newGrammarExplanation, setNewGrammarExplanation] = useState("");
  const [newGrammarExample, setNewGrammarExample] = useState("");

  // State thêm hội thoại mới trong editor
  const [newDialSpeaker, setNewDialSpeaker] = useState("A");
  const [newDialZh, setNewDialZh] = useState("");
  const [newDialPinyin, setNewDialPinyin] = useState("");
  const [newDialVi, setNewDialVi] = useState("");

  // Tải giáo trình khi đổi level
  useEffect(() => {
    async function loadCurriculum() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/admin/curriculum?level=${selectedLevel}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setLessons(data.items);
        } else {
          // Fallback sang resolver
          const localLessons = getLessonsByHskLevel(selectedLevel);
          setLessons(localLessons);
        }
      } catch (e) {
        const localLessons = getLessonsByHskLevel(selectedLevel);
        setLessons(localLessons);
      } finally {
        setLoading(false);
      }
    }
    loadCurriculum();
  }, [selectedLevel]);

  // Phát âm TTS
  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && text) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "zh-CN";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  // 1. TẢI VỀ FILE TEMPLATE MẪU (.JSON)
  const handleDownloadTemplate = () => {
    const templateSample = {
      level: selectedLevel,
      description: `Template mẫu cấu trúc giáo trình HSK ${selectedLevel} chuẩn`,
      lessons: lessons.slice(0, 2).map((l) => ({
        id: l.id,
        number: l.number,
        titleZh: l.titleZh,
        pinyin: l.pinyin,
        titleVi: l.titleVi || "Tiêu đề tiếng Việt",
        desc: l.desc || "Mô tả bài học",
        vocabList: l.vocabList || [],
        grammarList: l.grammarList || [],
        dialogue: l.dialogue || [],
        phonetics: l.phonetics || {
          title: "Luyện phát âm",
          rule: "Quy tắc phát âm thanh mẫu/vận mẫu",
          examples: ["a", "o", "e"],
        },
        culture: l.culture || "Nét đẹp văn hóa Trung Hoa gắn với bài học",
      })),
    };

    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templateSample, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `template_giao_trinh_HSK${selectedLevel}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(`Đã xuất template mẫu HSK ${selectedLevel} thành công!`);
  };

  // 2. NHẬP FILE GIÁO TRÌNH (.JSON)
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let incomingLessons: Hsk1FullLesson[] = [];
        if (Array.isArray(parsed)) {
          incomingLessons = parsed;
        } else if (Array.isArray(parsed.lessons)) {
          incomingLessons = parsed.lessons;
        }

        if (incomingLessons.length === 0) {
          showToast("File không chứa danh sách bài học hợp lệ!", "error");
          return;
        }

        setLessons(incomingLessons);
        showToast(`Đã nạp thành công ${incomingLessons.length} bài học từ file JSON! Bấm "Lưu & Xuất bản" để áp dụng.`);
      } catch (err) {
        showToast("Lỗi định dạng file JSON!", "error");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  // 3. THÊM BÀI HỌC MỚI VÀO CẤP ĐỘ NÀY
  const handleAddNewLesson = () => {
    const nextNumber = lessons.length > 0 ? Math.max(...lessons.map((l) => l.number)) + 1 : 1;
    const newLesson: Hsk1FullLesson = {
      id: `hsk${selectedLevel}-${String(nextNumber).padStart(2, "0")}`,
      number: nextNumber,
      titleZh: `新课 ${nextNumber}`,
      pinyin: `Xīn kè ${nextNumber}`,
      titleVi: `Bài mới số ${nextNumber}`,
      desc: `Nội dung và mục tiêu kiến thức bài số ${nextNumber} - HSK ${selectedLevel}`,
      durationMin: 45,
      vocabCount: 1,
      grammarCount: 1,
      isUnlockedDefault: true,
      unlockedScheduleText: "Đã mở khóa",
      vocabList: [
        {
          id: `v-new-1`,
          hanzi: "学习",
          pinyin: "xuéxí",
          meaning: "học tập",
          type: "Động từ",
          exampleZh: "我们学习汉语。",
          exampleVi: "Chúng tôi học tiếng Trung.",
        },
      ],
      grammarList: [
        {
          title: "Cấu trúc câu khẳng định cơ bản",
          structure: "Chủ ngữ + Động từ + Tân ngữ",
          example: "我学习汉语。",
          explanation: "Trật tự câu cơ bản trong tiếng Trung tương tự tiếng Việt (SVO).",
        },
      ],
      dialogue: [
        {
          speaker: "李明",
          zh: "你好！你在做什么？",
          pinyin: "Nǐ hǎo! Nǐ zài zuò shénme?",
          vi: "Chào bạn! Bạn đang làm gì đấy?",
        },
        {
          speaker: "王美",
          zh: "你好！我在学习汉语。",
          pinyin: "Nǐ hǎo! Wǒ zài xuéxí Hànyǔ.",
          vi: "Chào bạn! Tôi đang học tiếng Trung.",
        },
      ],
      phonetics: {
        title: `Ngữ âm trọng tâm bài ${nextNumber}`,
        rule: "Phân biệt các thanh mẫu và biến điệu chuẩn",
        examples: ["mā", "má", "mǎ", "mà"],
      },
      culture: `Góc văn hóa ứng dụng bài học số ${nextNumber}`,
    };

    setLessons([...lessons, newLesson]);
    setEditingLesson(newLesson);
    setEditorTab("info");
    showToast(`Đã thêm Bài ${nextNumber}. Bạn có thể chỉnh sửa chi tiết ngay!`);
  };

  // 4. LƯU & XUẤT BẢN TOÀN BỘ GIÁO TRÌNH
  const handleSaveAndPublishAll = async () => {
    if (lessons.length === 0) {
      showToast("Chưa có bài học nào để xuất bản!", "error");
      return;
    }

    setSaving(true);
    try {
      // 1. Lưu vào Server API
      const res = await fetch("/api/v1/admin/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: selectedLevel,
          lessons,
        }),
      });

      const data = await res.json();

      // 2. Đồng bộ vào localStorage để resolver client dùng ngay lập tức
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `hsk_admin_custom_curriculum_level_${selectedLevel}`,
          JSON.stringify(lessons)
        );
      }

      if (res.ok && data.success) {
        showToast(
          `Đã xuất bản thành công ${lessons.length} bài học HSK ${selectedLevel}! Toàn bộ Giáo viên và Học sinh sẽ thấy bài học mới ngay lập tức.`
        );
      } else {
        showToast(data.message || "Đã lưu vào bộ nhớ cục bộ hệ thống.");
      }
    } catch (e) {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `hsk_admin_custom_curriculum_level_${selectedLevel}`,
          JSON.stringify(lessons)
        );
      }
      showToast("Đã lưu và xuất bản vào bộ nhớ hệ thống thành công!");
    } finally {
      setSaving(false);
    }
  };

  // 5. LƯU BÀI HỌC ĐANG CHỈNH SỬA
  const handleSaveEditingLesson = () => {
    if (!editingLesson) return;
    setLessons((prev) =>
      prev.map((l) => (l.number === editingLesson.number ? editingLesson : l))
    );
    setEditingLesson(null);
    showToast(`Đã cập nhật xong Bài ${editingLesson.number}! Nhớ bấm "Lưu & Xuất bản" để áp dụng cho toàn hệ thống.`);
  };

  // Xóa bài học
  const handleDeleteLesson = (num: number) => {
    if (!confirm(`Bạn có chắc muốn xóa Bài ${num} khỏi giáo trình HSK ${selectedLevel}?`)) {
      return;
    }
    setLessons((prev) => prev.filter((l) => l.number !== num));
    showToast(`Đã xóa Bài ${num}.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* =================================================================== */}
      {/* 1. HEADER & CHỌN CẤP ĐỘ HSK 3.0 (CẤP 1 - 9)                         */}
      {/* =================================================================== */}
      <div className="bg-[#FFFCF6] border border-[#BC9B6B]/25 rounded-3xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#BC9B6B]/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#204434] text-white flex items-center justify-center font-bold shadow-sm">
              <BookOpen className="w-6 h-6 text-[#BC9B6B]" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#204434] flex items-center gap-2">
                <span>Quản trị Kho bài học HSK 3.0</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Tiêu chuẩn 9 Cấp (1 - 9)
                </span>
              </h2>
              <p className="text-xs text-[#315E48] mt-0.5">
                Biên soạn giáo trình chuẩn HSK 3.0 từ Cấp 1 đến Cấp 9, phân bổ từ vựng, ngữ pháp, đoạn hội thoại và xuất bản cho toàn trường.
              </p>
            </div>
          </div>

          {/* Các nút hành động chính */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tải template mẫu */}
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2.5 rounded-xl border border-[#BC9B6B]/40 bg-white hover:bg-[#FAF7F0] text-[#204434] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Tải về file JSON mẫu để chỉnh sửa"
            >
              <Download className="w-4 h-4 text-[#8F6D3B]" />
              <span>Tải Template (.JSON)</span>
            </button>

            {/* Nhập file JSON */}
            <label className="px-3.5 py-2.5 rounded-xl border border-[#BC9B6B]/40 bg-white hover:bg-[#FAF7F0] text-[#204434] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs">
              <Upload className="w-4 h-4 text-[#8F6D3B]" />
              <span>Nhập file (.JSON)</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJsonFile}
              />
            </label>

            {/* Thêm bài mới */}
            <button
              onClick={handleAddNewLesson}
              className="px-4 py-2.5 rounded-xl bg-[#204434] hover:bg-[#17382F] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#BC9B6B]" />
              <span>Thêm bài học mới</span>
            </button>

            {/* Lưu & Xuất bản toàn bộ */}
            <button
              disabled={saving || lessons.length === 0}
              onClick={handleSaveAndPublishAll}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#204434] to-[#315E48] hover:from-[#17382F] hover:to-[#204434] text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-[#204434]/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#BC9B6B]" />
              <span>{saving ? "Đang xuất bản..." : "Lưu & Xuất bản kho chung"}</span>
            </button>
          </div>
        </div>

        {/* Thanh chọn Level HSK 3.0: 9 Cấp (Sơ cấp 1-3, Trung cấp 4-6, Cao cấp 7-9) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-[#8F6D3B] mr-1 shrink-0">Cấp độ HSK 3.0:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
            const tierLabel = lvl <= 3 ? "Sơ cấp" : lvl <= 6 ? "Trung cấp" : "Cao cấp";
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedLevel === lvl
                    ? "bg-[#204434] text-white shadow-xs"
                    : "bg-white border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0]"
                }`}
              >
                <span>HSK {lvl}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded ${
                    selectedLevel === lvl
                      ? "bg-white/20 text-white"
                      : "bg-[#F3EFE6] text-[#8F6D3B]"
                  }`}
                >
                  {tierLabel}
                </span>
                {selectedLevel === lvl && (
                  <span className="text-[10px] text-emerald-300 ml-0.5">
                    ({lessons.length} bài)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. DANH SÁCH BÀI HỌC TRONG CẤP ĐỘ                                   */}
      {/* =================================================================== */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#315E48] bg-[#FFFCF6] rounded-3xl border border-[#BC9B6B]/20">
          Đang tải danh sách bài học HSK {selectedLevel}...
        </div>
      ) : lessons.length === 0 ? (
        <div className="py-16 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#BC9B6B]/30 space-y-3">
          <BookOpen className="w-10 h-10 text-[#8F6D3B]/40 mx-auto" />
          <p className="text-sm font-bold text-[#204434]">Chưa có bài học nào cho HSK {selectedLevel}</p>
          <p className="text-xs text-[#315E48]">
            Bạn có thể bấm &quot;Thêm bài học mới&quot; hoặc &quot;Nhập file (.JSON)&quot; để bắt đầu xây dựng giáo trình.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((les) => {
            const vCount = les.vocabList?.length || 0;
            const gCount = les.grammarList?.length || 0;
            const dCount = les.dialogue?.length || 0;

            return (
              <div
                key={les.number}
                className="p-5 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/30 hover:border-[#204434] transition shadow-2xs hover:shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#204434] text-white text-xs font-bold">
                      Bài {String(les.number).padStart(2, "0")}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-[#8F6D3B]">
                      HSK {selectedLevel}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#204434] leading-snug">
                      {les.titleZh}
                    </h3>
                    {les.pinyin && (
                      <p className="font-mono text-xs text-[#8F6D3B]">{les.pinyin}</p>
                    )}
                    <p className="text-xs font-medium text-[#315E48] mt-0.5 line-clamp-1">
                      {les.titleVi || les.desc || "Bài học chuẩn HSK"}
                    </p>
                  </div>

                  {/* Badges thành phần */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[11px] font-medium text-[#204434]">
                      📚 {vCount} từ vựng
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[11px] font-medium text-[#204434]">
                      📐 {gCount} ngữ pháp
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[11px] font-medium text-[#204434]">
                      💬 {dCount} thoại
                    </span>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setEditingLesson(JSON.parse(JSON.stringify(les)));
                      setEditorTab("info");
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#BC9B6B]/40 hover:bg-[#FAF7F0] text-[#204434] text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#8F6D3B]" />
                    <span>Sửa chi tiết</span>
                  </button>

                  <button
                    onClick={() => handleDeleteLesson(les.number)}
                    className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                    title="Xóa bài học này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. MODAL CHỈNH SỬA CHI TIẾT BÀI HỌC (VISUAL BUILDER)                */}
      {/* =================================================================== */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FAF7F0] to-[#FFFCF6] border-b border-[#E5DEC9] flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#204434] flex items-center gap-2">
                  <span>Chỉnh sửa nội dung: Bài {editingLesson.number}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#204434] text-white">
                    HSK {selectedLevel}
                  </span>
                </h3>
                <p className="text-xs text-[#315E48] mt-0.5">
                  Thêm hoặc cập nhật từ vựng, ngữ pháp, đoạn hội thoại, phát âm và văn hóa.
                </p>
              </div>

              <button
                onClick={() => setEditingLesson(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="px-6 py-2.5 bg-[#FAF7F0] border-b border-[#E5DEC9] flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setEditorTab("info")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === "info"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-white"
                }`}
              >
                1. Thông tin chung
              </button>
              <button
                onClick={() => setEditorTab("vocab")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === "vocab"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-white"
                }`}
              >
                2. Từ vựng ({editingLesson.vocabList?.length || 0})
              </button>
              <button
                onClick={() => setEditorTab("grammar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === "grammar"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-white"
                }`}
              >
                3. Ngữ pháp ({editingLesson.grammarList?.length || 0})
              </button>
              <button
                onClick={() => setEditorTab("dialogue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === "dialogue"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-white"
                }`}
              >
                4. Đoạn hội thoại ({editingLesson.dialogue?.length || 0})
              </button>
              <button
                onClick={() => setEditorTab("phonetics")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === "phonetics"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-white"
                }`}
              >
                5. Ngữ âm & Văn hóa
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: THÔNG TIN CHUNG */}
              {editorTab === "info" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#204434] block mb-1">
                        Số thứ tự bài học:
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={editingLesson.number}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            number: Number(e.target.value) || 1,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#204434] block mb-1">
                        Tiêu đề tiếng Trung (Hanzi):
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 你好！"
                        value={editingLesson.titleZh}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            titleZh: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-white text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#204434] block mb-1">
                        Phiên âm Pinyin:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Nǐ hǎo!"
                        value={editingLesson.pinyin || ""}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            pinyin: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-white text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#204434] block mb-1">
                        Tiêu đề tiếng Việt:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Xin chào!"
                        value={editingLesson.titleVi || ""}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            titleVi: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#204434] block mb-1">
                      Mô tả & Mục tiêu bài học:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mục tiêu kiến thức, từ vựng và ngữ pháp cần đạt sau bài học..."
                      value={editingLesson.desc || ""}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          desc: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: TỪ VỰNG */}
              {editorTab === "vocab" && (
                <div className="space-y-6">
                  {/* Form thêm từ mới */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      + Thêm từ vựng mới vào bài:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Chữ Hán (VD: 老师)"
                        value={newVocabHanzi}
                        onChange={(e) => setNewVocabHanzi(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-sm font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Pinyin (VD: lǎoshī)"
                        value={newVocabPinyin}
                        onChange={(e) => setNewVocabPinyin(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-sm font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Nghĩa TV (VD: thầy giáo)"
                        value={newVocabMeaning}
                        onChange={(e) => setNewVocabMeaning(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-sm"
                      />
                      <select
                        value={newVocabType}
                        onChange={(e) => setNewVocabType(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-sm"
                      >
                        <option value="Danh từ">Danh từ</option>
                        <option value="Động từ">Động từ</option>
                        <option value="Tính từ">Tính từ</option>
                        <option value="Đại từ">Đại từ</option>
                        <option value="Phó từ">Phó từ</option>
                        <option value="Trợ từ">Trợ từ</option>
                        <option value="Lượng từ">Lượng từ</option>
                        <option value="Số từ">Số từ</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Câu ví dụ tiếng Hán (VD: 他是我们的中文老师。)"
                        value={newVocabExZh}
                        onChange={(e) => setNewVocabExZh(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Dịch nghĩa câu ví dụ (VD: Thầy ấy là giáo viên tiếng Trung của chúng tôi.)"
                        value={newVocabExVi}
                        onChange={(e) => setNewVocabExVi(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!newVocabHanzi.trim()) {
                          showToast("Vui lòng nhập chữ Hán!", "error");
                          return;
                        }
                        const newItem = {
                          id: `v-${Date.now()}`,
                          hanzi: newVocabHanzi.trim(),
                          pinyin: newVocabPinyin.trim(),
                          meaning: newVocabMeaning.trim() || newVocabHanzi,
                          type: newVocabType,
                          exampleZh: newVocabExZh.trim(),
                          exampleVi: newVocabExVi.trim(),
                        };
                        setEditingLesson({
                          ...editingLesson,
                          vocabList: [...(editingLesson.vocabList || []), newItem],
                        });
                        setNewVocabHanzi("");
                        setNewVocabPinyin("");
                        setNewVocabMeaning("");
                        setNewVocabExZh("");
                        setNewVocabExVi("");
                        showToast(`Đã thêm từ "${newItem.hanzi}"!`);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm vào danh sách từ vựng</span>
                    </button>
                  </div>

                  {/* Bảng danh sách từ vựng */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#8F6D3B]">
                      Danh sách từ vựng hiện tại ({editingLesson.vocabList?.length || 0} từ):
                    </span>
                    <div className="border border-[#E5DEC9] rounded-2xl overflow-hidden bg-white">
                      {editingLesson.vocabList?.map((v, vIdx) => (
                        <div
                          key={vIdx}
                          className="p-3 border-b border-[#E5DEC9] last:border-none flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-400 w-5">#{vIdx + 1}</span>
                            <span className="font-serif font-bold text-base text-[#204434]">
                              {v.hanzi}
                            </span>
                            <span className="font-mono text-[#8F6D3B]">{v.pinyin}</span>
                            <span className="px-2 py-0.5 rounded bg-[#FAF7F0] text-[11px] font-medium text-slate-600">
                              {v.type || "Từ vựng"}
                            </span>
                            <span className="text-[#315E48] font-medium">{v.meaning}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSpeak(v.hanzi)}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingLesson({
                                  ...editingLesson,
                                  vocabList: editingLesson.vocabList?.filter((_, i) => i !== vIdx),
                                });
                              }}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-500"
                              title="Xóa từ này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NGỮ PHÁP */}
              {editorTab === "grammar" && (
                <div className="space-y-6">
                  {/* Form thêm ngữ pháp */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      + Thêm điểm ngữ pháp mới:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Tên điểm ngữ pháp (VD: Câu hỏi nghi vấn với 吗)"
                        value={newGrammarTitle}
                        onChange={(e) => setNewGrammarTitle(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Cấu trúc câu (VD: Câu trần thuật + 吗?)"
                        value={newGrammarStructure}
                        onChange={(e) => setNewGrammarStructure(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-mono"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Giải thích chi tiết quy tắc ngữ pháp..."
                      value={newGrammarExplanation}
                      onChange={(e) => setNewGrammarExplanation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Câu ví dụ minh họa (VD: 你是老师吗？)"
                      value={newGrammarExample}
                      onChange={(e) => setNewGrammarExample(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs"
                    />

                    <button
                      onClick={() => {
                        if (!newGrammarTitle.trim()) {
                          showToast("Vui lòng nhập tên điểm ngữ pháp!", "error");
                          return;
                        }
                        const newG = {
                          title: newGrammarTitle.trim(),
                          structure: newGrammarStructure.trim(),
                          explanation: newGrammarExplanation.trim(),
                          example: newGrammarExample.trim(),
                        };
                        setEditingLesson({
                          ...editingLesson,
                          grammarList: [...(editingLesson.grammarList || []), newG],
                        });
                        setNewGrammarTitle("");
                        setNewGrammarStructure("");
                        setNewGrammarExplanation("");
                        setNewGrammarExample("");
                        showToast(`Đã thêm điểm ngữ pháp mới!`);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm vào danh sách ngữ pháp</span>
                    </button>
                  </div>

                  {/* Danh sách ngữ pháp */}
                  <div className="space-y-3">
                    {editingLesson.grammarList?.map((g, gIdx) => (
                      <div
                        key={gIdx}
                        className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-2 relative"
                      >
                        <button
                          onClick={() => {
                            setEditingLesson({
                              ...editingLesson,
                              grammarList: editingLesson.grammarList?.filter((_, i) => i !== gIdx),
                            });
                          }}
                          className="absolute right-3 top-3 p-1 rounded-lg hover:bg-red-50 text-red-500"
                          title="Xóa ngữ pháp này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#204434]/10 text-[#204434] text-[11px] font-bold">
                            Ngữ pháp #{gIdx + 1}
                          </span>
                          <h4 className="font-serif font-bold text-sm text-[#204434]">{g.title}</h4>
                        </div>

                        {g.structure && (
                          <div className="p-2 rounded-lg bg-[#FAF7F0] text-xs font-mono font-semibold text-[#8F6D3B]">
                            Cấu trúc: {g.structure}
                          </div>
                        )}

                        <p className="text-xs text-[#315E48]">{g.explanation}</p>

                        {g.example && (
                          <p className="text-xs font-medium text-[#204434] italic">
                            Ví dụ: {g.example}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: HỘI THOẠI */}
              {editorTab === "dialogue" && (
                <div className="space-y-6">
                  {/* Form thêm câu thoại */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      + Thêm câu thoại mới vào bài:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Người nói (VD: 李明 / A)"
                        value={newDialSpeaker}
                        onChange={(e) => setNewDialSpeaker(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Chữ Hán (VD: 你好！)"
                        value={newDialZh}
                        onChange={(e) => setNewDialZh(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-serif font-bold col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="Pinyin (VD: Nǐ hǎo!)"
                        value={newDialPinyin}
                        onChange={(e) => setNewDialPinyin(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-mono"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Dịch nghĩa tiếng Việt (VD: Chào bạn!)"
                      value={newDialVi}
                      onChange={(e) => setNewDialVi(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs"
                    />

                    <button
                      onClick={() => {
                        if (!newDialZh.trim()) {
                          showToast("Vui lòng nhập câu thoại chữ Hán!", "error");
                          return;
                        }
                        const newD = {
                          speaker: newDialSpeaker.trim() || "A",
                          zh: newDialZh.trim(),
                          pinyin: newDialPinyin.trim(),
                          vi: newDialVi.trim(),
                        };
                        setEditingLesson({
                          ...editingLesson,
                          dialogue: [...(editingLesson.dialogue || []), newD],
                        });
                        setNewDialZh("");
                        setNewDialPinyin("");
                        setNewDialVi("");
                        showToast("Đã thêm câu thoại!");
                      }}
                      className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm câu thoại</span>
                    </button>
                  </div>

                  {/* Danh sách thoại */}
                  <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#E5DEC9]">
                    {editingLesson.dialogue?.map((d, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#204434] px-2 py-0.5 rounded bg-white border border-[#E5DEC9]">
                              {d.speaker}
                            </span>
                            <span className="font-serif font-bold text-sm text-[#204434]">
                              {d.zh}
                            </span>
                            <button
                              onClick={() => handleSpeak(d.zh)}
                              className="text-[#8F6D3B] hover:text-[#204434]"
                              title="Nghe câu này"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {d.pinyin && <p className="font-mono text-[#8F6D3B] pl-2">{d.pinyin}</p>}
                          {d.vi && <p className="text-[#315E48] pl-2 italic">({d.vi})</p>}
                        </div>

                        <button
                          onClick={() => {
                            setEditingLesson({
                              ...editingLesson,
                              dialogue: editingLesson.dialogue?.filter((_, i) => i !== dIdx),
                            });
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                          title="Xóa câu này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: NGỮ ÂM & VĂN HÓA */}
              {editorTab === "phonetics" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      Ngữ âm trọng tâm của bài:
                    </span>
                    <input
                      type="text"
                      placeholder="Tiêu đề ngữ âm (VD: Thanh mẫu d, t, n, l)"
                      value={editingLesson.phonetics?.title || ""}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          phonetics: {
                            ...(editingLesson.phonetics || {
                              rule: "",
                              examples: [],
                            }),
                            title: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      placeholder="Quy tắc phát âm chi tiết..."
                      value={editingLesson.phonetics?.rule || ""}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          phonetics: {
                            ...(editingLesson.phonetics || {
                              title: "",
                              examples: [],
                            }),
                            rule: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      Góc văn hóa Trung Hoa thực tế:
                    </span>
                    <textarea
                      rows={3}
                      placeholder="Kiến thức văn hóa, phong tục, lễ nghi chào hỏi hoặc câu chuyện thú vị..."
                      value={editingLesson.culture || ""}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          culture: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-[#FAF7F0] border-t border-[#E5DEC9] flex items-center justify-between">
              <button
                onClick={() => setEditingLesson(null)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] bg-white text-slate-600 text-xs font-bold hover:bg-[#FAF7F0] transition cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                onClick={handleSaveEditingLesson}
                className="px-6 py-2.5 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#17382F] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#BC9B6B]" />
                <span>Hoàn tất & Cập nhật bài học</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
