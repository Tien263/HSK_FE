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
  const [aiStatus, setAiStatus] = useState<"loading" | "ready" | "detecting">("loading");
  const [detectedEntity, setDetectedEntity] = useState<string>("Bình thường");
  const cocoModelRef = useRef<any>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const faceMissingFramesRef = useRef<number>(0);
  const lastViolationTimeRef = useRef<number>(0);

  // Trạng thái Vi phạm
  const [violationCount, setViolationCount] = useState(0);
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

  // Chụp ảnh snapshot webcam tại thời điểm vi phạm (dưới dạng base64 JPEG nhỏ gọn)
  const captureSnapshot = useCallback((): string | null => {
    if (!videoRef.current || videoRef.current.readyState < 2) return null;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      return canvas.toDataURL("image/jpeg", 0.6);
    } catch {
      return null;
    }
  }, []);

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
    (violationType: string, details: string) => {
      const now = Date.now();
      // Chống kích hoạt liên tiếp trong vòng 4 giây cho cùng 1 lỗi
      if (now - lastViolationTimeRef.current < 4000) return;
      lastViolationTimeRef.current = now;

      // Chụp ảnh bằng chứng tức thì
      const snapshot = captureSnapshot();
      setLastViolationSnapshot(snapshot);

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
    [captureSnapshot, maxViolations, onForceSubmit, playWarningBeep, reportViolation]
  );

  // 1. Tải Model COCO-SSD nhận diện thiết bị & người từ CDN hoặc Canvas Fallback
  useEffect(() => {
    let isMounted = true;

    async function loadVisionAi() {
      if (!requireCamera) return;

      // Thử nạp script TensorFlow và COCO-SSD nếu chưa có
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
              s.onerror = () => reject();
              document.body.appendChild(s);
            });

          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js");
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js");
        } catch {
          console.log("Dùng Canvas Native Vision Analyzer làm bộ dò trực tiếp.");
        }
      }

      if ((window as any).cocoSsd && isMounted) {
        try {
          const model = await (window as any).cocoSsd.load({ base: "mobilenet_v1" });
          if (isMounted) {
            cocoModelRef.current = model;
            setAiStatus("ready");
          }
        } catch {
          setAiStatus("ready");
        }
      } else {
        setAiStatus("ready");
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

          // Nếu âm thanh lớn liên tục trong phòng thi (nói chuyện hoặc nhắc bài: ngưỡng ~ 44dB)
          if (avg > 44) {
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

  // 3. Vòng lặp Computer Vision AI: Phân tích điện thoại, người thứ hai, vắng mặt
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

      // A. Nếu có model COCO-SSD: Nhận diện chính xác đối tượng
      if (cocoModelRef.current) {
        try {
          const predictions = await cocoModelRef.current.detect(video);
          let foundPhone = false;
          let personCount = 0;

          predictions.forEach((pred: any) => {
            const [x, y, w, h] = pred.bbox;

            // Phát hiện ĐIỆN THOẠI DI ĐỘNG (cell phone)
            if (pred.class === "cell phone" && pred.score > 0.40) {
              foundPhone = true;
              ctx.strokeStyle = "#EF4444";
              ctx.lineWidth = 3;
              ctx.strokeRect(x, y, w, h);
              ctx.fillStyle = "#EF4444";
              ctx.fillRect(x, Math.max(0, y - 20), 160, 20);
              ctx.fillStyle = "#FFFFFF";
              ctx.font = "bold 11px sans-serif";
              ctx.fillText("📱 ĐIỆN THOẠI DI ĐỘNG", x + 4, Math.max(14, y - 5));
            }

            // Đếm số lượng NGƯỜI (person)
            if (pred.class === "person" && pred.score > 0.50) {
              personCount++;
              ctx.strokeStyle = personCount > 1 ? "#EF4444" : "#10B981";
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y, w, h);
              ctx.fillStyle = personCount > 1 ? "#EF4444" : "#10B981";
              ctx.fillRect(x, Math.max(0, y - 18), 120, 18);
              ctx.fillStyle = "#FFFFFF";
              ctx.font = "bold 10px sans-serif";
              ctx.fillText(personCount > 1 ? "⚠️ NGƯỜI THỨ HAI" : "👤 Thí sinh", x + 4, Math.max(13, y - 5));
            }
          });

          // Xử lý vi phạm
          if (foundPhone) {
            setDetectedEntity("Phát hiện điện thoại!");
            triggerViolation("CELL_PHONE_DETECTED", "Hệ thống AI phát hiện thí sinh cầm hoặc sử dụng điện thoại di động trước camera");
            return;
          }

          if (personCount > 1) {
            setDetectedEntity("Có nhiều người!");
            triggerViolation("MULTIPLE_PEOPLE_DETECTED", "Hệ thống AI phát hiện có thêm người thứ 2 xuất hiện trong phòng thi");
            return;
          }

          if (personCount === 0) {
            faceMissingFramesRef.current++;
            if (faceMissingFramesRef.current > 4) {
              setDetectedEntity("Vắng mặt!");
              triggerViolation("NO_FACE_DETECTED", "Thí sinh rời khỏi vị trí hoặc không thấy khuôn mặt trước camera");
              faceMissingFramesRef.current = 0;
            }
          } else {
            faceMissingFramesRef.current = 0;
            setDetectedEntity("Hợp lệ");
          }
          return;
        } catch (e) {
          // Fallback sang Canvas Analyzer
        }
      }

      // B. NATIVE CANVAS ANALYZER (Bộ dò Canvas thuần - luôn hoạt động không cần mạng)
      try {
        const offscreen = document.createElement("canvas");
        offscreen.width = 80;
        offscreen.height = 60;
        const octx = offscreen.getContext("2d");
        if (!octx) return;
        octx.drawImage(video, 0, 0, 80, 60);
        const imgData = octx.getImageData(0, 0, 80, 60);
        const d = imgData.data;

        let skinPixels = 0;
        let brightPixels = 0;
        let leftSkin = 0;
        let rightSkin = 0;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const pixelIdx = i / 4;
          const x = pixelIdx % 80;

          // Dò tông màu da người cơ bản
          const isSkin =
            r > 95 &&
            g > 40 &&
            b > 20 &&
            Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
            Math.abs(r - g) > 15 &&
            r > g &&
            r > b;

          if (isSkin) {
            skinPixels++;
            if (x < 35) leftSkin++;
            if (x > 45) rightSkin++;
          }

          // Dò vật thể màn hình phát sáng vuông vắn (điện thoại dơ lên sát camera)
          const brightness = (r + g + b) / 3;
          if (brightness > 225 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
            brightPixels++;
          }
        }

        const skinRatio = skinPixels / (80 * 60);
        const brightRatio = brightPixels / (80 * 60);

        // 1. Phát hiện màn hình điện thoại rực sáng đưa lên trước ngực/mặt
        if (brightRatio > 0.12) {
          setDetectedEntity("Cầm điện thoại!");
          ctx.strokeStyle = "#EF4444";
          ctx.lineWidth = 3;
          ctx.strokeRect(width * 0.25, height * 0.35, width * 0.5, height * 0.5);
          ctx.fillStyle = "#EF4444";
          ctx.fillRect(width * 0.25, height * 0.35 - 20, 160, 20);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText("📱 PHÁT HIỆN THIẾT BỊ", width * 0.25 + 4, height * 0.35 - 5);
          triggerViolation("CELL_PHONE_DETECTED", "Phát hiện màn hình thiết bị di động / điện thoại trước camera");
          return;
        }

        // 2. Phát hiện 2 người (hai khối da tách rời 2 bên)
        if (leftSkin > 120 && rightSkin > 120 && skinRatio > 0.28) {
          setDetectedEntity("Phát hiện 2 người!");
          triggerViolation("MULTIPLE_PEOPLE_DETECTED", "Phát hiện có 2 người cùng xuất hiện trước camera");
          return;
        }

        // 3. Vắng mặt trước camera
        if (skinRatio < 0.03) {
          faceMissingFramesRef.current++;
          if (faceMissingFramesRef.current > 5) {
            setDetectedEntity("Vắng mặt!");
            triggerViolation("NO_FACE_DETECTED", "Thí sinh vắng mặt hoặc không nhìn vào màn hình thi cử");
            faceMissingFramesRef.current = 0;
          }
        } else {
          faceMissingFramesRef.current = 0;
          setDetectedEntity("Hợp lệ");
        }
      } catch (err) {
        console.warn("Canvas vision error:", err);
      }
    };

    visionIntervalRef.current = setInterval(runVisionDetection, 1200);

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
          `Thí sinh rời khỏi tab làm bài thi sang tab khác trong ${awaySeconds} giây`
        );
      }
    };

    const handleWindowBlur = () => {
      setTimeout(() => {
        if (!document.hasFocus() && !document.hidden) {
          triggerViolation("APP_SWITCH", "Thí sinh chuyển sang ứng dụng khác ngoài trình duyệt (Zalo/Word/ChatGPT...)");
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

  // 5. Chặn Chuột phải, Copy, Paste, Cut & Phím tắt DevTools/In ấn
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
      if (e.key === "F12") {
        e.preventDefault();
        triggerViolation("DEVTOOLS_ATTEMPT", "Cố tình nhấn F12 mở công cụ lập trình");
        return false;
      }
      if (
        e.ctrlKey &&
        (e.key === "u" ||
          e.key === "U" ||
          (e.shiftKey && ["I", "C", "J", "i", "c", "j"].includes(e.key)))
      ) {
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
            ? "bottom-4 right-4 w-48 p-2.5 flex items-center justify-between"
            : "bottom-4 right-4 w-56 sm:w-64"
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
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/10 rounded-md transition text-stone-300 hover:text-white cursor-pointer"
            title={isMinimized ? "Phóng to" : "Thu nhỏ"}
          >
            {isMinimized ? <Maximize className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
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

            {/* Chỉ báo trạng thái micro & AI status */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[10px]">
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

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[10px]">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span className="text-amber-200 font-medium">{detectedEntity}</span>
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

      {/* 2. Modal Cảnh Báo Vi Phạm Nghiêm Khắc kèm Ảnh Chụp Bằng Chứng */}
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

            {/* Ảnh chụp bằng chứng từ webcam */}
            {lastViolationSnapshot && (
              <div className="rounded-2xl border border-[#9D493E]/40 overflow-hidden bg-black/10 p-2 space-y-1 text-center">
                <span className="text-[10px] font-bold text-[#9D493E] uppercase tracking-wider block">
                  📸 Ảnh chụp bằng chứng từ Camera AI (Đã gửi giáo viên):
                </span>
                <img
                  src={lastViolationSnapshot}
                  alt="Bằng chứng vi phạm thi cử"
                  className="w-full h-36 object-cover rounded-xl border border-white/40 shadow-xs mx-auto"
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
                📢 <strong>Cảnh báo:</strong> Ảnh chụp bằng chứng, âm thanh và nhật ký vi phạm đã được <strong>gửi trực tiếp đến màn hình giám thị của Giáo viên</strong>. Nếu vi phạm đủ {maxViolations} lần, bài thi sẽ bị <strong>tự động khóa và nộp bài cưỡng chế</strong> ngay lập tức!
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
