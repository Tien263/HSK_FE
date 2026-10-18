import { ClipboardEdit, MessagesSquare, GraduationCap, Award, ArrowRight } from "lucide-react";

export default function StudyProcess() {
  const steps = [
    {
      num: "1. Đăng ký & Test",
      desc: "Kiểm tra trình độ Hán ngữ miễn phí",
      icon: ClipboardEdit,
    },
    {
      num: "2. Tư vấn lộ trình",
      desc: "Thiết kế kế hoạch học tập cá nhân hóa",
      icon: MessagesSquare,
    },
    {
      num: "3. Học tập & Thi thử",
      desc: "Luyện phát âm & làm đề thi Hanban thực tế",
      icon: GraduationCap,
    },
    {
      num: "4. Cam kết & Nhận bằng",
      desc: "Đạt điểm chuẩn HSK & bảo hành trọn gói",
      icon: Award,
    },
  ];

  return (
    <section id="process" className="py-20 border-t border-[#234a29]/60 max-w-7xl mx-auto px-6 lg:px-12">
      {/* Section Title (Exact reference: Left-aligned bold white) */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-16">
        Quy trình đồng hành cùng học viên
      </h2>

      {/* 4-Step Horizontal Process with Linking Arrows (Exact reference layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 items-center">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-4 group">
              <div className="flex flex-col items-center sm:items-start flex-1 text-center sm:text-left">
                {/* Clean, minimalist line icon floating elegantly (no bulky box) */}
                <div className="w-12 h-12 flex items-center justify-center sm:justify-start text-white/90 group-hover:text-[#c3dc4e] transition-colors mb-4">
                  <Icon className="w-9 h-9 stroke-[1.25]" />
                </div>

                {/* Step Title (e.g. 1. Đăng ký & Test) */}
                <div className="text-sm sm:text-base font-bold text-white mb-1 tracking-tight">
                  {item.num}
                </div>

                {/* Step Subtitle */}
                <div className="text-xs text-[#9cb396] leading-relaxed">
                  {item.desc}
                </div>
              </div>

              {/* Connecting Arrow between steps on desktop (Exact reference style) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center px-2 text-[#9cb396]/60">
                  <ArrowRight className="w-6 h-6 stroke-[1.2]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
