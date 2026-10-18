import { Compass, Sparkles, ShieldCheck, Headphones } from "lucide-react";

export default function TrustFeatures() {
  const features = [
    {
      icon: Compass,
      title: "Lộ trình tuyển chọn",
      desc: "Phù hợp từ người mất gốc đến mục tiêu HSK 6.",
    },
    {
      icon: Sparkles,
      title: "100% Miễn phí trọn đời",
      desc: "Cam kết hạ tầng 0đ, không phí ẩn.",
    },
    {
      icon: ShieldCheck,
      title: "Chuẩn Hanban quốc tế",
      desc: "Ngân hàng đề & từ vựng cập nhật mới nhất.",
    },
    {
      icon: Headphones,
      title: "Audio chuẩn Bắc Kinh",
      desc: "Luyện phản xạ nghe tự nhiên 24/7.",
    },
  ];

  return (
    <section className="py-12 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center shrink-0 text-slate-700 group-hover:border-[#e86a24] group-hover:text-[#e86a24] transition shadow-sm">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#e86a24] transition">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
