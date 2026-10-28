"use client";

import React, { useEffect, useState } from "react";
import { portalFetch, usePortalData } from "@/components/learning/use-portal-data";
import AvatarUpload from "@/components/common/AvatarUpload";
import {
  User,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Sparkles,
  Phone,
  Feather,
  GraduationCap,
  Award,
} from "lucide-react";

export default function TeacherProfile({ onSaved }: { onSaved: () => void }) {
  const { data, error, reload } = usePortalData<{
    user: { id: string; name: string; username: string; email: string | null; avatar: string | null; role: string };
  }>("/api/v1/profile");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [chineseName, setChineseName] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("3");
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["HSK 1", "HSK 2", "HSK 3"]);
  const [bio, setBio] = useState("");

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Load backend profile & additional teacher info from local storage
  useEffect(() => {
    if (data?.user) {
      setName(data.user.name || "");
      setEmail(data.user.email || "");
      setAvatar(data.user.avatar || "");

      try {
        const extraRaw = localStorage.getItem(`hsk_teacher_profile_${data.user.id}`);
        if (extraRaw) {
          const extra = JSON.parse(extraRaw);
          if (extra.chineseName !== undefined) setChineseName(extra.chineseName);
          if (extra.phone !== undefined) setPhone(extra.phone);
          if (extra.experience !== undefined) setExperience(extra.experience);
          if (Array.isArray(extra.selectedLevels)) setSelectedLevels(extra.selectedLevels);
          if (extra.bio !== undefined) setBio(extra.bio);
        } else {
          setBio("Giáo viên tiếng Trung chuyên nghiệp, tận tâm dẫn dắt học viên từ phát âm chuẩn đến tự tin chinh phục các kỳ thi HSK.");
        }
      } catch (e) {
        console.warn("Could not load local teacher extra profile:", e);
      }
    }
  }, [data]);

  const toggleLevel = (lvl: string) => {
    if (selectedLevels.includes(lvl)) {
      if (selectedLevels.length > 1) {
        setSelectedLevels(selectedLevels.filter((l) => l !== lvl));
      }
    } else {
      setSelectedLevels([...selectedLevels, lvl]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      await portalFetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, avatar }),
      });

      // Save extra teacher info
      if (data?.user?.id) {
        localStorage.setItem(
          `hsk_teacher_profile_${data.user.id}`,
          JSON.stringify({
            chineseName,
            phone,
            experience,
            selectedLevels,
            bio,
          })
        );
      }

      setMessage({ text: "Lưu thông tin hồ sơ giáo viên thành công!", type: "success" });
      onSaved();
      reload();
    } catch (err: any) {
      setMessage({ text: err?.message || "Không thể lưu thông tin hồ sơ.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* 1. HERO BANNER THỦY MẶC NHO NHÃ */}
      <div className="relative overflow-hidden rounded-3xl border border-[#BC9B6B]/40 bg-[#1A382A] text-[#FAF7F0] shadow-md">
        {/* Background Thủy Mặc */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: `url('/theme/phong_canh_thuy_mac_ben_ho_suong_som.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#163325]/95 via-[#163325]/85 to-[#163325]/60" />

        {/* Khung họa tiết viền mây tre */}
        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-3">
              {/* Con dấu triện đỏ chu sa */}
              <div className="w-9 h-9 rounded-lg bg-[#9E2A2B] text-white flex items-center justify-center font-serif font-bold text-sm shadow-md border border-[#F2C94C]/50 shrink-0">
                师
              </div>
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#BC9B6B] block">
                  HANYU TEACHER PORTAL · 教师档案
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#FFFDF9] tracking-tight">
                  Thư phòng Hồ sơ Giáo viên
                </h1>
              </div>
            </div>

            <p className="text-xs text-[#E3DFD5]/90 font-light leading-relaxed italic pt-1">
              “学而不厌，诲人不倦” — Học không biết chán, dạy người không biết mỏi.
            </p>
          </div>

          {/* Huy hiệu vinh danh giáo viên */}
          <div className="hidden sm:flex flex-col items-end gap-1 text-right shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F0]/10 border border-[#BC9B6B]/40 backdrop-blur-xs text-[#FAF7F0] text-xs font-serif">
              <Award className="w-3.5 h-3.5 text-[#F2C94C]" />
              <span>Giảng viên HSK Chính thức</span>
            </div>
            <span className="text-[11px] text-[#BC9B6B] font-mono">
              {data?.user?.username ? `@${data.user.username}` : "..."}
            </span>
          </div>
        </div>
      </div>

      {/* 2. FORM HỒ SƠ PHONG CÁCH TUYÊN CHỈ (RICE PAPER SCROLL) */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-[#E5DEC9] bg-[#FFFDF9] p-6 sm:p-9 shadow-sm relative overflow-hidden"
      >
        {/* Họa tiết cành tre mờ trang trí góc nền */}
        <div
          className="absolute -right-10 -bottom-10 w-64 h-64 opacity-5 pointer-events-none bg-contain bg-no-repeat"
          style={{ backgroundImage: `url('/theme/clean-bamboo-branch.svg')` }}
        />

        {error && (
          <div className="p-3.5 bg-red-50/90 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-3 font-medium shadow-2xs ${
              message.type === "success"
                ? "bg-[#204434]/10 border border-[#204434]/30 text-[#163325]"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-[#204434] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {/* PHẦN A: DANH THIẾP CHÂN DUNG (AVATAR THỦY MẶC) */}
        <div className="p-6 rounded-2xl bg-[#FAF7F0]/80 border border-[#E5DEC9] relative">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5DEC9]/70">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#BC9B6B]" />
              <h2 className="font-serif font-bold text-sm text-[#204434] uppercase tracking-wider">
                Chân dung & Nhận diện sư phạm
              </h2>
            </div>
            <span className="text-[11px] font-serif text-[#8F6D3B] italic">
              Hình ảnh đại diện trang cá nhân
            </span>
          </div>

          <AvatarUpload
            value={avatar}
            onChange={(url) => setAvatar(url)}
            folder="hsk_avatars"
            fallbackUrl="/theme/avatar-teacher.jpg"
            size="xl"
            subtext="Nhấp trực tiếp vào ảnh hoặc nút để chọn ảnh chân dung mới từ thiết bị. Khuyên dùng ảnh vuông 1:1, dung lượng dưới 5MB."
          />
        </div>

        {/* PHẦN B: THÔNG TIN ĐỊNH DANH & LIÊN LẠC */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-[#E5DEC9]/70">
            <User className="w-4 h-4 text-[#BC9B6B]" />
            <h2 className="font-serif font-bold text-sm text-[#204434] uppercase tracking-wider">
              Thông tin định danh & Liên lạc
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tên đăng nhập */}
            <div>
              <label className="block text-xs font-bold text-[#204434] mb-1.5 flex items-center justify-between">
                <span>Tên đăng nhập hệ thống</span>
                <span className="text-[10px] text-[#8F6D3B] font-normal italic">(Không đổi)</span>
              </label>
              <div className="flex items-center gap-2 bg-[#F3EFE6] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 text-xs text-[#526058] font-mono">
                <Shield className="w-3.5 h-3.5 text-[#8F6D3B]" />
                <span>{data?.user?.username || "..."}</span>
              </div>
            </div>

            {/* Vai trò */}
            <div>
              <label className="block text-xs font-bold text-[#204434] mb-1.5">
                Vai trò quản trị
              </label>
              <div className="bg-[#F3EFE6] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 text-xs text-[#204434] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>{data?.user?.role === "TEACHER" ? "Giáo viên giảng dạy & Quản trị lớp" : data?.user?.role || "Thành viên"}</span>
              </div>
            </div>

            {/* Họ và tên hiển thị */}
            <div>
              <label className="block text-xs font-bold text-[#204434] mb-1.5">
                Họ và tên giảng viên <span className="text-[#9E2A2B]">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Thảo (Cô Ning Ning)"
                className="w-full bg-[#FAF7F0] border border-[#E5DEC9] focus:border-[#204434] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#204434] transition outline-hidden shadow-2xs font-medium"
              />
            </div>

            {/* Tên tiếng Trung / Pháp danh */}
            <div>
              <label className="block text-xs font-bold text-[#204434] mb-1.5">
                Tên tiếng Trung (中文名 / 别名)
              </label>
              <input
                type="text"
                maxLength={100}
                value={chineseName}
                onChange={(e) => setChineseName(e.target.value)}
                placeholder="Ví dụ: 宁宁老师 (Cô Ninh Ninh)"
                className="w-full bg-[#FAF7F0] border border-[#E5DEC9] focus:border-[#204434] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#204434] transition outline-hidden shadow-2xs"
              />
            </div>

            {/* Email liên hệ */}
            <div>
              <label className="block text-xs font-bold text-[#204434] mb-1.5">
                Địa chỉ Email chính thức
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8F6D3B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  maxLength={300}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="giaovien@hskedu.vn"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DEC9] focus:border-[#204434] focus:bg-white rounded-xl text-xs text-[#204434] transition outline-hidden shadow-2xs"
                />
              </div>
            </div>

            {/* Số điện thoại / Zalo */}
            <div>
              <label className="block text-xs font-bold text-[#204434] mb-1.5">
                Số điện thoại / Zalo kết nối
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8F6D3B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  maxLength={50}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0987 654 321"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F0] border border-[#E5DEC9] focus:border-[#204434] focus:bg-white rounded-xl text-xs text-[#204434] transition outline-hidden shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN C: CHUYÊN MÔN SƯ PHẠM & CẤP ĐỘ GIẢNG DẠY */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-[#E5DEC9]/70">
            <GraduationCap className="w-4 h-4 text-[#BC9B6B]" />
            <h2 className="font-serif font-bold text-sm text-[#204434] uppercase tracking-wider">
              Chuyên môn & Cấp độ HSK phụ trách
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#204434] mb-2">
                Các cấp độ HSK đang giảng dạy:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"].map((lvl) => {
                  const active = selectedLevels.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => toggleLevel(lvl)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        active
                          ? "bg-[#204434] text-[#FAF7F0] border-[#204434] shadow-xs"
                          : "bg-[#FAF7F0] border-[#E5DEC9] text-[#526058] hover:bg-white hover:border-[#BC9B6B]"
                      }`}
                    >
                      <span>{lvl}</span>
                      {active && <span className="text-[10px] text-[#F2C94C]">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#204434] mb-1.5">
                  Kinh nghiệm giảng dạy
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl px-3 py-2.5 text-xs text-[#204434] focus:outline-hidden focus:border-[#204434] cursor-pointer"
                >
                  <option value="1">Dưới 2 năm giảng dạy</option>
                  <option value="3">3 - 5 năm kinh nghiệm</option>
                  <option value="5">5 - 8 năm chuyên sâu</option>
                  <option value="10">Trên 10 năm kinh nghiệm</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#204434] mb-1.5 flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5 text-[#BC9B6B]" />
                  <span>Lời tự bạch & Phương châm giảng dạy</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={600}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Chia sẻ ngắn về phong cách giảng dạy và lời chúc gửi gắm đến các học viên..."
                  className="w-full bg-[#FAF7F0] border border-[#E5DEC9] focus:border-[#204434] focus:bg-white rounded-xl p-3 text-xs text-[#204434] transition outline-hidden shadow-2xs leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN D: NÚT LƯU HỒ SƠ PHONG CÁCH THỦY MẶC */}
        <div className="pt-4 border-t border-[#E5DEC9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-[#6B766D] italic flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#BC9B6B]" />
            <span>Thông tin hồ sơ hiển thị công khai tới học viên trong danh sách giáo viên phụ trách.</span>
          </div>

          <button
            type="submit"
            disabled={busy || !data}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-[#204434] to-[#153325] hover:from-[#17382B] hover:to-[#0F261C] text-[#FFFDF9] text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-[#F2C94C] group-hover:rotate-12 transition-transform" />
            <span>{busy ? "Đang lưu trữ..." : "Lưu thay đổi hồ sơ (保存档案)"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
