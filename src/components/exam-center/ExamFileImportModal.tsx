"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import * as fflate from "fflate";
import {
  FileSpreadsheet,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  X,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import type { ExamSectionGroup, QuestionItem, ImportedQuestion } from "./hsk-sample-templates";
import { unflattenToGroups } from "./hsk-sample-templates";
import s from "./ExamCenter.module.css";

interface ParsedRow {
  number: number;
  skill: "LISTENING" | "READING" | "WRITING" | "SPEAKING";
  content: string;
  pinyin?: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation?: string;
  points: number;
  passage?: string;
}

export default function ExamFileImportModal({
  hskLevel,
  onImport,
  onClose,
}: {
  hskLevel: number;
  onImport: (groups: ExamSectionGroup[], rawQuestions: QuestionItem[]) => void;
  onClose: () => void;
}) {
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Tải file Excel mẫu chuẩn
  const handleDownloadExcelTemplate = () => {
    try {
      const sampleData = [
        {
          STT: 1,
          "Kỹ năng": "READING",
          "Câu hỏi chữ Hán": "明天下午你想去哪里？",
          "Pinyin câu": "Míngtiān xiàwǔ nǐ xiǎng qù nǎlǐ?",
          "Lựa chọn A": "我去学校",
          "Lựa chọn B": "他是老师",
          "Lựa chọn C": "苹果很好吃",
          "Lựa chọn D": "今天星期五",
          "Đáp án đúng": "A",
          "Giải thích": "Câu hỏi hỏi 'đi đâu' (去哪里) nên chọn đáp án A chỉ địa điểm (去学校).",
          "Điểm số": 2.5,
          "Đoạn văn (nếu có)": "",
        },
        {
          STT: 2,
          "Kỹ năng": "READING",
          "Câu hỏi chữ Hán": "桌子上有一本书和两支笔。",
          "Pinyin câu": "Zhuōzi shàng yǒu yì běn shū hé liǎng zhī bǐ.",
          "Lựa chọn A": "Đúng",
          "Lựa chọn B": "Sai",
          "Lựa chọn C": "",
          "Lựa chọn D": "",
          "Đáp án đúng": "A",
          "Giải thích": "Phát biểu miêu tả chính xác trạng thái trên bàn.",
          "Điểm số": 2.0,
          "Đoạn văn (nếu có)": "",
        },
        {
          STT: 3,
          "Kỹ năng": "LISTENING",
          "Câu hỏi chữ Hán": "男：喂，请问张经理在吗？\n女：他正在开会呢，您半个小时后再打来吧。",
          "Pinyin câu": "",
          "Lựa chọn A": "在开会",
          "Lựa chọn B": "在吃饭",
          "Lựa chọn C": "去医院了",
          "Lựa chọn D": "在睡觉",
          "Đáp án đúng": "A",
          "Giải thích": "Người nữ nói '他正在开会' (anh ấy đang họp) nên chọn A.",
          "Điểm số": 2.5,
          "Đoạn văn (nếu có)": "",
        },
      ];

      const ws = XLSX.utils.json_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `HSK_${hskLevel}_Mau`);
      XLSX.writeFile(wb, `HSK_De_Thi_Mau_Cai_Dat_Cap_${hskLevel}.xlsx`);
    } catch (e) {
      setError("Không thể tải file Excel mẫu: " + (e as Error).message);
    }
  };

  // 2. Phân tích nội dung file Word (.docx)
  const parseDocxFile = async (buffer: ArrayBuffer): Promise<ParsedRow[]> => {
    const bytes = new Uint8Array(buffer);
    const unzipped = fflate.unzipSync(bytes);
    const docXmlEntry = unzipped["word/document.xml"];
    if (!docXmlEntry) {
      throw new Error("Tệp Word không đúng định dạng chuẩn .docx (thiếu document.xml).");
    }

    const xmlText = new TextDecoder("utf-8").decode(docXmlEntry);
    // Bóc tách các thẻ đoạn văn <w:p>
    const pMatches = xmlText.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
    const paragraphs: string[] = [];

    for (const pXml of pMatches) {
      const tMatches = pXml.match(/<w:t[\s\S]*?>([\s\S]*?)<\/w:t>/g) || [];
      const text = tMatches
        .map((t) => t.replace(/<[^>]+>/g, ""))
        .join("")
        .trim();
      if (text) paragraphs.push(text);
    }

    if (!paragraphs.length) {
      throw new Error("Tệp Word rỗng hoặc không có đoạn văn bản khả dụng.");
    }

    const rows: ParsedRow[] = [];
    let currentRow: Partial<ParsedRow> | null = null;
    let currentPassage = "";

    for (let i = 0; i < paragraphs.length; i++) {
      const line = paragraphs[i].trim();

      // Nhận diện đoạn văn đọc hiểu chung
      if (/^(đoạn văn|bài đọc|passage)[:\s]/i.test(line)) {
        currentPassage = line.replace(/^(đoạn văn|bài đọc|passage)[:\s]*/i, "").trim();
        continue;
      }

      // Nhận diện câu hỏi: "Câu 1:", "1.", "Câu 1."
      const qMatch = line.match(/^(?:câu\s*)?(\d+)[\.:\s]+(.+)$/i);
      if (qMatch) {
        if (currentRow && currentRow.content) {
          finalizeCurrentRow(currentRow, rows, currentPassage);
        }
        currentRow = {
          number: parseInt(qMatch[1], 10),
          content: qMatch[2].trim(),
          skill: "READING",
          options: [],
          correctAnswer: "A",
          points: 2,
          passage: currentPassage,
        };
        continue;
      }

      if (!currentRow) continue;

      // Nhận diện Pinyin
      if (/^pinyin[:\s]/i.test(line)) {
        currentRow.pinyin = line.replace(/^pinyin[:\s]*/i, "").trim();
        continue;
      }

      // Nhận diện các lựa chọn đáp án: A. ... B. ... C. ... D. ...
      const optMatch = line.match(/^([A-D]|[A-D]\))\s*[\.:\s]+(.+)$/i);
      if (optMatch) {
        const id = optMatch[1].toUpperCase().replace(")", "");
        const text = optMatch[2].trim();
        currentRow.options = currentRow.options || [];
        currentRow.options.push({ id, text });
        continue;
      }

      // Nhận diện lựa chọn nhiều đáp án trên 1 dòng: A. xxx   B. yyy   C. zzz
      const multiOpt = line.matchAll(/([A-D])[\.:\s]+([^A-D\n]+)/gi);
      let foundMulti = false;
      for (const m of multiOpt) {
        foundMulti = true;
        currentRow.options = currentRow.options || [];
        currentRow.options.push({ id: m[1].toUpperCase(), text: m[2].trim() });
      }
      if (foundMulti) continue;

      // Nhận diện đáp án đúng
      if (/^(đáp án|answer|key)[:\s]/i.test(line)) {
        const ans = line.replace(/^(đáp án|answer|key)[:\s]*/i, "").trim().toUpperCase();
        currentRow.correctAnswer = ans.slice(0, 1) || "A";
        continue;
      }

      // Nhận diện giải thích
      if (/^(giải thích|explanation|chú thích)[:\s]/i.test(line)) {
        currentRow.explanation = line.replace(/^(giải thích|explanation|chú thích)[:\s]*/i, "").trim();
        continue;
      }

      // Nếu là văn bản tiếp theo của câu hỏi
      if (currentRow.content && (!currentRow.options || currentRow.options.length === 0)) {
        currentRow.content += "\n" + line;
      }
    }

    if (currentRow && currentRow.content) {
      finalizeCurrentRow(currentRow, rows, currentPassage);
    }

    return rows;
  };

  const finalizeCurrentRow = (
    currentRow: Partial<ParsedRow>,
    rows: ParsedRow[],
    passage: string
  ) => {
    let opts = currentRow.options || [];
    if (opts.length === 0) {
      opts = [
        { id: "A", text: "Đúng" },
        { id: "B", text: "Sai" },
      ];
    }
    rows.push({
      number: currentRow.number || rows.length + 1,
      skill: currentRow.skill || "READING",
      content: currentRow.content || `Câu ${rows.length + 1}`,
      pinyin: currentRow.pinyin || "",
      options: opts,
      correctAnswer: currentRow.correctAnswer || opts[0]?.id || "A",
      explanation: currentRow.explanation || "",
      points: currentRow.points || 2,
      passage: currentRow.passage || passage || "",
    });
  };

  // 3. Phân tích nội dung file Excel / CSV
  const parseExcelFile = (buffer: ArrayBuffer): ParsedRow[] => {
    const wb = XLSX.read(buffer, { type: "array" });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) throw new Error("File Excel không có trang tính nào.");
    const ws = wb.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

    if (!rawData.length) {
      throw new Error("Trang tính rỗng, không tìm thấy dữ liệu hàng.");
    }

    const rows: ParsedRow[] = [];

    rawData.forEach((row, idx) => {
      // Tìm các cột tương ứng theo tên linh hoạt
      const getCol = (patterns: string[]) => {
        for (const k of Object.keys(row)) {
          const cleanK = k.toLowerCase().trim();
          if (patterns.some((p) => cleanK.includes(p))) {
            return String(row[k] ?? "").trim();
          }
        }
        return "";
      };

      const numVal = parseInt(getCol(["stt", "câu", "number", "no"]), 10);
      const questionNum = isNaN(numVal) ? idx + 1 : numVal;

      const rawSkill = getCol(["kỹ năng", "skill"]).toUpperCase();
      let skill: ParsedRow["skill"] = "READING";
      if (rawSkill.includes("NGHE") || rawSkill.includes("LISTEN")) skill = "LISTENING";
      else if (rawSkill.includes("VIẾT") || rawSkill.includes("WRITE")) skill = "WRITING";
      else if (rawSkill.includes("NÓI") || rawSkill.includes("SPEAK")) skill = "SPEAKING";

      const content =
        getCol(["câu hỏi", "chữ hán", "content", "nội dung", "đề bài"]) || `Câu ${questionNum}`;
      const pinyin = getCol(["pinyin", "phiên âm"]);

      const optA = getCol(["lựa chọn a", "option a", "a"]);
      const optB = getCol(["lựa chọn b", "option b", "b"]);
      const optC = getCol(["lựa chọn c", "option c", "c"]);
      const optD = getCol(["lựa chọn d", "option d", "d"]);

      const options: Array<{ id: string; text: string }> = [];
      if (optA) options.push({ id: "A", text: optA });
      if (optB) options.push({ id: "B", text: optB });
      if (optC) options.push({ id: "C", text: optC });
      if (optD) options.push({ id: "D", text: optD });

      // Nếu không có A-B-C-D, kiểm tra nếu là câu hỏi Đúng/Sai
      if (options.length === 0) {
        options.push({ id: "A", text: "Đúng" });
        options.push({ id: "B", text: "Sai" });
      }

      const rawAnswer = getCol(["đáp án", "answer", "key", "correct"]).toUpperCase();
      const correctAnswer = rawAnswer ? rawAnswer.slice(0, 1) : "A";

      const explanation = getCol(["giải thích", "explanation", "chú thích"]);
      const pointsVal = parseFloat(getCol(["điểm", "points", "score"]));
      const points = isNaN(pointsVal) || pointsVal <= 0 ? 2 : pointsVal;
      const passage = getCol(["đoạn văn", "passage", "bài đọc"]);

      rows.push({
        number: questionNum,
        skill,
        content,
        pinyin,
        options,
        correctAnswer,
        explanation,
        points,
        passage,
      });
    });

    return rows;
  };

  // 4. Xử lý khi người dùng chọn tải file lên
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccessMsg("");
    setParsing(true);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const ext = file.name.split(".").pop()?.toLowerCase();

      let parsed: ParsedRow[] = [];
      if (ext === "docx") {
        parsed = await parseDocxFile(buffer);
      } else if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        parsed = parseExcelFile(buffer);
      } else if (ext === "json") {
        const text = new TextDecoder("utf-8").decode(buffer);
        const json = JSON.parse(text);
        const questionsList: any[] = Array.isArray(json)
          ? json
          : json.questions || json.exam?.questions || [];
        if (!questionsList.length) throw new Error("File JSON không chứa danh sách câu hỏi.");
        parsed = questionsList.map((q, i) => ({
          number: q.questionNumber || i + 1,
          skill: q.skill || "READING",
          content: q.content || `Câu ${i + 1}`,
          pinyin: q.pinyin || "",
          options: Array.isArray(q.options)
            ? q.options.map((o: any) => ({ id: o.id, text: o.text || "" }))
            : [],
          correctAnswer: q.correctAnswer || "A",
          explanation: q.explanation || "",
          points: Number(q.points) || 2,
          passage: q.passage || "",
        }));
      } else {
        throw new Error("Định dạng file không được hỗ trợ. Vui lòng chọn file .xlsx, .csv, .docx hoặc .json.");
      }

      if (!parsed.length) {
        throw new Error("Không trích xuất được câu hỏi nào từ file.");
      }

      setParsedRows(parsed);
      setSuccessMsg(`✅ Đã phân tích thành công ${parsed.length} câu hỏi từ tệp "${file.name}"!`);
    } catch (err: any) {
      setError(err.message || "Lỗi khi đọc file.");
      setParsedRows([]);
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 5. Chuyển đổi các câu hỏi đã phân tích sang ExamSectionGroup và nạp vào Editor
  const handleConfirmImport = () => {
    if (!parsedRows.length) return;

    const rawQuestions: ImportedQuestion[] = parsedRows.map((r, idx) => ({
      id: `imported_q_${Date.now()}_${idx + 1}`,
      questionNumber: r.number,
      type: r.options.length === 2 && r.options[0].text === "Đúng" ? "true_false" : "multiple_choice",
      skill: r.skill,
      content: r.content,
      pinyin: r.pinyin,
      options: r.options,
      correctAnswer: r.correctAnswer,
      explanation: r.explanation || "",
      points: r.points,
      passage: r.passage,
    }));

    const groups = unflattenToGroups(rawQuestions, hskLevel);
    onImport(groups, rawQuestions as unknown as QuestionItem[]);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 820,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 22px",
            background: "#27492c",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={18} color="#fde047" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Nhập Đề Thi Tự Động từ Excel & Word (.docx)
              </h2>
              <p style={{ margin: 0, fontSize: 11, color: "#d1fae5" }}>
                AI tự động bóc tách câu hỏi, đáp án A-B-C-D, giải thích và phân nhóm cho cấp HSK {hskLevel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "grid", gap: 16 }}>
          {/* File Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #93c5fd",
              background: "#f0f7ff",
              borderRadius: 16,
              padding: "24px 16px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.docx,.json"
              onChange={handleFileSelected}
              style={{ display: "none" }}
            />
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                background: "#dbeafe",
                color: "#1d4ed8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
              }}
            >
              <Upload size={24} />
            </div>
            <strong style={{ fontSize: 14, color: "#1e3a8a", display: "block" }}>
              {parsing ? "Đang xử lý nội dung..." : "Bấm để chọn file hoặc kéo thả file vào đây"}
            </strong>
            <span style={{ fontSize: 12, color: "#475569", marginTop: 4, display: "block" }}>
              Hỗ trợ file <strong>Excel (.xlsx, .xls, .csv)</strong>, <strong>Word (.docx)</strong> hoặc JSON
            </span>
          </div>

          {/* Quick Template Download */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#f8fafc",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          >
            <span style={{ color: "#334155" }}>
              💡 Chưa có mẫu? Tải file mẫu chuẩn cấu trúc để nhập nhanh:
            </span>
            <button
              type="button"
              onClick={handleDownloadExcelTemplate}
              style={{
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                padding: "5px 10px",
                fontWeight: 600,
                fontSize: 11,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Download size={12} /> Tải file Excel mẫu (.xlsx)
            </button>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Preview Parsed Rows */}
          {parsedRows.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <strong style={{ fontSize: 13, color: "#1e293b" }}>
                  📋 Danh sách xem trước ({parsedRows.length} câu hỏi):
                </strong>
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  File: {fileName}
                </span>
              </div>
              <div
                style={{
                  maxHeight: 280,
                  overflowY: "auto",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead style={{ background: "#f1f5f9", position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: "8px 10px", textAlign: "left", width: 45 }}>STT</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", width: 75 }}>Kỹ năng</th>
                      <th style={{ padding: "8px 10px", textAlign: "left" }}>Nội dung câu hỏi chữ Hán</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", width: 140 }}>Các lựa chọn</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", width: 60 }}>Đáp án</th>
                      <th style={{ padding: "8px 10px", textAlign: "right", width: 50 }}>Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((r, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          background: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                        }}
                      >
                        <td style={{ padding: "8px 10px", fontWeight: 700 }}>{r.number}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background:
                                r.skill === "LISTENING"
                                  ? "#e0e7ff"
                                  : r.skill === "READING"
                                  ? "#dcfce7"
                                  : "#fef3c7",
                              color:
                                r.skill === "LISTENING"
                                  ? "#3730a3"
                                  : r.skill === "READING"
                                  ? "#166534"
                                  : "#92400e",
                            }}
                          >
                            {r.skill}
                          </span>
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>{r.content}</div>
                          {r.pinyin && (
                            <div style={{ fontSize: 11, color: "#64748b" }}>{r.pinyin}</div>
                          )}
                          {r.explanation && (
                            <div style={{ fontSize: 11, color: "#059669", marginTop: 2 }}>
                              💡 {r.explanation}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          {r.options.map((opt) => (
                            <div
                              key={opt.id}
                              style={{
                                fontSize: 11,
                                color: opt.id === r.correctAnswer ? "#15803d" : "#475569",
                                fontWeight: opt.id === r.correctAnswer ? 700 : 400,
                              }}
                            >
                              {opt.id}. {opt.text}
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#15803d" }}>
                          {r.correctAnswer}
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "right", color: "#64748b" }}>
                          {r.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "14px 22px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, color: "#64748b" }}>
            {parsedRows.length > 0 ? `Đã sẵn sàng nạp ${parsedRows.length} câu vào bộ đề.` : ""}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={parsedRows.length === 0}
              onClick={handleConfirmImport}
              style={{
                background: parsedRows.length > 0 ? "#15803d" : "#94a3b8",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: parsedRows.length > 0 ? "pointer" : "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              <span>Nạp vào đề thi HSK {hskLevel}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
