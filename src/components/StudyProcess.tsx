import Link from "next/link";
import { KeyRound, FileCheck2, Gamepad2, TrendingUp, ArrowRight } from "lucide-react";

export default function StudyProcess() {
  const steps = [
    {
      num: "Bước 1",
      title: "Đăng nhập bằng tài khoản cô cấp",
      desc: "Sử dụng thông tin tài khoản được cấp riêng để vào phòng học cá nhân.",
      icon: KeyRound,
      href: "/login",
    },
    {
      num: "Bước 2",
      title: "Làm bài được giao trong phòng luyện tập",
      desc: "Làm bài tập đúng hạn với bộ câu hỏi sát giáo trình bài học.",
      icon: FileCheck2,
      href: "/s/home",
    },
    {
      num: "Bước 3",
      title: "Luyện lại câu sai và chơi game để nhớ từ",
      desc: "Hệ thống gom riêng câu sai và mở game từ vựng để em ghi nhớ sâu sắc.",
      icon: Gamepad2,
      href: "/s/practice/wrong",
    },
    {
      num: "Bước 4",
      title: "Xem tiến độ và lên cấp cùng cả lớp",
      desc: "Theo dõi điểm kinh nghiệm (XP), nhận xét của cô và thăng hạng cấp độ HSK.",
      icon: TrendingUp,
      href: "/s/home",
    },
  ];

  return (
    <section id="process" className="py-24 border-t border-[#234a29]/60 max-w-7xl mx-auto px-6 lg:px-12">
      {/* Section Header */}
      <div className="max-w-3xl mb-16">
        <div className="text-xs font-semibold text-[#c3dc4e] uppercase tracking-widest mb-3 font-mono">
          LỘ TRÌNH 4 BƯỚC HỌC TẬP HIỆU QUẢ
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
          Cách học tại đây
        </h2>
        <p className="text-[#9cb396] text-sm sm:text-base leading-relaxed">
          Đơn giản, đều đặn mỗi ngày. Em chỉ cần làm theo 4 bước sau để luôn bám sát tiến độ của cả lớp.
        </p>
      </div>

      {/* 4 Steps Horizontal Flow with Connecting Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 items-start">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="flex items-start gap-4 group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#c3dc4e]/60 hover:bg-[#0a2012] transition-all"
            >
              <div className="flex flex-col items-center sm:items-start flex-1 text-center sm:text-left">
                {/* Minimalist Floating Line Icon */}
                <div className="w-12 h-12 flex items-center justify-center sm:justify-start text-white/90 group-hover:text-[#c3dc4e] transition-colors mb-4">
                  <Icon className="w-9 h-9 stroke-[1.25]" />
                </div>

                {/* Step Badge */}
                <span className="text-[11px] font-mono font-bold text-[#c3dc4e] uppercase mb-1">
                  {item.num}
                </span>

                {/* Step Title */}
                <h4 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-[#c3dc4e] transition-colors">
                  {item.title}
                </h4>

                {/* Step Description */}
                <p className="text-xs text-[#9cb396] leading-relaxed mb-3">
                  {item.desc}
                </p>

                <span className="text-[11px] text-[#c3dc4e] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
