"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Check, Copy, Music, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadToCloudinary, CloudinaryUploadResult } from "@/lib/cloudinary";

interface CloudinaryUploadProps {
  value?: string;
  onChange: (url: string, result?: CloudinaryUploadResult) => void;
  folder?: string;
  accept?: string; // e.g. "image/*", "audio/*", "image/*,audio/*", ".pdf"
  label?: string;
  placeholder?: string;
  showPreview?: boolean;
  className?: string;
}

export default function CloudinaryUpload({
  value,
  onChange,
  folder = "hsk_uploads",
  accept = "image/*,audio/*",
  label,
  placeholder = "Chọn tệp từ máy tính hoặc kéo thả vào đây...",
  showPreview = true,
  className = "",
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAudio = value && (value.endsWith(".mp3") || value.endsWith(".wav") || value.endsWith(".m4a") || value.includes("/video/upload/"));
  const isImage = value && !isAudio && (value.endsWith(".jpg") || value.endsWith(".jpeg") || value.endsWith(".png") || value.endsWith(".webp") || value.endsWith(".gif") || value.includes("/image/upload/"));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await performUpload(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await performUpload(file);
  };

  const performUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const res = await uploadToCloudinary(file, { folder });
      onChange(res.secureUrl, res);
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      setError(err?.message || "Tải lên Cloudinary thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCopyUrl = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#204434]">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Drop Zone / Display */}
      {!value ? (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed border-[#BC9B6B]/40 hover:border-[#204434] bg-[#FFFCF6] hover:bg-[#F8F5ED] rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group ${
            isUploading ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-6 h-6 text-[#204434] animate-spin" />
              <span className="text-xs font-medium text-[#204434]">
                Đang tải tệp lên Cloudinary...
              </span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-[#204434]/10 text-[#204434] flex items-center justify-center group-hover:scale-110 transition">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#315E48]">
                <span className="font-bold text-[#204434]">Nhấp để tải lên</span> hoặc kéo thả tệp vào đây
              </div>
              <p className="text-[11px] text-[#315E48]/70">
                Hỗ trợ ảnh (JPG, PNG, WebP) và âm thanh (MP3, WAV)
              </p>
            </>
          )}
        </div>
      ) : (
        /* Display uploaded file with actions */
        <div className="bg-[#FFFCF6] border border-[#BC9B6B]/30 rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isImage ? (
                <ImageIcon className="w-4 h-4 text-[#204434] shrink-0" />
              ) : isAudio ? (
                <Music className="w-4 h-4 text-[#204434] shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-[#204434] shrink-0" />
              )}
              <span className="text-xs text-[#204434] font-mono truncate flex-1">
                {value}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleCopyUrl}
                title="Sao chép link"
                className="p-1 rounded-lg hover:bg-[#204434]/10 text-[#315E48] transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#204434]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Thay đổi tệp"
                className="px-2 py-0.5 rounded text-[11px] bg-[#204434]/10 text-[#204434] hover:bg-[#204434]/20 font-medium transition cursor-pointer"
              >
                Đổi
              </button>

              <button
                type="button"
                onClick={handleRemove}
                title="Xóa tệp"
                className="p-1 rounded-lg hover:bg-[#9D493E]/10 text-[#9D493E] transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Preview for Image or Audio */}
          {showPreview && isImage && (
            <div className="relative rounded-lg overflow-hidden border border-[#BC9B6B]/20 bg-[#F8F5ED]/40 h-28 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Uploaded media"
                className="h-full w-auto object-contain"
              />
            </div>
          )}

          {showPreview && isAudio && (
            <div className="pt-1">
              <audio controls className="w-full h-8">
                <source src={value} />
                Trình duyệt của bạn không hỗ trợ phát âm thanh.
              </audio>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-[#9D493E] font-medium mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
