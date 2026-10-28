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
  Target,
  Search,
  Filter,
  Check,
  BookMarked,
  Globe2,
  Headphones,
} from "lucide-react";
import {
  Hsk1FullLesson,
  GrammarExerciseItem,
  GrammarExerciseMode,
} from "@/lib/hsk1-full-lessons";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";
import { RichReadingEditor, RichCultureEditor } from "@/components/teacher/LessonRichSections";
import type { ReadingItem, CulturalNoteItem } from "@/lib/lesson-data";
import CloudinaryUpload from "@/components/common/CloudinaryUploadButton";

interface CurriculumBuilderWorkspaceProps {
  showToast: (msg: string, type?: "success" | "error") => void;
}

const EXERCISE_MODE_LABELS: Record<GrammarExerciseMode, { label: string; color: string; desc: string }> = {
  choose_correct: {
    label: "Chọn câu đúng",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    desc: "Trắc nghiệm 4 đáp án chọn câu đúng ngữ pháp",
  },
  fill_blank: {
    label: "Điền từ vào chỗ trống",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    desc: "Chọn từ/cụm từ thích hợp điền vào chỗ trống",
  },
  reorder: {
    label: "Sắp xếp từ thành câu",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    desc: "Sắp xếp các từ xáo trộn thành câu hoàn chỉnh",
  },
  correct_mistake: {
    label: "Sửa câu sai",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    desc: "Tìm và sửa lỗi sai ngữ pháp trong câu",
  },
  listen_dialogue: {
    label: "Nghe hiểu hội thoại",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    desc: "Nghe đoạn hội thoại và chọn đáp án chính xác",
  },
};

