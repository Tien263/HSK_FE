"use client";

import { useState } from "react";

export default function DictionaryReauthentication({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <form onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/v1/auth/login", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không đăng nhập được.");
      if (data.user?.role !== "ADMIN") throw new Error("Tài khoản này không có quyền quản trị từ điển.");
      try { localStorage.setItem("currentUser", JSON.stringify(data.user)); } catch { /* Session cookie remains authoritative. */ }
      setPassword(""); onAuthenticated();
    } catch (error) { setError(error instanceof Error ? error.message : "Không xác thực được phiên."); }
    finally { setBusy(false); }
  }} className="my-6 max-w-lg rounded-2xl border border-[#dce3d2] bg-white p-6">
    <h2 className="font-bold">Xác thực phiên quản trị</h2>
    <p className="mb-5 mt-2 text-sm leading-6 text-[#718268]">Thông tin tài khoản vẫn còn trên trình duyệt nhưng phiên server đã hết hạn hoặc chưa được tạo. Đăng nhập ngay tại đây để tiếp tục duyệt từ.</p>
    <label className="mb-3 block text-xs font-semibold">Tài khoản admin<input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 w-full rounded-xl border border-[#dce3d2] p-3 text-sm" /></label>
    <label className="mb-4 block text-xs font-semibold">Mật khẩu<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-[#dce3d2] p-3 text-sm" /></label>
    {error && <p role="alert" className="mb-4 text-xs text-red-700">{error}</p>}
    <button disabled={busy} className="rounded-xl bg-[#315541] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Đang xác thực…" : "Đăng nhập & tiếp tục"}</button>
  </form>;
}
