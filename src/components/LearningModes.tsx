"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Users } from "lucide-react";

export default function LearningModes() {
  return (
    <section className="py-8 px-6 max-w-6xl mx-auto relative z-10">
      <div className="bg-[#ede6d8] rounded-[36px] p-6 sm:p-10 lg:p-12 relative overflow-hidden border border-[#ded5c2] shadow-xs">
        {/* Subtle decorative birds & bamboo in top right corner of the container */}
        <div className="absolute top-4 right-6 text-xs text-[#6b8271]/50 pointer-events-none select-none hidden sm:block">
          <span>🎋 𓅂 𓅂</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Traditional Scholar Moon Window & Tea Desk */}
          <div className="lg:col-span-4 relative h-[240px] sm:h-[300px] rounded-2xl overflow-hidden flex items-center justify-center">
            <Image
              src="/theme/moon-window-table.png"
              alt="Không gian học tập truyền thống"
              fill
              className="object-contain object-center"
            />
          </div>

          {/* Right Column: Title + 2 Choice Cards */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            {/* Red Seal + Section Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-xs bg-[#991b1b] text-white flex items-center justify-center text-[10px] font-serif font-bold">
                  印
                </span>
                <span className="text-[10px] tracking-widest font-serif text-[#991b1b] uppercase font-bold">
                  TWO LEARNING MODES
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#173d2d] tracking-tight">
                Hai hình thức học linh hoạt
              </h2>
              <p className="text-xs text-[#526056] mt-1.5 font-sans">
                Lựa chọn phương thức phù hợp với mục tiêu và thời gian của bạn.
              </p>
            </div>

            {/* Two Choices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Mode 1: Tự học chủ động */}
              <Link
                href="/s/home"
                className="bg-[#faf7f0] rounded-2xl p-5 border border-[#dcd4c3] flex flex-col justify-between hover:shadow-md hover:border-[#1a3d2f]/40 transition group cursor-pointer"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#ede6d8] flex items-center justify-center text-[#173d2d] mb-4">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#173d2d] mb-3">
                    Tự học chủ động
                  </h3>
                  <ul className="text-xs text-[#526056] space-y-2 mb-5">
                    <li className="flex items-center gap-2">
                      <span className="text-[#1a3d2f] text-sm">✓</span>
                      <span>Học theo nhịp riêng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#1a3d2f] text-sm">✓</span>
                      <span>Có lộ trình đề xuất</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#1a3d2f] text-sm">✓</span>
                      <span>Hệ thống bài tập đa dạng</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#ede6d8]">
                  <span className="text-[11px] font-bold text-[#173d2d]">Bắt đầu tự học</span>
                  <div className="w-7 h-7 rounded-full border border-[#dcd4c3] flex items-center justify-center text-[#173d2d] group-hover:bg-[#1a3d2f] group-hover:text-white group-hover:border-[#1a3d2f] transition">
                    <span className="text-xs">→</span>
                  </div>
                </div>
              </Link>

              {/* Mode 2: Học cùng giáo viên */}
              <Link
                href="/t/dashboard"
                className="bg-[#faf7f0] rounded-2xl p-5 border border-[#dcd4c3] flex flex-col justify-between hover:shadow-md hover:border-[#1a3d2f]/40 transition group cursor-pointer"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#ede6d8] flex items-center justify-center text-[#173d2d] mb-4">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#173d2d] mb-3">
                    Học cùng giáo viên
                  </h3>
                  <ul className="text-xs text-[#526056] space-y-2 mb-5">
                    <li className="flex items-center gap-2">
                      <span className="text-[#1a3d2f] text-sm">✓</span>
                      <span>Tham gia lớp học với giáo viên</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#1a3d2f] text-sm">✓</span>
                      <span>Nhận bài được giao</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#1a3d2f] text-sm">✓</span>
                      <span>Có phản hồi và theo dõi tiến độ</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#ede6d8]">
                  <span className="text-[11px] font-bold text-[#173d2d]">Lớp cô Ning Ning</span>
                  <div className="w-7 h-7 rounded-full border border-[#dcd4c3] flex items-center justify-center text-[#173d2d] group-hover:bg-[#1a3d2f] group-hover:text-white group-hover:border-[#1a3d2f] transition">
                    <span className="text-xs">→</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
