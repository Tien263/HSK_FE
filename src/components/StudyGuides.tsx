import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

export default function StudyGuides() {
  const guides = [
    {
      id: "guide-1",
      title: "10 bí quyết nhớ 5,000 chữ Hán theo bộ thủ không bao giờ quên",
      readTime: "5 phút đọc",
      imageUrl: "/hsk-images/guide-hanzi.jpg",
    },
    {
      id: "guide-2",
      title: "Chiến thuật luyện phản xạ Nghe HSK 1 - 6 đạt điểm tuyệt đối",
      readTime: "4 phút đọc",
      imageUrl: "/hsk-images/guide-listening.jpg",
    },
  ];

  return (
    <section id="guides" className="py-12 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="relative bg-[#f4f2ee] rounded-[2.5rem] p-8 sm:p-12 lg:p-14 overflow-hidden">
        {/* Subtle watercolor botanical decoration in bottom right corner (exact Pomaii style) */}
        <div className="absolute right-0 bottom-0 w-36 h-36 opacity-30 pointer-events-none select-none">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M120 40C90 45 70 70 75 120C85 85 105 60 120 40Z"
              fill="#22c55e"
              fillOpacity="0.4"
            />
            <path
              d="M120 70C100 75 85 90 90 120C100 95 110 80 120 70Z"
              fill="#16a34a"
              fillOpacity="0.5"
            />
          </svg>
        </div>

        <div className="relative z-10 grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Column Text & CTA */}
          <div className="lg:col-span-5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono block mb-3">
              Cần định hướng?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Bí Kíp & Cẩm Nang Chinh Phục HSK
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
              Tổng hợp kinh nghiệm học từ vựng nhớ lâu, mẹo làm phần thi nghe không bị bẫy và
              chiến lược phân bổ thời gian phòng thi từ các thủ khoa HSK.
            </p>

            <Link
              href="#exams"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#183226] text-white font-semibold text-sm hover:bg-[#11241b] transition shadow-md shadow-emerald-950/10 group"
            >
              <span>Đọc cẩm nang thi</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Column 2 Horizontal Cards */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
            {guides.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={g.imageUrl}
                    alt={g.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#e86a24] transition line-clamp-2 leading-snug">
                    {g.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{g.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
