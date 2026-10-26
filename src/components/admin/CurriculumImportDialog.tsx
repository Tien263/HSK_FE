"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileCheck2, LoaderCircle, Upload, X } from "lucide-react";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";
import { applyCurriculumImport, curriculumScopes, curriculumTemplate, curriculumTemplateCsv, normalizeLessons, parseCurriculumCsv, type CurriculumScope } from "@/lib/curriculum-format";

export function downloadCurriculumFile(name: string, content: string, type = "application/json;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const control = "w-full rounded-xl border border-[#E5DEC9] bg-white px-3 py-2.5 text-sm text-[#204434] outline-none focus:border-[#315E48]";
export default function CurriculumImportDialog({ level, lessons, initialScope = "lessons", initialTarget, onClose, onApply }: {
  level: number; lessons: Hsk1FullLesson[]; initialScope?: CurriculumScope; initialTarget?: number;
  onClose: () => void; onApply: (lessons: Hsk1FullLesson[]) => Promise<boolean>;
}) {
  const [scope, setScope] = useState(initialScope); const [target, setTarget] = useState(initialTarget ? String(initialTarget) : "");
  const [mode, setMode] = useState<"merge" | "replace">("merge"); const [preview, setPreview] = useState<Hsk1FullLesson[] | null>(null);
  const [fileName, setFileName] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null); const panelRef = useRef<HTMLDivElement>(null);
  const readVersion = useRef(0);
  useEffect(() => { const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; panelRef.current?.focus(); return () => { document.body.style.overflow = previous; }; }, []);
  const definition = curriculumScopes.find(item => item.id === scope)!;
  function clear() { readVersion.current++; setPreview(null); setFileName(""); setError(""); if (fileRef.current) fileRef.current.value = ""; }
  async function readFile(file: File) {
    const version = ++readVersion.current;
    setError(""); setPreview(null); setFileName(file.name);
    try {
      if (file.size > 8 * 1024 * 1024) throw new Error("File tối đa 8 MB.");
      const text = await file.text();
      if (version !== readVersion.current) return;
      const data = file.name.toLowerCase().endsWith(".csv") ? parseCurriculumCsv(text) : file.name.toLowerCase().endsWith(".json") ? JSON.parse(text.replace(/^\uFEFF/, "")) : (() => { throw new Error("Chọn file JSON hoặc CSV UTF-8 theo mẫu."); })();
      const next = applyCurriculumImport(lessons, data, level, scope, mode, target ? Number(target) : undefined);
      setPreview(next);
    } catch (error) { setError(error instanceof Error ? error.message : "Không đọc được file."); }
  }
  const baseline = preview ? normalizeLessons(lessons, level) : lessons;
  const changed = preview?.filter(lesson => JSON.stringify(lesson) !== JSON.stringify(baseline.find(item => item.number === lesson.number))) || [];
  const removed = lessons.filter(lesson => preview && !preview.some(item => item.number === lesson.number));
  const added = changed.filter(lesson => !lessons.some(item => item.number === lesson.number)).length;
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#10291f]/65 p-3 backdrop-blur-sm" onKeyDown={event => {
    if (event.key === "Escape" && !busy) { event.stopPropagation(); onClose(); }
    if (event.key === "Tab") { const controls = [...(panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]') || [])].filter(el => el.getClientRects().length > 0); const first = controls[0]; const last = controls.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
  }}>
    <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="curriculum-import-title" tabIndex={-1} className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#BC9B6B]/40 bg-[#FFFCF6] text-[#204434] shadow-2xl outline-none">
      <header className="flex items-start justify-between gap-4 border-b border-[#E5DEC9] bg-[#F8F5ED] p-5 sm:px-7"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#8F6D3B]">Kho giáo trình · HSK {level}</p><h2 id="curriculum-import-title" className="font-serif text-xl font-bold">Nhập học liệu theo từng phần</h2><p className="mt-2 text-xs leading-6 text-[#64755d]">Tải đúng file mẫu, xem trước thay đổi rồi lưu vào kho chung.</p></div><button aria-label="Đóng nhập học liệu" disabled={busy} onClick={onClose} className="rounded-full border border-[#E5DEC9] p-2"><X size={17} /></button></header>
      <div className="space-y-5 overflow-auto p-5 sm:px-7">
        <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-xs font-semibold">Loại học liệu<select aria-label="Loại học liệu" className={control} value={scope} disabled={busy} onChange={e => { setScope(e.target.value as CurriculumScope); clear(); }}>{curriculumScopes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="space-y-2 text-xs font-semibold">Phạm vi bài học<select aria-label="Phạm vi bài học" className={control} value={target} disabled={busy || initialTarget !== undefined} onChange={e => { setTarget(e.target.value); clear(); }}><option value="">{scope === "lessons" ? "Một hoặc nhiều bài trong cấp HSK" : "Nhiều bài — theo cột lessonNumber"}</option>{lessons.map(lesson => <option key={lesson.number} value={lesson.number}>Bài {lesson.number} · {lesson.titleVi || lesson.titleZh}</option>)}</select></label></div>
        <div className="rounded-2xl border border-[#E5DEC9] bg-[#F8F5ED] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-bold">File mẫu · {definition.label}</h3><p className="mt-1 text-xs text-[#6c7c65]">CSV mở được bằng Excel; JSON hỗ trợ đầy đủ cấu trúc lồng nhau.</p></div><div className="flex gap-2">{["csv", "json"].map(extension => <button key={extension} className="flex items-center gap-2 rounded-xl border border-[#D7C9AB] bg-[#FFFCF6] px-3 py-2 text-xs font-bold" onClick={() => { const number = Number(target) || lessons[0]?.number || 1; downloadCurriculumFile(`mau-hsk${level}-${scope}.${extension}`, extension === "csv" ? curriculumTemplateCsv(scope, level, number) : JSON.stringify(curriculumTemplate(scope, level, number), null, 2), extension === "csv" ? "text/csv;charset=utf-8" : undefined); }}><Download size={13} />.{extension.toUpperCase()}</button>)}</div></div><p className="mt-3 break-words font-mono text-[10px] leading-6 text-[#8F6D3B]">{definition.columns.join(" · ")}</p>{scope === "phonetics" && <p className="mt-1 text-xs text-[#64755d]">Trong CSV, phân cách các ví dụ bằng dấu |.</p>}</div>
        <fieldset disabled={busy}><legend className="mb-2 text-xs font-bold">Cách áp dụng</legend><div className="grid gap-3 sm:grid-cols-2">{([{ value: "merge", label: "Thêm và cập nhật", help: "Giữ phần khác; cập nhật mục trùng, bổ sung mục mới." }, { value: "replace", label: "Thay thế phần đã chọn", help: scope === "lessons" && !target ? "Thay toàn bộ bài học của cấp HSK này." : "Chỉ thay loại học liệu này trong các bài được nhập." }] as const).map(item => <label key={item.value} className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-xs leading-6 ${mode === item.value ? "border-[#315E48] bg-[#edf0e5]" : "border-[#E5DEC9]"}`}><input type="radio" name="import-mode" value={item.value} checked={mode === item.value} onChange={() => { setMode(item.value); clear(); }} /><span><strong className="block">{item.label}</strong><span className="text-[#6c7c65]">{item.help}</span></span></label>)}</div></fieldset>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-[#b1bda5] bg-[#f8f9f1] px-5 py-6 text-center"><Upload size={24} className="text-[#648257]" /><strong className="text-sm">{fileName || "Chọn file JSON hoặc CSV UTF-8"}</strong><span className="text-xs text-[#7c8771]">Tối đa 8 MB · Dữ liệu chưa được lưu ở bước này</span><input ref={fileRef} aria-label="File học liệu" type="file" accept=".json,.csv,application/json,text/csv" disabled={busy} onChange={event => { const file = event.target.files?.[0]; if (file) void readFile(file); }} className="mt-2 max-w-full text-xs" /></label>
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs leading-6 text-red-800">{error}</p>}
        {preview && <section className="rounded-2xl border border-[#c5d3b7] bg-[#f1f5ea] p-4"><h3 className="flex items-center gap-2 text-sm font-bold"><FileCheck2 size={16} />Xem trước thay đổi</h3><p className="mt-2 text-xs leading-6">{added} bài mới · {changed.length - added} bài cập nhật · {removed.length} bài bị xóa · Sau lưu: {preview.length} bài.</p><ul className="mt-3 max-h-40 space-y-2 overflow-auto text-xs">{changed.map(lesson => <li key={lesson.number}>Bài {lesson.number}: {lesson.titleVi || lesson.titleZh} — {lesson.vocabList.length} từ, {lesson.grammarList.length} ngữ pháp, {lesson.dialogue.length} lượt thoại</li>)}{removed.map(lesson => <li key={"remove" + lesson.number} className="text-red-700">Xóa Bài {lesson.number}: {lesson.titleVi || lesson.titleZh}</li>)}</ul></section>}
      </div>
      <footer className="flex flex-wrap justify-end gap-3 border-t border-[#E5DEC9] p-4 sm:px-7"><button disabled={busy} onClick={onClose} className="rounded-xl border border-[#E5DEC9] px-4 py-2.5 text-xs font-bold">Hủy</button><button disabled={!preview || busy || (!changed.length && !removed.length)} className="flex items-center gap-2 rounded-xl bg-[#204434] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-40" onClick={async () => { if (!preview) return; if (mode === "replace" && !confirm(`Lưu thay thế ${definition.label.toLowerCase()} theo bản xem trước trong HSK ${level}?`)) return; setBusy(true); try { if (await onApply(preview)) onClose(); else setError("Chưa lưu được vào kho chung. Bạn có thể đóng hộp nhập để xác thực lại hoặc tải lại dữ liệu trước khi thử tiếp."); } catch (error) { setError(error instanceof Error ? error.message : "Chưa lưu được dữ liệu."); } finally { setBusy(false); } }}>{busy ? <LoaderCircle size={14} className="animate-spin" /> : <FileCheck2 size={14} />}{busy ? "Đang lưu vào kho…" : "Xác nhận & lưu vào kho"}</button></footer>
    </div>
  </div>;
}
