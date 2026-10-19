"use client";

import Link from "next/link";
import Image from "next/image";

export default function LearningRoadmap() {
  const steps = [
    {
      num: "01",
      title: "Xây nền tảng",
      desc: "Làm quen phát âm, chữ Hán và ngữ pháp cơ bản.",
    },
    {
      num: "02",
      title: "Phát triển kỹ năng",
      desc: "Mở rộng vốn từ, luyện nghe – nói – đọc – viết.",
    },
    {
      num: "03",
      title: "Ứng dụng thực tế",
      desc: "Luyện theo chủ đề và ngữ cảnh thực tế.",
    },
    {
      num: "04",
      title: "Thành thạo",
      desc: "Sử dụng tiếng Trung trong học tập, công việc và cuộc sống.",
    },
  ];

  return (
    <section id="roadmap" className="py-12 sm:py-16 px-6 max-w-6xl mx-auto relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Heading, Subtitle & Link */}
        <div className="lg:col-span-4 flex flex-col justify-between pt-2">
          <div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#173d2d] leading-[1.22] tracking-tight mb-3">
              Lộ trình học <br />
              rõ ràng, từng bước vững chắc
            </h2>
            <p className="text-xs sm:text-sm text-[#4d6356] leading-relaxed mb-6 font-sans">
              Từ nền tảng đến ứng dụng thực tế, Hanyu giúp bạn tiến bộ bền vững.
            </p>
          </div>
          <Link
            href="/s/home"
            className="text-xs font-bold text-[#173d2d] flex items-center gap-1.5 hover:translate-x-1 transition-transform self-start"
          >
            <span>Xem chi tiết</span>
            <span className="text-sm">→</span>
          </Link>
        </div>

        {/* Right Column: 4 Connected Steps with Clean Vector Mountain Peaks */}
        <div className="lg:col-span-8 relative pt-4">
          {/* Background Clean Mountain Peaks Artwork (Zero Text SVG) */}
          <div className="absolute top-0 right-0 left-0 h-[105px] pointer-events-none select-none z-0 hidden md:block">
            <Image
              src="/theme/clean-mountain-roadmap.svg"
              alt="Misty mountain peaks roadmap"
              fill
              className="object-contain object-bottom"
              priority
            />
          </div>

          {/* Thin connecting line across the 4 step badges */}
          <div className="absolute top-[38px] left-[12%] right-[12%] h-[1.5px] bg-[#5a7664]/60 pointer-events-none z-0 hidden md:block" />

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-4 relative z-10">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-start pt-2">
                {/* Circular Badge Button */}
                <div className="w-8 h-8 rounded-full bg-[#3d5a49] text-white flex items-center justify-center text-xs font-serif font-bold shadow-xs mb-3 ring-4 ring-[#f7efe2]">
                  {step.num}
                </div>

                {/* Title */}
                <h4 className="font-serif font-bold text-sm sm:text-[15px] text-[#173d2d] mb-1.5">
                  {step.title}
                </h4>

                {/* Description */}
                <p className="text-[11px] sm:text-xs text-[#526056] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
