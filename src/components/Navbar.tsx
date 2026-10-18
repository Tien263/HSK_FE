"use client";

import Link from "next/link";
import { useState } from "react";
import { Phone, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-50 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-6 pb-4 flex items-center justify-between text-white">
      {/* Brand Logo: Circle badge + 2-line brand name */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center bg-[#0d2816]/80 text-[#c3dc4e] font-black text-xl group-hover:border-[#c3dc4e] transition shadow-md">
          <span>华</span>
        </div>
        <div className="leading-tight">
          <span className="font-bold text-white text-[15px] tracking-wider block uppercase font-mono">
            HUAYU ACADEMY
          </span>
          <span className="text-[11px] text-[#9cb396] tracking-wide block font-sans">
            Đào tạo Tiếng Trung & HSK
          </span>
        </div>
      </Link>

      {/* Center Nav Links (Separated by subtle pipe | as in reference) */}
      <nav className="hidden md:flex items-center gap-3 text-[13px] font-medium text-white/90">
        <Link href="/" className="hover:text-[#c3dc4e] transition">
          Trang chủ
        </Link>
        <span className="text-white/30 text-xs font-light">|</span>
        <Link href="#courses" className="text-[#9cb396] hover:text-white transition">
          Khóa học
        </Link>
        <span className="text-white/30 text-xs font-light">|</span>
        <Link href="#about" className="text-[#9cb396] hover:text-white transition">
          Về chúng tôi
        </Link>
        <span className="text-white/30 text-xs font-light">|</span>
        <Link href="#gallery" className="text-[#9cb396] hover:text-white transition">
          Hình ảnh thực tế
        </Link>
        <span className="text-white/30 text-xs font-light">|</span>
        <Link href="#process" className="text-[#9cb396] hover:text-white transition">
          Quy trình
        </Link>
      </nav>

      {/* Right Contact Hotline & Pill Button (Exact reference layout) */}
      <div className="hidden md:flex items-center gap-5">
        <a
          href="tel:0908123456"
          className="text-sm font-semibold text-white tracking-wide hover:text-[#c3dc4e] transition flex items-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5 text-[#c3dc4e]" />
          <span>+84 (098) 123 4567</span>
        </a>
        <button
          onClick={() => alert("Chuyên viên tư vấn Huayu sẽ liên hệ lại với bạn trong 15 phút!")}
          className="border border-white/25 text-white/95 rounded-lg px-5 py-2 text-xs font-semibold hover:border-[#c3dc4e] hover:text-[#c3dc4e] transition bg-white/5 backdrop-blur-sm cursor-pointer"
        >
          Yêu cầu gọi lại
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-2 rounded-lg bg-[#0d2816] border border-white/20 text-white"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 bg-[#0a2012] border border-[#234a29] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-base z-50">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="text-white hover:text-[#c3dc4e]"
          >
            Trang chủ
          </Link>
          <Link
            href="#courses"
            onClick={() => setMobileOpen(false)}
            className="text-[#9cb396] hover:text-white"
          >
            Khóa học HSK
          </Link>
          <Link
            href="#about"
            onClick={() => setMobileOpen(false)}
            className="text-[#9cb396] hover:text-white"
          >
            Về chúng tôi
          </Link>
          <Link
            href="#gallery"
            onClick={() => setMobileOpen(false)}
            className="text-[#9cb396] hover:text-white"
          >
            Hình ảnh thực tế
          </Link>
          <Link
            href="#process"
            onClick={() => setMobileOpen(false)}
            className="text-[#9cb396] hover:text-white"
          >
            Quy trình học tập
          </Link>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <span className="text-xs text-[#9cb396]">+84 (098) 123 4567</span>
            <button
              onClick={() => {
                setMobileOpen(false);
                alert("Chuyên viên tư vấn Huayu sẽ liên hệ lại với bạn!");
              }}
              className="w-full py-2.5 rounded-lg bg-[#c3dc4e] text-[#061609] font-bold text-xs text-center cursor-pointer"
            >
              Yêu cầu gọi lại
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
