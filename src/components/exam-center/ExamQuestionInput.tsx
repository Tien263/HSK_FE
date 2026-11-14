"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Edit3, Puzzle, RotateCcw, Undo2, X } from "lucide-react";
import type { publicExamQuestion } from "@/lib/exam-center-core";
import { playChineseSpeech } from "@/lib/chinese-speech-player";
import { countHanzi, checkGivenWordsUsage, type GivenWord } from "@/lib/writing-essay";
import ExamAudioRecorder from "@/components/common/ExamAudioRecorder";
import s from "./ExamPlayer.module.css";

type Question = ReturnType<typeof publicExamQuestion>;

const decode = (value: string, fallback: unknown) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

interface SentenceOrderPlayerProps {
  q: Question;
  strVal: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function SentenceOrderPlayer({ q, strVal, disabled, onChange }: SentenceOrderPlayerProps) {
  const allowedMode = (q as any).sentenceOrderMode || "both";
  const isJsonArray = strVal.startsWith("[") && strVal.endsWith("]");

  const [activeTab, setActiveTab] = useState<"interactive" | "text">(() => {
    if (allowedMode === "text") return "text";
    if (allowedMode === "interactive") return "interactive";
    if (strVal && !isJsonArray) return "text";
    return "interactive";
  });

  // Trích xuất danh sách tokens từ q.tokenItems hoặc q.tokens
  const baseTokens: { id: string; text: string }[] = useMemo(() => {
    if (Array.isArray(q.tokenItems) && q.tokenItems.length > 0) {
      return (q.tokenItems as any[]).map((item: any, idx: number) => ({
        id: String(item.id || `tok_${idx}`),
        text: String(item.text || item),
      }));
    }
    if (Array.isArray(q.tokens) && q.tokens.length > 0) {
      return (q.tokens as any[]).map((text: any, idx: number) => ({
        id: `tok_${idx}`,
        text: String(text),
      }));
    }
    return [];
  }, [q.tokenItems, q.tokens]);

  const hasPeriodInTokens = useMemo(() => {
    return baseTokens.some((t) => /[。.!?！？]$/.test(t.text.trim()));
  }, [baseTokens]);

  const allTokens = useMemo(() => {
    if (hasPeriodInTokens) return baseTokens;
    return [...baseTokens, { id: "tok_punct_period", text: "。" }];
  }, [baseTokens, hasPeriodInTokens]);

  const tokenMap = useMemo(() => {
    const map = new Map<string, string>();
    allTokens.forEach((t) => map.set(t.id, t.text));
    return map;
  }, [allTokens]);

  // Các thẻ đã chọn theo thứ tự
  const selectedIds: string[] = useMemo(() => {
    if (!isJsonArray) return [];
    try {
      const parsed = JSON.parse(strVal);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }, [strVal, isJsonArray]);

  // Câu hoàn chỉnh được ghép từ các thẻ
  const assembledText = useMemo(() => {
    return selectedIds
      .map((id) => tokenMap.get(id) || (id === "tok_punct_period" ? "。" : ""))
      .join("");
  }, [selectedIds, tokenMap]);

  // Nội dung khi chuyển sang gõ chữ thủ công
  const currentTextVal = isJsonArray ? assembledText : strVal;

  const currentDisplaySentence = activeTab === "interactive" ? assembledText : currentTextVal;
  const hasEndingPeriod = /[。.!?！？]$/.test(currentDisplaySentence.trim());

  // Thêm thẻ vào khay ghép
  const handleSelectToken = (tokenId: string) => {
    if (disabled) return;
    const next = [...selectedIds, tokenId];
    onChange(JSON.stringify(next));
  };

  // Bỏ thẻ khỏi khay ghép
  const handleRemoveToken = (indexToRemove: number) => {
    if (disabled) return;
    const next = selectedIds.filter((_, idx) => idx !== indexToRemove);
    onChange(JSON.stringify(next));
  };

  // Di chuyển vị trí thẻ trong khay ghép
  const handleMoveToken = (index: number, direction: -1 | 1) => {
    if (disabled) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onChange(JSON.stringify(next));
  };

  // Hoàn tác thẻ vừa chọn
  const handleUndo = () => {
    if (disabled || selectedIds.length === 0) return;
    const next = selectedIds.slice(0, -1);
    onChange(JSON.stringify(next));
  };

  // Làm lại từ đầu
  const handleReset = () => {
    if (disabled) return;
    onChange(JSON.stringify([]));
  };

  // Thêm nhanh dấu chấm
  const handleAddPeriod = () => {
    if (disabled) return;
    if (activeTab === "interactive") {
      const periodToken = allTokens.find((t) => t.text === "。" || t.text === ".");
      const periodId = periodToken ? periodToken.id : "tok_punct_period";
      if (!selectedIds.includes(periodId)) {
        const next = [...selectedIds, periodId];
        onChange(JSON.stringify(next));
      }
    } else {
      if (!/[。.!?！？]$/.test(currentTextVal.trim())) {
        onChange((currentTextVal.trim() + "。").trim());
      }
    }
  };

  // Các thẻ từ còn khả dụng (chưa được chọn vào khay)
  const availableTokens = useMemo(() => {
    return allTokens.filter((token) => !selectedIds.includes(token.id));
  }, [allTokens, selectedIds]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Thanh chuyển chế độ (nếu admin cho phép cả 2) */}
      {allowedMode === "both" && (
        <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #e0ebd7", paddingBottom: 8 }}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setActiveTab("interactive")}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: activeTab === "interactive" ? "1.5px solid #27492c" : "1px solid #cbd7c1",
              background: activeTab === "interactive" ? "#27492c" : "#fdfefb",
              color: activeTab === "interactive" ? "#ffffff" : "#2f482d",
              fontWeight: activeTab === "interactive" ? 700 : 500,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Puzzle size={14} /> Ghép thẻ từ
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (isJsonArray && assembledText) {
                onChange(assembledText);
              }
              setActiveTab("text");
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: activeTab === "text" ? "1.5px solid #27492c" : "1px solid #cbd7c1",
              background: activeTab === "text" ? "#27492c" : "#fdfefb",
              color: activeTab === "text" ? "#ffffff" : "#2f482d",
              fontWeight: activeTab === "text" ? 700 : 500,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Edit3 size={14} /> Tự viết câu
          </button>
        </div>
      )}

      {/* CHẾ ĐỘ 1: GHÉP THẺ TỪ */}
      {activeTab === "interactive" && (
        <div style={{ display: "grid", gap: 12 }}>
          {/* Khay ghép câu đã chọn */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#27492c" }}>
                📥 Khay ghép câu hoàn chỉnh:
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  disabled={disabled || selectedIds.length === 0}
                  onClick={handleUndo}
                  title="Hoàn tác thẻ vừa chọn"
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid #cad7c0",
                    background: "#ffffff",
                    fontSize: 12,
                    color: "#27492c",
                    cursor: disabled || selectedIds.length === 0 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Undo2 size={13} /> Hoàn tác
                </button>
                <button
                  type="button"
                  disabled={disabled || selectedIds.length === 0}
                  onClick={handleReset}
                  title="Xóa trắng để ghép lại từ đầu"
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid #cad7c0",
                    background: "#ffffff",
                    fontSize: 12,
                    color: "#a53f22",
                    cursor: disabled || selectedIds.length === 0 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <RotateCcw size={13} /> Làm lại
                </button>
                <button
                  type="button"
                  disabled={disabled || hasEndingPeriod}
                  onClick={handleAddPeriod}
                  title="Thêm dấu chấm vào cuối câu"
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid #27492c",
                    background: hasEndingPeriod ? "#f1f5ee" : "#27492c",
                    color: hasEndingPeriod ? "#93b37e" : "#ffffff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: disabled || hasEndingPeriod ? "not-allowed" : "pointer",
                  }}
                >
                  + Dấu chấm 。
                </button>
              </div>
            </div>

            <div
              style={{
                minHeight: 74,
                padding: "10px 14px",
                borderRadius: 12,
                border: "2px dashed #93b37e",
                background: "#f7faf3",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
              }}
            >
              {selectedIds.length === 0 ? (
                <span style={{ fontSize: 13, color: "#748f6c", fontStyle: "italic" }}>
                  Chưa có thẻ từ nào được chọn. Nhấp vào các cụm từ bên dưới để đưa vào câu...
                </span>
              ) : (
                selectedIds.map((id, index) => {
                  const text = tokenMap.get(id) || (id === "tok_punct_period" ? "。" : "");
                  return (
                    <div
                      key={`${id}-${index}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#27492c",
                        color: "#ffffff",
                        padding: "6px 10px",
                        borderRadius: 8,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                      }}
                    >
                      <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "0.5px" }}>
                        {text}
                      </span>
                      {!disabled && (
                        <div style={{ display: "inline-flex", gap: 2, marginLeft: 4 }}>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveToken(index, -1)}
                            title="Di chuyển sang trái"
                            style={{
                              background: "rgba(255,255,255,0.2)",
                              border: "none",
                              color: "#fff",
                              borderRadius: 4,
                              width: 18,
                              height: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: index === 0 ? "not-allowed" : "pointer",
                              opacity: index === 0 ? 0.3 : 1,
                            }}
                          >
                            <ArrowLeft size={11} />
                          </button>
                          <button
                            type="button"
                            disabled={index === selectedIds.length - 1}
                            onClick={() => handleMoveToken(index, 1)}
                            title="Di chuyển sang phải"
                            style={{
                              background: "rgba(255,255,255,0.2)",
                              border: "none",
                              color: "#fff",
                              borderRadius: 4,
                              width: 18,
                              height: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: index === selectedIds.length - 1 ? "not-allowed" : "pointer",
                              opacity: index === selectedIds.length - 1 ? 0.3 : 1,
                            }}
                          >
                            <ArrowRight size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveToken(index)}
                            title="Gỡ thẻ này ra khỏi câu"
                            style={{
                              background: "rgba(255,255,255,0.25)",
                              border: "none",
                              color: "#fff",
                              borderRadius: 4,
                              width: 18,
                              height: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Xem trước câu đã ghép */}
          {assembledText && (
            <div
              style={{
                padding: "10px 14px",
                background: "#ffffff",
                borderRadius: 10,
                border: "1px solid #d9e6ce",
                fontSize: 14,
                display: "grid",
                gap: 4,
              }}
            >
              <div style={{ color: "#546e50", fontSize: 12 }}>
                Câu đã ghép hiện tại:
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1d361c", letterSpacing: "1px" }}>
                {assembledText}
              </div>
            </div>
          )}

          {/* Cảnh báo dấu chấm bắt buộc */}
          {assembledText && !hasEndingPeriod && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: 8,
                background: "#fef8ee",
                border: "1px solid #f6cf8a",
                color: "#92400e",
                fontSize: 12,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                <AlertCircle size={15} /> Bắt buộc phải có dấu chấm câu (。) ở cuối câu mới được tính điểm!
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={handleAddPeriod}
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  background: "#b45309",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                + Bấm thêm dấu 。
              </button>
            </div>
          )}

          {assembledText && hasEndingPeriod && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                background: "#eff9ea",
                border: "1px solid #b7deab",
                color: "#27492c",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={15} /> Đã có dấu chấm câu hợp lệ.
            </div>
          )}

          {/* Danh sách các cụm từ cho sẵn để bấm chọn */}
          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#27492c", display: "block", marginBottom: 8 }}>
              🧩 Danh sách từ / cụm từ cho sẵn (Nhấp để chọn):
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {availableTokens.length === 0 ? (
                <span style={{ fontSize: 12, color: "#617d5c", fontStyle: "italic" }}>
                  ✅ Bạn đã đưa toàn bộ thẻ từ vào câu. Hãy kiểm tra lại thứ tự và dấu chấm câu trước khi nộp.
                </span>
              ) : (
                availableTokens.map((token) => (
                  <button
                    key={token.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectToken(token.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: "2px solid #27492c",
                      background: "#ffffff",
                      color: "#1f381e",
                      fontSize: 17,
                      fontWeight: 600,
                      cursor: disabled ? "not-allowed" : "pointer",
                      boxShadow: "0 2px 4px rgba(39,73,44,0.08)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {token.text}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHẾ ĐỘ 2: TỰ GÕ CÂU */}
      {activeTab === "text" && (
        <div style={{ display: "grid", gap: 10 }}>
          {/* Gợi ý các từ cho sẵn */}
          <div style={{ padding: "8px 12px", background: "#f5f9f0", borderRadius: 8, border: "1px solid #d5e5cb" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#284b25", display: "block", marginBottom: 6 }}>
              Gợi ý các từ / cụm từ cần sắp xếp:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {baseTokens.map((t) => (
                <span
                  key={t.id}
                  style={{
                    padding: "3px 8px",
                    background: "#ffffff",
                    border: "1px solid #cbdac1",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#284b25",
                  }}
                >
                  {t.text}
                </span>
              ))}
            </div>
          </div>

          {/* Ô nhập câu văn */}
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#27492c" }}>
                ⌨️ Gõ câu hoàn chỉnh của bạn:
              </label>
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{ fontSize: 11, color: "#617d5c", marginRight: 4, alignSelf: "center" }}>
                  Chèn nhanh:
                </span>
                {["。", "，", "！", "？"].map((punct) => (
                  <button
                    key={punct}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange((currentTextVal + punct).trim());
                    }}
                    style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      border: "1px solid #cbd7c1",
                      background: "#ffffff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}
                  >
                    {punct}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              disabled={disabled}
              rows={3}
              value={currentTextVal}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Nhập câu hoàn chỉnh bằng chữ Hán..."
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "2px solid #27492c",
                background: "#ffffff",
                fontSize: 16,
                fontWeight: 600,
                color: "#1e351d",
                outline: "none",
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Cảnh báo dấu chấm trong chế độ gõ chữ */}
          {currentTextVal.trim() && !hasEndingPeriod && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: 8,
                background: "#fef8ee",
                border: "1px solid #f6cf8a",
                color: "#92400e",
                fontSize: 12,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                <AlertCircle size={15} /> Bắt buộc phải có dấu chấm câu (。) ở cuối câu mới được tính điểm!
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={handleAddPeriod}
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  background: "#b45309",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                + Thêm dấu 。
              </button>
            </div>
          )}

          {currentTextVal.trim() && hasEndingPeriod && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                background: "#eff9ea",
                border: "1px solid #b7deab",
                color: "#27492c",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={15} /> Đã có dấu chấm câu hợp lệ.
            </div>
          )}
        </div>
      )}
    </div>
  );
}


interface WritingSentencePlayerProps {
  q: Question;
  strVal: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function WritingSentencePlayer({ q, strVal, disabled, onChange }: WritingSentencePlayerProps) {
  const words: GivenWord[] = useMemo(() => {
    if (Array.isArray((q as any).givenWords) && (q as any).givenWords.length > 0) {
      return (q as any).givenWords;
    }
    const text = q.content || "";
    if (text.includes("/") || text.includes("，") || text.includes(",")) {
      const parts = text.split(/[/，,]+/).map((s: string) => s.trim()).filter(Boolean);
      if (parts.length > 1 && parts.every((p: string) => p.length <= 10)) {
        return parts.map((w: string, i: number) => ({ id: `w_${i}`, word: w }));
      }
    }
    return [];
  }, [(q as any).givenWords, q.content]);

  const hanziCount = useMemo(() => countHanzi(strVal), [strVal]);

  const usage = useMemo(() => {
    if (words.length === 0) return { missing: [], allUsed: true };
    return checkGivenWordsUsage(strVal, words);
  }, [strVal, words]);

  const handleInsertPunctuation = (punct: string) => {
    if (disabled) return;
    onChange((strVal + punct).trim());
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 14,
        border: "1.5px solid #dbe6d5",
        padding: "20px 22px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        display: "grid",
        gap: 16,
      }}
    >
      <div>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#1e3321", letterSpacing: "0.2px" }}>
          {q.content || "看图并使用给出的词语造句。"}
        </span>
        {q.pinyin && (
          <div style={{ fontSize: 13, color: "#617d5c", marginTop: 2 }}>[{q.pinyin}]</div>
        )}
      </div>

      {q.imageUrl && (
        <div
          style={{
            background: "#f8faf5",
            borderRadius: 12,
            border: "1px solid #e1ebdb",
            padding: "12px 16px",
            textAlign: "center",
          }}
        >
          <img
            src={q.imageUrl}
            alt="Đề bài nhìn tranh viết câu"
            style={{
              maxHeight: 260,
              maxWidth: "100%",
              objectFit: "contain",
              borderRadius: 8,
              display: "inline-block",
            }}
          />
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
          请使用以下词语:
        </div>

        {words.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {words.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "#e0f2fe",
                  border: "1px solid #bae6fd",
                  borderRadius: 20,
                  padding: "6px 18px",
                  boxShadow: "0 1px 3px rgba(3,105,161,0.08)",
                }}
              >
                {item.pinyin && (
                  <span style={{ fontSize: 10, color: "#0369a1", marginBottom: -2 }}>
                    {item.pinyin}
                  </span>
                )}
                <span style={{ fontSize: 16, fontWeight: 700, color: "#0369a1", letterSpacing: "0.5px" }}>
                  {item.word}
                </span>
                {item.meaning && (
                  <span style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>
                    {item.meaning}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>
            (Quan sát hình ảnh và sử dụng từ ngữ phù hợp để viết câu)
          </div>
        )}

        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          请根据图片，使用所有给出的词语写一个完整的句子。
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#546e50", fontWeight: 600 }}>
            Chèn nhanh dấu câu:
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {["。", "，", "！", "？"].map((punct) => (
              <button
                key={punct}
                type="button"
                disabled={disabled}
                onClick={() => handleInsertPunctuation(punct)}
                style={{
                  padding: "2px 8px",
                  borderRadius: 4,
                  border: "1px solid #cbd7c1",
                  background: "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                {punct}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          disabled={disabled}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder="请在这里输入你的句子……"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "2px solid #27492c",
            background: "#ffffff",
            fontSize: 16,
            fontWeight: 500,
            color: "#1e351d",
            lineHeight: 1.6,
            outline: "none",
          }}
        />

        {words.length > 0 && strVal.trim() && (
          <div>
            {usage.allUsed ? (
              <div style={{ fontSize: 12, color: "#15803d", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={14} /> Đã sử dụng đủ tất cả các từ vựng bắt buộc!
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#b45309", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <AlertCircle size={14} /> Chưa dùng từ: {usage.missing.join(", ")}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
          <span>Học sinh nhập câu trả lời bằng tiếng Trung.</span>
          <span>Số chữ Hán: <strong>{hanziCount}</strong></span>
        </div>
      </div>
    </div>
  );
}

interface EssayPlayerProps {
  q: Question;
  strVal: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function EssayPlayer({ q, strVal, disabled, onChange }: EssayPlayerProps) {
  const passage = String((q as any).passage || "").trim();
  const essayMin = (q as any).essayMin !== undefined ? Number((q as any).essayMin) : 80;
  const essayMax = (q as any).essayMax !== undefined ? Number((q as any).essayMax) : 400;

  const hanziCount = useMemo(() => countHanzi(strVal), [strVal]);
  const passageHanziCount = useMemo(() => countHanzi(passage), [passage]);

  const handleInsertPunctuation = (punct: string) => {
    if (disabled) return;
    onChange(strVal + punct);
  };

  const progressPercent = Math.min(100, Math.round((hanziCount / essayMin) * 100));
  const isTooShort = hanziCount < essayMin;
  const isOptimal = hanziCount >= essayMin && hanziCount <= essayMax;
  const isTooLong = hanziCount > essayMax;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <strong style={{ fontSize: 16, color: "#254422" }}>
            {q.content || "写作：请阅读材料并完成短文写作。"}
          </strong>
          {q.pinyin && <div style={{ fontSize: 13, color: "#617d5c" }}>[{q.pinyin}]</div>}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, background: "#eaf3e5", color: "#284b25", padding: "4px 12px", borderRadius: 20 }}>
          Yêu cầu đề: {essayMin} – {essayMax} chữ Hán
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: passage ? "repeat(auto-fit, minmax(340px, 1fr))" : "1fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        {passage && (
          <div
            style={{
              background: "#fcfdfa",
              border: "1.5px solid #d3e2cb",
              borderRadius: 14,
              padding: "16px 18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e1ebd9", paddingBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2b4b27", display: "flex", alignItems: "center", gap: 6 }}>
                📖 Đoạn văn tư liệu đề bài (阅读材料)
              </span>
              <span style={{ fontSize: 11, color: "#546e50", fontWeight: 600 }}>
                {passageHanziCount} chữ Hán
              </span>
            </div>

            {q.imageUrl && (
              <div style={{ textAlign: "center", margin: "4px 0" }}>
                <img
                  src={q.imageUrl}
                  alt="Ảnh minh họa đề bài"
                  style={{ maxHeight: 200, maxWidth: "100%", objectFit: "contain", borderRadius: 8 }}
                />
              </div>
            )}

            <div
              style={{
                maxHeight: 520,
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                fontSize: 15,
                lineHeight: 1.85,
                color: "#1c351b",
                paddingRight: 6,
              }}
            >
              {passage}
            </div>

            <div style={{ fontSize: 11, color: "#688464", fontStyle: "italic", borderTop: "1px dashed #dbe6d4", paddingTop: 8 }}>
              💡 Học sinh có thể vừa đọc lại đoạn văn trên vừa viết bài bên cạnh mà không cần chuyển trang.
            </div>
          </div>
        )}

        <div
          style={{
            background: "#ffffff",
            border: "1.5px solid #27492c",
            borderRadius: 14,
            padding: "16px 18px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#27492c", display: "flex", alignItems: "center", gap: 6 }}>
              ✍️ Bài làm của bạn (作答区域)
            </span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#546e50", marginRight: 4 }}>Chèn nhanh:</span>
              {["。", "，", "、", "！", "？", "“", "”"].map((punct) => (
                <button
                  key={punct}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleInsertPunctuation(punct)}
                  style={{
                    padding: "2px 6px",
                    borderRadius: 4,
                    border: "1px solid #cad7bf",
                    background: "#fbfdf8",
                    fontSize: 13,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  {punct}
                </button>
              ))}
            </div>
          </div>

          <textarea
            disabled={disabled}
            rows={passage ? 15 : 12}
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
            placeholder="请在此输入你的短文（支持分段、换行，系统将实时自动保存）……"
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              border: "1.5px solid #cbd7c1",
              background: "#ffffff",
              fontSize: 16,
              lineHeight: 1.8,
              color: "#1d361c",
              outline: "none",
              resize: "vertical",
            }}
          />

          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: "#27492c" }}>
                Số chữ Hán đã viết: <strong style={{ fontSize: 15 }}>{hanziCount}</strong> chữ
              </span>
              <span style={{ color: "#64748b" }}>
                Mục tiêu: {essayMin} – {essayMax} chữ
              </span>
            </div>

            <div style={{ width: "100%", height: 8, background: "#e8ede4", borderRadius: 4, overflow: "hidden" }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: isTooShort ? "#f59e0b" : isTooLong ? "#ef4444" : "#16a34a",
                  transition: "width 0.2s ease",
                }}
              />
            </div>

            <div style={{ fontSize: 11, fontWeight: 500 }}>
              {isTooShort && (
                <span style={{ color: "#b45309" }}>
                  ⚠️ Cần viết thêm ít nhất {essayMin - hanziCount} chữ để đạt mức tối thiểu ({essayMin} chữ).
                </span>
              )}
              {isOptimal && (
                <span style={{ color: "#15803d" }}>
                  ✅ Đã đạt yêu cầu độ dài ({hanziCount} chữ trong khoảng {essayMin}–{essayMax} chữ).
                </span>
              )}
              {isTooLong && (
                <span style={{ color: "#b91c1c" }}>
                  ℹ️ Đã vượt quá số chữ tối đa ({hanziCount} / {essayMax} chữ). Bạn có thể cô đọng bài viết lại.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    if (!q) return [];
    if (Array.isArray(q.options)) return q.options;
    if (typeof q.options === "string") {
      const parsed = decode(q.options, []);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  }, [q?.options]);

  const normalizedOptions = useMemo(() => {
    return rawOptions.map((opt: any, idx: number) => {
      if (typeof opt === "object" && opt !== null) {
        return {
          id: String(opt.id || String.fromCharCode(65 + idx)),
          text: String(opt.text || opt.content || ""),
          pinyin: opt.pinyin ? String(opt.pinyin) : undefined,
          imageUrl: opt.imageUrl ? String(opt.imageUrl) : undefined,
        };
      }
      return {
        id: String.fromCharCode(65 + idx),
        text: String(opt ?? ""),
        pinyin: undefined,
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
    if (q.type === "handwriting_photo") {
      inputContent = (
        <div style={{ display: "grid", gap: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#365330" }}>
            Tải ảnh bài viết tay của bạn (Hỗ trợ chụp từ camera)
            <input
              disabled={disabled}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => void media(e.target.files?.[0])}
              style={{ marginTop: 8, display: "block" }}
            />
          </label>
          {strVal.startsWith("data:image/") && (
            <img
              src={strVal}
              alt="Bài viết của bạn"
              style={{ maxWidth: "100%", maxHeight: 380, objectFit: "contain", borderRadius: 12 }}
            />
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
              Bỏ tệp này và chụp lại
            </button>
          )}
        </div>
      );
    } else {
      inputContent = (
        <div style={{ display: "grid", gap: 14 }}>
          <ExamAudioRecorder
            disabled={disabled}
            initialAudioUrl={strVal.startsWith("data:audio/") || strVal.startsWith("http") ? strVal : undefined}
            onAudioReady={(base64) => onChange(base64)}
          />
          <details style={{ fontSize: 11, color: "#64748b" }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>
              Hoặc tải lên file âm thanh có sẵn từ máy tính
            </summary>
            <input
              disabled={disabled}
              type="file"
              accept="audio/*"
              onChange={(e) => void media(e.target.files?.[0])}
              style={{ marginTop: 6, display: "block" }}
            />
          </details>
        </div>
      );
    }
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
                <img
                  src={imgSrc}
                  alt={`Lựa chọn ${optId}`}
                  className={s.optionImg}
                  loading="lazy"
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
  // 3. Text Multiple Choice / True-False / True-False-NA Options
  else if (["multiple_choice", "listening_choice", "true_false", "true_false_na", "eval_true_false_na"].includes(q.type)) {
    const options =
      q.type === "true_false_na" || q.type === "eval_true_false_na"
        ? [
            { id: "true", text: "Đúng (对)", symbol: "√" },
            { id: "false", text: "Sai (错)", symbol: "×" },
            { id: "not_mentioned", text: "Không đề cập (没提及)", symbol: "〇" },
          ]
        : q.type === "true_false"
        ? [
            { id: "true", text: "Đúng (√)", symbol: "√" },
            { id: "false", text: "Sai (×)", symbol: "×" },
          ]
        : normalizedOptions;
    const multiple = q.selectionMode === "MULTIPLE";
    const chosen = multiple ? decode(strVal, []) : [strVal];

    inputContent = (
      <div className={s.textOptionsList}>
        {options.map((option: any) => {
          const isSelected = Array.isArray(chosen) && chosen.includes(option.id);
          const badgeSymbol = option.symbol || (option.id === "true" ? "√" : option.id === "false" ? "×" : option.id === "not_mentioned" ? "〇" : option.id);
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
                {badgeSymbol}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {option.pinyin && (
                  <span style={{ fontSize: 12, color: "#617d5c", letterSpacing: "0.5px" }}>
                    {option.pinyin}
                  </span>
                )}
                <span
                  style={{
                    fontSize: option.pinyin ? 18 : 16,
                    fontWeight: 600,
                    color: "#1e3321",
                    lineHeight: 1.3,
                  }}
                >
                  {option.text}
                </span>
              </div>
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
  // 6. Sentence Word Ordering (Sắp xếp từ tạo câu - Click tokens / Tự gõ câu)
  else if (q.type === "sentence_order") {
    inputContent = (
      <SentenceOrderPlayer
        q={q}
        strVal={strVal}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }
  // 6.2. Picture + Given Words Sentence Writing (Nhìn tranh và dùng từ cho trước viết câu)
  else if (q.type === "writing") {
    inputContent = (
      <WritingSentencePlayer
        q={q}
        strVal={strVal}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }
  // 6.3. Essay Writing (~80-400 words with reference reading passage)
  else if (q.type === "essay") {
    inputContent = (
      <EssayPlayer
        q={q}
        strVal={strVal}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }
  // 6.5. Listening Fill-in-the-blank / Dictation text input
  else if (["listening_fill", "fill_blank"].includes(q.type)) {
    inputContent = (
      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#2d4b29" }}>
          ⌨️ Nhập đáp án bằng bàn phím vào chỗ trống:
        </label>
        <input
          type="text"
          disabled={disabled}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập từ hoặc cụm từ cần điền (chữ Hán)..."
          style={{
            width: "100%",
            maxWidth: 520,
            padding: "12px 16px",
            borderRadius: 12,
            border: "2px solid #27492c",
            background: "#ffffff",
            fontSize: 16,
            fontWeight: 600,
            color: "#1e3321",
            outline: "none",
          }}
        />
        <div style={{ fontSize: 12, color: "#617d5c" }}>
          💡 Lưu ý: Hệ thống tự động chuẩn hóa dấu câu và khoảng trắng khi chấm điểm.
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
