import { BookOpen, Award, Headphones, ShieldCheck } from "lucide-react";

export default function StatsBar() {
  const stats = [
    {
      icon: Award,
      value: "HSK 1 - 6",
      label: "Cấp độ hoàn chỉnh",
      detail: "Chuẩn khung Hanban quốc tế",
    },
    {
      icon: BookOpen,
      value: "5,000+",
      label: "Từ vựng trọng tâm",
      detail: "Kèm Pinyin, Hán tự & ví dụ",
    },
    {
      icon: Headphones,
      value: "100%",
      label: "Có Audio phát âm",
      detail: "Giọng chuẩn Bắc Kinh",
    },
    {
      icon: ShieldCheck,
      value: "0 VNĐ",
      label: "Chi phí học tập",
      detail: "Học & thi thử miễn phí",
    },
  ];

  return (
    <div className="relative z-20 -mt-10 max-w-7xl mx-auto px-6 lg:px-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-2xl bg-[#14192d]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
                  {item.value}
                </div>
                <div className="text-sm font-medium text-slate-200">{item.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
