import Link from "next/link";

export default function Footer() {
  return (
    <footer id="about" className="border-t border-slate-200/80 bg-white text-slate-600 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-100">
          {/* Brand Col */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group inline-block">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e86a24] to-[#f59e0b] flex items-center justify-center text-white font-serif font-black text-lg">
                华
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                Huayu<span className="text-[#e86a24]">.</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-4">
              Nền tảng học và ôn tập HSK tiếng Trung trực tuyến miễn phí. Thiết kế hiện đại, bám sát
              cấu trúc đề Hanban và tối ưu trải nghiệm học tập trên mọi thiết bị.
            </p>
            <div className="text-xs text-slate-400 font-mono">
              千里之行，始于足下 (Hành trình ngàn dặm bắt đầu từ một bước chân)
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-4">
              Lộ trình HSK
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="#levels" className="hover:text-[#e86a24] transition">
                  HSK 1 (150 từ vựng)
                </Link>
              </li>
              <li>
                <Link href="#levels" className="hover:text-[#e86a24] transition">
                  HSK 2 (300 từ vựng)
                </Link>
              </li>
              <li>
                <Link href="#levels" className="hover:text-[#e86a24] transition">
                  HSK 3 (600 từ vựng)
                </Link>
              </li>
              <li>
                <Link href="#levels" className="hover:text-[#e86a24] transition">
                  HSK 4 (1200 từ vựng)
                </Link>
              </li>
              <li>
                <Link href="#levels" className="hover:text-[#e86a24] transition">
                  HSK 5 & 6 (Cao cấp)
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-4">
              Tính năng
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="#categories" className="hover:text-[#e86a24] transition">
                  Thẻ Flashcard thông minh
                </Link>
              </li>
              <li>
                <Link href="#exams" className="hover:text-[#e86a24] transition">
                  Thi thử HSK trực tuyến
                </Link>
              </li>
              <li>
                <Link href="#categories" className="hover:text-[#e86a24] transition">
                  Luyện nghe phát âm chuẩn
                </Link>
              </li>
              <li>
                <Link href="#guides" className="hover:text-[#e86a24] transition">
                  Kinh nghiệm ôn thi
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / Contact Col */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-4">
              Nhận tài liệu ôn thi HSK
            </h4>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Đăng ký để nhận thông báo đề thi thử mới nhất và bộ từ vựng tổng hợp miễn phí.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 text-xs focus:outline-none focus:border-[#e86a24] bg-[#faf9f5]"
              />
              <button className="px-5 py-2.5 rounded-full bg-[#183226] text-white text-xs font-semibold hover:bg-[#11241b] transition shrink-0">
                Đăng ký
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>© 2026 Huayu HSK. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-600 cursor-pointer">Điều khoản sử dụng</span>
            <span className="hover:text-slate-600 cursor-pointer">Chính sách bảo mật</span>
            <span className="hover:text-slate-600 cursor-pointer">Hỗ trợ 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
