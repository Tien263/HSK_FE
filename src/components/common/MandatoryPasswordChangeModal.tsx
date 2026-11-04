"use client";

import { useState } from "react";
import { KeyRound, Lock, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface MandatoryPasswordChangeModalProps {
  isOpen: boolean;
  userRole?: string;
  userName?: string;
  onSuccess: () => void;
}

export default function MandatoryPasswordChangeModal({
  isOpen,
  userRole = "TEACHER",
  userName = "Giáo viên",
  onSuccess,
}: MandatoryPasswordChangeModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Đổi mật khẩu thành công! Mật khẩu mới này là của riêng bạn.");
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        setErrorMsg(data.message || "Không thể đổi mật khẩu.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-amber-400/80 bg-[#FFFCF6] p-6 sm:p-7 shadow-2xl">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-[#BC9B6B] to-emerald-700" />

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 border border-amber-300 shadow-xs shrink-0">
            <KeyRound size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Bắt Buộc Thiết Lập Lần Đầu
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1A3D2F]">
              Đổi Mật Khẩu Riêng Cho Giáo Viên
            </h3>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 leading-relaxed mb-4">
          <p className="flex items-start gap-2">
            <ShieldAlert size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <span>
              Kính chào <strong>{userName}</strong>. Tài khoản Giáo viên của bạn được Quản trị viên cấp với mật khẩu tạm thời. Để bảo mật giáo án và kết quả học viên, vui lòng đổi sang <strong>mật khẩu của riêng bạn</strong> để tiếp tục làm việc.
            </span>
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#1A3D2F] mb-1">
              Mật khẩu tạm thời (do Admin cấp) *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu Admin vừa cấp cho bạn"
                className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3.5 py-2.5 text-xs text-[#1A3D2F] focus:outline-none focus:ring-2 focus:ring-[#204434]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A3D2F] mb-1">
              Mật khẩu mới của riêng bạn (tối thiểu 6 ký tự) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới của bạn"
              className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3.5 py-2.5 text-xs text-[#1A3D2F] focus:outline-none focus:ring-2 focus:ring-[#204434]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A3D2F] mb-1">
              Xác nhận lại mật khẩu mới *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại chính xác mật khẩu mới"
              className="w-full rounded-xl border border-[#BC9B6B]/40 bg-white px-3.5 py-2.5 text-xs text-[#1A3D2F] focus:outline-none focus:ring-2 focus:ring-[#204434]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#204434] py-3 text-xs font-bold text-white shadow-md hover:bg-[#2c5a45] transition cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Đang lưu mật khẩu...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  Lưu Mật Khẩu Riêng & Bắt Đầu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
