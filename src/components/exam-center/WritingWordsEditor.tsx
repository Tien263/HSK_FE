"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, Wand2 } from "lucide-react";
import type { QuestionItem } from "./hsk-sample-templates";
import {
  createGivenWord,
  parseQuickGivenWords,
  type GivenWord,
} from "@/lib/writing-essay";

export default function WritingWordsEditor({
  question,
  onChange,
}: {
  question: QuestionItem;
  onChange: (patch: Partial<QuestionItem>) => void;
}) {
  const [quickInput, setQuickInput] = useState("");
  const [showQuickModal, setShowQuickModal] = useState(false);

  // Chuẩn hóa danh sách givenWords
  const words: GivenWord[] = Array.isArray((question as any).givenWords)
    ? (question as any).givenWords
    : [];

  const handleUpdateWords = (nextWords: GivenWord[]) => {
    onChange({ givenWords: nextWords } as any);
  };

  const handleAddWord = () => {
    handleUpdateWords([...words, createGivenWord("")]);
  };

  const handleRemoveWord = (index: number) => {
    handleUpdateWords(words.filter((_, i) => i !== index));
  };

  const handleMoveWord = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= words.length) return;
    const next = [...words];
    [next[index], next[target]] = [next[target], next[index]];
    handleUpdateWords(next);
  };

  const handleEditWord = (index: number, patch: Partial<GivenWord>) => {
    const next = words.map((w, i) => (i === index ? { ...w, ...patch } : w));
    handleUpdateWords(next);
  };

  const handleApplyQuickWords = () => {
    if (!quickInput.trim()) return;
    const parsed = parseQuickGivenWords(quickInput);
    if (parsed.length > 0) {
      handleUpdateWords([...words, ...parsed]);
      setQuickInput("");
      setShowQuickModal(false);
    }
  };

  return (
    <div
      style={{
        background: "#fbfdf8",
        border: "1px solid #d8e5cb",
        borderRadius: 12,
        padding: 16,
        display: "grid",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <strong style={{ fontSize: 13, color: "#254422", display: "flex", alignItems: "center", gap: 6 }}>
          ✍️ Cấu hình: Nhìn tranh và dùng từ cho trước viết câu (看图造句)
        </strong>
        <span style={{ fontSize: 11, color: "#64748b" }}>
          HSK 4–6: Yêu cầu học sinh quan sát tranh và sử dụng tất cả từ cho trước để tạo câu
        </span>
      </div>

      {/* 1. KHU VỰC QUẢN LÝ TỪ VỰNG BẮT BUỘC (指定词语) */}
      <div style={{ background: "#ffffff", padding: 14, borderRadius: 10, border: "1px solid #e1ebdc" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#2b4a27", margin: 0 }}>
            📌 Từ vựng bắt buộc (指定词语) — Học sinh phải dùng các từ này trong câu:
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => setShowQuickModal(!showQuickModal)}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid #93b37e",
                background: "#f4f8ed",
                fontSize: 12,
                color: "#27492c",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Wand2 size={13} /> Nhập nhanh danh sách từ
            </button>
            <button
              type="button"
              onClick={handleAddWord}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid #27492c",
                background: "#27492c",
                fontSize: 12,
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Plus size={13} /> Thêm từ
            </button>
          </div>
        </div>

        {/* Khung dán nhanh từ vựng */}
        {showQuickModal && (
          <div
            style={{
              marginBottom: 12,
              padding: 12,
              background: "#f7faf3",
              borderRadius: 8,
              border: "1px dashed #93b37e",
              display: "grid",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 11, color: "#476142" }}>
              💡 Dán danh sách từ phân cách bằng dấu gạch chéo <strong>/</strong> hoặc dấu phẩy. Ví dụ:{" "}
              <code>虽然 / 下雨 / 但是</code>
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Ví dụ: 虽然 / 下雨 / 但是"
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #cbd7c1",
                  fontSize: 13,
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyQuickWords();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleApplyQuickWords}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  background: "#27492c",
                  color: "#fff",
                  border: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Tách & Thêm
              </button>
            </div>
          </div>
        )}

        {/* Danh sách các từ hiện có */}
        {words.length === 0 ? (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              background: "#fafbf8",
              borderRadius: 8,
              border: "1px dashed #d1dec8",
              fontSize: 12,
              color: "#788f72",
            }}
          >
            Chưa có từ vựng bắt buộc nào. Hãy bấm <strong>+ Thêm từ</strong> hoặc <strong>Nhập nhanh danh sách từ</strong>.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {words.map((item, index) => (
              <div
                key={item.id || index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  background: "#fdfefd",
                  borderRadius: 8,
                  border: "1px solid #dce6d6",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#e8f2e1",
                    color: "#284b24",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>

                {/* Ô nhập chữ Hán */}
                <input
                  value={item.word}
                  onChange={(e) => handleEditWord(index, { word: e.target.value })}
                  placeholder="Từ vựng chữ Hán * (Ví dụ: 虽然)"
                  style={{
                    flex: 2,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #cbd7c1",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1c351b",
                  }}
                />

                {/* Ô nhập Pinyin */}
                <input
                  value={item.pinyin || ""}
                  onChange={(e) => handleEditWord(index, { pinyin: e.target.value })}
                  placeholder="Pinyin tùy chọn (suīrán)"
                  style={{
                    flex: 1.5,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #cbd7c1",
                    fontSize: 12,
                  }}
                />

                {/* Ô nhập nghĩa */}
                <input
                  value={item.meaning || ""}
                  onChange={(e) => handleEditWord(index, { meaning: e.target.value })}
                  placeholder="Nghĩa tùy chọn (tuy rằng)"
                  style={{
                    flex: 1.5,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #cbd7c1",
                    fontSize: 12,
                  }}
                />

                {/* Nút di chuyển và xóa */}
                <div style={{ display: "flex", gap: 3 }}>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveWord(index, -1)}
                    title="Di chuyển lên"
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd7c1",
                      borderRadius: 4,
                      padding: 4,
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      opacity: index === 0 ? 0.3 : 1,
                    }}
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={index === words.length - 1}
                    onClick={() => handleMoveWord(index, 1)}
                    title="Di chuyển xuống"
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd7c1",
                      borderRadius: 4,
                      padding: 4,
                      cursor: index === words.length - 1 ? "not-allowed" : "pointer",
                      opacity: index === words.length - 1 ? 0.3 : 1,
                    }}
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveWord(index)}
                    title="Xóa từ"
                    style={{
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      color: "#b91c1c",
                      borderRadius: 4,
                      padding: 4,
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. CÂU TRẢ LỜI MẪU / ĐÁP ÁN CHUẨN */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#2b4a27", display: "block", marginBottom: 4 }}>
          2. Câu mẫu / Đáp án chuẩn (Tham khảo khi chấm):
        </label>
        <input
          lang="zh"
          value={question.correctAnswer || ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange({ correctAnswer: val, sampleAnswer: val } as any);
          }}
          placeholder="Ví dụ: 虽然今天下雨，但是他还是坚持去跑步。"
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1.5px solid #27492c",
            fontSize: 14,
            fontWeight: 600,
          }}
        />
      </div>

      {/* 3. CÁC BIẾN THỂ ĐƯỢC CHẤP NHẬN */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#2b4a27", display: "block", marginBottom: 4 }}>
          3. Các câu biến thể khác được chấp nhận (phân cách bằng / hoặc dấu phẩy):
        </label>
        <input
          lang="zh"
          value={question.acceptedAnswers || ""}
          onChange={(e) => onChange({ acceptedAnswers: e.target.value })}
          placeholder="Ví dụ: 虽然下雨了，但他依然去上学。 / 虽然外面下着雨，但是他们玩得很开心。"
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #cbd7c1",
            fontSize: 13,
          }}
        />
      </div>

      {/* 4. LỜI GIẢI / HƯỚNG DẪN CHẤM */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#2b4a27", display: "block", marginBottom: 4 }}>
          4. Hướng dẫn chấm điểm & Phân tích ngữ pháp:
        </label>
        <textarea
          rows={3}
          value={question.explanation || ""}
          onChange={(e) => onChange({ explanation: e.target.value })}
          placeholder="Ví dụ: Cặp liên từ 虽然...但是... biểu thị quan hệ chuyển ngoặt. Câu cần diễn đạt hợp lý với hình ảnh chiếc ô dưới mưa."
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #cbd7c1",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        />
      </div>

      {/* 5. XEM TRƯỚC GIAO DIỆN HỌC SINH (LIVE PREVIEW) */}
      <div style={{ marginTop: 8, background: "#f8faf5", border: "1.5px dashed #93b37e", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#2b4a27", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          👁️ Xem trước giao diện học sinh (Live Preview):
        </div>

        <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid #d8e5cb", padding: 18, display: "grid", gap: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1e3321" }}>
            第{question.questionNumber || 1}题：{question.content || "看图并使用给出的词语造句。"}
          </div>

          {question.imageUrl ? (
            <div style={{ textAlign: "center", background: "#f8faf5", padding: 10, borderRadius: 8 }}>
              <img
                src={question.imageUrl}
                alt="Tranh đề bài"
                style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 6, objectFit: "contain" }}
              />
            </div>
          ) : (
            <div style={{ textAlign: "center", background: "#f1f5f9", padding: 24, borderRadius: 8, color: "#64748b", fontSize: 13 }}>
              🖼️ (Chưa tải ảnh — Hãy dán link ảnh hoặc tải ảnh từ máy ở khung trên)
            </div>
          )}

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
              请使用以下词语:
            </div>

            {words.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {words.map((w, idx) => (
                  <div
                    key={w.id || idx}
                    style={{
                      background: "#e0f2fe",
                      border: "1px solid #bae6fd",
                      borderRadius: 20,
                      padding: "4px 14px",
                      display: "inline-flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {w.pinyin && <span style={{ fontSize: 10, color: "#0369a1" }}>{w.pinyin}</span>}
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0284c7" }}>{w.word || "(chưa nhập)"}</span>
                    {w.meaning && <span style={{ fontSize: 9, color: "#64748b" }}>{w.meaning}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                (Chưa cấu hình từ vựng bắt buộc)
              </span>
            )}

            <div style={{ fontSize: 12, color: "#64748b" }}>
              请根据图片，使用所有给出的词语写一个完整的句子。
            </div>

            <div
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#94a3b8",
                fontSize: 14,
              }}
            >
              请在这里输入你的句子……
            </div>

            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              Học sinh nhập câu trả lời bằng tiếng Trung.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
