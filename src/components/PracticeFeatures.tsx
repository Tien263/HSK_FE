"use client";

import Link from "next/link";
import { BookOpenCheck, FileText, ListOrdered, RotateCw } from "lucide-react";

export default function PracticeFeatures() {
  const features = [
    {
      title: "Trắc nghiệm",
      desc: "Kiểm tra kiến thức nhanh chóng với hệ thống câu hỏi phong phú.",
      icon: <BookOpenCheck className="w-5 h-5 text-[#1a3d2f]" />,
    },
    {
      title: "Điền từ vào chỗ trống",
      desc: "Luyện vốn từ vựng và ngữ pháp qua các bài tập thực tế.",
      icon: <FileText className="w-5 h-5 text-[#1a3d2f]" />,
    },
    {
      title: "Sắp xếp câu",
      desc: "Rèn luyện tư duy ngữ pháp và khả năng diễn đạt.",
      icon: <ListOrdered className="w-5 h-5 text-[#1a3d2f]" />,
    },
    {
      title: "Ôn lại lỗi sai",
      desc: "Hệ thống tự động ghi nhớ lỗi sai giúp bạn tiến bộ nhanh hơn.",
      icon: <RotateCw className="w-5 h-5 text-[#1a3d2f]" />,
    },
  ];

  return (
    <section id="practice" className="py-12 px-6 max-w-6xl mx-auto relative z-10">
      {/* Section Header with Left Bamboo and Right Explore Link */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="text-xs text-[#5a6b5c] font-serif mb-1 select-none">
            🎋 ÔN LUYỆN CHUẨN XÁC
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#173d2d] tracking-tight">
            Luyện tập & củng cố kiến thức
          </h2>
          <p className="text-xs text-[#526056] mt-1.5 font-sans">
            Hệ thống bài tập đa dạng giúp bạn ghi nhớ sâu hơn và tiến bộ mỗi ngày.
          </p>
        </div>
        <Link
          href="/s/home"
          className="mt-3 md:mt-0 text-xs font-bold text-[#173d2d] flex items-center gap-1 hover:translate-x-1 transition-transform self-start"
        >
          <span>Khám phá ngay</span>
          <span>→</span>
        </Link>
      </div>

      {/* Grid of 4 Vertical Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {features.map((feat) => (
          <Link
            key={feat.title}
            href="/s/home"
            className="bg-[#faf7f0] rounded-2xl p-5 border border-[#dcd4c3] flex flex-col justify-between hover:shadow-md hover:border-[#1a3d2f]/40 transition group cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#ede6d8] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                {feat.icon}
              </div>
              <h3 className="font-serif font-bold text-sm text-[#173d2d] mb-2">
                {feat.title}
              </h3>
              <p className="text-[11px] text-[#526056] leading-relaxed">
                {feat.desc}
              </p>
            </div>
            <div className="pt-4 flex items-center justify-end text-[#173d2d] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition">
              <span className="text-xs font-bold">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
