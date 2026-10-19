"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-[#12281e] text-[#a4b5aa] pt-14 pb-10 px-6 overflow-hidden">
      {/* Decorative top hill curved line */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-[#f7efe2] rounded-b-[100%] scale-x-125 pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-10 border-b border-[#234234]/70 relative z-10 text-xs">
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
        <div className="md:col-span-2 space-y-2">
          <h4 className="font-bold text-white uppercase tracking-wider mb-2.5 text-[11px]">
            Về Hanyu
          </h4>
          <p className="hover:text-white cursor-pointer transition">Giới thiệu</p>
          <p className="hover:text-white cursor-pointer transition">Đội ngũ giáo viên</p>
          <p className="hover:text-white cursor-pointer transition">Cảm nhận học viên</p>
        </div>

        {/* Col 3: Học tập */}
        <div className="md:col-span-2 space-y-2">
          <h4 className="font-bold text-white uppercase tracking-wider mb-2.5 text-[11px]">
            Học tập
          </h4>
          <p className="hover:text-white cursor-pointer transition">HSK 3.0</p>
          <p className="hover:text-white cursor-pointer transition">Theo chủ đề</p>
          <p className="hover:text-white cursor-pointer transition">Chuyên ngành</p>
          <p className="hover:text-white cursor-pointer transition">Lộ trình</p>
        </div>

        {/* Col 4: Hỗ trợ */}
        <div className="md:col-span-2 space-y-2">
          <h4 className="font-bold text-white uppercase tracking-wider mb-2.5 text-[11px]">
            Hỗ trợ
          </h4>
          <p className="hover:text-white cursor-pointer transition">Trung tâm trợ giúp</p>
          <p className="hover:text-white cursor-pointer transition">Liên hệ</p>
          <p className="hover:text-white cursor-pointer transition">Chính sách bảo mật</p>
          <p className="hover:text-white cursor-pointer transition">Điều khoản sử dụng</p>
        </div>

        {/* Col 5: Kết nối với chúng tôi */}
        <div className="md:col-span-2">
          <h4 className="font-bold text-white uppercase tracking-wider mb-2.5 text-[11px]">
            Kết nối với chúng tôi
          </h4>
          <div className="flex items-center gap-2.5 text-base mb-3 text-white/80">
            <span className="cursor-pointer hover:text-white" title="WeChat">💬</span>
            <span className="cursor-pointer hover:text-white" title="YouTube">▶️</span>
            <span className="cursor-pointer hover:text-white" title="TikTok">🎵</span>
            <span className="cursor-pointer hover:text-white" title="Instagram">📷</span>
          </div>
          <div className="w-7 h-7 rounded-md bg-[#991b1b] text-white flex items-center justify-center font-serif text-xs font-bold shadow-xs select-none" title="Ấn triện cô Ning Ning">
            宁
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6d8274]">
        <p>© 2026 Hanyu · Lớp tiếng Trung cô Ning Ning</p>
        <p className="mt-1 sm:mt-0 font-serif">
          Hán Ngữ Truyền Thống & Nền Tảng Học Tập Thông Minh
        </p>
      </div>
    </footer>
  );
}
