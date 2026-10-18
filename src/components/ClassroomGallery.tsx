"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function ClassroomGallery() {
  const images = [
    {
      title: "Luyện viết chữ Hán & Bộ thủ",
      desc: "Vở ô điền & hướng dẫn bút thuận từng nét",
      url: "/hsk-images/guide-hanzi.jpg",
    },
    {
      title: "Luyện phản xạ Nghe phòng Lab",
      desc: "Audio chuẩn giọng phổ thông Bắc Kinh",
      url: "/hsk-images/guide-listening.jpg",
    },
    {
      title: "Phòng thi thử chuẩn Hanban",
      desc: "Mô phỏng áp lực phòng thi thật 100%",
      url: "/hsk-images/exam-banner.jpg",
    },
  ];

  return (
    <section id="gallery" className="py-20 border-t border-[#1a3d24]/60 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        {/* Left Column Text & Navigation arrows */}
        <div className="lg:col-span-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            Hình ảnh lớp học & thi thử
          </h2>
          <p className="text-[#8ea797] text-sm leading-relaxed mb-8">
            Mỗi buổi học và bài thi thử đều được thiết kế tỉ mỉ, sinh động và theo sát năng lực của từng học viên.
          </p>

          {/* Navigation Arrows (Exact style from reference) */}
          <div className="flex items-center gap-4 text-white">
            <button
              onClick={() => {}}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-[#bbcf52] hover:text-[#bbcf52] transition"
              aria-label="Previous"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {}}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-[#bbcf52] hover:text-[#bbcf52] transition"
              aria-label="Next"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column 3 Cards Grid (Exact reference layout) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {images.map((item, idx) => (
            <div
              key={idx}
              className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-[#1a3d24] shadow-lg group bg-[#0c2514]"
            >
              <Image
                src={item.url}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07190c]/90 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h4 className="text-xs font-bold text-white mb-0.5">{item.title}</h4>
                <p className="text-[11px] text-[#8ea797]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
