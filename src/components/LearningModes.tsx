"use client";

import Link from "next/link";
import Image from "next/image";

export default function LearningModes() {
  return (
    <section className="py-12 sm:py-16 px-6 max-w-6xl mx-auto relative z-10">
      {/* Section Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="w-5 h-5 rounded-xs bg-[#a8383b] text-white flex items-center justify-center text-[10px] font-serif font-bold">
            印
          </span>
          <span className="text-[10px] tracking-widest font-serif text-[#a8383b] uppercase font-bold">
            TWO LEARNING MODES
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#173d2d] tracking-tight">
          Hai hình thức học linh hoạt
        </h2>
        <p className="text-xs sm:text-sm text-[#44554a] mt-1.5 font-sans max-w-xl">
          Lựa chọn phương thức phù hợp với mục tiêu và thời gian học của bạn.
        </p>
      </div>

      {/* Main Container with User's Master Painted Background */}
      <div className="relative rounded-[32px] overflow-hidden border border-[#ded5c2] shadow-sm bg-[#faf6ed]">
        {/* Desktop / Tablet Background Image */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 hidden lg:block">
          <Image
            src="/theme/learning-modes-master-bg.jpg"
            alt="Tranh thủy mặc trà đạo và học tập"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Content Overlay Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[380px] lg:min-h-[420px] p-6 sm:p-8 lg:p-6 items-center">
          {/* Left Column (Covers the Tea Desk & Moon Window) */}
          <div className="lg:col-span-5 hidden lg:flex flex-col justify-end p-6 h-full pointer-events-none">
            <div className="bg-[#f7efe2]/80 backdrop-blur-xs p-3.5 rounded-2xl border border-[#d8cdb8]/60 inline-block self-start shadow-2xs">
              <span className="text-[11px] font-serif font-semibold text-[#173d2d]">
                🍵 Thư phòng trà đạo & Hán ngữ
              </span>
            </div>
          </div>

          {/* Right Column: 2 Cards perfectly aligned over the pre-painted frames */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 lg:pr-3">
            {/* Frame 1: Tự học chủ động */}
            <div className="bg-[#faf6ed]/90 lg:bg-[#f7efe2]/60 lg:backdrop-blur-[1px] rounded-2xl p-6 sm:p-7 border border-[#d8cdb8] flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-[#1a3d2f]/40 transition duration-200">
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#ede6d8] flex items-center justify-center text-[#173d2d] mb-4 text-base font-bold shadow-2xs">
                  💻
                </div>
                <h3 className="font-serif font-bold text-lg text-[#173d2d] mb-3">
                  Tự học chủ động
                </h3>
                <ul className="text-xs text-[#2b3e32] space-y-2.5 mb-6 font-sans">
                  <li className="flex items-start gap-2">
                    <span className="text-[#1a3d2f] font-bold text-sm">✓</span>
                    <span className="font-medium">Học theo nhịp riêng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1a3d2f] font-bold text-sm">✓</span>
                    <span className="font-medium">Có lộ trình đề xuất</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1a3d2f] font-bold text-sm">✓</span>
                    <span className="font-medium">Hệ thống bài tập đa dạng</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/s/home"
                className="w-full py-2.5 px-4 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition shadow-xs flex items-center justify-between group"
              >
                <span>Bắt đầu tự học</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Frame 2: Học cùng giáo viên */}
            <div className="bg-[#faf6ed]/90 lg:bg-[#f7efe2]/60 lg:backdrop-blur-[1px] rounded-2xl p-6 sm:p-7 border border-[#d8cdb8] flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-[#1a3d2f]/40 transition duration-200">
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#ede6d8] flex items-center justify-center text-[#173d2d] mb-4 text-base font-bold shadow-2xs">
                  👥
                </div>
                <h3 className="font-serif font-bold text-lg text-[#173d2d] mb-3">
                  Học cùng giáo viên
                </h3>
                <ul className="text-xs text-[#2b3e32] space-y-2.5 mb-6 font-sans">
                  <li className="flex items-start gap-2">
                    <span className="text-[#1a3d2f] font-bold text-sm">✓</span>
                    <span className="font-medium">Tham gia lớp học với giáo viên</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1a3d2f] font-bold text-sm">✓</span>
                    <span className="font-medium">Nhận bài được giao</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1a3d2f] font-bold text-sm">✓</span>
                    <span className="font-medium">Có phản hồi và theo dõi tiến độ</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/t/dashboard"
                className="w-full py-2.5 px-4 rounded-xl bg-[#a8383b] text-white text-xs font-bold hover:bg-[#8c2e31] transition shadow-xs flex items-center justify-between group"
              >
                <span>Lớp cô Ning Ning</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
