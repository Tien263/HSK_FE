"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  AlertTriangle,
  ShieldAlert,
  Maximize,
  Minimize2,
  Lock,
  Eye,
  Volume2,
} from "lucide-react";

export interface ExamAntiCheatProctorProps {
  examTitle: string;
  classId?: string;
  maxViolations?: number; // Mặc định 3 lần
  onForceSubmit: (reason: string) => void;
  requireCamera?: boolean; // Yêu cầu camera (mặc định true)
  requireMic?: boolean; // Yêu cầu mic (mặc định true)
}

export default function ExamAntiCheatProctor({
  examTitle,
  classId,
  maxViolations = 3,
  onForceSubmit,
  requireCamera = true,
  requireMic = true,
}: ExamAntiCheatProctorProps) {
  // Trạng thái Camera & Mic
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  // Trạng thái Vi phạm
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolationMsg, setLastViolationMsg] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [suspiciousNoise, setSuspiciousNoise] = useState(false);

  // Audio Analyser đo decibel
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Gửi vi phạm lên server để báo giáo viên
  const reportViolation = useCallback(
    async (violationType: string, details: string, nextCount: number) => {
      try {
        await fetch("/api/v1/proctor/violation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examTitle,
            classId,
            violationType,
            details,
            count: nextCount,
          }),
        });
      } catch (err) {
        console.warn("Failed to report proctor violation:", err);
      }
    },
    [examTitle, classId]
  );

  // Xử lý khi phát hiện hành vi gian lận
  const triggerViolation = useCallback(
    (violationType: string, details: string) => {
      setViolationCount((prev) => {
        const next = prev + 1;
        setLastViolationMsg(details);
        setShowWarningModal(true);

        // Báo ngay cho giáo viên
        reportViolation(violationType, details, next);

        // Nếu vượt quá số lần cho phép -> thu bài cưỡng chế
        if (next >= maxViolations) {
          setTimeout(() => {
            onForceSubmit(`Vi phạm quy chế thi cử: ${details} quá ${maxViolations} lần cho phép.`);
          }, 2000);
        }
        return next;
      });
    },
    [maxViolations, onForceSubmit, reportViolation]
  );

  // 1. Khởi động Camera & Microphone
  useEffect(() => {
    let isMounted = true;

    async function initMedia() {
      if (!requireCamera && !requireMic) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: requireCamera ? { width: { ideal: 320 }, height: { ideal: 240 } } : false,
          audio: requireMic,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current && requireCamera) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
        if (requireMic) {
          setMicActive(true);
          initAudioAnalyser(stream);
        }
      } catch (err: any) {
        console.warn("Camera/Mic access denied:", err);
        setCameraError("Vui lòng cấp quyền Camera & Microphone để phòng thi giám sát hợp lệ.");
        triggerViolation("NO_CAMERA_PERMISSION", "Thí sinh từ chối hoặc chặn quyền Camera / Microphone");
      }
    }

    function initAudioAnalyser(stream: MediaStream) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let loudCount = 0;

        function checkVolume() {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;

          // Nếu âm thanh lớn liên tục trong phòng thi (ngưỡng phát hiện tiếng nói chuyện ~ 50)
          if (avg > 48) {
            loudCount++;
            if (loudCount > 30) {
              setSuspiciousNoise(true);
              triggerViolation("AUDIO_SUSPICIOUS", "Phát hiện tiếng nói chuyện hoặc âm thanh lớn trong phòng thi");
              loudCount = 0;
            }
          } else {
            loudCount = Math.max(0, loudCount - 1);
            setSuspiciousNoise(false);
          }

          animFrameRef.current = requestAnimationFrame(checkVolume);
        }
        checkVolume();
      } catch (e) {
        console.warn("Audio analyser error:", e);
      }
    }

    initMedia();

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [requireCamera, requireMic, triggerViolation]);

  // 2. Bắt sự kiện Rời Tab / Chuyển Ứng Dụng (Tab Switching / Blur)
  useEffect(() => {
    let leaveTimestamp = 0;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        leaveTimestamp = Date.now();
      } else {
        const awaySeconds = leaveTimestamp > 0 ? Math.round((Date.now() - leaveTimestamp) / 1000) : 1;
        triggerViolation(
          "TAB_SWITCH",
          `Thí sinh rời khỏi tab làm bài thi sang tab khác trong ${awaySeconds} giây`
        );
      }
    };

    const handleWindowBlur = () => {
      // Chỉ kích hoạt nếu cửa sổ thực sự mất focus ra ứng dụng ngoài
      setTimeout(() => {
        if (!document.hasFocus() && !document.hidden) {
          triggerViolation("APP_SWITCH", "Thí sinh chuyển sang ứng dụng khác ngoài trình duyệt");
        }
      }, 500);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [triggerViolation]);

  // 3. Chặn Chuột phải, Copy, Paste, Cut & Phím tắt DevTools/In ấn
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation("COPY_PASTE", `Cố tình thao tác ${e.type.toUpperCase()} nội dung đề bài`);
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Chặn F12
      if (e.key === "F12") {
        e.preventDefault();
        triggerViolation("DEVTOOLS_ATTEMPT", "Cố tình nhấn F12 mở công cụ lập trình");
        return false;
      }
      // Chặn Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U
      if (e.ctrlKey && (e.key === "u" || e.key === "U" || (e.shiftKey && ["I", "C", "J", "i", "c", "j"].includes(e.key)))) {
        e.preventDefault();
        triggerViolation("DEVTOOLS_ATTEMPT", "Cố tình mở mã nguồn / Inspect element");
        return false;
      }
      // Chặn Ctrl+C, Ctrl+V, Ctrl+P
      if (e.ctrlKey && ["c", "v", "p", "C", "V", "P"].includes(e.key)) {
        e.preventDefault();
        triggerViolation("SHORTCUT_BLOCKED", `Cố tình nhấn phím tắt Ctrl+${e.key.toUpperCase()}`);
        return false;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [triggerViolation]);

  return (
    <>
      {/* 1. Khung Camera Giám Sát PiP ở góc màn hình */}
      <aside
        className={`fixed z-40 transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border-2 select-none ${
          violationCount > 0 ? "border-[#9D493E]" : "border-[#204434]"
        } bg-[#1B362A] text-white ${
          isMinimized
            ? "bottom-4 right-4 w-44 p-2.5 flex items-center justify-between"
            : "bottom-4 right-4 w-52 sm:w-60"
        }`}
        role="region"
        aria-label="Giám thị camera trực tuyến"
      >
        {/* Header khung giám thị */}
        <div className="bg-[#12281E] px-3 py-1.5 flex items-center justify-between text-[11px] font-bold border-b border-[#204434]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                cameraActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            <span className="tracking-wider uppercase text-[10px]">Giám Thị AI</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/10 rounded-md transition text-stone-300 hover:text-white"
            title={isMinimized ? "Phóng to" : "Thu nhỏ"}
          >
            {isMinimized ? <Maximize className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
        </div>

        {/* Video Camera */}
        {!isMinimized && (
          <div className="relative aspect-4/3 bg-black/80 flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/85 text-xs text-stone-300 gap-1.5">
                <CameraOff className="w-6 h-6 text-red-400" />
                <span className="text-[11px] text-red-300">{cameraError || "Đang kết nối camera..."}</span>
              </div>
            )}

            {/* Chỉ báo trạng thái micro & vi phạm */}
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px]">
              {micActive ? (
                <Mic className={`w-3 h-3 ${suspiciousNoise ? "text-amber-400 animate-bounce" : "text-emerald-400"}`} />
              ) : (
                <MicOff className="w-3 h-3 text-red-400" />
              )}
              <span className={suspiciousNoise ? "text-amber-300 font-bold" : "text-stone-300"}>
                {suspiciousNoise ? "Có tiếng ồn" : "Yên tĩnh"}
              </span>
            </div>

            {violationCount > 0 && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-red-600/90 text-white font-bold text-[10px] flex items-center gap-1 shadow-md">
                <AlertTriangle className="w-3 h-3" />
                <span>Vi phạm: {violationCount}/{maxViolations}</span>
              </div>
            )}
          </div>
        )}

        {isMinimized && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-emerald-300">Đang bật giám sát</span>
            {violationCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                {violationCount}/{maxViolations}
              </span>
            )}
          </div>
        )}
      </aside>

      {/* 2. Modal Cảnh Báo Vi Phạm Nghiêm Khắc khi Học sinh Rời Tab / Gian Lận */}
      {showWarningModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-[#FFFCF6] border-2 border-[#9D493E] rounded-3xl p-6 text-[#204434] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#9D493E]/10 border border-[#9D493E]/30 flex items-center justify-center text-[#9D493E] mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-[#9D493E]">
                Cảnh Báo Vi Phạm Quy Chế Thi Cử!
              </h3>
              <p className="text-xs text-[#315E48]">
                {lastViolationMsg}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/40 text-xs space-y-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Số lần vi phạm đã ghi nhận:</span>
                <span className="text-sm font-bold text-[#9D493E]">
                  {violationCount} / {maxViolations} lần
                </span>
              </div>
              <p className="text-[11px] text-[#637861] leading-relaxed">
                📢 <strong>Lưu ý:</strong> Hành vi chuyển tab, bật cửa sổ phụ hoặc mở ứng dụng ngoài đã được ghi lại tự động và <strong>gửi thông báo trực tiếp đến Giáo viên phụ trách lớp học</strong>. Nếu vi phạm đủ {maxViolations} lần, bài thi sẽ bị <strong>tự động khóa và nộp bài cưỡng chế</strong> ngay lập tức!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3 rounded-2xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-bold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Tôi đã hiểu & Quay lại làm bài nghiêm túc</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
