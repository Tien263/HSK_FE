import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#234a29] bg-[#040f06] text-[#9cb396] pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-[#234a29]/60 text-xs">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full border border-white/20 bg-[#0d2816] flex items-center justify-center text-[#c3dc4e] font-black text-sm">
                华
              </div>
              <span className="font-bold text-white text-sm tracking-wide uppercase font-mono">
                HUAYU ACADEMY
              </span>
            </div>
            <p className="text-[#9cb396] leading-relaxed mb-4">
              Hệ thống đào tạo Hán ngữ & Luyện thi HSK cam kết chất lượng đầu ra theo chuẩn Hanban quốc tế.
            </p>
          </div>

          {/* Courses */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 font-mono text-[11px]">
              Khóa học HSK
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="#courses" className="hover:text-white transition">
                  HSK 1 (Sơ cấp 150 từ)
                </Link>
              </li>
              <li>
                <Link href="#courses" className="hover:text-white transition">
                  HSK 2 (Giao tiếp 300 từ)
                </Link>
              </li>
              <li>
                <Link href="#courses" className="hover:text-white transition">
                  HSK 3 (Đột phá 600 từ)
                </Link>
              </li>
              <li>
                <Link href="#courses" className="hover:text-white transition">
                  HSK 4 (Du học 1200 từ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 font-mono text-[11px]">
              Hỗ trợ học tập
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="hover:text-white transition">
                  Phương pháp Spaced Repetition
                </Link>
              </li>
              <li>
                <Link href="#courses" className="hover:text-white transition">
                  Bộ đề thi thử trực tuyến
                </Link>
              </li>
              <li>
                <Link href="#process" className="hover:text-white transition">
                  Lộ trình học theo năng lực
                </Link>
              </li>
              <li>
                <Link href="#gallery" className="hover:text-white transition">
                  Tài liệu & Thư viện Hán tự
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 font-mono text-[11px]">
              Liên hệ tư vấn
            </h5>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#c3dc4e]" />
                <span className="text-white">+84 (098) 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#c3dc4e]" />
                <span>tuvankhoahoc@huayu.edu.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c3dc4e]" />
                <span>Hà Nội & TP. Hồ Chí Minh</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#9cb396]/70">
          <div>© 2026 Huayu Academy. All rights reserved.</div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Chính sách bảo mật</span>
            <span className="hover:text-white cursor-pointer">Điều khoản dịch vụ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
