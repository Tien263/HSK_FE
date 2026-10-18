"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

interface LevelCard {
  level: number;
  title: string;
  subtitle: string;
  words: number;
  rating: number;
  imageUrl: string;
  tag: string;
}

const levels: LevelCard[] = [
  {
    level: 1,
    title: "HSK Cấp 1",
    subtitle: "Nhập môn Hán tự & Pinyin",
    words: 150,
    rating: 4.9,
    imageUrl:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80",
    tag: "150 từ",
  },
  {
    level: 2,
    title: "HSK Cấp 2",
    subtitle: "Giao tiếp đời sống & du lịch",
    words: 300,
    rating: 4.8,
    imageUrl:
      "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=800&q=80",
    tag: "300 từ",
  },
  {
    level: 3,
    title: "HSK Cấp 3",
    subtitle: "Trung cấp đàm thoại tự tin",
    words: 600,
    rating: 4.9,
    imageUrl:
      "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=800&q=80",
    tag: "600 từ",
  },
  {
    level: 4,
    title: "HSK Cấp 4",
    subtitle: "Đạt chuẩn du học Trung Quốc",
    words: 1200,
    rating: 4.7,
    imageUrl:
      "https://images.unsplash.com/photo-1513415564515-763d91423bdd?auto=format&fit=crop&w=800&q=80",
    tag: "1200 từ",
  },
];

export default function PopularLevels() {
  return (
    <section id="levels" className="py-14 max-w-7xl mx-auto px-6 lg:px-12">
      {/* Header Row (Pomaii style) */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Cấp Độ HSK Phổ Biến</span>
            <span className="text-emerald-600 text-xl">🌿</span>
          </h2>
        </div>
        <Link
          href="#categories"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#e86a24] transition group"
        >
          <span>Xem tất cả cấp độ</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {levels.map((item) => (
          <Link
            key={item.level}
            href="#guides"
            className="group relative h-[360px] rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 block"
          >
            {/* Background Image */}
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            {/* Top Star Rating Pill */}
            <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-md text-white text-xs font-semibold">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{item.rating}</span>
            </div>

            {/* Bottom Content */}
            <div className="absolute inset-x-0 bottom-0 p-5 z-10 flex items-end justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-white/80 mt-1 font-normal">{item.subtitle}</p>
              </div>

              {/* Orange word count tag */}
              <div className="text-[#e86a24] font-bold text-base tracking-tight shrink-0 pl-2">
                {item.tag}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
