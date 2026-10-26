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
import { RichReadingEditor, RichCultureEditor } from "@/components/teacher/LessonRichSections";
import type { ReadingItem, CulturalNoteItem } from "@/lib/lesson-data";
import { BookMarked, Globe2 } from "lucide-react";

interface CurriculumBuilderWorkspaceProps {
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function CurriculumBuilderWorkspace({
  showToast,
}: CurriculumBuilderWorkspaceProps) {
  // Cß║Ñp ─æß╗Ö HSK ─æang chß╗ìn (1 - 6)
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  // Danh s├ích b├ái hß╗ìc cß╗ºa cß║Ñp ─æß╗Ö ─æang chß╗ìn
  const [lessons, setLessons] = useState<Hsk1FullLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal chß╗ënh sß╗¡a chi tiß║┐t b├ái hß╗ìc
  const [editingLesson, setEditingLesson] = useState<Hsk1FullLesson | null>(null);
  const [editorTab, setEditorTab] = useState<
    "info" | "vocab" | "grammar" | "dialogue" | "phonetics" | "richcontent"
  >("info");

  // State th├¬m tß╗½ vß╗▒ng mß╗¢i trong editor
  const [newVocabHanzi, setNewVocabHanzi] = useState("");
  const [newVocabPinyin, setNewVocabPinyin] = useState("");
  const [newVocabMeaning, setNewVocabMeaning] = useState("");
  const [newVocabType, setNewVocabType] = useState("Danh tß╗½");
  const [newVocabExZh, setNewVocabExZh] = useState("");
  const [newVocabExVi, setNewVocabExVi] = useState("");

  // State th├¬m ngß╗» ph├íp mß╗¢i trong editor
  const [newGrammarTitle, setNewGrammarTitle] = useState("");
  const [newGrammarStructure, setNewGrammarStructure] = useState("");
  const [newGrammarExplanation, setNewGrammarExplanation] = useState("");
  const [newGrammarExample, setNewGrammarExample] = useState("");

  // State th├¬m hß╗Öi thoß║íi mß╗¢i trong editor
  const [newDialSpeaker, setNewDialSpeaker] = useState("A");
  const [newDialZh, setNewDialZh] = useState("");
  const [newDialPinyin, setNewDialPinyin] = useState("");
  const [newDialVi, setNewDialVi] = useState("");

  // Tß║úi gi├ío tr├¼nh khi ─æß╗òi level
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

  // Ph├ít ├óm TTS
  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && text) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "zh-CN";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  // 1. Tß║óI Vß╗Ç FILE TEMPLATE Mß║¬U (.JSON)
  const handleDownloadTemplate = () => {
    const templateSample = {
      level: selectedLevel,
      description: `Template mß║½u cß║Ñu tr├║c gi├ío tr├¼nh HSK ${selectedLevel} chuß║⌐n`,
      lessons: lessons.slice(0, 2).map((l) => ({
        id: l.id,
        number: l.number,
        titleZh: l.titleZh,
        pinyin: l.pinyin,
        titleVi: l.titleVi || "Ti├¬u ─æß╗ü tiß║┐ng Viß╗çt",
        desc: l.desc || "M├┤ tß║ú b├ái hß╗ìc",
        vocabList: l.vocabList || [],
        grammarList: l.grammarList || [],
        dialogue: l.dialogue || [],
        phonetics: l.phonetics || {
          title: "Luyß╗çn ph├ít ├óm",
          rule: "Quy tß║»c ph├ít ├óm thanh mß║½u/vß║¡n mß║½u",
          examples: ["a", "o", "e"],
        },
        culture: l.culture || "N├⌐t ─æß║╣p v─ân h├│a Trung Hoa gß║»n vß╗¢i b├ái hß╗ìc",
      })),
    };

    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templateSample, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `template_giao_trinh_HSK${selectedLevel}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(`─É├ú xuß║Ñt template mß║½u HSK ${selectedLevel} th├ánh c├┤ng!`);
  };

  // 2. NHß║¼P FILE GI├üO TR├îNH (.JSON)
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
          showToast("File kh├┤ng chß╗⌐a danh s├ích b├ái hß╗ìc hß╗úp lß╗ç!", "error");
          return;
        }

        setLessons(incomingLessons);
        showToast(`─É├ú nß║íp th├ánh c├┤ng ${incomingLessons.length} b├ái hß╗ìc tß╗½ file JSON! Bß║Ñm "L╞░u & Xuß║Ñt bß║ún" ─æß╗â ├íp dß╗Ñng.`);
      } catch (err) {
        showToast("Lß╗ùi ─æß╗ïnh dß║íng file JSON!", "error");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  // 3. TH├èM B├ÇI Hß╗îC Mß╗ÜI V├ÇO Cß║ñP ─Éß╗ÿ N├ÇY
  const handleAddNewLesson = () => {
    const nextNumber = lessons.length > 0 ? Math.max(...lessons.map((l) => l.number)) + 1 : 1;
    const newLesson: Hsk1FullLesson = {
      id: `hsk${selectedLevel}-${String(nextNumber).padStart(2, "0")}`,
      number: nextNumber,
      titleZh: `µû░Φ»╛ ${nextNumber}`,
      pinyin: `X─½n k├¿ ${nextNumber}`,
      titleVi: `B├ái mß╗¢i sß╗æ ${nextNumber}`,
      desc: `Nß╗Öi dung v├á mß╗Ñc ti├¬u kiß║┐n thß╗⌐c b├ái sß╗æ ${nextNumber} - HSK ${selectedLevel}`,
      durationMin: 45,
      vocabCount: 1,
      grammarCount: 1,
      isUnlockedDefault: true,
      unlockedScheduleText: "─É├ú mß╗ƒ kh├│a",
      vocabList: [
        {
          id: `v-new-1`,
          hanzi: "σ¡ªΣ╣á",
          pinyin: "xu├⌐x├¡",
          meaning: "hß╗ìc tß║¡p",
          type: "─Éß╗Öng tß╗½",
          exampleZh: "µêæΣ╗¼σ¡ªΣ╣áµ▒ëΦ»¡πÇé",
          exampleVi: "Ch├║ng t├┤i hß╗ìc tiß║┐ng Trung.",
        },
      ],
      grammarList: [
        {
          title: "Cß║Ñu tr├║c c├óu khß║│ng ─æß╗ïnh c╞í bß║ún",
          structure: "Chß╗º ngß╗» + ─Éß╗Öng tß╗½ + T├ón ngß╗»",
          example: "µêæσ¡ªΣ╣áµ▒ëΦ»¡πÇé",
          explanation: "Trß║¡t tß╗▒ c├óu c╞í bß║ún trong tiß║┐ng Trung t╞░╞íng tß╗▒ tiß║┐ng Viß╗çt (SVO).",
        },
      ],
      dialogue: [
        {
          speaker: "µ¥ÄµÿÄ",
          zh: "Σ╜áσÑ╜∩╝üΣ╜áσ£¿σüÜΣ╗ÇΣ╣ê∩╝ƒ",
          pinyin: "N╟É h╟Äo! N╟É z├ái zu├▓ sh├⌐nme?",
          vi: "Ch├áo bß║ín! Bß║ín ─æang l├ám g├¼ ─æß║Ñy?",
        },
        {
          speaker: "τÄïτ╛Ä",
          zh: "Σ╜áσÑ╜∩╝üµêæσ£¿σ¡ªΣ╣áµ▒ëΦ»¡πÇé",
          pinyin: "N╟É h╟Äo! W╟Æ z├ái xu├⌐x├¡ H├ány╟ö.",
          vi: "Ch├áo bß║ín! T├┤i ─æang hß╗ìc tiß║┐ng Trung.",
        },
      ],
      phonetics: {
        title: `Ngß╗» ├óm trß╗ìng t├óm b├ái ${nextNumber}`,
        rule: "Ph├ón biß╗çt c├íc thanh mß║½u v├á biß║┐n ─æiß╗çu chuß║⌐n",
        examples: ["m─ü", "m├í", "m╟Ä", "m├á"],
      },
      culture: `G├│c v─ân h├│a ß╗⌐ng dß╗Ñng b├ái hß╗ìc sß╗æ ${nextNumber}`,
    };

    setLessons([...lessons, newLesson]);
    setEditingLesson(newLesson);
    setEditorTab("info");
    showToast(`─É├ú th├¬m B├ái ${nextNumber}. Bß║ín c├│ thß╗â chß╗ënh sß╗¡a chi tiß║┐t ngay!`);
  };

  // 4. L╞»U & XUß║ñT Bß║óN TO├ÇN Bß╗ÿ GI├üO TR├îNH
  const handleSaveAndPublishAll = async () => {
    if (lessons.length === 0) {
      showToast("Ch╞░a c├│ b├ái hß╗ìc n├áo ─æß╗â xuß║Ñt bß║ún!", "error");
      return;
    }

    setSaving(true);
    try {
      // 1. L╞░u v├áo Server API
      const res = await fetch("/api/v1/admin/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: selectedLevel,
          lessons,
        }),
      });

      const data = await res.json();

      // 2. ─Éß╗ông bß╗Ö v├áo localStorage ─æß╗â resolver client d├╣ng ngay lß║¡p tß╗⌐c
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `hsk_admin_custom_curriculum_level_${selectedLevel}`,
          JSON.stringify(lessons)
        );
      }

      if (res.ok && data.success) {
        showToast(
          `─É├ú xuß║Ñt bß║ún th├ánh c├┤ng ${lessons.length} b├ái hß╗ìc HSK ${selectedLevel}! To├án bß╗Ö Gi├ío vi├¬n v├á Hß╗ìc sinh sß║╜ thß║Ñy b├ái hß╗ìc mß╗¢i ngay lß║¡p tß╗⌐c.`
        );
      } else {
        showToast(data.message || "─É├ú l╞░u v├áo bß╗Ö nhß╗¢ cß╗Ñc bß╗Ö hß╗ç thß╗æng.");
      }
    } catch (e) {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `hsk_admin_custom_curriculum_level_${selectedLevel}`,
          JSON.stringify(lessons)
        );
      }
      showToast("─É├ú l╞░u v├á xuß║Ñt bß║ún v├áo bß╗Ö nhß╗¢ hß╗ç thß╗æng th├ánh c├┤ng!");
    } finally {
      setSaving(false);
    }
  };

  // 5. L╞»U B├ÇI Hß╗îC ─ÉANG CHß╗êNH Sß╗¼A
  const handleSaveEditingLesson = () => {
    if (!editingLesson) return;
    setLessons((prev) =>
      prev.map((l) => (l.number === editingLesson.number ? editingLesson : l))
    );
    setEditingLesson(null);
    showToast(`─É├ú cß║¡p nhß║¡t xong B├ái ${editingLesson.number}! Nhß╗¢ bß║Ñm "L╞░u & Xuß║Ñt bß║ún" ─æß╗â ├íp dß╗Ñng cho to├án hß╗ç thß╗æng.`);
  };

  // X├│a b├ái hß╗ìc
  const handleDeleteLesson = (num: number) => {
    if (!confirm(`Bß║ín c├│ chß║»c muß╗æn x├│a B├ái ${num} khß╗Åi gi├ío tr├¼nh HSK ${selectedLevel}?`)) {
      return;
    }
    setLessons((prev) => prev.filter((l) => l.number !== num));
    showToast(`─É├ú x├│a B├ái ${num}.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* =================================================================== */}
      {/* 1. HEADER & CHß╗îN Cß║ñP ─Éß╗ÿ HSK 3.0 (Cß║ñP 1 - 9)                         */}
      {/* =================================================================== */}
      <div className="bg-[#FFFCF6] border border-[#BC9B6B]/25 rounded-3xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#BC9B6B]/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#204434] text-white flex items-center justify-center font-bold shadow-sm">
              <BookOpen className="w-6 h-6 text-[#BC9B6B]" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#204434] flex items-center gap-2">
                <span>Quß║ún trß╗ï Kho b├ái hß╗ìc HSK 3.0</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Ti├¬u chuß║⌐n 9 Cß║Ñp (1 - 9)
                </span>
              </h2>
              <p className="text-xs text-[#315E48] mt-0.5">
                Bi├¬n soß║ín gi├ío tr├¼nh chuß║⌐n HSK 3.0 tß╗½ Cß║Ñp 1 ─æß║┐n Cß║Ñp 9, ph├ón bß╗ò tß╗½ vß╗▒ng, ngß╗» ph├íp, ─æoß║ín hß╗Öi thoß║íi v├á xuß║Ñt bß║ún cho to├án tr╞░ß╗¥ng.
              </p>
            </div>
          </div>

