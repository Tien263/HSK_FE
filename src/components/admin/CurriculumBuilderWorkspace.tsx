<button
                onClick={() => setEditorTab("richcontent")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === "richcontent"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-white"
                }`}
              >
                6. Đọc hiểu & Văn hóa giao tiếp
              </button>"use client";

import Image from "next/image";
import { hskArtwork } from "@/lib/hsk-theme";
import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Plus,
  Download,
  Upload,
  Trash2,
  Edit3,
  CheckCircle2,
  Volume2,
  Layers,
  MessageSquare,
  FileText,
  Compass,
  ArrowRight,
  X,
  RotateCcw,
  BookMarked,
  Globe2,
} from "lucide-react";
import { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
import { blankLesson, normalizeLessons, type CurriculumScope } from "@/lib/curriculum-format";
import CurriculumImportDialog, { downloadCurriculumFile } from "./CurriculumImportDialog";
import DictionaryReauthentication from "./DictionaryReauthentication";
import { RichReadingEditor, RichCultureEditor } from "@/components/teacher/LessonRichSections";
import type { ReadingItem, CulturalNoteItem } from "@/lib/lesson-data";

interface CurriculumBuilderWorkspaceProps {
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function CurriculumBuilderWorkspace({
  showToast,
}: CurriculumBuilderWorkspaceProps) {
  // Cấp độ HSK đang chọn (1 - 6)
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  useEffect(() => { const timer = setTimeout(() => { const value = Number(new URL(window.location.href).searchParams.get("hsk")); if (value >= 1 && value <= 9 && Number.isInteger(value)) setSelectedLevel(value); }, 0); return () => clearTimeout(timer); }, []);

  // Danh sách bài học của cấp độ đang chọn
  const [lessons, setLessons] = useState<Hsk1FullLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [reauthenticate, setReauthenticate] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const savingRef = useRef(false);
  const [importSettings, setImportSettings] = useState<{ scope: CurriculumScope; target?: number } | null>(null);

  // Modal chỉnh sửa chi tiết bài học
  const [editingLesson, setEditingLesson] = useState<Hsk1FullLesson | null>(null);
  const [editorTab, setEditorTab] = useState<
    "info" | "vocab" | "grammar" | "dialogue" | "phonetics" | "richcontent"
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

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => { setLoading(true); setLoadError(""); setLessons([]); setEditingLesson(null);
    fetch(`/api/v1/admin/curriculum?level=${selectedLevel}`, { cache: "no-store", signal: controller.signal })
      .then(async response => { const data = await response.json(); if (response.status === 403 || response.status === 401) { setReauthenticate(true); return; } if (!response.ok || !data.success) throw new Error(data.message || "Chưa tải được giáo trình."); if (!controller.signal.aborted) { setLessons(data.items); setRevision(data.revision); setIsDeleted(data.isDeleted); setReauthenticate(false); } })
      .catch(error => { if (!controller.signal.aborted) setLoadError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 100);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [selectedLevel, refresh]);

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && text) { window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "zh-CN"; utterance.rate = .85; window.speechSynthesis.speak(utterance); }
  };
  async function persist(next: Hsk1FullLesson[], deleted = false) {
    if (savingRef.current) return false;
    savingRef.current = true; setSaving(true);
    try {
      const normalized = normalizeLessons(next, selectedLevel);
      const response = await fetch("/api/v1/admin/curriculum", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ level: selectedLevel, revision, lessons: normalized, isDeleted: deleted }) });
      const data = await response.json();
      if (response.status === 403 || response.status === 401) setReauthenticate(true);
      if (!response.ok || !data.success) throw new Error(data.message || "Chưa lưu được vào database.");
      setLessons(data.items); setRevision(data.revision); setIsDeleted(data.isDeleted);
      window.dispatchEvent(new Event("curriculum-updated"));
      showToast(`Đã lưu HSK ${selectedLevel} vào kho chung (${data.items.length} bài).`);
      return true;
    } catch (error) { showToast(error instanceof Error ? error.message : "Không lưu được. Dữ liệu chưa được xuất bản.", "error"); return false; }
    finally { savingRef.current = false; setSaving(false); }
  }
  const handleAddNewLesson = async () => {
    const number = lessons.length ? Math.max(...lessons.map(lesson => lesson.number)) + 1 : 1;
    const lesson = { ...blankLesson(selectedLevel, number), titleVi: `Bài mới số ${number}` };
    if (await persist([...lessons, lesson])) { setEditingLesson(lesson); setEditorTab("info"); }
  };
  const handleSaveEditingLesson = async () => {
    if (!editingLesson) return;
    const next = lessons.map(lesson => lesson.number === editingLesson.number ? editingLesson : lesson);
    if (await persist(next)) setEditingLesson(null);
  };
  const handleDeleteLesson = async (number: number) => {
    if (!confirm(`Xóa Bài ${number} khỏi kho chung HSK ${selectedLevel}? Thay đổi được lưu ngay; bản học liệu đã giao cho lớp vẫn được giữ riêng.`)) return;
    await persist(lessons.filter(lesson => lesson.number !== number));
  };
  const handleDeleteLevel = async () => {
    if (!confirm(`Xóa toàn bộ ${lessons.length} bài của HSK ${selectedLevel} khỏi kho chung để tạo lại? Thay đổi được lưu ngay.`)) return;
    await persist([], true);
  };
  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="relative overflow-hidden rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] p-5 sm:p-7"><Image src={hskArtwork(selectedLevel)} alt="" fill sizes="1200px" className="object-cover opacity-25"/><div className="absolute inset-0 bg-linear-to-r from-[#FFFCF6] via-[#FFFCF6]/70 to-transparent"/>

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#8F6D3B]">Học liệu chung · Biên soạn & xuất bản</p><h2 className="font-serif text-2xl font-bold text-[#204434]">Kho bài học & giáo trình</h2><p className="mt-2 max-w-xl text-xs leading-6 text-[#64755d]">Quản lý từng cấp HSK, từng bài và từng phần nội dung. Mọi thao tác lưu, xóa, nhập file đều được ghi vào kho chung.</p></div>
          <div className="flex flex-wrap gap-2">
            <button disabled={saving || loading} onClick={() => setRefresh(value => value + 1)} className="flex items-center gap-2 rounded-xl border border-[#D7C9AB] bg-[#FFFCF6] px-3 py-2.5 text-xs font-bold"><RotateCcw size={14} />Tải lại</button>
            <button disabled={saving || loading || !!loadError || reauthenticate || isDeleted} onClick={() => downloadCurriculumFile(`hsk${selectedLevel}-sao-luu.json`, JSON.stringify({ level: selectedLevel, lessons }, null, 2))} className="flex items-center gap-2 rounded-xl border border-[#D7C9AB] bg-[#FFFCF6] px-3 py-2.5 text-xs font-bold disabled:opacity-40"><Download size={14} />Xuất bản sao JSON</button>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-2" aria-label="Chọn cấp HSK">{[1,2,3,4,5,6,7,8,9].map(level => <button key={level} disabled={saving} onClick={() => { if (level === selectedLevel) return; setLoading(true); setLessons([]); setSelectedLevel(level); const url = new URL(window.location.href); url.searchParams.set("hsk", String(level)); window.history.replaceState(null, "", url); }} aria-pressed={selectedLevel === level} className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${selectedLevel === level ? "border-[#204434] bg-[#204434] text-white" : "border-[#E5DEC9] bg-[#FFFCF6]/90 text-[#64755d] hover:border-[#315E48]"}`}>HSK {level}</button>)}</div>
      </section>
      {reauthenticate && <DictionaryReauthentication onAuthenticated={() => { setReauthenticate(false); setRefresh(value => value + 1); }} />}
      {loadError && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{loadError} <button onClick={() => setRefresh(value => value + 1)} className="ml-3 underline">Thử tải lại</button></p>}
      {!reauthenticate && !loadError && !loading && <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E5DEC9] bg-[#FFFCF6] p-4 sm:px-6"><div><h3 className="font-serif text-lg font-bold">HSK {selectedLevel} <span className="ml-2 font-sans text-xs font-normal text-[#7e8b71]">{isDeleted ? "Chưa tạo kho" : `${lessons.length} bài học`}</span></h3><p className="mt-1 text-[11px] text-[#7e8b71]">{saving ? "Đang lưu vào database…" : `Đã đồng bộ · Phiên bản ${revision}`}</p></div><div className="flex flex-wrap gap-2">{isDeleted ? <button disabled={saving} onClick={() => void persist([], false)} className="flex items-center gap-2 rounded-xl bg-[#204434] px-4 py-2.5 text-xs font-bold text-white"><Plus size={14} />Tạo kho HSK {selectedLevel}</button> : <><button disabled={saving} onClick={() => setImportSettings({ scope: "lessons" })} className="flex items-center gap-2 rounded-xl border border-[#D7C9AB] px-4 py-2.5 text-xs font-bold"><Upload size={14} />Nhập file & tải mẫu</button><button disabled={saving} onClick={() => void handleAddNewLesson()} className="flex items-center gap-2 rounded-xl bg-[#204434] px-4 py-2.5 text-xs font-bold text-white"><Plus size={14} />Tạo bài mới</button><button disabled={saving} onClick={() => void handleDeleteLevel()} className="flex items-center gap-2 rounded-xl border border-[#9D493E]/30 px-3 py-2.5 text-xs font-semibold text-[#9D493E]"><Trash2 size={14} />Xóa cấp HSK</button></>}</div></section>}
      {!isDeleted && !reauthenticate && !loadError && !loading && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{([{scope:"lessons",title:"Nhiều bài học",hint:"Thông tin & bài hoàn chỉnh",icon:BookOpen},{scope:"vocab",title:"Từ vựng",hint:"Chữ · pinyin · nghĩa · ví dụ",icon:Layers},{scope:"grammar",title:"Ngữ pháp",hint:"Cấu trúc · giải thích · ví dụ",icon:FileText},{scope:"dialogue",title:"Hội thoại",hint:"Người nói · câu · bản dịch",icon:MessageSquare},{scope:"phonetics",title:"Phát âm",hint:"Quy tắc · ví dụ phát âm",icon:Volume2},{scope:"culture",title:"Văn hóa",hint:"Nội dung văn hóa theo bài",icon:Compass}] as const).map(({scope,title,hint,icon:Icon})=><button key={scope} disabled={saving} onClick={()=>setImportSettings({scope})} className="rounded-2xl border border-[#E5DEC9] bg-[#FFFCF6] p-4 text-left transition hover:border-[#315E48]"><Icon size={19} className="mb-3 text-[#8F6D3B]"/><strong className="block text-xs">{title}</strong><span className="mt-1 block text-[10px] leading-5 text-[#7e8b71]">{hint}</span><span className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#315E48]">Mẫu & nhập file <ArrowRight size={11}/></span></button>)}</div>}
      {reauthenticate || loadError || isDeleted ? null : loading ? (
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
                    disabled={saving}
                    onClick={() => void handleDeleteLesson(les.number)}
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
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn" role="dialog" aria-modal="true" aria-label="Biên soạn bài học">
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

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DEC9] px-6 py-3"><span className="text-[11px] text-[#7e8b71]">Lưu thay đổi để xuất bản bài học. Nhập file có bước xem trước riêng.</span><button disabled={saving} onClick={() => setImportSettings({ scope: editorTab === "info" ? "lessons" : editorTab, target: editingLesson.number })} className="flex items-center gap-2 rounded-xl border border-[#D7C9AB] px-3 py-2 text-xs font-bold"><Upload size={13} />Nhập file phần này & tải mẫu</button></div>
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
              <button
                onClick={() => setEditorTab("richcontent")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ``}`}
              >
                6. Đọc hiểu & Văn hóa giao tiếp
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
                        readOnly
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


              {/* TAB 6: ĐỌC HIỂU & VĂN HÓA GIAO TIẾP */}
              {editorTab === "richcontent" && (
                <div className="space-y-8">
                  {/* Phần A: Bài đọc hiểu */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E5DEC9]">
                      <BookMarked className="w-4 h-4 text-[#8F6D3B]" />
                      <h4 className="font-serif font-bold text-sm text-[#204434]">
                        Bài đọc hiểu (<code>reading_items</code>)
                      </h4>
                    </div>
                    <p className="text-xs text-[#315E48] leading-5">
                      Nhập nội bài đọc. Phần này sẽ hiển thị trong tab "Đọc hiểu" riêng biệt cho hoc sinh và giáo viên.)
                    </p>
                    <RichReadingEditor
                      value={editingLesson.reading ?? {
                        id: ${editingLesson.id}-reading,
                        titleZh: "",
                        titleVi: "",
                        contentZh: "",
                        contentPy: "",
                        contentVi: "",
                        wordCount: 0,
                        extraVocabs: [],
                      }}
                      onChange={(val: ReadingItem) =>
                        setEditingLesson({ ...editingLesson, reading: val })
                      }
                    />
                    {editingLesson.reading?.contentZh && (
                      <button
                        onClick={() =>
                          setEditingLesson({ ...editingLesson, reading: undefined })
                        }
                        className="text-xs text-red-500 underline"
                      >
                        Xóa bài đọc hiểu
                      </button>
                    )}
                  </div>

                  {/* Phần B: Văn hóa giao tiếp */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E5DEC9]">
                      <Globe2 className="w-4 h-4 text-[#8F6D3B]" />
                      <h4 className="font-serif font-bold text-sm text-[#204434]">
                        Văn hóa giao tiếp & Cách dùng thực tế (<code>culture_items</code>)
                      </h4>
                    </div>
                    <p className="text-xs text-[#315E48] leading-5">
                      Nhập mẫu câu, cách nói lịch sự, lượ ý văn hóa.
                    </p>
                    <RichCultureEditor
                      value={editingLesson.culturalNote ?? {
                        context: "",
                        targetAudience: "",
                        naturalExpressions: [],
                        politeExpressions: [],
                        cautionNotes: [],
                        comparisonNote: "",
                        practiceScenario: "",
                      }}
                      onChange={(val: CulturalNoteItem) =>
                        setEditingLesson({ ...editingLesson, culturalNote: val })
                      }
                    />
                  </div>
                </div>
              )}
            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-[#FAF7F0] border-t border-[#E5DEC9] flex items-center justify-between">
              <button
                onClick={() => setEditingLesson(null)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] bg-white text-slate-600 text-xs font-bold hover:bg-[#FAF7F0] transition cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                disabled={saving}
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
      {importSettings && <CurriculumImportDialog level={selectedLevel} lessons={editingLesson ? lessons.map(lesson => lesson.number === editingLesson.number ? editingLesson : lesson) : lessons} initialScope={importSettings.scope} initialTarget={importSettings.target} onClose={() => setImportSettings(null)} onApply={async next => { const saved = await persist(next); if (saved && editingLesson) setEditingLesson(next.find(lesson => lesson.number === editingLesson.number) || null); return saved; }} />}
    </div>
  );
}
