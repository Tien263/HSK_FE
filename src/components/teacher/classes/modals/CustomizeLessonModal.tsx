"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  Volume2,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";
import { ClassDetailItem } from "../types";
import { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";

interface CustomizeLessonModalProps {
  customizingLesson: Hsk1FullLesson | null;
  currentClass: ClassDetailItem;
  customVocabs: string[];
  setCustomVocabs: React.Dispatch<React.SetStateAction<string[]>>;
  customGrammars: string[];
  setCustomGrammars: React.Dispatch<React.SetStateAction<string[]>>;
  customHasDialogue: boolean;
  setCustomHasDialogue: (val: boolean) => void;
  customTeacherNote: string;
  setCustomTeacherNote: (val: string) => void;
  customDueDate: string;
  setCustomDueDate: (val: string) => void;
  saving: boolean;
  onSave: (status: "PUBLISHED" | "DRAFT") => void;
  onClose: () => void;
}

export default function CustomizeLessonModal({
  customizingLesson,
  currentClass,
  customVocabs,
  setCustomVocabs,
  customGrammars,
  setCustomGrammars,
  customHasDialogue,
  setCustomHasDialogue,
  customTeacherNote,
  setCustomTeacherNote,
  customDueDate,
  setCustomDueDate,
  saving,
  onSave,
  onClose,
}: CustomizeLessonModalProps) {
  const [activeTab, setActiveTab] = useState<"VOCAB" | "GRAMMAR" | "DIALOGUE" | "SETTINGS">("VOCAB");

  if (!customizingLesson) return null;

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFCF7] border border-[#E5DFD0] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E5DFD0] flex items-center justify-between bg-white">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#1F513F]/10 text-[#1F513F] text-[11px] font-mono font-bold">
                Bài {String(customizingLesson.number).padStart(2, "0")}
              </span>
              <h3 className="font-serif font-bold text-lg text-[#17382F]">
                {customizingLesson.titleZh}
              </h3>
              <span className="text-xs text-[#6B766D] font-mono">({customizingLesson.pinyin})</span>
            </div>
            <p className="text-xs text-[#6B766D]">
              {customizingLesson.titleVi} • Tùy chỉnh nội dung công bố cho lớp <strong>{currentClass.name}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-[#F7F5EE] border-b border-[#E5DFD0] text-xs">
          {[
            { id: "VOCAB", label: `Từ vựng (${customVocabs.length}/${customizingLesson.vocabList.length})`, icon: Sparkles },
            { id: "GRAMMAR", label: `Ngữ pháp (${customGrammars.length}/${customizingLesson.grammarList.length})`, icon: BookOpen },
            { id: "DIALOGUE", label: "Hội thoại & Đọc", icon: FileText },
            { id: "SETTINGS", label: "Hạn nộp & Ghi chú", icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition font-semibold cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-[#1F513F] text-white shadow-2xs"
                  : "text-[#6B766D] hover:text-[#17382F] hover:bg-white"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: TỪ VỰNG */}
          {activeTab === "VOCAB" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B766D]">
                  Tích chọn những từ vựng học viên cần nắm vững trong bài học này:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomVocabs(customizingLesson.vocabList.map((v) => v.hanzi))}
                    className="text-[#1F513F] font-bold hover:underline cursor-pointer"
                  >
                    Chọn tất cả
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setCustomVocabs([])}
                    className="text-gray-500 hover:underline cursor-pointer"
                  >
                    Bỏ chọn hết
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {customizingLesson.vocabList.map((vocab) => {
                  const isChecked = customVocabs.includes(vocab.hanzi);
                  return (
                    <label
                      key={vocab.hanzi}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? "bg-white border-[#1F513F] shadow-2xs ring-1 ring-[#1F513F]/20"
                          : "bg-white/60 border-[#E5DFD0] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setCustomVocabs([...customVocabs, vocab.hanzi]);
                            else setCustomVocabs(customVocabs.filter((h) => h !== vocab.hanzi));
                          }}
                          className="rounded border-[#E5DFD0] accent-[#1F513F] cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif font-bold text-base text-[#17382F]">
                              {vocab.hanzi}
                            </span>
                            <span className="text-xs text-[#8F6D3B] font-mono">
                              {vocab.pinyin}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#6B766D] block">
                            {vocab.meaning}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSpeak(vocab.hanzi);
                        }}
                        className="p-1 rounded-lg text-gray-400 hover:text-[#1F513F] hover:bg-gray-100 cursor-pointer"
                        title="Phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: NGỮ PHÁP */}
          {activeTab === "GRAMMAR" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B766D]">
                  Tích chọn các điểm ngữ pháp cần giảng dạy trong bài:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomGrammars(customizingLesson.grammarList.map((g) => g.title))}
                    className="text-[#1F513F] font-bold hover:underline cursor-pointer"
                  >
                    Chọn tất cả
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setCustomGrammars([])}
                    className="text-gray-500 hover:underline cursor-pointer"
                  >
                    Bỏ chọn hết
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {customizingLesson.grammarList.map((grammar) => {
                  const isChecked = customGrammars.includes(grammar.title);
                  return (
                    <label
                      key={grammar.title}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? "bg-white border-[#1F513F] shadow-2xs ring-1 ring-[#1F513F]/20"
                          : "bg-white/60 border-[#E5DFD0] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) setCustomGrammars([...customGrammars, grammar.title]);
                          else setCustomGrammars(customGrammars.filter((t) => t !== grammar.title));
                        }}
                        className="rounded border-[#E5DFD0] accent-[#1F513F] cursor-pointer mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <span className="font-bold text-sm text-[#17382F] block">
                          {grammar.title}
                        </span>
                        <p className="text-xs text-[#6B766D] leading-relaxed">
                          {(grammar as any).desc || grammar.explanation || grammar.example}
                        </p>
                        {grammar.structure && (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-[#F7F5EE] border border-[#E5DFD0] text-[11px] font-mono text-[#8F6D3B]">
                            Cấu trúc: {grammar.structure}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: HỘI THOẠI & BÀI ĐỌC */}
          {activeTab === "DIALOGUE" && (
            <div className="space-y-4">
              <label className="p-4 rounded-2xl bg-white border border-[#E5DFD0] flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-sm text-[#17382F] block">
                    Bao gồm bài Hội thoại mẫu
                  </span>
                  <span className="text-xs text-[#6B766D]">
                    Học sinh được luyện đọc và nghe đoạn hội thoại có phát âm bản xứ
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={customHasDialogue}
                  onChange={(e) => setCustomHasDialogue(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E5DFD0] accent-[#1F513F] cursor-pointer"
                />
              </label>

              {customizingLesson.dialogue && (
                <div className="p-4 rounded-2xl bg-[#F7F5EE]/60 border border-[#E5DFD0] space-y-2">
                  <span className="text-xs font-bold text-[#17382F] block">
                    Nội dung hội thoại mẫu:
                  </span>
                  <div className="space-y-2">
                    {customizingLesson.dialogue.map((line, idx) => (
                      <div key={idx} className="text-xs bg-white p-2.5 rounded-xl border border-[#E5DFD0]/60 space-y-0.5">
                        <div className="font-semibold text-[#1F513F]">{line.speaker}: {line.zh}</div>
                        <div className="text-[11px] text-[#6B766D] font-mono">{line.pinyin}</div>
                        <div className="text-[11px] text-gray-500">{line.vi}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HẠN NỘP & GHI CHÚ */}
          {activeTab === "SETTINGS" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17382F] block">
                  Hạn hoàn thành bài học (Tùy chọn)
                </label>
                <input
                  type="date"
                  value={customDueDate}
                  onChange={(e) => setCustomDueDate(e.target.value)}
                  className="w-full bg-white border border-[#E5DFD0] rounded-xl px-3.5 py-2 text-xs text-[#17382F] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17382F] block">
                  Lời dặn dò của giáo viên dành riêng cho lớp này
                </label>
                <textarea
                  rows={4}
                  value={customTeacherNote}
                  onChange={(e) => setCustomTeacherNote(e.target.value)}
                  placeholder="Ví dụ: Các em nhớ học thuộc 6 từ vựng đầu tiên và chép lại hội thoại trước tiết học ngày mai nhé..."
                  className="w-full bg-white border border-[#E5DFD0] rounded-xl p-3 text-xs text-[#17382F] focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="p-4 border-t border-[#E5DFD0] bg-[#FAF7F0] flex items-center justify-between">
          <div className="text-xs text-[#6B766D]">
            Đã chọn <strong>{customVocabs.length}</strong> từ vựng • <strong>{customGrammars.length}</strong> ngữ pháp
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => onSave("DRAFT")}
              className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu bản nháp (DRAFT)"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => onSave("PUBLISHED")}
              className="px-5 py-2 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{saving ? "Đang công bố..." : "Công bố cho lớp ngay"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
