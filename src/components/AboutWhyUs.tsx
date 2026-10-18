import Image from "next/image";

export default function AboutWhyUs() {
  const stats = [
    { value: "3000+", label: "Học viên đỗ chứng chỉ", sub: "và đạt mục tiêu đầu ra" },
    { value: "20", label: "Giảng viên ThS. Hán ngữ", sub: "tốt nghiệp ĐH Bắc Kinh" },
    { value: "10+", label: "Năm kinh nghiệm", sub: "đào tạo & luyện thi chuyên sâu" },
    { value: "4,9", label: "Điểm đánh giá hài lòng", sub: "từ hơn 2.800+ học viên" },
    { value: "12", label: "Tháng đồng hành", sub: "hỗ trợ giải đáp 24/7" },
  ];

  return (
    <section id="about" className="py-20 border-t border-[#234a29]/60 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-16">
        {/* Left Column: Heading, tagline, and description */}
        <div className="lg:col-span-6">
          <div className="text-xs font-semibold text-[#9cb396] tracking-wider mb-4">
            Về trung tâm / Vì sao chọn Huayu
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white tracking-tight leading-[1.18] mb-6">
            Hơn cả một khóa học{" "}
            <span className="block text-white">tiếng Trung thông thường</span>
          </h2>

          <p className="text-[#9cb396] text-sm sm:text-[15px] leading-relaxed mb-4">
            Chúng tôi không giới hạn trong các phương pháp học vẹt hay bài giảng thụ động truyền thống.
            Huayu kết hợp phương pháp giải mã bộ thủ chiết tự Hán tự cùng hệ thống ôn tập lặp lại ngắt
            quãng Spaced Repetition thông minh.
          </p>
          <p className="text-[#9cb396] text-sm sm:text-[15px] leading-relaxed">
            Học viên được rèn luyện phản xạ phát âm chuẩn giọng Bắc Kinh và thực hành trực tiếp cùng
            ngân hàng đề thi thử mô phỏng 100% thời gian thực của Hanban.
          </p>
        </div>

        {/* Right Column: Segmented Circular Collage (Exact signature element in reference image) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-72 sm:w-[380px] h-72 sm:h-[380px] rounded-full border-2 border-[#234a29] p-2 bg-[#0a2012] shadow-2xl">
            {/* 4-Quadrant Segmented Circular Collage with subtle separator lines */}
            <div className="w-full h-full rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 gap-1 bg-[#061609]">
              <div className="relative overflow-hidden group">
                <Image
                  src="/hsk-images/hsk1.jpg"
                  alt="Thư pháp Hán tự"
                  fill
                  sizes="(max-width: 768px) 150px, 200px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative overflow-hidden group">
                <Image
                  src="/hsk-images/hsk2.jpg"
                  alt="Văn hóa Trung Hoa"
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
                  src="/hsk-images/hsk4.jpg"
                  alt="Cổng trường đại học"
                  fill
                  sizes="(max-width: 768px) 150px, 200px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Center circular badge accent */}
            <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#061609] border border-[#c3dc4e] flex items-center justify-center text-[#c3dc4e] font-black text-xl shadow-xl pointer-events-none">
              华
            </div>
          </div>
        </div>
      </div>

      {/* 5-Column Key Stats Row (Exact reference layout with bold numbers and 2-line labels) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 pt-12 border-t border-[#234a29]/60">
        {stats.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white tracking-tight mb-2 leading-none">
              {item.value}
            </div>
            <div className="text-xs text-white/90 font-medium leading-snug">{item.label}</div>
            <div className="text-[11px] text-[#9cb396] leading-snug">{item.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
