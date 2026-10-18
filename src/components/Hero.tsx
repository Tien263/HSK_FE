"use client";

import Link from "next/link";
import { ArrowDown, Sparkles, LogIn, Compass } from "lucide-react";

export default function Hero() {
  const scrollToFeatures = () => {
    const el = document.getElementById("hsk-levels");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogin = () => {
    alert("Chào mừng em đến với không gian học tập của lớp cô Ning Ning! Hãy nhập tài khoản cô đã cấp để vào phòng luyện tập.");
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-88px)] flex flex-col justify-between overflow-hidden">
      {/* Submerged Background Video covering the entire 100vh Screen (PRESERVED 100%) */}
      <div className="absolute -top-24 inset-0 w-full h-[120%] overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-right lg:object-center opacity-70 lg:opacity-80 scale-105"
        >
          <source src="/main-background.mp4" type="video/mp4" />
        </video>

        {/* Multi-directional organic gradient overlays:
            - Left: Deep dark forest green to ensure 100% crisp typography readability
            - Bottom: Soft fade into deep green
            - Top: Subtle vignette behind navbar
        */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061609] via-[#061609]/80 sm:via-[#061609]/50 to-transparent/30" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#061609] via-[#061609]/80 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#061609]/90 via-[#061609]/30 to-transparent" />
      </div>

      {/* Hero Content Centered Vertically */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 my-auto pt-10 pb-8 w-full">
        <div className="max-w-2xl lg:max-w-3xl">
          {/* Dòng nhỏ: Không gian học tập riêng của lớp cô Ning Ning */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-xs font-medium text-[#c3dc4e] mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#c3dc4e]" />
            <span>Không gian học tập riêng của lớp cô Ning Ning</span>
          </div>

          {/* Tiêu đề: Ôn đúng bài đã học, luyện đúng chuẩn HSK 3.0 */}
          <h1 className="text-3xl sm:text-5xl lg:text-[3.65rem] font-bold text-white tracking-tight leading-[1.15] mb-6">
            Ôn đúng bài đã học,{" "}
            <span className="block font-extrabold text-white">
              luyện đúng chuẩn HSK 3.0
            </span>
          </h1>

          {/* Phụ đề: Cô giao bài, em làm bài, hệ thống chấm điểm và theo dõi tiến độ. Từ HSK 1 đến HSK 9, tất cả nằm trong một nơi. */}
          <p className="text-[#9cb396] text-base sm:text-lg leading-relaxed max-w-2xl mb-10 font-normal">
            Cô giao bài, em làm bài, hệ thống chấm điểm và theo dõi tiến độ. Từ HSK 1 đến HSK 9, tất
            cả nằm trong một nơi.
          </p>

          {/* Nút: Đăng nhập để vào học | Khám phá tính năng */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleLogin}
              className="px-8 py-4 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-sm sm:text-base hover:bg-[#b3cb40] transition shadow-2xl shadow-lime-950/40 cursor-pointer flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Đăng nhập để vào học</span>
            </button>

            <button
              onClick={scrollToFeatures}
              className="px-8 py-4 rounded-xl border border-white/25 text-white font-medium text-sm sm:text-base hover:bg-white/10 hover:border-white/40 transition backdrop-blur-md cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#c3dc4e]" />
              <span>Khám phá tính năng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator pointing to Landing Page 2 (Các cấp độ HSK & Tính năng) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-6 w-full flex items-center justify-between text-xs text-[#9cb396]">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#c3dc4e] animate-pulse" />
          <span>Hệ thống học tập nội bộ 2026 · Cập nhật chuẩn HSK 3.0 (9 cấp độ)</span>
        </div>

        <button
          onClick={scrollToFeatures}
          className="flex items-center gap-2 text-[#9cb396] hover:text-white transition cursor-pointer group"
        >
          <span className="hidden sm:inline">Chọn cấp độ HSK 3.0 của em</span>
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#c3dc4e] group-hover:text-[#c3dc4e] transition animate-bounce">
            <ArrowDown className="w-4 h-4 stroke-[1.5]" />
          </div>
        </button>
      </div>
    </section>
  );
}
