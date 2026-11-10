"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  Flag,
  Headphones,
  HelpCircle,
  Info,
  Layers,
  Leaf,
  Lock,
  Mic,
  Pause,
  PenTool,
  Play,
  RotateCcw,
  Save,
  Volume2,
  VolumeX,
  Wifi,
  X,
  ShieldAlert,
} from "lucide-react";
import ExamAntiCheatProctor from "@/components/common/ExamAntiCheatProctor";
import ComponentErrorBoundary from "@/components/common/ComponentErrorBoundary";
import type { attemptForOwner } from "@/lib/exam-center-core";
import { hasAnswer, levelGroup, levelLabel, type ExamSkill } from "@/lib/exam-center-core";
import { attemptApi, examApi, resultNames, skillNames, timeText } from "./exam-client";
import ExamQuestionInput from "./ExamQuestionInput";
import examBlueprint from "@/config/exam_blueprint.json";
import s from "./ExamPlayer.module.css";

type View = ReturnType<typeof attemptForOwner>;

export default function ExamPlayer({
  id = "",
  userId = "preview_user",
  onBack,
  onChanged = () => {},
  registerLeave = () => {},
  previewAttempt,
  onRetake,
}: {
  id?: string;
  userId?: string;
  onBack: () => void;
  onChanged?: () => void;
  registerLeave?: (fn: (() => Promise<void>) | null) => void;
  previewAttempt?: View;
  onRetake?: (paperId: string) => void;
}) {
  const [attempt, setAttempt] = useState<View | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [offset, setOffset] = useState(0);
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Lịch sử vi phạm ghi nhận bởi Giám thị AI trong phòng thi
  const [violations, setViolations] = useState<
    Array<{
      id: string;
      violationType: string;
      details: string;
      count: number;
      timestamp: string;
      snapshot: string | null;
    }>
  >([]);
  const [showViolationsModal, setShowViolationsModal] = useState(false);

  // Quyền Bật/Tắt Giám thị AI trong phòng thi (Học sinh & Admin có toàn quyền chủ động)
  const [isAiProctorActive, setIsAiProctorActive] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hanyu_disable_ai_proctor") !== "true";
    }
    return true;
  });

  // Audio simulation state for Listening
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(18);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = useRef<View | null>(null);
  const latest = useRef<Record<string, string>>({});
  const queue = useRef<Promise<void>>(Promise.resolve());
  const timeSubmitted = useRef(false);

  const storageKey = `hanyu-exam-draft:${userId}:${id}`;

  const receive = useCallback(
    (data: View, initial = false) => {
      current.current = data;
      setAttempt(data);
      setOffset(Date.parse(data.serverNow) - Date.now());
      if (initial || data.status !== "IN_PROGRESS") {
        latest.current = data.answers;
        setAnswers(data.answers);
      }
      if (data.status !== "IN_PROGRESS") {
        try {
          localStorage.removeItem(storageKey);
        } catch {}
        setDraft(null);
      }
    },
    [storageKey]
  );

  const load = useCallback(() => {
    if (previewAttempt) {
      receive(previewAttempt, true);
      return Promise.resolve();
    }
    return attemptApi<View>(id)
      .then((data) => {
        receive(data, true);
        setError("");
        setConflict(false);
        timeSubmitted.current = false;
        try {
          const cached = JSON.parse(localStorage.getItem(storageKey) || "null");
          if (
            data.status === "IN_PROGRESS" &&
            cached?.answers &&
            JSON.stringify(cached.answers) !== JSON.stringify(data.answers)
          ) {
            setDraft(cached.answers);
          }
        } catch {}
      })
      .catch((err) => setError((err as Error).message));
  }, [id, previewAttempt, receive, storageKey]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const persist = useCallback(
    (submit = false) => {
      if (previewAttempt) {
        setSaveStatus("saving");
        setTimeout(() => setSaveStatus("saved"), 250);
        if (submit) {
          setAttempt((prev) =>
            prev
              ? {
                  ...prev,
                  status: "GRADED",
                  score: prev.maxScore,
                  submittedAt: new Date().toISOString(),
                }
              : null
          );
        }
        return Promise.resolve();
      }
      const task = queue.current
        .catch(() => {})
        .then(async () => {
          const state = current.current;
          if (!state || state.status !== "IN_PROGRESS") return;
          const sent = { ...latest.current };
          setSaveStatus("saving");
          try {
            const data = await examApi<View>(submit ? "submit" : "save", {
              id,
              revision: state.revision,
              answers: sent,
            });
            receive(data);
            setSaveStatus("saved");
            if (JSON.stringify(latest.current) === JSON.stringify(sent)) {
              try {
                localStorage.removeItem(storageKey);
              } catch {}
            }
            if (data.status !== "IN_PROGRESS") onChanged();
            setError("");
          } catch (err) {
            setSaveStatus("error");
            if ((err as Error & { status?: number }).status === 409) setConflict(true);
            setError((err as Error).message);
            throw err;
          }
        });
      queue.current = task;
      return task;
    },
    [id, onChanged, previewAttempt, receive, storageKey]
  );

  useEffect(() => {
    registerLeave?.(() => persist());
    return () => registerLeave?.(null);
  }, [persist, registerLeave]);

  // Debounced auto-save
  const attemptStatus = attempt?.status;
  useEffect(() => {
    if (
      attemptStatus !== "IN_PROGRESS" ||
      conflict ||
      JSON.stringify(answers) === JSON.stringify(current.current?.answers)
    )
      return;
    const timer = setTimeout(() => {
      void persist().catch(() => {});
    }, 700);
    return () => clearTimeout(timer);
  }, [answers, attemptStatus, conflict, persist]);

  // Countdown timer calculations
  const remainingSec = attempt?.expiresAt
    ? Math.max(0, Math.ceil((Date.parse(attempt.expiresAt) - now - offset) / 1000))
    : null;

  useEffect(() => {
    if (attempt?.status === "IN_PROGRESS" && remainingSec === 0 && !timeSubmitted.current) {
      timeSubmitted.current = true;
      void persist(true).catch(() => {});
    }
  }, [attempt?.status, remainingSec, persist]);

  // Record an answer
  const handleAnswer = (questionId: string, value: string) => {
    const next = { ...latest.current, [questionId]: value };
    latest.current = next;
    setAnswers(next);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ answers: next, revision: current.current?.revision })
      );
    } catch {
      setSaveStatus("error");
    }
  };

  // Bookmark toggle
  const toggleBookmark = (questionId: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  // Final submit trigger
  const confirmSubmit = async () => {
    setBusy(true);
    setShowSubmitModal(false);
    try {
      await persist(true);
    } catch {} finally {
      setBusy(false);
    }
  };

  // Memoized question lists and skill groupings - Called unconditionally at top level (Rules of Hooks)
  const questions = useMemo(() => {
    return Array.isArray(attempt?.questions) ? attempt.questions : [];
  }, [attempt?.questions]);

  const skillGroups = useMemo(() => {
    const map = new Map<
      string,
      { skill: ExamSkill; startIndex: number; endIndex: number; questions: typeof questions }
    >();
    questions.forEach((q, idx) => {
      if (!map.has(q.skill)) {
        map.set(q.skill, { skill: q.skill, startIndex: idx, endIndex: idx, questions: [q] });
      } else {
        const entry = map.get(q.skill)!;
        entry.endIndex = idx;
        entry.questions.push(q);
      }
    });
    return Array.from(map.values());
  }, [questions]);

  // Derived state
  const finished = attempt ? attempt.status !== "IN_PROGRESS" : false;
  const totalQuestions = questions.length;
  const currentQ = questions[index] || questions[0] || null;
  const answeredCount = questions.filter((q) => hasAnswer(answers[q.id])).length;
  const unansweredCount = totalQuestions - answeredCount;
  const completionPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const isUrgentTime = remainingSec !== null && remainingSec <= 300 && remainingSec > 0;

  // Current skill info
  const currentSkillGroup = skillGroups.find((g) => g.skill === currentQ?.skill);
  const currentSkillIndex = currentSkillGroup ? currentSkillGroup.questions.findIndex((q) => q.id === currentQ?.id) + 1 : index + 1;
  const currentSkillTotal = currentSkillGroup ? currentSkillGroup.questions.length : totalQuestions;

  // Toggle Accordion
  const toggleSection = (skill: string) => {
    setCollapsedSections((prev) => ({ ...prev, [skill]: !prev[skill] }));
  };

  // Audio Playback Handler
  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  // 1. Loading state
  if (!attempt) {
    return (
      <div className={s.playerWrapper} style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 18 }}>
          {error ? (
            <>
              <p style={{ color: "#a23c21", marginBottom: 10, fontSize: 16, fontWeight: 600 }}>
                {error.includes("Không tìm thấy") ? "Không thể mở phiên làm bài này" : error}
              </p>
              <p style={{ color: "#5a6855", marginBottom: 20, fontSize: 13, maxWidth: 440, margin: "0 auto 20px" }}>
                Phiên làm bài này có thể thuộc tài khoản khác hoặc đã kết thúc. Bạn hoàn toàn có thể thi lại không giới hạn bằng cách quay lại danh sách đề thi và bấm Bắt đầu thi.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={onBack}
                  style={{ padding: "10px 22px", borderRadius: 10, background: "#27492c", color: "#fff", cursor: "pointer", fontWeight: 600, border: "none" }}
                >
                  ← Về danh sách đề thi để thi lại
                </button>
                <button
                  type="button"
                  onClick={() => void load()}
                  style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #cad5be", background: "#fff", color: "#365330", cursor: "pointer", fontWeight: 600 }}
                >
                  Thử tải lại
                </button>
              </div>
            </>
          ) : (
            <p>Đang chuẩn bị phòng thi bảo mật...</p>
          )}
        </div>
      </div>
    );
  }

  // 2. Empty questions state
  if (totalQuestions === 0) {
    return (
      <div className={s.playerWrapper} style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 18, border: "1px solid #d4decb" }}>
          <p style={{ color: "#a23c21", marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
            Đề thi hiện chưa có câu hỏi nào sẵn sàng để làm bài.
          </p>
          <button
            type="button"
            onClick={onBack}
            style={{ padding: "10px 20px", borderRadius: 10, background: "#27492c", color: "#fff", fontWeight: 600, cursor: "pointer" }}
          >
            ← Quay lại danh sách đề thi
          </button>
        </div>
      </div>
    );
  }

  // 3. Question not ready
  if (!currentQ) {
    return (
      <div className={s.playerWrapper} style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 18 }}>
          <p>Đang chuẩn bị câu hỏi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={s.playerWrapper} data-exam-player>
      {/* =========================================================================
          01. STICKY EXAM HEADER (LOGO, TITLE, TIMER, SAVE STATUS)
         ========================================================================= */}
      <header className={s.stickyHeader}>
        {/* Brand Logo & Exam Center Info */}
        <div className={s.brandGroup}>
          <div className={s.brandLogo}>
            <Leaf size={30} />
          </div>
          <div className={s.brandTitles}>
            <strong>HSK Exam Center</strong>
            <small>汉语水平考试 · 模拟考试</small>
          </div>
        </div>

        {/* Center: Exam Level & Title */}
        <div className={s.examBadgeTitle}>
          <span>
            {levelLabel(attempt.level)} · {attempt.title}
          </span>
          <span title="Thông tin kỳ thi chuẩn HSK 3.0" className={s.infoIcon}>
            <Info size={16} />
          </span>
        </div>

        {/* Right Status Group: Save Badge, Proctor Badge, Wifi, Timer */}
        <div className={s.headerRight}>
          {/* AI Proctor Status & Violation Log Button */}
          {/* AI Proctor Status / Log Pill */}
          {/* AI Proctor Status Toggle & Violation Log */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={() => {
                const nextVal = !isAiProctorActive;
                setIsAiProctorActive(nextVal);
                if (typeof window !== "undefined") {
                  localStorage.setItem("hanyu_disable_ai_proctor", nextVal ? "false" : "true");
                }
              }}
              className={s.saveBadge}
              style={{
                cursor: "pointer",
                border: "1px solid",
                borderColor: isAiProctorActive ? "#a8d5ba" : "#d4decb",
                backgroundColor: isAiProctorActive ? "#f0f8f3" : "#f4f7f1",
                color: isAiProctorActive ? "#1c402e" : "#6b7d67",
                fontWeight: 600,
              }}
              title="Nhấp để Bật hoặc Tắt Giám thị AI phòng thi bất kỳ lúc nào"
            >
              <ShieldAlert size={14} color={isAiProctorActive ? "#2e7d32" : "#8a9c87"} />
              <span>{isAiProctorActive ? "Giám thị AI: BẬT" : "Giám thị AI: TẮT"}</span>
            </button>

            {isAiProctorActive && violations.length > 0 && (
              <button
                type="button"
                onClick={() => setShowViolationsModal(true)}
                className={s.saveBadge}
                style={{
                  cursor: "pointer",
                  border: "1px solid #e57373",
                  backgroundColor: "#fdeded",
                  color: "#b71c1c",
                  fontWeight: 700,
                }}
                title="Xem chi tiết các lỗi vi phạm đã ghi nhận"
              >
                <span>{violations.length} lỗi</span>
              </button>
            )}
          </div>

          {/* Save Status Badge */}
          <div className={`${s.saveBadge} ${s[saveStatus]}`}>
            <Save size={14} />
            <span>
              {saveStatus === "saved"
                ? "✓ Đã lưu"
                : saveStatus === "saving"
                ? "Đang lưu..."
                : "Chưa lưu"}
            </span>
          </div>

          {/* Wifi Indicator */}
          <div className={s.wifiIndicator} title="Kết nối mạng ổn định">
            <Wifi size={18} />
          </div>

          {/* Timer Card (Server-Authoritative) */}
          <div className={`${s.timerCard} ${isUrgentTime ? s.warning : ""}`}>
            <span className={s.timerLabel}>Thời gian còn lại</span>
            <div className={s.timerDisplay}>
              <Clock size={18} />
              <span>{finished ? "Đã nộp bài" : timeText(remainingSec)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          02. SKILL NAVIGATION BAR (听力, 阅读, 书写)
         ========================================================================= */}
      <nav className={s.skillNavBar} aria-label="Thanh kỹ năng thi">
        {skillGroups.map((group, idx) => {
          const isActive = group.skill === currentQ.skill;
          const isSkillFinished = group.questions.every((q) => hasAnswer(answers[q.id]));
          const isLocked = !isActive && group.skill === "LISTENING" && currentQ.skill !== "LISTENING";

          return (
            <div key={group.skill} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                className={`${s.skillPill} ${
                  isActive ? s.active : isSkillFinished ? s.completed : isLocked ? s.locked : ""
                }`}
                onClick={() => {
                  if (!isLocked) setIndex(group.startIndex);
                }}
              >
                {group.skill === "LISTENING" ? (
                  <Headphones size={16} />
                ) : group.skill === "READING" ? (
                  <BookOpen size={16} />
                ) : group.skill === "WRITING" ? (
                  <PenTool size={16} />
                ) : (
                  <Mic size={16} />
                )}
                <span>
                  {skillNames[group.skill] || group.skill} ({group.questions.length} câu)
                </span>
                {isLocked ? (
                  <Lock size={13} />
                ) : isSkillFinished && !isActive ? (
                  <Check size={14} />
                ) : null}
              </button>

              {idx < skillGroups.length - 1 && <span className={s.skillArrow}>&gt;</span>}
            </div>
          );
        })}
      </nav>

      {/* Error & Offline Banners */}
      {error && (
        <div style={{ maxWidth: 1360, margin: "0 auto 12px", width: "calc(100% - 32px)", background: "#fcedea", border: "1px solid #eabcb3", borderRadius: 12, padding: "10px 16px", color: "#9c3b20", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{error}</span>
          {conflict && (
            <button
              type="button"
              onClick={() => void load()}
              style={{ padding: "4px 10px", borderRadius: 6, background: "#27492c", color: "#fff", border: "none" }}
            >
              Tải lại bài từ máy chủ
            </button>
          )}
        </div>
      )}

      {/* Finished Result Banner */}
      {finished && (
        <div style={{ maxWidth: 1360, margin: "0 auto 16px", width: "calc(100% - 32px)", background: "#eef6ea", border: "1.5px solid #a6d093", borderRadius: 16, padding: "16px 22px", display: "flex", alignItems: "center", gap: 14 }}>
          <CheckCircle2 size={28} color="#2b5e23" />
          <div>
            <strong style={{ fontSize: 18, color: "#1f411b" }}>
              {attempt.status === "NEEDS_GRADING"
                ? "Bài thi đã nộp thành công · Có câu chờ chấm tự luận"
                : attempt.classificationLabel || resultNames[attempt.result]}
            </strong>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#4f6e4a" }}>
              {attempt.score === null
                ? "Đang chờ giáo viên chấm phần viết/nói."
                : `Điểm số: ${attempt.score} / ${attempt.maxScore} điểm.`}
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN CONTAINER: 03. WORKSPACE (70%) & 05. QUESTION PALETTE (30%)
         ========================================================================= */}
      <div className={s.mainContainer}>
        {/* 03. EXAM WORKSPACE CARD (LEFT) */}
        <main className={s.workspaceCard}>
          {/* Card Top Meta */}
          <div className={s.cardTopMeta}>
            <div className={s.brushBadge}>
              {skillNames[currentQ.skill]} · Phần {Math.ceil(currentSkillIndex / 10)} (Câu{" "}
              {(currentSkillGroup?.startIndex ?? 0) + 1} –{" "}
              {(currentSkillGroup?.endIndex ?? 0) + 1})
            </div>
            <div className={s.questionStepPill}>
              Câu {currentSkillIndex} / {currentSkillTotal}
            </div>
          </div>

          {/* Question Prompt */}
          <div className={s.promptRow}>
            <Volume2 size={20} className={s.speakerIcon} />
            <h2 className={s.promptText}>{currentQ.content}</h2>
          </div>

          {/* Pinyin Hint */}
          {currentQ.pinyin && currentQ.skill !== "LISTENING" && (
            <p className={s.pinyinHint}>[{currentQ.pinyin}]</p>
          )}

          {/* Audio Player Bar (for Listening questions) */}
          {currentQ.skill === "LISTENING" && (
            <div className={s.audioBar}>
              <audio
                ref={audioRef}
                src={
                  currentQ.audioUrl ||
                  `/audio/hsk${attempt.level <= 6 ? attempt.level : 7}_exam.mp3`
                }
                onPlay={() => setIsPlayingAudio(true)}
                onPause={() => setIsPlayingAudio(false)}
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    const cur = audioRef.current.currentTime;
                    const dur = audioRef.current.duration || 18;
                    setAudioProgress((cur / dur) * 100);
                    setAudioDuration(dur);
                  }
                }}
                onEnded={() => setIsPlayingAudio(false)}
              />

              <button
                type="button"
                className={s.audioPlayBtn}
                onClick={toggleAudio}
                title={isPlayingAudio ? "Tạm dừng Audio" : "Phát Audio"}
              >
                {isPlayingAudio ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </button>

              <span className={s.audioTimeText}>
                {audioRef.current ? timeText(Math.round(audioRef.current.currentTime)) : "00:00"} /{" "}
                {timeText(Math.round(audioDuration))}
              </span>

              <div
                className={s.audioTrackWrap}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  if (!audioRef.current || !audioDuration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  audioRef.current.currentTime = ratio * audioDuration;
                  setAudioProgress(ratio * 100);
                }}
                title="Tua đến vị trí này"
              >
                <div className={s.audioProgressFill} style={{ width: `${audioProgress}%` }} />
              </div>

              <div className={s.volumeGroup}>
                <Volume2 size={16} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  className={s.volumeSlider}
                  value={volume}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setVolume(v);
                    if (audioRef.current) audioRef.current.volume = v;
                  }}
                  title="Âm lượng"
                />
              </div>
            </div>
          )}

          {/* Interactive Question Input (Picture Options, Ordering, Writing, etc.) */}
          <ComponentErrorBoundary name="Khu vực trả lời câu hỏi">
            <ExamQuestionInput
              key={currentQ.id}
              question={currentQ}
              value={answers[currentQ.id] || ""}
              disabled={finished || busy || conflict}
              onChange={(val) => handleAnswer(currentQ.id, val)}
            />
          </ComponentErrorBoundary>

          {/* Post-exam Answer Explanation */}
          {finished && (
            <div style={{ marginTop: 20, padding: 18, background: "#f4f8ed", borderRadius: 14, border: "1px solid #d4e3cb" }}>
              <strong style={{ fontSize: 15, color: "#2b4c27" }}>
                {currentQ.result?.earned === null
                  ? "Đang chờ chấm tay"
                  : `Đạt ${currentQ.result?.earned ?? 0} / ${currentQ.points} điểm`}
              </strong>
              <p style={{ margin: "8px 0 4px", fontSize: 13, color: "#3e573a" }}>
                <strong>Đáp án chuẩn:</strong> {currentQ.correctAnswer || "Chấm theo biểu điểm"}
              </p>
              {currentQ.explanation && (
                <p style={{ margin: 0, fontSize: 13, color: "#546d50" }}>
                  <strong>Giải thích:</strong> {currentQ.explanation}
                </p>
              )}
            </div>
          )}

          {/* 04. BOTTOM CONTROLS BAR: ĐÁNH DẤU, CÂU TRƯỚC, CÂU TIẾP */}
          <div className={s.controlsBar}>
            <button
              type="button"
              className={`${s.bookmarkBtn} ${bookmarked.has(currentQ.id) ? s.bookmarked : ""}`}
              onClick={() => toggleBookmark(currentQ.id)}
            >
              <Bookmark
                size={16}
                fill={bookmarked.has(currentQ.id) ? "currentColor" : "none"}
              />
              <span>{bookmarked.has(currentQ.id) ? "Đã đánh dấu" : "Đánh dấu"}</span>
            </button>

            <div className={s.stepBtnsGroup}>
              <button
                type="button"
                className={s.prevBtn}
                disabled={index === 0}
                onClick={() => setIndex(index - 1)}
              >
                &lt; Câu trước
              </button>

              <button
                type="button"
                className={s.nextBtn}
                disabled={index === totalQuestions - 1}
                onClick={() => setIndex(index + 1)}
              >
                Câu tiếp &gt;
              </button>
            </div>
          </div>
        </main>

        {/* 05. QUESTION PALETTE & PROGRESS (RIGHT COLUMN) */}
        <aside className={s.paletteCard}>
          <div className={s.paletteHeader}>
            <h3 className={s.paletteTitle}>Bảng câu hỏi</h3>
          </div>

          {/* Legend Row (Đang làm, Đã làm, Chưa làm, Đánh dấu) */}
          <div className={s.legendRow}>
            <div className={s.legendItem}>
              <div className={`${s.legendBox} ${s.active}`} />
              <span>Đang làm</span>
            </div>
            <div className={s.legendItem}>
              <div className={`${s.legendBox} ${s.answered}`} />
              <span>Đã làm</span>
            </div>
            <div className={s.legendItem}>
              <div className={`${s.legendBox} ${s.unanswered}`} />
              <span>Chưa làm</span>
            </div>
            <div className={s.legendItem}>
              <div className={`${s.legendBox} ${s.bookmarked}`} />
              <span>🚩 Đánh dấu</span>
            </div>
          </div>

          {/* Collapsible Accordion Sections by Skill */}
          <div className={s.accordionList}>
            {skillGroups.map((group) => {
              const isCollapsed = !!collapsedSections[group.skill];
              return (
                <div key={group.skill} className={s.accordionGroup}>
                  <button
                    type="button"
                    className={s.accordionBtn}
                    onClick={() => toggleSection(group.skill)}
                  >
                    <span className={s.accordionGroupTitle}>
                      {group.skill === "LISTENING" ? (
                        <Headphones size={15} />
                      ) : group.skill === "READING" ? (
                        <BookOpen size={15} />
                      ) : (
                        <PenTool size={15} />
                      )}
                      {skillNames[group.skill]} ({group.startIndex + 1} – {group.endIndex + 1})
                    </span>
                    <span>{isCollapsed ? "▼" : "▲"}</span>
                  </button>

                  {!isCollapsed && (
                    <div className={s.questionNumbersGrid}>
                      {group.questions.map((q, localIdx) => {
                        const globalIdx = group.startIndex + localIdx;
                        const isCurrent = globalIdx === index;
                        const isAnswered = hasAnswer(answers[q.id]);
                        const isMarked = bookmarked.has(q.id);

                        return (
                          <button
                            key={q.id}
                            type="button"
                            className={`${s.qNumCell} ${
                              isCurrent
                                ? s.current
                                : isAnswered
                                ? s.answered
                                : ""
                            } ${isMarked ? s.bookmarked : ""}`}
                            onClick={() => setIndex(globalIdx)}
                            title={`Câu ${globalIdx + 1}${
                              isAnswered ? " (Đã làm)" : " (Chưa làm)"
                            }`}
                          >
                            {isAnswered && !isCurrent ? "✓" : globalIdx + 1}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 06. EXAM PROGRESS BOTTOM WIDGET */}
          <div className={s.progressWidget}>
            <div
              className={s.ringWrap}
              style={{
                background: `conic-gradient(#3a6b32 ${completionPercent}%, #d9e4d1 0)`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {completionPercent}%
              </div>
            </div>

            <div className={s.progressNumbers}>
              <strong>
                Đã làm: {answeredCount} / {totalQuestions} câu
              </strong>
              <span>
                Còn lại: {unansweredCount} câu · Đánh dấu: {bookmarked.size} câu
              </span>
            </div>
          </div>

          {/* Submit Exam Button */}
          {!finished && (
            <button
              type="button"
              className={s.submitExamBtn}
              disabled={busy}
              onClick={() => setShowSubmitModal(true)}
            >
              <Flag size={16} />
              Nộp bài thi
            </button>
          )}

          {finished && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {onRetake && attempt?.paperId && (
                <button
                  type="button"
                  className={s.submitExamBtn}
                  onClick={() => onRetake(attempt.paperId)}
                  style={{ background: "#27492c", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <RotateCcw size={16} />
                  Làm lại bài thi này (Thi lại)
                </button>
              )}
              <button
                type="button"
                className={s.submitExamBtn}
                onClick={onBack}
                style={{ background: "#4a683e", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <ArrowLeft size={16} />
                Quay lại danh sách đề
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* CONFIRM SUBMISSION MODAL */}
      {showSubmitModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(18, 33, 20, 0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: "100%",
              background: "#ffffff",
              borderRadius: 20,
              padding: 26,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#eaf3e5",
                  color: "#355a2c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Flag size={22} />
              </div>
              <h3 style={{ margin: 0, fontSize: 20, color: "#223b24" }}>
                Xác nhận nộp bài thi
              </h3>
            </div>

            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#4f634b", margin: 0 }}>
              Bạn đã hoàn thành <strong>{answeredCount}</strong> / {totalQuestions} câu hỏi.
              {unansweredCount > 0 && (
                <span style={{ color: "#a64124", display: "block", marginTop: 6 }}>
                  ⚠️ Vẫn còn <strong>{unansweredCount}</strong> câu chưa có câu trả lời.
                </span>
              )}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "1px solid #cad5be",
                  background: "#fff",
                  color: "#465d3f",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Làm tiếp
              </button>

              <button
                type="button"
                onClick={() => void confirmSubmit()}
                disabled={busy}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: "#27492c",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {busy ? "Đang nộp..." : "Xác nhận nộp bài"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AI Anti-Cheat Proctor Component (Toàn quyền bật tắt bởi Thí sinh & Quản trị viên) */}
      {!finished && attempt && (
        <ComponentErrorBoundary
          name="Giám thị AI"
          fallback={
            <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 40, padding: "8px 14px", background: "#204434", color: "#fff", borderRadius: 12, fontSize: 11, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
              <ShieldAlert size={14} color="#f59e0b" />
              <span>Giám thị AI đang chạy ở chế độ bảo vệ cơ bản</span>
            </div>
          }
        >
          <ExamAntiCheatProctor
            examTitle={`${attempt.title} (HSK ${attempt.level})`}
            isProctorEnabled={isAiProctorActive}
            onToggleProctor={(enabled) => setIsAiProctorActive(enabled)}
            onForceSubmit={(reason) => {
              setError(reason);
              void persist(true);
            }}
            onViolationRecorded={(v) => {
              setViolations((prev) => [v, ...prev]);
            }}
            onOpenViolationLog={() => setShowViolationsModal(true)}
          />
        </ComponentErrorBoundary>
      )}

      {/* MODAL BIÊN BẢN & MỤC LỖI VI PHẠM GIÁM THỊ AI */}
      {showViolationsModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(10, 24, 16, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              width: "100%",
              maxWidth: 580,
              background: "#FFFCF6",
              border: "1.5px solid #BC9B6B",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxHeight: "88vh",
            }}
          >
            {/* Header Modal */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #E5DEC9",
                paddingBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: violations.length > 0 ? "rgba(157, 73, 62, 0.12)" : "rgba(32, 68, 52, 0.1)",
                    border: violations.length > 0 ? "1px solid rgba(157, 73, 62, 0.3)" : "1px solid rgba(32, 68, 52, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: violations.length > 0 ? "#9D493E" : "#204434",
                  }}
                >
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#204434" }}>
                    Biên bản & Mục lỗi vi phạm Giám thị AI
                  </h3>
                  <p style={{ margin: 0, fontSize: 11, color: "#8F6D3B" }}>
                    Ghi nhận khách quan các sự kiện và cảnh báo trong kỳ thi HSK
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowViolationsModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid #E5DEC9",
                  background: "#fff",
                  color: "#666",
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: "#F8F5ED",
                  border: "1px solid rgba(188, 155, 107, 0.3)",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 10, textTransform: "uppercase", color: "#637861", display: "block" }}>
                  Tổng số lần vi phạm
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    fontFamily: "monospace",
                    color: violations.length > 0 ? "#9D493E" : "#1f6e43",
                  }}
                >
                  {violations.length} / 3 lần tối đa
                </span>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: "#F8F5ED",
                  border: "1px solid rgba(188, 155, 107, 0.3)",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 10, textTransform: "uppercase", color: "#637861", display: "block" }}>
                  Trạng thái phiên thi
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      violations.length >= 3
                        ? "#9D493E"
                        : violations.length > 0
                        ? "#b45309"
                        : "#1f6e43",
                  }}
                >
                  {violations.length >= 3
                    ? "Đã nộp bài cưỡng chế"
                    : violations.length > 0
                    ? "Đang cảnh cáo"
                    : "Hợp lệ & Trung thực"}
                </span>
              </div>
            </div>

            {/* Danh sách các lần vi phạm */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {violations.length === 0 ? (
                <div style={{ padding: "36px 16px", textAlign: "center", color: "#778", fontSize: 13 }}>
                  <CheckCircle2 size={36} color="#2e7d32" style={{ margin: "0 auto 8px", opacity: 0.8 }} />
                  <p style={{ margin: 0, fontWeight: 600, color: "#2e7d32" }}>
                    Phòng thi hoàn toàn trong sạch!
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#667" }}>
                    Hệ thống Giám thị AI không ghi nhận bất kỳ hành vi bất thường nào. Hãy tiếp tục tập trung làm bài!
                  </p>
                </div>
              ) : (
                violations.map((v, i) => (
                  <div
                    key={v.id || i}
                    style={{
                      background: "#fff",
                      border: "1px solid #E5DEC9",
                      borderRadius: 14,
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          background: "#fee2e2",
                          color: "#991b1b",
                          fontWeight: 700,
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        Vi phạm #{v.count || i + 1} · {v.violationType}
                      </span>
                      <span style={{ fontSize: 10, color: "#888", fontFamily: "monospace" }}>
                        {v.timestamp}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: 12, color: "#223", fontWeight: 500, lineHeight: 1.5 }}>
                      {v.details}
                    </p>

                    {v.snapshot && (
                      <div
                        style={{
                          marginTop: 4,
                          borderRadius: 10,
                          overflow: "hidden",
                          border: "1px solid #E5DEC9",
                          background: "#0f172a",
                          maxHeight: 140,
                        }}
                      >
                        <img
                          src={v.snapshot}
                          alt="Bằng chứng giám thị AI"
                          style={{ width: "100%", height: 140, objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Modal */}
            <div style={{ borderTop: "1px solid #E5DEC9", paddingTop: 12 }}>
              <button
                type="button"
                onClick={() => setShowViolationsModal(false)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 12,
                  border: "none",
                  background: "#204434",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Đóng mục lỗi vi phạm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
