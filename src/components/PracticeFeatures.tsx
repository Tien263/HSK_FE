"use client";

import Link from "next/link";
import Image from "next/image";
import { ClipboardCheck, FileEdit, AlignLeft, Search } from "lucide-react";

export default function PracticeFeatures() {
  const features = [
    {
      title: "Trắc nghiệm",
      desc: "Kiểm tra kiến thức nhanh chóng với hệ thống câu hỏi phong phú.",
      icon: <ClipboardCheck className="w-5 h-5 text-[#2d4938]" />,
    },
    {
      title: "Điền từ vào chỗ trống",
      desc: "Luyện vững từ vựng và ngữ pháp qua các bài tập thực tế.",
      icon: <FileEdit className="w-5 h-5 text-[#2d4938]" />,
    },
    {
      title: "Sắp xếp câu",
      desc: "Rèn luyện tư duy ngữ pháp và khả năng diễn đạt.",
      icon: <AlignLeft className="w-5 h-5 text-[#2d4938]" />,
    },
    {
      title: "Ôn lại lỗi sai",
      desc: "Hệ thống tự động ghi nhớ lỗi sai giúp bạn tiến bộ nhanh hơn.",
      icon: <Search className="w-5 h-5 text-[#2d4938]" />,
    },
  ];

  return (
    <section id="practice" className="pt-12 sm:pt-16 pb-16 sm:pb-24 px-6 max-w-6xl mx-auto relative z-10">
      {/* Clean vector bamboo leaves growing on the left edge (Zero Text) */}
      <div className="absolute left-[-15px] sm:left-[-35px] top-[15px] w-[80px] sm:w-[110px] h-[160px] pointer-events-none select-none z-0 opacity-80">
        <Image
          src="/theme/clean-bamboo-branch.svg"
          alt="Bamboo decor"
          fill
          className="object-contain object-left-top"
        />
      </div>

      {/* Header with Title, Subtitle, and Explore Link */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pl-6 sm:pl-10">
        <div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#173d2d] tracking-tight mb-2">
            Luyện tập & củng cố kiến thức
          </h2>
          <p className="text-xs sm:text-sm text-[#4d6356] font-sans">
            Hệ thống bài tập đa dạng giúp bạn ghi nhớ sâu hơn và tiến bộ mỗi ngày.
          </p>
        </div>
        <Link
          href="/s/home"
          className="mt-4 md:mt-0 text-xs font-bold text-[#173d2d] flex items-center gap-1.5 hover:translate-x-1 transition-transform self-start"
        >
          <span>Khám phá ngay</span>
          <span className="text-sm">→</span>
        </Link>
      </div>

      {/* 4 Clean Minimal Feature Items (Circle icon on left, text on right) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 pl-6 sm:pl-10">
        {features.map((feat) => (
          <Link
            key={feat.title}
            href="/s/home"
            className="flex items-start gap-3.5 group cursor-pointer hover:-translate-y-0.5 transition-transform"
          >
            {/* Round warm beige coin container */}
            <div className="w-13 h-13 rounded-full bg-[#ede5d4] border border-[#d8cdb8] flex items-center justify-center shrink-0 shadow-2xs group-hover:border-[#2d4938] transition">
              {feat.icon}
            </div>

            {/* Title & Description */}
            <div className="pt-0.5">
              <h3 className="font-serif font-bold text-sm sm:text-[15px] text-[#173d2d] mb-1 group-hover:text-[#2d4938] transition">
                {feat.title}
              </h3>
              <p className="text-[11px] text-[#526056] leading-relaxed">
                {feat.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
