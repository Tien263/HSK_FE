"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { publicExamQuestion } from "@/lib/exam-center-core";
import { playChineseSpeech } from "@/lib/chinese-speech-player";
import s from "./ExamPlayer.module.css";

type Question = ReturnType<typeof publicExamQuestion>;

const decode = (value: string, fallback: unknown) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export default function ExamQuestionInput({
  question: q,
  value = "",
  onChange,
  disabled = false,
}: {
  question: Question;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [error, setError] = useState("");
  const strVal = value || "";

  const media = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_000_000 || !/^audio\/|^image\//.test(file.type)) {
      setError("Chọn tệp âm thanh / ảnh tối đa 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      setError("");
    };
    reader.readAsDataURL(file);
  };

  // Chuẩn hóa danh sách lựa chọn Options luôn là một mảng an toàn
  const rawOptions = useMemo(() => {
    if (Array.isArray(q.options)) return q.options;
    if (typeof q.options === "string") {
      const parsed = decode(q.options, []);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  }, [q.options]);

  const normalizedOptions = useMemo(() => {
    return rawOptions.map((opt: any, idx: number) => {
      if (typeof opt === "object" && opt !== null) {
        return {
          id: String(opt.id || String.fromCharCode(65 + idx)),
          text: String(opt.text || opt.content || ""),
          imageUrl: opt.imageUrl ? String(opt.imageUrl) : undefined,
        };
      }
      return {
        id: String.fromCharCode(65 + idx),
        text: String(opt ?? ""),
        imageUrl: undefined,
      };
    });
  }, [rawOptions]);

  // Nhận diện câu hỏi có hình ảnh lựa chọn (như trong HSK 1, 2, 3)
  const hasImageOptions = useMemo(() => {
    return normalizedOptions.some(
      (opt) => typeof opt.imageUrl === "string" && opt.imageUrl.length > 0
    );
  }, [normalizedOptions]);

  // Đếm ký tự chữ Hán cho phần tự luận / viết
  const hanziCharCount = useMemo(() => {
    if (!strVal || typeof strVal !== "string") return 0;
    const match = strVal.match(/[\u4e00-\u9fa5]/g);
    return match ? match.length : 0;
  }, [strVal]);

  let inputContent = null;

  // 1. Speaking / Recording or Photo Upload
  if (
    q.skill === "SPEAKING" ||
    ["speaking", "speaking_audio", "audio", "handwriting_photo"].includes(q.type)
  ) {
    inputContent = (
      <div style={{ display: "grid", gap: 14 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#365330" }}>
          {q.type === "handwriting_photo"
            ? "Tải ảnh bài viết tay của bạn (Hỗ trợ chụp từ camera)"
            : "Bản ghi âm bài nói / Trả lời khẩu ngữ"}
          <input
            disabled={disabled}
            type="file"
            accept={q.type === "handwriting_photo" ? "image/*" : "audio/*"}
            capture={q.type === "handwriting_photo" ? "environment" : "user"}
            onChange={(e) => void media(e.target.files?.[0])}
            style={{ marginTop: 8, display: "block" }}
          />
        </label>

        {strVal.startsWith("data:audio/") ? (
          <audio controls src={strVal} style={{ maxWidth: "100%" }} />
        ) : strVal.startsWith("data:image/") ? (
          <Image
            unoptimized
            width={720}
            height={480}
            src={strVal}
            alt="Bài viết của bạn"
            style={{ maxWidth: "100%", maxHeight: 380, objectFit: "contain", borderRadius: 12 }}
          />
        ) : (
          strVal && <p style={{ fontSize: 13, color: "#4f6844" }}>{strVal}</p>
        )}

        {strVal && !disabled && (
          <button
            type="button"
            onClick={() => onChange("")}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #d4decb",
              background: "#fff",
              cursor: "pointer",
              fontSize: 12,
              width: "fit-content",
            }}
          >
            Bỏ tệp này và chọn lại
          </button>
        )}
      </div>
    );
  }
  // 2. Picture Multiple Choice Options (Khớp 100% Ảnh mẫu HSK 3)
  else if (hasImageOptions) {
    const multiple = q.selectionMode === "MULTIPLE";
    const chosen = multiple ? decode(strVal, []) : [strVal];

    inputContent = (
      <div className={s.imageOptionsGrid}>
        {normalizedOptions.map((option) => {
          const optId = option.id;
          const isSelected = Array.isArray(chosen) && chosen.includes(optId);
          const imgSrc = option.imageUrl || "/theme/exam-bamboo-depth.png";

          return (
            <div
              key={optId}
              className={`${s.imageOptionCard} ${isSelected ? s.selected : ""}`}
              onClick={() => {
                if (disabled) return;
                if (multiple) {
                  const next = isSelected
                    ? chosen.filter((id: string) => id !== optId)
                    : [...chosen, optId];
                  onChange(JSON.stringify(next));
                } else {
                  onChange(optId);
                }
              }}
            >
              <div className={s.optionImgWrap}>
                <Image
                  unoptimized
                  width={340}
                  height={220}
                  src={imgSrc}
                  alt={`Lựa chọn ${optId}`}
                  className={s.optionImg}
                />
              </div>

              <label className={s.optionRadioLabel}>
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={`q-${q.id}`}
                  value={optId}
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => {}}
                />
                <span>{optId}</span>
                {option.text && (
                  <small style={{ fontWeight: "normal", fontSize: 12, color: "#617658" }}>
                    {option.text}
                  </small>
                )}
              </label>
            </div>
          );
        })}
      </div>
    );
  }
  // 3. Text Multiple Choice / True-False Options
  else if (["multiple_choice", "listening_choice", "true_false"].includes(q.type)) {
    const options =
      q.type === "true_false"
        ? [
            { id: "true", text: "Đúng (√)" },
            { id: "false", text: "Sai (×)" },
          ]
        : normalizedOptions;
    const multiple = q.selectionMode === "MULTIPLE";
    const chosen = multiple ? decode(strVal, []) : [strVal];

    inputContent = (
      <div className={s.textOptionsList}>
        {options.map((option: any) => {
          const isSelected = Array.isArray(chosen) && chosen.includes(option.id);
          return (
            <label
              key={option.id}
              className={`${s.textOptionRow} ${isSelected ? s.selected : ""}`}
            >
              <input
                disabled={disabled}
                type={multiple ? "checkbox" : "radio"}
                name={`q-${q.id}`}
                value={option.id}
                checked={isSelected}
                onChange={() =>
                  onChange(
                    multiple
                      ? JSON.stringify(
                          isSelected
                            ? chosen.filter((id: string) => id !== option.id)
                            : [...chosen, option.id]
                        )
                      : option.id
                  )
                }
                style={{ display: "none" }}
              />
              <span className={s.optionIdBadge}>
                {option.id === "true" ? "√" : option.id === "false" ? "×" : option.id}
              </span>
              <span style={{ fontSize: 15, fontWeight: 500, color: "#284325" }}>
                {option.text}
              </span>
            </label>
          );
        })}
      </div>
    );
  }
  // 4. Fill-in-the-Blank with blanks
  else if (["fill_blank", "listening_fill"].includes(q.type) && Array.isArray(q.blanks) && q.blanks.length) {
    const values = decode(strVal, {}) as Record<string, string>;
    inputContent = (
      <div style={{ display: "grid", gap: 14 }}>
        {q.blanks.map((blank: { id: string }, i: number) => (
          <label key={blank.id} style={{ display: "grid", gap: 6, fontSize: 14, fontWeight: 600 }}>
            <span>Ô trống ({i + 1}):</span>
            <input
              disabled={disabled}
              value={values[blank.id] || ""}
              onChange={(e) =>
                onChange(JSON.stringify({ ...values, [blank.id]: e.target.value }))
              }
              placeholder="Nhập câu trả lời..."
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid #cbd7c1",
                fontSize: 15,
                background: "#fff",
              }}
            />
          </label>
        ))}
      </div>
    );
  }
  // 5. Matching Pairs
  else if (q.type === "matching" && Array.isArray(q.matchingLeftItems)) {
    const matches = decode(strVal, {}) as Record<string, string>;
    inputContent = (
      <div style={{ display: "grid", gap: 12 }}>
        {q.matchingLeftItems.map((left: { id: string; text: string }) => (
          <div
            key={left.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              padding: "10px 14px",
              background: "#fff",
              border: "1px solid #d5decb",
              borderRadius: 10,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 14, color: "#2a4628" }}>{left.text}</span>
            <select
              disabled={disabled}
              value={matches[left.id] || ""}
              onChange={(e) =>
                onChange(JSON.stringify({ ...matches, [left.id]: e.target.value }))
              }
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #cbd7c1",
                background: "#fdfefb",
                fontSize: 13,
              }}
            >
              <option value="">Chọn cặp ghép phù hợp</option>
              {q.matchingRightItems?.map((right: { id: string; text: string }) => (
                <option key={right.id} value={right.id}>
                  {right.text}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }
  // 6. Sentence Word Ordering (Sắp xếp từ tạo câu - Click tokens)
  else if (q.type === "sentence_order" && Array.isArray(q.tokenItems) && q.tokenItems.length) {
    const selected = decode(strVal, []) as string[];
    const tokens = q.tokenItems as { id: string; text: string }[];

    inputContent = (
      <div style={{ display: "grid", gap: 14 }}>
        <p style={{ fontSize: 13, color: "#546d4a", margin: 0 }}>
          Nhấp vào các từ để sắp xếp theo thứ tự câu. Nhấp lại vào từ đã chọn ở trên để bỏ chọn:
        </p>

        {/* Selected Tokens in Order */}
        <div
          style={{
            minHeight: 52,
            padding: 10,
            borderRadius: 12,
            background: "#edf4e5",
            border: "1.5px dashed #93b37e",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          {selected.length === 0 && (
            <span style={{ fontSize: 13, color: "#7a9170", fontStyle: "italic" }}>
              (Chưa chọn từ nào. Nhấp vào các từ bên dưới...)
            </span>
          )}
          {selected.map((id) => {
            const token = tokens.find((t) => t.id === id);
            return (
              <button
                type="button"
                disabled={disabled}
                key={id}
                onClick={() => onChange(JSON.stringify(selected.filter((item) => item !== id)))}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid #3c6432",
                  background: "#27492c",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {token?.text} ✕
              </button>
            );
          })}
        </div>

        {/* Available Tokens to Pick */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tokens
            .filter((item) => !selected.includes(item.id))
            .map((item) => (
              <button
                type="button"
                disabled={disabled}
                key={item.id}
                onClick={() => onChange(JSON.stringify([...selected, item.id]))}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1.5px solid #cbd7c0",
                  background: "#ffffff",
                  color: "#284326",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                + {item.text}
              </button>
            ))}
        </div>
      </div>
    );
  }
  // 7. General Text Answer / Essay / Translation
  else {
    inputContent = (
      <div style={{ display: "grid", gap: 8 }}>
        <textarea
          disabled={disabled}
          rows={["essay", "translation", "writing"].includes(q.type) ? 8 : 4}
          maxLength={30000}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            q.type === "fill_blank"
              ? "Nhập chữ Hán tương ứng..."
              : "Nhập bài làm của bạn tại đây..."
          }
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "1.5px solid #cad7c0",
            background: "#ffffff",
            fontSize: 15,
            lineHeight: 1.6,
            color: "#243e23",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#667d5e" }}>
          <span>
            Số chữ Hán đã viết: <strong>{hanziCharCount}</strong> chữ
          </span>
          {q.essayMin !== undefined && (
            <span>
              Yêu cầu đề: {q.essayMin} – {q.essayMax} chữ
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={s.questionInputArea}>
      {inputContent}
      {error && (
        <p style={{ color: "#a53f22", fontSize: 12, marginTop: 8 }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
