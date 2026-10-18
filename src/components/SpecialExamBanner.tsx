"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Clock, Award, Headphones } from "lucide-react";

export default function SpecialExamBanner() {
  return (
    <section id="exams" className="py-14 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="relative rounded-[2.5rem] bg-[#1a3328] text-white overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-12 items-center">
          {/* Left Scenic Image with Organic Curved Shape */}
          <div className="lg:col-span-5 relative h-72 lg:h-[420px] w-full overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1000&q=80"
              alt="Phong cảnh Hán ngữ"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            {/* Soft gradient edge */}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-transparent to-[#1a3328]" />
          </div>

          {/* Right Text Content */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-amber-300 uppercase font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PHÒNG THI ONLINE MIỄN PHÍ</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              Bắt Đầu Làm Đề Thi Thử HSK Hôm Nay
            </h2>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-xl mb-8 font-normal">
              Trải nghiệm áp lực thi thật với hệ thống đếm ngược tự động, file audio phát âm chuẩn giọng
              Bắc Kinh và nhận kết quả tức thì cùng phân tích lỗi sai chi tiết.
            </p>

            {/* Quick feature bullets */}
            <div className="grid grid-cols-3 gap-4 mb-8 text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Bấm giờ chuẩn thi</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-amber-300" />
                <span>Audio chất lượng cao</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-300" />
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
