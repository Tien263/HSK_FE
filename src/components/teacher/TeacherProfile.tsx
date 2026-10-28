"use client";

import React, { useEffect, useState } from "react";
import { portalFetch, usePortalData } from "@/components/learning/use-portal-data";
import CloudinaryUpload from "@/components/common/CloudinaryUploadButton";
import { User, Mail, Shield, CheckCircle2, AlertCircle, Camera } from "lucide-react";

export default function TeacherProfile({ onSaved }: { onSaved: () => void }) {
  const { data, error, reload } = usePortalData<{
    user: { id: string; name: string; username: string; email: string | null; avatar: string | null; role: string };
  }>("/api/v1/profile");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name || "");
      setEmail(data.user.email || "");
      setAvatar(data.user.avatar || "");
    }
  }, [data]);

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
      setMessage({ text: "🎉 Đã cập nhật hồ sơ cá nhân thành công!", type: "success" });
      onSaved();
      reload();
    } catch (err: any) {
      setMessage({ text: err?.message || "Không thể lưu thông tin hồ sơ.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#204434] flex items-center gap-2">
          <User className="w-6 h-6 text-[#BC9B6B]" />
          <span>Hồ sơ & Cài đặt tài khoản Giáo viên</span>
        </h2>
        <p className="mt-1 text-xs text-[#6B766D]">
          Quản lý thông tin cá nhân, ảnh đại diện và địa chỉ email liên hệ trên hệ thống.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-[#E5DEC9] bg-[#FFFCF6] p-6 sm:p-8 shadow-xs"
      >
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium ${
              message.type === "success"
                ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* 1. KHỐI ẢNH ĐẠI DIỆN CLOUDINARY (THƯ MỤC HSK_AVATARS) */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#204434] flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#BC9B6B]" />
              <span>Ảnh đại diện (Avatar)</span>
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">
              ☁️ Cloudinary CDN: hsk_avatars
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Vùng xem trước avatar tròn */}
            <div className="w-20 h-20 rounded-full border-2 border-[#BC9B6B] overflow-hidden bg-[#FAF7F0] shrink-0 flex items-center justify-center shadow-xs">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-[#8F6D3B]/50" />
              )}
            </div>

            {/* Nút Upload trực tiếp lên Cloudinary thư mục hsk_avatars */}
            <div className="flex-1 w-full space-y-2">
              <CloudinaryUpload
                value={avatar}
                onChange={(url) => setAvatar(url)}
                folder="hsk_avatars"
                accept="image/*"
                placeholder="Chọn ảnh đại diện từ máy tính để tải lên Cloudinary..."
                showPreview={false}
              />
              <p className="text-[11px] text-[#6B766D]">
                Ảnh được lưu trữ tại thư mục riêng <code className="font-mono text-[#8F6D3B]">hsk_avatars</code> trên Cloudinary, không chiếm dung lượng máy chủ.
              </p>
            </div>
          </div>
        </div>

        {/* 2. CÁC THÔNG TIN TÀI KHOẢN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#204434] mb-1">
              Tên đăng nhập
            </label>
            <div className="flex items-center gap-2 bg-[#F7F5EE] border border-[#E5DEC9] rounded-xl px-3 py-2.5 text-xs text-slate-600 font-mono">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>{data?.user?.username || "..."}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#204434] mb-1">
              Vai trò hệ thống
            </label>
            <div className="bg-[#F7F5EE] border border-[#E5DEC9] rounded-xl px-3 py-2.5 text-xs text-[#204434] font-bold">
              {data?.user?.role === "TEACHER" ? "Giáo viên giảng dạy" : data?.user?.role || "Thành viên"}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#204434] mb-1">
              Họ và tên hiển thị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cô giáo Nguyễn Lan"
              className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2.5 text-xs text-[#204434] focus:outline-hidden focus:border-[#204434]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#204434] mb-1">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                maxLength={300}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="giaovien@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5DEC9] rounded-xl text-xs text-[#204434] focus:outline-hidden focus:border-[#204434]"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={busy || !data}
            className="rounded-2xl bg-[#204434] hover:bg-[#17382F] px-6 py-2.5 text-xs font-bold text-white transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#BC9B6B]" />
            <span>{busy ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
