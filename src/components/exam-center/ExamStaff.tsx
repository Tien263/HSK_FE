"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileText,
  Headphones,
  Image as ImageIcon,
  Layers,
  Mic,
  Plus,
  RefreshCw,
  Sparkles,
  Trophy,
  Upload,
  X,
} from "lucide-react";
import type { publicationCandidates, gradingQueue } from "@/lib/exam-center-service";
import { EXAM_LEVELS, levelGroup, levelLabel } from "@/lib/exam-center-core";
import { examApi, skillNames, typeNames } from "./exam-client";
import ExamRulesLobby from "./ExamRulesLobby";
import examBlueprint from "@/config/exam_blueprint.json";
import s from "./ExamCenter.module.css";

type Candidate = Awaited<ReturnType<typeof publicationCandidates>>[number];
type Queue = Awaited<ReturnType<typeof gradingQueue>>;

interface ImportedQuestion {
  id: string;
  type: string;
  content: string;
  skill: string;
  points: number;
  correctAnswer: string;
  explanation: string;
  options: { id: string; text?: string; imageUrl?: string }[];
  audioUrl?: string;
  imageUrl?: string;
  pinyin?: string;
  rubric?: string;
}

export default function ExamStaff({
  role,
  view,
  onNavigate,
  onChanged,
}: {
  role: string;
  view: string;
  onNavigate?: (view: string) => void;
  onChanged: () => void;
}) {
  const [papers, setPapers] = useState<Candidate[]>([]);
  const [queue, setQueue] = useState<Queue>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Authoring state
  const [authorLevel, setAuthorLevel] = useState<number>(3);
  const [authorTitle, setAuthorTitle] = useState("Đề thi thử chuẩn HSK 3 · Mẫu 01");
  const [authorDesc, setAuthorDesc] = useState("Đề thi mô phỏng theo cấu trúc chuẩn HSK 3.0 CTI / Hanban.");
  const [authorDuration, setAuthorDuration] = useState<number>(83);
  const [authorPass, setAuthorPass] = useState<number | string>(180);
  const [jsonInput, setJsonInput] = useState("");
  const [previewPaper, setPreviewPaper] = useState<any | null>(null);

  // Sync blueprint when level changes
  useEffect(() => {
    const bp = examBlueprint.levels.find((l) => l.level === authorLevel);
    if (bp) {
      setAuthorDuration(bp.durationMin);
      setAuthorPass(bp.targetScore ?? "");
      setAuthorTitle(`Đề thi thử chuẩn ${levelLabel(authorLevel)} · Mẫu 01`);
    }
  }, [authorLevel]);

  const load = useCallback(() => {
    if (role !== "ADMIN") return;
    if (view === "grading") {
      void examApi<Queue>("grading").then(setQueue).catch((e) => setError(e.message));
    } else if (view === "publications") {
      void examApi<Candidate[]>("publications").then(setPapers).catch((e) => setError(e.message));
    }
  }, [role, view]);

  useEffect(() => {
    load();
  }, [load]);

  if (role !== "ADMIN") {
    return <p role="alert" className={s.error}>Chỉ Admin có quyền truy cập mục này.</p>;
  }

  // Load official HSK 3.0 sample template
  const loadSampleTemplate = (lvl: number) => {
    const bp = examBlueprint.levels.find((l) => l.level === lvl);
    const sampleQuestions: ImportedQuestion[] = [
      {
        id: "q1",
        type: "listening_choice",
        skill: "LISTENING",
        content: "第 1 题：请听录音并选择正确的图片 (A-F)。",
        points: 2,
        correctAnswer: "B",
        explanation: "Trong audio: 男：喂，请问张经理在吗？女：他正在开会，您半个小时以后再打，好吗？Đáp án là B (hình người nghe điện thoại).",
        options: [
          { id: "A", text: "Hình A: Bác sĩ trong bệnh viện", imageUrl: "/theme/hsk/hsk3_q1_a.png" },
          { id: "B", text: "Hình B: Gọi điện thoại văn phòng", imageUrl: "/theme/hsk/hsk3_q1_b.png" },
          { id: "C", text: "Hình C: Uống cà phê đọc sách", imageUrl: "/theme/hsk/hsk3_q1_c.png" },
          { id: "D", text: "Hình D: Mua hoa quả ở chợ", imageUrl: "/theme/hsk/hsk3_q1_d.png" },
        ],
        audioUrl: `/HSK3.0/HSK/音频/HSK（${lvl === 1 ? "一" : lvl === 2 ? "二" : lvl === 3 ? "三" : lvl === 4 ? "四" : lvl === 5 ? "五" : lvl === 6 ? "六" : "七—九"}级）样卷.mp3`,
      },
      {
        id: "q2",
        type: "multiple_choice",
        skill: "READING",
        content: "那个年轻人刚来公司不久，很有工作热情，人也很聪明。\n问：关于那个年轻人，可以知道什么？",
        points: 2,
        correctAnswer: "A",
        explanation: "Bài đọc nêu rõ: '人也很聪明' -> Chọn đáp án A.",
        options: [
          { id: "A", text: "很聪明" },
          { id: "B", text: "是留学生" },
          { id: "C", text: "爱踢足球" },
        ],
      },
      {
        id: "q3",
        type: "sentence_order",
        skill: "WRITING",
        content: "请将下列词语排列成句：\n小狗 / 这只 / 非常 / 可爱",
        points: 4,
        correctAnswer: "这只 小狗 非常 可爱",
        explanation: "Trật tự câu: [Chủ ngữ: 这只小狗] + [Phó từ: 非常] + [Tính từ: 可爱]。",
        options: [
          { id: "1", text: "这只" },
          { id: "2", text: "小狗" },
          { id: "3", text: "非常" },
          { id: "4", text: "可爱" },
        ],
      },
      {
        id: "q4",
        type: "fill_blank",
        skill: "WRITING",
        content: "请根据拼音写出汉字：\n今天天气很 (qíng) ______。",
        points: 2,
        correctAnswer: "晴",
        pinyin: "qíng",
        explanation: "Phiên âm qíng trong '天气很晴' tương ứng với chữ Hán '晴'.",
        options: [],
      },
    ];

    setAuthorLevel(lvl);
    setAuthorTitle(`Đề thi mẫu chuẩn HSK ${lvl} (CTI Hanban)`);
    setAuthorDesc(`Đề thi mô phỏng chuẩn cấu trúc đề thật HSK 3.0 Cấp ${lvl}.`);
    setAuthorDuration(bp?.durationMin || 83);
    setAuthorPass(bp?.targetScore || 180);
    setJsonInput(JSON.stringify(sampleQuestions, null, 2));
    setMessage(`Đã nạp bộ câu hỏi mẫu chuẩn HSK ${lvl}. Bạn có thể bấm "Xem trước" để kiểm tra giao diện học sinh.`);
  };

  const handlePreview = () => {
    let parsed: ImportedQuestion[] = [];
    try {
      parsed = jsonInput.trim() ? JSON.parse(jsonInput) : [];
    } catch {
      setError("Cấu trúc JSON câu hỏi chưa đúng định dạng. Hãy kiểm tra lại dấu phẩy hoặc ngoặc kép.");
      return;
    }

    const bp = examBlueprint.levels.find((l) => l.level === authorLevel);
    const mockPaper = {
      id: "preview_paper_id",
      title: authorTitle,
      description: authorDesc,
      level: authorLevel,
      source: "OFFICIAL",
      durationMin: authorDuration,
      maxScore: parsed.reduce((sum, q) => sum + (Number(q.points) || 1), 0) || bp?.maxScore || 300,
      passScore: authorPass ? Number(authorPass) : null,
      questionsCount: parsed.length || bp?.questionCount || 70,
      skills: bp?.skills || ["LISTENING", "READING", "WRITING"],
      mode: "EXAM",
      available: true,
      questions: parsed,
    };

    setPreviewPaper(mockPaper);
    setError("");
  };

  const handleSaveImport = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let parsed: ImportedQuestion[] = [];
      if (jsonInput.trim()) {
        parsed = JSON.parse(jsonInput);
      }
      if (!parsed.length) {
        throw new Error("Vui lòng nhập ít nhất 1 câu hỏi hoặc bấm 'Nạp đề mẫu HSK 3.0' trước khi lưu.");
      }

      await examApi("importPaper", {
        level: authorLevel,
        title: authorTitle,
        description: authorDesc,
        durationMin: authorDuration,
        passScore: authorPass === "" ? null : Number(authorPass),
        questions: parsed,
      });

      setMessage("Đã chuyển hóa tài liệu và xuất bản đề thi thành công! Học sinh đã có thể vào thi.");
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={s.panel} aria-label="Khu vực quản lý khảo thí">
      {/* Navigation Sub-Tabs */}
      <div className={s.filters} style={{ marginBottom: 20 }}>
        <button
          aria-pressed={view === "authoring"}
          onClick={() => onNavigate?.("authoring")}
        >
          <FileText size={16} /> Nhập & Soạn đề HSK 3.0
        </button>
        <button
          aria-pressed={view === "publications"}
          onClick={() => onNavigate?.("publications")}
        >
          <FileCheck2 size={16} /> Duyệt & cấu hình đề
        </button>
        <button
          aria-pressed={view === "grading"}
          onClick={() => onNavigate?.("grading")}
        >
          <BookOpen size={16} /> Chấm bài tự luận
        </button>
      </div>

      <h1>
        {view === "authoring"
          ? "Nhập tài liệu & chuyển hóa thành đề HSK 3.0"
          : view === "grading"
          ? "Chấm bài tự luận"
          : "Duyệt & cấu hình đề chính thức"}
      </h1>

      <p>
        {view === "authoring"
          ? "Admin nhập tài liệu đề thi chuẩn cấu trúc (có audio, hình ảnh đáp án, câu hỏi sắp xếp từ, chữ Hán) thay vì để AI sinh đề ngẫu nhiên. Có chế độ xem trước đúng giao diện học sinh."
          : view === "grading"
          ? "Điểm các câu tự luận được cộng với phần chấm tự động sau khi lưu."
          : "Duyệt nội dung sẵn sàng, đặt thời gian và ngưỡng đạt trước khi mở cho học sinh."}
      </p>

      {error && <p className={s.error} role="alert">{error}</p>}
      {message && <p className={s.notice} role="status">{message}</p>}

      {/* VIEW: AUTHORING WORKSPACE */}
      {view === "authoring" && (
        <div style={{ display: "grid", gap: 24, marginTop: 20 }}>
          {/* Preset Buttons for Quick Template Loading */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#375531" }}>
              <Sparkles size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
              Nạp mẫu đề từ thư mục HSK3.0:
            </span>
            {EXAM_LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={s.secondary}
                style={{ fontSize: 12, padding: "6px 12px", minHeight: 32 }}
                onClick={() => loadSampleTemplate(lvl)}
              >
                {levelLabel(lvl)}
              </button>
            ))}
          </div>

          {/* Form Configuration */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSaveImport();
            }}
            style={{ display: "grid", gap: 18 }}
          >
            <div className={s.formColumns}>
              <label>
                Cấp độ HSK *
                <select
                  value={authorLevel}
                  onChange={(e) => setAuthorLevel(Number(e.target.value))}
                >
                  {EXAM_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {levelLabel(lvl)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tên đề thi *
                <input
                  required
                  value={authorTitle}
                  onChange={(e) => setAuthorTitle(e.target.value)}
                  placeholder="Ví dụ: Đề thi mô phỏng HSK 3 · Đề số 01"
                />
              </label>
            </div>

            <div className={s.formColumns}>
              <label>
                Thời gian làm bài (phút) *
                <input
                  required
                  type="number"
                  min={1}
                  max={600}
                  value={authorDuration}
                  onChange={(e) => setAuthorDuration(Number(e.target.value))}
                />
              </label>

              <label>
                Mốc điểm đạt (Mục tiêu)
                <input
                  type="number"
                  placeholder="Để trống nếu là HSK 7-9 phân loại"
                  value={authorPass}
                  onChange={(e) => setAuthorPass(e.target.value)}
                />
              </label>
            </div>

            <label>
              Mô tả đề thi
              <input
                value={authorDesc}
                onChange={(e) => setAuthorDesc(e.target.value)}
                placeholder="Ví dụ: Đề thi chuẩn HSK 3.0 giúp học viên luyện tập kỹ năng Nghe, Đọc, Viết..."
              />
            </label>

            {/* Questions JSON Data Editor */}
            <label>
              Dữ liệu danh sách câu hỏi (JSON chuẩn HSK 3.0 với Audio, Ảnh và Lựa chọn)
              <textarea
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  lineHeight: 1.5,
                  minHeight: 280,
                  width: "100%",
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #d5dfc3",
                  background: "#fffef8",
                }}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`[
  {
    "id": "q1",
    "type": "listening_choice",
    "skill": "LISTENING",
    "content": "第 1 题：请听录音并选择正确的图片 (A-F)。",
    "points": 2,
    "correctAnswer": "B",
    "audioUrl": "/HSK3.0/HSK/音频/HSK（三级）样卷.mp3",
    "options": [
      { "id": "A", "text": "Hình A", "imageUrl": "/theme/hsk/hsk3_q1_a.png" },
      { "id": "B", "text": "Hình B", "imageUrl": "/theme/hsk/hsk3_q1_b.png" }
    ]
  }
]`}
              />
            </label>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                className={s.secondary}
                style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
                onClick={handlePreview}
              >
                <Eye size={16} /> Xem trước giao diện học sinh
              </button>

              <button
                type="submit"
                className={s.primary}
                disabled={busy}
                style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
              >
                <Upload size={16} /> {busy ? "Đang xuất bản..." : "Lưu & Xuất bản đề thi"}
              </button>
            </div>
          </form>

          {/* LIVE PREVIEW MODAL */}
          {previewPaper && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(22, 38, 24, 0.75)",
                backdropFilter: "blur(8px)",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                padding: "24px 20px",
              }}
            >
              <div
                style={{
                  maxWidth: 1280,
                  width: "100%",
                  margin: "auto",
                  background: "#f6f7f2",
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                  position: "relative",
                  backgroundImage: "url('/theme/exam-shanshui-depth.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "top center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #dce4cb",
                    paddingBottom: 14,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        background: "#3e6234",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      CHẾ ĐỘ XEM TRƯỚC ADMIN
                    </span>
                    <strong style={{ fontSize: 16, color: "#223824" }}>
                      Giao diện Học sinh sẽ nhìn thấy khi làm bài này
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewPaper(null)}
                    style={{
                      border: "none",
                      background: "#e4ecdb",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#304d2b",
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Render the actual ExamRulesLobby inside Preview */}
                <ExamRulesLobby
                  paper={previewPaper}
                  blueprint={examBlueprint.levels.find((b) => b.level === authorLevel)}
                  onStart={() => alert("Đây là chế độ xem trước của Admin. Đề thi cấu trúc hoàn toàn chuẩn xác!")}
                  onBack={() => setPreviewPaper(null)}
                  busy={false}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: GRADING QUEUE */}
      {view === "grading" && (
        <>
          {queue.map((attempt) => (
            <ManualCard
              key={attempt.id}
              attempt={attempt}
              busy={busy}
              onSave={async (marks) => {
                setBusy(true);
                try {
                  await examApi("grade", { id: attempt.id, marks });
                  setMessage("Đã lưu điểm chấm tay.");
                  setError("");
                  load();
                  onChanged();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          ))}
          {!queue.length && <p className={s.empty}>Chưa có bài chờ chấm tay.</p>}
        </>
      )}

      {/* VIEW: PUBLICATIONS APPROVAL */}
      {view === "publications" && (
        <>
          {papers.map((paper) => (
            <PublicationCard
              key={paper.id}
              paper={paper}
              busy={busy}
              onSave={async (durationMin, passScore, approved) => {
                setBusy(true);
                try {
                  await examApi("publication", {
                    paperId: paper.id,
                    durationMin,
                    passScore,
                    approved,
                  });
                  setMessage(approved ? "Đã duyệt và cấu hình đề." : "Đã ẩn đề khỏi trung tâm thi.");
                  setError("");
                  onChanged();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          ))}
          {!papers.length && <p className={s.empty}>Chưa có bộ đề trạng thái READY để duyệt.</p>}
        </>
      )}
    </section>
  );
}

function PublicationCard({
  paper,
  busy,
  onSave,
}: {
  paper: Candidate;
  busy: boolean;
  onSave: (duration: number, pass: number | null, approved: boolean) => void;
}) {
  const [duration, setDuration] = useState(
    paper.durationMin === null ? "" : String(paper.durationMin)
  );
  const [pass, setPass] = useState(paper.passScore === null ? "" : String(paper.passScore));

  return (
    <article className={s.staffCard}>
      <h2>{paper.title}</h2>
      <p>
        HSK {paper.level} · {paper.author} · {paper.questions.length} câu · {paper.maxScore} điểm ·{" "}
        {paper.published ? "Đang xuất bản" : "Chưa được duyệt"}
      </p>
      <details>
        <summary>Kiểm tra nội dung trước khi duyệt</summary>
        {paper.questions.map((q, index) => (
          <div className={s.reviewQuestion} key={q.id}>
            <strong>
              {index + 1}. {q.content}
            </strong>
            <p>
              {skillNames[q.skill]} · {typeNames[q.type] || q.type} · {q.points} điểm trọng số
            </p>
            {q.audioUrl && (
              <p>
                <audio controls src={q.audioUrl} style={{ maxWidth: "100%" }} />
              </p>
            )}
            {q.imageUrl && (
              <p>
                <Image
                  unoptimized
                  width={360}
                  height={240}
                  src={q.imageUrl}
                  alt="Ảnh câu hỏi"
                  style={{ borderRadius: 8, objectFit: "contain" }}
                />
              </p>
            )}
            <p>Đáp án: {q.correctAnswer}</p>
            <p>{q.explanation}</p>
          </div>
        ))}
      </details>
      <form
        className={s.formColumns}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(Number(duration), pass === "" ? null : Number(pass), true);
        }}
      >
        <label>
          Thời gian (phút)
          <input
            required
            type="number"
            min={1}
            max={600}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </label>
        <label>
          Điểm đạt (để trống nếu chưa đặt)
          <input
            type="number"
            min={0}
            max={paper.maxScore}
            step="0.01"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </label>
        <button className={s.primary} disabled={busy} type="submit">
          Duyệt & lưu cấu hình
        </button>
        <button
          className={s.secondary}
          disabled={busy || !duration}
          type="button"
          onClick={() => onSave(Number(duration), pass === "" ? null : Number(pass), false)}
        >
          Ẩn đề
        </button>
      </form>
    </article>
  );
}

function ManualCard({
  attempt,
  busy,
  onSave,
}: {
  attempt: Queue[number];
  busy: boolean;
  onSave: (marks: Record<string, number>) => void;
}) {
  const [marks, setMarks] = useState<Record<string, number>>({});
  return (
    <form
      className={s.staffCard}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(marks);
      }}
    >
      <h2>
        {attempt.title} · {attempt.studentName}
      </h2>
      {attempt.manualQuestions.map((q) => (
        <div className={s.reviewQuestion} key={q.id}>
          <strong>{q.content}</strong>
          {q.answer.startsWith("data:audio/") ? (
            <audio controls src={q.answer} />
          ) : q.answer.startsWith("data:image/") ? (
            <Image
              unoptimized
              width={720}
              height={480}
              className={s.questionImage}
              src={q.answer}
              alt="Bài viết tay"
            />
          ) : (
            <p className={s.pre}>{q.answer || "Không trả lời"}</p>
          )}
          <p>Bài tham khảo: {q.correctAnswer || "Chưa có"}</p>
          <p>
            Tiêu chí:{" "}
            {String(q.editorData.rubric || q.explanation || "Chấm theo nội dung đề đã xuất bản.")}
          </p>
          <label>
            Điểm câu (0–{q.points})
            <input
              required
              type="number"
              min={0}
              max={q.points}
              step="0.01"
              value={marks[q.id] ?? ""}
              onChange={(e) =>
                setMarks((values) => ({ ...values, [q.id]: Number(e.target.value) }))
              }
            />
          </label>
        </div>
      ))}
      <button className={s.primary} disabled={busy} type="submit">
        Lưu điểm chấm tay
      </button>
    </form>
  );
}
