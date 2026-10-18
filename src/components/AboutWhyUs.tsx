import Image from "next/image";

export default function AboutWhyUs() {
  const stats = [
    { value: "3000+", label: "Học viên theo học" },
    { value: "20+", label: "Giảng viên ThS. Hán ngữ" },
    { value: "10+", label: "Năm kinh nghiệm đào tạo" },
    { value: "4,9", label: "Điểm đánh giá học viên" },
    { value: "12", label: "Tháng hỗ trợ đồng hành" },
  ];

  return (
    <section id="about" className="py-20 border-t border-[#1a3d24]/60 max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid lg:grid-cols-12 gap-12 items-center mb-16">
        {/* Left Column: Heading and description */}
        <div className="lg:col-span-6">
          <div className="text-xs font-semibold text-[#8ea797] uppercase tracking-wider mb-4 font-mono">
            Về chúng tôi / Tại sao chọn Huayu
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Hơn cả một khóa học <span className="block text-white">tiếng Trung thông thường</span>
          </h2>

          <p className="text-[#8ea797] text-sm sm:text-base leading-relaxed mb-4">
            Chúng tôi không áp dụng các phương pháp nhồi nhét hay học vẹt truyền thống. Tại Huayu,
            học viên được tiếp cận phương pháp giải mã bộ thủ chiết tự Hán tự kết hợp công nghệ lặp lại
            ngắt quãng Spaced Repetition.
          </p>
          <p className="text-[#8ea797] text-sm sm:text-base leading-relaxed">
            Hệ thống ngân hàng đề thi thử mô phỏng 100% thời gian thực của Hanban giúp học viên làm quen
            áp lực phòng thi và tự tin đạt điểm tuyệt đối.
          </p>
        </div>

        {/* Right Column: Circular segmented multi-angle collage (Signature element in reference) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-72 sm:w-96 h-72 sm:h-96 rounded-full border-4 border-[#1a3d24] overflow-hidden shadow-2xl p-2 bg-[#0c2514]">
            {/* 4-quadrant segmented collage */}
            <div className="w-full h-full rounded-full overflow-hidden grid grid-cols-2 grid-rows-2 gap-1.5 bg-[#07190c]">
              <div className="relative overflow-hidden">
                <Image
                  src="/hsk-images/hsk1.jpg"
                  alt="Thư pháp Hán tự"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative overflow-hidden">
                <Image
                  src="/hsk-images/hsk2.jpg"
                  alt="Văn hóa Trung Hoa"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative overflow-hidden">
                <Image
                  src="/hsk-images/guide-listening.jpg"
                  alt="Luyện nghe tiếng Trung"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative overflow-hidden">
                <Image
                  src="/hsk-images/hsk4.jpg"
                  alt="Cổng trường đại học"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            {/* Center circular badge accent */}
            <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#07190c] border-2 border-[#bbcf52] flex items-center justify-center text-[#bbcf52] font-black text-xl shadow-lg">
              华
            </div>
          </div>
        </div>
      </div>

      {/* 5-Column Stats Row (Exact reference layout) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 pt-10 border-t border-[#1a3d24]/60">
        {stats.map((item, idx) => (
          <div key={idx}>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              {item.value}
            </div>
            <div className="text-xs text-[#8ea797] font-medium leading-snug">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
