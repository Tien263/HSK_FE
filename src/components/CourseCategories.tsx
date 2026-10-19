"use client";

import Link from "next/link";
import Image from "next/image";

export default function CourseCategories() {
  return (
    <section id="courses" className="py-12 px-6 max-w-6xl mx-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
        {/* ===================== PILLAR 01: HSK 3.0 ===================== */}
        <div className="flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl font-serif font-light text-[#b8ab97] select-none">
                01
              </span>
              <div className="w-24 h-16 relative rounded-xl overflow-hidden shadow-2xs">
                <Image
                  src="/theme/card-scroll.jpg"
                  alt="HSK 3.0 cuộn thư pháp cổ"
                  fill
                  className="object-cover"
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
          <Link
            href="/s/home"
            className="text-xs font-bold text-[#173d2d] flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start"
          >
            <span>Khám phá</span>
            <span>→</span>
          </Link>
        </div>

        {/* ===================== PILLAR 02: Tiếng Trung theo chủ đề ===================== */}
        <div className="flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl font-serif font-light text-[#b8ab97] select-none">
                02
              </span>
              <div className="w-24 h-16 relative rounded-xl overflow-hidden shadow-2xs">
                <Image
                  src="/theme/card-fan.jpg"
                  alt="Tiếng Trung theo chủ đề quạt xòe"
                  fill
                  className="object-cover"
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
            href="/s/home"
            className="text-xs font-bold text-[#173d2d] flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start"
          >
            <span>Khám phá</span>
            <span>→</span>
          </Link>
        </div>

        {/* ===================== PILLAR 03: Tiếng Trung chuyên ngành ===================== */}
        <div className="flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl font-serif font-light text-[#b8ab97] select-none">
                03
              </span>
              <div className="w-24 h-16 relative rounded-xl overflow-hidden shadow-2xs">
                <Image
                  src="/theme/card-books.jpg"
                  alt="Tiếng Trung chuyên ngành chồng sách cổ"
                  fill
                  className="object-cover"
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
            href="/s/home"
            className="text-xs font-bold text-[#173d2d] flex items-center gap-1 group-hover:translate-x-1 transition-transform self-start"
          >
            <span>Khám phá</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
