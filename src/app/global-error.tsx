"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global uncaught application error:", error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#FDFBF7] text-[#204434] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#FFFCF6] border-2 border-[#BC9B6B]/60 rounded-3xl p-8 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-3xl border border-amber-200 shadow-inner">
            🏮
          </div>

          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl text-[#204434]">
              Không gian học tập đang sẵn sàng
            </h2>
            <p className="text-xs text-[#315E48] leading-relaxed">
              Hệ thống đã tự động lưu tiến trình học tập của bạn. Bấm &quot;Tải lại&quot; để tiếp tục ngay hoặc quay về phòng luyện tập.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Tải lại trang
            </button>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/s/home";
                }
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] hover:bg-[#FAF7F0] text-[#204434] text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              Về trang chủ học tập
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
