"use client";

import { playChineseSpeech } from "@/lib/chinese-speech-player";
import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Code,
  FileText,
  Plus,
  Trash2,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  MessageSquare,
  Globe2,
  BookMarked,
  HelpCircle,
} from "lucide-react";
import type {
  LessonVocabItem,
  LessonGrammarItem,
  LessonDialogueLine,
  LessonPhoneticGuide,
  VocabExample,
  VocabCommonMistake,
  GrammarExample,
} from "@/lib/hsk1-full-lessons";
import type { ReadingItem, CulturalNoteItem } from "@/lib/lesson-data";
import { lookupDictionaryAuto, getAutoPinyin } from "@/lib/pinyin-helper";

// -------------------------------------------------------------
// 1. VOCABULARY FULL-FIELD EDIT MODAL
// -------------------------------------------------------------
interface VocabItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  vocab: LessonVocabItem;
  onSave: (updated: LessonVocabItem) => void;
}

export function VocabItemEditModal({
  isOpen,
  onClose,
  vocab,
  onSave,
}: VocabItemEditModalProps) {
  const [activeTab, setActiveTab] = useState<"form" | "json">("form");
  const [data, setData] = useState<LessonVocabItem>({ ...vocab });
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [autoLoading, setAutoLoading] = useState(false);

  const handleAutoFill = async () => {
    if (!data.hanzi?.trim()) {
      alert("Vui lòng nhập Hán tự trước!");
      return;
    }
    setAutoLoading(true);
    try {
      const res = await lookupDictionaryAuto(data.hanzi);
      setData((prev) => ({
        ...prev,
        pinyin: res.pinyin || prev.pinyin,
        meaningVi: res.meaningVi || prev.meaningVi || prev.meaning,
        meaning: res.meaningVi || prev.meaning,
        type: res.type || prev.type || prev.wordType || "Từ vựng",
      }));
    } finally {
      setAutoLoading(false);
    }
  };

  useEffect(() => {
    setData({ ...vocab });
    setJsonText(JSON.stringify(vocab, null, 2));
    setJsonError("");
    setActiveTab("form");
  }, [vocab, isOpen]);

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    void playChineseSpeech(text);
  };

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setData(parsed);
      setJsonError("");
    } catch (e: any) {
      setJsonError(e.message || "Cú pháp JSON không hợp lệ");
    }
  };

  const handleAddExample = () => {
    const list = data.examples || [];
    setData({
      ...data,
      examples: [...list, { zh: "", pinyin: "", vi: "" }],
    });
  };

  const handleUpdateExample = (idx: number, field: keyof VocabExample, val: string) => {
    const list = [...(data.examples || [])];
    list[idx] = { ...list[idx], [field]: val };
    setData({ ...data, examples: list });
  };

  const handleRemoveExample = (idx: number) => {
    const list = (data.examples || []).filter((_, i) => i !== idx);
    setData({ ...data, examples: list });
  };

  const handleAddPattern = () => {
    const list = data.usagePatterns || [];
    setData({ ...data, usagePatterns: [...list, ""] });
  };

  const handleUpdatePattern = (idx: number, val: string) => {
    const list = [...(data.usagePatterns || [])];
    list[idx] = val;
    setData({ ...data, usagePatterns: list });
  };

  const handleRemovePattern = (idx: number) => {
    const list = (data.usagePatterns || []).filter((_, i) => i !== idx);
    setData({ ...data, usagePatterns: list });
  };

  const handleAddMistake = () => {
    const list = data.commonMistakes || [];
    setData({
      ...data,
      commonMistakes: [...list, { incorrect: "", correct: "", explanation: "" }],
    });
  };

  const handleUpdateMistake = (idx: number, field: keyof VocabCommonMistake, val: string) => {
    const list = [...(data.commonMistakes || [])];
    list[idx] = { ...list[idx], [field]: val };
    setData({ ...data, commonMistakes: list });
  };

  const handleRemoveMistake = (idx: number) => {
    const list = (data.commonMistakes || []).filter((_, i) => i !== idx);
    setData({ ...data, commonMistakes: list });
  };

  const handleSubmit = () => {
    if (activeTab === "json") {
      try {
        const parsed = JSON.parse(jsonText);
        onSave(parsed);
        onClose();
      } catch {
        alert("Vui lòng sửa lỗi cú pháp JSON trước khi lưu!");
      }
      return;
    }

    if (!data.hanzi?.trim()) {
      alert("Hán tự không được để trống!");
      return;
    }
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xl overflow-hidden text-[#204434]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#204434] to-[#163325] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9D493E] text-white flex items-center justify-center font-serif text-lg font-bold shadow-md shrink-0">
              字
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold">
                  Sửa chi tiết từ vựng: {data.hanzi || "Từ mới"}
                </h3>
                {data.hanzi && (
                  <button
                    type="button"
                    onClick={() => handleSpeak(data.hanzi)}
                    className="p-1 rounded-lg text-amber-200 hover:bg-white/10 transition cursor-pointer"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-[#BC9B6B] font-mono">
                {data.pinyin || "chưa có pinyin"} · {data.meaningVi || data.meaning || "chưa có nghĩa"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-black/20 p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setJsonText(JSON.stringify(data, null, 2));
                  setActiveTab("form");
                }}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "form" ? "bg-white text-[#204434] shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Giao diện Form</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setJsonText(JSON.stringify(data, null, 2));
                  setActiveTab("json");
                }}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "json" ? "bg-white text-[#204434] shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Trực tiếp JSON</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === "json" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#8F6D3B]">
                  Chỉnh sửa trực tiếp file JSON của từ này (Hỗ trợ copy/paste):
                </span>
                {jsonError ? (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {jsonError}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cú pháp hợp lệ
                  </span>
                )}
              </div>
              <textarea
                rows={16}
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="w-full font-mono text-xs p-3.5 rounded-2xl border border-[#BC9B6B]/40 bg-[#162B21] text-emerald-200 outline-none focus:border-[#BC9B6B]"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>1. Thông tin từ vựng cơ bản</span>
                  </h4>
                  <button
                    type="button"
                    disabled={autoLoading}
                    onClick={handleAutoFill}
                    className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Tự động tạo Pinyin có dấu và tra cứu nghĩa tiếng Việt"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>{autoLoading ? "Đang tra cứu..." : "✨ Tự động điền Pinyin & Nghĩa"}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#204434] block mb-1">
                      Chữ Hán (Hanzi) *
                    </label>
                    <input
                      type="text"
                      value={data.hanzi || ""}
                      onChange={(e) => setData({ ...data, hanzi: e.target.value })}
                      placeholder="VD: 你好"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-base font-serif font-bold text-[#204434] outline-none focus:border-[#204434]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#204434] block mb-1">
                      Phiên âm (Pinyin)
                    </label>
                    <input
                      type="text"
                      value={data.pinyin || ""}
                      onChange={(e) => setData({ ...data, pinyin: e.target.value })}
                      placeholder="VD: nǐ hǎo"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-mono text-[#8F6D3B] outline-none focus:border-[#204434]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#204434] block mb-1">
                      Nghĩa tiếng Việt
                    </label>
                    <input
                      type="text"
                      value={data.meaningVi || data.meaning || ""}
                      onChange={(e) => setData({ ...data, meaningVi: e.target.value, meaning: e.target.value })}
                      placeholder="VD: Xin chào"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-semibold text-[#204434] outline-none focus:border-[#204434]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#204434] block mb-1">
                      Từ loại (Type)
                    </label>
                    <select
                      value={data.type || data.wordType || "Chào hỏi"}
                      onChange={(e) => setData({ ...data, type: e.target.value, wordType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-medium text-[#204434] bg-white outline-none focus:border-[#204434]"
                    >
                      <option value="Chào hỏi">Chào hỏi</option>
                      <option value="Danh từ">Danh từ</option>
                      <option value="Động từ">Động từ</option>
                      <option value="Tính từ">Tính từ</option>
                      <option value="Đại từ">Đại từ</option>
                      <option value="Phó từ">Phó từ</option>
                      <option value="Lượng từ">Lượng từ</option>
                      <option value="Trợ từ">Trợ từ</option>
                      <option value="Giới từ">Giới từ</option>
                      <option value="Liên từ">Liên từ</option>
                      <option value="Thán từ">Thán từ</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[11px] font-bold text-[#204434] block mb-1">
                    Giải thích cách dùng chuyên sâu (usageExplanation)
                  </label>
                  <textarea
                    rows={2}
                    value={data.usageExplanation || ""}
                    onChange={(e) => setData({ ...data, usageExplanation: e.target.value })}
                    placeholder="Giải thích ngữ cảnh dùng từ, sắc thái biểu cảm hoặc đối tượng phù hợp..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs text-[#204434] outline-none focus:border-[#204434]"
                  />
                </div>
              </div>

              {/* PHẦN 2: MẪU KẾT HỢP / CỤM TỪ HAY DÙNG (usagePatterns) */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>2. Mẫu kết hợp / Cụm từ hay gặp ({data.usagePatterns?.length || 0})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddPattern}
                    className="px-2.5 py-1 rounded-lg bg-[#204434]/10 hover:bg-[#204434]/20 text-[#204434] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm mẫu</span>
                  </button>
                </div>

                {(!data.usagePatterns || data.usagePatterns.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">Chưa có mẫu kết hợp nào.</p>
                ) : (
                  <div className="space-y-2">
                    {data.usagePatterns.map((pat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={pat}
                          onChange={(e) => handleUpdatePattern(idx, e.target.value)}
                          placeholder="VD: Chào + Danh xưng: 老师，你好！"
                          className="flex-1 px-3 py-1.5 rounded-xl border border-[#E5DEC9] text-xs text-[#204434] outline-none focus:border-[#204434]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePattern(idx)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PHẦN 3: CÁC CÂU VÍ DỤ PHONG PHÚ (examples) */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>3. Danh sách câu ví dụ chi tiết ({data.examples?.length || 0})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddExample}
                    className="px-2.5 py-1 rounded-lg bg-[#204434]/10 hover:bg-[#204434]/20 text-[#204434] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm câu ví dụ</span>
                  </button>
                </div>

                {(!data.examples || data.examples.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">Chưa có câu ví dụ nào.</p>
                ) : (
                  <div className="space-y-3">
                    {data.examples.map((ex, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#204434]">
                            Câu ví dụ #{idx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            {ex.zh && (
                              <button
                                type="button"
                                onClick={() => handleSpeak(ex.zh)}
                                className="p-1 text-[#8F6D3B] hover:text-[#204434]"
                                title="Nghe câu"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveExample(idx)}
                              className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={ex.zh || ""}
                            onChange={(e) => handleUpdateExample(idx, "zh", e.target.value)}
                            placeholder="Tiếng Trung (VD: 王老师，你好！)"
                            className="px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-xs font-serif font-bold text-[#204434]"
                          />
                          <input
                            type="text"
                            value={ex.pinyin || ""}
                            onChange={(e) => handleUpdateExample(idx, "pinyin", e.target.value)}
                            placeholder="Pinyin (Wáng lǎoshī, nǐ hǎo!)"
                            className="px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-xs font-mono text-[#8F6D3B]"
                          />
                          <input
                            type="text"
                            value={ex.vi || ""}
                            onChange={(e) => handleUpdateExample(idx, "vi", e.target.value)}
                            placeholder="Nghĩa tiếng Việt (Em chào thầy Vương ạ!)"
                            className="px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-xs text-[#204434]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PHẦN 4: LỖI SAI THƯỜNG GẶP & CÁCH SỬA (commonMistakes) */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>4. Bẫy & Lỗi sai thường gặp ({data.commonMistakes?.length || 0})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddMistake}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm lỗi sai</span>
                  </button>
                </div>

                {(!data.commonMistakes || data.commonMistakes.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">Chưa có ghi chú lỗi sai.</p>
                ) : (
                  <div className="space-y-3">
                    {data.commonMistakes.map((mis, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-rose-50/40 border border-rose-200/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-rose-900">
                            Lỗi sai #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMistake(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={mis.incorrect || ""}
                            onChange={(e) => handleUpdateMistake(idx, "incorrect", e.target.value)}
                            placeholder="Cách dùng SAI (VD: 你好吗？ khi gặp lần đầu)"
                            className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-white text-xs text-rose-700 font-semibold"
                          />
                          <input
                            type="text"
                            value={mis.correct || ""}
                            onChange={(e) => handleUpdateMistake(idx, "correct", e.target.value)}
                            placeholder="Cách dùng ĐÚNG (VD: 你好！)"
                            className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs text-emerald-800 font-semibold"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={mis.explanation || ""}
                          onChange={(e) => handleUpdateMistake(idx, "explanation", e.target.value)}
                          placeholder="Giải thích vì sao sai và cách dùng chuẩn..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-rose-200 bg-white text-xs text-slate-700"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#F8F5ED] border-t border-[#E5DEC9] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#8F6D3B]">
            * Thay đổi sẽ được đồng bộ ngay khi bấm lưu bài học.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-[#204434] text-xs font-bold hover:bg-white transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#163325] text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Cập nhật từ vựng</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. GRAMMAR FULL-FIELD EDIT MODAL
// -------------------------------------------------------------
interface GrammarItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  grammar: LessonGrammarItem;
  onSave: (updated: LessonGrammarItem) => void;
}

export function GrammarItemEditModal({
  isOpen,
  onClose,
  grammar,
  onSave,
}: GrammarItemEditModalProps) {
  const [activeTab, setActiveTab] = useState<"form" | "json">("form");
  const [data, setData] = useState<LessonGrammarItem>({ ...grammar });
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    setData({ ...grammar });
    setJsonText(JSON.stringify(grammar, null, 2));
    setJsonError("");
    setActiveTab("form");
  }, [grammar, isOpen]);

  if (!isOpen) return null;

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setData(parsed);
      setJsonError("");
    } catch (e: any) {
      setJsonError(e.message || "Cú pháp JSON không hợp lệ");
    }
  };

  const handleAddExample = () => {
    const list = data.examples || [];
    setData({
      ...data,
      examples: [...list, { zh: "", pinyin: "", vi: "", explanationVi: "" }],
    });
  };

  const handleUpdateExample = (idx: number, field: keyof GrammarExample, val: string) => {
    const list = [...(data.examples || [])];
    list[idx] = { ...list[idx], [field]: val };
    setData({ ...data, examples: list });
  };

  const handleRemoveExample = (idx: number) => {
    const list = (data.examples || []).filter((_, i) => i !== idx);
    setData({ ...data, examples: list });
  };

  const handleSubmit = () => {
    if (activeTab === "json") {
      try {
        const parsed = JSON.parse(jsonText);
        onSave(parsed);
        onClose();
      } catch {
        alert("Vui lòng sửa lỗi cú pháp JSON trước khi lưu!");
      }
      return;
    }

    if (!data.title?.trim() || !data.structure?.trim()) {
      alert("Tiêu đề và cấu trúc ngữ pháp không được để trống!");
      return;
    }
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xl overflow-hidden text-[#204434]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#204434] to-[#163325] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8F6D3B] text-white flex items-center justify-center font-serif text-lg font-bold shadow-md shrink-0">
              法
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold">
                Sửa điểm ngữ pháp: {data.title || "Ngữ pháp mới"}
              </h3>
              <p className="text-xs text-[#BC9B6B] font-mono">
                {data.structure || "Chưa có cấu trúc công thức"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-black/20 p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setJsonText(JSON.stringify(data, null, 2));
                  setActiveTab("form");
                }}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "form" ? "bg-white text-[#204434] shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Form</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setJsonText(JSON.stringify(data, null, 2));
                  setActiveTab("json");
                }}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "json" ? "bg-white text-[#204434] shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === "json" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#8F6D3B]">
                  Chỉnh sửa trực tiếp file JSON của điểm ngữ pháp:
                </span>
                {jsonError ? (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {jsonError}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cú pháp hợp lệ
                  </span>
                )}
              </div>
              <textarea
                rows={16}
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="w-full font-mono text-xs p-3.5 rounded-2xl border border-[#BC9B6B]/40 bg-[#162B21] text-emerald-200 outline-none focus:border-[#BC9B6B]"
              />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                <h4 className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. Cấu trúc & Định nghĩa</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#204434] block mb-1">
                      Tiêu đề ngữ pháp *
                    </label>
                    <input
                      type="text"
                      value={data.title || ""}
                      onChange={(e) => setData({ ...data, title: e.target.value })}
                      placeholder="VD: Câu chữ 把 (Bǎ)"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold text-[#204434]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#204434] block mb-1">
                      Tiêu đề tiếng Trung (titleZh)
                    </label>
                    <input
                      type="text"
                      value={data.titleZh || ""}
                      onChange={(e) => setData({ ...data, titleZh: e.target.value })}
                      placeholder="VD: “把”字句"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-serif font-bold text-[#204434]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#204434] block mb-1">
                    Công thức / Cấu trúc (Structure) *
                  </label>
                  <input
                    type="text"
                    value={data.structure || ""}
                    onChange={(e) => setData({ ...data, structure: e.target.value })}
                    placeholder="VD: Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] font-mono text-xs font-bold text-[#8F6D3B]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#204434] block mb-1">
                    Câu ví dụ chuẩn mẫu (example)
                  </label>
                  <input
                    type="text"
                    value={data.example || ""}
                    onChange={(e) => setData({ ...data, example: e.target.value })}
                    placeholder="VD: 我把书看完了。(Wǒ bǎ shū kàn wán le.)"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs text-[#204434]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#204434] block mb-1">
                    Giải thích chi tiết và lưu ý ngữ cảnh (explanation)
                  </label>
                  <textarea
                    rows={3}
                    value={data.explanation || data.usageExplanation || ""}
                    onChange={(e) => setData({ ...data, explanation: e.target.value, usageExplanation: e.target.value })}
                    placeholder="Giải thích bản chất cấu trúc, hành động tác động lên đối tượng nào..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs text-[#204434]"
                  />
                </div>
              </div>

              {/* Danh sách câu ví dụ chi tiết */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5DEC9] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>2. Danh sách câu ví dụ mở rộng ({data.examples?.length || 0})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddExample}
                    className="px-2.5 py-1 rounded-lg bg-[#204434]/10 hover:bg-[#204434]/20 text-[#204434] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm câu ví dụ</span>
                  </button>
                </div>

                {(!data.examples || data.examples.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">Chưa có câu ví dụ mở rộng nào.</p>
                ) : (
                  <div className="space-y-3">
                    {data.examples.map((ex, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E5DEC9] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#204434]">
                            Ví dụ #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExample(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={ex.zh || ""}
                            onChange={(e) => handleUpdateExample(idx, "zh", e.target.value)}
                            placeholder="Tiếng Trung (VD: 请把门关上。)"
                            className="px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-xs font-serif font-bold text-[#204434]"
                          />
                          <input
                            type="text"
                            value={ex.pinyin || ""}
                            onChange={(e) => handleUpdateExample(idx, "pinyin", e.target.value)}
                            placeholder="Pinyin (Qǐng bǎ mén guān shàng.)"
                            className="px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-xs font-mono text-[#8F6D3B]"
                          />
                          <input
                            type="text"
                            value={ex.vi || ""}
                            onChange={(e) => handleUpdateExample(idx, "vi", e.target.value)}
                            placeholder="Tiếng Việt (Xin hãy đóng cửa lại.)"
                            className="px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-xs text-[#204434]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#F8F5ED] border-t border-[#E5DEC9] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#8F6D3B]">
            * Đồng bộ tự động vào giáo trình HSK khi lưu.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-[#204434] text-xs font-bold hover:bg-white transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#163325] text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Cập nhật ngữ pháp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. DIALOGUE LINE EDIT MODAL
// -------------------------------------------------------------
interface DialogueItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dialogue: LessonDialogueLine;
  onSave: (updated: LessonDialogueLine) => void;
}

export function DialogueItemEditModal({
  isOpen,
  onClose,
  dialogue,
  onSave,
}: DialogueItemEditModalProps) {
  const [data, setData] = useState<LessonDialogueLine>({ ...dialogue });
  const [activeTab, setActiveTab] = useState<"form" | "json">("form");
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    setData({ ...dialogue });
    setJsonText(JSON.stringify(dialogue, null, 2));
    setActiveTab("form");
  }, [dialogue, isOpen]);

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    void playChineseSpeech(text);
  };

  const handleSubmit = () => {
    if (activeTab === "json") {
      try {
        const parsed = JSON.parse(jsonText);
        onSave(parsed);
        onClose();
      } catch {
        alert("Cú pháp JSON không hợp lệ!");
      }
      return;
    }
    if (!data.zh?.trim()) {
      alert("Nội dung tiếng Trung không được để trống!");
      return;
    }
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg flex flex-col rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xl overflow-hidden text-[#204434]">
        <div className="p-4 bg-gradient-to-r from-[#204434] to-[#163325] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-200" />
            <h3 className="font-serif font-bold text-sm sm:text-base">
              Sửa câu thoại ({data.speaker || "Người nói"})
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-white/70 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-bold text-[#204434] block mb-1">
              Người nói (Speaker)
            </label>
            <input
              type="text"
              value={data.speaker || ""}
              onChange={(e) => setData({ ...data, speaker: e.target.value })}
              placeholder="VD: A, B, 王老师, 小明..."
              className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold text-[#8F6D3B]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-[#204434]">
                Câu tiếng Trung (Chữ Hán) *
              </label>
              {data.zh && (
                <button
                  type="button"
                  onClick={() => handleSpeak(data.zh)}
                  className="text-xs text-[#8F6D3B] hover:text-[#204434] flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe thử</span>
                </button>
              )}
            </div>
            <textarea
              rows={2}
              value={data.zh || ""}
              onChange={(e) => setData({ ...data, zh: e.target.value })}
              placeholder="VD: 你好！很高兴认识你。"
              className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] font-serif text-base font-bold text-[#204434]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-[#204434]">
                Phiên âm Pinyin
              </label>
              {data.zh && (
                <button
                  type="button"
                  onClick={() => setData({ ...data, pinyin: getAutoPinyin(data.zh) })}
                  className="text-[10px] text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Tự động tạo Pinyin có dấu từ chữ Hán"
                >
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  <span>Tự tạo Pinyin</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={data.pinyin || ""}
              onChange={(e) => setData({ ...data, pinyin: e.target.value })}
              placeholder="VD: Nǐ hǎo! Hěn gāoxìng rènshí nǐ."
              className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] font-mono text-xs text-[#8F6D3B]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#204434] block mb-1">
              Dịch nghĩa tiếng Việt
            </label>
            <input
              type="text"
              value={data.vi || ""}
              onChange={(e) => setData({ ...data, vi: e.target.value })}
              placeholder="VD: Xin chào! Rất vui được làm quen với bạn."
              className="w-full px-3 py-2 rounded-xl border border-[#E5DEC9] text-xs text-[#204434]"
            />
          </div>
        </div>

        <div className="p-4 bg-[#F8F5ED] border-t border-[#E5DEC9] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-[#204434] text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Cập nhật câu thoại</span>
          </button>
        </div>
      </div>
    </div>
  );
}
