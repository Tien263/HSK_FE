"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, X, Video } from "lucide-react";

export default function HeroSection() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <section className="relative pt-4 sm:pt-6 pb-16 md:pb-24 px-6 max-w-6xl mx-auto overflow-hidden">
      {/* Background artwork: Misty mountain on left */}
      <div className="absolute left-0 top-6 w-[160px] md:w-[220px] h-[200px] pointer-events-none select-none z-0 opacity-40">
        <Image
          src="/theme/hero-mountain-left.png"
          alt="Misty ink mountains"
          fill
          className="object-contain object-left-top"
        />
      </div>

      {/* Right Art: Master Leaf, Chinese Calligraphy 汉语, Red Seal, Pagoda and Fisherman */}
      <div className="absolute right-0 top-0 w-full md:w-[58%] h-[520px] md:h-[620px] pointer-events-none select-none z-0">
        <Image
          src="/theme/hero-leaf-master.png"
          alt="Hanyu Chinese Calligraphy and Bodhi Leaf"
          fill
          className="object-contain object-right-top"
          priority
        />
      </div>

      {/* Hero Left Content Column */}
      <div className="relative z-10 max-w-lg pt-4 md:pt-10">
        {/* Poetic Sub-tagline: 一茶一世界 一语一未来 */}
        <div className="text-[12px] font-serif tracking-[0.35em] text-[#8c9a8f] uppercase mb-4">
          一 茶 一 世 界 · 一 语 一 未 来
        </div>

        {/* Main Headline (Lora Serif font, exact typography) */}
        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-black text-[#173d2d] leading-[1.18] tracking-tight mb-5">
          Học tiếng Trung <br />
          mở ra một <br />
          thế giới lớn hơn
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#4d6356] leading-relaxed mb-7 max-w-md font-sans">
          Hanyu đồng hành cùng bạn trên hành trình chinh phục tiếng Trung với lộ trình bài bản, nội dung thực tiễn và phương pháp hiện đại.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3.5 mb-10">
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-full bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#122b21] transition shadow-xs flex items-center gap-1.5"
          >
            <span>Bắt đầu học ngay</span>
            <span>→</span>
          </Link>

          <button
            type="button"
            onClick={() => setVideoModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-white/70 border border-[#dcd4c3] text-[#173d2d] font-bold text-xs hover:bg-white transition shadow-2xs flex items-center gap-2 cursor-pointer backdrop-blur-xs"
          >
            <div className="w-4 h-4 rounded-full bg-[#1a3d2f] text-white flex items-center justify-center text-[8px]">
              <Play className="w-2 h-2 fill-white ml-0.5" />
            </div>
            <span>Xem video giới thiệu</span>
          </button>
        </div>

        {/* 3 Metric Stats with vertical dividers */}
        <div className="flex items-center gap-6 pt-6 border-t border-[#dcd4c3]/70 max-w-md">
          <div>
            <div className="text-2xl font-serif font-bold text-[#173d2d]">
              50.000+
            </div>
            <p className="text-[11px] text-[#6b8271] mt-0.5">Học viên tin tưởng</p>
          </div>
          <div className="h-7 w-px bg-[#dcd4c3]" />
          <div>
            <div className="text-2xl font-serif font-bold text-[#173d2d]">
              1.000+
            </div>
            <p className="text-[11px] text-[#6b8271] mt-0.5">Bài học chất lượng</p>
          </div>
          <div className="h-7 w-px bg-[#dcd4c3]" />
          <div>
            <div className="text-2xl font-serif font-bold text-[#173d2d]">
              4.9/5
            </div>
            <p className="text-[11px] text-[#6b8271] mt-0.5">Đánh giá từ học viên</p>
          </div>
        </div>
      </div>

      {/* ===================== VIDEO MODAL ===================== */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#faf7f0] border border-[#dcd4c3] rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 text-[#526056] hover:text-[#173d2d] p-1.5 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#1a3d2f] text-white flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#173d2d] font-serif">
                  Video Giới Thiệu Không Gian Học Tập Hanyu
                </h3>
                <p className="text-[11px] text-[#526056]">
                  Lộ trình ôn luyện HSK 3.0 cùng cô Ning Ning
                </p>
              </div>
            </div>

            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black relative flex items-center justify-center mb-4">
              <Image
                src="/theme/landing-source-mockup.jpg"
                alt="Video thumbnail"
                fill
                className="object-cover opacity-60"
              />
              <div className="relative z-10 text-center text-white p-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2 border border-white/40 cursor-pointer hover:scale-105 transition">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
                <p className="font-serif text-base font-bold">Lớp Tiếng Trung HSK Chuẩn Quốc Tế</p>
                <p className="text-[11px] text-white/80 mt-0.5">Học bài bản · Nhớ lâu ngắt quãng · Khắc phục lỗi sai</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-[#dcd4c3] text-xs font-semibold text-[#526056] cursor-pointer"
              >
                Đóng
              </button>
              <Link
                href="/register"
                className="px-5 py-1.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition shadow-xs"
              >
                Đăng ký học ngay
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
