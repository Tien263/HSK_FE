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
    <section id="roadmap" className="py-14 px-6 max-w-6xl mx-auto relative z-10">
      {/* Header and Link */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#173d2d] tracking-tight">
            Lộ trình học <br className="hidden sm:block" />
            rõ ràng, từng bước vững chắc
          </h2>
          <p className="text-xs text-[#526056] mt-1.5 font-sans">
            Từ nền tảng đến ứng dụng thực tế, Hanyu giúp bạn tiến bộ bền vững.
          </p>
        </div>
        <Link
          href="/s/home"
          className="mt-3 md:mt-0 text-xs font-bold text-[#173d2d] flex items-center gap-1 hover:translate-x-1 transition-transform self-start"
        >
          <span>Xem chi tiết</span>
          <span>→</span>
        </Link>
      </div>

      {/* Timeline Steps with Background Mountain Contour */}
      <div className="relative pt-6 pb-2">
        {/* Background Mountain Contour Graphic */}
        <div className="absolute inset-0 w-full h-[80px] top-0 pointer-events-none select-none opacity-80 hidden md:block">
          <Image
            src="/theme/mountain-timeline-contour.png"
            alt="Mountain timeline background"
            fill
            className="object-contain object-center"
          />
        </div>

        {/* 4 Connected Step Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-4 relative z-10">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-start relative">
              {/* Badge Circle */}
              <div className="w-8 h-8 rounded-full bg-[#1a3d2f] text-white flex items-center justify-center text-xs font-serif font-bold shadow-xs mb-3 ring-4 ring-[#f5f2e9]">
                {step.num}
              </div>

              {/* Title & Desc */}
              <h4 className="font-serif font-bold text-sm text-[#173d2d] mb-1">
                {step.title}
              </h4>
              <p className="text-[11px] text-[#526056] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
