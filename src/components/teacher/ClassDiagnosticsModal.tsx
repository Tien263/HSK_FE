"use client";

import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  AlertTriangle,
  X,
  Download,
  Users,
  CheckCircle2,
  TrendingDown,
  HelpCircle,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface ClassDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
}

export default function ClassDiagnosticsModal({
  isOpen,
  onClose,
  classId,
  className,
}: ClassDiagnosticsModalProps) {
  const [activeTab, setActiveTab] = useState<"GRADEBOOK" | "HEATMAP">("GRADEBOOK");
  const [loading, setLoading] = useState(true);
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!classId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/teacher/classes/${classId}/diagnostics`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDiagnosticsData(data);
        }
      }
    } catch (e) {
      console.warn("fetchDiagnostics error:", e);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  // Xuất file Excel (.xlsx) chuẩn
  const exportToExcel = () => {
    if (!diagnosticsData?.gradebookRows) return;

    const rows = diagnosticsData.gradebookRows.map((r: any) => ({
      STT: r.stt,
      "Họ và Tên": r.name,
      Username: r.username,
      Email: r.email,
      "Cấp HSK": `HSK ${r.hskLevel}`,
      "Chuỗi ngày": `${r.streakDays} ngày`,
      "Tổng XP": r.totalXp,
      "Số bài đã nộp": r.completedAttempts,
      "Điểm trung bình": r.avgScore,
      "Xếp loại học lực": r.classification,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bảng điểm");

    // Auto-fit column width
    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 16 },
      { wch: 26 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 15 },
      { wch: 16 },
      { wch: 18 },
    ];

    const fileName = `Bang_Diem_${className.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (!isOpen) return null;

  const rows = diagnosticsData?.gradebookRows || [];
  const heatmap = diagnosticsData?.errorHeatmap || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-4xl rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4 max-h-[92vh] overflow-y-auto animate-scaleUp">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5DEC9] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#204434] text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-6 h-6 text-[#BC9B6B]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#204434]">
                Báo cáo & Chẩn đoán Lớp: {className}
              </h3>
              <p className="text-xs text-[#315E48]">
                Bảng điểm quá trình, bản đồ nhiệt câu hỏi sai & công cụ xuất Excel đào tạo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              disabled={loading || rows.length === 0}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel (.xlsx)</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switcher: Bảng điểm vs Bản đồ nhiệt */}
        <div className="flex items-center gap-2 bg-[#FAF7F0] p-1 rounded-2xl border border-[#E5DEC9]">
          <button
            onClick={() => setActiveTab("GRADEBOOK")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "GRADEBOOK"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Sổ điểm quá trình ({rows.length} học sinh)</span>
          </button>
          <button
            onClick={() => setActiveTab("HEATMAP")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "HEATMAP"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>2. Bản đồ nhiệt câu hỏi sai (Top {heatmap.length} câu)</span>
          </button>
        </div>

        {/* TAB 1: SỔ ĐIỂM QUÁ TRÌNH */}
        {activeTab === "GRADEBOOK" && (
          <div className="space-y-3">
            {loading ? (
              <div className="py-16 text-center text-xs text-[#315E48]">
                Đang tổng hợp dữ liệu điểm của lớp...
              </div>
            ) : rows.length > 0 ? (
              <div className="border border-[#E5DEC9] rounded-2xl overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#FAF7F0] text-[#204434] font-bold border-b border-[#E5DEC9] sticky top-0">
                      <tr>
                        <th className="p-3 w-12 text-center">STT</th>
                        <th className="p-3">Học viên</th>
                        <th className="p-3">Username</th>
                        <th className="p-3 text-center">Cấp độ</th>
                        <th className="p-3 text-center">Chuỗi Streak</th>
                        <th className="p-3 text-center">Bài đã nộp</th>
                        <th className="p-3 text-center">Điểm TB</th>
                        <th className="p-3 text-center">Xếp loại</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DEC9]/60">
                      {rows.map((r: any) => (
                        <tr key={r.studentId} className="hover:bg-[#FAF7F0]/60 transition">
                          <td className="p-3 text-center font-mono font-bold text-[#6B766D]">
                            {r.stt}
                          </td>
                          <td className="p-3 font-semibold text-[#204434]">{r.name}</td>
                          <td className="p-3 font-mono text-[11px] text-[#6B766D]">{r.username}</td>
                          <td className="p-3 text-center font-bold text-[#8F6D3B]">
                            HSK {r.hskLevel}
                          </td>
                          <td className="p-3 text-center font-bold text-orange-600">
                            {r.streakDays} ngày
                          </td>
                          <td className="p-3 text-center font-mono font-bold">{r.completedAttempts}</td>
                          <td className="p-3 text-center font-mono font-bold text-[#204434]">
                            {r.avgScore}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.classification === "Xuất sắc"
                                  ? "bg-purple-100 text-purple-900"
                                  : r.classification === "Giỏi"
                                  ? "bg-emerald-100 text-emerald-900"
                                  : r.classification === "Khá"
                                  ? "bg-blue-100 text-blue-900"
                                  : "bg-amber-100 text-amber-900"
                              }`}
                            >
                              {r.classification}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-[#315E48]">
                Lớp học chưa có học sinh nào tham gia.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BẢN ĐỒ NHIỆT CÂU HỎI SAI */}
        {activeTab === "HEATMAP" && (
          <div className="space-y-3">
            <p className="text-xs text-[#315E48] leading-relaxed">
              Bản đồ nhiệt tự động lọc ra các câu hỏi trắc nghiệm / ngữ pháp mà nhiều học sinh trong lớp làm sai nhất, giúp giáo viên nắm bắt và lên kế hoạch ôn lại trên lớp:
            </p>

            {loading ? (
              <div className="py-16 text-center text-xs text-[#315E48]">
                Đang phân tích các lỗi sai phổ biến...
              </div>
            ) : heatmap.length > 0 ? (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {heatmap.map((item: any, idx: number) => (
                  <div
                    key={item.questionId || idx}
                    className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-rose-700">
                          {item.wrongCount} học sinh làm sai ({item.errorRate}% tỷ lệ sai)
                        </span>
                      </div>
                      <div className="w-24 h-2 rounded-full bg-[#FAF7F0] overflow-hidden border border-[#E5DEC9]">
                        <div
                          className="h-full bg-rose-500"
                          style={{ width: `${Math.min(100, item.errorRate)}%` }}
                        />
                      </div>
                    </div>

                    <p className="font-bold text-sm text-[#204434]">{item.content}</p>

                    <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                      <span>Đáp án đúng: <strong>{item.correctAnswer}</strong></span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    </div>

                    {item.explanation && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-950 space-y-1">
                        <span className="font-bold text-amber-900 block flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Gợi ý giảng giải cho học viên:</span>
                        </span>
                        <p>{item.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#E5DEC9] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-[#204434]">Chưa ghi nhận câu hỏi sai phổ biến</h4>
                <p className="text-xs text-[#315E48]">Các học sinh trong lớp làm bài rất tốt hoặc chưa nộp bài tập mới.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
