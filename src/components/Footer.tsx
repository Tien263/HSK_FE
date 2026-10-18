import Link from "next/link";
import { MessageCircle, Mail, Globe, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#234a29] bg-[#040f06] text-[#9cb396] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#234a29]/60">
          {/* Brand Info */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border border-white/20 bg-[#0d2816] flex items-center justify-center text-[#c3dc4e] font-black text-xl shadow-md">
                宁
              </div>
              <div>
                <span className="font-bold text-white text-base tracking-wide block font-sans">
                  宁宁老师中文课堂
                </span>
                <span className="text-xs text-[#9cb396] block">
                  Lớp tiếng Trung cô Ning Ning
                </span>
              </div>
            </div>
            <p className="text-[#9cb396] text-sm leading-relaxed max-w-sm mb-4">
              Website nội bộ dành cho học viên lớp cô Ning Ning. Không gian ôn bài, luyện đề và chơi game từ vựng mỗi ngày.
            </p>
            <div className="text-xs text-white/80 flex items-center gap-1.5 font-medium">
              <span>加油! Học đều đặn mỗi ngày để tiến bộ</span>
              <Heart className="w-3.5 h-3.5 fill-[#c3dc4e] text-[#c3dc4e]" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h5 className="font-bold text-white uppercase tracking-wider mb-4 font-mono text-xs text-[#c3dc4e]">
              Khu vực học tập
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="#kho-bai-hoc" className="hover:text-white transition">
                  Kho bài học & Ngữ pháp
                </Link>
              </li>
              <li>
                <Link href="#phong-luyen-tap" className="hover:text-white transition">
                  Phòng luyện tập & Sửa câu sai
                </Link>
              </li>
              <li>
                <Link href="#game-center" className="hover:text-white transition">
                  Game Center & Bảng xếp hạng
                </Link>
              </li>
              <li>
                <Link href="#hsk-levels" className="hover:text-white transition">
                  Luyện thi chuẩn HSK 3.0 (Cấp 1 - 9)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="md:col-span-4">
            <h5 className="font-bold text-white uppercase tracking-wider mb-4 font-mono text-xs text-[#c3dc4e]">
              Hỗ trợ tài khoản học viên
            </h5>
            <p className="text-xs text-[#9cb396] mb-3 leading-relaxed">
              Quên mật khẩu hoặc chưa có tài khoản? Liên hệ cô qua các kênh sau để được cấp lại ngay:
            </p>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#c3dc4e] transition text-white"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#c3dc4e]" />
                  <span>Zalo cô Ning Ning: 098.123.4567</span>
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#c3dc4e] transition"
                >
                  <Globe className="w-3.5 h-3.5 text-[#c3dc4e]" />
                  <span>Facebook: Lớp tiếng Trung Cô Ning Ning</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:coningning.tiengtrung@gmail.com"
                  className="flex items-center gap-2 hover:text-[#c3dc4e] transition"
                >
                  <Mail className="w-3.5 h-3.5 text-[#c3dc4e]" />
                  <span>Email: coningning.tiengtrung@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9cb396]/70">
          <div>© 2026 Lớp tiếng Trung cô Ning Ning. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chính sách bảo mật nội bộ</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
