"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-[#12281e] text-[#a4b5aa] pt-0 pb-12 overflow-hidden">
      {/* Multi-layered Rolling Green Mountain Wave Hills (SVG Crest) */}
      <div className="w-full overflow-hidden leading-none select-none pointer-events-none -mt-1 bg-transparent">
        <svg
          viewBox="0 0 1440 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[60px] sm:h-[80px] md:h-[105px] object-cover"
          preserveAspectRatio="none"
        >
          {/* Base Paper Background */}
          <rect width="1440" height="110" fill="#f7efe2" />

          {/* Layer 1: Rear Misty Sage Green Mountain Ridge */}
          <path
            d="M0,65 C180,45 360,75 560,50 C760,25 960,65 1160,35 C1300,15 1380,40 1440,30 L1440,110 L0,110 Z"
            fill="#324f3d"
            opacity="0.45"
          />

          {/* Layer 2: Middle Atmospheric Hill Contour */}
          <path
            d="M0,80 C220,55 420,90 640,65 C840,40 1060,75 1280,50 C1380,40 1420,55 1440,45 L1440,110 L0,110 Z"
            fill="#1e3a2b"
            opacity="0.8"
          />

          {/* Layer 3: Foreground Deep Pine Green Mountain Hill */}
          <path
            d="M0,95 C160,75 320,105 520,80 C720,55 920,95 1120,70 C1280,50 1380,80 1440,65 L1440,110 L0,110 Z"
            fill="#12281e"
          />
        </svg>
      </div>

      {/* Main Footer Links & Content */}
      <div className="max-w-6xl mx-auto px-6 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-10 border-b border-[#234234]/70 relative z-10 text-xs">
          {/* Col 1: Logo & Slogan */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-xl">🍃</span>
              <span className="font-serif font-bold text-2xl text-white tracking-tight">
                Hanyu
              </span>
            </Link>
            <p className="text-[11px] text-[#7d9485] font-serif tracking-widest uppercase mb-3">
              学中文 见更大的世界
            </p>
            <p className="text-xs text-[#8ca394] leading-relaxed max-w-sm">
              Nền tảng học tiếng Trung kết hợp thẩm mỹ truyền thống và công nghệ hiện đại. Cùng bạn mở rộng chân trời và chạm tới ước mơ.
            </p>
          </div>

          {/* Col 2: Về Hanyu */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">
              Về Hanyu
            </h4>
            <p className="hover:text-white cursor-pointer transition">Giới thiệu</p>
            <p className="hover:text-white cursor-pointer transition">Đội ngũ giáo viên</p>
            <p className="hover:text-white cursor-pointer transition">Cảm nhận học viên</p>
          </div>

          {/* Col 3: Học tập */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">
              Học tập
            </h4>
            <p className="hover:text-white cursor-pointer transition">HSK 3.0</p>
            <p className="hover:text-white cursor-pointer transition">Theo chủ đề</p>
            <p className="hover:text-white cursor-pointer transition">Chuyên ngành</p>
            <p className="hover:text-white cursor-pointer transition">Lộ trình</p>
          </div>

          {/* Col 4: Hỗ trợ */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">
              Hỗ trợ
            </h4>
            <p className="hover:text-white cursor-pointer transition">Trung tâm trợ giúp</p>
            <p className="hover:text-white cursor-pointer transition">Liên hệ</p>
            <p className="hover:text-white cursor-pointer transition">Chính sách bảo mật</p>
            <p className="hover:text-white cursor-pointer transition">Điều khoản sử dụng</p>
          </div>

          {/* Col 5: Kết nối với chúng tôi */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">
              Kết nối với chúng tôi
            </h4>
            <div className="flex items-center gap-2.5 text-base mb-4 text-white/80">
              <span className="cursor-pointer hover:text-white" title="WeChat">💬</span>
              <span className="cursor-pointer hover:text-white" title="YouTube">▶️</span>
              <span className="cursor-pointer hover:text-white" title="TikTok">🎵</span>
              <span className="cursor-pointer hover:text-white" title="Instagram">📷</span>
            </div>
            <div
              className="w-7 h-7 rounded-sm bg-[#a8383b] text-white flex items-center justify-center font-serif text-xs font-bold shadow-xs select-none"
              title="Ấn triện cô Ning Ning"
            >
              宁
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6d8274]">
          <p>© 2026 Hanyu · Lớp tiếng Trung cô Ning Ning</p>
          <p className="mt-1 sm:mt-0 font-serif">
            Hán Ngữ Truyền Thống & Nền Tảng Học Tập Thông Minh
          </p>
        </div>
      </div>
    </footer>
  );
}
