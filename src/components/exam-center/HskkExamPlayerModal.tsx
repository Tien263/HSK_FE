"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Mic,
  Volume2,
  VolumeX,
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Check,
} from "lucide-react";
import ExamAudioRecorder from "@/components/common/ExamAudioRecorder";
import type { ExamSectionGroup, QuestionItem } from "./hsk-sample-templates";
import s from "./ExamCenter.module.css";

interface HskkExamPackage {
  title: string;
  level: string;
  durationMin: number;
  groups: ExamSectionGroup[];
}

interface HskkExamPlayerModalProps {
  exam: HskkExamPackage;
  parentAttemptId: string;
  parentPaperTitle: string;
  isReviewOnly?: boolean;
  onClose: () => void;
  onFinished: (answers: Record<string, string>) => void;
}

export default function HskkExamPlayerModal({
  exam,
  parentAttemptId,
  parentPaperTitle,
  isReviewOnly = false,
  onClose,
  onFinished,
}: HskkExamPlayerModalProps) {
  const STORAGE_KEY = `hskk_sub_${parentAttemptId}`;

  // Step: "mic_check" -> "exam" -> "completed"
  const [step, setStep] = useState<"mic_check" | "exam" | "completed">(isReviewOnly ? "completed" : "mic_check");

  // Microphone Check State
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [micError, setMicError] = useState<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Flatten all questions
  const allQuestions = React.useMemo(() => {
    return exam.groups.flatMap((g) => g.questions);
  }, [exam.groups]);

  // Current Question Pointer
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentQ = allQuestions[currentIdx] || allQuestions[0];

  // User recordings { [qId]: base64DataUri }
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [audioPromptPlaying, setAudioPromptPlaying] = useState(false);
  const promptAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load existing answers from LocalStorage if previously attempted
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) {
          setAnswers(parsed.answers);
          if (parsed.completed || isReviewOnly) {
            setStep("completed");
          }
        }
      }
    } catch {}
  }, [STORAGE_KEY, isReviewOnly]);

  // Save answers to local storage
  const persistAnswers = (nextAnswers: Record<string, string>, isComplete = false) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          attemptId: parentAttemptId,
          answers: nextAnswers,
          completed: isComplete,
          savedAt: new Date().toISOString(),
        })
      );
    } catch {}
  };

  // 1. Microphone setup & live volume level meter
  const startMicCheck = async () => {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e: any) {
      setMicError(
        "Trình duyệt chưa được cấp quyền Micro hoặc máy tính chưa cắm Micro. Vui lòng bấm Cho phép (Allow) ở thanh địa chỉ."
      );
    }
  };

  const stopMicCheck = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      setMicStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    if (step === "mic_check") {
      void startMicCheck();
    } else {
      stopMicCheck();
    }
    return () => stopMicCheck();
  }, [step]);

  // Auto-play audio prompt if the current question has audioUrl and not yet answered
  useEffect(() => {
    if (step === "exam" && currentQ?.audioUrl && !answers[currentQ.id]) {
      setAudioPromptPlaying(true);
      if (promptAudioRef.current) {
        promptAudioRef.current.currentTime = 0;
        promptAudioRef.current.play().catch(() => {
          setAudioPromptPlaying(false);
        });
      }
    }
  }, [currentIdx, step]);

  const handleAudioAnswerReady = (audioDataUri: string) => {
    const next = { ...answers, [currentQ.id]: audioDataUri };
    setAnswers(next);
    persistAnswers(next, false);
  };

  const handleFinishExam = () => {
    persistAnswers(answers, true);
    setStep("completed");
    onFinished(answers);
  };

  const answeredCount = Object.keys(answers).filter((k) => !!answers[k]).length;
  const currentGroup = exam.groups.find((g) => g.questions.some((q) => q.id === currentQ?.id)) || exam.groups[0];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          maxWidth: 960,
          width: "100%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mic size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#a7f3d0" }}>
                Phần thi Khẩu ngữ tương ứng · {parentPaperTitle}
              </div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                {exam.title || "Bài thi Nói HSKK"}
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {step === "exam" && (
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Đã thu âm: {answeredCount} / {allQuestions.length} câu
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: 6,
                borderRadius: 8,
              }}
              title="Đóng cửa sổ"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body content based on step */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          {/* STEP 1: MICROPHONE CHECK */}
          {step === "mic_check" && (
            <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", padding: "20px 0" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: micStream ? "#dcfce7" : "#fee2e2",
                  color: micStream ? "#15803d" : "#dc2626",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s",
                }}
              >
                <Mic size={36} />
              </div>

              <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                Kiểm tra Thiết bị Thu âm (Microphone)
              </h3>
              <p style={{ margin: "0 0 20px", fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>
                Để đảm bảo bài thi Khẩu ngữ HSKK được ghi lại chuẩn xác, hãy nói thử vào micro (ví dụ:{" "}
                <strong style={{ color: "#0f172a" }}>“Nǐ hǎo”</strong>) và quan sát thanh đo âm lượng bên dưới.
              </p>

              {/* Volume VU meter */}
              <div
                style={{
                  background: "#f1f5f9",
                  borderRadius: 12,
                  padding: 16,
                  border: "1px solid #cbd5e1",
                  marginBottom: 20,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#475569", marginBottom: 6 }}>
                  <span>Cường độ tín hiệu micro:</span>
                  <strong>{micVolume > 5 ? "Tốt · Đang bắt tiếng" : "Đang chờ phát âm..."}</strong>
                </div>
                <div style={{ width: "100%", height: 16, background: "#e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${micVolume}%`,
                      height: "100%",
                      background: micVolume > 60 ? "#ef4444" : micVolume > 20 ? "#22c55e" : "#3b82f6",
                      transition: "width 0.1s ease",
                      borderRadius: 8,
                    }}
                  />
                </div>
              </div>

              {micError ? (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    padding: 12,
                    borderRadius: 10,
                    fontSize: 13,
                    marginBottom: 20,
                    textAlign: "left",
                  }}
                >
                  <AlertTriangle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                  {micError}
                </div>
              ) : null}

              <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                <button
                  type="button"
                  onClick={startMicCheck}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={14} style={{ display: "inline", marginRight: 5 }} /> Thử kết nối lại
                </button>

                <button
                  type="button"
                  onClick={() => setStep("exam")}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 10,
                    border: "none",
                    background: "#047857",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(4, 120, 87, 0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={16} /> Micro hoạt động tốt · Bắt đầu thi ngay
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EXAM WORKSPACE */}
          {step === "exam" && currentQ && (
            <div>
              {/* Question Navigation Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: 12,
                  marginBottom: 16,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#047857", textTransform: "uppercase" }}>
                    {currentGroup.title}
                  </span>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    Câu số <strong>{currentIdx + 1}</strong> / {allQuestions.length} ({currentQ.points} điểm)
                  </div>
                </div>

                {/* Question Numbers Strip */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: "60%" }}>
                  {allQuestions.map((q, idx) => {
                    const isAnswered = !!answers[q.id];
                    const isCurrent = idx === currentIdx;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIdx(idx)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          border: isCurrent ? "2px solid #047857" : "1px solid #cbd5e1",
                          background: isCurrent ? "#047857" : isAnswered ? "#dcfce7" : "#ffffff",
                          color: isCurrent ? "#ffffff" : isAnswered ? "#166534" : "#475569",
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Instruction */}
              {currentGroup.instruction && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "#166534",
                    marginBottom: 16,
                  }}
                >
                  <strong>💡 Hướng dẫn phần này:</strong> {currentGroup.instruction}
                </div>
              )}

              {/* Audio Prompt Player (With Auto-Play for Listening Questions) */}
              {currentQ.audioUrl && (
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1.5px solid #bfdbfe",
                    borderRadius: 12,
                    padding: "14px 18px",
                    marginBottom: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: audioPromptPlaying ? "#2563eb" : "#dbeafe",
                        color: audioPromptPlaying ? "#ffffff" : "#1d4ed8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Volume2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a8a" }}>
                        {audioPromptPlaying ? "🔊 Đang phát đề bài qua loa/tai nghe..." : "🎧 Nghe đoạn ghi âm đề bài:"}
                      </div>
                      <div style={{ fontSize: 12, color: "#3b82f6" }}>
                        Nghe kỹ câu nói, sau đó bấm nút thu âm bên dưới để trả lời.
                      </div>
                    </div>
                  </div>

                  <audio
                    ref={promptAudioRef}
                    src={currentQ.audioUrl}
                    controls
                    onPlay={() => setAudioPromptPlaying(true)}
                    onEnded={() => setAudioPromptPlaying(false)}
                    onPause={() => setAudioPromptPlaying(false)}
                    style={{ height: 36 }}
                  />
                </div>
              )}

              {/* Image Prompt (for Picture Speaking questions) */}
              {currentQ.imageUrl && (
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  <Image
                    unoptimized
                    width={480}
                    height={300}
                    src={currentQ.imageUrl}
                    alt="Bức tranh đề bài"
                    style={{
                      borderRadius: 12,
                      objectFit: "contain",
                      maxHeight: 280,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                  />
                </div>
              )}

              {/* Question Text / Prompt */}
              {currentQ.content && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                    {currentQ.content}
                  </div>
                  {currentQ.pinyin && (
                    <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                      {currentQ.pinyin}
                    </div>
                  )}
                </div>
              )}

              {/* Audio Recorder Input */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 14,
                  padding: 18,
                  border: "1px solid #e2e8f0",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Mic size={16} color="#047857" /> Bản ghi âm câu trả lời của bạn:
                </div>

                <ExamAudioRecorder
                  key={currentQ.id}
                  initialAudioUrl={answers[currentQ.id]}
                  onAudioReady={handleAudioAnswerReady}
                />
              </div>

              {/* Next / Previous Controls */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: currentIdx === 0 ? "#94a3b8" : "#334155",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ArrowLeft size={14} /> Câu trước
                </button>

                {currentIdx < allQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => Math.min(allQuestions.length - 1, prev + 1))}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 8,
                      border: "none",
                      background: "#047857",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    Câu tiếp theo <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishExam}
                    style={{
                      padding: "8px 24px",
                      borderRadius: 8,
                      border: "none",
                      background: "#dc2626",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)",
                    }}
                  >
                    <CheckCircle2 size={16} /> Nộp bài thi Khẩu ngữ HSKK
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: COMPLETED / REVIEW MODE */}
          {step === "completed" && (
            <div>
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 20px",
                  background: "#f0fdf4",
                  border: "1.5px solid #86efac",
                  borderRadius: 14,
                  marginBottom: 20,
                }}
              >
                <CheckCircle2 size={36} color="#16a34a" style={{ margin: "0 auto 8px" }} />
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#14532d" }}>
                  Đã hoàn thành và nộp bài thi Khẩu ngữ HSKK!
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: "#166534" }}>
                  Bạn đã ghi âm thành công {answeredCount} / {allQuestions.length} câu. Toàn bộ bản thu âm đã được bảo lưu an toàn.
                </p>
              </div>

              <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                Xem lại danh sách bài làm Khẩu ngữ:
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {allQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: 14,
                      background: "#ffffff",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <strong>
                        Câu {idx + 1}: {q.content || "Bài thi nghe/nói"}
                      </strong>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{q.points} điểm</span>
                    </div>

                    {q.audioUrl && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 600 }}>Audio đề: </span>
                        <audio controls src={q.audioUrl} style={{ height: 28, verticalAlign: "middle" }} />
                      </div>
                    )}

                    {answers[q.id] ? (
                      <div style={{ background: "#f8fafc", padding: 8, borderRadius: 8 }}>
                        <span style={{ fontSize: 11, color: "#047857", fontWeight: 700 }}>Bản ghi âm của bạn: </span>
                        <audio controls src={answers[q.id]} style={{ height: 28, verticalAlign: "middle" }} />
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                        Chưa ghi âm câu này.
                      </span>
                    )}

                    {q.explanation && (
                      <div style={{ fontSize: 12, color: "#475569", marginTop: 6, whiteSpace: "pre-wrap" }}>
                        💡 <strong>Gợi ý/Giải thích:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc",
          }}
        >
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Trắc nghiệm Khẩu ngữ HSKK chuẩn Hanban · Hanyu Exam Center
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
