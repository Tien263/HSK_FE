"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Play,
  X,
  User,
  Users,
  Compass,
  FileText,
  RotateCw,
  HelpCircle,
  Video,
  ListOrdered,
  BookOpenCheck,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Quick 1-click test simulation for student & teacher
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
    <div className="min-h-screen bg-[#f5f2e9] text-[#173d2d] font-sans selection:bg-[#1a3d2f] selection:text-white relative overflow-x-hidden">
      {/* ===================== FLOATING ONE-CLICK TEST PILL (BOTTOM-RIGHT) ===================== */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-[#1a3d2f]/95 text-white shadow-2xl border border-white/20 backdrop-blur-md text-[11px] font-bold">
        <span className="px-2 py-0.5 text-emerald-300">🧪 Thử vai:</span>
        <button
          type="button"
          onClick={() => handleQuickLogin("STUDENT")}
          className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/30 text-white transition flex items-center gap-1 cursor-pointer"
          title="Đăng nhập thử vai Học sinh (Bạn Thảo)"
        >
          <span>Học sinh (Thảo)</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickLogin("TEACHER")}
          className="px-3 py-1 rounded-full bg-[#991b1b] hover:bg-[#b91c1c] text-white transition flex items-center gap-1 cursor-pointer shadow-xs"
          title="Đăng nhập thử vai Giáo viên (Cô Ning Ning)"
        >
          <span>Giáo viên (Cô Ning Ning)</span>
        </button>
      </div>

      {/* ===================== HEADER / NAVBAR (Exact Mockup Match) ===================== */}
      <header className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between relative z-30">
        {/* Logo Left */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-xl">🍃</span>
          <div className="leading-tight">
            <span className="font-serif font-bold text-2xl text-[#173d2d] tracking-tight block">
              Hanyu
            </span>
            <span className="text-[10px] text-[#6b8271] tracking-widest block font-serif">
              学中文 见更大的世界
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#4d6356]">
          <a href="#pillars" className="hover:text-[#173d2d] transition">
            HSK 3.0
          </a>
          <a href="#pillars" className="hover:text-[#173d2d] transition">
            Theo chủ đề
          </a>
          <a href="#pillars" className="hover:text-[#173d2d] transition">
            Chuyên ngành
          </a>
          <a href="#roadmap" className="hover:text-[#173d2d] transition">
            Lộ trình
          </a>
          <a href="#practice" className="hover:text-[#173d2d] transition">
            Luyện tập
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-8 h-8 rounded-full border border-[#dcd4c3] flex items-center justify-center text-[#4d6356] hover:text-[#173d2d] transition cursor-pointer"
            title="Tìm kiếm"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full border border-[#dcd4c3] bg-transparent hover:bg-white/50 text-xs font-semibold text-[#173d2d] transition"
          >
            Đăng nhập
          </Link>

          <Link
            href="/register"
            className="px-5 py-1.5 rounded-full bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition shadow-xs flex items-center gap-1.5"
          >
            <span>Bắt đầu học</span>
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* Search popup dropdown */}
      {searchOpen && (
        <div className="max-w-xl mx-auto px-6 mb-4 animate-in fade-in duration-150">
          <div className="p-2 rounded-2xl bg-white border border-[#e6decb] shadow-lg flex items-center gap-2">
            <Search className="w-4 h-4 text-[#8c9a8f] ml-3" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm khóa học: HSK 1, Gia đình, Mua sắm, Ngữ pháp chữ 把..."
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

      {/* ===================== HERO SECTION (100% Mockup Match) ===================== */}
      <section className="relative pt-6 pb-16 md:pb-24 px-6 max-w-6xl mx-auto">
        {/* Right Art: Master Leaf, Chinese Calligraphy 汉语, Red Seal, Pagoda and Fisherman */}
        <div className="absolute right-0 top-0 w-full md:w-[58%] h-[520px] md:h-[620px] pointer-events-none select-none z-0">
          <Image
            src="/theme/hero-leaf-master.png"
            alt="Hanyu Chinese Calligraphy and Bodhi Leaf"
            fill
            className="object-contain object-right-top"
            priority
          />
        </div>

        {/* Hero Left Content Column */}
        <div className="relative z-10 max-w-lg pt-4 md:pt-12">
          {/* Poetic Sub-tagline */}
          <div className="text-[12px] font-serif tracking-[0.35em] text-[#8c9a8f] uppercase mb-4">
            一 茶 一 世 界 · 一 语 一 未 来
          </div>

          {/* Main Headline (Lora Serif font, exact typography) */}
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-black text-[#173d2d] leading-[1.18] tracking-tight mb-5">
            Học tiếng Trung <br />
            mở ra một <br />
            thế giới lớn hơn
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#4d6356] leading-relaxed mb-7 max-w-md font-sans">
            Hanyu đồng hành cùng bạn trên hành trình chinh phục tiếng Trung với lộ trình bài bản, nội dung thực tiễn và phương pháp hiện đại.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 mb-10">
            <Link
              href="/register"
              className="px-6 py-2.5 rounded-full bg-[#1a3d2f] text-white font-bold text-xs hover:bg-[#122b21] transition shadow-xs flex items-center gap-1.5"
            >
              <span>Bắt đầu học ngay</span>
              <span>→</span>
            </Link>

            <button
              type="button"
              onClick={() => setVideoModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-white/70 border border-[#dcd4c3] text-[#173d2d] font-bold text-xs hover:bg-white transition shadow-2xs flex items-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <div className="w-4 h-4 rounded-full bg-[#1a3d2f] text-white flex items-center justify-center text-[8px]">
                <Play className="w-2 h-2 fill-white ml-0.5" />
              </div>
              <span>Xem video giới thiệu</span>
            </button>
          </div>

          {/* 3 Metric Stats with vertical dividers */}
          <div className="flex items-center gap-6 pt-6 border-t border-[#dcd4c3]/70 max-w-md">
            <div>
              <div className="text-2xl font-serif font-bold text-[#173d2d]">
                50.000+
              </div>
              <p className="text-[11px] text-[#6b8271] mt-0.5">Học viên tin tưởng</p>
            </div>
            <div className="h-7 w-px bg-[#dcd4c3]" />
            <div>
              <div className="text-2xl font-serif font-bold text-[#173d2d]">
                1.000+
              </div>
              <p className="text-[11px] text-[#6b8271] mt-0.5">Bài học chất lượng</p>
            </div>
            <div className="h-7 w-px bg-[#dcd4c3]" />
            <div>
              <div className="text-2xl font-serif font-bold text-[#173d2d]">
                4.9/5
              </div>
              <p className="text-[11px] text-[#6b8271] mt-0.5">Đánh giá từ học viên</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 2: 3 CORE PILLARS (01, 02, 03 - Frameless Mockup Match) ===================== */}
      <section id="pillars" className="py-12 px-6 max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Pillar 01: HSK 3.0 */}
          <div className="flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-4xl font-serif font-light text-[#b8ab97]">
                  01
                </span>
                <div className="w-24 h-16 relative">
                  <Image
                    src="/theme/pillar-01-scroll.png"
                    alt="HSK 3.0 scroll"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold font-serif text-[#173d2d] mb-1.5">
                HSK 3.0
              </h3>
              <p className="text-xs text-[#526056] leading-relaxed mb-4">
                Lộ trình bài bản từ cơ bản đến nâng cao, bao gồm từ vựng, ngữ pháp và luyện đề.
              </p>
            </div>
            <button
              onClick={() => handleQuickLogin("STUDENT")}
              className="text-xs font-bold text-[#173d2d] flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start cursor-pointer"
            >
              <span>Khám phá</span>
              <span>→</span>
            </button>
          </div>

          {/* Pillar 02: Tiếng Trung theo chủ đề */}
          <div className="flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-4xl font-serif font-light text-[#b8ab97]">
                  02
                </span>
                <div className="w-24 h-16 relative">
                  <Image
                    src="/theme/pillar-02-fan.png"
                    alt="Tiếng Trung theo chủ đề fan"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold font-serif text-[#173d2d] mb-1.5">
                Tiếng Trung theo chủ đề
              </h3>
              <p className="text-xs text-[#526056] leading-relaxed mb-4">
                Học tiếng Trung qua những chủ đề gần gũi và thực tế trong cuộc sống.
              </p>
            </div>
            <Link
              href="/s/games"
              className="text-xs font-bold text-[#173d2d] flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start"
            >
              <span>Xem chủ đề</span>
              <span>→</span>
            </Link>
          </div>

          {/* Pillar 03: Tiếng Trung chuyên ngành */}
          <div className="flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-4xl font-serif font-light text-[#b8ab97]">
                  03
                </span>
                <div className="w-24 h-16 relative">
                  <Image
                    src="/theme/pillar-03-books.png"
                    alt="Tiếng Trung chuyên ngành books"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold font-serif text-[#173d2d] mb-1.5">
                Tiếng Trung chuyên ngành
              </h3>
              <p className="text-xs text-[#526056] leading-relaxed mb-4">
                Từ vựng, mẫu câu và tài liệu chuyên sâu cho các ngành: Kinh tế, Du lịch, Thương mại, Công nghệ, Y học...
              </p>
            </div>
            <Link
              href="/register"
              className="text-xs font-bold text-[#173d2d] flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start"
            >
              <span>Xem tài liệu</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 3: HAI HÌNH THỨC HỌC LINH HOẠT (Moon Window Desk) ===================== */}
      <section className="py-14 px-6 max-w-6xl mx-auto">
        <div className="rounded-3xl bg-[#ede6d8] border border-[#dcd4c3] p-6 sm:p-10 relative overflow-hidden shadow-xs">
          {/* Background Moon Window Table Illustration */}
          <div className="absolute left-0 bottom-0 top-0 w-64 md:w-80 pointer-events-none select-none opacity-85">
            <Image
              src="/theme/moon-window-table.png"
              alt="Moon window scholar desk"
              fill
              className="object-contain object-left-bottom"
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column Copy */}
            <div className="lg:col-span-5 pl-0 md:pl-24 pr-4">
              <div className="w-7 h-7 rounded-md bg-[#991b1b] text-white flex items-center justify-center font-serif text-xs font-bold shadow-2xs mb-2.5">
                模式
              </div>
              <span className="text-[10px] font-bold tracking-widest text-[#8c9a8f] uppercase block mb-1">
                TWO LEARNING MODES
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#173d2d] mb-2 leading-tight">
                Hai hình thức học <br />
                linh hoạt
              </h2>
              <p className="text-xs text-[#4d6356] leading-relaxed max-w-xs">
                Lựa chọn phương thức phù hợp với mục tiêu và thời gian của bạn.
              </p>
            </div>

            {/* Right Column: 2 Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Tự học chủ động */}
              <div
                onClick={() => handleQuickLogin("STUDENT")}
                className="p-5 rounded-2xl bg-[#faf7f0] border border-[#dcd4c3] shadow-xs hover:border-[#173d2d] hover:shadow-sm transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-11 h-11 rounded-full bg-[#e2ebe4] text-[#173d2d] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <User className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <h3 className="text-sm font-bold font-serif text-[#173d2d] mb-2.5">
                    Tự học chủ động
                  </h3>
                  <ul className="space-y-1.5 text-[11px] text-[#4d6356] mb-5">
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#3d7b56] font-bold">□</span>
                      <span>Học theo nhịp riêng</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#3d7b56] font-bold">□</span>
                      <span>Có lộ trình đề xuất</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#3d7b56] font-bold">□</span>
                      <span>Hệ thống bài tập đa dạng</span>
                    </li>
                  </ul>
                </div>

                <div className="w-7 h-7 rounded-full bg-[#ede6d8] group-hover:bg-[#1a3d2f] group-hover:text-white text-[#173d2d] flex items-center justify-center text-xs transition">
                  →
                </div>
              </div>

              {/* Card 2: Học cùng giáo viên */}
              <div
                onClick={() => handleQuickLogin("TEACHER")}
                className="p-5 rounded-2xl bg-[#faf7f0] border border-[#dcd4c3] shadow-xs hover:border-[#173d2d] hover:shadow-sm transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-11 h-11 rounded-full bg-[#fef2f2] text-[#991b1b] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <h3 className="text-sm font-bold font-serif text-[#173d2d] mb-2.5">
                    Học cùng giáo viên
                  </h3>
                  <ul className="space-y-1.5 text-[11px] text-[#4d6356] mb-5">
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#991b1b] font-bold">□</span>
                      <span>Tham gia lớp học với giáo viên</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#991b1b] font-bold">□</span>
                      <span>Nhận bài được giao</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#991b1b] font-bold">□</span>
                      <span>Có phản hồi và theo dõi tiến độ</span>
                    </li>
                  </ul>
                </div>

                <div className="w-7 h-7 rounded-full bg-[#ede6d8] group-hover:bg-[#991b1b] group-hover:text-white text-[#173d2d] flex items-center justify-center text-xs transition">
                  →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 4: LỘ TRÌNH HỌC RÕ RÀNG (Mountain Contour Timeline) ===================== */}
      <section id="roadmap" className="py-12 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Title */}
          <div className="lg:col-span-4">
            <h2 className="text-2xl font-serif font-black text-[#173d2d] mb-2 leading-tight">
              Lộ trình học <br />
              rõ ràng, từng bước vững chắc
            </h2>
            <p className="text-xs text-[#526056] leading-relaxed mb-4">
              Từ nền tảng đến ứng dụng thực tế, Hanyu giúp bạn tiến bộ bền vững.
            </p>
            <Link
              href="/s/home"
              className="text-xs font-bold text-[#173d2d] hover:underline flex items-center gap-1"
            >
              <span>Xem chi tiết</span>
              <span>→</span>
            </Link>
          </div>

          {/* Right 4 Steps with connecting mountain contour */}
          <div className="lg:col-span-8 relative">
            <div className="w-full h-12 relative mb-2 opacity-70">
              <Image
                src="/theme/mountain-timeline-contour.png"
                alt="Mountain contour"
                fill
                className="object-contain object-right"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  num: "01",
                  title: "Xây nền tảng",
                  desc: "Làm quen phát âm, chữ Hán và ngữ pháp cơ bản.",
                },
                {
                  num: "02",
                  title: "Phát triển kỹ năng",
                  desc: "Mở rộng vốn từ, luyện nghe - nói - đọc - viết.",
                },
                {
                  num: "03",
                  title: "Ứng dụng thực tế",
                  desc: "Luyện theo chủ đề và ngữ cảnh thực tế.",
                },
                {
                  num: "04",
                  title: "Thành thạo",
                  desc: "Sử dụng tiếng Trung trong học tập, công việc và cuộc sống.",
                },
              ].map((step) => (
                <div key={step.num} className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#173d2d] text-white flex items-center justify-center text-[10px] font-bold font-mono">
                      {step.num}
                    </span>
                    <h4 className="font-bold text-xs font-serif text-[#173d2d]">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#526056] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 5: LUYỆN TẬP & CỦNG CỐ KIẾN THỨC ===================== */}
      <section id="practice" className="py-12 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <h2 className="text-2xl font-serif font-black text-[#173d2d] mb-1">
              Luyện tập & củng cố kiến thức
            </h2>
            <p className="text-xs text-[#526056]">
              Hệ thống bài tập đa dạng giúp bạn ghi nhớ sâu hơn và tiến bộ mỗi ngày.
            </p>
          </div>

          <Link
            href="/s/games"
            className="text-xs font-bold text-[#173d2d] hover:underline flex items-center gap-1 self-start"
          >
            <span>Khám phá ngay</span>
            <span>→</span>
          </Link>
        </div>

        {/* 4 Cards (Exact Mockup Match) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Trắc nghiệm */}
          <div
            onClick={() => handleQuickLogin("STUDENT")}
            className="p-4 rounded-2xl bg-[#ede6d8] border border-[#dcd4c3] hover:border-[#173d2d] transition cursor-pointer flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-white/80 border border-[#dcd4c3] flex items-center justify-center text-[#173d2d] shrink-0">
              <BookOpenCheck className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="font-bold text-xs font-serif text-[#173d2d] mb-1">
                Trắc nghiệm
              </h4>
              <p className="text-[11px] text-[#526056] leading-relaxed">
                Kiểm tra kiến thức nhanh chóng với hệ thống câu hỏi phong phú.
              </p>
            </div>
          </div>

          {/* Card 2: Điền từ vào chỗ trống */}
          <Link
            href="/s/review"
            className="p-4 rounded-2xl bg-[#ede6d8] border border-[#dcd4c3] hover:border-[#173d2d] transition cursor-pointer flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-white/80 border border-[#dcd4c3] flex items-center justify-center text-[#173d2d] shrink-0">
              <FileText className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="font-bold text-xs font-serif text-[#173d2d] mb-1">
                Điền từ vào chỗ trống
              </h4>
              <p className="text-[11px] text-[#526056] leading-relaxed">
                Luyện vững từ vựng và ngữ pháp qua các bài tập thực tế.
              </p>
            </div>
          </Link>

          {/* Card 3: Sắp xếp câu */}
          <Link
            href="/s/games"
            className="p-4 rounded-2xl bg-[#ede6d8] border border-[#dcd4c3] hover:border-[#173d2d] transition cursor-pointer flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-white/80 border border-[#dcd4c3] flex items-center justify-center text-[#173d2d] shrink-0">
              <ListOrdered className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="font-bold text-xs font-serif text-[#173d2d] mb-1">
                Sắp xếp câu
              </h4>
              <p className="text-[11px] text-[#526056] leading-relaxed">
                Rèn luyện tư duy ngữ pháp và khả năng diễn đạt.
              </p>
            </div>
          </Link>

          {/* Card 4: Ôn lại lỗi sai */}
          <Link
            href="/s/practice/wrong"
            className="p-4 rounded-2xl bg-[#ede6d8] border border-[#dcd4c3] hover:border-[#173d2d] transition cursor-pointer flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-white/80 border border-[#dcd4c3] flex items-center justify-center text-[#173d2d] shrink-0">
              <RotateCw className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="font-bold text-xs font-serif text-[#173d2d] mb-1">
                Ôn lại lỗi sai
              </h4>
              <p className="text-[11px] text-[#526056] leading-relaxed">
                Hệ thống tự động ghi nhớ lỗi sai giúp bạn tiến bộ nhanh hơn.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ===================== FOOTER (Curved Deep Pine Green Hill) ===================== */}
      <footer className="bg-[#12281e] text-[#8ea394] pt-14 pb-10 px-6 mt-14 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10 text-xs">
          {/* Brand Left */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🍃</span>
              <span className="font-serif font-black text-2xl text-white tracking-tight">
                Hanyu
              </span>
            </div>
            <p className="text-[11px] font-serif text-[#cbdcd2] mb-3">
              学中文 见更大的世界
            </p>
          </div>

          {/* Về Hanyu */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider mb-2.5 text-[11px]">
              Về Hanyu
            </h4>
            <p className="hover:text-white cursor-pointer transition">Giới thiệu</p>
            <p className="hover:text-white cursor-pointer transition">Đội ngũ giáo viên</p>
            <p className="hover:text-white cursor-pointer transition">Cảm nhận học viên</p>
          </div>

          {/* Học tập */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider mb-2.5 text-[11px]">
              Học tập
            </h4>
            <p className="hover:text-white cursor-pointer transition">HSK 3.0</p>
            <p className="hover:text-white cursor-pointer transition">Theo chủ đề</p>
            <p className="hover:text-white cursor-pointer transition">Chuyên ngành</p>
            <p className="hover:text-white cursor-pointer transition">Lộ trình</p>
          </div>

          {/* Hỗ trợ */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider mb-2.5 text-[11px]">
              Hỗ trợ
            </h4>
            <p className="hover:text-white cursor-pointer transition">Trung tâm trợ giúp</p>
            <p className="hover:text-white cursor-pointer transition">Liên hệ</p>
            <p className="hover:text-white cursor-pointer transition">Chính sách bảo mật</p>
            <p className="hover:text-white cursor-pointer transition">Điều khoản sử dụng</p>
          </div>

          {/* Kết nối với chúng tôi */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-white uppercase tracking-wider mb-2.5 text-[11px]">
              Kết nối với chúng tôi
            </h4>
            <div className="flex items-center gap-2.5 text-base mb-3 text-white/80">
              <span className="cursor-pointer hover:text-white">💬</span>
              <span className="cursor-pointer hover:text-white">▶️</span>
              <span className="cursor-pointer hover:text-white">🎵</span>
              <span className="cursor-pointer hover:text-white">📷</span>
            </div>
            <div className="w-7 h-7 rounded-md bg-[#991b1b] text-white flex items-center justify-center font-serif text-xs font-bold shadow-xs">
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

      {/* ===================== VIDEO MODAL ===================== */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#faf7f0] border border-[#dcd4c3] rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 text-[#526056] hover:text-[#173d2d] p-1.5 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#1a3d2f] text-white flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#173d2d] font-serif">
                  Video Giới Thiệu Không Gian Học Tập Hanyu
                </h3>
                <p className="text-[11px] text-[#526056]">
                  Lộ trình ôn luyện HSK 3.0 cùng cô Ning Ning
                </p>
              </div>
            </div>

            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black relative flex items-center justify-center mb-4">
              <Image
                src="/theme/landing-source-mockup.jpg"
                alt="Video thumbnail"
                fill
                className="object-cover opacity-60"
              />
              <div className="relative z-10 text-center text-white p-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2 border border-white/40 cursor-pointer hover:scale-105 transition">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
                <p className="font-serif text-base font-bold">Lớp Tiếng Trung HSK Chuẩn Quốc Tế</p>
                <p className="text-[11px] text-white/80 mt-0.5">Học bài bản · Nhớ lâu ngắt quãng · Khắc phục lỗi sai</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-[#dcd4c3] text-xs font-semibold text-[#526056]"
              >
                Đóng
              </button>
              <Link
                href="/register"
                className="px-5 py-1.5 rounded-xl bg-[#1a3d2f] text-white text-xs font-bold hover:bg-[#122b21] transition shadow-xs"
              >
                Đăng ký học ngay
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
