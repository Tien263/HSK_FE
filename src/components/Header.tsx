"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="relative z-30 w-full">
      {/* Delicate bamboo leaves hanging in top right corner */}
      <div className="absolute top-0 right-0 w-[160px] sm:w-[220px] md:w-[280px] h-[70px] sm:h-[90px] md:h-[110px] pointer-events-none select-none z-10 opacity-90">
        <Image
          src="/theme/hero-bamboo-top-right.png"
          alt="Bamboo branch decor"
          fill
          className="object-contain object-right-top"
          priority
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between relative z-20">
        {/* Logo Left: leaf sprig + Hanyu + Chinese Slogan */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-xl sm:text-2xl transition-transform group-hover:rotate-6">🍃</span>
          <div className="leading-tight">
            <span className="font-serif font-bold text-2xl text-[#173d2d] tracking-tight block">
              Hanyu
            </span>
            <span className="text-[10px] text-[#6b8271] tracking-widest block font-serif">
              学中文 见更大的世界
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#4d6356]">
          <a href="#courses" className="hover:text-[#173d2d] transition">
            HSK 3.0
          </a>
          <a href="#courses" className="hover:text-[#173d2d] transition">
            Theo chủ đề
          </a>
          <a href="#courses" className="hover:text-[#173d2d] transition">
            Chuyên ngành
          </a>
          <a href="#roadmap" className="hover:text-[#173d2d] transition">
            Lộ trình
          </a>
          <a href="#practice" className="hover:text-[#173d2d] transition">
            Luyện tập
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Search Icon Ghost Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-8 h-8 rounded-full border border-[#dcd4c3] flex items-center justify-center text-[#4d6356] hover:text-[#173d2d] hover:bg-white/40 transition cursor-pointer"
            title="Tìm kiếm khóa học"
            aria-label="Tìm kiếm"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Login Ghost Button */}
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full border border-[#dcd4c3] bg-transparent hover:bg-white/50 text-xs font-semibold text-[#173d2d] transition"
          >
            Đăng nhập
          </Link>

          {/* Primary CTA Button: Pill-shaped, Ink Black / Deep Pine Green */}
          <Link
            href="/register"
            className="px-5 py-1.5 rounded-full bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition shadow-xs flex items-center gap-1.5"
          >
            <span>Bắt đầu học</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Search popup dropdown */}
      {searchOpen && (
        <div className="max-w-xl mx-auto px-6 mb-4 animate-in fade-in duration-150 relative z-30">
          <div className="p-2 rounded-2xl bg-white border border-[#e6decb] shadow-lg flex items-center gap-2">
            <Search className="w-4 h-4 text-[#8c9a8f] ml-3" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm: HSK 1, Gia đình, Mua sắm, Ngữ pháp chữ 把..."
              className="w-full text-xs text-[#1a3d2f] outline-none px-2 py-1.5 bg-transparent"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="p-1 rounded-full text-[#8c9a8f] hover:text-[#1a3d2f] cursor-pointer"
              aria-label="Đóng tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
