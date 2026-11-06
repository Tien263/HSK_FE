"use client";

import { useEffect, useState } from "react";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";

type Backup = { lessons: Hsk1FullLesson[]; isDeleted: boolean; revision?: number };
type Entry = { id: string; label: string; date: number; local?: Backup };

function getBrowserEntries(level: number): Entry[] {
  const entries: Entry[] = [];
  try {
    const raw = JSON.parse(localStorage.getItem(`hsk_curriculum_snapshots_level_${level}`) ?? "[]");
    if (Array.isArray(raw)) {
      for (const entry of raw) {
        if (entry?.level === level && Array.isArray(entry.lessons)) {
          entries.push({
            id: entry.id,
            date: entry.timestamp,
            label: `Trình duyệt · ${entry.label} (${entry.lessons.length} bài)`,
            local: { lessons: entry.lessons, isDeleted: false },
          });
        }
      }
    }
  } catch {}
  try {
    const draft = JSON.parse(localStorage.getItem(`hsk_admin_custom_curriculum_level_${level}`) ?? "null");
    if (Array.isArray(draft)) {
      entries.unshift({ id: "draft", label: `Bản nháp trình duyệt (${draft.length} bài)`, date: 0,
        local: { lessons: draft, isDeleted: false } });
    }
  } catch {}
  return entries;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  canRestore: boolean;
  onRestoreSnapshot: (lessons: Hsk1FullLesson[], isDeleted: boolean) => Promise<boolean>;
}

export default function CurriculumRevisionHistoryModal({
  isOpen, onClose, level, canRestore, onRestoreSnapshot,
}: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const url = `/api/v1/admin/curriculum?level=${level}&history=`;

  useEffect(() => {
    const controller = new AbortController();
    const local = getBrowserEntries(level);
    setEntries(local);
    fetch(url + "list", {
      credentials: "include",
      signal: controller.signal,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      if (!controller.signal.aborted) {
        setEntries([
          ...data.items.map((entry: { id: string; createdAt: string }) => ({
            id: entry.id, label: "Bản sao trước khi ghi lên máy chủ", date: Date.parse(entry.createdAt),
          })),
          ...local,
        ]);
      }
    }).catch(() => {
      if (!controller.signal.aborted) setError("Không tải được lịch sử máy chủ.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [level, url]);

  if (!isOpen) return null;

  const useBackup = async (entry: Entry, restore: boolean) => {
    setBusy(true);
    setError("");
    try {
      let backup = entry.local;
      if (!backup) {
        const res = await fetch(url + encodeURIComponent(entry.id), { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Không tải được bản sao.");
        backup = data as Backup;
      }
      if (restore) {
        if (confirm(`Khôi phục HSK ${level} về bản này (${backup.lessons.length} bài) và lưu ngay lên máy chủ?`)) {
          if (await onRestoreSnapshot(backup.lessons, backup.isDeleted)) onClose();
          else setError("Chưa khôi phục được. Bạn có thể tải bản sao JSON.");
        }
      } else {
        const file = new Blob([JSON.stringify({ level, ...backup }, null, 2)], { type: "application/json" });
        const href = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = href;
        link.download = `hsk${level}-backup-${backup.revision ?? entry.id}.json`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(href), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đọc được bản sao.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div role="dialog" aria-modal="true" aria-label={`Lịch sử HSK ${level}`}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-[#FFFCF6] p-5 text-[#204434]">
        <div className="flex items-center justify-between gap-3 pb-3">
          <h3 className="text-lg font-bold">Lịch sử giáo trình HSK {level}</h3>
          <button type="button" disabled={busy} onClick={onClose}>Đóng</button>
        </div>
        {error && <p role="alert" className="pb-3 text-sm text-red-800">{error}</p>}
        <div className="space-y-2 overflow-y-auto">
          {loading && <p>Đang tải lịch sử máy chủ…</p>}
          {!loading && !error && entries.length === 0 && <p>Chưa có bản sao cho cấp này.</p>}
          {entries.map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5DEC9] bg-white p-3">
              <div>
                <p className="text-sm font-semibold">{entry.label}</p>
                {entry.date > 0 && <p className="text-xs">{new Date(entry.date).toLocaleString("vi-VN")}</p>}
              </div>
              <div className="flex gap-3 text-sm">
                <button type="button" disabled={busy} className="underline disabled:opacity-50"
                  onClick={() => void useBackup(entry, false)}>Tải JSON</button>
                <button type="button" disabled={busy || !canRestore} className="font-bold disabled:opacity-50"
                  onClick={() => void useBackup(entry, true)}>Khôi phục</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
