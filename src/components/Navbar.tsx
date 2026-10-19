"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogIn, Sparkles } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-50 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-6 pb-4 flex items-center justify-between text-white">
      {/* Brand Logo: Circle badge + 2-line brand name */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center bg-[#0d2816]/80 text-[#c3dc4e] font-black text-xl group-hover:border-[#c3dc4e] transition shadow-md">
          <span>宁</span>
        </div>
        <div className="leading-tight">
          <span className="font-bold text-white text-[15px] tracking-wider block font-sans">
            宁宁老师中文课堂
          </span>
          <span className="text-[11px] text-[#9cb396] tracking-wide block font-sans">
            Lớp tiếng Trung cô Ning Ning
          </span>
        </div>
      </Link>

      {/* Center Nav Links (Separated by subtle pipe | as in menu request) */}
      <nav className="hidden lg:flex items-center gap-2.5 text-[13px] font-medium text-white/90">
        <Link href="/" className="hover:text-[#c3dc4e] transition">
          Trang chủ
        </Link>
        <span className="text-white/25 text-xs font-light">|</span>
        <Link href="#kho-bai-hoc" className="text-[#9cb396] hover:text-white transition">
          Kho bài học
        </Link>
        <span className="text-white/25 text-xs font-light">|</span>
        <Link href="/s/home" className="text-[#9cb396] hover:text-white transition">
          Phòng luyện tập
        </Link>
        <span className="text-white/25 text-xs font-light">|</span>
        <Link href="/s/games" className="text-[#9cb396] hover:text-white transition">
          Game Center
        </Link>
        <span className="text-white/25 text-xs font-light">|</span>
        <Link href="/t/dashboard" className="text-[#9cb396] hover:text-white transition">
          Báo cáo lớp
        </Link>
      </nav>

      {/* Right Login & Teacher Portal Buttons */}
      <div className="hidden lg:flex items-center gap-3">
        <Link
          href="/t/dashboard"
          className="bg-[#c3dc4e] text-[#061609] rounded-lg px-4 py-2 text-xs font-bold hover:bg-[#b3cb40] transition shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <span>🐼 Trang cô giáo</span>
        </Link>

        <Link
          href="/login"
          className="border border-white/25 text-white/95 rounded-lg px-4 py-2 text-xs font-semibold hover:border-[#c3dc4e] hover:text-[#c3dc4e] transition bg-white/5 backdrop-blur-sm cursor-pointer flex items-center gap-1.5"
        >
          <LogIn className="w-3.5 h-3.5 text-[#c3dc4e]" />
          <span>Đăng nhập</span>
        </Link>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden p-2 rounded-lg bg-[#0d2816] border border-white/20 text-white"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-4 right-4 bg-[#0a2012] border border-[#234a29] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-base z-50">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="text-white hover:text-[#c3dc4e]"
          >
            Trang chủ
          </Link>
          <Link
            href="#kho-bai-hoc"
            onClick={() => setMobileOpen(false)}
            className="text-[#9cb396] hover:text-white"
          >
            Kho bài học
          </Link>
          <Link
            href="/s/home"
            onClick={() => setMobileOpen(false)}
            className="text-[#9cb396] hover:text-white"
          >
            Phòng luyện tập
          </Link>
          <Link
            href="/s/games"
            onClick={() => setMobileOpen(false)}
            className="text-[#9cb396] hover:text-white"
          >
            Game Center
          </Link>
          <Link
            href="/t/dashboard"
            onClick={() => setMobileOpen(false)}
            className="text-[#9cb396] hover:text-white"
          >
            Báo cáo lớp
          </Link>

          <div className="pt-4 border-t border-[#234a29] flex flex-col gap-3">
            <Link
              href="/t/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-[#c3dc4e] text-[#061609] font-bold text-xs"
            >
              🐼 Trang cô giáo
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-white/20 text-white text-xs font-semibold"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
