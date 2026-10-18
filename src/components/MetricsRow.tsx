import { BookOpen, Users, Star, Clock } from "lucide-react";

export default function MetricsRow() {
  const metrics = [
    { icon: BookOpen, value: "100+", label: "Bộ đề thi thử HSK" },
    { icon: Users, value: "50,000+", label: "Học viên luyện tập" },
    { icon: Star, value: "4.9★", label: "Đánh giá chất lượng" },
    { icon: Clock, value: "24/7", label: "Học tập mọi lúc mọi nơi" },
  ];

  return (
    <section className="py-12 border-t border-slate-200/60 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-800 shadow-sm shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {m.value}
                </div>
                <div className="text-xs text-slate-500 font-medium">{m.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
