"use client";

import Link from "next/link";
import { useState } from "react";
import { Phone, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-50 w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between text-white text-sm">
      {/* Brand Logo (Exact style: Circle badge + Brand name) */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-[#0d2e17] text-[#bbcf52] font-black text-lg group-hover:border-[#bbcf52] transition">
          <span>华</span>
        </div>
        <div className="leading-tight">
          <span className="font-bold text-white text-base tracking-wide block uppercase font-mono">
            HUAYU ACADEMY
          </span>
          <span className="text-[10px] text-[#8ea797] tracking-wider block font-sans">
            Đào tạo Hán ngữ & HSK
          </span>
        </div>
      </Link>

      {/* Center Nav Links (Separated by subtle vertical pipe | as in reference) */}
      <nav className="hidden md:flex items-center gap-2 text-xs font-medium text-[#8ea797]">
        <Link href="/" className="text-white hover:text-[#bbcf52] transition px-2">
          Trang chủ
        </Link>
        <span className="opacity-40">|</span>
        <Link href="#courses" className="hover:text-white transition px-2">
          Khóa học HSK
        </Link>
        <span className="opacity-40">|</span>
        <Link href="#about" className="hover:text-white transition px-2">
          Về chúng tôi
        </Link>
        <span className="opacity-40">|</span>
        <Link href="#gallery" className="hover:text-white transition px-2">
          Hoạt động
        </Link>
        <span className="opacity-40">|</span>
        <Link href="#process" className="hover:text-white transition px-2">
          Quy trình
        </Link>
      </nav>

      {/* Right Contact Hotline & Button (Exact reference layout) */}
      <div className="hidden md:flex items-center gap-5">
        <div className="text-xs font-semibold text-white tracking-wider flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-[#bbcf52]" />
          <span>+84 (0) 908 123 456</span>
        </div>
        <button
          onClick={() => alert("Hệ thống tư vấn viên Huayu sẵn sàng liên hệ hỗ trợ bạn!")}
          className="border border-white/20 text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-white/10 transition backdrop-blur-sm"
        >
          Yêu cầu gọi lại
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-2 rounded-lg bg-[#0d2e17] border border-white/20 text-white"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 bg-[#0a2313] border border-[#1a3d24] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-base z-50">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="text-white hover:text-[#bbcf52]"
          >
            Trang chủ
          </Link>
          <Link
            href="#courses"
            onClick={() => setMobileOpen(false)}
            className="text-[#8ea797] hover:text-white"
          >
            Khóa học HSK 1 - 6
          </Link>
          <Link
            href="#about"
            onClick={() => setMobileOpen(false)}
            className="text-[#8ea797] hover:text-white"
          >
            Về Huayu
          </Link>
          <Link
            href="#gallery"
            onClick={() => setMobileOpen(false)}
            className="text-[#8ea797] hover:text-white"
          >
            Hình ảnh lớp học
          </Link>
          <Link
            href="#process"
            onClick={() => setMobileOpen(false)}
            className="text-[#8ea797] hover:text-white"
          >
            Quy trình học tập
          </Link>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <span className="text-xs text-[#8ea797]">+84 (0) 908 123 456</span>
            <button
              onClick={() => {
                setMobileOpen(false);
                alert("Hệ thống tư vấn viên sẵn sàng liên hệ bạn!");
              }}
              className="w-full py-2.5 rounded-lg bg-[#bbcf52] text-[#07190c] font-bold text-xs text-center"
            >
              Yêu cầu gọi lại
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
