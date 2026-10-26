"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, LoaderCircle, Save, Search } from "lucide-react";
import DictionaryReauthentication from "@/components/admin/DictionaryReauthentication";

type Entry = {
  id: number; simplified: string; traditional: string; pinyin: string;
  definitionsEn: string[]; definitionsVi: string[];
  meaningViStatus: "MISSING" | "GENERATED" | "REVIEWED";
  meaningViSource: string | null; meaningViRevision: number;
};
type Result = { items: Entry[]; total: number; counts: Record<string, number> };
const labels = { MISSING: "Chưa có nghĩa Việt", GENERATED: "Chờ duyệt", REVIEWED: "Đã duyệt" };

function Editor({ entry, onSaved }: { entry: Entry; onSaved: () => void }) {
  const [text, setText] = useState(entry.definitionsVi.join("\n"));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  async function save(approve: boolean) {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/dictionary", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: entry.id, revision: entry.meaningViRevision, definitionsVi: text.split("\n").map((line) => line.trim()).filter(Boolean), approve }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lưu thất bại.");
      onSaved();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Lưu thất bại."); }
    finally { setSaving(false); }
  }
  return <article className="rounded-2xl border border-[#dfe4d6] bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-baseline gap-3"><h2 lang="zh-CN" className="text-2xl font-bold">{entry.simplified}</h2><span className="text-sm text-[#788957]">{entry.pinyin}</span>{entry.traditional !== entry.simplified && <span className="text-sm text-[#8c9783]">{entry.traditional}</span>}</div><span className={`rounded-full px-3 py-1 text-xs font-bold ${entry.meaningViStatus === "REVIEWED" ? "bg-green-100 text-green-800" : "bg-amber-50 text-amber-800"}`}>{labels[entry.meaningViStatus]}</span></div>
    <p className="mt-3 text-xs leading-6 text-[#7a826f]">Nghĩa gốc: {entry.definitionsEn.join(" / ")}</p>
    <label htmlFor={`meaning-${entry.id}`} className="mb-2 mt-4 block text-xs font-bold">Nghĩa tiếng Việt — mỗi nghĩa một dòng</label>
    <textarea id={`meaning-${entry.id}`} value={text} onChange={(event) => setText(event.target.value)} rows={3} maxLength={20000} className="w-full rounded-xl border border-[#dce3d2] bg-[#fbfcf8] p-3 text-sm outline-none focus:border-[#638252]" />
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="max-w-sm break-all text-[11px] text-[#8b9580]">Nguồn: {entry.meaningViSource || "Chưa có"}</span><div className="flex gap-2"><button disabled={saving} onClick={() => save(false)} className="flex items-center gap-2 rounded-xl border border-[#dce3d2] px-4 py-2 text-xs font-bold disabled:opacity-40"><Save size={14} />Lưu nháp</button><button disabled={saving || !text.trim()} onClick={() => save(true)} className="flex items-center gap-2 rounded-xl bg-[#315541] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">{saving ? <LoaderCircle size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}Lưu & duyệt</button></div></div>
    {message && <p role="alert" className="mt-3 text-xs text-red-700">{message}</p>}
  </article>;
}

export default function AdminDictionaryPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("GENERATED");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [reauthenticate, setReauthenticate] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/admin/dictionary?${new URLSearchParams({ q: query, status, page: String(page) })}`, { signal: controller.signal, cache: "no-store" })
        .then(async (response) => { const data = await response.json(); if (response.status === 403 || response.status === 401) { setReauthenticate(true); setResult(null); return null; } if (!response.ok) throw new Error(data.message || "Không tải được từ điển."); return data as Result; })
        .then((data) => { if (data) { setResult(data); setReauthenticate(false); } setError(""); })
        .catch((error) => { if (!controller.signal.aborted) { setResult(null); setError(error.message); } })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, status, page, refresh]);
  return <main className="min-h-screen bg-[#f8f9f3] px-5 py-8 text-[#2c4637]"><div className="mx-auto max-w-5xl">
    <Link href="/admin/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm"><ArrowLeft size={16} />Quản trị hệ thống</Link>
    <h1 className="text-3xl font-bold">Duyệt từ điển Trung–Việt</h1><p className="mt-2 text-sm text-[#7b886f]">Sửa nghĩa Việt và duyệt nội dung. Trạng thái này chỉ hiển thị cho quản trị viên.</p>
    {result && <div className="my-6 grid grid-cols-3 gap-3">{(["MISSING", "GENERATED", "REVIEWED"] as const).map((key) => <button key={key} onClick={() => { setStatus(key); setPage(1); }} className={`rounded-2xl border p-4 text-left ${status === key ? "border-[#71915a] bg-[#edf3e4]" : "border-[#dfe5d6] bg-white"}`}><span className="block text-xs">{labels[key]}</span><strong className="mt-2 block text-2xl">{(result.counts[key] || 0).toLocaleString("vi-VN")}</strong></button>)}</div>}
    <div className="my-5 flex flex-wrap gap-3"><label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-[#dce3d2] bg-white px-3"><Search size={17} /><input aria-label="Tìm mục từ" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} maxLength={80} placeholder="Giản thể, phồn thể, pinyin, nghĩa Việt…" className="w-full bg-transparent py-3 text-sm outline-none" /></label><select aria-label="Trạng thái duyệt" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-xl border border-[#dce3d2] bg-white px-3 text-sm"><option value="ALL">Tất cả</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><button onClick={() => setRefresh((value) => value + 1)} className="rounded-xl border border-[#dce3d2] bg-white px-4 text-sm">Tải lại</button></div>
    {reauthenticate && <DictionaryReauthentication onAuthenticated={() => { setReauthenticate(false); setRefresh((value) => value + 1); }} />}
    {error && <div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-800">{error} <Link href="/login" className="underline">Đăng nhập lại</Link></div>}
    {loading ? <p role="status" className="py-8 text-sm">Đang tải từ điển…</p> : result && <><p className="mb-4 text-xs text-[#7b886f]">{result.total.toLocaleString("vi-VN")} mục · Trang {page}</p><div className="space-y-4">{result.items.map((entry) => <Editor key={`${entry.id}:${entry.meaningViRevision}`} entry={entry} onSaved={() => setRefresh((value) => value + 1)} />)}</div>{!result.items.length && <p className="py-10 text-center text-sm">Không có mục từ khớp bộ lọc.</p>}<div className="my-6 flex justify-between"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-xl border px-5 py-2 text-sm disabled:opacity-40">Trang trước</button><button disabled={page * 25 >= result.total} onClick={() => setPage((value) => value + 1)} className="rounded-xl border px-5 py-2 text-sm disabled:opacity-40">Trang sau</button></div></>}
  </div></main>;
}
