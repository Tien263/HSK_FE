import Image from "next/image";
import { Users, BookOpen, Dumbbell, BarChart3, Gamepad2, Heart } from "lucide-react";

export default function AboutWhyUs() {
  const fiveAreas = [
    {
      num: "01",
      icon: Users,
      title: "Tổng quan giáo viên",
      desc: "Nắm nhanh số học sinh, bài đã giao, tỷ lệ hoàn thành và bạn cần hỗ trợ.",
    },
    {
      num: "02",
      icon: BookOpen,
      title: "Kho bài học",
      desc: "Toàn bộ giáo trình, từ vựng, ngữ pháp, nghe đọc theo từng cấp HSK.",
    },
    {
      num: "03",
      icon: Dumbbell,
      title: "Phòng luyện tập",
      desc: "Làm bài được giao, xem kết quả, luyện lại câu sai và tích lũy XP.",
    },
    {
      num: "04",
      icon: BarChart3,
      title: "Báo cáo lớp học",
      desc: "Biểu đồ tiến độ, điểm từng học sinh, câu hỏi nhiều bạn sai để ôn tập.",
    },
    {
      num: "05",
      icon: Gamepad2,
      title: "Game Center",
      desc: "Ghép chữ Hán - pinyin, đua từ vựng, xây câu và bảng xếp hạng thi đua.",
    },
  ];

  return (
    <section id="about" className="py-24 border-t border-[#234a29]/60 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-20">
        {/* Left Column: Giới thiệu ngắn & Lời nhắn của cô Ning Ning */}
        <div className="lg:col-span-6">
          <div className="text-xs font-semibold text-[#c3dc4e] tracking-widest uppercase mb-4 font-mono">
            KHÔNG GIAN NỘI BỘ · LỚP CÔ NING NING
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white tracking-tight leading-[1.2] mb-6">
            Học tập chủ động, <span className="block text-[#c3dc4e]">tiến bộ mỗi ngày</span>
          </h2>

          <p className="text-[#9cb396] text-sm sm:text-base leading-relaxed mb-6 font-normal">
            Đây là website nội bộ của lớp cô Ning Ning. Giáo viên soạn bài, giao bài và theo dõi cả
            lớp. Học sinh làm bài, luyện lại câu sai, chơi game từ vựng và tích lũy điểm kinh nghiệm
            mỗi ngày.
          </p>

          {/* Lời nhắn của cô (Quote block) */}
          <div className="relative p-6 rounded-2xl bg-[#0a2012] border border-[#234a29] shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-[#c3dc4e] mb-2 font-mono uppercase">
              <Heart className="w-3.5 h-3.5 fill-[#c3dc4e]" />
              <span>Lời nhắn gửi của cô</span>
            </div>
            <p className="text-white/95 text-sm sm:text-[15px] italic leading-relaxed mb-4">
              “Học tiếng Trung không cần vội, chỉ cần đều đặn. Mỗi ngày ôn một chút, em sẽ thấy mình
              tiến bộ. Cô luôn đồng hành cùng các em!”
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-[#234a29]/60 text-xs text-[#9cb396]">
              <span className="font-semibold text-white">加油! 💪 Cô Ning Ning</span>
              <span>Giáo viên phụ trách lớp</span>
            </div>
          </div>
        </div>

        {/* Right Column: Segmented Circular Collage (Văn hóa & Học tập chữ Hán) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-72 sm:w-[380px] h-72 sm:h-[380px] rounded-full border-2 border-[#234a29] p-2 bg-[#0a2012] shadow-2xl">
            {/* 4-Quadrant Segmented Circular Collage with subtle separator lines */}
            <div className="w-full h-full rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 gap-1 bg-[#061609]">
              <div className="relative overflow-hidden group">
                <Image
                  src="/hsk-images/hsk1.jpg"
                  alt="Thư pháp & Chữ Hán"
                  fill
                  sizes="(max-width: 768px) 150px, 200px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative overflow-hidden group">
                <Image
                  src="/hsk-images/guide-hanzi.jpg"
                  alt="Luyện viết chữ Hán"
                  fill
                  sizes="(max-width: 768px) 150px, 200px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative overflow-hidden group">
                <Image
                  src="/hsk-images/guide-listening.jpg"
                  alt="Luyện nghe tiếng Trung"
                  fill
                  sizes="(max-width: 768px) 150px, 200px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative overflow-hidden group">
                <Image
                  src="/hsk-images/hsk2.jpg"
                  alt="Giao tiếp tiếng Trung"
                  fill
                  sizes="(max-width: 768px) 150px, 200px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Center circular badge accent */}
            <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#061609] border border-[#c3dc4e] flex items-center justify-center text-[#c3dc4e] font-black text-xl shadow-xl pointer-events-none">
              宁
            </div>
          </div>
        </div>
      </div>

      {/* 5 Khu vực chính (5-Column Layout matching reference style) */}
      <div className="pt-12 border-t border-[#234a29]/60">
        <div className="text-xs font-semibold text-[#c3dc4e] uppercase tracking-widest mb-8 font-mono">
          5 KHU VỰC CHÍNH TRÊN HỆ THỐNG
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {fiveAreas.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#0a2012]/80 border border-[#234a29] rounded-2xl p-5 flex flex-col justify-between hover:border-[#c3dc4e]/60 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-[#c3dc4e]">{item.num}</span>
                    <Icon className="w-4 h-4 text-[#9cb396] group-hover:text-[#c3dc4e] transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2 leading-snug">{item.title}</h4>
                  <p className="text-xs text-[#9cb396] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
