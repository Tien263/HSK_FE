"use client";

import { useId } from "react";
import { ArrowDown, ArrowUp, Plus, Shuffle, Trash2, Wand2 } from "lucide-react";
import type { QuestionItem } from "./hsk-sample-templates";
import {
  createSentenceToken,
  segmentChineseSentence,
  type SentenceToken,
} from "@/lib/sentence-order";

export default function SentenceOrderEditor({
  question,
  onChange,
}: {
  question: QuestionItem;
  onChange: (patch: Partial<QuestionItem>) => void;
}) {
  const compId = useId();

  // Danh sách tokens hiện tại
  const tokens: SentenceToken[] = Array.isArray((question as any).tokens)
    ? ((question as any).tokens as (string | SentenceToken)[]).map((t, idx) => {
        if (typeof t === "object" && t && "id" in t && "text" in t) {
          return t as SentenceToken;
        }
        const id = Array.isArray((question as any).tokenIds)
          ? (question as any).tokenIds[idx] || `tok_${idx}`
          : `tok_${idx}`;
        return { id, text: String(t) };
      })
    : [];

  const sentenceOrderMode = (question as any).sentenceOrderMode || "both";

  const handleUpdateTokens = (nextTokens: SentenceToken[]) => {
    onChange({
      tokens: nextTokens.map((t) => t.text) as any,
      tokenIds: nextTokens.map((t) => t.id) as any,
    } as any);
  };

  // Tự động phân tách từ vựng
  const handleAutoSegment = () => {
    const text = question.correctAnswer || (question as any).sampleAnswer || question.content || "";
    if (!text.trim()) {
      alert("Vui lòng nhập câu hoàn chỉnh trước khi bấm tách từ.");
      return;
    }
    const segmented = segmentChineseSentence(text);
    handleUpdateTokens(segmented);
  };

  // Xáo trộn các thẻ từ
  const handleShuffle = () => {
    if (tokens.length <= 1) return;
    const shuffled = [...tokens];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    handleUpdateTokens(shuffled);
  };

  // Thêm một thẻ từ mới
  const handleAddToken = () => {
    handleUpdateTokens([...tokens, createSentenceToken("")]);
  };

  // Xóa thẻ từ
  const handleDeleteToken = (index: number) => {
    handleUpdateTokens(tokens.filter((_, i) => i !== index));
  };

  // Di chuyển thẻ từ
  const handleMoveToken = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= tokens.length) return;
    const next = [...tokens];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    handleUpdateTokens(next);
  };

  // Chỉnh sửa chữ trong thẻ
  const handleEditTokenText = (index: number, text: string) => {
    handleUpdateTokens(tokens.map((t, i) => (i === index ? { ...t, text } : t)));
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
          🧩 Cấu hình Sắp xếp từ thành câu (Sentence Order)
        </strong>
        <span style={{ fontSize: 11, color: "#64748b" }}>
          HSK 3–5: Sắp xếp các cụm từ cho sẵn thành câu hoàn chỉnh
        </span>
      </div>

      {/* 1. Ô nhập câu hoàn chỉnh làm đáp án chuẩn */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#2b4a27", display: "block", marginBottom: 4 }}>
          1. Câu hoàn chỉnh làm đáp án chuẩn (BẮT BUỘC có dấu chấm 。ở cuối):
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            lang="zh"
            value={question.correctAnswer || ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange({ correctAnswer: val, sampleAnswer: val } as any);
            }}
            placeholder="Ví dụ: 我在北京学习汉语。 hoặc dùng dấu / để tự chia: 我 / 在 / 北京 / 学习 / 汉语。"
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1.5px solid #a3be8c",
              fontSize: 14,
              fontFamily: "var(--font-chinese, inherit)",
            }}
          />
          <button
            type="button"
            onClick={handleAutoSegment}
            style={{
              background: "#3e6a39",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
            title="Tự động chia thành các từ/cụm từ 2-4 chữ có nghĩa, không tách rời từng chữ Hán"
          >
            <Wand2 size={15} /> Tự động tách từ
          </button>
        </div>
        <small style={{ fontSize: 11, color: "#617d59", marginTop: 4, display: "block" }}>
          * Mẹo: Tiếng Trung có nhiều từ ghép 2–4 chữ. Bạn có thể gõ dấu gạch chéo <code>/</code> giữa các cụm hoặc bấm <strong>Tự động tách từ</strong> để hệ thống giữ nguyên từ vựng có nghĩa.
        </small>
      </div>

      {/* 2. Danh sách các thẻ từ (xáo trộn / chỉnh sửa thủ công) */}
      <div style={{ background: "#ffffff", border: "1px solid #e1ebdb", borderRadius: 10, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#254422" }}>
            2. Danh sách các từ/cụm từ ({tokens.length} thẻ):
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleShuffle}
              disabled={tokens.length <= 1}
              style={{
                background: "#f0f4eb",
                color: "#2f4f2c",
                border: "1px solid #cbdcc2",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Shuffle size={13} /> Xáo trộn thứ tự
            </button>
            <button
              type="button"
              onClick={handleAddToken}
              style={{
                background: "#e5eedf",
                color: "#274523",
                border: "1px solid #bad2b0",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Plus size={13} /> Thêm thẻ từ
            </button>
          </div>
        </div>

        {tokens.length === 0 ? (
          <div style={{ padding: "12px", textAlign: "center", color: "#8a9e85", fontSize: 12, fontStyle: "italic", border: "1.5px dashed #d5e2cd", borderRadius: 8 }}>
            Chưa có thẻ từ nào. Hãy nhập câu đáp án ở trên và bấm <strong>Tự động tách từ</strong> hoặc bấm <strong>+ Thêm thẻ từ</strong>.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {tokens.map((token, index) => (
              <div
                key={token.id || `tok-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  background: "#f8faf5",
                  border: "1px solid #e2ebd8",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 11, color: "#64748b", width: 20, textAlign: "center", fontWeight: 700 }}>
                  {index + 1}.
                </span>
                <input
                  lang="zh"
                  value={token.text}
                  onChange={(e) => handleEditTokenText(index, e.target.value)}
                  placeholder="Từ/cụm từ chữ Hán..."
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #cbdac0",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "var(--font-chinese, inherit)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleMoveToken(index, -1)}
                  disabled={index === 0}
                  style={{ background: "transparent", border: "none", cursor: index === 0 ? "default" : "pointer", color: index === 0 ? "#cbd5e1" : "#475569", padding: 2 }}
                  title="Di chuyển lên"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveToken(index, 1)}
                  disabled={index === tokens.length - 1}
                  style={{ background: "transparent", border: "none", cursor: index === tokens.length - 1 ? "default" : "pointer", color: index === tokens.length - 1 ? "#cbd5e1" : "#475569", padding: 2 }}
                  title="Di chuyển xuống"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteToken(index)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#dc2626", padding: 2 }}
                  title="Xóa thẻ này"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Chế độ học sinh làm bài */}
      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#2b4a27" }}>
          3. Chế độ làm bài của học sinh:
        </label>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: sentenceOrderMode === "both" ? 700 : 500 }}>
            <input
              type="radio"
              name={`orderMode_${question.id}_${compId}`}
              value="both"
              checked={sentenceOrderMode === "both"}
              onChange={() => onChange({ sentenceOrderMode: "both" } as any)}
            />
            Linh hoạt: Cho phép bấm ghép thẻ HOẶC tự gõ câu (Khuyên dùng)
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: sentenceOrderMode === "interactive" ? 700 : 500 }}>
            <input
              type="radio"
              name={`orderMode_${question.id}_${compId}`}
              value="interactive"
              checked={sentenceOrderMode === "interactive"}
              onChange={() => onChange({ sentenceOrderMode: "interactive" } as any)}
            />
            Chỉ bấm/kéo thả thẻ từ
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: sentenceOrderMode === "text" ? 700 : 500 }}>
            <input
              type="radio"
              name={`orderMode_${question.id}_${compId}`}
              value="text"
              checked={sentenceOrderMode === "text"}
              onChange={() => onChange({ sentenceOrderMode: "text" } as any)}
            />
            Chỉ tự gõ câu bằng bàn phím
          </label>
        </div>
      </div>

      {/* 4. Các đáp án chấp nhận khác (nếu câu có nhiều cấu trúc ngữ pháp đúng) */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#2b4a27", display: "block", marginBottom: 4 }}>
          4. Các cách sắp xếp đúng khác (mỗi cách một dòng hoặc phân cách bởi dấu | ):
        </label>
        <textarea
          rows={2}
          lang="zh"
          value={question.acceptedAnswers || ""}
          onChange={(e) => onChange({ acceptedAnswers: e.target.value })}
          placeholder="Ví dụ: 北京，我在那里学习汉语。 (Nhập câu có dấu chấm cuối câu)"
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #cbdac0",
            fontSize: 12,
            fontFamily: "var(--font-chinese, inherit)",
          }}
        />
        <small style={{ fontSize: 11, color: "#64748b" }}>
          Nếu câu tiếng Trung có trạng ngữ chỉ thời gian/địa điểm đứng trước hoặc sau chủ ngữ đều đúng, hãy điền thêm vào đây.
        </small>
      </div>
    </div>
  );
}
