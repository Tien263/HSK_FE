"use client";

import Image from "next/image";
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
      ctaStudent: "Xem kho bài học",
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
      ctaStudent: "Vào phòng luyện tập",
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
      ctaTeacher: "Xem bảng xếp hạng",
      ctaStudent: "Vào Game Center",
      imageUrl: "/hsk-images/exam-banner.jpg",
      arch: "rounded-t-[65px] rounded-b-xl",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handleAction = (msg: string) => {
    alert(`Chức năng ${msg}: Em hãy đăng nhập tài khoản để vào hệ thống nhé!`);
  };

  return (
    <section id="features-detail" className="py-24 border-t border-[#234a29]/60 max-w-7xl mx-auto px-6 lg:px-12 scroll-mt-20">
      {/* Section Header */}
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-12">
        <div className="lg:col-span-8">
          <div className="text-xs font-semibold text-[#c3dc4e] uppercase tracking-widest mb-3 font-mono">
            TÍNH NĂNG NỔI BẬT NỘI BỘ
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            Trải nghiệm học tập thông minh cùng cô Ning Ning
          </h2>
          <p className="text-[#9cb396] text-sm sm:text-base leading-relaxed max-w-2xl">
            Tất cả công cụ từ soạn bài, làm bài, sửa lỗi đến trò chơi tương tác đều được thiết kế để
            học sinh dễ nhớ - nhớ lâu - không áp lực.
          </p>
        </div>

        {/* Navigation Arrows */}
        <div className="lg:col-span-4 flex items-center justify-start lg:justify-end gap-3">
          <button
            onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : features.length - 1))}
            className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:border-[#c3dc4e] hover:text-[#c3dc4e] transition cursor-pointer"
            aria-label="Previous feature"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev < features.length - 1 ? prev + 1 : 0))}
            className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:border-[#c3dc4e] hover:text-[#c3dc4e] transition cursor-pointer"
            aria-label="Next feature"
          >
            <ArrowRight className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>
      </div>

      {/* 3 Arched Feature Cards Grid (Exact reference layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((item, idx) => (
          <div
            key={item.id}
            id={item.id}
            className="bg-[#0a2012]/95 border border-[#234a29] rounded-2xl p-5 flex flex-col justify-between hover:border-[#c3dc4e]/60 transition-all duration-300 shadow-xl group scroll-mt-24"
          >
            <div>
              {/* Arched Dome Image Header */}
              <div
                className={`relative h-56 w-full mb-5 overflow-hidden border border-white/20 bg-[#061609] shadow-inner ${item.arch}`}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061609]/90 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-[#c3dc4e] font-mono font-bold">
                  {item.tag}
                </div>
              </div>

              {/* Title & Sub */}
              <h3 className="text-lg font-bold text-white mb-2 leading-snug">{item.title}</h3>
              <p className="text-xs text-[#9cb396] leading-relaxed mb-5">{item.sub}</p>

              {/* Feature Points */}
              <ul className="space-y-2 text-xs text-[#9cb396] mb-6">
                {item.details.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c3dc4e] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#234a29] flex items-center justify-between gap-2">
              <button
                onClick={() => handleAction(item.ctaStudent)}
                className="flex-1 py-2 rounded-lg bg-[#c3dc4e] text-[#061609] text-xs font-bold hover:bg-[#b3cb40] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>{item.ctaStudent}</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