export default function CurriculumBuilderWorkspace({
  showToast,
}: CurriculumBuilderWorkspaceProps) {
  // Cấp độ HSK đang chọn (1 - 9)
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  // Chế độ xem chính: Danh sách bài học vs Ngân hàng bài tập ngữ pháp
  const [mainView, setMainView] = useState<"lessons" | "grammar_hub">("lessons");

  // Danh sách bài học của cấp độ đang chọn
  const [lessons, setLessons] = useState<Hsk1FullLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal chỉnh sửa chi tiết bài học
  const [editingLesson, setEditingLesson] = useState<Hsk1FullLesson | null>(null);
  const [editorTab, setEditorTab] = useState<
    "info" | "vocab" | "grammar" | "dialogue" | "phonetics" | "richcontent" | "grammar_exercises"
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

  // State thêm câu hỏi bài tập ngữ pháp mới trong editor
  const [newExMode, setNewExMode] = useState<GrammarExerciseMode>("choose_correct");
  const [newExRule, setNewExRule] = useState("");
  const [newExPrompt, setNewExPrompt] = useState("");
  const [newExOptionA, setNewExOptionA] = useState("");
  const [newExOptionB, setNewExOptionB] = useState("");
  const [newExOptionC, setNewExOptionC] = useState("");
  const [newExOptionD, setNewExOptionD] = useState("");
  const [newExCorrect, setNewExCorrect] = useState("A");
  const [newExExplanation, setNewExExplanation] = useState("");
  const [newExScrambled, setNewExScrambled] = useState(""); // cho reorder, ngăn cách bằng dấu phẩy
  const [newExWrongSentence, setNewExWrongSentence] = useState(""); // cho correct_mistake
  const [newExAudioUrl, setNewExAudioUrl] = useState(""); // cho listen_dialogue (URL file nghe)
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null); // Quản lý ID câu hỏi đang được chỉnh sửa

  // State bộ lọc cho Ngân hàng bài tập ngữ pháp (grammar_hub)
  const [filterLessonNumber, setFilterLessonNumber] = useState<number | "ALL">("ALL");
  const [filterExerciseMode, setFilterExerciseMode] = useState<string>("ALL");
  const [exerciseSearch, setExerciseSearch] = useState<string>("");

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
          const localLessons = getLessonsByHskLevel(selectedLevel);
          setLessons(localLessons);
        }
      } catch {
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
          rule: "Quy tắc phát âm",
          examples: ["a", "o", "e"],
        },
        culture: l.culture || "Nét đẹp văn hóa",
        grammarExercises: l.grammarExercises || [],
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

    // 1B. TẢI VỀ FILE TEMPLATE CÂU HỎI BÀI TẬP NGỮ PHÁP (.JSON)
  const handleDownloadExerciseTemplate = () => {
    const exerciseTemplateSample = {
      hskLevel: selectedLevel,
      description: `Template mẫu nhập câu hỏi bài tập ngữ pháp HSK ${selectedLevel}`,
      instructions: "Admin có thể chuẩn bị nhiều câu hỏi bài tập cho các bài học khác nhau trong file này. Trường 'lessonNumber' quy định câu hỏi thuộc về bài học nào (ví dụ: bài 1 hoặc bài 9).",
      exercises: [
        {
          lessonNumber: 1,
          mode: "choose_correct",
          grammarRule: "Quy tắc chào hỏi lịch sự & xưng hô",
          prompt: "Chọn câu chào hỏi thầy giáo Vương đúng trật tự và lịch sự nhất:",
          options: [
            "A. 好王老师！",
            "B. 王老师，您好！",
            "C. 王老师，你好们！",
            "D. 您好王老师是！"
          ],
          correctAnswer: "B",
          explanation: "Quy tắc chào hỏi: Danh từ/Chức danh + 您好 (王老师，您好！). Dùng '您' để thể hiện sự tôn trọng với thầy cô."
        },
        {
          lessonNumber: 1,
          mode: "fill_blank",
          grammarRule: "Đại từ kính trọng 您",
          prompt: "Điền từ thích hợp vào chỗ trống: 小语遇见王老师，礼貌地说：“王老师，____ 好！”",
          options: ["A. 您", "B. 们", "C. 谁", "D. 吗"],
          correctAnswer: "A",
          explanation: "Chào thầy cô cần dùng '您好' (Nín hǎo) để thể hiện sự lễ phép và tôn kính."
        },
        {
          lessonNumber: 1,
          mode: "reorder",
          grammarRule: "Trật tự câu chào hỏi",
          prompt: "Sắp xếp các từ sau thành câu chào hỏi chuẩn xác:",
          scrambledWords: ["您好", "，", "王老师", "！"],
          correctAnswer: "王老师，您好！",
          explanation: "Trật tự chào hỏi tiếng Trung: Danh xưng/Tên người + Dấu phẩy + Lời chào."
        },
        {
          lessonNumber: 1,
          mode: "correct_mistake",
          grammarRule: "Lỗi dùng 们 sau số từ cụ thể",
          prompt: "Tìm và sửa lỗi sai trong câu: '教室里有五个学生们。'",
          wrongSentence: "教室里有五个学生们。",
          options: [
            "A. Bỏ '们', sửa thành: 教室里有五个学生。",
            "B. Đổi '五个' thành '两'"
          ],
          correctAnswer: "A",
          explanation: "Khi đã có số từ và lượng từ xác định phía trước (五个) thì KHÔNG được thêm hậu tố '们'."
        },
        {
          lessonNumber: 1,
          mode: "listen_dialogue",
          grammarRule: "Nghe hiểu hội thoại chào hỏi",
          prompt: "Nghe đoạn thoại ngắn giữa Tiểu Ngữ và thầy Vương, trả lời câu hỏi:",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          dialogueLines: [
            { "speaker": "小语", "zh": "王老师，您好！我是小语。", "pinyin": "Wáng lǎoshī, nín hǎo! Wǒ shì Xiǎoyǔ.", "vi": "Em chào thầy Vương ạ! Em là Tiểu Ngữ." },
            { "speaker": "王老师", "zh": "你好，小语！欢迎来到中文课。", "pinyin": "Nǐ hǎo, Xiǎoyǔ! Huānyíng lái dào zhōngwén kè.", "vi": "Chào Tiểu Ngữ! Chào mừng em đến lớp tiếng Trung." }
          ],
          options: [
            "A. Tiểu Ngữ dùng '您' vì thầy Vương là giáo viên, cần thể hiện sự kính trọng",
            "B. Tiểu Ngữ dùng '您' vì thầy Vương là bạn học cùng lớp"
          ],
          correctAnswer: "A",
          explanation: "Học sinh chào giáo viên cần dùng đại từ '您' để bày tỏ sự lễ phép đối với thầy cô giáo."
        }
      ]
    };

    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exerciseTemplateSample, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `template_cau_hoi_ngu_phap_HSK${selectedLevel}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(`Đã tải template mẫu câu hỏi bài tập HSK ${selectedLevel} thành công!`);
  };

  // 2A. NHẬP THÊM BÀI MỚI (MERGE / APPEND - GIỮ NGUYÊN CÁC BÀI CŨ 1..8)
  const handleImportAppendLessonsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        } else if (parsed && typeof parsed === "object" && parsed.number) {
          incomingLessons = [parsed as Hsk1FullLesson];
        }

        if (incomingLessons.length === 0) {
          showToast("File không chứa danh sách bài học hợp lệ!", "error");
          return;
        }

        // Ghép thông minh: Giữ nguyên tất cả các bài cũ, bài nào mới thì thêm vào, bài nào trùng số bài thì cập nhật
        const lessonMap = new Map<number, Hsk1FullLesson>();
        lessons.forEach((l) => lessonMap.set(l.number, l));
        incomingLessons.forEach((l) => lessonMap.set(l.number, l));

        const merged = Array.from(lessonMap.values()).sort((a, b) => a.number - b.number);
        setLessons(merged);

        if (typeof window !== "undefined") {
          localStorage.setItem(
            `hsk_admin_custom_curriculum_level_${selectedLevel}`,
            JSON.stringify(merged)
          );
        }

        showToast(`Đã ghép thành công ${incomingLessons.length} bài mới vào giáo trình! Hiện có ${merged.length} bài. Hãy bấm "Lưu & Xuất bản" để đồng bộ.`);
      } catch (err) {
        showToast("Lỗi định dạng file JSON!", "error");
      }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  // 2B. NHẬP ĐÈ TOÀN BỘ GIÁO TRÌNH (.JSON)
  const handleImportReplaceLessonsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        if (!confirm(`Hành động này sẽ thay thế TOÀN BỘ bài học hiện tại bằng ${incomingLessons.length} bài trong file. Bạn có chắc chắn không?`)) {
          return;
        }

        setLessons(incomingLessons);

        if (typeof window !== "undefined") {
          localStorage.setItem(
            `hsk_admin_custom_curriculum_level_${selectedLevel}`,
            JSON.stringify(incomingLessons)
          );
        }

        showToast(`Đã thay thế toàn bộ bằng ${incomingLessons.length} bài học mới! Bấm "Lưu & Xuất bản" để đồng bộ.`);
      } catch {
        showToast("Lỗi định dạng file JSON!", "error");
      }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  // 2C. NHẬP CÂU HỎI BÀI TẬP HÀNG LOẠT TỪ FILE (.JSON)
  const handleImportExercisesBatchFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let incomingExercises: Array<GrammarExerciseItem & { lessonNumber?: number }> = [];
        if (Array.isArray(parsed)) {
          incomingExercises = parsed;
        } else if (Array.isArray(parsed.exercises)) {
          incomingExercises = parsed.exercises;
        }

        if (incomingExercises.length === 0) {
          showToast("File không chứa danh sách câu hỏi hợp lệ!", "error");
          return;
        }

        let assignedCount = 0;
        const updatedLessons = lessons.map((les) => {
          const forThisLesson = incomingExercises.filter(
            (ex) => !ex.lessonNumber || ex.lessonNumber === les.number
          );

          if (forThisLesson.length === 0) return les;

          const currentExs = Array.isArray(les.grammarExercises) ? [...les.grammarExercises] : [];

          forThisLesson.forEach((exItem, idx) => {
            const cleanItem: GrammarExerciseItem = {
              id: exItem.id || `hsk${selectedLevel}-${String(les.number).padStart(2, "0")}-ex-batch-${Date.now()}-${idx}`,
              mode: exItem.mode || "choose_correct",
              grammarRule: exItem.grammarRule || "Ngữ pháp bài học",
              prompt: exItem.prompt || "",
              options: exItem.options,
              correctAnswer: exItem.correctAnswer || "A",
              explanation: exItem.explanation || "",
              scrambledWords: exItem.scrambledWords,
              wrongSentence: exItem.wrongSentence,
              dialogueLines: exItem.dialogueLines,
            };
            currentExs.push(cleanItem);
            assignedCount++;
          });

          return {
            ...les,
            grammarExercises: currentExs,
          };
        });

        setLessons(updatedLessons);

        if (typeof window !== "undefined") {
          localStorage.setItem(
            `hsk_admin_custom_curriculum_level_${selectedLevel}`,
            JSON.stringify(updatedLessons)
          );
        }

        showToast(`Đã nạp thành công ${assignedCount} câu hỏi bài tập vào các bài học tương ứng! Bấm "Lưu & Xuất bản" để đồng bộ.`);
      } catch {
        showToast("Lỗi định dạng file JSON câu hỏi!", "error");
      }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };


  // 3. THÊM BÀI HỌC MỚI VÀO CẤP ĐỘ NÀY
  const handleAddNewLesson = () => {
    const nextNumber = lessons.length > 0 ? Math.max(...lessons.map((l) => l.number)) + 1 : 1;
    const newLesson: Hsk1FullLesson = {
      id: `hsk${selectedLevel}-${String(nextNumber).padStart(2, "0")}`,
      number: nextNumber,
      titleZh: `第${nextNumber}课 新课`,
      pinyin: `Dì ${nextNumber} kè: Xīnkè`,
      titleVi: `Bài ${nextNumber}: Bài học mới`,
      desc: `Nội dung kiến thức HSK ${selectedLevel} - Bài ${nextNumber}`,
      durationMin: 45,
      vocabCount: 0,
      grammarCount: 0,
      isUnlockedDefault: true,
      unlockedScheduleText: "Đã mở theo lịch",
      vocabList: [],
      grammarList: [],
      dialogue: [],
      phonetics: {
        title: "Luyện phát âm trọng tâm",
        rule: "Thanh mẫu và vận mẫu tiêu chuẩn",
        examples: ["zh", "ch", "sh", "r"],
      },
      culture: "Góc văn hóa Trung Hoa thực tế gắn với bài học",
      grammarExercises: [],
    };

    setLessons([...lessons, newLesson]);
    setEditingLesson(newLesson);
    setEditorTab("info");
    showToast(`Đã thêm Bài ${nextNumber}. Mời bạn nhập nội dung chi tiết.`);
  };

  // 4. XÓA BÀI HỌC
  const handleDeleteLesson = (lessonNumber: number) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa Bài ${lessonNumber} khỏi giáo trình HSK ${selectedLevel} không?`)) return;
    const filtered = lessons.filter((l) => l.number !== lessonNumber);
    setLessons(filtered);
    showToast(`Đã xóa Bài ${lessonNumber}. Hãy bấm "Lưu & Xuất bản" để đồng bộ.`);
  };

  // 5. LƯU & XUẤT BẢN TOÀN BỘ GIÁO TRÌNH LÊN DATABASE & KHO CHUNG
  const handleSaveAndPublishAll = async () => {
    setSaving(true);
    try {
      // Chuẩn hóa và làm sạch dữ liệu bài học trước khi gửi lên máy chủ
      const sanitizedLessons = lessons.map((l) => {
        const number = Number(l.number) || 1;
        const titleZh = (l.titleZh || "").trim() || `第${number}课`;
        const titleVi = (l.titleVi || "").trim() || `Bài ${number}`;

        const cleanVocab = Array.isArray(l.vocabList)
          ? l.vocabList.map((v: any) => {
              const hanzi = String(v.hanzi || v.word || "").trim();
              const pinyin = String(v.pinyin || v.py || "").trim();
              const meaning = String(v.meaning || v.meaningVi || v.vi || "Từ vựng").trim();
              return {
                ...v,
                hanzi,
                pinyin,
                meaning,
                meaningVi: String(v.meaningVi || meaning),
              };
            })
          : [];

        const cleanGrammar = Array.isArray(l.grammarList)
          ? l.grammarList.map((g: any) => {
              const title = String(g.title || g.titleZh || "Điểm ngữ pháp").trim();
              const structure = String(g.structure || g.pattern || title).trim();
              let example = String(g.example || "").trim();
              if (!example && Array.isArray(g.examples) && g.examples.length > 0) {
                example = typeof g.examples[0] === "string" ? g.examples[0] : String(g.examples[0]?.zh || "");
              }
              if (!example) example = title;
              const explanation = String(g.explanation || g.meaningVi || g.summary || "Cấu trúc ngữ pháp trọng tâm").trim();
              return {
                ...g,
                title,
                structure,
                example,
                explanation,
                examples: Array.isArray(g.examples) ? g.examples : [],
              };
            })
          : [];

        const cleanDialogue = Array.isArray(l.dialogue)
          ? l.dialogue.map((d: any) => {
              const zh = String(d.zh || d.content || "").trim();
              const speaker = String(d.speaker || "Người nói").trim();
              const pinyin = String(d.pinyin || "").trim();
              const vi = String(d.vi || d.meaning || d.meaningVi || zh).trim();
              return {
                ...d,
                speaker,
                zh,
                pinyin,
                vi,
              };
            })
          : [];

        return {
          ...l,
          number,
          titleZh,
          titleVi,
          vocabList: cleanVocab,
          grammarList: cleanGrammar,
          dialogue: cleanDialogue,
          vocabCount: cleanVocab.length,
          grammarCount: cleanGrammar.length,
        };
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(
          `hsk_admin_custom_curriculum_level_${selectedLevel}`,
          JSON.stringify(sanitizedLessons)
        );
      }

      let revision = 0;
      try {
        const curRes = await fetch(`/api/v1/admin/curriculum?level=${selectedLevel}`);
        const curData = await curRes.json();
        if (curData && typeof curData.revision === "number") {
          revision = curData.revision;
        }
      } catch {}

      const res = await fetch("/api/v1/admin/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: selectedLevel,
          revision: revision,
          isDeleted: false,
          lessons: sanitizedLessons,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setLessons(sanitizedLessons);
        showToast(`🎉 Đã lưu & xuất bản thành công toàn bộ ${sanitizedLessons.length} bài học HSK ${selectedLevel} vào cơ sở dữ liệu!`);
      } else {
        const errMsg = resData?.message || `Lỗi máy chủ (${res.status}): Không thể lưu giáo trình.`;
        showToast(errMsg);
      }
    } catch (err: any) {
      console.error("Save curriculum error:", err);
      showToast(`Lỗi kết nối máy chủ: ${err?.message || "Không thể gửi dữ liệu"}`);
    } finally {
      setSaving(false);
    }
  };

  // 6. LƯU THAY ĐỔI CỦA MỘT BÀI HỌC TRONG MODAL
  const handleSaveEditingLesson = () => {
    if (!editingLesson) return;

    const updatedLessons = lessons.map((l) =>
      l.number === editingLesson.number ? editingLesson : l
    );

    if (!lessons.some((l) => l.number === editingLesson.number)) {
      updatedLessons.push(editingLesson);
      updatedLessons.sort((a, b) => a.number - b.number);
    }

    setLessons(updatedLessons);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        `hsk_admin_custom_curriculum_level_${selectedLevel}`,
        JSON.stringify(updatedLessons)
      );
    }

    setEditingLesson(null);
    showToast(`Đã cập nhật xong nội dung Bài ${editingLesson.number}!`);
  };

  // =========================================================================
  // CÁC THAO TÁC QUẢN LÝ BÀI TẬP NGỮ PHÁP (GRAMMAR EXERCISES)
  // =========================================================================

  // Bắt đầu chỉnh sửa một câu hỏi bài tập đã có
  const handleStartEditExercise = (ex: GrammarExerciseItem) => {
    setEditingExerciseId(ex.id);
    setNewExMode(ex.mode);
    setNewExRule(ex.grammarRule || "");
    setNewExPrompt(ex.prompt || "");
    setNewExAudioUrl(ex.audioUrl || "");
    
    // Tách các options A, B, C, D
    if (Array.isArray(ex.options) && ex.options.length > 0) {
      setNewExOptionA(ex.options[0]?.replace(/^[A-D]\.\s*/, "") || "");
      setNewExOptionB(ex.options[1]?.replace(/^[A-D]\.\s*/, "") || "");
      setNewExOptionC(ex.options[2]?.replace(/^[A-D]\.\s*/, "") || "");
      setNewExOptionD(ex.options[3]?.replace(/^[A-D]\.\s*/, "") || "");
    } else {
      setNewExOptionA("");
      setNewExOptionB("");
      setNewExOptionC("");
      setNewExOptionD("");
    }

    setNewExCorrect(ex.correctAnswer || "A");
    setNewExExplanation(ex.explanation || "");
    setNewExScrambled(Array.isArray(ex.scrambledWords) ? ex.scrambledWords.join(", ") : "");
    setNewExWrongSentence(ex.wrongSentence || "");

    // Cuộn mượt mà lên vùng form chỉnh sửa câu hỏi
    if (typeof document !== "undefined") {
      const formEl = document.getElementById("grammar-exercise-form-section");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    showToast(`Đang chỉnh sửa câu hỏi: "${ex.prompt.substring(0, 30)}..."`);
  };

  // Hủy chế độ chỉnh sửa câu hỏi
  const handleCancelEditExercise = () => {
    setEditingExerciseId(null);
    setNewExPrompt("");
    setNewExOptionA("");
    setNewExOptionB("");
    setNewExOptionC("");
    setNewExOptionD("");
    setNewExCorrect("A");
    setNewExExplanation("");
    setNewExScrambled("");
    setNewExWrongSentence("");
    setNewExAudioUrl("");
  };

  // Thêm mới HOẶC Lưu cập nhật câu hỏi bài tập trong editingLesson
  const handleAddGrammarExerciseToEditingLesson = () => {
    if (!editingLesson) return;
    if (!newExPrompt.trim()) {
      showToast("Vui lòng nhập đề bài câu hỏi!", "error");
      return;
    }

    let finalOptions: string[] | undefined = undefined;
    let finalScrambled: string[] | undefined = undefined;

    if (newExMode === "choose_correct" || newExMode === "fill_blank" || newExMode === "listen_dialogue") {
      if (!newExOptionA.trim() || !newExOptionB.trim()) {
        showToast("Vui lòng nhập ít nhất lựa chọn A và B!", "error");
        return;
      }
      finalOptions = [
        `A. ${newExOptionA.replace(/^[A-D]\.\s*/, "").trim()}`,
        `B. ${newExOptionB.replace(/^[A-D]\.\s*/, "").trim()}`,
      ];
      if (newExOptionC.trim()) {
        finalOptions.push(`C. ${newExOptionC.replace(/^[A-D]\.\s*/, "").trim()}`);
      }
      if (newExOptionD.trim()) {
        finalOptions.push(`D. ${newExOptionD.replace(/^[A-D]\.\s*/, "").trim()}`);
      }
    } else if (newExMode === "reorder") {
      finalScrambled = newExScrambled
        .split(/[,，/|]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (finalScrambled.length < 2) {
        showToast("Vui lòng nhập các từ xáo trộn (cách nhau bởi dấu phẩy)!", "error");
        return;
      }
    } else if (newExMode === "correct_mistake") {
      if (newExOptionA.trim()) {
        finalOptions = [
          `A. ${newExOptionA.replace(/^[A-D]\.\s*/, "").trim()}`,
          `B. ${newExOptionB.replace(/^[A-D]\.\s*/, "").trim()}`,
        ];
        if (newExOptionC.trim()) finalOptions.push(`C. ${newExOptionC.replace(/^[A-D]\.\s*/, "").trim()}`);
        if (newExOptionD.trim()) finalOptions.push(`D. ${newExOptionD.replace(/^[A-D]\.\s*/, "").trim()}`);
      }
    }

    const currentExercises = Array.isArray(editingLesson.grammarExercises)
      ? [...editingLesson.grammarExercises]
      : [];

    if (editingExerciseId) {
      // Chế độ CẬP NHẬT câu hỏi đã có
      const updatedExercises = currentExercises.map((ex) => {
        if (ex.id === editingExerciseId) {
          return {
            ...ex,
            mode: newExMode,
            grammarRule: newExRule.trim() || (editingLesson.grammarList?.[0]?.title ?? "Ngữ pháp trọng tâm"),
            prompt: newExPrompt.trim(),
            audioUrl: newExMode === "listen_dialogue" ? newExAudioUrl.trim() || undefined : undefined,
            options: finalOptions,
            scrambledWords: finalScrambled,
            wrongSentence: newExWrongSentence.trim() || undefined,
            correctAnswer: newExCorrect.trim(),
            explanation: newExExplanation.trim() || "Căn cứ theo cấu trúc ngữ pháp chuẩn của bài học.",
          };
        }
        return ex;
      });

      setEditingLesson({
        ...editingLesson,
        grammarExercises: updatedExercises,
      });

      showToast("🎉 Đã lưu thay đổi câu hỏi bài tập thành công!");
    } else {
      // Chế độ THÊM MỚI câu hỏi
      const newExItem: GrammarExerciseItem = {
        id: `hsk${selectedLevel}-${String(editingLesson.number).padStart(2, "0")}-ex-${Date.now()}`,
        mode: newExMode,
        grammarRule: newExRule.trim() || (editingLesson.grammarList?.[0]?.title ?? "Ngữ pháp trọng tâm"),
        prompt: newExPrompt.trim(),
        audioUrl: newExMode === "listen_dialogue" ? newExAudioUrl.trim() || undefined : undefined,
        options: finalOptions,
        scrambledWords: finalScrambled,
        wrongSentence: newExWrongSentence.trim() || undefined,
        correctAnswer: newExCorrect.trim(),
        explanation: newExExplanation.trim() || "Căn cứ theo cấu trúc ngữ pháp chuẩn của bài học.",
      };

      setEditingLesson({
        ...editingLesson,
        grammarExercises: [...currentExercises, newExItem],
      });

      showToast("Đã thêm câu hỏi bài tập ngữ pháp mới thành công!");
    }

    // Reset form và thoát chế độ sửa
    setEditingExerciseId(null);
    setNewExPrompt("");
    setNewExOptionA("");
    setNewExOptionB("");
    setNewExOptionC("");
    setNewExOptionD("");
    setNewExCorrect("A");
    setNewExExplanation("");
    setNewExScrambled("");
    setNewExWrongSentence("");
    setNewExAudioUrl("");
  };

  // Xóa câu hỏi trong editingLesson
  const handleDeleteGrammarExercise = (exerciseId: string) => {
    if (!editingLesson || !editingLesson.grammarExercises) return;
    if (editingExerciseId === exerciseId) {
      handleCancelEditExercise();
    }
    setEditingLesson({
      ...editingLesson,
      grammarExercises: editingLesson.grammarExercises.filter((ex) => ex.id !== exerciseId),
    });
    showToast("Đã xóa câu hỏi khỏi bài học!");
  };

  // Tự động sinh câu hỏi mẫu bám sát điểm ngữ pháp của bài học này
  const handleGenerateSampleExercisesForLesson = () => {
    if (!editingLesson) return;
    const gList = editingLesson.grammarList || [];
    if (gList.length === 0) {
      showToast("Bài học này chưa có điểm ngữ pháp nào để tự động sinh câu hỏi!", "error");
      return;
    }

    const generated: GrammarExerciseItem[] = [];

    gList.forEach((g, idx) => {
      // 1. Dạng chọn câu đúng
      generated.push({
        id: `gen-${editingLesson.id}-choose-${idx + 1}`,
        mode: "choose_correct",
        grammarRule: g.title,
        prompt: `Chọn câu áp dụng đúng cấu trúc "${g.title}":`,
        options: [
          `A. ${g.example.split("·")[0]?.split("(")[0]?.trim() || g.example}`,
          `B. 不${g.example.split("·")[0]?.split("(")[0]?.trim() || g.example}吗`,
          `C. 吗${g.example.split("·")[0]?.split("(")[0]?.trim() || g.example}`,
          `D. 是${g.example.split("·")[0]?.split("(")[0]?.trim() || g.example}`,
        ],
        correctAnswer: "A",
        explanation: g.explanation || `Cấu trúc ngữ pháp chuẩn: ${g.structure}`,
      });

      // 2. Dạng điền từ
      generated.push({
        id: `gen-${editingLesson.id}-fill-${idx + 1}`,
        mode: "fill_blank",
        grammarRule: g.title,
        prompt: `Điền từ/trợ từ thích hợp theo cấu trúc "${g.structure}":`,
        options: ["A. 的", "B. 吗", "C. 很", "D. 呢"],
        correctAnswer: "A",
        explanation: `Quy tắc ngữ pháp cần nắm: ${g.structure}. ${g.explanation || ""}`,
      });
    });

    const currentExercises = Array.isArray(editingLesson.grammarExercises)
      ? editingLesson.grammarExercises
      : [];

    setEditingLesson({
      ...editingLesson,
      grammarExercises: [...currentExercises, ...generated],
    });

    showToast(`Đã tự động tạo ${generated.length} câu hỏi mẫu bám sát ngữ pháp bài này!`);
  };

  // =========================================================================
  // THỐNG KÊ & DANH SÁCH TỔNG HỢP CHO NGÂN HÀNG BÀI TẬP NGỮ PHÁP (HUB)
  // =========================================================================

  // Gom toàn bộ câu hỏi của tất cả bài học trong HSK đang chọn
  const allGrammarExercises = useMemo(() => {
    const list: Array<{
      exercise: GrammarExerciseItem;
      lessonNumber: number;
      lessonTitleZh: string;
      lessonTitleVi: string;
    }> = [];

    lessons.forEach((les) => {
      if (Array.isArray(les.grammarExercises)) {
        les.grammarExercises.forEach((ex) => {
          list.push({
            exercise: ex,
            lessonNumber: les.number,
            lessonTitleZh: les.titleZh,
            lessonTitleVi: les.titleVi || "",
          });
        });
      }
    });

    return list;
  }, [lessons]);

  // Lọc câu hỏi trong Hub
  const filteredExercises = useMemo(() => {
    return allGrammarExercises.filter((item) => {
      // Lọc theo bài
      if (filterLessonNumber !== "ALL" && item.lessonNumber !== filterLessonNumber) {
        return false;
      }
      // Lọc theo dạng bài
      if (filterExerciseMode !== "ALL" && item.exercise.mode !== filterExerciseMode) {
        return false;
      }
      // Tìm kiếm từ khóa
      if (exerciseSearch.trim()) {
        const q = exerciseSearch.toLowerCase();
        const inPrompt = item.exercise.prompt.toLowerCase().includes(q);
        const inRule = item.exercise.grammarRule.toLowerCase().includes(q);
        const inExplain = item.exercise.explanation.toLowerCase().includes(q);
        const inLesson = item.lessonTitleZh.toLowerCase().includes(q);
        if (!inPrompt && !inRule && !inExplain && !inLesson) return false;
      }
      return true;
    });
  }, [allGrammarExercises, filterLessonNumber, filterExerciseMode, exerciseSearch]);

  // Xóa câu hỏi trực tiếp từ Hub
  const handleDeleteExerciseFromHub = (lessonNum: number, exerciseId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi bài tập này không?")) return;
    const updated = lessons.map((l) => {
      if (l.number === lessonNum && Array.isArray(l.grammarExercises)) {
        return {
          ...l,
          grammarExercises: l.grammarExercises.filter((ex) => ex.id !== exerciseId),
        };
      }
      return l;
    });
    setLessons(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `hsk_admin_custom_curriculum_level_${selectedLevel}`,
        JSON.stringify(updated)
      );
    }
    showToast("Đã xóa câu hỏi bài tập thành công! Hãy bấm 'Lưu & Xuất bản' để đồng bộ máy chủ.");
  };

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. THANH ĐIỀU HƯỚNG CẤP ĐỘ HSK 3.0 VÀ GÓC NHÌN CHÍNH                */}
      {/* =================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-[#204434] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#8F6D3B]" />
              <span>Quản trị Chương Trình Giảng Dạy & Bài Tập HSK</span>
            </h2>
            <p className="text-xs text-[#315E48] mt-1">
              Admin tạo bài học chuẩn, quản lý ngân hàng bài tập ngữ pháp theo bài và xuất bản cho học sinh làm.
            </p>
          </div>

          {/* Cụm công cụ nhập / xuất / lưu */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tải template bài học */}
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-2 rounded-xl border border-[#BC9B6B]/40 bg-white hover:bg-[#FAF7F0] text-[#204434] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Tải về file JSON mẫu bài học"
            >
              <Download className="w-3.5 h-3.5 text-[#8F6D3B]" />
              <span>Template bài học</span>
            </button>

            {/* Tải template câu hỏi bài tập */}
            <button
              onClick={handleDownloadExerciseTemplate}
              className="px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Tải về file JSON mẫu nhập câu hỏi bài tập ngữ pháp"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>Template câu hỏi (.JSON)</span>
            </button>

            {/* Nhập thêm bài mới (Append / Merge - Giữ nguyên các bài cũ) */}
            <label className="px-3 py-2 rounded-xl border border-[#204434] bg-[#204434]/5 hover:bg-[#204434]/10 text-[#204434] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-[#204434]" />
              <span>➕ Nhập thêm bài riêng (.JSON)</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportAppendLessonsFile}
              />
            </label>

            {/* Nhập câu hỏi hàng loạt */}
            <label className="px-3 py-2 rounded-xl border border-amber-400 bg-amber-100/60 hover:bg-amber-200/60 text-amber-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-amber-800" />
              <span>📤 Nhập câu hỏi (.JSON)</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportExercisesBatchFile}
              />
            </label>

            {/* Nhập đè toàn bộ */}
            <label className="px-2.5 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1 transition cursor-pointer" title="Nhập thay thế toàn bộ danh sách bài học">
              <span>🔄 Nhập đè tất cả</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportReplaceLessonsFile}
              />
            </label>

            {/* Thêm bài mới */}
            <button
              onClick={handleAddNewLesson}
              className="px-3.5 py-2 rounded-xl bg-[#204434] hover:bg-[#17382F] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span>Thêm bài mới</span>
            </button>

            {/* Lưu & Xuất bản toàn bộ */}
            <button
              disabled={saving || lessons.length === 0}
              onClick={handleSaveAndPublishAll}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#204434] to-[#315E48] hover:from-[#17382F] hover:to-[#204434] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-[#204434]/20 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span>{saving ? "Đang xuất bản..." : "Lưu & Xuất bản kho chung"}</span>
            </button>
          </div>
        </div>

        {/* Thanh chọn Level HSK 3.0 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-[#8F6D3B] mr-1 shrink-0">Cấp độ:</span>
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
                    selectedLevel === lvl ? "bg-white/20 text-white" : "bg-[#F3EFE6] text-[#8F6D3B]"
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

        {/* Chuyển đổi góc nhìn chính: Bài học vs Ngân hàng bài tập ngữ pháp */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#E5DEC9]">
          <button
            onClick={() => setMainView("lessons")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              mainView === "lessons"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-white border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📚 Danh sách bài học ({lessons.length})</span>
          </button>

          <button
            onClick={() => setMainView("grammar_hub")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              mainView === "grammar_hub"
                ? "bg-[#204434] text-white shadow-xs"
                : "bg-white border border-[#E5DEC9] text-[#315E48] hover:bg-[#FAF7F0]"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>🎯 Ngân hàng bài tập ngữ pháp ({allGrammarExercises.length} câu)</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2A. GÓC NHÌN 1: DANH SÁCH BÀI HỌC TRONG CẤP ĐỘ                      */}
      {/* =================================================================== */}
      {mainView === "lessons" && (
        <>
          {loading ? (
            <div className="py-16 text-center text-xs text-[#315E48] bg-[#FFFCF6] rounded-3xl border border-[#BC9B6B]/20">
              Đang tải danh sách bài học HSK {selectedLevel}...
            </div>
          ) : lessons.length === 0 ? (
            <div className="py-16 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#BC9B6B]/30 space-y-3">
              <BookOpen className="w-10 h-10 text-[#8F6D3B]/40 mx-auto" />
              <p className="text-sm font-bold text-[#204434]">Chưa có bài học nào cho HSK {selectedLevel}</p>
              <p className="text-xs text-[#315E48]">
                Bấm &quot;Thêm bài mới&quot; hoặc &quot;Nhập file (.JSON)&quot; để bắt đầu xây dựng giáo trình.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((les) => {
                const vCount = les.vocabList?.length || 0;
                const gCount = les.grammarList?.length || 0;
                const dCount = les.dialogue?.length || 0;
                const exCount = les.grammarExercises?.length || 0;

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
                        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                          exCount > 0
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                          🎯 {exCount} bài tập ngữ pháp
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
                        <span>Sửa chi tiết bài</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingLesson(JSON.parse(JSON.stringify(les)));
                          setEditorTab("grammar_exercises");
                        }}
                        className="py-2 px-3 rounded-xl bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Vào sửa bài tập ngữ pháp"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>Bài tập</span>
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
        </>
      )}

      {/* =================================================================== */}
      {/* 2B. GÓC NHÌN 2: NGÂN HÀNG BÀI TẬP NGỮ PHÁP (GRAMMAR HUB)            */}
      {/* =================================================================== */}
      {mainView === "grammar_hub" && (
        <div className="space-y-4">
          {/* Thanh lọc & tìm kiếm câu hỏi */}
          <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/40 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Lọc theo bài học */}
              <div className="flex items-center gap-1.5 text-xs text-[#204434] font-bold">
                <Filter className="w-3.5 h-3.5 text-[#8F6D3B]" />
                <span>Bài học:</span>
                <select
                  value={filterLessonNumber}
                  onChange={(e) =>
                    setFilterLessonNumber(
                      e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-xs font-semibold text-[#204434]"
                >
                  <option value="ALL">Tất cả bài học ({lessons.length} bài)</option>
                  {lessons.map((l) => (
                    <option key={l.number} value={l.number}>
                      Bài {String(l.number).padStart(2, "0")}: {l.titleZh}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc theo dạng bài */}
              <div className="flex items-center gap-1.5 text-xs text-[#204434] font-bold">
                <span>Dạng bài:</span>
                <select
                  value={filterExerciseMode}
                  onChange={(e) => setFilterExerciseMode(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-xs font-semibold text-[#204434]"
                >
                  <option value="ALL">Tất cả dạng bài</option>
                  <option value="choose_correct">Chọn câu đúng</option>
                  <option value="fill_blank">Điền từ vào chỗ trống</option>
                  <option value="reorder">Sắp xếp từ thành câu</option>
                  <option value="correct_mistake">Sửa câu sai</option>
                  <option value="listen_dialogue">Nghe hiểu hội thoại</option>
                </select>
              </div>
            </div>

            {/* Ô tìm kiếm */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#8F6D3B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo đề bài, điểm ngữ pháp..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E5DEC9] bg-white text-xs"
              />
            </div>
          </div>

          {/* Danh sách câu hỏi */}
          {filteredExercises.length === 0 ? (
            <div className="py-16 text-center bg-[#FFFCF6] rounded-3xl border border-dashed border-[#BC9B6B]/30 space-y-3">
              <Target className="w-10 h-10 text-[#8F6D3B]/40 mx-auto" />
              <p className="text-sm font-bold text-[#204434]">
                Chưa có câu hỏi bài tập ngữ pháp nào khớp với bộ lọc
              </p>
              <p className="text-xs text-[#315E48]">
                Bạn có thể bấm &quot;Sửa chi tiết bài&quot; để thêm câu hỏi bài tập trực tiếp vào từng bài học.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-[#8F6D3B] font-bold px-1 flex items-center justify-between">
                <span>Hiển thị {filteredExercises.length} câu hỏi bài tập ngữ pháp</span>
                <span>HSK {selectedLevel} 3.0</span>
              </div>

              {filteredExercises.map((item, idx) => {
                const ex = item.exercise;
                const modeInfo = EXERCISE_MODE_LABELS[ex.mode] || {
                  label: ex.mode,
                  color: "bg-slate-50 text-slate-700 border-slate-200",
                };

                return (
                  <div
                    key={ex.id || idx}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/30 hover:border-[#204434] transition shadow-2xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DEC9] pb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#204434] text-white text-[11px] font-bold">
                          Bài {String(item.lessonNumber).padStart(2, "0")} · {item.lessonTitleZh}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${modeInfo.color}`}>
                          {modeInfo.label}
                        </span>
                        <span className="text-xs font-bold text-[#8F6D3B]">
                          📐 {ex.grammarRule}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const targetLesson = lessons.find((l) => l.number === item.lessonNumber);
                            if (targetLesson) {
                              setEditingLesson(JSON.parse(JSON.stringify(targetLesson)));
                              setEditorTab("grammar_exercises");
                              setTimeout(() => handleStartEditExercise(ex), 150);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 transition cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa câu này</span>
                        </button>
                        <button
                          onClick={() => handleDeleteExerciseFromHub(item.lessonNumber, ex.id)}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                          title="Xóa câu hỏi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Nội dung câu hỏi */}
                    <div className="space-y-1.5">
                      <p className="font-serif font-bold text-sm text-[#204434]">
                        {ex.prompt}
                      </p>
                      {ex.meaningVi && (
                        <p className="text-xs text-[#315E48] italic">{ex.meaningVi}</p>
                      )}

                      {/* File âm thanh nếu có */}
                      {ex.audioUrl && (
                        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-900 font-mono truncate min-w-0">
                            <Headphones className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span className="truncate" title={ex.audioUrl}>
                              File nghe: {ex.audioUrl}
                            </span>
                          </div>
                          <audio controls src={ex.audioUrl} className="h-7 w-48 shrink-0" />
                        </div>
                      )}

                      {/* Các lựa chọn nếu có */}
                      {Array.isArray(ex.options) && ex.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {ex.options.map((opt, oIdx) => {
                            const isCorrect =
                              ex.correctAnswer === opt.charAt(0) ||
                              opt.includes(ex.correctAnswer);
                            return (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                                  isCorrect
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                                    : "bg-white border-[#E5DEC9] text-[#204434]"
                                }`}
                              >
                                <span>{opt}</span>
                                {isCorrect && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white shrink-0 ml-2">
                                    Đáp án đúng
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Từ xáo trộn nếu là reorder */}
                      {ex.mode === "reorder" && Array.isArray(ex.scrambledWords) && (
                        <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-1">
                          <span className="text-[11px] font-bold text-[#8F6D3B] block">
                            Các từ xáo trộn:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {ex.scrambledWords.map((w, wIdx) => (
                              <span
                                key={wIdx}
                                className="px-2.5 py-1 rounded-lg bg-white border border-[#BC9B6B]/40 text-xs font-mono font-bold text-[#204434]"
                              >
                                {w}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-emerald-800 font-bold pt-1">
                            Đáp án chuẩn: {ex.correctAnswer}
                          </p>
                        </div>
                      )}

                      {/* Lời giải thích */}
                      {ex.explanation && (
                        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                          <strong className="font-bold">💡 Giải thích chi tiết:</strong> {ex.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                  Thêm hoặc cập nhật từ vựng, ngữ pháp, đoạn hội thoại và bài tập ngữ pháp cho bài học này.
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
              <button
                onClick={() => setEditorTab("richcontent")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  editorTab === "richcontent"
                    ? "bg-[#204434] text-white"
                    : "text-[#315E48] hover:bg-white"
                }`}
              >
                6. Đọc hiểu & Mở rộng
              </button>
              <button
                onClick={() => setEditorTab("grammar_exercises")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  editorTab === "grammar_exercises"
                    ? "bg-amber-700 text-white shadow-xs"
                    : "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100"
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>7. Bài tập ngữ pháp ({editingLesson.grammarExercises?.length || 0})</span>
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
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#204434] block mb-1">
                        Thời lượng dự kiến (phút):
                      </label>
                      <input
                        type="number"
                        min={10}
                        value={editingLesson.durationMin || 45}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            durationMin: Number(e.target.value) || 45,
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#204434] block mb-1">
                      Tiêu đề tiếng Trung (Hán tự):
                    </label>
                    <input
                      type="text"
                      value={editingLesson.titleZh}
                      onChange={(e) =>
                        setEditingLesson({ ...editingLesson, titleZh: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-white text-sm font-bold font-serif"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#204434] block mb-1">
                        Phiên âm Pinyin:
                      </label>
                      <input
                        type="text"
                        value={editingLesson.pinyin}
                        onChange={(e) =>
                          setEditingLesson({ ...editingLesson, pinyin: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#204434] block mb-1">
                        Tiêu đề tiếng Việt:
                      </label>
                      <input
                        type="text"
                        value={editingLesson.titleVi || ""}
                        onChange={(e) =>
                          setEditingLesson({ ...editingLesson, titleVi: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#204434] block mb-1">
                      Mô tả bài học & Mục tiêu:
                    </label>
                    <textarea
                      rows={3}
                      value={editingLesson.desc || ""}
                      onChange={(e) =>
                        setEditingLesson({ ...editingLesson, desc: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-white text-xs leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: TỪ VỰNG */}
              {editorTab === "vocab" && (
                <div className="space-y-5">
                  {/* Form thêm từ vựng mới */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      + Thêm từ vựng mới:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Hán tự (VD: 你好)"
                        value={newVocabHanzi}
                        onChange={(e) => setNewVocabHanzi(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Pinyin (nǐ hǎo)"
                        value={newVocabPinyin}
                        onChange={(e) => setNewVocabPinyin(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Nghĩa tiếng Việt"
                        value={newVocabMeaning}
                        onChange={(e) => setNewVocabMeaning(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs"
                      />
                      <select
                        value={newVocabType}
                        onChange={(e) => setNewVocabType(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs bg-white"
                      >
                        <option value="Danh từ">Danh từ</option>
                        <option value="Động từ">Động từ</option>
                        <option value="Tính từ">Tính từ</option>
                        <option value="Đại từ">Đại từ</option>
                        <option value="Phó từ">Phó từ</option>
                        <option value="Lượng từ">Lượng từ</option>
                        <option value="Trợ từ">Trợ từ</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Ví dụ tiếng Trung (VD: 你好，老师！)"
                        value={newVocabExZh}
                        onChange={(e) => setNewVocabExZh(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Dịch nghĩa ví dụ (Chào thầy cô ạ!)"
                        value={newVocabExVi}
                        onChange={(e) => setNewVocabExVi(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!newVocabHanzi.trim()) {
                          showToast("Vui lòng nhập chữ Hán tự!", "error");
                          return;
                        }
                        const vList = editingLesson.vocabList || [];
                        setEditingLesson({
                          ...editingLesson,
                          vocabList: [
                            ...vList,
                            {
                              hanzi: newVocabHanzi.trim(),
                              pinyin: newVocabPinyin.trim(),
                              meaning: newVocabMeaning.trim(),
                              type: newVocabType,
                              exampleZh: newVocabExZh.trim(),
                              exampleVi: newVocabExVi.trim(),
                            },
                          ],
                        });
                        setNewVocabHanzi("");
                        setNewVocabPinyin("");
                        setNewVocabMeaning("");
                        setNewVocabExZh("");
                        setNewVocabExVi("");
                        showToast("Đã thêm từ vựng thành công!");
                      }}
                      className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#17382F] transition cursor-pointer"
                    >
                      Thêm từ này
                    </button>
                  </div>

                  {/* Danh sách từ vựng */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {editingLesson.vocabList?.map((v, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white border border-[#E5DEC9] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-base text-[#204434]">
                            {v.hanzi}
                          </span>
                          <span className="font-mono text-[#8F6D3B]">{v.pinyin}</span>
                          <span className="text-[#315E48]">({v.type || "Từ vựng"}):</span>
                          <span className="font-semibold text-slate-800">{v.meaning}</span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingLesson({
                              ...editingLesson,
                              vocabList: editingLesson.vocabList?.filter((_, idx) => idx !== i),
                            });
                          }}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: NGỮ PHÁP */}
              {editorTab === "grammar" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      + Thêm cấu trúc ngữ pháp mới:
                    </span>
                    <input
                      type="text"
                      placeholder="Tiêu đề ngữ pháp (VD: Ngữ pháp 1: Câu chữ 把)"
                      value={newGrammarTitle}
                      onChange={(e) => setNewGrammarTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Công thức/Cấu trúc (VD: Chủ ngữ + 把 + Tân ngữ + Động từ...)"
                      value={newGrammarStructure}
                      onChange={(e) => setNewGrammarStructure(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Câu ví dụ thực tế (VD: 我把作业做完了。)"
                      value={newGrammarExample}
                      onChange={(e) => setNewGrammarExample(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs"
                    />
                    <textarea
                      rows={2}
                      placeholder="Giải thích chi tiết và lưu ý sử dụng..."
                      value={newGrammarExplanation}
                      onChange={(e) => setNewGrammarExplanation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs"
                    />
                    <button
                      onClick={() => {
                        if (!newGrammarTitle.trim() || !newGrammarStructure.trim()) {
                          showToast("Vui lòng nhập tiêu đề và cấu trúc ngữ pháp!", "error");
                          return;
                        }
                        const gList = editingLesson.grammarList || [];
                        setEditingLesson({
                          ...editingLesson,
                          grammarList: [
                            ...gList,
                            {
                              title: newGrammarTitle.trim(),
                              structure: newGrammarStructure.trim(),
                              example: newGrammarExample.trim(),
                              explanation: newGrammarExplanation.trim(),
                            },
                          ],
                        });
                        setNewGrammarTitle("");
                        setNewGrammarStructure("");
                        setNewGrammarExample("");
                        setNewGrammarExplanation("");
                        showToast("Đã thêm điểm ngữ pháp mới!");
                      }}
                      className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#17382F] transition cursor-pointer"
                    >
                      Thêm ngữ pháp này
                    </button>
                  </div>

                  {/* Danh sách ngữ pháp */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {editingLesson.grammarList?.map((g, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-white border border-[#E5DEC9] space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#204434]">{g.title}</span>
                          <button
                            onClick={() => {
                              setEditingLesson({
                                ...editingLesson,
                                grammarList: editingLesson.grammarList?.filter((_, idx) => idx !== i),
                              });
                            }}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="font-mono text-[#8F6D3B]">{g.structure}</p>
                        <p className="text-slate-700 italic">Ví dụ: {g.example}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ĐOẠN HỘI THOẠI */}
              {editorTab === "dialogue" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      + Thêm câu thoại mới:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Người nói (A, B, Tiểu Ngữ...)"
                        value={newDialSpeaker}
                        onChange={(e) => setNewDialSpeaker(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Hán tự câu nói"
                        value={newDialZh}
                        onChange={(e) => setNewDialZh(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold col-span-1 sm:col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Pinyin phiên âm"
                        value={newDialPinyin}
                        onChange={(e) => setNewDialPinyin(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Dịch nghĩa tiếng Việt"
                        value={newDialVi}
                        onChange={(e) => setNewDialVi(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!newDialZh.trim()) {
                          showToast("Vui lòng nhập nội dung câu thoại!", "error");
                          return;
                        }
                        const dList = editingLesson.dialogue || [];
                        setEditingLesson({
                          ...editingLesson,
                          dialogue: [
                            ...dList,
                            {
                              speaker: newDialSpeaker.trim() || "A",
                              zh: newDialZh.trim(),
                              pinyin: newDialPinyin.trim(),
                              vi: newDialVi.trim(),
                            },
                          ],
                        });
                        setNewDialZh("");
                        setNewDialPinyin("");
                        setNewDialVi("");
                        showToast("Đã thêm câu thoại mới!");
                      }}
                      className="px-4 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold hover:bg-[#17382F] transition cursor-pointer"
                    >
                      Thêm câu thoại
                    </button>
                  </div>

                  {/* Danh sách câu thoại */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {editingLesson.dialogue?.map((d, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white border border-[#E5DEC9] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#8F6D3B] mr-2">{d.speaker}:</span>
                          <span className="font-serif font-bold text-sm text-[#204434] mr-2">
                            {d.zh}
                          </span>
                          <span className="text-[#315E48] italic">({d.vi})</span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingLesson({
                              ...editingLesson,
                              dialogue: editingLesson.dialogue?.filter((_, idx) => idx !== i),
                            });
                          }}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
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
                      placeholder="Kiến thức văn hóa, phong tục, lễ nghi chào hỏi..."
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

              {/* TAB 6: ĐỌC HIỂU & MỞ RỘNG */}
              {editorTab === "richcontent" && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E5DEC9]">
                      <BookMarked className="w-4 h-4 text-[#8F6D3B]" />
                      <h4 className="font-serif font-bold text-sm text-[#204434]">
                        Bài đọc hiểu (reading_items)
                      </h4>
                    </div>
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
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E5DEC9]">
                      <Globe2 className="w-4 h-4 text-[#8F6D3B]" />
                      <h4 className="font-serif font-bold text-sm text-[#204434]">
                        Văn hóa giao tiếp & Cách sử dụng thực tế (culture_items)
                      </h4>
                    </div>
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

              {/* TAB 7: BÀI TẬP NGỮ PHÁP (GRAMMAR EXERCISES - TÍNH NĂNG MỚI THEO Ý KIẾN ADMIN) */}
              {editorTab === "grammar_exercises" && (
                <div className="space-y-6">
                  {/* Thanh giới thiệu & nút tự động sinh câu hỏi mẫu */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-amber-700" />
                        <span>Kho bài tập luyện ngữ pháp của Bài {editingLesson.number}</span>
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        Admin nhập câu hỏi để học sinh làm bài tập bám sát kiến thức bài này thay vì câu hỏi fix cứng.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateSampleExercisesForLesson}
                      className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>⚡ Sinh câu hỏi mẫu theo ngữ pháp bài</span>
                    </button>
                  </div>

                  {/* FORM THÊM / SỬA CÂU HỎI */}
                  <div
                    id="grammar-exercise-form-section"
                    className={`p-4 sm:p-5 rounded-2xl bg-white border transition shadow-xs space-y-4 ${
                      editingExerciseId
                        ? "border-amber-400 ring-2 ring-amber-200/60 bg-amber-50/20"
                        : "border-[#E5DEC9]"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2">
                      <span className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
                        {editingExerciseId ? (
                          <>
                            <Edit3 className="w-4 h-4 text-amber-600" />
                            <span className="text-amber-800">
                              Đang chỉnh sửa câu hỏi bài tập (Bài {editingLesson.number}):
                            </span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 text-[#8F6D3B]" />
                            <span>
                              + Thêm câu hỏi bài tập ngữ pháp mới cho Bài {editingLesson.number}:
                            </span>
                          </>
                        )}
                      </span>

                      {editingExerciseId && (
                        <button
                          type="button"
                          onClick={handleCancelEditExercise}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-[11px] font-bold text-amber-900 transition cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Hủy sửa</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#8F6D3B] block mb-1">
                          1. Dạng bài tập:
                        </label>
                        <select
                          value={newExMode}
                          onChange={(e) => setNewExMode(e.target.value as GrammarExerciseMode)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold bg-white text-[#204434]"
                        >
                          <option value="choose_correct">Chọn câu đúng ngữ pháp</option>
                          <option value="fill_blank">Điền từ vào chỗ trống</option>
                          <option value="reorder">Sắp xếp từ thành câu</option>
                          <option value="correct_mistake">Sửa câu sai thành đúng</option>
                          <option value="listen_dialogue">Nghe hiểu hội thoại ngắn</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#8F6D3B] block mb-1">
                          2. Thuộc điểm ngữ pháp nào:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nhập tên ngữ pháp hoặc chọn bên cạnh..."
                            value={newExRule}
                            onChange={(e) => setNewExRule(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-semibold"
                          />
                          {editingLesson.grammarList && editingLesson.grammarList.length > 0 && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) setNewExRule(e.target.value);
                              }}
                              className="px-2 py-2 rounded-xl border border-[#E5DEC9] text-xs bg-[#FAF7F0] text-[#204434]"
                            >
                              <option value="">Chọn từ bài</option>
                              {editingLesson.grammarList.map((g, gi) => (
                                <option key={gi} value={g.title}>
                                  {g.title}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#8F6D3B] block mb-1">
                        3. Đề bài câu hỏi:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Chọn câu chào hỏi đúng trật tự từ tiếng Trung / Điền từ thích hợp vào chỗ trống..."
                        value={newExPrompt}
                        onChange={(e) => setNewExPrompt(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-serif font-bold text-[#204434]"
                      />
                    </div>

                    {/* Ô nhập & Upload File nghe âm thanh (cho dạng listen_dialogue) */}
                    {newExMode === "listen_dialogue" && (
                      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-300/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <Headphones className="w-4 h-4 text-amber-700" />
                            <span>File âm thanh bài nghe (Cloudinary CDN / Audio URL):</span>
                          </label>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            ☁️ Lưu trữ Cloudinary miễn phí
                          </span>
                        </div>

                        {/* Upload trực tiếp lên Cloudinary bằng preset unsigned */}
                        <CloudinaryUpload
                          value={newExAudioUrl}
                          onChange={(url) => setNewExAudioUrl(url)}
                          accept="audio/*"
                          folder="hsk_audio_exercises"
                          placeholder="Chọn file MP3 từ máy tính để tự động tải lên đám mây Cloudinary..."
                        />

                        {/* Hoặc dán link trực tiếp nếu đã có sẵn */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-slate-600 block">
                            Hoặc dán liên kết âm thanh trực tiếp (nếu có sẵn):
                          </span>
                          <input
                            type="url"
                            placeholder="VD: https://res.cloudinary.com/.../audio.mp3"
                            value={newExAudioUrl}
                            onChange={(e) => setNewExAudioUrl(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-mono text-[#204434] focus:outline-hidden focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Form tùy biến theo từng dạng bài */}
                    {(newExMode === "choose_correct" || newExMode === "fill_blank" || newExMode === "listen_dialogue") && (
                      <div className="space-y-2 pt-1">
                        <label className="text-[11px] font-bold text-[#8F6D3B] block">
                          4. Các lựa chọn đáp án:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 text-xs font-bold text-blue-700">A.</span>
                            <input
                              type="text"
                              placeholder="Lựa chọn A"
                              value={newExOptionA}
                              onChange={(e) => setNewExOptionA(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-xl border border-[#E5DEC9] text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 text-xs font-bold text-blue-700">B.</span>
                            <input
                              type="text"
                              placeholder="Lựa chọn B"
                              value={newExOptionB}
                              onChange={(e) => setNewExOptionB(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-xl border border-[#E5DEC9] text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 text-xs font-bold text-blue-700">C.</span>
                            <input
                              type="text"
                              placeholder="Lựa chọn C (tùy chọn)"
                              value={newExOptionC}
                              onChange={(e) => setNewExOptionC(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-xl border border-[#E5DEC9] text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 text-xs font-bold text-blue-700">D.</span>
                            <input
                              type="text"
                              placeholder="Lựa chọn D (tùy chọn)"
                              value={newExOptionD}
                              onChange={(e) => setNewExOptionD(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-xl border border-[#E5DEC9] text-xs"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                          <label className="text-[11px] font-bold text-emerald-800">
                            Đáp án đúng:
                          </label>
                          <select
                            value={newExCorrect}
                            onChange={(e) => setNewExCorrect(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-900"
                          >
                            <option value="A">Đáp án A</option>
                            <option value="B">Đáp án B</option>
                            <option value="C">Đáp án C</option>
                            <option value="D">Đáp án D</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {newExMode === "reorder" && (
                      <div className="space-y-2 pt-1">
                        <label className="text-[11px] font-bold text-[#8F6D3B] block">
                          4. Các từ xáo trộn (ngăn cách bằng dấu phẩy):
                        </label>
                        <input
                          type="text"
                          placeholder="VD: 好, 老师, 您, ！"
                          value={newExScrambled}
                          onChange={(e) => setNewExScrambled(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-mono font-bold"
                        />
                        <div className="pt-1">
                          <label className="text-[11px] font-bold text-emerald-800 block mb-1">
                            Câu hoàn chỉnh chính xác (Đáp án đúng):
                          </label>
                          <input
                            type="text"
                            placeholder="VD: 老师，您好！"
                            value={newExCorrect}
                            onChange={(e) => setNewExCorrect(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-900"
                          />
                        </div>
                      </div>
                    )}

                    {newExMode === "correct_mistake" && (
                      <div className="space-y-2 pt-1">
                        <label className="text-[11px] font-bold text-rose-800 block">
                          Câu có lỗi sai ngữ pháp:
                        </label>
                        <input
                          type="text"
                          placeholder="VD: 教室里有三个学生们。"
                          value={newExWrongSentence}
                          onChange={(e) => setNewExWrongSentence(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-rose-50 text-xs font-bold text-rose-900"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Lựa chọn sửa A (VD: Bỏ '们', viết là: 三个学生)"
                            value={newExOptionA}
                            onChange={(e) => setNewExOptionA(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-[#E5DEC9] text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Lựa chọn sửa B"
                            value={newExOptionB}
                            onChange={(e) => setNewExOptionB(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-[#E5DEC9] text-xs"
                          />
                        </div>
                        <div className="pt-1 flex items-center gap-3">
                          <label className="text-[11px] font-bold text-emerald-800">
                            Đáp án đúng:
                          </label>
                          <select
                            value={newExCorrect}
                            onChange={(e) => setNewExCorrect(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-900"
                          >
                            <option value="A">Đáp án A</option>
                            <option value="B">Đáp án B</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-bold text-[#8F6D3B] block mb-1">
                        5. Lời giải thích ngữ pháp chi tiết:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Giải thích vì sao chọn đáp án này, quy tắc ngữ pháp liên quan..."
                        value={newExExplanation}
                        onChange={(e) => setNewExExplanation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleAddGrammarExerciseToEditingLesson}
                        className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                          editingExerciseId
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-[#204434] hover:bg-[#17382F]"
                        }`}
                      >
                        {editingExerciseId ? (
                          <>
                            <Check className="w-4 h-4 text-white" />
                            <span>💾 Lưu thay đổi câu hỏi</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 text-[#BC9B6B]" />
                            <span>Thêm câu hỏi này vào Bài {editingLesson.number}</span>
                          </>
                        )}
                      </button>

                      {editingExerciseId && (
                        <button
                          type="button"
                          onClick={handleCancelEditExercise}
                          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DANH SÁCH BÀI TẬP ĐÃ CÓ TRONG BÀI NÀY */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-[#204434] block">
                      Danh sách bài tập hiện có ({editingLesson.grammarExercises?.length || 0} câu):
                    </span>

                    {(!editingLesson.grammarExercises || editingLesson.grammarExercises.length === 0) ? (
                      <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-[#E5DEC9] text-xs text-slate-500">
                        Chưa có câu hỏi bài tập nào cho bài này. Hãy nhập form phía trên hoặc bấm &quot;Sinh câu hỏi mẫu&quot;.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {editingLesson.grammarExercises.map((ex, eIdx) => {
                          const modeInfo = EXERCISE_MODE_LABELS[ex.mode] || {
                            label: ex.mode,
                            color: "bg-slate-50 text-slate-700 border-slate-200",
                          };
                          const isBeingEdited = editingExerciseId === ex.id;
                          return (
                            <div
                              key={ex.id || eIdx}
                              className={`p-3.5 rounded-xl bg-white border space-y-2 text-xs shadow-2xs transition ${
                                isBeingEdited
                                  ? "border-amber-400 ring-2 ring-amber-200 bg-amber-50/20"
                                  : "border-[#E5DEC9]"
                              }`}
                            >
                              <div className="flex items-center justify-between border-b border-[#FAF7F0] pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-[#204434] text-white text-[10px] font-bold flex items-center justify-center">
                                    {eIdx + 1}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${modeInfo.color}`}>
                                    {modeInfo.label}
                                  </span>
                                  <span className="font-bold text-[#8F6D3B]">
                                    {ex.grammarRule}
                                  </span>
                                  {isBeingEdited && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                                      Đang sửa
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditExercise(ex)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                    title="Chỉnh sửa câu hỏi này"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Sửa</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteGrammarExercise(ex.id)}
                                    className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                                    title="Xóa câu này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <p className="font-serif font-bold text-[#204434]">
                                {ex.prompt}
                              </p>

                              {/* Hiển thị File nghe Cloudinary nếu có */}
                              {ex.audioUrl && (
                                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 text-[11px] text-amber-900 font-mono truncate min-w-0">
                                    <Headphones className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                    <span className="truncate" title={ex.audioUrl}>
                                      File nghe: {ex.audioUrl}
                                    </span>
                                  </div>
                                  <audio controls src={ex.audioUrl} className="h-7 w-48 shrink-0" />
                                </div>
                              )}

                              {Array.isArray(ex.options) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                  {ex.options.map((opt, oi) => {
                                    const isCorrect =
                                      ex.correctAnswer === opt.charAt(0) ||
                                      opt.includes(ex.correctAnswer);
                                    return (
                                      <div
                                        key={oi}
                                        className={`px-2.5 py-1 rounded-lg border text-[11px] ${
                                          isCorrect
                                            ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                                            : "bg-[#FAF7F0] border-[#E5DEC9] text-slate-700"
                                        }`}
                                      >
                                        {opt}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {ex.mode === "reorder" && Array.isArray(ex.scrambledWords) && (
                                <p className="text-[11px] font-mono text-[#8F6D3B]">
                                  Từ xáo trộn: {ex.scrambledWords.join(" / ")} · Đáp án: <strong className="text-emerald-800">{ex.correctAnswer}</strong>
                                </p>
                              )}

                              {ex.explanation && (
                                <p className="text-[11px] text-amber-900 bg-amber-50/50 p-2 rounded-lg">
                                  💡 <strong>Giải thích:</strong> {ex.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
