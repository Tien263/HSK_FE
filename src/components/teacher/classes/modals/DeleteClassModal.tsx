"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { ClassDetailItem } from "../types";

interface DeleteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletingClass: ClassDetailItem | null;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export default function DeleteClassModal({
  isOpen,
  onClose,
  deletingClass,
  onConfirm,
  loading,
}: DeleteClassModalProps) {
  if (!isOpen || !deletingClass) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden space-y-4 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#17382F]">
              Xác nhận xóa lớp học
            </h3>
            <p className="text-xs text-[#6B766D]">
              Hành động này không thể hoàn tác
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1.5 leading-relaxed">
          <p>
            Bạn có chắc chắn muốn xóa lớp học <strong>"{deletingClass.name}"</strong> (Mã: {deletingClass.code})?
          </p>
          <p className="text-[11px] text-red-700">
            Toàn bộ lộ trình bài học đã công bố, phân công bài tập và liên kết học sinh của lớp này sẽ bị xóa khỏi hệ thống. Tài khoản học viên vẫn được bảo lưu an toàn.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-[#E5DFD0] bg-white text-xs font-semibold text-[#17382F] hover:bg-[#FAF7F0] cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? "Đang xóa lớp..." : "Xác nhận xóa vĩnh viễn"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
