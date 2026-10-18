"use client";

import Image from "next/image";
import { Sparkles, ArrowRight, Clock, Award, Headphones } from "lucide-react";

export default function SpecialExamBanner() {
  return (
    <section id="exams" className="py-14 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="relative rounded-[2.5rem] bg-[#1a3328] text-white overflow-hidden shadow-2xl">
        {/* Orange Floral Decoration in Bottom Right (exact Pomaii style) */}
        <div className="absolute -right-8 -bottom-10 w-48 h-48 opacity-40 pointer-events-none select-none z-10">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 100C120 40 180 60 160 100C180 140 120 160 100 100Z"
              fill="#f97316"
              fillOpacity="0.8"
            />
            <path
              d="M100 100C60 60 40 120 100 140C140 160 120 80 100 100Z"
              fill="#fb923c"
              fillOpacity="0.6"
            />
            <circle cx="100" cy="100" r="18" fill="#fdba74" />
          </svg>
        </div>

        <div className="grid lg:grid-cols-12 items-center">
          {/* Left Panoramic Image (The Great Wall at golden sunrise) */}
          <div className="lg:col-span-5 relative h-72 lg:h-[440px] w-full overflow-hidden">
            <Image
              src="/hsk-images/exam-banner.jpg"
              alt="Vạn Lý Trường Thành bình minh rực rỡ"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            {/* Soft organic gradient blend */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-transparent to-[#1a3328]" />
          </div>

          {/* Right Text Content */}
          <div className="relative z-10 lg:col-span-7 p-8 sm:p-12 lg:p-16">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-amber-300 uppercase font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PHÒNG THI ONLINE MIỄN PHÍ</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              Bắt Đầu Làm Bài Thi Thử HSK Hôm Nay
            </h2>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-xl mb-8 font-normal">
              Trải nghiệm áp lực thi thật với hệ thống đếm ngược tự động, file audio phát âm chuẩn giọng
              Bắc Kinh và nhận kết quả tức thì cùng phân tích lỗi sai chi tiết.
            </p>

            {/* Quick feature bullets */}
            <div className="grid grid-cols-3 gap-4 mb-8 text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Bấm giờ chuẩn thi</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Audio chất lượng cao</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Chấm điểm tức thì</span>
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              onClick={() =>
                alert("Hệ thống đề thi thử HSK đang sẵn sàng kết nối trực tiếp vào giao diện thi thử!")
              }
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#e86a24] text-white font-semibold text-base shadow-xl shadow-orange-950/40 hover:bg-[#d45a16] hover:scale-[1.02] transition-all duration-200"
            >
              <span>Vào phòng thi ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
