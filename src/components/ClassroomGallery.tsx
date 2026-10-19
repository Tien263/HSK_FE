"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, ArrowUpRight } from "lucide-react";
import { useState } from "react";

export default function ClassroomGallery() {
  const features = [
    {
      id: "kho-bai-hoc",
      tag: "02. KHO BÀI HỌC",
      title: "Mọi bài giảng, sắp xếp gọn gàng",
      sub: "Giáo trình, từ vựng, ngữ pháp, nghe, đọc, tất cả theo từng cấp HSK. Mỗi bài gắn được bộ câu hỏi riêng để học sinh làm ngay sau khi ôn.",
      details: [
        "Giáo trình → Cấp độ HSK → Bài học",
        "Mỗi bài gồm: Từ vựng · Ngữ pháp · Nghe · Đọc",
        "Bộ câu hỏi kiểm tra trực tiếp kiến thức vừa học",
        "Dành cho học sinh: Quên bài nào mở lại bài đó",
      ],
      ctaTeacher: "Thêm bài mới",
      linkTeacher: "/t/dashboard",
      ctaStudent: "Xem kho bài học",
      linkStudent: "/s/review",
      imageUrl: "/hsk-images/guide-hanzi.jpg",
      arch: "rounded-t-[65px] rounded-b-xl",
    },
    {
      id: "phong-luyen-tap",
      tag: "03. PHÒNG LUYỆN TẬP HỌC SINH",
      title: "Làm bài, sửa lỗi, lên cấp",
      sub: "Mỗi ngày một chút, nhớ lâu hơn nhiều. Làm bài cô giao, xem lại kết quả và luyện lại đúng những câu mình hay sai.",
      details: [
        "Làm bài được giao: Hiện rõ hạn nộp, số câu & thời gian",
        "Xem kết quả: Điểm số kèm đáp án và giải thích chi tiết",
        "Luyện lại câu sai: Hệ thống gom riêng câu sai để ôn chắc",
        "Tích lũy điểm kinh nghiệm (XP) & chuỗi ngày học đều",
      ],
      ctaTeacher: "Xem bài đã giao",
      linkTeacher: "/t/dashboard",
      ctaStudent: "Vào phòng luyện tập",
      linkStudent: "/s/home",
      imageUrl: "/hsk-images/guide-listening.jpg",
      arch: "rounded-t-[80px] rounded-b-xl",
    },
    {
      id: "game-center",
      tag: "05. GAME CENTER",
      title: "Học mà chơi, chơi mà nhớ",
      sub: "Từ vựng và ngữ pháp trở nên nhẹ nhàng hơn khi được biến thành trò chơi. Thi đua cùng các bạn trong lớp mỗi ngày.",
      details: [
        "Ghép chữ Hán với pinyin: Nối đúng chữ với cách đọc",
        "Đua từ vựng: Trả lời nhanh, chính xác để dẫn đầu",
        "Xây câu: Sắp xếp các từ thành câu đúng ngữ pháp",
        "Bảng xếp hạng theo lớp: Vinh danh các bạn chăm chỉ nhất tuần",
      ],
      ctaTeacher: "Xem báo cáo lớp",
      linkTeacher: "/t/dashboard",
      ctaStudent: "Vào Game Center",
      linkStudent: "/s/games",
      imageUrl: "/hsk-images/exam-banner.jpg",
      arch: "rounded-t-[65px] rounded-b-xl",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const current = features[activeIndex];

  return (
    <section id="kho-bai-hoc" className="py-24 border-t border-[#234a29]/60 max-w-7xl mx-auto px-6 lg:px-12">
      {/* Top Header with Prev/Next Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
        <div>
          <div className="text-xs font-semibold text-[#c3dc4e] uppercase tracking-widest mb-3 font-mono">
            TÍNH NĂNG NỔI BẬT DÀNH CHO LỚP
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Trải nghiệm học tập hiện đại
          </h2>
          <p className="text-[#9cb396] text-sm sm:text-base mt-2 max-w-xl font-normal leading-relaxed">
            Học sinh chủ động làm bài, giáo viên quản lý lớp sát sao với các công cụ chuyên sâu.
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevSlide}
            className="w-12 h-12 rounded-full border border-white/20 bg-[#0a2012] flex items-center justify-center text-white hover:border-[#c3dc4e] hover:text-[#c3dc4e] transition cursor-pointer shadow-md"
            aria-label="Previous slide"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono font-bold text-[#c3dc4e] px-2">
            0{activeIndex + 1} / 0{features.length}
          </span>
          <button
            onClick={nextSlide}
            className="w-12 h-12 rounded-full border border-white/20 bg-[#0a2012] flex items-center justify-center text-white hover:border-[#c3dc4e] hover:text-[#c3dc4e] transition cursor-pointer shadow-md"
            aria-label="Next slide"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Feature Showcase Grid (Text on Left, Arched Image Card on Right) */}
      <div className="bg-[#0a2012] border border-[#234a29] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Details */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c3dc4e]/10 border border-[#c3dc4e]/30 text-xs font-semibold text-[#c3dc4e] mb-4 font-mono">
                <Sparkles className="w-3 h-3" />
                <span>{current.tag}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                {current.title}
              </h3>

              <p className="text-[#9cb396] text-sm sm:text-base leading-relaxed mb-6">
                {current.sub}
              </p>

              {/* 4 Feature Bullet Points */}
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {current.details.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/90">
                    <CheckCircle2 className="w-4 h-4 text-[#c3dc4e] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons for both Teacher and Student */}
            <div className="pt-6 border-t border-[#234a29] flex flex-wrap items-center gap-4">
              <Link
                href={current.linkStudent}
                className="px-6 py-3.5 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-xs sm:text-sm hover:bg-[#b3cb40] transition shadow-lg cursor-pointer flex items-center gap-2"
              >
                <span>{current.ctaStudent}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={current.linkTeacher}
                className="px-6 py-3.5 rounded-xl border border-white/20 text-white font-medium text-xs sm:text-sm hover:bg-white/10 hover:border-white/40 transition cursor-pointer flex items-center gap-2"
              >
                <span>{current.ctaTeacher}</span>
                <ArrowUpRight className="w-4 h-4 text-[#9cb396]" />
              </Link>
            </div>
          </div>

          {/* Right Arched Image Container */}
          <div className="lg:col-span-5 flex justify-center">
            <div className={`relative w-full max-w-sm aspect-[4/5] overflow-hidden ${current.arch} border border-white/15 shadow-2xl`}>
              <Image
                src={current.imageUrl}
                alt={current.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061609]/80 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
