"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Flame, Users, Moon } from "lucide-react";

interface VirtualStudyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
}

export default function VirtualStudyRoomModal({
  isOpen,
  onClose,
  studentName = "Bạn",
}: VirtualStudyRoomModalProps) {
  // Pomodoro timer: 25 phút (1500 giây)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundMode, setSoundMode] = useState<"rain" | "guqin" | "temple" | "mute">("rain");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Danh sách các "Đồng môn" ảo khắp cả nước đang cùng bật đèn học im lặng
  const [fellowStudents, setFellowStudents] = useState([
    { name: "Minh Anh (Hà Nội)", hsk: "HSK 4", minutes: 85, avatar: "🏮" },
    { name: "Vương Tuấn (TP.HCM)", hsk: "HSK 2", minutes: 45, avatar: "📜" },
    { name: "Khánh Linh (Đà Nẵng)", hsk: "HSK 5", minutes: 120, avatar: "🎋" },
    { name: "Quốc Huy (Hải Phòng)", hsk: "HSK 3", minutes: 30, avatar: "🍵" },
    { name: "Thanh Trúc (Cần Thơ)", hsk: "HSK 1", minutes: 60, avatar: "🕯️" },
    { name: "Hải Đăng (Huế)", hsk: "HSK 6", minutes: 110, avatar: "🖌️" },
  ]);

  // Pomodoro count down
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  // Audio synthezier đơn giản tạo tiếng mưa rả rích / thiền định bằng Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  const toggleSound = () => {
    if (isAudioPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      setIsAudioPlaying(false);
    } else {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }

        // Tạo tiếng mưa nhẹ (Pink Noise Generator)
        const bufferSize = audioCtxRef.current.sampleRate * 2;
        const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2) * 0.035; // Âm lượng dịu êm
        }

        const whiteNoise = audioCtxRef.current.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.connect(audioCtxRef.current.destination);
        whiteNoise.start(0);
        noiseNodeRef.current = whiteNoise;
        setIsAudioPlaying(true);
      } catch (e) {
        setIsAudioPlaying(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#141C18] text-[#F3EFE6] rounded-3xl shadow-2xl border-2 border-[#BC9B6B]/60 overflow-hidden">
        {/* Header Cổ Phong */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0E1512] border-b border-[#BC9B6B]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center font-serif text-xl font-bold shadow-xs">
              斋
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#D4AF37] flex items-center gap-2">
                <span>Vân Tự Tập Thất · Phòng Tự Học Ảo Cổ Phong</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-mono">
                  云自习室 · 7 sĩ tử đang học
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Thư phòng tĩnh lặng, cùng hàng ngàn đồng môn thắp đèn khổ luyện thi đỗ Trạng nguyên
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (audioCtxRef.current) audioCtxRef.current.suspend();
              setIsAudioPlaying(false);
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung thư phòng */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CỘT 1 & 2: KHÔNG GIAN HỌC CHÍNH VỚI ĐỒNG HỒ CÁT POMODORO */}
          <div className="md:col-span-2 space-y-6 flex flex-col items-center justify-center p-8 rounded-3xl bg-[#1A2420] border border-[#BC9B6B]/30 relative overflow-hidden">
            {/* Hiệu ứng trăng khuyết & mây mờ thủy mặc */}
            <div className="absolute top-4 right-5 text-4xl opacity-20 select-none">
              🌙
            </div>

            <div className="text-center space-y-1">
              <span className="text-xs font-serif uppercase tracking-widest text-[#BC9B6B]">
                Thời Gian Tĩnh Tâm Khổ Luyện (Pomodoro)
              </span>
              <div className="font-mono font-bold text-6xl text-[#D4AF37] tracking-wider py-2">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <p className="text-xs text-stone-400 italic">
                {isActive ? "Đèn thư phòng đang sáng... Chúc bạn tập trung cao độ!" : "Bấm nút bắt đầu để cùng đồng môn thắp đèn học"}
              </p>
            </div>

            {/* Các nút bấm điều khiển */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="px-6 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#c49f2b] text-[#141C18] font-bold text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isActive ? "Tạm dừng" : "Bắt đầu 25 phút"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsActive(false);
                  setSecondsLeft(25 * 60);
                }}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-300 transition cursor-pointer"
                title="Làm mới lại đồng hồ 25 phút"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleSound}
                className={`px-4 py-3 rounded-2xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isAudioPlaying
                    ? "bg-emerald-900/60 border-emerald-500 text-emerald-300"
                    : "bg-white/5 border-white/15 text-stone-300 hover:bg-white/10"
                }`}
                title="Bật/tắt âm thanh thư phòng (Tiếng mưa trúc / Cổ cầm)"
              >
                {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{isAudioPlaying ? "Đang bật mưa hiên trúc" : "Bật tiếng mưa trúc"}</span>
              </button>
            </div>

            {/* Bàn học của chính bạn */}
            <div className="w-full pt-4 border-t border-[#BC9B6B]/20 flex items-center justify-between text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏮</span>
                <div>
                  <div className="font-serif font-bold text-white">{studentName} (Bàn của bạn)</div>
                  <div className="text-[10px] text-emerald-400">Đang bật đèn học</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-stone-400">Mục tiêu hôm nay</div>
                <div className="font-bold text-[#D4AF37]">4 hiệp Pomodoro (100 phút)</div>
              </div>
            </div>
          </div>

          {/* CỘT 3: DANH SÁCH ĐỒNG MÔN ĐANG CÙNG HỌC IM LẶNG */}
          <div className="space-y-3 flex flex-col justify-between p-5 rounded-3xl bg-[#1A2420] border border-[#BC9B6B]/30">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
                <h4 className="font-serif font-bold text-xs text-[#D4AF37] flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>Đồng môn cùng thắp đèn</span>
                </h4>
                <span className="text-[10px] text-stone-400">Không camera</span>
              </div>

              <div className="space-y-2.5 mt-3 max-h-72 overflow-y-auto pr-1">
                {fellowStudents.map((st, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{st.avatar}</span>
                      <div>
                        <div className="font-serif font-bold text-white line-clamp-1">{st.name}</div>
                        <div className="text-[10px] text-[#BC9B6B]">{st.hsk}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-emerald-400 font-mono font-bold">
                        Đã học {st.minutes}p
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 ml-auto mt-1 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-[#BC9B6B]/20 text-[11px] text-stone-400 leading-relaxed text-center">
              💡 <em>&quot;Ngồi giữa muôn vàn đốm đèn học, bạn sẽ không còn thấy cô đơn một mình giữa đêm khuya nữa.&quot;</em>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
