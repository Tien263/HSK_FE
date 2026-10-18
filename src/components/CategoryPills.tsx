import { MessageSquare, BookOpen, PenTool, Landmark, Layers, Users } from "lucide-react";

export default function CategoryPills() {
  const categories = [
    { icon: MessageSquare, label: "Giao Tiếp" },
    { icon: BookOpen, label: "Từ Vựng HSK" },
    { icon: PenTool, label: "Ngữ Pháp" },
    { icon: Landmark, label: "Văn Hóa Hán Tự" },
    { icon: Layers, label: "Thẻ Flashcard" },
    { icon: Users, label: "Cộng Đồng" },
  ];

  return (
    <section id="categories" className="py-8 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="flex items-center justify-center gap-8 sm:gap-14 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <button
              key={idx}
              className="flex flex-col items-center gap-2.5 shrink-0 group focus:outline-none"
            >
              <div className="w-14 h-14 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 shadow-sm group-hover:border-[#e86a24] group-hover:text-[#e86a24] group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                <Icon className="w-5 h-5 stroke-[1.6]" />
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-[#e86a24] transition">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
