"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, Compass } from "lucide-react";

export default function StudentErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Student portal runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#204434] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#FFFCF6] border-2 border-[#BC9B6B]/60 rounded-3xl p-8 text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-3xl border border-amber-200 shadow-inner">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif font-bold text-2xl text-[#204434]">
            Hệ thống đang sẵn sàng
          </h2>
          <p className="text-xs text-[#315E48] leading-relaxed">
            Dữ liệu học tập đang được đồng bộ và tối ưu hóa cho bạn. Vui lòng bấm &quot;Thử lại&quot; hoặc quay về trang chủ để tiếp tục bài học.
          </p>
          {error?.message && (
            <details className="mt-3 text-left p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 overflow-auto max-h-36">
              <summary className="font-semibold cursor-pointer text-amber-800">
                Chi tiết chẩn đoán lỗi: {error.message.slice(0, 80)}...
              </summary>
              <pre className="mt-2 text-[10px] whitespace-pre-wrap font-mono text-stone-700">
                {error.stack || error.message}
                {error.digest ? `\nDigest: ${error.digest}` : ""}
              </pre>
            </details>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thử lại ngay</span>
          </button>

          <Link
            href="/s/mock-exam"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#F4F8EE] border border-[#BC9B6B]/40 hover:bg-[#EAEFD9] text-[#204434] text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
          >
            <Compass className="w-4 h-4 text-[#355B2F]" />
            <span>Phòng thi HSK</span>
          </Link>

          <Link
            href="/s/home"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#204434] text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
          >
            <Home className="w-4 h-4 text-[#8F6D3B]" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
