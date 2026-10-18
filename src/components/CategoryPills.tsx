import { Headphones, BookOpen, PenTool, FileText, Layers, MessageCircle } from "lucide-react";

export default function CategoryPills() {
  const categories = [
    { icon: Headphones, label: "Luyện Nghe" },
    { icon: BookOpen, label: "Từ Vựng HSK" },
    { icon: PenTool, label: "Quy Tắc Bút Thuận" },
    { icon: FileText, label: "Đề Thi Thử" },
    { icon: Layers, label: "Thẻ Flashcard" },
    { icon: MessageCircle, label: "Giao Tiếp Hàng Ngày" },
  ];

  return (
    <section id="categories" className="py-10 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <button
              key={idx}
              className="flex flex-col items-center gap-2.5 shrink-0 group focus:outline-none"
            >
              <div className="w-16 h-16 rounded-full border border-slate-200/90 bg-white flex items-center justify-center text-slate-700 shadow-sm group-hover:border-[#e86a24] group-hover:text-[#e86a24] group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                <Icon className="w-6 h-6 stroke-[1.6]" />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#e86a24] transition">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
