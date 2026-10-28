"use client";

import React, { useState, useRef } from "react";
import { Camera, Loader2, Sparkles, Trash2, User } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  fallbackUrl?: string;
  size?: "md" | "lg" | "xl";
  label?: string;
  subtext?: string;
  className?: string;
}

export default function AvatarUpload({
  value,
  onChange,
  folder = "hsk_avatars",
  fallbackUrl,
  size = "lg",
  label,
  subtext = "Khuyên dùng ảnh chân dung tỉ lệ 1:1, định dạng PNG, JPG hoặc WebP.",
  className = "",
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = value || fallbackUrl || "";

  const sizeClasses = {
    md: "w-20 h-20",
    lg: "w-28 h-28",
    xl: "w-32 h-32",
  }[size];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setError("Dung lượng ảnh tối đa là 8MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const res = await uploadToCloudinary(file, { folder });
      onChange(res.secureUrl);
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      setError(err?.message || "Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <span className="block text-xs font-bold text-[#204434] tracking-wide">
          {label}
        </span>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Khung Avatar Thủy Mặc tròn */}
        <div className="relative group shrink-0">
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            title="Nhấp để đổi ảnh đại diện"
            className={`${sizeClasses} rounded-full overflow-hidden border-4 border-[#FAF7F0] ring-3 ring-[#BC9B6B]/40 shadow-md bg-[#F4F0E6] flex items-center justify-center cursor-pointer transition-transform duration-200 group-hover:scale-102 group-hover:ring-[#204434]/60`}
          >
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-1/2 h-1/2 text-[#8F6D3B]/40" />
            )}

            {/* Hover overlay với icon máy ảnh */}
            <div className="absolute inset-0 bg-black/45 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
              <Camera className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-wide">Thay ảnh</span>
            </div>

            {/* Loading state spinner */}
            {isUploading && (
              <div className="absolute inset-0 bg-[#204434]/70 rounded-full flex flex-col items-center justify-center text-white backdrop-blur-xs">
                <Loader2 className="w-6 h-6 animate-spin text-[#FAF7F0] mb-1" />
                <span className="text-[10px] font-medium">Đang lưu...</span>
              </div>
            )}
          </div>

          {/* Dấu huy hiệu nhỏ góc dưới phải */}
          <button
            type="button"
            onClick={() => !isUploading && fileInputRef.current?.click()}
            aria-label="Tải ảnh mới"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#204434] text-[#FAF7F0] border-2 border-white shadow-sm flex items-center justify-center hover:bg-[#163325] hover:scale-110 transition cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Thông tin & Nút bấm trang nhã bên cạnh */}
        <div className="flex-1 text-center sm:text-left space-y-2.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-[#F0EAE0] border border-[#BC9B6B]/40 text-[#204434] text-xs font-semibold shadow-2xs hover:border-[#204434] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
              <span>{value ? "Thay đổi ảnh đại diện" : "Tải ảnh đại diện mới"}</span>
            </button>

            {value && (
              <button
                type="button"
                disabled={isUploading}
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-xl hover:bg-red-50 text-[#9D493E] hover:text-red-700 text-xs font-medium transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Gỡ ảnh</span>
              </button>
            )}
          </div>

          {subtext && (
            <p className="text-[11px] text-[#6B766D] leading-relaxed max-w-md">
              {subtext}
            </p>
          )}

          {error && (
            <p className="text-xs text-[#9D493E] font-medium bg-red-50/80 px-2.5 py-1 rounded-lg border border-red-200 inline-block">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
