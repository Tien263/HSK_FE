"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Compass, Volume2, VolumeX, Play, Pause, Sparkles } from "lucide-react";

export default function Hero() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="relative min-h-[96vh] lg:min-h-screen flex items-center justify-start overflow-hidden">
      {/* Dynamic Ambient Background Video */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="/sample-design.jpg"
          className="w-full h-full object-cover object-right md:object-center brightness-[0.88] contrast-[1.08] scale-[1.02]"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Sophisticated Multilayer Overlays for Crystal Clear Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070a16]/95 via-[#070a16]/75 md:via-[#070a16]/50 to-transparent/40" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0b0e1b] via-[#0b0e1b]/80 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#070a16]/85 to-transparent" />
      </div>

      {/* Content Container (Bố cục bên trái bám sát mẫu thiết kế Á Đông) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 pt-32 pb-20 flex flex-col justify-center">
        <div className="max-w-2xl">
          {/* Subtitle Badge with Mountain Icon & Chinese motto */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#12172f]/85 backdrop-blur-md border border-amber-400/30 text-amber-200 text-xs md:text-sm font-medium mb-6 shadow-lg shadow-black/30">
            <span className="font-serif text-amber-300 font-bold text-base">山</span>
            <span className="tracking-wider uppercase text-[11px] md:text-xs text-amber-200 font-mono">
              千里之行 • CHINH PHỤC HÁN NGỮ HSK 1 - 6
            </span>
          </div>

          {/* Giant Display Title - Bold High-Contrast Serif */}
          <h1 className="text-5xl sm:text-7xl lg:text-[6.8rem] font-serif font-black text-white tracking-tight leading-[0.98] drop-shadow-2xl uppercase mb-6">
            CHINH PHỤC
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 text-3xl sm:text-5xl lg:text-5xl font-sans font-bold tracking-tight mt-3 normal-case drop-shadow">
              Hán Tự & Kỳ Thi HSK Chuẩn
            </span>
          </h1>

          {/* Subtitle Paragraph with enhanced contrast */}
          <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-xl mb-10 drop-shadow-md font-normal">
            Học từ vựng thông minh qua thẻ Flashcard ghi nhớ sâu, luyện phản xạ nghe với giọng đọc chuẩn
            Bắc Kinh và thi thử trực tuyến với hệ thống đề thi Hanban chấm điểm tự động.
          </p>

          {/* Call to Actions (Nút bấm trắng tối giản bám sát mẫu) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="#levels"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-md bg-white text-slate-950 font-semibold text-base hover:bg-amber-300 hover:shadow-amber-400/20 hover:scale-[1.02] transition-all duration-200 shadow-xl shadow-black/40 group"
            >
              <span>Bắt đầu hành trình</span>
              <span className="group-hover:translate-x-1.5 transition-transform font-mono text-sm">
                ►
              </span>
            </Link>

            <Link
              href="#demo-flashcard"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-md bg-[#101529]/80 text-white font-medium text-base border border-white/20 backdrop-blur-md hover:bg-white/15 hover:border-amber-400/40 transition duration-200 shadow-lg"
            >
              <Compass className="w-5 h-5 text-amber-400" />
              <span>Trải nghiệm Flashcard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Ambient Video Control Badge (Góc phải dưới màn hình) */}
      <div className="absolute right-6 lg:right-16 bottom-16 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs text-slate-300">
        <button
          onClick={togglePlay}
          className="p-1 hover:text-amber-300 transition"
          title={isPlaying ? "Tạm dừng video nền" : "Phát tiếp video nền"}
          aria-label="Toggle Play"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <div className="w-[1px] h-3 bg-white/20" />
        <button
          onClick={toggleMute}
          className="p-1 hover:text-amber-300 transition"
          title={isMuted ? "Bật âm thanh video" : "Tắt âm thanh video"}
          aria-label="Toggle Mute"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <span className="text-[10px] text-slate-400 font-mono tracking-wider ml-1">
          HÌNH NỀN ĐỘNG
        </span>
      </div>
    </section>
  );
}