          {/* C├íc n├║t h├ánh ─æß╗Öng ch├¡nh */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tß║úi template mß║½u */}
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2.5 rounded-xl border border-[#BC9B6B]/40 bg-white hover:bg-[#FAF7F0] text-[#204434] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Tß║úi vß╗ü file JSON mß║½u ─æß╗â chß╗ënh sß╗¡a"
            >
              <Download className="w-4 h-4 text-[#8F6D3B]" />
              <span>Tß║úi Template (.JSON)</span>
            </button>

            {/* Nhß║¡p file JSON */}
            <label className="px-3.5 py-2.5 rounded-xl border border-[#BC9B6B]/40 bg-white hover:bg-[#FAF7F0] text-[#204434] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs">
              <Upload className="w-4 h-4 text-[#8F6D3B]" />
              <span>Nhß║¡p file (.JSON)</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJsonFile}
              />
            </label>

            {/* Th├¬m b├ái mß╗¢i */}
            <button
              onClick={handleAddNewLesson}
              className="px-4 py-2.5 rounded-xl bg-[#204434] hover:bg-[#17382F] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#BC9B6B]" />
              <span>Th├¬m b├ái hß╗ìc mß╗¢i</span>
            </button>

            {/* L╞░u & Xuß║Ñt bß║ún to├án bß╗Ö */}
            <button
              disabled={saving || lessons.length === 0}
              onClick={handleSaveAndPublishAll}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#204434] to-[#315E48] hover:from-[#17382F] hover:to-[#204434] text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-[#204434]/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#BC9B6B]" />
              <span>{saving ? "─Éang xuß║Ñt bß║ún..." : "L╞░u & Xuß║Ñt bß║ún kho chung"}</span>
            </button>
          </div>
        </div>

