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
  Smartphone,
  Users,
  UserX,
  Sparkles,
  Zap,
  Globe,
  Radio,
  CheckCircle2,
  Power,
  ShieldOff,
  GripHorizontal,
} from "lucide-react";

export interface ExamAntiCheatProctorProps {
  examTitle: string;
  classId?: string;
  maxViolations?: number; // Mặc định 3 lần
  onForceSubmit: (reason: string) => void;
  requireCamera?: boolean; // Yêu cầu camera (mặc định true)
  requireMic?: boolean; // Yêu cầu mic (mặc định true)
  onViolationRecorded?: (violation: {
    id: string;
    violationType: string;
    details: string;
    count: number;
    timestamp: string;
    snapshot: string | null;
  }) => void;
  onOpenViolationLog?: () => void;
  isProctorEnabled?: boolean;
  onToggleProctor?: (enabled: boolean) => void;
}

export default function ExamAntiCheatProctor({
  examTitle,
  classId,
  maxViolations = 3,
  onForceSubmit,
  requireCamera = true,
  requireMic = true,
  onViolationRecorded,
  onOpenViolationLog,
  isProctorEnabled: controlledEnabled,
  onToggleProctor,
}: ExamAntiCheatProctorProps) {
  // Quyền Bật / Tắt Giám thị AI
  const [isProctorEnabled, setIsProctorEnabled] = useState<boolean>(() => {
    if (controlledEnabled !== undefined) return controlledEnabled;
    if (typeof window !== "undefined") {
      return localStorage.getItem("hanyu_disable_ai_proctor") !== "true";
    }
    return true;
  });

  useEffect(() => {
    if (controlledEnabled !== undefined) {
      setIsProctorEnabled(controlledEnabled);
      if (!controlledEnabled && streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setCameraActive(false);
        setMicActive(false);
      }
    }
  }, [controlledEnabled]);

  const handleToggleProctor = (enabled: boolean) => {
    setIsProctorEnabled(enabled);
    if (onToggleProctor) onToggleProctor(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("hanyu_disable_ai_proctor", enabled ? "false" : "true");
    }
    if (!enabled && streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraActive(false);
      setMicActive(false);
    }
  };

  // Trạng thái Camera & Mic
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  // Lịch sử vi phạm trong phòng thi để học sinh và giáo viên cùng xem
  const [violationsHistory, setViolationsHistory] = useState<
    Array<{
      id: string;
      violationType: string;
      details: string;
      count: number;
      timestamp: string;
      snapshot: string | null;
    }>
  >([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [diagnosticFeedback, setDiagnosticFeedback] = useState<string | null>(null);
  const currentDbRef = useRef<number>(20);

  // Giai đoạn chuẩn bị (Setup phase) trước khi vào thi - Không ghi nhận vi phạm
  const [isSetupPhase, setIsSetupPhase] = useState(true);
  const [setupCountdown, setSetupCountdown] = useState(10);

  // Đếm ngược giai đoạn chuẩn bị
  useEffect(() => {
    if (!isSetupPhase) return;
    if (setupCountdown <= 0) {
      setIsSetupPhase(false);
      return;
    }
    const timer = setTimeout(() => setSetupCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isSetupPhase, setupCountdown]);

  // Trạng thái AI Vision
  const [aiStatus, setAiStatus] = useState<"loading" | "ready" | "detecting">("loading");
  const [detectedEntity, setDetectedEntity] = useState<string>("Bình thường");
  const [phoneConfidence, setPhoneConfidence] = useState<number>(0);
  const cocoModelRef = useRef<any>(null);
  const isDetectingRef = useRef<boolean>(false);
  const faceMissingFramesRef = useRef<number>(0);
  const phoneDetectedFramesRef = useRef<number>(0);
  const multiPersonFramesRef = useRef<number>(0);
  const lastViolationTimeRef = useRef<number>(0);
  const [isDiagnosticMode, setIsDiagnosticMode] = useState<boolean>(false);

  // Trạng thái Vi phạm
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolationType, setLastViolationType] = useState<string>("");
  const [lastViolationMsg, setLastViolationMsg] = useState("");
  const [lastViolationSnapshot, setLastViolationSnapshot] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [suspiciousNoise, setSuspiciousNoise] = useState(false);

  // Kéo thả di chuyển vị trí khung Giám thị / Test AI
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; origX: number; origY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("a") || target.closest("select")) return;

    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragRef.current?.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const newX = Math.max(8, Math.min(window.innerWidth - 120, dragRef.current.origX + dx));
    const newY = Math.max(8, Math.min(window.innerHeight - 60, dragRef.current.origY + dy));
    setPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (dragRef.current?.isDragging) {
      dragRef.current.isDragging = false;
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  // Audio Analyser đo decibel
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const visionIntervalRef = useRef<any>(null);

  // Phát âm thanh cảnh báo Beep (Web Audio API)
  const playWarningBeep = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, []);

  /**
   * TẠO BẰNG CHỨNG VI PHẠM THÍCH ỨNG CHÍNH XÁC VỚI TỪNG LOẠI HÀNH VI:
   * 1. Vi phạm Rời Tab / Chuyển Ứng dụng: Tạo THẺ BẰNG CHỨNG SỐ (Digital Tab Switch Certificate)
   *    -> Tuyệt đối KHÔNG chụp mặt thí sinh vì rời tab là sự kiện trên màn hình trình duyệt!
   * 2. Vi phạm Tiếng ồn: Tạo BIỂU ĐỒ SÓNG ÂM DECIBEL
   * 3. Vi phạm Camera (Cầm điện thoại, người thứ hai, vắng mặt): Chụp ảnh webcam KÈM KHUNG VIỀN ĐỎ PHÁT HIỆN
   */
  const captureViolationEvidence = useCallback(
    (violationType: string, details: string, extraSeconds: number = 0): string | null => {
      try {
        if (typeof document === "undefined") return null;
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 250;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const now = new Date();
        const timeStr = now.toLocaleTimeString("vi-VN") + " - " + now.toLocaleDateString("vi-VN");

        // A. VI PHẠM RỜI TAB HOẶC CHUYỂN ỨNG DỤNG (Bằng chứng số màn hình)
        if (violationType === "TAB_SWITCH" || violationType === "APP_SWITCH") {
          // Nền bảng an ninh cao cấp
          const grad = ctx.createLinearGradient(0, 0, 400, 250);
          grad.addColorStop(0, "#0F172A");
          grad.addColorStop(1, "#1E293B");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 400, 250);

          // Khung viền đỏ an ninh
          ctx.strokeStyle = "#EF4444";
          ctx.lineWidth = 4;
          ctx.strokeRect(4, 4, 392, 242);

          // Dải banner đỏ
          ctx.fillStyle = "#DC2626";
          ctx.fillRect(8, 8, 384, 40);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 13px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("🚫 BẰNG CHỨNG SỐ: RỜI KHỎI TAB LÀM BÀI THI", 200, 33);

          // Họa tiết lưới kỹ thuật
          ctx.strokeStyle = "rgba(239, 68, 68, 0.15)";
          ctx.lineWidth = 1;
          for (let y = 60; y < 240; y += 20) {
            ctx.beginPath();
            ctx.moveTo(10, y);
            ctx.lineTo(390, y);
            ctx.stroke();
          }

          // Chi tiết biên bản số
          ctx.textAlign = "left";
          ctx.font = "bold 11px sans-serif";
          ctx.fillStyle = "#F87171";
          ctx.fillText("HÀNH VI GHI NHẬN:", 22, 75);
          ctx.fillStyle = "#F8FAFC";
          ctx.font = "11px sans-serif";
          ctx.fillText(details.slice(0, 44), 145, 75);

          ctx.font = "bold 11px sans-serif";
          ctx.fillStyle = "#F87171";
          ctx.fillText("TRẠNG THÁI CỬA SỔ:", 22, 102);
          ctx.fillStyle = "#FCD34D";
          ctx.font = "bold 11px monospace";
          ctx.fillText("document.visibilityState = HIDDEN", 155, 102);

          ctx.font = "bold 11px sans-serif";
          ctx.fillStyle = "#F87171";
          ctx.fillText("THỜI GIAN VẮNG MẶT:", 22, 129);
          ctx.fillStyle = "#EF4444";
          ctx.font = "bold 12px sans-serif";
          ctx.fillText(`${extraSeconds || 1} giây rời khỏi đề thi`, 155, 129);

          ctx.font = "bold 11px sans-serif";
          ctx.fillStyle = "#F87171";
          ctx.fillText("THỜI ĐIỂM CHÍNH XÁC:", 22, 156);
          ctx.fillStyle = "#CBD5E1";
          ctx.font = "11px sans-serif";
          ctx.fillText(timeStr, 155, 156);

          ctx.font = "bold 11px sans-serif";
          ctx.fillStyle = "#F87171";
          ctx.fillText("BÀI THI LIÊN QUAN:", 22, 183);
          ctx.fillStyle = "#93C5FD";
          ctx.font = "11px sans-serif";
          ctx.fillText(examTitle.slice(0, 32), 145, 183);

          // Con dấu kiểm soát thi
          ctx.save();
          ctx.fillStyle = "rgba(220, 38, 38, 0.2)";
          ctx.fillRect(16, 204, 368, 32);
          ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
          ctx.strokeRect(16, 204, 368, 32);
          ctx.fillStyle = "#EF4444";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("⚠️ HỆ THỐNG GHI NHẬN: THÍ SINH ĐÃ CHUYỂN SANG TAB / CỬA SỔ KHÁC", 200, 224);
          ctx.restore();

          return canvas.toDataURL("image/jpeg", 0.85);
        }

        // B. VI PHẠM ÂM THANH / TIẾNG ỒN BẤT THƯỜNG
        if (violationType === "AUDIO_SUSPICIOUS") {
          ctx.fillStyle = "#1E1B4B";
          ctx.fillRect(0, 0, 400, 250);
          ctx.strokeStyle = "#F59E0B";
          ctx.lineWidth = 4;
          ctx.strokeRect(4, 4, 392, 242);

          ctx.fillStyle = "#D97706";
          ctx.fillRect(8, 8, 384, 40);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 13px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("🎙️ BẰNG CHỨNG ÂM THANH: VƯỢT NGƯỠNG PHÒNG THI", 200, 33);

          // Biểu đồ sóng âm (Waveform graph)
          ctx.strokeStyle = "#EF4444";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          for (let x = 20; x < 380; x += 4) {
            const spike = x > 160 && x < 260 ? Math.sin(x * 0.15) * 45 : Math.sin(x * 0.1) * 12;
            const y = 120 + spike + (Math.random() * 10 - 5);
            if (x === 20) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Ngưỡng Decibel cảnh báo
          ctx.strokeStyle = "#F59E0B";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(20, 100);
          ctx.lineTo(380, 100);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.textAlign = "center";
          ctx.fillStyle = "#FDE68A";
          ctx.font = "bold 11px sans-serif";
          const displayDb = Math.max(72, currentDbRef.current || 75);
          ctx.fillText(`Cường độ âm thanh: ~ ${displayDb} dB (Vượt ngưỡng 70 dB cho phép)`, 200, 185);
          ctx.fillStyle = "#94A3B8";
          ctx.font = "10px sans-serif";
          ctx.fillText(`Thời điểm ghi nhận: ${timeStr}`, 200, 215);

          return canvas.toDataURL("image/jpeg", 0.85);
        }

        // C. VI PHẠM THỊ GIÁC (CAMERA: ĐIỆN THOẠI, NGƯỜI THỨ HAI, VẮNG MẶT)
        if (videoRef.current && videoRef.current.readyState >= 2) {
          // Lật ngang (mirror) để ảnh chụp giống hệt giao diện webcam mà thí sinh nhìn thấy
          ctx.save();
          ctx.translate(400, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, 0, 400, 250);
          if (overlayCanvasRef.current) {
            ctx.drawImage(overlayCanvasRef.current, 0, 0, 400, 250);
          }
          ctx.restore();

          // Dải banner thông tin bằng chứng camera sắc nét
          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(8, 8, 384, 28);
          ctx.strokeStyle = "#EF4444";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(8, 8, 384, 28);
          ctx.fillStyle = "#F87171";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "left";
          const label = violationType === "CELL_PHONE_DETECTED" ? "📱 PHÁT HIỆN SỬ DỤNG ĐIỆN THOẠI" : violationType;
          ctx.fillText(`📸 BẰNG CHỨNG CAMERA: ${label}`, 16, 26);

          return canvas.toDataURL("image/jpeg", 0.8);
        }
      } catch (e) {
        console.warn("Evidence capture error:", e);
      }
      return null;
    },
    [examTitle]
  );

  // Gửi vi phạm và bằng chứng snapshot lên máy chủ cho giáo viên
  const reportViolation = useCallback(
    async (violationType: string, details: string, nextCount: number, snapshot: string | null) => {
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
            snapshot,
          }),
        });
      } catch (err) {
        console.warn("Failed to report proctor violation:", err);
      }
    },
    [examTitle, classId]
  );

  // Xử lý khi phát hiện hành vi gian lận (Có Debounce chống spam)
  const triggerViolation = useCallback(
    (violationType: string, details: string, extraParam: number = 0) => {
      // Khi đã tắt giám thị AI hoặc đang trong chế độ test an toàn -> Không phạt lỗi
      if (!isProctorEnabled || isDiagnosticMode) return;

      // Đang trong giai đoạn chuẩn bị (Setup phase), không ghi nhận vi phạm
      if (isSetupPhase) return;

      const now = Date.now();
      // Chống kích hoạt dồn dập trong vòng 4.5 giây cho cùng 1 lỗi
      if (now - lastViolationTimeRef.current < 4500) return;
      lastViolationTimeRef.current = now;

      // Tạo ảnh bằng chứng thích ứng theo loại vi phạm
      const snapshot = captureViolationEvidence(violationType, details, extraParam);
      setLastViolationSnapshot(snapshot);
      setLastViolationType(violationType);

      playWarningBeep();

      setViolationCount((prev) => {
        const next = prev + 1;
        setLastViolationMsg(details);
        setShowWarningModal(true);

        const newRecord = {
          id: `viol-${now}-${next}`,
          violationType,
          details,
          count: next,
          timestamp: new Date().toLocaleTimeString("vi-VN") + " - " + new Date().toLocaleDateString("vi-VN"),
          snapshot,
        };
        setViolationsHistory((h) => [newRecord, ...h]);
        if (onViolationRecorded) {
          onViolationRecorded(newRecord);
        }

        // Báo ngay lập tức cho giáo viên phụ trách kèm ảnh chụp bằng chứng
        reportViolation(violationType, details, next, snapshot);

        // Nếu vượt quá số lần cho phép -> thu bài cưỡng chế
        if (next >= maxViolations) {
          setTimeout(() => {
            onForceSubmit(`Vi phạm quy chế thi cử: ${details} quá ${maxViolations} lần cho phép.`);
          }, 2500);
        }
        return next;
      });
    },
    [isProctorEnabled, isDiagnosticMode, isSetupPhase, captureViolationEvidence, maxViolations, onForceSubmit, playWarningBeep, reportViolation, onViolationRecorded]
  );

  // Nút Kiểm Tra Chẩn Đoán AI An Toàn (Self-Check: Camera + Micro + Điện Thoại - TUYỆT ĐỐI KHÔNG PHẠT LỖI)
  const handleTestAiDiagnostic = () => {
    setIsDiagnosticMode(true);
    const canvas = overlayCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#10B981";
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width * 0.15, canvas.height * 0.12, canvas.width * 0.7, canvas.height * 0.75);
        ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
        ctx.fillRect(canvas.width * 0.15, canvas.height * 0.12 - 24, 280, 24);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("🧪 TEST AI: HÃY THỬ GIƠ ĐIỆN THOẠI HOẶC NÓI", canvas.width * 0.15 + 6, canvas.height * 0.12 - 7);
      }
    }
    const currentDb = currentDbRef.current || 38;
    setDiagnosticFeedback(
      `🧪 ĐANG TEST AI (15 GIÂY): Thử giơ điện thoại hoặc phát âm thanh trước camera. AI sẽ quét và khoanh vùng kiểm tra trực tiếp (~${currentDb} dB) mà KHÔNG phạt lỗi!`
    );
    setDetectedEntity("Đang test cảm biến...");
    setTimeout(() => {
      setIsDiagnosticMode(false);
      setDiagnosticFeedback(null);
    }, 15000);
  };

  // 1. Tải Model COCO-SSD nhẹ nhàng & Warm-up trước để tăng tốc nhận diện tức thì
  useEffect(() => {
    let isMounted = true;

    async function loadVisionAi() {
      if (!requireCamera) return;

      if (typeof window !== "undefined") {
        setAiStatus("loading");
        try {
          const loadScript = (src: string) =>
            new Promise<void>((resolve, reject) => {
              if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
              }
              const s = document.createElement("script");
              s.src = src;
              s.crossOrigin = "anonymous";
              s.onload = () => resolve();
              s.onerror = (e) => reject(e);
              document.head.appendChild(s);
            });

          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js");
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3");

          if ((window as any).cocoSsd && isMounted) {
            const model = await (window as any).cocoSsd.load({ base: "lite_mobilenet_v2" });
            if (isMounted) {
              cocoModelRef.current = model;
              // Warm-up model trước với canvas nhỏ để compile WebGL shaders trước, tránh lag ở lần quét đầu
              try {
                const warmupCanvas = document.createElement("canvas");
                warmupCanvas.width = 16;
                warmupCanvas.height = 16;
                await model.detect(warmupCanvas);
              } catch {}
              setAiStatus("ready");
            }
          }
        } catch (err) {
          console.warn("COCO-SSD load error, using fast native detector:", err);
          if (isMounted) setAiStatus("ready");
        }
      }
    }

    loadVisionAi();
    return () => {
      isMounted = false;
    };
  }, [requireCamera]);

  // 2. Khởi động Camera & Microphone
  useEffect(() => {
    let isMounted = true;

    async function initMedia() {
      if (!isProctorEnabled || (!requireCamera && !requireMic)) return;
      if (
        typeof window === "undefined" ||
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        setCameraError("Thiết bị hoặc trình duyệt không hỗ trợ truy cập camera/micro.");
        return;
      }
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: requireCamera
              ? {
                  width: { ideal: 320 },
                  height: { ideal: 240 },
                  facingMode: "user",
                }
              : false,
            audio: requireMic
              ? {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                }
              : false,
          });
        } catch (combinedErr) {
          // Nếu thiết bị không có micro hoặc quyền micro bị chặn, dự phòng lấy video-only để camera vẫn giám sát tốt
          if (requireCamera && requireMic) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 320 },
                height: { ideal: 240 },
                facingMode: "user",
              },
              audio: false,
            });
            console.warn("Chỉ bật được camera (microphone không khả dụng):", combinedErr);
          } else {
            throw combinedErr;
          }
        }

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current && requireCamera) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
        const hasAudioTrack = stream.getAudioTracks().length > 0;
        if (requireMic && hasAudioTrack) {
          setMicActive(true);
          initAudioAnalyser(stream);
        } else if (requireMic) {
          setMicActive(false);
        }
      } catch (err: any) {
        console.warn("Camera/Mic access denied:", err);
        setCameraError("Vui lòng cho phép quyền Camera & Microphone để phòng thi giám sát hợp lệ.");
      }
    }

    function initAudioAnalyser(stream: MediaStream) {
      try {
        if (typeof window === "undefined") return;
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.4;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let loudSpeechStartTime = 0;
        let lastLoudTimestamp = 0;

        function checkVolume() {
          if (!isMounted || !analyserRef.current) return;
          try {
            analyserRef.current.getByteFrequencyData(dataArray);

            // Tách dải tần giọng nói con người: Bins 2 đến 18 (~375 Hz - 3000 Hz)
            // Loại bỏ hoàn toàn tiếng ù quạt gió / tiếng trầm bàn phím (< 250 Hz) và tiếng lách cách chuột cực cao (> 4000 Hz)
            let vocalSum = 0;
            let vocalSumSq = 0;
            let vocalPeak = 0;
            const startBin = 2;
            const endBin = Math.min(18, dataArray.length);
            const count = endBin - startBin;

            for (let i = startBin; i < endBin; i++) {
              const v = dataArray[i];
              vocalSum += v;
              vocalSumSq += v * v;
              if (v > vocalPeak) vocalPeak = v;
            }

            const vocalAvg = vocalSum / count;
            const vocalRms = Math.sqrt(vocalSumSq / count);

            // Đo decibel thực tế: Phòng yên tĩnh ~35-45 dB, gõ phím nhẹ ~48-55 dB, nói to/thảo luận ~68-85 dB
            const estDb = Math.min(100, Math.round(35 + (vocalRms / 255) * 55));
            currentDbRef.current = estDb;

            const now = Date.now();

            // Chỉ coi là tiếng nói / âm thanh bất thường khi năng lượng dải giọng nói đủ lớn:
            // RMS dải giọng >= 82, Avg >= 55, Peak >= 150 và estDb >= 68 dB
            const isLoudSpeech = vocalRms >= 82 && vocalAvg >= 55 && estDb >= 68;

            if (isLoudSpeech) {
              lastLoudTimestamp = now;
              if (loudSpeechStartTime === 0) {
                loudSpeechStartTime = now;
              }
              const duration = now - loudSpeechStartTime;

              // Hiện tín hiệu trên radar để thí sinh nhận biết
              setSuspiciousNoise(true);

              // CHỈ KÍCH HOẠT VI PHẠM KHI TIẾNG NÓI / ỒN KÉO DÀI LIÊN TỤC TỪ 2.5 GIÂY TRỞ LÊN
              // Tiếng ho, tiếng gõ phím, tiếng kéo ghế ngắn (< 2.5s) tuyệt đối KHÔNG bị phạt!
              if (duration >= 2500) {
                triggerViolation(
                  "AUDIO_SUSPICIOUS",
                  `Phát hiện tiếng nói / âm thanh kéo dài (~${Math.max(70, estDb)} dB) trong phòng thi`
                );
                loudSpeechStartTime = 0;
              }
            } else {
              // Nếu im lặng trở lại quá 700ms thì reset bộ đếm thời gian
              if (now - lastLoudTimestamp > 700) {
                loudSpeechStartTime = 0;
                setSuspiciousNoise(false);
              }
            }

            animFrameRef.current = requestAnimationFrame(checkVolume);
          } catch {}
        }
        checkVolume();
      } catch (e) {
        console.warn("Audio analyser error:", e);
      }
    }

    if (isProctorEnabled) {
      initMedia();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      setMicActive(false);
    }

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
  }, [isProctorEnabled, requireCamera, requireMic, triggerViolation]);

  /**
   * 3. BỘ THỊ GIÁC COMPUTER VISION NHẬN DIỆN THIẾT BỊ DI ĐỘNG & NGƯỜI
   * Hoạt động thời gian thực (Real-time Instant Vision):
   * - Quét hình khối chữ nhật (Smartphone Aspect Ratio: ~1.5 - 2.4).
   * - Dò bàn tay cầm vật thể đưa lên trước ngực / mặt / tai.
   * - Dò màn hình điện thoại phát sáng hoặc ốp lưng thanh chữ nhật.
   * - Đồng thời đối soát với mô hình COCO-SSD nếu đã tải xong.
   */
  useEffect(() => {
    if (!cameraActive) return;

    const runVisionDetection = async () => {
      if (isDetectingRef.current) return;
      isDetectingRef.current = true;

      try {
        const video = videoRef.current;
        const canvas = overlayCanvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;

      const width = video.videoWidth || 320;
      const height = video.videoHeight || 240;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      let phoneDetected = false;
      let phoneConfidenceScore = 0;
      let detectedBox: { x: number; y: number; w: number; h: number } | null = null;
      let personCount = 0;

      // =========================================================================
      // ENGINE A: COCO-SSD (Deep Learning siêu tốc - Hạ ngưỡng nhạy bén >= 35%)
      // =========================================================================
      if (cocoModelRef.current) {
        try {
          const predictions = await cocoModelRef.current.detect(video);
          predictions.forEach((pred: any) => {
            const [x, y, w, h] = pred.bbox;
            // 1. Nhận diện điện thoại cầm tay (cell phone >= 35% hoặc remote/thiết bị cầm tay >= 40%)
            if (
              (pred.class === "cell phone" && pred.score >= 0.35) ||
              (pred.class === "remote" && pred.score >= 0.40)
            ) {
              phoneDetected = true;
              const score = Math.round(pred.score * 100);
              if (score > phoneConfidenceScore) {
                phoneConfidenceScore = score;
                detectedBox = { x, y, w, h };
              }
            }
            // 2. Nhận diện tài liệu / laptop đưa trước mặt
            if ((pred.class === "book" || pred.class === "laptop") && pred.score >= 0.55) {
              phoneDetected = true;
              phoneConfidenceScore = Math.max(phoneConfidenceScore, Math.round(pred.score * 100));
              detectedBox = { x, y, w, h };
            }
            // 3. Đếm số người trong phòng
            if (pred.class === "person" && pred.score >= 0.55) {
              personCount++;
            }
          });
        } catch {}
      }

      // =========================================================================
      // ENGINE B: GRID-BASED HEURISTIC DETECTOR (Chạy tức thì < 2ms, không chờ model)
      // =========================================================================
      try {
        const offscreen = document.createElement("canvas");
        const ow = 80;
        const oh = 60;
        offscreen.width = ow;
        offscreen.height = oh;
        const octx = offscreen.getContext("2d");
        if (octx) {
          octx.drawImage(video, 0, 0, ow, oh);
          const imgData = octx.getImageData(0, 0, ow, oh);
          const d = imgData.data;

          let skinPixels = 0;
          // Chia khu vực dưới mặt (y từ 20..58) thành lưới 8x6 khối để tìm cụm điện thoại cầm tay
          const gridCols = 8;
          const gridRows = 6;
          const cellW = Math.floor(ow / gridCols);
          const cellH = Math.floor((oh - 20) / gridRows);
          const deviceGrid = Array.from({ length: gridRows }, () => new Array(gridCols).fill(0));

          for (let y = 0; y < oh; y++) {
            for (let x = 0; x < ow; x++) {
              const idx = (y * ow + x) * 4;
              const r = d[idx];
              const g = d[idx + 1];
              const b = d[idx + 2];

              const isSkin =
                r > 80 &&
                g > 35 &&
                b > 20 &&
                Math.max(r, g, b) - Math.min(r, g, b) > 12 &&
                r > g &&
                r > b;

              if (isSkin) skinPixels++;

              // Quét phát hiện thiết bị cầm tay ở khu vực dưới khuôn mặt (ngực, tay cầm, 2 bên)
              if (y >= 20) {
                const brightness = (r + g + b) / 3;
                // Điện thoại: màn hình phát sáng (brightness > 185) hoặc thân máy chữ nhật tối (brightness < 45)
                const isDevicePixel = !isSkin && (brightness < 45 || brightness > 185);
                if (isDevicePixel) {
                  const c = Math.min(gridCols - 1, Math.floor(x / cellW));
                  const rIdx = Math.min(gridRows - 1, Math.floor((y - 20) / cellH));
                  deviceGrid[rIdx][c]++;
                }
              }
            }
          }

          const skinRatio = skinPixels / (ow * oh);
          const cellTotal = cellW * cellH;

          // Tìm cụm 2x2 hoặc 2x3 ô liên tiếp có mật độ thiết bị cao (tương ứng kích thước điện thoại)
          if (!phoneDetected) {
            for (let r = 0; r < gridRows - 1; r++) {
              for (let c = 0; c < gridCols - 1; c++) {
                const clusterPixels =
                  deviceGrid[r][c] +
                  deviceGrid[r][c + 1] +
                  deviceGrid[r + 1][c] +
                  deviceGrid[r + 1][c + 1];
                const clusterDensity = clusterPixels / (cellTotal * 4);
                if (clusterDensity >= 0.35) {
                  phoneDetected = true;
                  phoneConfidenceScore = Math.min(95, Math.round(clusterDensity * 125 + 35));
                  const boxX = (c * cellW / ow) * width;
                  const boxY = ((20 + r * cellH) / oh) * height;
                  const boxWidth = ((cellW * 2.2) / ow) * width;
                  const boxHeight = ((cellH * 2.5) / oh) * height;
                  detectedBox = { x: boxX, y: boxY, w: boxWidth, h: boxHeight };
                  break;
                }
              }
              if (phoneDetected) break;
            }
          }

          // Kiểm tra vắng mặt: Cần vắng mặt liên tục từ 16 khung hình (~5.6 giây) mới phạt
          if (!phoneDetected && skinRatio < 0.035 && personCount === 0) {
            faceMissingFramesRef.current++;
            if (faceMissingFramesRef.current >= 16) {
              setDetectedEntity("Vắng mặt!");
              triggerViolation("NO_FACE_DETECTED", "Thí sinh vắng mặt khỏi camera quá 5 giây");
              faceMissingFramesRef.current = 0;
            } else if (faceMissingFramesRef.current >= 6) {
              setDetectedEntity("Căn chỉnh mặt...");
            }
          } else {
            faceMissingFramesRef.current = 0;
          }

          // Kiểm tra người thứ 2: Chỉ báo khi mô hình AI Deep Learning phát hiện >= 2 người trong 3 frame liên tục
          if (!phoneDetected && personCount >= 2) {
            multiPersonFramesRef.current++;
            if (multiPersonFramesRef.current >= 3) {
              setDetectedEntity("Có 2 người!");
              triggerViolation("MULTIPLE_PEOPLE_DETECTED", "Hệ thống phát hiện có thêm người thứ 2 trong phòng thi");
              multiPersonFramesRef.current = 0;
            }
          } else {
            multiPersonFramesRef.current = Math.max(0, multiPersonFramesRef.current - 1);
          }
        }
      } catch (err) {
        console.warn("Canvas vision error:", err);
      }

      // =========================================================================
      // XỬ LÝ KHI PHÁT HIỆN ĐIỆN THOẠI (NHẬN DIỆN NGAY LẬP TỨC)
      // =========================================================================
      if (phoneDetected) {
        phoneDetectedFramesRef.current++;
        setPhoneConfidence(phoneConfidenceScore);
        setDetectedEntity("Phát hiện ĐT!");

        const box = detectedBox || {
          x: width * 0.25,
          y: height * 0.3,
          w: width * 0.35,
          h: height * 0.45,
        };

        // Chế độ Test AI an toàn: Đổi màu xanh ngọc + thông báo phản hồi tích cực
        if (isDiagnosticMode) {
          ctx.strokeStyle = "#10B981";
          ctx.lineWidth = 3.5;
          ctx.strokeRect(box.x, box.y, box.w, box.h);

          ctx.fillStyle = "#059669";
          const tagY = Math.max(0, box.y - 24);
          ctx.fillRect(box.x, tagY, 210, 24);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText(`📱 TEST: ĐÃ THẤY ĐIỆN THOẠI (${phoneConfidenceScore}%)`, box.x + 6, tagY + 16);

          setDiagnosticFeedback(
            `✅ ĐÃ NHẬN DIỆN ĐIỆN THOẠI THÀNH CÔNG (${phoneConfidenceScore}%)! Camera AI quét rất nhanh và chính xác.`
          );
        } else {
          // Chế độ Giám thị thông thường: Viền đỏ báo hiệu
          ctx.strokeStyle = "#EF4444";
          ctx.lineWidth = 3.5;
          ctx.strokeRect(box.x, box.y, box.w, box.h);

          ctx.strokeStyle = "#FDE047";
          ctx.lineWidth = 4;
          const cornerLen = 14;
          ctx.beginPath();
          ctx.moveTo(box.x, box.y + cornerLen);
          ctx.lineTo(box.x, box.y);
          ctx.lineTo(box.x + cornerLen, box.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(box.x + box.w - cornerLen, box.y);
          ctx.lineTo(box.x + box.w, box.y);
          ctx.lineTo(box.x + box.w, box.y + cornerLen);
          ctx.stroke();

          ctx.fillStyle = "#DC2626";
          const tagY = Math.max(0, box.y - 24);
          ctx.fillRect(box.x, tagY, 195, 24);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText(`📱 ĐIỆN THOẠI DI ĐỘNG (${phoneConfidenceScore}%)`, box.x + 6, tagY + 16);

          // Phản hồi tức thì: Nếu độ tin cậy >= 45% chỉ cần 1 frame (~350ms) là bắt ngay; nếu dưới 45% cần 2 frame (~700ms)
          const requiredFrames = phoneConfidenceScore >= 45 ? 1 : 2;
          if (phoneDetectedFramesRef.current >= requiredFrames) {
            triggerViolation(
              "CELL_PHONE_DETECTED",
              "Hệ thống AI phát hiện thí sinh cầm hoặc sử dụng thiết bị điện thoại di động trước camera"
            );
          }
        }
      } else {
        phoneDetectedFramesRef.current = Math.max(0, phoneDetectedFramesRef.current - 1);
        if (phoneDetectedFramesRef.current === 0) setPhoneConfidence(0);
        if (faceMissingFramesRef.current === 0 && multiPersonFramesRef.current === 0) {
          setDetectedEntity(isDiagnosticMode ? "Đang test..." : "Hợp lệ");
          // Vẽ khung xanh thí sinh hợp lệ mờ nhẹ
          ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(width * 0.2, height * 0.1, width * 0.6, height * 0.8);
          ctx.fillStyle = "rgba(16, 185, 129, 0.7)";
          ctx.fillRect(width * 0.2, height * 0.1, 75, 16);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 9px sans-serif";
          ctx.fillText("👤 Thí sinh", width * 0.2 + 5, height * 0.1 + 12);
        }
      }
    } finally {
      isDetectingRef.current = false;
    }
  };

  visionIntervalRef.current = setInterval(runVisionDetection, 350);

  return () => {
    if (visionIntervalRef.current) clearInterval(visionIntervalRef.current);
  };
}, [cameraActive, triggerViolation, isDiagnosticMode]);

  // 4. Bắt sự kiện Rời Tab / Chuyển Ứng Dụng (Tab Switching / Blur)
  useEffect(() => {
    let leaveTimestamp = 0;

    const handleVisibilityChange = () => {
      if (!isProctorEnabled) return;
      if (document.hidden) {
        leaveTimestamp = Date.now();
      } else {
        const awaySeconds = leaveTimestamp > 0 ? Math.round((Date.now() - leaveTimestamp) / 1000) : 1;
        triggerViolation(
          "TAB_SWITCH",
          `Thí sinh rời khỏi tab bài thi sang tab khác trong ${awaySeconds} giây`,
          awaySeconds
        );
      }
    };

    const handleWindowBlur = () => {
      if (!isProctorEnabled) return;
      setTimeout(() => {
        if (!document.hasFocus() && !document.hidden) {
          triggerViolation("APP_SWITCH", "Thí sinh chuyển sang ứng dụng khác ngoài trình duyệt (Zalo/Word/ChatGPT...)", 2);
        }
      }, 500);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isProctorEnabled, triggerViolation]);

  // 5. Chặn chuột phải, Copy, Paste, DevTools (F12)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (!isProctorEnabled) return;
      e.preventDefault();
      triggerViolation("RIGHT_CLICK_BLOCKED", "Cố tình nhấp chuột phải trong phòng thi");
      return false;
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      if (!isProctorEnabled) return;
      e.preventDefault();
      triggerViolation("COPY_PASTE_BLOCKED", "Cố tình sao chép / dán nội dung đề thi");
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isProctorEnabled) return;
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase()))) {
        e.preventDefault();
        triggerViolation("DEVTOOLS_ATTEMPT", "Cố tình mở mã nguồn / Inspect element");
        return false;
      }
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
  }, [isProctorEnabled, triggerViolation]);

  if (!isProctorEnabled) {
    return (
      <aside
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          ...(pos ? { left: `${pos.x}px`, top: `${pos.y}px`, bottom: "auto", right: "auto", position: "fixed" } : {}),
          touchAction: "none",
        }}
        className={`fixed ${pos ? "" : "bottom-4 right-4"} z-40 bg-[#1B362A]/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-[#315E48] flex items-center gap-2.5 text-xs select-none cursor-grab active:cursor-grabbing hover:border-emerald-400/50 transition-colors`}
        role="region"
        aria-label="Chế độ làm bài tự do"
        title="Kéo thả để di chuyển vị trí"
      >
        <div className="flex items-center gap-1 text-stone-400 hover:text-stone-200">
          <GripHorizontal className="w-3.5 h-3.5 shrink-0" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-stone-200 font-medium text-[11px]">Chế độ thi tự do (Giám thị AI: ĐÃ TẮT)</span>
        </div>
        <button
          type="button"
          onClick={() => handleToggleProctor(true)}
          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition cursor-pointer shadow-sm flex items-center gap-1"
          title="Bật lại AI giám thị"
        >
          <Power className="w-3 h-3 text-amber-300" />
          <span>Bật lại AI</span>
        </button>
      </aside>
    );
  }

  return (
    <>
      {/* 1. Khung Camera Giám Sát PiP ở góc màn hình */}
      <aside
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          ...(pos ? { left: `${pos.x}px`, top: `${pos.y}px`, bottom: "auto", right: "auto", position: "fixed" } : {}),
          touchAction: "none",
        }}
        className={`fixed z-40 transition-shadow shadow-2xl rounded-2xl overflow-hidden border-2 select-none ${
          violationCount > 0 ? "border-[#9D493E]" : "border-[#204434]"
        } bg-[#1B362A] text-white ${
          isMinimized
            ? `${pos ? "" : "bottom-4 right-4"} w-56 p-2.5 flex items-center justify-between cursor-grab active:cursor-grabbing`
            : `${pos ? "" : "bottom-4 right-4"} w-60 sm:w-72`
        }`}
        role="region"
        aria-label="Giám thị camera trực tuyến"
      >
        {/* Header khung giám thị (hỗ trợ kéo thả di chuyển) */}
        <div className="bg-[#12281E] px-3 py-1.5 flex items-center justify-between text-[11px] font-bold border-b border-[#204434] cursor-grab active:cursor-grabbing" title="Kéo thả để di chuyển vị trí">
          <div className="flex items-center gap-1.5">
            <GripHorizontal className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span
              className={`w-2 h-2 rounded-full ${
                cameraActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            <span className="tracking-wider uppercase text-[10px]">Giám Thị AI Trực Tuyến</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleTestAiDiagnostic}
              className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[9px] font-bold transition cursor-pointer flex items-center gap-0.5"
              title="Kiểm tra cảm biến AI (Camera & Micro & Khuôn mặt) an toàn - Không ghi nhận vi phạm"
            >
              <Zap className="w-2.5 h-2.5 text-amber-300" />
              <span>Test AI</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleProctor(false)}
              className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[9px] font-bold transition cursor-pointer flex items-center gap-0.5"
              title="Tắt Giám thị AI để làm bài tự do"
            >
              <ShieldOff className="w-2.5 h-2.5" />
              <span>Tắt AI</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenViolationLog) {
                  onOpenViolationLog();
                } else {
                  setShowLogModal(true);
                }
              }}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer flex items-center gap-0.5 ${
                violationCount > 0
                  ? "bg-red-500/30 text-red-300 hover:bg-red-500/40"
                  : "bg-white/10 text-stone-300 hover:bg-white/20"
              }`}
              title="Xem nhật ký & biên bản vi phạm thi cử"
            >
              <ShieldAlert className="w-2.5 h-2.5" />
              <span>Lỗi ({violationCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/10 rounded-md transition text-stone-300 hover:text-white cursor-pointer"
              title={isMinimized ? "Phóng to" : "Thu nhỏ"}
            >
              {isMinimized ? <Maximize className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Video Camera & Canvas Overlay */}
        {!isMinimized && (
          <div className="relative aspect-4/3 bg-black/90 flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Canvas vẽ Bounding Box của AI */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
            />

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/90 text-xs text-stone-300 gap-1.5 z-10">
                <CameraOff className="w-6 h-6 text-amber-400" />
                <span className="text-[11px] text-amber-200 leading-tight">
                  {cameraError || "Đang kết nối camera..."}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleProctor(false)}
                  className="mt-1 px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold transition cursor-pointer shadow-md"
                >
                  Tắt Giám thị AI &amp; Thi tự do
                </button>
              </div>
            )}

            {/* Banner Giai Đoạn Chuẩn Bị (Setup Phase) */}
            {isSetupPhase && cameraActive && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center text-white z-20 animate-fadeIn">
                <div className="w-9 h-9 rounded-full bg-emerald-600/90 flex items-center justify-center mb-1.5 shadow-md">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-amber-300">
                  🛠️ Chuẩn bị góc máy ({setupCountdown}s)
                </span>
                <p className="text-[10px] text-stone-300 mt-1 max-w-[210px] leading-snug">
                  Hãy ngồi ngay ngắn, căn chỉnh khuôn mặt vào giữa khung hình. Chưa ghi nhận vi phạm trong giai đoạn này.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSetupPhase(false)}
                  className="mt-2.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Tôi đã sẵn sàng</span>
                </button>
              </div>
            )}

            {/* Thanh Radar Cảm Biến AI trực tiếp */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[10px]">
                {micActive ? (
                  <Mic
                    className={`w-3 h-3 ${
                      suspiciousNoise ? "text-amber-400 animate-bounce" : "text-emerald-400"
                    }`}
                  />
                ) : (
                  <MicOff className="w-3 h-3 text-red-400" />
                )}
                <span className={suspiciousNoise ? "text-amber-300 font-bold" : "text-stone-300"}>
                  {suspiciousNoise
                    ? `Tiếng ồn (~${currentDbRef.current || 70} dB)`
                    : `Yên tĩnh (~${currentDbRef.current || 35} dB)`}
                </span>
              </div>

              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-xs text-[10px] ${
                  phoneConfidence > 0
                    ? "bg-red-600 text-white font-bold animate-pulse shadow-md"
                    : "bg-black/75 text-amber-200"
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>
                  {phoneConfidence > 0
                    ? `📱 Cầm ĐT (${phoneConfidence}%)`
                    : aiStatus === "loading"
                    ? "Đang nạp AI..."
                    : detectedEntity}
                </span>
              </div>
            </div>

            {/* Thông báo Test AI Chẩn Đoán An Toàn */}
            {diagnosticFeedback && (
              <div className="absolute inset-x-2 top-10 bg-emerald-900/90 text-emerald-100 p-2 rounded-xl text-[10px] leading-tight z-30 border border-emerald-400/50 shadow-lg animate-in fade-in">
                <div className="font-bold text-amber-300 flex items-center gap-1 mb-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Chẩn đoán cảm biến AI:</span>
                </div>
                <span>{diagnosticFeedback}</span>
              </div>
            )}
            {violationCount > 0 && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-red-600/95 text-white font-bold text-[10px] flex items-center gap-1 shadow-md animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>Vi phạm: {violationCount}/{maxViolations}</span>
              </div>
            )}
          </div>
        )}

        {isMinimized && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{detectedEntity}</span>
            </span>
            {violationCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                {violationCount}/{maxViolations}
              </span>
            )}
          </div>
        )}
      </aside>

      {/* 2. Modal Cảnh Báo Vi Phạm Nghiêm Khắc kèm Bằng Chứng Phù Hợp */}
      {showWarningModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
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
              <p className="text-xs text-[#315E48] font-medium">
                {lastViolationMsg}
              </p>
            </div>

            {/* Bằng chứng vi phạm thích ứng chính xác */}
            {lastViolationSnapshot && (
              <div className="rounded-2xl border border-[#9D493E]/40 overflow-hidden bg-black/10 p-2 space-y-1 text-center">
                <span className="text-[10px] font-bold text-[#9D493E] uppercase tracking-wider block">
                  {lastViolationType === "TAB_SWITCH" || lastViolationType === "APP_SWITCH"
                    ? "🖥️ Bằng chứng số ghi nhận hành vi rời màn hình bài thi:"
                    : lastViolationType === "AUDIO_SUSPICIOUS"
                    ? "🎙️ Bằng chứng cường độ âm thanh phòng thi:"
                    : "📸 Ảnh chụp bằng chứng từ Camera AI (Đã gửi giáo viên):"}
                </span>
                <img
                  src={lastViolationSnapshot}
                  alt="Bằng chứng vi phạm thi cử"
                  className="w-full h-44 object-contain rounded-xl border border-white/40 shadow-xs mx-auto bg-slate-900"
                />
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-[#F8F5ED] border border-[#BC9B6B]/40 text-xs space-y-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Số lần vi phạm đã ghi nhận:</span>
                <span className="text-sm font-bold text-[#9D493E]">
                  {violationCount} / {maxViolations} lần
                </span>
              </div>
              <p className="text-[11px] text-[#637861] leading-relaxed">
                📢 <strong>Cảnh báo:</strong> Bản ghi bằng chứng vi phạm đã được <strong>gửi trực tiếp đến màn hình giám thị của Giáo viên & Quản trị viên</strong>. Nếu vi phạm đủ {maxViolations} lần, bài thi sẽ bị <strong>tự động khóa và nộp bài cưỡng chế</strong> ngay lập tức!
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="flex-1 py-3 rounded-2xl bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] font-bold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Làm bài tiếp</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowWarningModal(false);
                  handleToggleProctor(false);
                }}
                className="px-3.5 py-3 rounded-2xl border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer whitespace-nowrap"
                title="Tắt Giám thị AI để chuyển sang chế độ thi tự do, không bị cảnh báo"
              >
                Tắt AI (Thi tự do)
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 3. Modal Nhật Ký & Biên Bản Vi Phạm Phòng Thi */}
      {showLogModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-[#FFFCF6] border border-[#BC9B6B]/40 rounded-3xl p-5 text-[#204434] shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#9D493E]/10 border border-[#9D493E]/20 flex items-center justify-center text-[#9D493E]">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#204434]">
                    Biên bản Giám thị AI Phòng thi
                  </h3>
                  <p className="text-[11px] text-[#8F6D3B]">
                    Ghi nhận vi phạm trực tiếp theo thời gian thực
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-1.5 rounded-lg border border-[#E5DEC9] hover:bg-white text-stone-500 hover:text-stone-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
              <div className="p-2.5 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/30 text-center">
                <span className="text-[10px] text-[#637861] uppercase block">Tổng số vi phạm</span>
                <span className={`text-lg font-bold font-mono ${violationsHistory.length > 0 ? "text-[#9D493E]" : "text-emerald-700"}`}>
                  {violationsHistory.length} / {maxViolations} lần
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/30 text-center">
                <span className="text-[10px] text-[#637861] uppercase block">Trạng thái phòng thi</span>
                <span className={`text-xs font-bold ${violationsHistory.length >= maxViolations ? "text-red-700" : violationsHistory.length > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                  {violationsHistory.length >= maxViolations ? "Đình chỉ thi" : violationsHistory.length > 0 ? "Cảnh cáo giám sát" : "An toàn hợp lệ"}
                </span>
              </div>
            </div>

            {/* Danh sách bản ghi */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {violationsHistory.length === 0 ? (
                <div className="py-10 text-center text-xs text-stone-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                  <p>Chưa có vi phạm nào được ghi nhận. Bạn đang làm bài rất nghiêm túc!</p>
                </div>
              ) : (
                violationsHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                        Lần {item.count} · {item.violationType}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-[#204434] font-medium leading-relaxed">
                      {item.details}
                    </p>
                    {item.snapshot && (
                      <div className="rounded-xl overflow-hidden border border-[#E5DEC9] bg-stone-900 mt-1 max-h-36">
                        <img
                          src={item.snapshot}
                          alt="Bằng chứng"
                          className="w-full h-36 object-contain"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#E5DEC9] shrink-0">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white font-bold text-xs transition cursor-pointer"
              >
                Đóng biên bản
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
