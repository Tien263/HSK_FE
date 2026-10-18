"use client";

import Link from "next/link";
import { ArrowRight, Search, Sparkles, MapPin, Calendar, Users, BookOpen } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full pt-4 pb-20 overflow-hidden">
      {/* Container with relative framing */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Main Hero Card Container with Rounded Framing and Video Background */}
        <div className="relative min-h-[580px] lg:min-h-[640px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/60 border border-slate-200/50">
          {/* Background Video from user folder (backgroud.mp4) */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/sample-design.jpg"
              className="w-full h-full object-cover object-center scale-105"
            >
              <source src="/main-background.mp4" type="video/mp4" />
            </video>

            {/* Organic Soft Wave Gradient & Mask (bám sát viền uốn lượn phong cách Pomaii) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#faf9f5]/95 via-[#faf9f5]/85 md:via-[#faf9f5]/65 to-transparent/10" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#faf9f5] via-[#faf9f5]/70 to-transparent" />
          </div>

          {/* Left Text Content */}
          <div className="relative z-10 max-w-2xl px-8 sm:px-14 lg:px-16 pt-16 sm:pt-20 pb-36">
            {/* Small uppercase category tag with leaf icon */}
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase mb-5 font-mono">
              <span>HÀNH TRÌNH CHINH PHỤC HÁN NGỮ</span>
              <span className="text-emerald-600">🌿</span>
            </div>

            {/* Giant Clean Modern Headline with Brush Swoosh */}
            <h1 className="text-4xl sm:text-6xl lg:text-[4rem] font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Khám Phá Hán Tự.
              <span className="block relative mt-1 text-slate-900">
                Chinh Phục HSK.
                {/* Organic hand-drawn orange arc line underline */}
                <svg
                  className="absolute -bottom-2.5 left-0 w-64 sm:w-80 h-3 text-[#e86a24]"
                  viewBox="0 0 280 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 9.5C65.5 3.5 190.5 1.5 277.5 7.5"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Sub-paragraph */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-lg mb-8 font-normal">
              Trang web học và ôn tập tiếng Trung trực quan, chuẩn khung quốc tế Hanban. Nắm vững
              5,000+ từ vựng, phản xạ nghe tự nhiên và tự tin đạt điểm tuyệt đối.
            </p>

            {/* Primary Orange Pill CTA Button */}
            <div className="flex items-center gap-4">
              <Link
                href="#levels"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#e86a24] text-white font-semibold text-base shadow-lg shadow-orange-500/30 hover:bg-[#d45a16] hover:shadow-orange-500/40 hover:scale-[1.02] transition-all duration-200"
              >
                <span>Bắt đầu học ngay</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Quick Search / Filter Bar (Pomaii style) */}
        <div className="relative z-20 -mt-14 max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-full p-2.5 sm:p-3 shadow-2xl shadow-slate-300/60 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
            {/* Field 1: Cấp độ */}
            <div className="flex items-center gap-3 px-6 py-2 w-full md:w-1/4 border-b md:border-b-0 md:border-r border-slate-100">
              <BookOpen className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                  Cấp độ học?
                </div>
                <div className="text-xs text-slate-500 font-medium">HSK 1 - HSK 6</div>
              </div>
            </div>

            {/* Field 2: Kỹ năng */}
            <div className="flex items-center gap-3 px-6 py-2 w-full md:w-1/4 border-b md:border-b-0 md:border-r border-slate-100">
              <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                  Kỹ năng chính
                </div>
                <div className="text-xs text-slate-500 font-medium">Từ vựng & Nghe</div>
              </div>
            </div>

            {/* Field 3: Mục tiêu */}
            <div className="flex items-center gap-3 px-6 py-2 w-full md:w-1/4 border-b md:border-b-0 md:border-r border-slate-100">
              <Users className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                  Mục tiêu
                </div>
                <div className="text-xs text-slate-500 font-medium">Thi đỗ chứng chỉ</div>
              </div>
            </div>

            {/* Action Search Button */}
            <div className="px-2 w-full md:w-auto">
              <Link
                href="#levels"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#183226] text-white font-semibold text-sm hover:bg-[#11241b] transition shadow-md shadow-emerald-950/20"
              >
                <span>Tìm lộ trình</span>
                <Search className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