        {/* Thanh chß╗ìn Level HSK 3.0: 9 Cß║Ñp (S╞í cß║Ñp 1-3, Trung cß║Ñp 4-6, Cao cß║Ñp 7-9) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-[#8F6D3B] mr-1 shrink-0">Cß║Ñp ─æß╗Ö HSK 3.0:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
            const tierLabel = lvl <= 3 ? "S╞í cß║Ñp" : lvl <= 6 ? "Trung cß║Ñp" : "Cao cß║Ñp";
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
                    ({lessons.length} b├ái)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. DANH S├üCH B├ÇI Hß╗îC TRONG Cß║ñP ─Éß╗ÿ                                   */}
      {/* =================================================================== */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#315E48] bg-[#FFFCF6] rounded-3xl border border-[#BC9B6B]/20">
          ─Éang tß║úi danh s├ích b├ái hß╗ìc HSK {selectedLevel}...
        </div>
      ) : lessons.length === 0 ? (
        <div className="py-16 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#BC9B6B]/30 space-y-3">
          <BookOpen className="w-10 h-10 text-[#8F6D3B]/40 mx-auto" />
          <p className="text-sm font-bold text-[#204434]">Ch╞░a c├│ b├ái hß╗ìc n├áo cho HSK {selectedLevel}</p>
          <p className="text-xs text-[#315E48]">
            Bß║ín c├│ thß╗â bß║Ñm &quot;Th├¬m b├ái hß╗ìc mß╗¢i&quot; hoß║╖c &quot;Nhß║¡p file (.JSON)&quot; ─æß╗â bß║»t ─æß║ºu x├óy dß╗▒ng gi├ío tr├¼nh.
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
                      B├ái {String(les.number).padStart(2, "0")}
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
                      {les.titleVi || les.desc || "B├ái hß╗ìc chuß║⌐n HSK"}
                    </p>
                  </div>

                  {/* Badges th├ánh phß║ºn */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[11px] font-medium text-[#204434]">
                      ≡ƒôÜ {vCount} tß╗½ vß╗▒ng
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[11px] font-medium text-[#204434]">
                      ≡ƒôÉ {gCount} ngß╗» ph├íp
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#E5DEC9] text-[11px] font-medium text-[#204434]">
                      ≡ƒÆ¼ {dCount} thoß║íi
                    </span>
                  </div>
                </div>

                {/* N├║t h├ánh ─æß╗Öng */}
                <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setEditingLesson(JSON.parse(JSON.stringify(les)));
                      setEditorTab("info");
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#BC9B6B]/40 hover:bg-[#FAF7F0] text-[#204434] text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#8F6D3B]" />
                    <span>Sß╗¡a chi tiß║┐t</span>
                  </button>

                  <button
                    onClick={() => handleDeleteLesson(les.number)}
                    className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                    title="X├│a b├ái hß╗ìc n├áy"
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
      {/* 3. MODAL CHß╗êNH Sß╗¼A CHI TIß║╛T B├ÇI Hß╗îC (VISUAL BUILDER)                */}
      {/* =================================================================== */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FAF7F0] to-[#FFFCF6] border-b border-[#E5DEC9] flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#204434] flex items-center gap-2">
                  <span>Chß╗ënh sß╗¡a nß╗Öi dung: B├ái {editingLesson.number}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#204434] text-white">
                    HSK {selectedLevel}
                  </span>
                </h3>
                <p className="text-xs text-[#315E48] mt-0.5">
                  Th├¬m hoß║╖c cß║¡p nhß║¡t tß╗½ vß╗▒ng, ngß╗» ph├íp, ─æoß║ín hß╗Öi thoß║íi, ph├ít ├óm v├á v─ân h├│a.
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
                1. Th├┤ng tin chung
              </button>
              <button
                onClick={() => setEditorTab("vocab")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === "vocab"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-white"
                }`}
              >
                2. Tß╗½ vß╗▒ng ({editingLesson.vocabList?.length || 0})
              </button>
              <button
                onClick={() => setEditorTab("grammar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === "grammar"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-white"
                }`}
              >
                3. Ngß╗» ph├íp ({editingLesson.grammarList?.length || 0})
              </button>
              <button
                onClick={() => setEditorTab("dialogue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === "dialogue"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-white"
                }`}
              >
                4. ─Éoß║ín hß╗Öi thoß║íi ({editingLesson.dialogue?.length || 0})
              </button>
              <button
                onClick={() => setEditorTab("phonetics")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === "phonetics"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-white"
                }`}
              >
                5. Ngß╗» ├óm & V─ân h├│a
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: TH├öNG TIN CHUNG */}
              {editorTab === "info" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#204434] block mb-1">
                        Sß╗æ thß╗⌐ tß╗▒ b├ái hß╗ìc:
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
                        Ti├¬u ─æß╗ü tiß║┐ng Trung (Hanzi):
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Σ╜áσÑ╜∩╝ü"
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
                        Phi├¬n ├óm Pinyin:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: N╟É h╟Äo!"
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
                        Ti├¬u ─æß╗ü tiß║┐ng Viß╗çt:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Xin ch├áo!"
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
                      M├┤ tß║ú & Mß╗Ñc ti├¬u b├ái hß╗ìc:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mß╗Ñc ti├¬u kiß║┐n thß╗⌐c, tß╗½ vß╗▒ng v├á ngß╗» ph├íp cß║ºn ─æß║ít sau b├ái hß╗ìc..."
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

              {/* TAB 2: Tß╗¬ Vß╗░NG */}
              {editorTab === "vocab" && (
                <div className="space-y-6">
                  {/* Form th├¬m tß╗½ mß╗¢i */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      + Th├¬m tß╗½ vß╗▒ng mß╗¢i v├áo b├ái:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Chß╗» H├ín (VD: ΦÇüσ╕ê)"
                        value={newVocabHanzi}
                        onChange={(e) => setNewVocabHanzi(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-sm font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Pinyin (VD: l╟Äosh─½)"
                        value={newVocabPinyin}
                        onChange={(e) => setNewVocabPinyin(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-sm font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Ngh─⌐a TV (VD: thß║ºy gi├ío)"
                        value={newVocabMeaning}
                        onChange={(e) => setNewVocabMeaning(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-sm"
                      />
                      <select
                        value={newVocabType}
                        onChange={(e) => setNewVocabType(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-sm"
                      >
                        <option value="Danh tß╗½">Danh tß╗½</option>
                        <option value="─Éß╗Öng tß╗½">─Éß╗Öng tß╗½</option>
                        <option value="T├¡nh tß╗½">T├¡nh tß╗½</option>
                        <option value="─Éß║íi tß╗½">─Éß║íi tß╗½</option>
                        <option value="Ph├│ tß╗½">Ph├│ tß╗½</option>
                        <option value="Trß╗ú tß╗½">Trß╗ú tß╗½</option>
                        <option value="L╞░ß╗úng tß╗½">L╞░ß╗úng tß╗½</option>
                        <option value="Sß╗æ tß╗½">Sß╗æ tß╗½</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="C├óu v├¡ dß╗Ñ tiß║┐ng H├ín (VD: Σ╗ûµÿ»µêæΣ╗¼τÜäΣ╕¡µûçΦÇüσ╕êπÇé)"
                        value={newVocabExZh}
                        onChange={(e) => setNewVocabExZh(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Dß╗ïch ngh─⌐a c├óu v├¡ dß╗Ñ (VD: Thß║ºy ß║Ñy l├á gi├ío vi├¬n tiß║┐ng Trung cß╗ºa ch├║ng t├┤i.)"
                        value={newVocabExVi}
                        onChange={(e) => setNewVocabExVi(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!newVocabHanzi.trim()) {
                          showToast("Vui l├▓ng nhß║¡p chß╗» H├ín!", "error");
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
                        showToast(`─É├ú th├¬m tß╗½ "${newItem.hanzi}"!`);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Th├¬m v├áo danh s├ích tß╗½ vß╗▒ng</span>
                    </button>
                  </div>

                  {/* Bß║úng danh s├ích tß╗½ vß╗▒ng */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#8F6D3B]">
                      Danh s├ích tß╗½ vß╗▒ng hiß╗çn tß║íi ({editingLesson.vocabList?.length || 0} tß╗½):
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
                              {v.type || "Tß╗½ vß╗▒ng"}
                            </span>
                            <span className="text-[#315E48] font-medium">{v.meaning}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSpeak(v.hanzi)}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                              title="Nghe ph├ít ├óm"
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
                              title="X├│a tß╗½ n├áy"
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

              {/* TAB 3: NGß╗« PH├üP */}
              {editorTab === "grammar" && (
                <div className="space-y-6">
                  {/* Form th├¬m ngß╗» ph├íp */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      + Th├¬m ─æiß╗âm ngß╗» ph├íp mß╗¢i:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="T├¬n ─æiß╗âm ngß╗» ph├íp (VD: C├óu hß╗Åi nghi vß║Ñn vß╗¢i σÉù)"
                        value={newGrammarTitle}
                        onChange={(e) => setNewGrammarTitle(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Cß║Ñu tr├║c c├óu (VD: C├óu trß║ºn thuß║¡t + σÉù?)"
                        value={newGrammarStructure}
                        onChange={(e) => setNewGrammarStructure(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-mono"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Giß║úi th├¡ch chi tiß║┐t quy tß║»c ngß╗» ph├íp..."
                      value={newGrammarExplanation}
                      onChange={(e) => setNewGrammarExplanation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="C├óu v├¡ dß╗Ñ minh hß╗ìa (VD: Σ╜áµÿ»ΦÇüσ╕êσÉù∩╝ƒ)"
                      value={newGrammarExample}
                      onChange={(e) => setNewGrammarExample(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs"
                    />

                    <button
                      onClick={() => {
                        if (!newGrammarTitle.trim()) {
                          showToast("Vui l├▓ng nhß║¡p t├¬n ─æiß╗âm ngß╗» ph├íp!", "error");
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
                        showToast(`─É├ú th├¬m ─æiß╗âm ngß╗» ph├íp mß╗¢i!`);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Th├¬m v├áo danh s├ích ngß╗» ph├íp</span>
                    </button>
                  </div>

                  {/* Danh s├ích ngß╗» ph├íp */}
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
                          title="X├│a ngß╗» ph├íp n├áy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#204434]/10 text-[#204434] text-[11px] font-bold">
                            Ngß╗» ph├íp #{gIdx + 1}
                          </span>
                          <h4 className="font-serif font-bold text-sm text-[#204434]">{g.title}</h4>
                        </div>

                        {g.structure && (
                          <div className="p-2 rounded-lg bg-[#FAF7F0] text-xs font-mono font-semibold text-[#8F6D3B]">
                            Cß║Ñu tr├║c: {g.structure}
                          </div>
                        )}

                        <p className="text-xs text-[#315E48]">{g.explanation}</p>

                        {g.example && (
                          <p className="text-xs font-medium text-[#204434] italic">
                            V├¡ dß╗Ñ: {g.example}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Hß╗ÿI THOß║áI */}
              {editorTab === "dialogue" && (
                <div className="space-y-6">
                  {/* Form th├¬m c├óu thoß║íi */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#BC9B6B]/40 space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      + Th├¬m c├óu thoß║íi mß╗¢i v├áo b├ái:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Ng╞░ß╗¥i n├│i (VD: µ¥ÄµÿÄ / A)"
                        value={newDialSpeaker}
                        onChange={(e) => setNewDialSpeaker(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Chß╗» H├ín (VD: Σ╜áσÑ╜∩╝ü)"
                        value={newDialZh}
                        onChange={(e) => setNewDialZh(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-serif font-bold col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="Pinyin (VD: N╟É h╟Äo!)"
                        value={newDialPinyin}
                        onChange={(e) => setNewDialPinyin(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-mono"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Dß╗ïch ngh─⌐a tiß║┐ng Viß╗çt (VD: Ch├áo bß║ín!)"
                      value={newDialVi}
                      onChange={(e) => setNewDialVi(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs"
                    />

                    <button
                      onClick={() => {
                        if (!newDialZh.trim()) {
                          showToast("Vui l├▓ng nhß║¡p c├óu thoß║íi chß╗» H├ín!", "error");
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
                        showToast("─É├ú th├¬m c├óu thoß║íi!");
                      }}
                      className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Th├¬m c├óu thoß║íi</span>
                    </button>
                  </div>

                  {/* Danh s├ích thoß║íi */}
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
                              title="Nghe c├óu n├áy"
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
                          title="X├│a c├óu n├áy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: NGß╗« ├éM & V─éN H├ôA */}
              {editorTab === "phonetics" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      Ngß╗» ├óm trß╗ìng t├óm cß╗ºa b├ái:
                    </span>
                    <input
                      type="text"
                      placeholder="Ti├¬u ─æß╗ü ngß╗» ├óm (VD: Thanh mß║½u d, t, n, l)"
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
                      placeholder="Quy tß║»c ph├ít ├óm chi tiß║┐t..."
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
                      G├│c v─ân h├│a Trung Hoa thß╗▒c tß║┐:
                    </span>
                    <textarea
                      rows={3}
                      placeholder="Kiß║┐n thß╗⌐c v─ân h├│a, phong tß╗Ñc, lß╗à nghi ch├áo hß╗Åi hoß║╖c c├óu chuyß╗çn th├║ vß╗ï..."
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
                  {/* Phần A: Bài đọc hiểu (reading_items) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E5DEC9]">
                      <BookMarked className="w-4 h-4 text-[#8F6D3B]" />
                      <h4 className="font-serif font-bold text-sm text-[#204434]">
                        Bài đọc hiểu (reading_items)
                      </h4>
                    </div>
                    <p className="text-xs text-[#315E48] leading-5">
                      Nhập nội dung bài đọc và từ vựng mở rộng. Dữ liệu sẽ tự động đồng bộ sang giáo viên và hiển thị ở phần &quot;Luyện đọc hiểu&quot; độc lập.
                    </p>
                    <RichReadingEditor
                      value={editingLesson.reading ?? {
                        id: `${editingLesson.id}-reading`,
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
                        type="button"
                        onClick={() =>
                          setEditingLesson({ ...editingLesson, reading: undefined })
                        }
                        className="text-xs text-red-500 underline hover:text-red-700 cursor-pointer"
                      >
                        Xóa bài đọc hiểu này
                      </button>
                    )}
                  </div>

                  {/* Phần B: Văn hóa giao tiếp & Thực tế (culture_items) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E5DEC9]">
                      <Globe2 className="w-4 h-4 text-[#8F6D3B]" />
                      <h4 className="font-serif font-bold text-sm text-[#204434]">
                        Văn hóa giao tiếp & Cách sử dụng thực tế (culture_items)
                      </h4>
                    </div>
                    <p className="text-xs text-[#315E48] leading-5">
                      Nhập mẫu câu vàng, cách nói lịch sự, bối cảnh và cấm kỵ văn hóa. Bên giáo viên sẽ hiển thị độc lập tại &quot;Văn hóa giao tiếp & Cách sử dụng thực tế&quot;.
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
                Hß╗ºy bß╗Å
              </button>

              <button
                onClick={handleSaveEditingLesson}
                className="px-6 py-2.5 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#17382F] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#BC9B6B]" />
                <span>Ho├án tß║Ñt & Cß║¡p nhß║¡t b├ái hß╗ìc</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
