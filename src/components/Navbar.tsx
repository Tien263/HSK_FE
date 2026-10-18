"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Heart, Menu, X, Sparkles } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-50 w-full max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
      {/* Brand Logo (Pomaii style) */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e86a24] to-[#f59e0b] flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
          {/* Mountain / Sun organic leaf mark */}
          <span className="text-white font-black text-xl font-serif">华</span>
        </div>
        <div>
          <span className="text-2xl font-black tracking-tight text-slate-900 block leading-tight font-sans">
            Huayu<span className="text-[#e86a24]">.</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide block -mt-0.5">
            Explore. Learn. Discover.
          </span>
        </div>
      </Link>

      {/* Desktop Menu Navigation */}
      <nav className="hidden md:flex items-center gap-9 text-sm font-semibold text-slate-600">
        <Link
          href="/"
          className="text-[#e86a24] relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-[#e86a24] after:rounded-full"
        >
          Trang chủ
        </Link>
        <Link href="#levels" className="hover:text-slate-900 transition">
          Lộ trình HSK
        </Link>
        <Link href="#categories" className="hover:text-slate-900 transition">
          Khóa học
        </Link>
        <Link href="#exams" className="hover:text-slate-900 transition">
          Bộ đề thi
        </Link>
        <Link href="#guides" className="hover:text-slate-900 transition">
          Góc học tập
        </Link>
        <Link href="#about" className="hover:text-slate-900 transition">
          Giới thiệu
        </Link>
      </nav>

      {/* Right Icons (Search, Heart, Menu) */}
      <div className="hidden md:flex items-center gap-3">
        <button
          className="w-10 h-10 rounded-full border border-slate-200/80 bg-white flex items-center justify-center text-slate-600 hover:text-slate-950 hover:border-slate-300 transition shadow-sm"
          aria-label="Tìm kiếm"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          className="w-10 h-10 rounded-full border border-slate-200/80 bg-white flex items-center justify-center text-slate-600 hover:text-rose-500 hover:border-rose-200 transition shadow-sm"
          aria-label="Yêu thích"
        >
          <Heart className="w-4 h-4" />
        </button>
        <button
          className="w-10 h-10 rounded-full border border-slate-200/80 bg-white flex items-center justify-center text-slate-600 hover:text-slate-950 hover:border-slate-300 transition shadow-sm"
          aria-label="Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-base">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="text-[#e86a24] font-semibold"
          >
            Trang chủ
          </Link>
          <Link
            href="#levels"
            onClick={() => setMobileOpen(false)}
            className="text-slate-700 font-medium hover:text-[#e86a24]"
          >
            Lộ trình HSK 1 - 6
          </Link>
          <Link
            href="#categories"
            onClick={() => setMobileOpen(false)}
            className="text-slate-700 font-medium hover:text-[#e86a24]"
          >
            Kỹ năng học tập
          </Link>
          <Link
            href="#exams"
            onClick={() => setMobileOpen(false)}
            className="text-slate-700 font-medium hover:text-[#e86a24]"
          >
            Bộ đề thi thử
          </Link>
          <Link
            href="#guides"
            onClick={() => setMobileOpen(false)}
            className="text-slate-700 font-medium hover:text-[#e86a24]"
          >
            Góc học tập & Mẹo thi
          </Link>
        </div>
      )}
    </header>
  );
}
