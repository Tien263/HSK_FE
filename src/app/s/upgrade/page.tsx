"use client";

import { useState } from "react";
import Link from "next/link";
import UpgradePackageModal from "@/components/student/UpgradePackageModal";
import { ArrowLeft, Sparkles, QrCode } from "lucide-react";

export default function UpgradePage() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#FAF7F0] p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md">
          <Sparkles size={32} />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A3D2F]">
          Cổng Mở Khóa Gói Học & Nâng Cấp VIP
        </h1>
        <p className="text-xs sm:text-sm text-[#526c50] leading-relaxed">
          Nâng cấp tài khoản để học trọn vẹn HSK 1 - 9, không giới hạn lượt trò chuyện cùng AI Doubao và mở khóa thi thử có giám sát trực tuyến.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-[#204434] px-8 py-3 text-xs font-bold text-white shadow-md hover:bg-[#2c5a45] transition cursor-pointer"
          >
            <QrCode size={16} />
            Xem Bảng Giá & Quét Mã QR
          </button>
          <Link
            href="/s/home"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-[#BC9B6B]/50 bg-white px-6 py-3 text-xs font-bold text-[#1A3D2F] hover:bg-[#FAF7F0] transition"
          >
            <ArrowLeft size={16} />
            Quay Về Trang Chủ
          </Link>
        </div>
      </div>

      <UpgradePackageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
