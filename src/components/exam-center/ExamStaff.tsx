"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Headphones,
  Image as ImageIcon,
  Layers,
  Mic,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  X,
} from "lucide-react";
import type { publicationCandidates, gradingQueue } from "@/lib/exam-center-service";
import { EXAM_LEVELS, levelGroup, levelLabel } from "@/lib/exam-center-core";
import { examApi, skillNames, typeNames } from "./exam-client";
import ExamRulesLobby from "./ExamRulesLobby";
import ExamPlayer from "./ExamPlayer";
import { getSampleQuestionsForLevel, type ImportedQuestion } from "./hsk-sample-templates";
import examBlueprint from "@/config/exam_blueprint.json";
import s from "./ExamCenter.module.css";

type Candidate = Awaited<ReturnType<typeof publicationCandidates>>[number];
type Queue = Awaited<ReturnType<typeof gradingQueue>>;

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
  const [previewAttemptView, setPreviewAttemptView] = useState<any | null>(null);
  const [previewStep, setPreviewStep] = useState<"lobby" | "player">("lobby");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Load official HSK 3.0 sample template from HSK3.0 directory
  const loadSampleTemplate = (lvl: number) => {
    const bp = examBlueprint.levels.find((l) => l.level === lvl);
    const sampleQuestions = getSampleQuestionsForLevel(lvl);

    setAuthorLevel(lvl);
    setAuthorTitle(`Đề thi mẫu chuẩn ${levelLabel(lvl)} (CTI Hanban 样卷)`);
    setAuthorDesc(`Đề thi mô phỏng chuẩn cấu trúc đề thật HSK 3.0 Cấp ${lvl} (CTI / Hanban).`);
    setAuthorDuration(bp?.durationMin || (lvl === 1 ? 40 : lvl === 2 ? 60 : 83));
    setAuthorPass(bp?.targetScore || (lvl <= 2 ? 120 : 180));
    setJsonInput(JSON.stringify(sampleQuestions, null, 2));
    setMessage(`Đã nạp ${sampleQuestions.length} câu hỏi chuẩn HSK ${lvl} từ thư mục HSK3.0. Bấm "Xem trước" để kiểm tra giao diện học sinh.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error("Tệp JSON phải chứa một danh sách các câu hỏi [ ... ].");
        }
        setJsonInput(JSON.stringify(parsed, null, 2));
        setMessage(`Đã nạp thành công ${parsed.length} câu hỏi từ tệp "${file.name}". Bấm "Xem trước" để kiểm tra.`);
        setError("");
      } catch (err) {
        setError(`Lỗi khi đọc tệp JSON: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDownloadTemplate = () => {
    try {
      const sample = getSampleQuestionsForLevel(authorLevel);
      const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hsk${authorLevel}_sample_exam_template.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Không thể tải tệp mẫu.");
    }
  };

  const handlePurgeOld = async () => {
    if (
      !window.confirm(
        "BẠN CÓ CHẮC CHẮN MUỐN XÓA TOÀN BỘ CÁC ĐỀ THI MÔ PHỎNG CŨ VÀ DỌN SẠCH DỮ LIỆU KHÔNG?\n\n- Toàn bộ đề thi mô phỏng cũ sẽ bị xóa.\n- Tất cả lượt thi thử nghiệm cũ sẽ được làm sạch.\n\nSau khi xóa, bạn có thể nạp các bộ đề chuẩn HSK 3.0 mới nhất."
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await examApi<{ success: boolean; deletedSets: number; deletedLogs: number }>("purgeOldMockExams");
      setMessage(`Đã dọn sạch kho đề! Đã xóa ${res.deletedSets} bộ đề cũ và ${res.deletedLogs} bản ghi lịch sử.`);
      onChanged();
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handlePreview = () => {
    let parsed: ImportedQuestion[] = [];
    try {
      parsed = jsonInput.trim() ? JSON.parse(jsonInput) : [];
    } catch {
      setError("Cấu trúc JSON câu hỏi chưa đúng định dạng. Hãy kiểm tra lại dấu phẩy hoặc ngoặc kép.");
      return;
    }
    if (!parsed.length) {
      setError("Vui lòng nhập ít nhất 1 câu hỏi hoặc bấm nút nạp mẫu đề HSK 3.0 trước khi xem trước.");
      return;
    }

    const bp = examBlueprint.levels.find((l) => l.level === authorLevel);
    const maxScore = parsed.reduce((sum, q) => sum + (Number(q.points) || 1), 0) || bp?.maxScore || 300;
    const mockPaper = {
      id: "preview_paper_id",
      title: authorTitle,
      description: authorDesc,
      level: authorLevel,
      source: "OFFICIAL" as const,
      durationMin: authorDuration,
      maxScore,
      passScore: authorPass ? Number(authorPass) : null,
      questionsCount: parsed.length,
      skills: bp?.skills || ["LISTENING", "READING", "WRITING"],
      mode: "EXAM" as const,
      available: true,
      questions: parsed,
    };

    const mockAttempt = {
      id: "preview_attempt_id",
      paperId: "preview_paper_id",
      paper: mockPaper,
      title: authorTitle,
      level: authorLevel,
      source: "OFFICIAL",
      durationMin: authorDuration,
      maxScore,
      passScore: authorPass ? Number(authorPass) : null,
      questionsCount: parsed.length,
      skills: mockPaper.skills,
      mode: "EXAM",
      status: "IN_PROGRESS",
      startedAt: new Date().toISOString(),
      submittedAt: null,
      score: null,
      revision: 1,
      progress: 0,
      answered: 0,
      result: "UNSET",
      remainingSec: authorDuration * 60,
      expiresAt: new Date(Date.now() + authorDuration * 60000).toISOString(),
      answers: {},
      serverNow: new Date().toISOString(),
      questions: parsed.map((q, idx) => ({
        id: q.id || `q_${idx + 1}`,
        type: q.type || "multiple_choice",
        skill: q.skill || "READING",
        content: q.content,
        points: Number(q.points) || 1,
        pinyin: q.pinyin || "",
        audioUrl: q.audioUrl || "",
        imageUrl: q.imageUrl || "",
        options: Array.isArray(q.options)
          ? q.options.map((opt: any, optIdx: number) => ({
              id: typeof opt === "object" && opt ? opt.id : String.fromCharCode(65 + optIdx),
              text: typeof opt === "string" ? opt : opt?.text || opt?.content || "",
              imageUrl: opt?.imageUrl || "",
            }))
          : [],
        selectionMode: "SINGLE",
      })),
    };

    setPreviewPaper(mockPaper);
    setPreviewAttemptView(mockAttempt);
    setPreviewStep("lobby");
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
        throw new Error("Vui lòng nhập ít nhất 1 câu hỏi hoặc bấm 'Nạp mẫu đề từ thư mục HSK3.0' trước khi lưu.");
      }

      await examApi("importPaper", {
        level: authorLevel,
        title: authorTitle,
        description: authorDesc,
        durationMin: authorDuration,
        passScore: authorPass === "" ? null : Number(authorPass),
        questions: parsed,
      });

      setMessage("Đã chuyển hóa tài liệu và xuất bản đề thi thành công! Học sinh đã có thể vào phòng thi làm bài.");
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
          {/* Action Toolbar */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, background: "#f8f9f4", padding: "12px 16px", borderRadius: 12, border: "1px solid #dce4cb" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#375531" }}>
                <Sparkles size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                Nạp mẫu đề HSK 3.0:
              </span>
              {EXAM_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={s.secondary}
                  style={{ fontSize: 12, padding: "5px 10px", minHeight: 30 }}
                  onClick={() => loadSampleTemplate(lvl)}
                >
                  {levelLabel(lvl)}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                className={s.secondary}
                style={{ fontSize: 12, padding: "6px 12px", minHeight: 32, display: "inline-flex", alignItems: "center", gap: 5 }}
                onClick={handleDownloadTemplate}
                title="Tải tệp mẫu JSON về máy tính để soạn thảo"
              >
                <Download size={14} /> Tải mẫu JSON cấp {authorLevel}
              </button>

              <button
                type="button"
                className={s.secondary}
                style={{ fontSize: 12, padding: "6px 12px", minHeight: 32, display: "inline-flex", alignItems: "center", gap: 5 }}
                onClick={() => fileInputRef.current?.click()}
                title="Tải tệp .json từ máy tính lên hệ thống"
              >
                <Upload size={14} /> Tải tệp JSON từ máy
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />

              <button
                type="button"
                style={{
                  fontSize: 12,
                  padding: "6px 12px",
                  minHeight: 32,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#fee2e2",
                  color: "#991b1b",
                  border: "1px solid #f87171",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600
                }}
                onClick={handlePurgeOld}
                title="Xóa toàn bộ đề thi thử cũ và lịch sử bài làm"
              >
                <Trash2 size={14} /> Xóa tất cả đề cũ
              </button>
            </div>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span>Dữ liệu danh sách câu hỏi (JSON chuẩn HSK 3.0)</span>
                <small style={{ color: "#4f6e3c" }}>
                  💡 File âm thanh chính thức đã có sẵn tại: <code>/HSK3.0/HSK/音频/HSK（{authorLevel === 1 ? "一" : authorLevel === 2 ? "二" : authorLevel === 3 ? "三" : authorLevel === 4 ? "四" : authorLevel === 5 ? "五" : authorLevel === 6 ? "六" : "七—九"}级）样卷.mp3</code>
                </small>
              </div>
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
                    flexWrap: "wrap",
                    gap: 12,
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
                      {previewStep === "lobby"
                        ? "1. Giao diện Quy chế thi & Thiết bị (Lobby)"
                        : "2. Giao diện Màn hình làm bài thi (ExamPlayer)"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className={s.filters} style={{ margin: 0 }}>
                      <button
                        type="button"
                        aria-pressed={previewStep === "lobby"}
                        onClick={() => setPreviewStep("lobby")}
                        style={{ fontSize: 13, padding: "6px 14px" }}
                      >
                        Quy chế thi
                      </button>
                      <button
                        type="button"
                        aria-pressed={previewStep === "player"}
                        onClick={() => setPreviewStep("player")}
                        style={{ fontSize: 13, padding: "6px 14px" }}
                      >
                        Làm bài thực tế
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewPaper(null)}
                      title="Đóng chế độ xem trước"
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
                </div>

                {/* Render either ExamRulesLobby or ExamPlayer inside Preview */}
                {previewStep === "lobby" ? (
                  <ExamRulesLobby
                    paper={previewPaper}
                    blueprint={examBlueprint.levels.find((b) => b.level === authorLevel)}
                    onStart={() => setPreviewStep("player")}
                    onBack={() => setPreviewPaper(null)}
                    busy={false}
                  />
                ) : (
                  <div style={{ background: "#ffffff", borderRadius: 16, overflow: "hidden", padding: 12 }}>
                    <ExamPlayer
                      previewAttempt={previewAttemptView}
                      onBack={() => setPreviewStep("lobby")}
                    />
                  </div>
                )}
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
