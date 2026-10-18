"use client";

import Link from "next/link";
import { ArrowDown, Sparkles } from "lucide-react";

export default function Hero() {
  const scrollToCourses = () => {
    const el = document.getElementById("courses");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-88px)] flex flex-col justify-between overflow-hidden">
      {/* Submerged Background Video covering the entire 100vh Screen */}
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
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-xs font-medium text-[#c3dc4e] mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#c3dc4e]" />
            <span>Phương pháp đào tạo Hán ngữ chuẩn Hanban quốc tế</span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[3.75rem] font-bold text-white tracking-tight leading-[1.14] mb-6">
            Lộ trình đào tạo{" "}
            <span className="block">tiếng Trung cá nhân hóa</span>{" "}
            <span className="font-extrabold text-white">
              với cam kết đạt chuẩn HSK sau 3 tháng
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-[#9cb396] text-base sm:text-lg leading-relaxed max-w-2xl mb-10 font-normal">
            Thiết kế chương trình từ số 0 đến HSK 6, tối ưu thời gian học với phương pháp giải mã bộ
            thủ Hán tự và phản xạ đàm thoại trực tiếp cùng đội ngũ thạc sĩ Hán ngữ.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() =>
                alert("Chuyên viên tư vấn Huayu sẽ liên hệ xếp lịch kiểm tra trình độ miễn phí!")
              }
              className="px-8 py-4 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-sm sm:text-base hover:bg-[#b3cb40] transition shadow-2xl shadow-lime-950/40 cursor-pointer"
            >
              Tư vấn miễn phí
            </button>

            <button
              onClick={scrollToCourses}
              className="px-8 py-4 rounded-xl border border-white/25 text-white font-medium text-sm sm:text-base hover:bg-white/10 hover:border-white/40 transition backdrop-blur-md cursor-pointer flex items-center gap-2"
            >
              <span>Xem các khóa học</span>
              <ArrowDown className="w-4 h-4 text-[#c3dc4e]" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator pointing to Landing Page 2 (Courses) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-6 w-full flex items-center justify-between text-xs text-[#9cb396]">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#c3dc4e] animate-pulse" />
          <span>Tuyển sinh các lớp HSK 1 - HSK 6 tháng này</span>
        </div>

        <button
          onClick={scrollToCourses}
          className="flex items-center gap-2 text-[#9cb396] hover:text-white transition cursor-pointer group"
        >
          <span className="hidden sm:inline">Khám phá các khóa học</span>
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#c3dc4e] group-hover:text-[#c3dc4e] transition animate-bounce">
            <ArrowDown className="w-4 h-4 stroke-[1.5]" />
          </div>
        </button>
      </div>
    </section>
  );
}
