"use client";

import Image from "next/image";
import Link from "next/link";

interface CourseCard {
  id: string;
  level: number;
  title: string;
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

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Submerged Background Video with Organic Multi-Directional Gradients */}
      <div className="absolute -top-24 left-0 right-0 h-[640px] sm:h-[720px] lg:h-[780px] overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-right lg:object-center opacity-65 lg:opacity-75 scale-105"
        >
          <source src="/main-background.mp4" type="video/mp4" />
        </video>

        {/* Left-to-right fade: deep dark pine green on left for text readability, clear video on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061609] via-[#061609]/85 sm:via-[#061609]/60 to-transparent/30" />

        {/* Bottom fade: seamless transition into pure #061609 above the cards */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#061609] via-[#061609]/90 to-transparent" />

        {/* Top fade: subtle shadow behind navbar */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#061609]/90 via-[#061609]/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-6 sm:pt-10 pb-20">
        {/* Top Hero Text (Headline, Subtext, Accent CTA button - left-aligned over submerged video) */}
        <div className="max-w-2xl mb-16 sm:mb-20 lg:mb-24">
          <h1 className="text-3xl sm:text-5xl lg:text-[3.4rem] font-bold text-white tracking-tight leading-[1.15] mb-6">
            Lộ trình đào tạo{" "}
            <span className="block">tiếng Trung cá nhân hóa</span>{" "}
            <span className="font-extrabold text-white">
              với cam kết đạt chuẩn HSK sau 3 tháng
            </span>
          </h1>

          <p className="text-[#9cb396] text-sm sm:text-base leading-relaxed max-w-xl mb-8 font-normal">
            Thiết kế chương trình từ số 0 đến HSK 6, tối ưu thời gian học với phương pháp giải mã bộ
            thủ Hán tự và phản xạ đàm thoại trực tiếp cùng đội ngũ thạc sĩ Hán ngữ.
          </p>

          <div>
            <button
              onClick={() =>
                alert("Chuyên viên tư vấn Huayu sẽ liên hệ xếp lịch kiểm tra trình độ miễn phí!")
              }
              className="px-8 py-3.5 rounded-lg bg-[#c3dc4e] text-[#061609] font-bold text-sm hover:bg-[#b3cb40] transition shadow-xl shadow-black/40 cursor-pointer"
            >
              Tư vấn miễn phí
            </button>
          </div>
        </div>

        {/* 4 Arched Dome Level Cards (Exact signature dome shape from reference) */}
        <div id="courses" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {courses.map((item) => (
            <div
              key={item.id}
              className="bg-[#0a2012]/95 border border-[#234a29] rounded-2xl p-4 flex flex-col justify-between hover:border-[#c3dc4e]/60 transition-all duration-300 group shadow-xl"
            >
              <div>
                {/* Arched Dome Image Header (Exact signature element in reference image) */}
                <div
                  className={`relative h-40 w-full mb-4 overflow-hidden border border-white/20 bg-[#061609] shadow-inner ${item.archStyle}`}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>

                {/* Card Title (Centered, bold white like reference) */}
                <h3 className="text-center text-[15px] font-bold text-white mb-3 tracking-wide">
                  {item.title}
                </h3>

                {/* Specifications Bullet List */}
                <ul className="space-y-1.5 text-xs text-[#9cb396] mb-6 px-1">
                  {item.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-white/60">•</span>
                      <span>
                        <span className="text-white/80">{b.label}:</span> {b.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Row: Price on left in Lime, Button on right */}
              <div className="pt-3 border-t border-[#234a29] flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-[11px] text-[#9cb396]">từ</span>
                  <span className="text-[#c3dc4e] font-bold text-[15px] tracking-tight">
                    {item.price}
                  </span>
                </div>
                <button
                  onClick={() => alert(`Xem chi tiết lộ trình khóa học ${item.title}`)}
                  className="px-3.5 py-1 rounded border border-white/25 text-[#9cb396] text-xs hover:border-[#c3dc4e] hover:text-white transition cursor-pointer"
                >
                  Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Center Button under 4 Cards (Посмотреть еще style) */}
        <div className="flex justify-center">
          <Link
            href="#courses"
            className="px-9 py-3 rounded-lg bg-[#c3dc4e] text-[#061609] font-bold text-sm hover:bg-[#b3cb40] transition shadow-lg cursor-pointer"
          >
            Xem tất cả khóa học
          </Link>
        </div>
      </div>
    </section>
  );
}
