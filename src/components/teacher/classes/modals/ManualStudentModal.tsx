"use client";

import React, { useState } from "react";
import { X, UserPlus, Key, Mail, User, Lock } from "lucide-react";
import { ClassDetailItem } from "../types";

interface ManualStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClass: ClassDetailItem;
  onSubmit: (data: {
    name: string;
    username: string;
    email?: string;
    password?: string;
  }) => Promise<void>;
  loading: boolean;
}

export default function ManualStudentModal({
  isOpen,
  onClose,
  currentClass,
  onSubmit,
  loading,
}: ManualStudentModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Vui lòng nhập tên đăng nhập cho học sinh.");
      return;
    }
    setError("");
    await onSubmit({
      name: name.trim() || username.trim(),
      username: username.trim(),
      email: email.trim() || undefined,
      password: password.trim() || "123456",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E5DFD0] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1F513F]/10 text-[#1F513F] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#17382F]">
                Thêm học sinh vào lớp
              </h3>
              <p className="text-[11px] text-[#6B766D]">
                Lớp {currentClass.name} (Mã: {currentClass.code})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#17382F] block">
              Họ và tên học sinh
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#6B766D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="VD: Nguyễn Văn An"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-[#E5DFD0] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#17382F] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#17382F] block">
              Tên đăng nhập (Username) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-[#6B766D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="VD: an_hsk1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-[#E5DFD0] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#17382F] focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#17382F] block">
              Email liên hệ (Tùy chọn)
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#6B766D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="VD: an@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E5DFD0] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#17382F] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#17382F] block">
              Mật khẩu khởi tạo
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#6B766D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#E5DFD0] rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-[#17382F] focus:outline-hidden"
              />
            </div>
            <p className="text-[10px] text-[#6B766D]">
              Nếu học sinh đã có tài khoản, hệ thống sẽ thêm vào lớp mà không đổi mật khẩu cũ.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E5DFD0] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-[#E5DFD0] bg-white text-xs font-semibold text-[#17382F] hover:bg-[#FAF7F0] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-bold hover:bg-[#17382F] transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? "Đang xử lý..." : "Thêm vào lớp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
