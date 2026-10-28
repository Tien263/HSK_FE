"use client";

import React, { useRef, useState } from "react";
import { Download, FileText, Plus, Share2, Trash2, X, Cloud, CheckCircle2, AlertCircle } from "lucide-react";
import { portalFetch, usePortalData } from "./use-portal-data";
import CloudinaryUpload from "@/components/common/CloudinaryUploadButton";
import styles from "./Ink.module.css";

type Material = {
  id: string;
  title: string;
  description: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  createdAt: string;
  downloadUrl: string;
  canManage?: boolean;
  classes: { classId: string; class: { name: string } }[];
};

export default function TeachingMaterialsWorkspace({
  classId,
  readOnly = false,
}: {
  classId?: string;
  readOnly?: boolean;
}) {
  const { data, error, loading, reload } = usePortalData<{ items: Material[] }>(
    `/api/v1/materials${classId ? `?classId=${classId}` : ""}`
  );
  const { data: classData } = usePortalData<{ items: { id: string; name: string }[] }>(
    readOnly ? null : "/api/v1/classes"
  );

  const [upload, setUpload] = useState(false);
  const [share, setShare] = useState<Material | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [byteSize, setByteSize] = useState(0);
  const [mimeType, setMimeType] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const classes = classData?.items || [];

  async function remove(item: Material) {
    if (!confirm(`Xóa tài liệu “${item.title}” và gỡ khỏi các lớp đã chia sẻ?`)) return;
    setBusy(true);
    try {
      await portalFetch(`/api/v1/materials/${item.id}`, { method: "DELETE" });
      reload();
      setMessage("Đã xóa tài liệu.");
    } catch (err: any) {
      setMessage(err?.message || "Lỗi khi xóa tài liệu.");
    } finally {
      setBusy(false);
    }
  }

  const handleCloudinaryUploaded = (url: string, result?: any) => {
    setFileUrl(url);
    if (result) {
      const origName = result.original_filename
        ? `${result.original_filename}.${result.format || "bin"}`
        : `tai_lieu_${Date.now()}.${result.format || "pdf"}`;
      setFileName(origName);
      setByteSize(result.bytes || 1024);
      setMimeType(result.resource_type || "application/octet-stream");
      if (!title.trim()) {
        setTitle(result.original_filename || "Tài liệu học tập");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      if (upload) {
        if (!fileUrl.trim()) {
          throw new Error("Vui lòng tải file tài liệu lên Cloudinary trước khi lưu.");
        }

        await portalFetch("/api/v1/materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            fileUrl,
            fileName: fileName || "tai_lieu_hoc_tap.pdf",
            byteSize: byteSize || 1024,
            mimeType: mimeType || "application/pdf",
            classIds: selected,
          }),
        });
      } else if (share) {
        await portalFetch(`/api/v1/materials/${share.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classIds: selected }),
        });
      }

      setUpload(false);
      setShare(null);
      setFileUrl("");
      setFileName("");
      reload();
      setMessage(upload ? "🎉 Đã tải lên Cloudinary và chia sẻ tài liệu thành công!" : "Đã cập nhật quyền chia sẻ tài liệu.");
    } catch (err: any) {
      setMessage(err?.message || "Lỗi xử lý tài liệu.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${styles.workspace} ${styles.stack}`}>
      <div className={styles.row}>
        <div>
          <h3 className={styles.panelTitle}>Tài liệu {classId ? "của lớp" : "của tôi"}</h3>
          <p className={styles.muted}>
            {readOnly
              ? "Các file được giáo viên chia sẻ qua Đám mây Cloudinary CDN tốc độ cao."
              : "Tải tài liệu lên thư mục riêng 'hsk_teaching_materials' trên Cloudinary và chọn lớp chia sẻ."}
          </p>
        </div>
        {!readOnly && (
          <button
            className={styles.button}
            onClick={() => {
              setUpload(true);
              setSelected(classId ? [classId] : []);
              setTitle("");
              setDescription("");
              setFileUrl("");
              setFileName("");
              setMessage("");
            }}
          >
            <Plus size={14} />
            <span>Thêm tài liệu (Cloudinary)</span>
          </button>
        )}
      </div>

      {message && <p role="status" className={styles.notice}>{message}</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {loading && <p className={styles.empty}>Đang tải tài liệu…</p>}

      <div className={styles.grid2}>
        {data?.items.map((item) => (
          <article key={item.id} className={styles.panel}>
            <div className={styles.row}>
              <div className="flex items-center gap-2">
                <FileText size={24} className="text-[#9b7f4f]" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
                  <Cloud size={10} />
                  <span>Cloudinary CDN</span>
                </span>
              </div>
              <span className={styles.tag}>{(item.byteSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <h4 className="mt-4 font-serif text-lg font-bold">{item.title}</h4>
            <p className={styles.muted}>{item.fileName}</p>
            {item.description && <p className={styles.meaning}>{item.description}</p>}
            <p className="mt-3 text-[10px] leading-6 text-[#8a927e]">
              {new Date(item.createdAt).toLocaleDateString("vi-VN")} ·{" "}
              {item.classes.length
                ? `Đã chia sẻ: ${item.classes.map((value) => value.class.name).join(", ")}`
                : "Chỉ trong kho riêng"}
            </p>
            <div className={`${styles.actions} mt-4`}>
              <a className={styles.button} href={item.downloadUrl} target="_blank" rel="noreferrer">
                <Download size={14} />
                <span>Tải file</span>
              </a>
              {!readOnly && item.canManage !== false && (
                <>
                  <button
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={() => {
                      setShare(item);
                      setSelected(item.classes.map((value) => value.classId));
                      setMessage("");
                    }}
                  >
                    <Share2 size={13} />
                    <span>Chia sẻ lớp</span>
                  </button>
                  <button
                    disabled={busy}
                    className={`${styles.button} ${styles.danger}`}
                    onClick={() => void remove(item)}
                    aria-label={`Xóa tài liệu ${item.title}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      {data && !data.items.length && (
        <p className={styles.empty}>
          {readOnly
            ? "Giáo viên chưa chia sẻ tài liệu cho lớp này."
            : "Chưa có tài liệu. Tải file lên Cloudinary để bắt đầu xây dựng thư viện học tập cho học sinh."}
        </p>
      )}

      {(upload || share) && (
        <div className={styles.overlay}>
          <form
            className={`${styles.modal} ${styles.stack}`}
            role="dialog"
            aria-modal="true"
            aria-label={upload ? "Thêm tài liệu" : "Chia sẻ tài liệu"}
            onSubmit={handleFormSubmit}
          >
            <div className={styles.row}>
              <h3 className={styles.panelTitle}>
                {upload ? "Tải lên tài liệu học tập (Cloudinary)" : "Chọn lớp được xem tài liệu"}
              </h3>
              <button
                type="button"
                disabled={busy}
                className={`${styles.button} ${styles.secondary}`}
                onClick={() => {
                  setUpload(false);
                  setShare(null);
                }}
                aria-label="Đóng tài liệu"
              >
                <X size={14} />
              </button>
            </div>

            {upload && (
              <>
                <label className={styles.label}>
                  Tên tài liệu <span className="text-red-500">*</span>
                  <input
                    required
                    maxLength={300}
                    className={styles.input}
                    placeholder="VD: Giáo trình ngữ pháp HSK 1, File nghe luyện tập..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  Mô tả tài liệu
                  <textarea
                    className={styles.input}
                    maxLength={3000}
                    placeholder="Ghi chú hướng dẫn cho học sinh khi xem tài liệu..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>

                {/* Upload File Cloudinary CDN vào thư mục riêng hsk_teaching_materials */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-[#FFFCF6] border border-[#BC9B6B]/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#204434]">
                      File tài liệu (Tải lên Cloudinary CDN):
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">
                      Thư mục: hsk_teaching_materials
                    </span>
                  </div>

                  <CloudinaryUpload
                    value={fileUrl}
                    onChange={handleCloudinaryUploaded}
                    folder="hsk_teaching_materials"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.csv,.txt,.mp3,.wav,.m4a,.png,.jpg,.jpeg,.webp"
                    placeholder="Nhấp để tải file (PDF, Word, PPT, Audio, Ảnh) lên Cloudinary..."
                  />
                </div>
              </>
            )}

            <fieldset>
              <legend className="mb-3 text-xs font-bold">
                Lớp được chia sẻ (bỏ trống để lưu trong kho riêng của Thầy/Cô)
              </legend>
              <div className="max-h-48 space-y-3 overflow-auto">
                {classes.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 text-xs">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={(event) =>
                        setSelected((previous) =>
                          event.target.checked
                            ? [...previous, item.id]
                            : previous.filter((id) => id !== item.id)
                        )
                      }
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
                {!classes.length && <p className={styles.muted}>Chưa có lớp để chia sẻ.</p>}
              </div>
            </fieldset>

            {message && <p role="alert" className={styles.error}>{message}</p>}

            <button disabled={busy || (upload && !fileUrl)} className={styles.button}>
              {busy ? "Đang xử lý…" : upload ? "☁️ Xuất bản lên Cloudinary & Chia sẻ" : "Lưu quyền chia sẻ"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
