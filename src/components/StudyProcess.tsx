import { FileEdit, MessageSquare, BookOpenCheck, Award, ArrowRight } from "lucide-react";

export default function StudyProcess() {
  const steps = [
    {
      step: "1. Đăng ký & Test",
      desc: "Kiểm tra trình độ Hán ngữ miễn phí",
      icon: FileEdit,
    },
    {
      step: "2. Tư vấn lộ trình",
      desc: "Lên kế hoạch học tập theo mục tiêu",
      icon: MessageSquare,
    },
    {
      step: "3. Học tương tác",
      desc: "Học chữ Hán & luyện đề thực chiến",
      icon: BookOpenCheck,
    },
    {
      step: "4. Thi thử & Chứng chỉ",
      desc: "Cam kết đạt điểm chuẩn kỳ thi HSK",
      icon: Award,
    },
  ];

  return (
    <section id="process" className="py-20 border-t border-[#1a3d24]/60 max-w-7xl mx-auto px-6 lg:px-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-14">
        Quy trình học tập & cam kết đầu ra
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex flex-col items-center sm:items-start relative group">
              {/* Icon in delicate white line with subtle hover effect */}
              <div className="w-14 h-14 rounded-2xl border border-[#1a3d24] bg-[#0c2514] flex items-center justify-center text-white mb-5 group-hover:border-[#bbcf52] group-hover:text-[#bbcf52] transition shadow-md">
                <Icon className="w-6 h-6 stroke-[1.5]" />
              </div>

              {/* Title & Description */}
              <h4 className="text-sm font-bold text-white mb-1.5">{item.step}</h4>
              <p className="text-xs text-[#8ea797] text-center sm:text-left">{item.desc}</p>

              {/* Subtle connecting arrow (between steps on large screens) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 -right-4 text-[#1a3d24]">
                  <ArrowRight className="w-4 h-4 text-[#8ea797]/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
