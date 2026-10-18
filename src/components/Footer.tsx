import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer id="about" className="border-t border-white/10 bg-[#080b16] text-slate-400 py-16 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand Col */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold font-serif text-lg">
              汉
            </div>
            <span className="text-xl font-bold font-serif text-white tracking-wider">
              HSK MASTER
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Nền tảng học và ôn tập HSK tiếng Trung trực tuyến miễn phí. Đồng hành cùng bạn trên con
            đường chinh phục Hán ngữ từ con số 0.
          </p>
          <div className="text-xs text-amber-300/80 font-mono">
            千里之行，始于足下 (Hành trình ngàn dặm bắt đầu từ một bước chân)
          </div>
        </div>

        {/* Links Col 1: Cấp độ HSK */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white font-mono mb-4">
            Cấp độ HSK
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="#levels" className="hover:text-amber-300 transition">
                HSK 1 - Sơ cấp (150 từ)
              </Link>
            </li>
            <li>
              <Link href="#levels" className="hover:text-amber-300 transition">
                HSK 2 - Giao tiếp cơ bản (300 từ)
              </Link>
            </li>
            <li>
              <Link href="#levels" className="hover:text-amber-300 transition">
                HSK 3 - Đời sống & Du lịch (600 từ)
              </Link>
            </li>
            <li>
              <Link href="#levels" className="hover:text-amber-300 transition">
                HSK 4 - Du học Trung Quốc (1200 từ)
              </Link>
            </li>
            <li>
              <Link href="#levels" className="hover:text-amber-300 transition">
                HSK 5 & 6 - Cao cấp (2500 - 5000 từ)
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Col 2: Tính năng */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white font-mono mb-4">
            Tính năng học tập
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="#demo-flashcard" className="hover:text-amber-300 transition">
                Flashcard Hán tự thông minh
              </Link>
            </li>
            <li>
              <Link href="#exams" className="hover:text-amber-300 transition">
                Thi thử HSK trực tuyến
              </Link>
            </li>
            <li>
              <Link href="#levels" className="hover:text-amber-300 transition">
                Audio phát âm chuẩn bản xứ
              </Link>
            </li>
            <li>
              <Link href="#about" className="hover:text-amber-300 transition">
                Lặp lại ngắt quãng (Spaced Repetition)
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Col 3: Hạ tầng & Thông tin */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white font-mono mb-4">
            Hạ tầng & Công nghệ
          </h4>
          <p className="text-xs text-slate-400 mb-3">
            Xây dựng với bộ công nghệ hiện đại Next.js App Router, Prisma ORM và máy chủ PostgreSQL Serverless 0đ.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Trực tuyến 24/7 • Miễn phí
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          © 2026 HSK Master • Thiết kế lấy cảm hứng Á Đông thanh lịch.
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          Xây dựng bằng tình yêu Hán ngữ và công nghệ <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
        </div>
      </div>
    </footer>
  );
}
