import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative pt-4 sm:pt-8 pb-16 md:pb-24 px-6 max-w-6xl mx-auto">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[460px] md:min-h-[520px]">
        {/* Left Content Column */}
        <div className="lg:col-span-7 max-w-xl">
          {/* Poetic Sub-tagline: 一茶一世界 一语一未来 */}
          <div className="text-[12px] font-serif tracking-[0.35em] text-[#5a6b5c] uppercase mb-4 font-semibold">
            一 茶 一 世 界 · 一 语 一 未 来
          </div>

          {/* Main Headline (Lora Serif font, exact typography) */}
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-black text-[#173d2d] leading-[1.18] tracking-tight mb-5 drop-shadow-2xs">
            Học tiếng Trung <br />
            mở ra một <br />
            thế giới lớn hơn
          </h1>

          {/* Description with enhanced contrast and subtle soft paper scrim */}
          <div className="bg-[#f7efe2]/75 backdrop-blur-[2px] p-3.5 sm:p-4 rounded-2xl border border-[#d8cdb8]/50 max-w-lg mb-7 shadow-2xs">
            <p className="text-xs sm:text-sm text-[#132219] font-medium leading-relaxed font-sans">
              Hanyu đồng hành cùng bạn trên hành trình chinh phục tiếng Trung với lộ trình bài bản, nội dung thực tiễn và phương pháp hiện đại.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 mb-10">
            <Link
              href="/register"
              className="px-6 py-2.5 rounded-full bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#122b21] transition shadow-md flex items-center gap-1.5"
            >
              <span>Bắt đầu học ngay</span>
              <span>→</span>
            </Link>

            <Link
              href="/guide"
              className="flex items-center gap-2 rounded-full border border-[#d8cdb8] bg-[#faf6ed]/85 px-5 py-2.5 text-xs font-bold text-[#173d2d] transition hover:bg-white"
            >
              <BookOpen size={15} /> Xem hướng dẫn sử dụng
            </Link>
          </div>

        </div>

        {/* Right Seal & Calligraphy Badge */}
        <div className="lg:col-span-5 flex justify-end items-start pointer-events-none select-none">
          <div className="flex flex-col items-center gap-2 pr-2 sm:pr-8 pt-2">
            <div className="font-serif text-3xl font-bold tracking-widest text-[#173d2d] drop-shadow-xs" style={{ writingMode: "vertical-rl" }}>
              汉语
            </div>
            <div className="w-7 h-7 rounded-sm bg-[#a8383b] text-white flex items-center justify-center font-serif text-[11px] font-bold shadow-xs">
              中国
            </div>
            <div className="text-[9px] font-serif text-[#5a6b5c] tracking-widest uppercase text-center mt-1">
              Chinese<br />A Brighter World
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
