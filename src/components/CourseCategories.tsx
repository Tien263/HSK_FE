"use client";

import Link from "next/link";
import Image from "next/image";

export default function CourseCategories() {
  return (
    <section id="courses" className="py-12 sm:py-16 px-6 max-w-6xl mx-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
        {/* ===================== PILLAR 01: HSK 3.0 ===================== */}
        <div className="flex flex-col justify-between group bg-[#faf6ed]/60 rounded-3xl p-6 border border-[#ded5c2]/70 hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl font-serif font-light text-[#b8ab97] select-none">
                01
              </span>
              <div className="w-24 h-20 relative rounded-2xl overflow-hidden shadow-xs border border-[#ded5c2]/80 bg-[#f7efe2]">
                <Image
                  src="/theme/icon-course-01.jpg"
                  alt="HSK 3.0 Sách cổ và cuộn thư"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <h3 className="text-lg font-bold font-serif text-[#173d2d] mb-2">
              HSK 3.0
            </h3>
            <p className="text-xs text-[#44554a] leading-relaxed mb-5 font-sans">
              Lộ trình bài bản từ cơ bản đến nâng cao, bám sát đề thi mới nhất với hệ thống bài học, từ vựng, ngữ pháp và luyện đề toàn diện.
            </p>
          </div>
          <Link
            href="/s/home"
            className="text-xs font-bold text-[#173d2d] flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start pt-2 border-t border-[#ded5c2]/60 w-full justify-between"
          >
            <span>Khám phá lộ trình</span>
            <span className="text-sm">→</span>
          </Link>
        </div>

        {/* ===================== PILLAR 02: Tiếng Trung theo chủ đề ===================== */}
        <div className="flex flex-col justify-between group bg-[#faf6ed]/60 rounded-3xl p-6 border border-[#ded5c2]/70 hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl font-serif font-light text-[#b8ab97] select-none">
                02
              </span>
              <div className="w-24 h-20 relative rounded-2xl overflow-hidden shadow-xs border border-[#ded5c2]/80 bg-[#f7efe2]">
                <Image
                  src="/theme/icon-course-02.jpg"
                  alt="Tiếng Trung theo chủ đề Quạt giấy và trúc"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <h3 className="text-lg font-bold font-serif text-[#173d2d] mb-2">
              Tiếng Trung theo chủ đề
            </h3>
            <p className="text-xs text-[#44554a] leading-relaxed mb-5 font-sans">
              Học tiếng Trung qua những chủ đề gần gũi và thực tế trong cuộc sống như giao tiếp, du lịch, mua sắm, công việc và đời sống thường ngày.
            </p>
          </div>
          <Link
            href="/s/home"
            className="text-xs font-bold text-[#173d2d] flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start pt-2 border-t border-[#ded5c2]/60 w-full justify-between"
          >
            <span>Khám phá chủ đề</span>
            <span className="text-sm">→</span>
          </Link>
        </div>

        {/* ===================== PILLAR 03: Tiếng Trung chuyên ngành ===================== */}
        <div className="flex flex-col justify-between group bg-[#faf6ed]/60 rounded-3xl p-6 border border-[#ded5c2]/70 hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl font-serif font-light text-[#b8ab97] select-none">
                03
              </span>
              <div className="w-24 h-20 relative rounded-2xl overflow-hidden shadow-xs border border-[#ded5c2]/80 bg-[#f7efe2]">
                <Image
                  src="/theme/icon-course-03.jpg"
                  alt="Tiếng Trung chuyên ngành Sách và mũ tốt nghiệp"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <h3 className="text-lg font-bold font-serif text-[#173d2d] mb-2">
              Tiếng Trung chuyên ngành
            </h3>
            <p className="text-xs text-[#44554a] leading-relaxed mb-5 font-sans">
              Từ vựng, mẫu câu và tài liệu chuyên sâu cho các ngành như Kinh tế, Du lịch, Thương mại, Công nghệ, Y học và nhiều lĩnh vực khác.
            </p>
          </div>
          <Link
            href="/s/home"
            className="text-xs font-bold text-[#173d2d] flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start pt-2 border-t border-[#ded5c2]/60 w-full justify-between"
          >
            <span>Khám phá chuyên ngành</span>
            <span className="text-sm">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
