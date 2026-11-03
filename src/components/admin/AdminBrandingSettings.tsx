"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Share2,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Eye,
  Check,
  Copy,
} from "lucide-react";

export default function AdminBrandingSettings() {
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Preview timestamps to force cache bust
  const [ogTimestamp, setOgTimestamp] = useState(Date.now());
  const [iconTimestamp, setIconTimestamp] = useState(Date.now());

  const [customUploadUrl, setCustomUploadUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetAsset: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(targetAsset);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetAsset", targetAsset);

    try {
      const res = await fetch("/api/v1/admin/branding/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Tải lên thất bại.");
      }

      setMessage({ type: "success", text: `Đã cập nhật ${targetAsset} thành công!` });

      if (targetAsset === "OG_IMAGE") {
        setOgTimestamp(Date.now());
      } else if (targetAsset.startsWith("APP_ICON") || targetAsset === "APPLE_TOUCH_ICON") {
        setIconTimestamp(Date.now());
      } else {
        setCustomUploadUrl(data.url);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Lỗi khi tải file." });
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/35 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#204434]/10 text-xs font-bold text-[#204434] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#BC9B6B]" />
            <span>Tùy biến Giao diện & Thương hiệu No-Code</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#204434]">
            Quản lý Hình ảnh, Icon App & SEO
          </h2>
          <p className="text-xs text-[#526c50] mt-1 max-w-2xl leading-relaxed">
            Thay đổi trực tiếp ảnh đại diện mạng xã hội, icon ứng dụng trên điện thoại (PWA), và hình nền từ máy tính của bạn mà không cần chỉnh sửa mã nguồn.
          </p>
        </div>

        <a
          href="/guide#app-install"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#BC9B6B]/40 bg-[#F8F5ED] hover:bg-[#FFFCF6] text-xs font-bold text-[#204434] transition shrink-0"
        >
          <span>Xem hướng dẫn cài App</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
              : "bg-red-50 text-red-900 border border-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 2-Column Grid for Core Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: OpenGraph & Social Media Sharing Preview (Zalo / Facebook) */}
        <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/35 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#9D493E]" />
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  Ảnh đại diện Chia sẻ (Facebook / Zalo / SEO)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                1200 x 630 px
              </span>
            </div>
            <p className="text-xs text-[#526c50] mt-2 leading-relaxed">
              Hình ảnh này sẽ tự động xuất hiện khi bạn gửi link website <code>ninjistudy.click</code> qua Zalo, Messenger hoặc đăng lên Facebook.
            </p>

            {/* Live Preview of Social Card */}
            <div className="mt-4 rounded-2xl overflow-hidden border border-[#BC9B6B]/30 bg-[#F8F5ED] shadow-sm">
              <div className="relative w-full aspect-[1200/630] max-h-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/og-image.png?t=${ogTimestamp}`}
                  alt="SEO OpenGraph Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 bg-white border-t border-[#BC9B6B]/20">
                <div className="text-[10px] uppercase font-bold text-gray-400">NINJISTUDY.CLICK</div>
                <div className="text-xs font-bold text-gray-900 truncate">
                  NinjiStudy · Học Tiếng Trung & Luyện Thi HSK 3.0 Chuẩn Quốc Tế
                </div>
                <div className="text-[11px] text-gray-500 truncate">
                  Nền tảng học tiếng Trung Thủy Mặc và luyện thi HSK 1-6 chuẩn mới 3.0.
                </div>
              </div>
            </div>
          </div>

          {/* Upload Button for OpenGraph */}
          <div className="pt-3 border-t border-[#BC9B6B]/20">
            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition shadow-xs cursor-pointer">
              {uploading === "OG_IMAGE" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{uploading === "OG_IMAGE" ? "Đang tải ảnh lên..." : "Tải ảnh đại diện SEO mới (PNG / JPG)"}</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                disabled={Boolean(uploading)}
                onChange={(e) => handleFileUpload(e, "OG_IMAGE")}
              />
            </label>
          </div>
        </div>

        {/* Card 2: Mobile App PWA Icons (iPhone, Android, Windows Desktop) */}
        <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/35 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <h3 className="font-serif font-bold text-base text-[#204434]">
                  Biểu tượng App Màn hình chính (PWA Icon)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                192x192 & 512x512
              </span>
            </div>
            <p className="text-xs text-[#526c50] mt-2 leading-relaxed">
              Biểu tượng hiển thị ngoài màn hình chính của học sinh khi cài đặt app trên điện thoại iPhone, Android hoặc máy tính.
            </p>

            {/* Mobile App Screen Mockup Preview */}
            <div className="mt-4 p-4 rounded-2xl border border-[#BC9B6B]/30 bg-[#F8F5ED] flex items-center justify-around">
              {/* iPhone Icon Preview */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-black/10 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/brand/app-icon-192.png?t=${iconTimestamp}`}
                    alt="App Icon 192"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-bold text-[#204434]">Hanyu (192x192)</span>
              </div>

              {/* HD Icon 512 Preview */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-black/10 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/brand/app-icon-512.png?t=${iconTimestamp}`}
                    alt="App Icon 512"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-bold text-[#204434]">HD (512x512)</span>
              </div>
            </div>
          </div>

          {/* Upload Buttons for Icons */}
          <div className="pt-3 border-t border-[#BC9B6B]/20 grid grid-cols-2 gap-2">
            <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#BC9B6B]/40 bg-[#F8F5ED] hover:bg-white text-xs font-bold text-[#204434] transition shadow-xs cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>Đổi Icon 192</span>
              <input
                type="file"
                accept="image/png, image/webp"
                className="hidden"
                disabled={Boolean(uploading)}
                onChange={(e) => handleFileUpload(e, "APP_ICON_192")}
              />
            </label>

            <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#9D493E] hover:bg-[#83382F] text-white text-xs font-bold transition shadow-xs cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>Đổi Icon 512</span>
              <input
                type="file"
                accept="image/png, image/webp"
                className="hidden"
                disabled={Boolean(uploading)}
                onChange={(e) => handleFileUpload(e, "APP_ICON_512")}
              />
            </label>
          </div>
        </div>

      </div>

      {/* Card 3: Custom Image Upload & File Storage */}
      <div className="p-6 rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/35 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#BC9B6B]/20">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-700" />
            <h3 className="font-serif font-bold text-base text-[#204434]">
              Tải lên Ảnh Tùy Chỉnh (Banner, Ảnh bài giảng, Tư liệu)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-gray-500">
            Hỗ trợ PNG, JPG, WEBP, SVG tối đa 10MB
          </span>
        </div>

        <p className="text-xs text-[#526c50] leading-relaxed">
          Tải ảnh bất kỳ lên máy chủ để lấy đường dẫn nhanh dán vào bài giảng, banner trang chủ hoặc các mục tùy biến khác.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Chọn ảnh từ máy tính</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={Boolean(uploading)}
              onChange={(e) => handleFileUpload(e, "CUSTOM")}
            />
          </label>

          {customUploadUrl && (
            <div className="w-full flex-1 flex items-center justify-between p-2 rounded-xl bg-[#F8F5ED] border border-[#BC9B6B]/30 text-xs">
              <span className="font-mono text-emerald-800 truncate mr-2">{customUploadUrl}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(customUploadUrl)}
                className="px-3 py-1 rounded-lg bg-white border border-[#BC9B6B]/40 font-bold text-[#204434] hover:bg-[#204434] hover:text-white transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Đã sao chép" : "Sao chép link"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
