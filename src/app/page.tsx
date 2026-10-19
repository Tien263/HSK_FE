"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Play,
  Check,
  User,
  Users,
  Compass,
  BookOpen,
  HelpCircle,
  FileText,
  RotateCw,
  Sparkles,
  X,
  GraduationCap,
  ChevronRight,
  Video,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Quick 1-click test simulation
  const handleQuickLogin = (role: "STUDENT" | "TEACHER") => {
    if (role === "STUDENT") {
      const studentUser = {
        id: "student",
        username: "student",
        name: "Thảo",
        role: "STUDENT",
        currentHskLevel: 3,
        totalXp: 450,
        streakDays: 7,
      };
      localStorage.setItem("currentUser", JSON.stringify(studentUser));
      router.push("/s/home");
    } else {
      const teacherUser = {
        id: "teacher",
        username: "teacher",
        name: "Cô Ning Ning",
        role: "TEACHER",
      };
      localStorage.setItem("currentUser", JSON.stringify(teacherUser));
      router.push("/t/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1a3d2f] font-sans selection:bg-[#1a3d2f] selection:text-white relative overflow-x-hidden">
      {/* ===================== TOP TEST SIMULATION BANNER ===================== */}
      <div className="bg-[#1a3d2f] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[#2d5644] sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-emerald-100">
            Hệ thống học tiếng Trung Hanyu · Đăng nhập kiểm thử 1-chạm:
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin("STUDENT")}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
          >
            <User className="w-3.5 h-3.5 text-emerald-300" />
            <span>Thử vai Học sinh (Bạn Thảo)</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin("TEACHER")}
            className="px-3 py-1 rounded-full bg-[#991b1b] hover:bg-[#b91c1c] text-white font-bold transition flex items-center gap-1.5 cursor-pointer border border-red-400/30 shadow-xs"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-200" />
            <span>Thử vai Giáo viên (Cô Ning Ning)</span>
          </button>
        </div>
      </div>

      {/* ===================== HEADER / NAVBAR ===================== */}
      <header className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between relative z-40">
        {/* Brand Left */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#1a3d2f] text-white flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
            🍃
          </div>
          <div>
            <span className="font-serif font-black text-2xl text-[#1a3d2f] tracking-tight block leading-tight">
              Hanyu
            </span>
            <span className="text-[10px] text-[#6b8271] tracking-widest block font-serif">
              学中文 见更大的世界
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#526056]">
          <a href="#pillars" className="hover:text-[#1a3d2f] transition">
            HSK 3.0
          </a>
          <a href="#pillars" className="hover:text-[#1a3d2f] transition">
            Theo chủ đề
          </a>
          <a href="#pillars" className="hover:text-[#1a3d2f] transition">
            Chuyên ngành
          </a>
          <a href="#roadmap" className="hover:text-[#1a3d2f] transition">
            Lộ trình
          </a>
          <a href="#practice" className="hover:text-[#1a3d2f] transition">
            Luyện tập
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-8 h-8 rounded-full bg-white/70 border border-[#e6decb] flex items-center justify-center text-[#526056] hover:text-[#1a3d2f] transition cursor-pointer"
            title="Tìm kiếm bài học"
          >
            <Search className="w-4 h-4" />
          </button>

          <Link
            href="/login"
            className="px-4 py-2 rounded-full border border-[#d8ceb9] bg-white/60 hover:bg-white text-xs font-bold text-[#1a3d2f] transition shadow-xs"
          >
            Đăng nhập
          </Link>

          <Link
            href="/register"
            className="px-5 py-2 rounded-full bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition shadow-xs flex items-center gap-1.5"
          >
            <span>Bắt đầu học</span>
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* Search dropdown modal if opened */}
      {searchOpen && (
        <div className="max-w-xl mx-auto px-6 mb-4 animate-in fade-in duration-150">
          <div className="p-2 rounded-2xl bg-white border border-[#e6decb] shadow-lg flex items-center gap-2">
            <Search className="w-4 h-4 text-[#8c9a8f] ml-3" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm: HSK 1, Gia đình, Mua sắm, Ngữ pháp chữ 把..."
              className="w-full text-xs text-[#1a3d2f] outline-none px-2 py-1.5 bg-transparent"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="p-1 rounded-full text-[#8c9a8f] hover:text-[#1a3d2f]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative pt-6 pb-20 md:pb-32 px-6 max-w-7xl mx-auto">
        {/* Right Art: Giant Green Bodhi/Tea Leaf & Shanshui Landscape */}
        <div className="absolute right-0 top-0 w-full md:w-3/5 h-[560px] md:h-[680px] pointer-events-none select-none z-0 opacity-90 md:opacity-100">
          <Image
            src="/theme/landing-hero-leaf.jpg"
            alt="Traditional Chinese Shanshui Landscape and Leaf"
            fill
            className="object-contain object-right-top"
            priority
          />
          {/* Subtle gradient blend to ivory background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f7f4ee] via-[#f7f4ee]/30 to-transparent" />
        </div>

        {/* Hero Left Content Column */}
        <div className="relative z-10 max-w-xl pt-6 md:pt-14">
          {/* Poetic Sub-tagline */}
          <div className="text-[13px] font-serif tracking-[0.3em] text-[#8c9a8f] uppercase mb-4">
            一 茶 一 世 界 · 一 语 一 未 来
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-[#1a3d2f] leading-[1.15] tracking-tight mb-6">
            Học tiếng Trung <br />
            mở ra một <br />
            thế giới lớn hơn
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-[#526056] leading-relaxed mb-8 max-w-md font-sans">
            Hanyu đồng hành cùng bạn trên hành trình chinh phục tiếng Trung với lộ trình bài bản, nội dung thực tiễn và phương pháp hiện đại.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Link
              href="/register"
              className="px-7 py-3.5 rounded-full bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#122b21] transition shadow-md shadow-[#1a3d2f]/15 flex items-center gap-2"
            >
              <span>Bắt đầu học ngay</span>
              <span>→</span>
            </Link>

            <button
              type="button"
              onClick={() => setVideoModalOpen(true)}
              className="px-6 py-3.5 rounded-full bg-white/80 border border-[#e6decb] text-[#1a3d2f] font-bold text-xs hover:bg-white transition shadow-xs flex items-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <div className="w-5 h-5 rounded-full bg-[#1a3d2f] text-white flex items-center justify-center text-[10px]">
                <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
              </div>
              <span>Xem video giới thiệu</span>
            </button>
          </div>

          {/* 3 Metric Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#e6decb]/80 max-w-md">
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1a3d2f]">
                50.000+
              </div>
              <p className="text-[11px] text-[#6b8271] mt-0.5">Học viên tin tưởng</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1a3d2f]">
                1.000+
              </div>
              <p className="text-[11px] text-[#6b8271] mt-0.5">Bài học chất lượng</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1a3d2f]">
                4.9/5
              </div>
              <p className="text-[11px] text-[#6b8271] mt-0.5">Đánh giá từ học viên</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 2: 3 CORE PILLARS (01, 02, 03) ===================== */}
      <section id="pillars" className="py-16 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Pillar 01 */}
          <div className="rounded-3xl p-8 bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <span className="text-3xl font-serif font-light text-[#8c9a8f] block mb-4">
                01
              </span>
              <div className="w-full h-36 relative mb-6 rounded-2xl overflow-hidden bg-[#f7f4ee]">
                <Image
                  src="/theme/card-scroll.jpg"
                  alt="HSK 3.0 scroll"
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#1a3d2f] mb-2">
                HSK 3.0
              </h3>
              <p className="text-xs text-[#526056] leading-relaxed mb-6">
                Lộ trình bài bản từ cơ bản đến nâng cao, bao gồm từ vựng, ngữ pháp và luyện đề chuẩn quốc tế.
              </p>
            </div>
            <button
              onClick={() => handleQuickLogin("STUDENT")}
              className="text-xs font-bold text-[#1a3d2f] flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start"
            >
              <span>Vào học lộ trình</span>
              <span>→</span>
            </button>
          </div>

          {/* Pillar 02 */}
          <div className="rounded-3xl p-8 bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <span className="text-3xl font-serif font-light text-[#8c9a8f] block mb-4">
                02
              </span>
              <div className="w-full h-36 relative mb-6 rounded-2xl overflow-hidden bg-[#f7f4ee]">
                <Image
                  src="/theme/card-fan.jpg"
                  alt="Chủ đề folding fan"
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#1a3d2f] mb-2">
                Tiếng Trung theo chủ đề
              </h3>
              <p className="text-xs text-[#526056] leading-relaxed mb-6">
                Học tiếng Trung qua những chủ đề gần gũi và thực tế trong đời sống: giao tiếp, ăn uống, du lịch.
              </p>
            </div>
            <Link
              href="/s/games"
              className="text-xs font-bold text-[#1a3d2f] flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start"
            >
              <span>Khám phá chủ đề</span>
              <span>→</span>
            </Link>
          </div>

          {/* Pillar 03 */}
          <div className="rounded-3xl p-8 bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <span className="text-3xl font-serif font-light text-[#8c9a8f] block mb-4">
                03
              </span>
              <div className="w-full h-36 relative mb-6 rounded-2xl overflow-hidden bg-[#f7f4ee]">
                <Image
                  src="/theme/card-books.jpg"
                  alt="Chuyên ngành books"
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#1a3d2f] mb-2">
                Tiếng Trung chuyên ngành
              </h3>
              <p className="text-xs text-[#526056] leading-relaxed mb-6">
                Từ vựng, mẫu câu và tài liệu chuyên sâu cho các ngành: Kinh tế, Du lịch, Thương mại, Công nghệ, Y học...
              </p>
            </div>
            <Link
              href="/register"
              className="text-xs font-bold text-[#1a3d2f] flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start"
            >
              <span>Tài liệu chuyên ngành</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 3: HAI HÌNH THỨC HỌC LINH HOẠT ===================== */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-[#f0eee6] border border-[#e6decb] p-8 sm:p-12 relative overflow-hidden shadow-xs">
          {/* Background Illustration: Circular Moon Window & Scholar Desk */}
          <div className="absolute left-0 bottom-0 top-0 w-full md:w-1/2 pointer-events-none opacity-20 md:opacity-35 select-none">
            <Image
              src="/theme/landing-moon-desk.jpg"
              alt="Moon window scholar desk"
              fill
              className="object-cover object-left"
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column Copy */}
            <div className="lg:col-span-5 pr-4">
              <div className="w-8 h-8 rounded-lg bg-[#991b1b] text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs mb-3">
                模式
              </div>
              <span className="text-[11px] font-bold tracking-widest text-[#8c9a8f] uppercase block mb-1">
                TWO LEARNING MODES
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1a3d2f] mb-3 leading-tight">
                Hai hình thức học <br />
                linh hoạt
              </h2>
              <p className="text-xs sm:text-sm text-[#526056] leading-relaxed max-w-sm">
                Lựa chọn phương thức phù hợp với mục tiêu và thời gian của bạn.
              </p>
            </div>

            {/* Right Column: 2 Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Card 1: Tự học chủ động */}
              <div
                onClick={() => handleQuickLogin("STUDENT")}
                className="p-6 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#e2ebe4] text-[#1a3d2f] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="text-base font-bold font-serif text-[#1a3d2f] mb-3">
                    Tự học chủ động
                  </h3>
                  <ul className="space-y-2 text-xs text-[#526056] mb-6">
                    <li className="flex items-center gap-2">
                      <span className="text-[#3d7b56] font-bold">✓</span>
                      <span>Học theo nhịp riêng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#3d7b56] font-bold">✓</span>
                      <span>Có lộ trình đề xuất</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#3d7b56] font-bold">✓</span>
                      <span>Hệ thống bài tập đa dạng</span>
                    </li>
                  </ul>
                </div>

                <div className="w-9 h-9 rounded-full bg-[#f0eee6] group-hover:bg-[#1a3d2f] group-hover:text-white text-[#1a3d2f] flex items-center justify-center text-sm transition">
                  →
                </div>
              </div>

              {/* Card 2: Học cùng giáo viên */}
              <div
                onClick={() => handleQuickLogin("TEACHER")}
                className="p-6 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#fef2f2] text-[#991b1b] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="text-base font-bold font-serif text-[#1a3d2f] mb-3">
                    Học cùng giáo viên
                  </h3>
                  <ul className="space-y-2 text-xs text-[#526056] mb-6">
                    <li className="flex items-center gap-2">
                      <span className="text-[#991b1b] font-bold">✓</span>
                      <span>Tham gia lớp học với giáo viên</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#991b1b] font-bold">✓</span>
                      <span>Nhận bài được giao & tài liệu</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#991b1b] font-bold">✓</span>
                      <span>Có phản hồi và theo dõi tiến độ</span>
                    </li>
                  </ul>
                </div>

                <div className="w-9 h-9 rounded-full bg-[#f0eee6] group-hover:bg-[#991b1b] group-hover:text-white text-[#1a3d2f] flex items-center justify-center text-sm transition">
                  →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 4: LỘ TRÌNH HỌC RÕ RÀNG ===================== */}
      <section id="roadmap" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1a3d2f] mb-2">
              Lộ trình học <br />
              rõ ràng, từng bước vững chắc
            </h2>
            <p className="text-xs sm:text-sm text-[#526056]">
              Từ nền tảng đến ứng dụng thực tế, Hanyu giúp bạn tiến bộ bền vững.
            </p>
          </div>

          <Link
            href="/s/home"
            className="text-xs font-bold text-[#1a3d2f] hover:underline flex items-center gap-1 self-start"
          >
            <span>Xem chi tiết lộ trình</span>
            <span>→</span>
          </Link>
        </div>

        {/* 4 Steps Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              num: "01",
              title: "Xây nền tảng",
              desc: "Làm quen phát âm, chữ Hán và ngữ pháp cơ bản.",
            },
            {
              num: "02",
              title: "Phát triển kỹ năng",
              desc: "Mở rộng vốn từ, rèn luyện nghe - nói - đọc - viết toàn diện.",
            },
            {
              num: "03",
              title: "Ứng dụng thực tế",
              desc: "Luyện theo chủ đề và ngữ cảnh giao tiếp đời sống thực tế.",
            },
            {
              num: "04",
              title: "Thành thạo",
              desc: "Sử dụng tiếng Trung trong học tập, công việc và thi cử HSK.",
            },
          ].map((st, idx) => (
            <div
              key={st.num}
              className="p-6 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs relative"
            >
              <div className="w-8 h-8 rounded-full bg-[#1a3d2f] text-white flex items-center justify-center text-xs font-bold font-mono mb-4">
                {st.num}
              </div>
              <h3 className="text-base font-bold font-serif text-[#1a3d2f] mb-2">
                {st.title}
              </h3>
              <p className="text-xs text-[#526056] leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SECTION 5: LUYỆN TẬP & CỦNG CỐ KIẾN THỨC ===================== */}
      <section id="practice" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1a3d2f] mb-2">
              Luyện tập & củng cố kiến thức
            </h2>
            <p className="text-xs sm:text-sm text-[#526056]">
              Hệ thống bài tập đa dạng giúp bạn ghi nhớ sâu hơn và tiến bộ mỗi ngày.
            </p>
          </div>

          <Link
            href="/s/games"
            className="text-xs font-bold text-[#1a3d2f] hover:underline flex items-center gap-1 self-start"
          >
            <span>Khám phá ngay</span>
            <span>→</span>
          </Link>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Trắc nghiệm */}
          <div
            onClick={() => handleQuickLogin("STUDENT")}
            className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#f0eee6] text-[#1a3d2f] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-sm text-[#1a3d2f] mb-1 font-serif">
                Trắc nghiệm
              </h3>
              <p className="text-[11px] text-[#526056] leading-relaxed">
                Kiểm tra kiến thức nhanh chóng với hệ thống câu hỏi phong phú.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#3d7b56] mt-4 flex items-center gap-1">
              <span>Làm bài kiểm tra</span>
              <span>→</span>
            </span>
          </div>

          {/* Card 2: Điền từ vào chỗ trống */}
          <Link
            href="/s/review"
            className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#e2ebe4] text-[#3d7b56] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-sm text-[#1a3d2f] mb-1 font-serif">
                Điền từ vào chỗ trống
              </h3>
              <p className="text-[11px] text-[#526056] leading-relaxed">
                Luyện vững từ vựng và ngữ pháp qua các bài tập thẻ Leitner.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#3d7b56] mt-4 flex items-center gap-1">
              <span>Ôn từ vựng</span>
              <span>→</span>
            </span>
          </Link>

          {/* Card 3: Sắp xếp câu */}
          <Link
            href="/s/games"
            className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#fff7ed] text-[#c2410c] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-sm text-[#1a3d2f] mb-1 font-serif">
                Sắp xếp câu & Ghép thẻ
              </h3>
              <p className="text-[11px] text-[#526056] leading-relaxed">
                Rèn luyện tư duy ngữ pháp và phản xạ nhanh qua trò chơi từ vựng.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#c2410c] mt-4 flex items-center gap-1">
              <span>Đấu trường game</span>
              <span>→</span>
            </span>
          </Link>

          {/* Card 4: Ôn lại lỗi sai */}
          <Link
            href="/s/practice/wrong"
            className="p-5 rounded-3xl bg-[#fcfaf7] border border-[#e6decb] shadow-xs hover:border-[#1a3d2f] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#fef2f2] text-[#991b1b] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <RotateCw className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-sm text-[#1a3d2f] mb-1 font-serif">
                Ôn lại lỗi sai
              </h3>
              <p className="text-[11px] text-[#526056] leading-relaxed">
                Hệ thống tự động ghi nhớ câu làm sai giúp bạn khắc phục lỗ hổng nhanh hơn.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#991b1b] mt-4 flex items-center gap-1">
              <span>Mở sổ tay câu sai</span>
              <span>→</span>
            </span>
          </Link>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-[#122b21] text-[#94a89d] pt-16 pb-12 px-6 mt-16 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xl">🍃</span>
              <span className="font-serif font-black text-2xl text-white tracking-tight">
                Hanyu
              </span>
            </div>
            <p className="text-xs font-serif text-[#cbdcd2] mb-4">
              学中文 见更大的世界
            </p>
            <p className="text-xs text-[#8c9e94] max-w-sm leading-relaxed">
              Nền tảng ôn luyện HSK 3.0 thông minh theo phong cách Hán ngữ hiện đại, đồng hành cùng bạn trên mọi nẻo đường học vấn.
            </p>
          </div>

          {/* Col 2: Về Hanyu */}
          <div className="md:col-span-2 text-xs space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Về Hanyu</h4>
            <p className="hover:text-white cursor-pointer transition">Giới thiệu</p>
            <p className="hover:text-white cursor-pointer transition">Đội ngũ giáo viên</p>
            <p className="hover:text-white cursor-pointer transition">Cảm nhận học viên</p>
          </div>

          {/* Col 3: Học tập */}
          <div className="md:col-span-2 text-xs space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Học tập</h4>
            <p className="hover:text-white cursor-pointer transition">HSK 3.0</p>
            <p className="hover:text-white cursor-pointer transition">Theo chủ đề</p>
            <p className="hover:text-white cursor-pointer transition">Chuyên ngành</p>
            <p className="hover:text-white cursor-pointer transition">Lộ trình học</p>
          </div>

          {/* Col 4: Hỗ trợ */}
          <div className="md:col-span-2 text-xs space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Hỗ trợ</h4>
            <p className="hover:text-white cursor-pointer transition">Trung tâm trợ giúp</p>
            <p className="hover:text-white cursor-pointer transition">Liên hệ cô Ning Ning</p>
            <p className="hover:text-white cursor-pointer transition">Chính sách bảo mật</p>
            <p className="hover:text-white cursor-pointer transition">Điều khoản sử dụng</p>
          </div>

          {/* Col 5: Kết nối */}
          <div className="md:col-span-2 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Kết nối với chúng tôi</h4>
            <div className="flex items-center gap-3 text-lg mb-4">
              <span className="cursor-pointer hover:scale-110 transition">💬</span>
              <span className="cursor-pointer hover:scale-110 transition">▶️</span>
              <span className="cursor-pointer hover:scale-110 transition">🎵</span>
              <span className="cursor-pointer hover:scale-110 transition">📷</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#991b1b] text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs">
              宁
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#71857a]">
          <p>© 2026 Hanyu · Lớp tiếng Trung cô Ning Ning. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-serif">
            Hán Ngữ Truyền Thống & Công Nghệ Học Tập Thông Minh
          </p>
        </div>
      </footer>

      {/* ===================== VIDEO MODAL ===================== */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#fcfaf7] border border-[#e6decb] rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 text-[#526056] hover:text-[#1a3d2f] p-1.5 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#1a3d2f] text-white flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1a3d2f] font-serif">
                  Khám phá không gian học tập Hanyu
                </h3>
                <p className="text-xs text-[#526056]">
                  Lớp tiếng Trung thông minh chuẩn HSK 3.0 cùng cô Ning Ning
                </p>
              </div>
            </div>

            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black relative flex items-center justify-center mb-5">
              <Image
                src="/theme/landing-hero-leaf.jpg"
                alt="Video thumbnail"
                fill
                className="object-cover opacity-60"
              />
              <div className="relative z-10 text-center text-white p-4">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/40 cursor-pointer hover:scale-105 transition">
                  <Play className="w-6 h-6 fill-white ml-1" />
                </div>
                <p className="font-serif text-lg font-bold">Lộ trình học bài bản từ HSK 1 đến HSK 6</p>
                <p className="text-xs text-white/80 mt-1">Ghi nhớ từ vựng ngắt quãng 5 Hộp · Sổ tay câu sai · Bảng thi đấu</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#e6decb] text-xs font-bold text-[#526056]"
              >
                Đóng
              </button>
              <Link
                href="/register"
                className="px-5 py-2 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition shadow-xs"
              >
                Đăng ký học thử ngay
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
