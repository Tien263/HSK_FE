"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function ClassroomGallery() {
  const images = [
    {
      title: "Luyện viết chữ Hán & Bộ thủ",
      desc: "Vở ô điền & chuẩn bút thuận",
      url: "/hsk-images/guide-hanzi.jpg",
      arch: "rounded-t-[65px] rounded-b-xl",
    },
    {
      title: "Luyện phản xạ Nghe phòng Lab",
      desc: "Audio chuẩn giọng Bắc Kinh",
      url: "/hsk-images/guide-listening.jpg",
      arch: "rounded-t-[80px] rounded-b-xl",
    },
    {
      title: "Phòng thi thử chuẩn Hanban",
      desc: "Mô phỏng áp lực thi thật 100%",
      url: "/hsk-images/exam-banner.jpg",
      arch: "rounded-t-[65px] rounded-b-xl",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="gallery" className="py-20 border-t border-[#234a29]/60 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column Text & Navigation arrows (Exact reference layout) */}
        <div className="lg:col-span-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            Hình ảnh thực tế <span className="block text-white">lớp học & thi thử</span>
          </h2>
          <p className="text-[#9cb396] text-sm leading-relaxed mb-8">
            Mỗi buổi học và đợt thi thử đều được thiết kế sát sao theo năng lực thực tế, tạo môi
            trường tương tác cao giữa học viên và giảng viên bản xứ.
          </p>

          {/* Navigation Arrows (Exact style from reference) */}
          <div className="flex items-center gap-4 text-white">
            <button
              onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:border-[#c3dc4e] hover:text-[#c3dc4e] transition cursor-pointer"
              aria-label="Previous"
            >
              <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:border-[#c3dc4e] hover:text-[#c3dc4e] transition cursor-pointer"
              aria-label="Next"
            >
              <ArrowRight className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Right Column: 3 Arched Dome Photo Cards Grid (Exact reference signature layout) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {images.map((item, idx) => (
            <div
              key={idx}
              className={`relative h-72 sm:h-80 overflow-hidden border border-[#234a29] shadow-xl group bg-[#0a2012] ${item.arch}`}
            >
              <Image
                src={item.url}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061609]/80 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h4 className="text-sm font-bold text-white mb-0.5">{item.title}</h4>
                <p className="text-xs text-[#9cb396]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
