"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CourseCard {
  id: string;
  level: number;
  title: string;
  imageUrl: string;
  bullets: string[];
  price: string;
}

const courses: CourseCard[] = [
  {
    id: "hsk-1",
    level: 1,
    title: "HSK 1 - Sơ Cấp 150",
    imageUrl: "/hsk-images/hsk1.jpg",
    bullets: [
      "Mục tiêu: Nhập môn & chuẩn Pinyin",
      "Từ vựng: 150 từ cốt lõi",
      "Thời lượng: 4 tuần (12 buổi)",
      "Kỹ năng: Nghe & nhận diện chữ",
    ],
    price: "từ 1.250.000 đ",
  },
  {
    id: "hsk-2",
    level: 2,
    title: "HSK 2 - Giao Tiếp 300",
    imageUrl: "/hsk-images/hsk2.jpg",
    bullets: [
      "Mục tiêu: Giao tiếp đời sống hàng ngày",
      "Từ vựng: 300 từ thực tế",
      "Thời lượng: 6 tuần (18 buổi)",
      "Kỹ năng: Mua sắm, du lịch, hỏi đường",
    ],
    price: "từ 1.850.000 đ",
  },
  {
    id: "hsk-3",
    level: 3,
    title: "HSK 3 - Trung Cấp 600",
    imageUrl: "/hsk-images/hsk3.jpg",
    bullets: [
      "Mục tiêu: Đàm thoại tự tin & văn bản ngắn",
      "Từ vựng: 600 từ trọng tâm",
      "Thời lượng: 8 tuần (24 buổi)",
      "Kỹ năng: Giao tiếp công sở cơ bản",
    ],
    price: "từ 2.450.000 đ",
  },
  {
    id: "hsk-4",
    level: 4,
    title: "HSK 4 - Chuẩn Du Học 1200",
    imageUrl: "/hsk-images/hsk4.jpg",
    bullets: [
      "Mục tiêu: Đạt chuẩn apply học bổng ĐH",
      "Từ vựng: 1200 từ chuyên sâu",
      "Thời lượng: 12 tuần (36 buổi)",
      "Kỹ năng: Đọc báo chí & viết đoạn văn",
    ],
    price: "từ 3.250.000 đ",
  },
];

export default function Hero() {
  return (
    <section className="relative w-full pt-4 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Top Hero Grid (Headline on Left, Video Visual on Right) */}
        <div className="grid lg:grid-cols-12 gap-10 items-center mb-16">
          {/* Left Column: Headline, subtext, lime CTA */}
          <div className="lg:col-span-6">
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold text-white tracking-tight leading-[1.18] mb-5">
              Khóa học tiếng Trung chất lượng cao{" "}
              <span className="font-extrabold text-white">cam kết đạt chuẩn HSK sau 3 tháng</span>
            </h1>

            <p className="text-[#8ea797] text-sm sm:text-base leading-relaxed max-w-lg mb-8 font-normal">
              Thiết kế chương trình từ số 0 đến HSK 6, tối ưu thời gian học với phương pháp ghi nhớ
              chữ Hán Spaced Repetition và phản xạ giao tiếp tự nhiên.
            </p>

            <div>
              <button
                onClick={() => alert("Chuyên viên tư vấn Huayu sẽ liên hệ hỗ trợ bạn trong 15 phút!")}
                className="px-7 py-3.5 rounded-lg bg-[#bbcf52] text-[#07190c] font-bold text-sm hover:bg-[#a8be40] transition shadow-lg shadow-lime-900/20 cursor-pointer"
              >
                Tư vấn miễn phí
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Container embedding background video */}
          <div className="lg:col-span-6">
            <div className="relative h-[320px] sm:h-[400px] lg:h-[440px] rounded-3xl overflow-hidden border border-[#1a3d24] shadow-2xl bg-[#0c2514]">
              <video
                autoPlay
                loop
                muted
                playsInline
                poster="/sample-design.jpg"
                className="w-full h-full object-cover object-center"
              >
                <source src="/main-background.mp4" type="video/mp4" />
              </video>
              {/* Subtle green ambient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07190c]/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 4 Level Cards Grid (Exact arched dome card style from reference) */}
        <div id="courses" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {courses.map((item) => (
            <div
              key={item.id}
              className="bg-[#0c2514] border border-[#1a3d24] rounded-2xl p-4 flex flex-col justify-between hover:border-[#bbcf52]/60 transition-all duration-300 group shadow-md"
            >
              <div>
                {/* Arched Dome Image Header (signature element in reference) */}
                <div className="relative h-36 w-full mb-4 rounded-t-full overflow-hidden border border-[#1a3d24]/80 bg-[#07190c]">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Card Title */}
                <h3 className="text-base font-bold text-white mb-3 tracking-wide">
                  {item.title}
                </h3>

                {/* Bullets List with Dot */}
                <ul className="space-y-1.5 text-xs text-[#8ea797] mb-6">
                  {item.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-white/60">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Row: Price on left in Lime, Button on right */}
              <div className="pt-3 border-t border-[#1a3d24]/60 flex items-center justify-between">
                <span className="text-[#bbcf52] font-bold text-sm tracking-tight">
                  {item.price}
                </span>
                <button
                  onClick={() => alert(`Xem chi tiết lộ trình khóa học ${item.title}`)}
                  className="px-3 py-1 rounded border border-white/20 text-white/90 text-xs hover:bg-white/10 transition"
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
            className="px-8 py-3 rounded-lg bg-[#bbcf52] text-[#07190c] font-bold text-sm hover:bg-[#a8be40] transition shadow-md"
          >
            Xem tất cả các khóa học
          </Link>
        </div>
      </div>
    </section>
  );
}
