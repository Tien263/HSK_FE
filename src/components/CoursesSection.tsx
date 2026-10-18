"use client";

import Image from "next/image";
import Link from "next/link";

interface CourseCard {
  id: string;
  level: number;
  title: string;
  badge: string;
  archStyle: string;
  imageUrl: string;
  bullets: { label: string; value: string }[];
  price: string;
}

const courses: CourseCard[] = [
  {
    id: "hsk-1",
    level: 1,
    title: "HSK 1 - Nhập Môn 150",
    badge: "Sơ cấp",
    archStyle: "rounded-t-[70px] rounded-b-md",
    imageUrl: "/hsk-images/hsk1.jpg",
    bullets: [
      { label: "Mục tiêu", value: "Nhập môn & Chuẩn Pinyin" },
      { label: "Thời lượng", value: "4/6/8 tuần" },
      { label: "Sĩ số", value: "6 - 8 học viên/lớp" },
      { label: "Cam kết", value: "Chuẩn phát âm & 150 từ" },
    ],
    price: "1.250.000 đ",
  },
  {
    id: "hsk-2",
    level: 2,
    title: "HSK 2 - Giao Tiếp 300",
    badge: "Giao tiếp",
    archStyle: "rounded-t-[80px] rounded-b-md",
    imageUrl: "/hsk-images/hsk2.jpg",
    bullets: [
      { label: "Mục tiêu", value: "Phản xạ giao tiếp đời sống" },
      { label: "Thời lượng", value: "6/8/10 tuần" },
      { label: "Sĩ số", value: "6 - 8 học viên/lớp" },
      { label: "Cam kết", value: "Đỗ HSK 2 & 300 từ vựng" },
    ],
    price: "1.850.000 đ",
  },
  {
    id: "hsk-3",
    level: 3,
    title: "HSK 3 - Đột Phá 600",
    badge: "Trung cấp",
    archStyle: "rounded-t-[70px] rounded-b-md",
    imageUrl: "/hsk-images/hsk3.jpg",
    bullets: [
      { label: "Mục tiêu", value: "Đàm thoại & ngữ pháp mở rộng" },
      { label: "Thời lượng", value: "8/10/12 tuần" },
      { label: "Sĩ số", value: "6 - 8 học viên/lớp" },
      { label: "Cam kết", value: "Đỗ HSK 3 & 600 từ vựng" },
    ],
    price: "2.450.000 đ",
  },
  {
    id: "hsk-4",
    level: 4,
    title: "HSK 4 - Du Học 1200",
    badge: "Chuyên sâu",
    archStyle: "rounded-t-[70px] rounded-b-md",
    imageUrl: "/hsk-images/hsk4.jpg",
    bullets: [
      { label: "Mục tiêu", value: "Chuẩn apply học bổng ĐH" },
      { label: "Thời lượng", value: "12/14/16 tuần" },
      { label: "Sĩ số", value: "6 - 8 học viên/lớp" },
      { label: "Cam kết", value: "Đỗ HSK 4 & 1200 từ vựng" },
    ],
    price: "3.250.000 đ",
  },
];

export default function CoursesSection() {
  return (
    <section id="courses" className="py-24 sm:py-28 border-t border-[#234a29]/60 max-w-7xl mx-auto px-6 lg:px-12 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-xs font-semibold text-[#c3dc4e] uppercase tracking-widest mb-3 font-mono">
          CHƯƠNG TRÌNH ĐÀO TẠO CHUẨN HANBAN
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
          Hệ thống khóa học HSK <span className="text-[#c3dc4e]">chuẩn đầu ra</span>
        </h2>
        <p className="text-[#9cb396] text-sm sm:text-base leading-relaxed">
          Được thiết kế tinh gọn theo chuẩn khung khảo thí quốc tế, tối ưu thời gian học và cam kết
          đạt chứng chỉ ngay lần thi đầu tiên.
        </p>
      </div>

      {/* 4 Arched Dome Level Cards (Exact signature dome shape from reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {courses.map((item) => (
          <div
            key={item.id}
            className="bg-[#0a2012]/95 border border-[#234a29] rounded-2xl p-4 flex flex-col justify-between hover:border-[#c3dc4e]/60 hover:shadow-2xl hover:shadow-lime-950/20 transition-all duration-300 group"
          >
            <div>
              {/* Arched Dome Image Header (Exact signature element in reference image) */}
              <div
                className={`relative h-44 w-full mb-4 overflow-hidden border border-white/20 bg-[#061609] shadow-inner ${item.archStyle}`}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              </div>

              {/* Card Title (Centered, bold white like reference) */}
              <h3 className="text-center text-base font-bold text-white mb-4 tracking-wide">
                {item.title}
              </h3>

              {/* Specifications Bullet List */}
              <ul className="space-y-2 text-xs text-[#9cb396] mb-6 px-1">
                {item.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#c3dc4e] text-sm leading-none">•</span>
                    <span>
                      <span className="text-white/85 font-medium">{b.label}:</span> {b.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Row: Price on left in Lime, Button on right */}
            <div className="pt-4 border-t border-[#234a29] flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-[#9cb396]">từ</span>
                <span className="text-[#c3dc4e] font-bold text-base tracking-tight">
                  {item.price}
                </span>
              </div>
              <button
                onClick={() => alert(`Xem chi tiết lộ trình khóa học ${item.title}`)}
                className="px-4 py-1.5 rounded-lg border border-white/25 text-[#9cb396] text-xs font-medium hover:border-[#c3dc4e] hover:text-white transition cursor-pointer"
              >
                Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Center Button under 4 Cards (Посмотреть еще style) */}
      <div className="flex justify-center">
        <button
          onClick={() => alert("Đội ngũ chuyên môn sẽ tư vấn kiểm tra đầu vào và lộ trình chi tiết cho bạn!")}
          className="px-10 py-3.5 rounded-lg bg-[#c3dc4e] text-[#061609] font-bold text-sm hover:bg-[#b3cb40] transition shadow-xl shadow-black/30 cursor-pointer"
        >
          Xem tất cả khóa học
        </button>
      </div>
    </section>
  );
}
