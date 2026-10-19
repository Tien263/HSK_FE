"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Users, Check } from "lucide-react";

export default function LearningModes() {
  return (
    <section className="w-full relative overflow-hidden py-14 sm:py-20 my-6">
      {/* Full-width edge-to-edge background image (Tràn viền 100%) */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <Image
          src="/theme/learning-modes-master-bg.jpg"
          alt="Hai hình thức học linh hoạt - Tranh thủy mặc trà đạo và học tập"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Subtle top and bottom feather gradient to integrate seamlessly into page */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#f7efe2]/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#f7efe2]/60 to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Title Column: Positioned beside the scholar tea desk */}
          <div className="lg:col-span-5 xl:col-span-4 pl-0 lg:pl-16 xl:pl-24">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-xs bg-[#a8383b] text-white flex items-center justify-center text-[10px] font-serif font-bold shadow-2xs">
                印
              </span>
              <span className="text-[10px] tracking-widest font-serif text-[#a8383b] uppercase font-bold">
                TWO LEARNING MODES
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#173d2d] leading-[1.2] tracking-tight mb-4 drop-shadow-2xs">
              Hai hình thức học <br />
              linh hoạt
            </h2>

            <p className="text-xs sm:text-sm text-[#2c3e33] leading-relaxed max-w-sm font-sans font-medium">
              Lựa chọn phương thức phù hợp với mục tiêu và thời gian của bạn.
            </p>
          </div>

          {/* Right Column: 2 Choice Cards overlaid right on top of the pre-painted frames */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col sm:flex-row justify-center lg:justify-end gap-5 sm:gap-6 lg:gap-8">
            {/* Card 1: Tự học chủ động */}
            <Link
              href="/s/home"
              className="bg-[#faf7f0]/95 backdrop-blur-xs rounded-2xl p-6 sm:p-7 border border-[#d8cdb8] flex flex-col justify-between shadow-md hover:shadow-xl hover:border-[#1a3d2f]/50 transition duration-300 group max-w-sm w-full cursor-pointer"
            >
              <div>
                {/* Round soft green circle with student silhouette */}
                <div className="w-16 h-16 rounded-full bg-[#dbe5dd] flex items-center justify-center text-[#1a3d2f] mb-5 mx-auto group-hover:scale-105 transition-transform shadow-2xs">
                  <User className="w-8 h-8" />
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#173d2d] mb-4 text-center">
                  Tự học chủ động
                </h3>

                <ul className="text-xs sm:text-[13px] text-[#2b3e32] space-y-3 mb-6 font-sans">
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-sm border border-[#1a3d2f] flex items-center justify-center text-[10px] text-[#1a3d2f] font-bold">
                      ✓
                    </span>
                    <span className="font-medium">Học theo nhịp riêng</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-sm border border-[#1a3d2f] flex items-center justify-center text-[10px] text-[#1a3d2f] font-bold">
                      ✓
                    </span>
                    <span className="font-medium">Có lộ trình đề xuất</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-sm border border-[#1a3d2f] flex items-center justify-center text-[10px] text-[#1a3d2f] font-bold">
                      ✓
                    </span>
                    <span className="font-medium">Hệ thống bài tập đa dạng</span>
                  </li>
                </ul>
              </div>

              {/* Bottom circular arrow button */}
              <div className="pt-2 border-t border-[#ede6d8] flex items-center justify-between">
                <span className="text-xs font-bold text-[#173d2d]">Bắt đầu tự học</span>
                <div className="w-8 h-8 rounded-full border border-[#b8ab97] flex items-center justify-center text-[#173d2d] group-hover:bg-[#1a3d2f] group-hover:text-white group-hover:border-[#1a3d2f] transition shadow-2xs">
                  <span className="text-sm">→</span>
                </div>
              </div>
            </Link>

            {/* Card 2: Học cùng giáo viên */}
            <Link
              href="/t/dashboard"
              className="bg-[#faf7f0]/95 backdrop-blur-xs rounded-2xl p-6 sm:p-7 border border-[#d8cdb8] flex flex-col justify-between shadow-md hover:shadow-xl hover:border-[#a8383b]/50 transition duration-300 group max-w-sm w-full cursor-pointer"
            >
              <div>
                {/* Round soft green circle with teacher & students */}
                <div className="w-16 h-16 rounded-full bg-[#dbe5dd] flex items-center justify-center text-[#1a3d2f] mb-5 mx-auto group-hover:scale-105 transition-transform shadow-2xs">
                  <Users className="w-8 h-8" />
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#173d2d] mb-4 text-center">
                  Học cùng giáo viên
                </h3>

                <ul className="text-xs sm:text-[13px] text-[#2b3e32] space-y-3 mb-6 font-sans">
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-sm border border-[#a8383b] flex items-center justify-center text-[10px] text-[#a8383b] font-bold">
                      ✓
                    </span>
                    <span className="font-medium">Tham gia lớp học với giáo viên</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-sm border border-[#a8383b] flex items-center justify-center text-[10px] text-[#a8383b] font-bold">
                      ✓
                    </span>
                    <span className="font-medium">Nhận bài được giao</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-sm border border-[#a8383b] flex items-center justify-center text-[10px] text-[#a8383b] font-bold">
                      ✓
                    </span>
                    <span className="font-medium">Có phản hồi và theo dõi tiến độ</span>
                  </li>
                </ul>
              </div>

              {/* Bottom circular arrow button */}
              <div className="pt-2 border-t border-[#ede6d8] flex items-center justify-between">
                <span className="text-xs font-bold text-[#173d2d]">Lớp cô Ning Ning</span>
                <div className="w-8 h-8 rounded-full border border-[#b8ab97] flex items-center justify-center text-[#173d2d] group-hover:bg-[#a8383b] group-hover:text-white group-hover:border-[#a8383b] transition shadow-2xs">
                  <span className="text-sm">→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
