"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Music,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Cloud,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import CloudinaryUpload from "@/components/common/CloudinaryUploadButton";
import { CloudinaryUploadResult } from "@/lib/cloudinary";

interface UploadedMediaItem {
  id: string;
  url: string;
  name: string;
  type: "image" | "audio" | "document" | "other";
  size: number;
  uploadedAt: string;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<UploadedMediaItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "image" | "audio" | "document">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUploadSuccess = (url: string, result?: CloudinaryUploadResult) => {
    if (!url) return;

    const resourceType = result?.resourceType || "image";
    let mediaType: "image" | "audio" | "document" | "other" = "image";
    if (url.match(/\.(mp3|wav|m4a|ogg)$/i) || resourceType === "video") {
      mediaType = "audio";
    } else if (url.match(/\.(pdf|doc|docx)$/i) || resourceType === "raw") {
      mediaType = "document";
    }

    const newItem: UploadedMediaItem = {
      id: result?.publicId || Date.now().toString(),
      url,
      name: url.split("/").pop() || "media_file",
      type: mediaType,
      size: result?.bytes || 0,
      uploadedAt: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setItems((prev) => [newItem, ...prev]);
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = items.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.type === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#204434] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2.5 rounded-xl bg-[#FFFCF6] border border-[#BC9B6B]/30 hover:bg-[#204434]/10 transition text-[#315E48]"
              title="Quay lại Admin Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#204434]">
                  Kho Tệp & Media Cloudinary
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#204434]/10 text-[#204434] border border-[#204434]/20 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Cloud: vf56y0nk
                </span>
              </div>
              <p className="text-xs text-[#315E48]">
                Tải ảnh từ vựng, file nghe MP3 hoặc tài liệu đề thi trực tiếp lên máy chủ đám mây Cloudinary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://console.cloudinary.com/pm/c-76e93e1b0724cfbbfffc7d7d598e0c/media-library/folders/home"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#FFFCF6] border border-[#BC9B6B]/30 hover:bg-[#204434]/10 text-xs font-semibold text-[#315E48] transition flex items-center gap-1.5"
            >
              <Cloud className="w-4 h-4 text-[#BC9B6B]" />
              <span>Mở Cloudinary Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Upload Box Card */}
        <div className="bg-[#FFFCF6] rounded-3xl border border-[#BC9B6B]/30 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#BC9B6B]/20 pb-3">
            <div className="w-9 h-9 rounded-xl bg-[#204434] text-[#FFFCF6] flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#BC9B6B]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#204434]">
                Tải tệp mới từ thiết bị
              </h2>
              <p className="text-xs text-[#315E48]">
                Hệ thống tự động đồng bộ hóa lên Cloudinary và cung cấp link CDN tốc độ cao ngay lập tức
              </p>
            </div>
          </div>

          <CloudinaryUpload
            folder="hsk_uploads"
            accept="image/*,audio/*,.pdf"
            onChange={handleUploadSuccess}
          />
        </div>

        {/* Media Management Section */}
        <div className="bg-[#FFFCF6] rounded-3xl border border-[#BC9B6B]/30 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#BC9B6B]/20 pb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#204434] flex items-center gap-2">
                <span>Tệp đã tải lên trong phiên</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#204434]/10 text-[#204434]">
                  {items.length}
                </span>
              </h3>
              <p className="text-xs text-[#315E48]">
                Nhấp vào nút sao chép để lấy đường link dán vào bài học hoặc câu hỏi
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: "ALL", label: "Tất cả" },
                { key: "image", label: "Hình ảnh" },
                { key: "audio", label: "File âm thanh" },
                { key: "document", label: "Tài liệu" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    activeFilter === tab.key
                      ? "bg-[#204434] text-[#FFFCF6] shadow-xs"
                      : "bg-[#F8F5ED] text-[#315E48] hover:bg-[#204434]/10 border border-[#BC9B6B]/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              {items.length > 0 && (
                <button
                  onClick={() => setItems([])}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#9D493E] hover:bg-[#9D493E]/10 transition ml-2 cursor-pointer flex items-center gap-1"
                  title="Dọn danh sách tạm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa danh sách</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid List */}
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-[#315E48] space-y-2">
              <Sparkles className="w-8 h-8 text-[#BC9B6B] mx-auto opacity-70" />
              <p className="text-xs font-medium">Chưa có tệp nào được tải lên trong phiên này.</p>
              <p className="text-[11px] text-[#315E48]/70">
                Hãy kéo thả ảnh hoặc file MP3 vào khung tải ở trên để bắt đầu!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const isCopied = copiedId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-[#F8F5ED]/50 border border-[#BC9B6B]/30 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between hover:border-[#204434] transition"
                  >
                    <div className="flex items-start gap-3">
                      {item.type === "image" ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#BC9B6B]/30 bg-[#FFFCF6] shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center shrink-0">
                          {item.type === "audio" ? (
                            <Music className="w-7 h-7" />
                          ) : (
                            <FileText className="w-7 h-7" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#204434] truncate">
                            {item.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#BC9B6B]/20 text-[#7A5B2E] uppercase">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#315E48] font-mono truncate">
                          {item.url}
                        </p>
                        <p className="text-[10px] text-[#315E48]/70">
                          Tải lên lúc {item.uploadedAt} {item.size > 0 && `• ${(item.size / 1024).toFixed(1)} KB`}
                        </p>
                      </div>
                    </div>

                    {/* Audio Player if Audio */}
                    {item.type === "audio" && (
                      <audio controls className="w-full h-7">
                        <source src={item.url} />
                      </audio>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#BC9B6B]/15">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#315E48] hover:text-[#204434] flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Xem tệp gốc</span>
                      </a>

                      <button
                        onClick={() => handleCopy(item.id, item.url)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          isCopied
                            ? "bg-emerald-600 text-[#FFFCF6]"
                            : "bg-[#204434] hover:bg-[#183629] text-[#FFFCF6] shadow-xs"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã sao chép!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
