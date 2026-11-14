"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Volume2, CheckCircle2, AlertCircle } from "lucide-react";

interface ExamAudioRecorderProps {
  maxDurationSec?: number;
  initialAudioUrl?: string;
  onAudioReady: (audioBase64: string, durationSec: number) => void;
  disabled?: boolean;
}

export default function ExamAudioRecorder({
  maxDurationSec = 120,
  initialAudioUrl,
  onAudioReady,
  disabled = false,
}: ExamAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = [];
    setDuration(0);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Trình duyệt hoặc thiết bị không hỗ trợ ghi âm trực tiếp.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Chuyển blob thành base64 để lưu vào kết quả bài thi
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onAudioReady(base64data, duration);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev + 1 >= maxDurationSec) {
            stopRecording();
            return maxDurationSec;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error("Lỗi khởi động ghi âm:", err);
      setError("Vui lòng cấp quyền Microphone để thực hiện phần thi nói / HSKK.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleReset = () => {
    if (isRecording) stopRecording();
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
    onAudioReady("", 0);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1.5px solid #cbd5e1",
        borderRadius: 16,
        padding: "16px 20px",
        marginTop: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: isRecording ? "#ef4444" : audioUrl ? "#10b981" : "#64748b",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: isRecording ? "pulse 1.5s infinite" : "none",
            }}
          >
            <Mic size={16} />
          </div>
          <div>
            <strong style={{ fontSize: 13, color: "#1e293b" }}>
              {isRecording ? "Đang ghi âm câu trả lời..." : audioUrl ? "Đã ghi âm hoàn tất" : "Ghi âm câu trả lời (HSKK)"}
            </strong>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              Thời lượng: {formatTime(duration)} / {formatTime(maxDurationSec)}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isRecording && !audioUrl && (
            <button
              type="button"
              disabled={disabled}
              onClick={startRecording}
              style={{
                background: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 700,
                cursor: disabled ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 4px rgba(220,38,38,0.2)",
              }}
            >
              <Mic size={14} /> Bắt đầu ghi âm
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              style={{
                background: "#1e293b",
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Square size={13} fill="#ffffff" /> Hoàn thành ghi âm
            </button>
          )}

          {audioUrl && !isRecording && (
            <>
              <button
                type="button"
                onClick={handleReset}
                disabled={disabled}
                style={{
                  background: "#ffffff",
                  color: "#64748b",
                  border: "1px solid #cbd5e1",
                  borderRadius: 10,
                  padding: "7px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: disabled ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <RotateCcw size={13} /> Ghi âm lại
              </button>
            </>
          )}
        </div>
      </div>

      {/* Audio Playback Player */}
      {audioUrl && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#ffffff", padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            controls
            style={{ width: "100%", height: 36 }}
          />
        </div>
      )}

      {error && (
        <div style={{ color: "#dc2626", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
