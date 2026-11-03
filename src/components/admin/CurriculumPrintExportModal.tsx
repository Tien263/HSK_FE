"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  Download,
  FileText,
  BookOpen,
  Sparkles,
  Layers,
  MessageSquare,
  Globe2,
  Check,
} from "lucide-react";
import type { Hsk1FullLesson } from "@/lib/hsk1-full-lessons";

interface CurriculumPrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: Hsk1FullLesson[];
  level: number;
}

export default function CurriculumPrintExportModal({
  isOpen,
  onClose,
  lessons,
  level,
}: CurriculumPrintExportModalProps) {
  const [selectedLessonNumber, setSelectedLessonNumber] = useState<number | "ALL">("ALL");
  const [layoutMode, setLayoutMode] = useState<"handout" | "lesson_plan">("handout");
  const [includeVocab, setIncludeVocab] = useState(true);
  const [includeGrammar, setIncludeGrammar] = useState(true);
  const [includeDialogue, setIncludeDialogue] = useState(true);
  const [includeReading, setIncludeReading] = useState(true);
  const [includeCulture, setIncludeCulture] = useState(true);

  if (!isOpen) return null;

  const targetLessons =
    selectedLessonNumber === "ALL"
      ? lessons
      : lessons.filter((l) => l.number === selectedLessonNumber);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép popup để in tài liệu.");
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <title>Giao_Trinh_HSK_${level}_${selectedLessonNumber === "ALL" ? "Toan_Bo" : `Bai_${selectedLessonNumber}`}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
          body {
            font-family: "Times New Roman", Times, serif, "SimSun", "STSong";
            color: #111;
            line-height: 1.5;
            background: #fff;
            padding: 0;
            margin: 0;
          }
          .lesson-block {
            page-break-after: always;
            margin-bottom: 25px;
          }
          .lesson-block:last-child {
            page-break-after: auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #204434;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 20pt;
            margin: 0;
            color: #204434;
            font-family: "Songti SC", "SimSun", serif;
          }
          .header h2 {
            font-size: 13pt;
            font-weight: normal;
            margin: 5px 0 0;
            color: #666;
          }
          .section-title {
            font-size: 13pt;
            font-weight: bold;
            color: #204434;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
            margin-top: 18px;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 10pt;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #f5f5f0;
            color: #204434;
            font-weight: bold;
          }
          .hanzi-col {
            font-size: 14pt;
            font-family: "Songti SC", "SimSun", "KaiTi", serif;
            font-weight: bold;
            color: #000;
          }
          .dialogue-bubble {
            margin-bottom: 8px;
            padding: 6px 10px;
            background: #fafafa;
            border-left: 3px solid #204434;
            font-size: 10pt;
          }
          .grammar-card {
            margin-bottom: 12px;
            padding: 8px 12px;
            border: 1px solid #e0e0e0;
            background: #fdfdfd;
            font-size: 10pt;
          }
          .formula {
            font-family: "Courier New", monospace;
            font-weight: bold;
            color: #8F6D3B;
          }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${targetLessons
          .map(
            (les) => `
          <div class="lesson-block">
            <div class="header">
              <h1>${les.titleZh}</h1>
              <h2>${les.pinyin || ""} — ${les.titleVi} (HSK ${level})</h2>
              <div style="font-size: 9pt; color: #888; margin-top: 4px;">
                ${layoutMode === "handout" ? "ĐỀ CƯƠNG HỌC TẬP HỌC VIÊN" : "GIÁO ÁN GIẢNG DẠY GIÁO VIÊN"}
              </div>
            </div>

            ${
              includeVocab && les.vocabList && les.vocabList.length > 0
                ? `
              <div class="section-title">一、 Bảng Từ Vựng Trọng Tâm (${les.vocabList.length} từ)</div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 8%;">STT</th>
                    <th style="width: 20%;">Hán tự</th>
                    <th style="width: 22%;">Pinyin</th>
                    <th style="width: 25%;">Nghĩa tiếng Việt</th>
                    <th style="width: 25%;">Ví dụ minh họa</th>
                  </tr>
                </thead>
                <tbody>
                  ${les.vocabList
                    .map(
                      (v, i) => `
                    <tr>
                      <td style="text-align: center;">${i + 1}</td>
                      <td class="hanzi-col">${v.hanzi}</td>
                      <td style="font-family: monospace;">${v.pinyin || ""}</td>
                      <td><strong>${v.meaningVi || v.meaning || ""}</strong> (${v.type || "Từ vựng"})</td>
                      <td>${v.exampleZh || (v.examples && v.examples[0]?.zh) || ""}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
                : ""
            }

            ${
              includeGrammar && les.grammarList && les.grammarList.length > 0
                ? `
              <div class="section-title">二、 Điểm Ngữ Pháp Cốt Lõi (${les.grammarList.length} điểm)</div>
              ${les.grammarList
                .map(
                  (g, i) => `
                <div class="grammar-card">
                  <div><strong>${i + 1}. ${g.title}</strong> ${g.titleZh ? `(${g.titleZh})` : ""}</div>
                  <div class="formula" style="margin: 4px 0;">Cấu trúc: ${g.structure}</div>
                  <div style="font-size: 9.5pt; color: #444; margin-bottom: 4px;">${g.explanation || g.usageExplanation || ""}</div>
                  ${g.example ? `<div style="font-size: 9.5pt; color: #204434;"><em>Ví dụ: ${g.example}</em></div>` : ""}
                </div>
              `
                )
                .join("")}
            `
                : ""
            }

            ${
              includeDialogue && les.dialogue && les.dialogue.length > 0
                ? `
              <div class="section-title">三、 Đoạn Hội Thoại Bài Khóa (${les.dialogue.length} câu thoại)</div>
              ${les.dialogue
                .map(
                  (d) => `
                <div class="dialogue-bubble">
                  <strong>${d.speaker}:</strong> <span style="font-family: 'SimSun', serif; font-size: 11pt; font-weight: bold;">${d.zh}</span>
                  <div style="font-size: 9pt; color: #8F6D3B; font-family: monospace;">${d.pinyin}</div>
                  <div style="font-size: 9pt; color: #444;">${d.vi}</div>
                </div>
              `
                )
                .join("")}
            `
                : ""
            }

            ${
              includeReading && les.reading && les.reading.contentZh
                ? `
              <div class="section-title">四、 Bài Luyện Đọc Hiểu</div>
              <div style="padding: 10px; border: 1px solid #ccc; background: #fafafa; margin-bottom: 15px;">
                <div style="font-weight: bold; margin-bottom: 6px; font-size: 11pt;">${les.reading.titleZh} — ${les.reading.titleVi}</div>
                <div style="font-family: 'SimSun', serif; font-size: 12pt; line-height: 1.8; margin-bottom: 8px;">${les.reading.contentZh}</div>
                <div style="font-family: monospace; font-size: 9.5pt; color: #8F6D3B; margin-bottom: 8px;">${les.reading.contentPy}</div>
                <div style="font-size: 9.5pt; color: #333; border-top: 1px dashed #ccc; padding-top: 6px;">${les.reading.contentVi}</div>
              </div>
            `
                : ""
            }

            ${
              includeCulture && (les.culture || les.culturalNote?.context)
                ? `
              <div class="section-title">五、 Góc Văn Hóa & Phong Tục Giao Tiếp</div>
              <div style="font-size: 9.5pt; line-height: 1.6; color: #333; padding: 8px 12px; background: #fdfdfd; border: 1px solid #eee;">
                ${les.culture || les.culturalNote?.context}
              </div>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
      </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FFFCF6] border border-[#BC9B6B]/40 shadow-2xl overflow-hidden text-[#204434]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#204434] to-[#163325] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8F6D3B] text-white flex items-center justify-center font-serif text-lg font-bold shadow-md shrink-0">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold">
                Xuất đề cương in ấn & Giáo án PDF (HSK {level})
              </h3>
              <p className="text-xs text-[#BC9B6B]">
                Tự động dàn trang A4 chuẩn phông chữ Hán ngữ cho giáo viên in đề cương phát cho lớp.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Settings */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Phạm vi in */}
          <div>
            <label className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider block mb-2">
              1. Chọn phạm vi bài học cần in:
            </label>
            <select
              value={selectedLessonNumber}
              onChange={(e) =>
                setSelectedLessonNumber(
                  e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                )
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] bg-white text-xs font-bold text-[#204434]"
            >
              <option value="ALL">Toàn bộ {lessons.length} bài học trong HSK {level}</option>
              {lessons.map((les) => (
                <option key={les.number} value={les.number}>
                  Bài {les.number}: {les.titleZh} — {les.titleVi}
                </option>
              ))}
            </select>
          </div>

          {/* Mẫu dàn trang */}
          <div>
            <label className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider block mb-2">
              2. Định dạng mẫu in:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLayoutMode("handout")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  layoutMode === "handout"
                    ? "bg-[#204434]/10 border-[#204434] shadow-xs"
                    : "bg-white border-[#E5DEC9]"
                }`}
              >
                <FileText className="w-5 h-5 text-[#204434] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-[#204434] block">
                    Đề cương học viên (Handout)
                  </span>
                  <span className="text-[11px] text-[#526c50]">
                    Bảng từ vựng lớn, bài đọc rõ ràng, phù hợp in phát cho học sinh học trên lớp.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLayoutMode("lesson_plan")}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  layoutMode === "lesson_plan"
                    ? "bg-[#204434]/10 border-[#204434] shadow-xs"
                    : "bg-white border-[#E5DEC9]"
                }`}
              >
                <BookOpen className="w-5 h-5 text-[#8F6D3B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-[#204434] block">
                    Giáo án giáo viên (Lesson Plan)
                  </span>
                  <span className="text-[11px] text-[#526c50]">
                    Kèm giải thích ngữ pháp chi tiết, công thức và lưu ý giảng dạy chuyên sâu.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Các mục bao gồm */}
          <div>
            <label className="text-xs font-bold text-[#8F6D3B] uppercase tracking-wider block mb-2">
              3. Các phần nội dung đưa vào bản in:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { label: "Bảng từ vựng", state: includeVocab, setter: setIncludeVocab },
                { label: "Điểm ngữ pháp", state: includeGrammar, setter: setIncludeGrammar },
                { label: "Đoạn hội thoại", state: includeDialogue, setter: setIncludeDialogue },
                { label: "Bài đọc hiểu", state: includeReading, setter: setIncludeReading },
                { label: "Góc văn hóa", state: includeCulture, setter: setIncludeCulture },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                    item.state ? "bg-white border-[#204434] text-[#204434] font-bold" : "bg-[#FAF7F0] border-[#E5DEC9] text-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="rounded text-[#204434]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8F5ED] border-t border-[#E5DEC9] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#8F6D3B]">
            * Sử dụng hộp thoại in để chọn máy in hoặc &quot;Lưu dưới dạng PDF&quot;.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-xs font-bold"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-[#204434] hover:bg-[#163325] text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>In / Lưu PDF ngay</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
