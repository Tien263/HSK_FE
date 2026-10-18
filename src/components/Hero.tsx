import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Compass } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[95vh] lg:min-h-screen flex items-center justify-start overflow-hidden">
      {/* Background Illustration from Pinterest design */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/sample-design.jpg"
          alt="Tranh phong cảnh ngọn núi hoàng hôn và đàn sếu Hán ngữ"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right md:object-center brightness-[0.92] contrast-[1.05]"
        />
        {/* Subtle Dark Vignette & Gradient Overlays for optimal readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e1b]/85 via-[#0b0e1b]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0b0e1b] via-[#0b0e1b]/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0b0e1b]/60 to-transparent" />
      </div>

      {/* Content Container (Positioned on the Left bám sát mẫu thiết kế) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 pt-28 pb-16 flex flex-col justify-center">
        <div className="max-w-2xl">
          {/* Subtitle with Mountain Icon & Chinese quote */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs md:text-sm font-medium mb-6 shadow-sm">
            <span className="font-serif text-amber-300 font-bold text-base">山</span>
            <span className="tracking-wide">
              Hành trình vạn dặm • Chinh phục chuẩn HSK 1 - 6
            </span>
          </div>

          {/* Giant Hero Title - Classic Bold Serif Typography (Style: VISITE) */}
          <h1 className="text-5xl sm:text-7xl lg:text-[6.5rem] font-serif font-black text-white tracking-tight leading-[1.02] drop-shadow-2xl uppercase mb-6">
            CHINH PHỤC
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 text-3xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-normal mt-2 lowercase opacity-95">
              tiếng Trung từ số 0
            </span>
          </h1>

          {/* Description Paragraph */}
          <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-xl mb-10 drop-shadow font-normal text-white/90">
            Khám phá vẻ đẹp Hán tự qua hệ thống thẻ từ vựng thông minh, luyện phản xạ nghe với
            giọng đọc chuẩn bản xứ và làm đề thi thử thực chiến bám sát cấu trúc Hanban mới nhất.
          </p>

          {/* Call to Actions (Nút bấm bám sát mẫu trắng tối giản) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="#levels"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-md bg-white text-slate-950 font-semibold text-base hover:bg-amber-300 hover:text-slate-950 transition-all duration-200 shadow-xl shadow-black/30 group"
            >
              <span>Bắt đầu hành trình</span>
              <span className="group-hover:translate-x-1 transition-transform font-mono text-sm">
                ►
              </span>
            </Link>

            <Link
              href="#demo-flashcard"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md bg-black/40 text-white font-medium text-base border border-white/25 backdrop-blur-md hover:bg-white/15 transition duration-200"
            >
              <Compass className="w-5 h-5 text-amber-400" />
              <span>Thử lật thẻ từ vựng</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
