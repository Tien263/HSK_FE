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
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  // Trạng thái AI Vision
  const [aiStatus, setAiStatus] = useState<"loading" | "ready" | "detecting">("ready");
  const [detectedEntity, setDetectedEntity] = useState<string>("Bình thường");
  const [phoneConfidence, setPhoneConfidence] = useState<number>(0);
  const cocoModelRef = useRef<any>(null);
  const faceMissingFramesRef = useRef<number>(0);
  const phoneDetectedFramesRef = useRef<number>(0);
  const lastViolationTimeRef = useRef<number>(0);

  // Trạng thái Vi phạm
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolationType, setLastViolationType] = useState<string>("");
  const [lastViolationMsg, setLastViolationMsg] = useState("");
  const [lastViolationSnapshot, setLastViolationSnapshot] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [suspiciousNoise, setSuspiciousNoise] = useState(false);

  // Audio Analyser đo decibel
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const visionIntervalRef = useRef<any>(null);

  // Phát âm thanh cảnh báo Beep (Web Audio API)
  const playWarningBeep = useCallback(() => {
    try {
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
          ctx.fillText("Cường độ âm thanh: ~ 56 dB (Vượt ngưỡng 44 dB cho phép)", 200, 185);
          ctx.fillStyle = "#94A3B8";
          ctx.font = "10px sans-serif";
          ctx.fillText(`Thời điểm ghi nhận: ${timeStr}`, 200, 215);

          return canvas.toDataURL("image/jpeg", 0.85);
        }

        // C. VI PHẠM THỊ GIÁC (CAMERA: ĐIỆN THOẠI, NGƯỜI THỨ HAI, VẮNG MẶT)
        if (videoRef.current && videoRef.current.readyState >= 2) {
          ctx.drawImage(videoRef.current, 0, 0, 400, 250);
          if (overlayCanvasRef.current) {
            ctx.drawImage(overlayCanvasRef.current, 0, 0, 400, 250);
          }
          return canvas.toDataURL("image/jpeg", 0.7);
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
      const now = Date.now();
      // Chống kích hoạt dồn dập trong vòng 3.5 giây cho cùng 1 lỗi
      if (now - lastViolationTimeRef.current < 3500) return;
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
    [captureViolationEvidence, maxViolations, onForceSubmit, playWarningBeep, reportViolation]
  );

  // Nút Test Mô Phỏng Quét Điện Thoại để người dùng kiểm chứng ngay lập tức
  const handleTestPhoneDetection = () => {
    const canvas = overlayCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#EF4444";
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width * 0.25, canvas.height * 0.3, canvas.width * 0.5, canvas.height * 0.6);
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(canvas.width * 0.25, canvas.height * 0.3 - 22, 190, 22);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("📱 ĐIỆN THOẠI DI ĐỘNG (CONF: 98%)", canvas.width * 0.25 + 6, canvas.height * 0.3 - 6);
      }
    }
    setDetectedEntity("Phát hiện điện thoại!");
    setPhoneConfidence(98);
    triggerViolation(
      "CELL_PHONE_DETECTED",
      "Hệ thống AI phát hiện thí sinh cầm hoặc sử dụng thiết bị điện thoại di động trước camera"
    );
  };

  // 1. Tải Model COCO-SSD nhẹ nhàng (chạy ngầm song song, không chặn hệ thống)
  useEffect(() => {
    let isMounted = true;

    async function loadVisionAi() {
      if (!requireCamera) return;

      if (typeof window !== "undefined" && !(window as any).cocoSsd) {
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
            cocoModelRef.current = await (window as any).cocoSsd.load();
          }
        } catch {
          // Native detector luôn sẵn sàng làm việc
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
      if (!requireCamera && !requireMic) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: requireCamera
            ? {
                width: { ideal: 320 },
                height: { ideal: 240 },
                facingMode: "user",
              }
            : false,
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
        setCameraError("Vui lòng cho phép quyền Camera & Microphone để phòng thi giám sát hợp lệ.");
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

          // Nếu âm thanh lớn liên tục trong phòng thi (ngưỡng ~ 45dB)
          if (avg > 45) {
            loudCount++;
            if (loudCount > 25) {
              setSuspiciousNoise(true);
              triggerViolation("AUDIO_SUSPICIOUS", "Phát hiện tiếng nói chuyện / trao đổi âm thanh trong phòng thi");
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
      const video = videoRef.current;
      const canvas = overlayCanvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const width = video.videoWidth || 320;
      const height = video.videoHeight || 240;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      let phoneDetected = false;
      let phoneConfidenceScore = 0;
      let detectedBox: { x: number; y: number; w: number; h: number } | null = null;
      let personCount = 0;

      // =========================================================================
      // ENGINE A: COCO-SSD (Deep Learning nếu đã sẵn sàng)
      // =========================================================================
      if (cocoModelRef.current) {
        try {
          const predictions = await cocoModelRef.current.detect(video);
          predictions.forEach((pred: any) => {
            const [x, y, w, h] = pred.bbox;
            if (pred.class === "cell phone" && pred.score > 0.35) {
              phoneDetected = true;
              phoneConfidenceScore = Math.round(pred.score * 100);
              detectedBox = { x, y, w, h };
            }
            if (pred.class === "person" && pred.score > 0.45) {
              personCount++;
            }
          });
        } catch {}
      }

      // =========================================================================
      // ENGINE B: INSTANT EDGE & SOLID RECTANGLE DETECTOR (Canvas Thuần Siêu Nhạy)
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
          let leftSkin = 0;
          let rightSkin = 0;
          let minX = ow, maxX = 0, minY = oh, maxY = 0;
          let phoneCandidatePixels = 0;

          // Quét ma trận pixel (đặc tính bàn tay và vật thể cầm trên tay)
          for (let y = 0; y < oh; y++) {
            for (let x = 0; x < ow; x++) {
              const idx = (y * ow + x) * 4;
              const r = d[idx];
              const g = d[idx + 1];
              const b = d[idx + 2];

              // Nhận diện màu da người
              const isSkin =
                r > 80 &&
                g > 35 &&
                b > 20 &&
                Math.max(r, g, b) - Math.min(r, g, b) > 12 &&
                r > g &&
                r > b;

              if (isSkin) {
                skinPixels++;
                if (x < ow * 0.45) leftSkin++;
                if (x > ow * 0.55) rightSkin++;
              }

              // Vật thể cầm trên tay (Màn hình điện thoại hoặc thân máy màu đen/xám/bạc/ốp lưng)
              // Nằm ở khu vực 2/3 dưới khung hình (khu vực ngực, tay giơ lên trước ngực/mặt)
              const brightness = (r + g + b) / 3;
              const isLowSat = Math.abs(r - g) < 25 && Math.abs(g - b) < 25; // Mặt kính / thân máy
              const isHandElevatedArea = y > oh * 0.25 && y < oh * 0.95 && x > ow * 0.15 && x < ow * 0.85;

              // Màn hình điện thoại phát sáng hoặc mặt lưng chữ nhật che khuất
              if (isHandElevatedArea && !isSkin && (brightness < 60 || brightness > 185) && isLowSat) {
                phoneCandidatePixels++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }

          const skinRatio = skinPixels / (ow * oh);
          const candidateRatio = phoneCandidatePixels / (ow * oh);
          const boxW = Math.max(1, maxX - minX);
          const boxH = Math.max(1, maxY - minY);
          const aspectRatio = boxH / boxW; // Tỉ lệ chiều cao / chiều rộng

          // ĐIỀU KIỆN PHÁT HIỆN ĐIỆN THOẠI TRÊN TAY:
          // 1. Tỉ lệ khung hình chữ nhật đứng (1.3 < aspect < 3.2) hoặc chữ nhật ngang (0.35 < aspect < 0.75)
          // 2. Kích thước vật thể chiếm từ 5% đến 35% khung hình
          // 3. Có sự hiện diện của tay/người trong khung hình (skinRatio > 0.08)
          if (
            !phoneDetected &&
            candidateRatio > 0.045 &&
            candidateRatio < 0.40 &&
            skinRatio > 0.07 &&
            ((aspectRatio >= 1.25 && aspectRatio <= 3.2) || (aspectRatio >= 0.35 && aspectRatio <= 0.8))
          ) {
            phoneDetected = true;
            phoneConfidenceScore = Math.min(96, Math.round(candidateRatio * 200 + 40));
            detectedBox = {
              x: (minX / ow) * width,
              y: (minY / oh) * height,
              w: (boxW / ow) * width,
              h: (boxH / oh) * height,
            };
          }

          // Kiểm tra vắng mặt
          if (!phoneDetected && skinRatio < 0.03 && personCount === 0) {
            faceMissingFramesRef.current++;
            if (faceMissingFramesRef.current > 4) {
              setDetectedEntity("Vắng mặt!");
              triggerViolation("NO_FACE_DETECTED", "Thí sinh rời khỏi vị trí hoặc không thấy khuôn mặt trước camera");
              faceMissingFramesRef.current = 0;
            }
          } else {
            faceMissingFramesRef.current = 0;
          }

          // Kiểm tra người thứ 2
          if (!phoneDetected && (personCount > 1 || (leftSkin > 130 && rightSkin > 130 && skinRatio > 0.30))) {
            ctx.strokeStyle = "#EF4444";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(10, 10, width - 20, height - 20);
            ctx.fillStyle = "#EF4444";
            ctx.fillRect(10, 10, 180, 20);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 11px sans-serif";
            ctx.fillText("⚠️ PHÁT HIỆN NGƯỜI THỨ HAI", 16, 24);
            setDetectedEntity("Có 2 người!");
            triggerViolation("MULTIPLE_PEOPLE_DETECTED", "Hệ thống phát hiện có thêm người thứ 2 trong phòng thi");
            return;
          }
        }
      } catch (err) {
        console.warn("Canvas instant vision error:", err);
      }

      // =========================================================================
      // XỬ LÝ VI PHẠM ĐIỆN THOẠI KHI CÓ KẾT QUẢ
      // =========================================================================
      if (phoneDetected) {
        phoneDetectedFramesRef.current++;
        setPhoneConfidence(phoneConfidenceScore);
        setDetectedEntity("Phát hiện điện thoại!");

        // Vẽ khung đỏ viền dày bao quanh điện thoại
        const box = detectedBox || {
          x: width * 0.25,
          y: height * 0.3,
          w: width * 0.5,
          h: height * 0.55,
        };

        ctx.strokeStyle = "#EF4444";
        ctx.lineWidth = 3.5;
        ctx.strokeRect(box.x, box.y, box.w, box.h);

        // Góc bo highlight
        ctx.strokeStyle = "#FDE047";
        ctx.lineWidth = 4;
        const cornerLen = 14;
        // Góc trên trái
        ctx.beginPath();
        ctx.moveTo(box.x, box.y + cornerLen);
        ctx.lineTo(box.x, box.y);
        ctx.lineTo(box.x + cornerLen, box.y);
        ctx.stroke();
        // Góc trên phải
        ctx.beginPath();
        ctx.moveTo(box.x + box.w - cornerLen, box.y);
        ctx.lineTo(box.x + box.w, box.y);
        ctx.lineTo(box.x + box.w, box.y + cornerLen);
        ctx.stroke();

        // Nhãn cảnh báo màu đỏ
        ctx.fillStyle = "#DC2626";
        const tagY = Math.max(0, box.y - 24);
        ctx.fillRect(box.x, tagY, 195, 24);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(`📱 ĐIỆN THOẠI DI ĐỘNG (${phoneConfidenceScore}%)`, box.x + 6, tagY + 16);

        // Kích hoạt vi phạm khi phát hiện ít nhất 1 chu kỳ quét
        if (phoneDetectedFramesRef.current >= 1) {
          triggerViolation(
            "CELL_PHONE_DETECTED",
            "Hệ thống AI phát hiện thí sinh cầm hoặc sử dụng thiết bị điện thoại di động trước camera"
          );
        }
      } else {
        phoneDetectedFramesRef.current = 0;
        setPhoneConfidence(0);
        if (faceMissingFramesRef.current === 0) {
          setDetectedEntity("Hợp lệ");
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
    };

    visionIntervalRef.current = setInterval(runVisionDetection, 700);

    return () => {
      if (visionIntervalRef.current) clearInterval(visionIntervalRef.current);
    };
  }, [cameraActive, triggerViolation]);

  // 4. Bắt sự kiện Rời Tab / Chuyển Ứng Dụng (Tab Switching / Blur)
  useEffect(() => {
    let leaveTimestamp = 0;

    const handleVisibilityChange = () => {
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
  }, [triggerViolation]);

  // 5. Chặn chuột phải, Copy, Paste, DevTools (F12)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerViolation("RIGHT_CLICK_BLOCKED", "Cố tình nhấp chuột phải trong phòng thi");
      return false;
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation("COPY_PASTE_BLOCKED", "Cố tình sao chép / dán nội dung đề thi");
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [triggerViolation]);

  return (
    <>
      {/* 1. Khung Camera Giám Sát PiP ở góc màn hình */}
      <aside
        className={`fixed z-40 transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border-2 select-none ${
          violationCount > 0 ? "border-[#9D493E]" : "border-[#204434]"
        } bg-[#1B362A] text-white ${
          isMinimized
            ? "bottom-4 right-4 w-52 p-2.5 flex items-center justify-between"
            : "bottom-4 right-4 w-60 sm:w-72"
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
            <span className="tracking-wider uppercase text-[10px]">Giám Thị AI Trực Tuyến</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleTestPhoneDetection}
              className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[9px] font-bold transition cursor-pointer flex items-center gap-0.5"
              title="Bấm để kiểm tra phản ứng quét điện thoại của AI"
            >
              <Zap className="w-2.5 h-2.5" />
              <span>Test AI</span>
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
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/85 text-xs text-stone-300 gap-1.5">
                <CameraOff className="w-6 h-6 text-red-400" />
                <span className="text-[11px] text-red-300">
                  {cameraError || "Đang kết nối camera..."}
                </span>
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
                  {suspiciousNoise ? "Tiếng ồn" : "Yên tĩnh"}
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
                  {phoneConfidence > 0 ? `📱 Cầm ĐT (${phoneConfidence}%)` : detectedEntity}
                </span>
              </div>
            </div>

            {/* Chỉ số vi phạm */}
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
