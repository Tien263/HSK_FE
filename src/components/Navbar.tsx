"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Sparkles, Menu, X, GraduationCap, FileCheck } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 lg:px-16 py-6 flex items-center justify-between text-white">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition">
          <span className="text-xl font-bold font-serif text-slate-950">汉</span>
        </div>
        <div>
          <span className="text-xl font-bold tracking-wider font-serif block leading-none">
            HSK MASTER
          </span>
          <span className="text-[10px] text-amber-300/80 tracking-widest font-mono uppercase">
            华语研习 • Chinese Academy
          </span>
        </div>
      </Link>

      {/* Desktop Menu Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-white/90">
        <Link href="#levels" className="hover:text-amber-300 transition flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-amber-400" />
          Lộ trình HSK
        </Link>
        <Link href="#vocab" className="hover:text-amber-300 transition flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-amber-400" />
          Học từ vựng
        </Link>
        <Link href="#exams" className="hover:text-amber-300 transition flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-amber-400" />
          Thi thử Online
        </Link>
        <Link href="#about" className="hover:text-amber-300 transition">
          Về phương pháp
        </Link>
      </div>

      {/* Action CTA */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          href="#levels"
          className="px-5 py-2 rounded-md text-sm font-medium text-white border border-white/30 backdrop-blur-md hover:bg-white/15 hover:border-white/60 transition shadow-sm"
        >
          Đăng ký học thử
        </Link>
      </div>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-md bg-white/10 backdrop-blur-md text-white"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 bg-[#121629]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-base">
          <Link
            href="#levels"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-white hover:text-amber-300"
          >
            <GraduationCap className="w-5 h-5 text-amber-400" />
            Lộ trình HSK 1 - 6
          </Link>
          <Link
            href="#vocab"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-white hover:text-amber-300"
          >
            <BookOpen className="w-5 h-5 text-amber-400" />
            Học từ vựng Flashcard
          </Link>
          <Link
            href="#exams"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-white hover:text-amber-300"
          >
            <FileCheck className="w-5 h-5 text-amber-400" />
            Bộ đề thi thử miễn phí
          </Link>
          <div className="pt-4 border-t border-white/10">
            <Link
              href="#levels"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center block py-3 rounded-lg bg-amber-500 text-slate-950 font-semibold"
            >
              Bắt đầu học ngay
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
