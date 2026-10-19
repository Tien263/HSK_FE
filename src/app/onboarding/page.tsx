"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  FileText,
  Briefcase,
  MessageSquare,
  User,
  BarChart2,
  TrendingUp,
  Clock,
  Link as LinkIcon,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  const [goal, setGoal] = useState("du-hoc");
  const [level, setLevel] = useState("moi-bat-dau");
  const [dailyTime, setDailyTime] = useState("15-phut");
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/v1/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser?.username || "student",
          goal,
          level,
          dailyTime,
          classCode,
        }),
      });
    } catch (err) {
      console.error(err);
    }

    // Chuyển thẳng vào Bàn học sinh
    router.push("/s/home");
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] relative overflow-hidden flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#1a3d2f] selection:text-white">
      {/* Traditional Ink Painting Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <Image
          src="/theme/bg-onboarding-bamboo.jpg"
          alt="Classical Chinese bamboo grove landscape"
          fill
          className="object-cover object-center filter saturate-95"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f4ee]/85 via-[#f7f4ee]/50 to-[#f7f4ee]/85" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#b91c1c] text-white flex items-center justify-center font-serif text-sm font-bold shadow-sm">
            <span>宁</span>
          </div>
          <div className="leading-tight">
            <span className="font-serif font-bold text-xl text-[#1a3d2f] tracking-tight block">
              Hanyu
            </span>
            <span className="text-[10px] text-[#6b8271] tracking-wider block font-sans">
              Khởi tạo lộ trình học tập
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => router.push("/s/home")}
          className="text-xs text-[#5c7363] hover:text-[#1a3d2f] font-medium transition"
        >
          Bỏ qua bước này →
        </button>
      </header>

      {/* Main Form Container */}
      <main className="relative z-10 max-w-4xl mx-auto w-full my-6 bg-[#fcfaf7] border border-[#e6decb] rounded-3xl p-6 sm:p-10 shadow-xl shadow-stone-900/5 backdrop-blur-md">
        {/* Stepper Header (4 Steps) */}
        <div className="flex items-center justify-between max-w-lg mx-auto mb-10 pb-6 border-b border-[#eee8dc]">
          {[
            { step: 1, label: "Mục tiêu học", active: true },
            { step: 2, label: "Hướng học", active: false },
            { step: 3, label: "Trình độ", active: false },
            { step: 4, label: "Hoàn tất", active: false },
          ].map((s, idx, arr) => (
            <div key={s.step} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    s.active
                      ? "bg-[#1a3d2f] text-white shadow-sm"
                      : "bg-[#e5ded0] text-[#788a7d]"
                  }`}
                >
                  {s.step}
                </div>
                <span className={`text-[11px] font-medium mt-1.5 ${s.active ? "text-[#1a3d2f] font-bold" : "text-[#788a7d]"}`}>
                  {s.label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div className="w-12 sm:w-16 h-0.5 bg-[#e5ded0] -mt-5" />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleComplete} className="space-y-8">
          {/* Question 1: Mục tiêu học */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#1a3d2f]" />
              <h3 className="font-bold text-sm sm:text-base text-[#1e2e22]">
                1. Mục tiêu học của bạn là gì?
              </h3>
            </div>
            <p className="text-xs text-[#64796a] mb-4">
              Chọn mục tiêu chính để Hanyu gợi ý nội dung và lộ trình phù hợp nhất.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                {
                  id: "du-hoc",
                  title: "Du học - học đại học bằng tiếng Trung",
                  desc: "Chuẩn bị hồ sơ, học thuật, sinh hoạt tại Trung Quốc",
                  icon: GraduationCap,
                },
                {
                  id: "hsk",
                  title: "HSK & thi cử",
                  desc: "Luyện thi HSK, YCT và các kỳ thi tiếng Trung",
                  icon: FileText,
                },
                {
                  id: "cong-viec",
                  title: "Công việc",
                  desc: "Phục vụ công việc, thăng tiến sự nghiệp",
                  icon: Briefcase,
                },
                {
                  id: "giao-tiep",
                  title: "Giao tiếp hằng ngày",
                  desc: "Du lịch, kết bạn, sinh hoạt thường ngày",
                  icon: MessageSquare,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = goal === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setGoal(item.id)}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#eaf4ed] border-[#1a3d2f] ring-1 ring-[#1a3d2f] shadow-sm"
                        : "bg-[#f8f5ee] border-[#e2dac9] hover:border-[#1a3d2f]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1a3d2f] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="w-9 h-9 rounded-xl bg-white/80 border border-[#e2dac9] text-[#1a3d2f] flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#1e2e22] mb-1 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#64796a] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question 2: Trình độ hiện tại */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <User className="w-4 h-4 text-[#1a3d2f]" />
              <h3 className="font-bold text-sm sm:text-base text-[#1e2e22]">
                2. Trình độ hiện tại của bạn?
              </h3>
            </div>
            <p className="text-xs text-[#64796a] mb-4">
              Chọn trình độ hiện tại để Hanyu đánh giá điểm xuất phát phù hợp.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                {
                  id: "moi-bat-dau",
                  title: "Mới bắt đầu",
                  desc: "Chưa từng học hoặc mới làm quen",
                  icon: User,
                },
                {
                  id: "hsk-1-3",
                  title: "HSK 1-3",
                  desc: "Đã có nền tảng cơ bản, hiểu các kiến thức cơ bản",
                  icon: BarChart2,
                },
                {
                  id: "hsk-4",
                  title: "HSK 4 trở lên",
                  desc: "Đã có nền tảng tốt, muốn nâng cao",
                  icon: TrendingUp,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = level === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setLevel(item.id)}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected
                        ? "bg-[#eaf4ed] border-[#1a3d2f] ring-1 ring-[#1a3d2f] shadow-sm"
                        : "bg-[#f8f5ee] border-[#e2dac9] hover:border-[#1a3d2f]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1a3d2f] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-xl bg-white/80 border border-[#e2dac9] text-[#1a3d2f] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#1e2e22] mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#64796a]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question 3: Thời gian học mỗi ngày */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="w-4 h-4 text-[#1a3d2f]" />
              <h3 className="font-bold text-sm sm:text-base text-[#1e2e22]">
                3. Bạn có thể dành bao nhiêu thời gian mỗi ngày?
              </h3>
            </div>
            <p className="text-xs text-[#64796a] mb-4">
              Chọn thời gian học phù hợp với lịch trình của bạn. Bạn có thể thay đổi sau này.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                {
                  id: "15-phut",
                  title: "15 phút",
                  desc: "Học nhẹ nhàng, duy trì thói quen",
                },
                {
                  id: "30-phut",
                  title: "30 phút",
                  desc: "Cân bằng giữa học tập và thời gian cá nhân",
                },
                {
                  id: "60-phut",
                  title: "60 phút",
                  desc: "Học chuyên sâu, nhanh đạt mục tiêu",
                },
              ].map((item) => {
                const isSelected = dailyTime === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setDailyTime(item.id)}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected
                        ? "bg-[#eaf4ed] border-[#1a3d2f] ring-1 ring-[#1a3d2f] shadow-sm"
                        : "bg-[#f8f5ee] border-[#e2dac9] hover:border-[#1a3d2f]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1a3d2f] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-xl bg-white/80 border border-[#e2dac9] text-[#1a3d2f] flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#1e2e22] mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#64796a]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question 4: Mã lớp (nếu có) */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <LinkIcon className="w-4 h-4 text-[#1a3d2f]" />
              <h3 className="font-bold text-sm sm:text-base text-[#1e2e22]">
                4. Mã lớp (nếu có)
              </h3>
            </div>
            <p className="text-xs text-[#64796a] mb-3">
              Nhập mã lớp do giáo viên hoặc trường cung cấp. Bạn có thể bỏ qua bước này.
            </p>

            <div className="relative flex items-center max-w-xl">
              <LinkIcon className="w-4 h-4 text-[#8ea394] absolute left-4" />
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="Nhập mã lớp (không bắt buộc, ví dụ: HSK 1A)"
                className="w-full bg-[#f4eee4] border border-[#e2dac9] focus:border-[#1a3d2f] focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#1e2e22] placeholder-[#8ea394] outline-none transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-[#eee8dc]">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#1a3d2f] text-white font-bold text-sm hover:bg-[#132e23] transition shadow-lg shadow-emerald-950/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <span>{loading ? "Đang lưu lộ trình..." : "Tiếp tục →"}</span>
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full py-2 text-center text-[11px] text-[#7d9385]">
        Hanyu · Lớp tiếng Trung cô Ning Ning · Thiết kế lộ trình cá nhân hóa
      </footer>
    </div>
  );
}
