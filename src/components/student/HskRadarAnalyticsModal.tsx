"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  TrendingUp,
  Award,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Headphones,
  FileText,
  Mic,
  PenTool,
} from "lucide-react";

interface RadarData {
  student: {
    id: string;
    name: string;
    username: string;
    currentHskLevel: number;
  };
  skills: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
    vocab: number;
  };
  averageScore: number;
  passProbability: number;
  strongestSkill: string;
  weakestSkill: string;
  recommendation: string;
}

interface HskRadarAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentUsername?: string;
  onOpenSpeaking?: () => void;
  onOpenWriting?: () => void;
  onOpenVocab?: () => void;
  onOpenMistakes?: () => void;
}

export default function HskRadarAnalyticsModal({
  isOpen,
  onClose,
  studentId,
  studentUsername,
  onOpenSpeaking,
  onOpenWriting,
  onOpenVocab,
  onOpenMistakes,
}: HskRadarAnalyticsModalProps) {
  const [data, setData] = useState<RadarData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = "";
      if (studentId) query = `studentId=${encodeURIComponent(studentId)}`;
      else if (studentUsername) query = `username=${encodeURIComponent(studentUsername)}`;

      const res = await fetch(`/api/v1/reports/hsk-radar?${query}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [studentId, studentUsername]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  if (!isOpen) return null;

  // Radar chart calculation for 5 points
  // Center: (150, 150), Radius: 100
  const center = 150;
  const radius = 100;
  const numAxes = 5;

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const skillKeys: Array<{ key: keyof RadarData["skills"]; label: string; icon: string }> = [
    { key: "listening", label: "Nghe hiểu", icon: "🎧" },
    { key: "reading", label: "Đọc hiểu", icon: "📖" },
    { key: "writing", label: "Viết/Ngữ pháp", icon: "✍️" },
    { key: "speaking", label: "Khẩu ngữ", icon: "🎙️" },
    { key: "vocab", label: "Từ vựng/Chữ Hán", icon: "🗂️" },
  ];

  const polygonPoints = data
    ? skillKeys
        .map((item, idx) => {
          const val = data.skills[item.key] || 50;
          const { x, y } = getCoordinates(idx, val);
          return `${x},${y}`;
        })
        .join(" ")
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl shadow-inner">
              📊
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Biểu đồ Radar Năng lực 5 Kỹ năng HSK
                {data?.student.currentHskLevel && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                    HSK {data.student.currentHskLevel}
                  </span>
                )}
              </h2>
              <p className="text-xs text-indigo-100">
                Chẩn đoán thực lực toàn diện & Dự đoán xác suất đỗ kỳ thi chuẩn quốc tế
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {loading || !data ? (
            <div className="py-20 text-center text-slate-500">
              <div className="animate-spin text-3xl mb-2">⏳</div>
              <p className="text-sm font-medium">Đang tính toán ma trận năng lực...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pass Probability Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 text-white shadow-lg flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-100">
                      Dự đoán Đỗ HSK {data.student.currentHskLevel}
                    </span>
                    <div className="text-4xl font-black mt-1 flex items-baseline gap-1">
                      {data.passProbability}%
                      <span className="text-sm font-semibold opacity-80">xác suất</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/20 text-xs text-indigo-50">
                    {data.passProbability >= 80 ? (
                      <span className="font-bold flex items-center gap-1">
                        🎉 Sẵn sàng tham gia kỳ thi chính thức!
                      </span>
                    ) : (
                      <span className="font-medium flex items-center gap-1">
                        💪 Cần ôn thêm các phần yếu để chắc chắn đỗ
                      </span>
                    )}
                  </div>
                </div>

                {/* Strongest Skill Card */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Điểm mạnh nhất
                    </span>
                    <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      {data.strongestSkill}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-3">
                    Phát huy phong độ này trong các bài thi thử để kéo điểm tổng!
                  </div>
                </div>

                {/* Weakest Skill Card */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Kỹ năng cần tập trung
                    </span>
                    <div className="text-xl font-bold text-amber-600 mt-1 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      {data.weakestSkill}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-3">
                    Điểm số phần này đang thấp hơn các kỹ năng còn lại.
                  </div>
                </div>
              </div>

              {/* Main Section: Radar Chart + Skill Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm items-center">
                {/* SVG Radar Chart */}
                <div className="flex flex-col items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Mô hình Đa giác Năng lực (Radar Profile)
                  </h3>
                  <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
                    {/* Background concentric circles / webs */}
                    {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                      <circle
                        key={i}
                        cx={center}
                        cy={center}
                        r={radius * scale}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        strokeDasharray={scale === 1 ? undefined : "3 3"}
                      />
                    ))}

                    {/* Axes lines */}
                    {skillKeys.map((_, idx) => {
                      const { x, y } = getCoordinates(idx, 100);
                      return (
                        <line
                          key={idx}
                          x1={center}
                          y1={center}
                          x2={x}
                          y2={y}
                          stroke="#cbd5e1"
                          strokeWidth="1.5"
                        />
                      );
                    })}

                    {/* Data Polygon */}
                    <polygon
                      points={polygonPoints}
                      fill="rgba(99, 102, 241, 0.25)"
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                    />

                    {/* Data Points */}
                    {skillKeys.map((item, idx) => {
                      const val = data.skills[item.key] || 50;
                      const { x, y } = getCoordinates(idx, val);
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#4f46e5"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      );
                    })}

                    {/* Axis Labels */}
                    {skillKeys.map((item, idx) => {
                      const { x, y } = getCoordinates(idx, 118);
                      return (
                        <text
                          key={idx}
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="text-[11px] font-bold fill-slate-700"
                        >
                          {item.icon} {item.label}
                        </text>
                      );
                    })}
                  </svg>
                </div>

                {/* Progress Skill Bars */}
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Chi tiết Chỉ số từng Kỹ năng
                  </h3>

                  {skillKeys.map((item) => {
                    const score = data.skills[item.key] || 0;
                    return (
                      <div key={item.key}>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                          <span className="flex items-center gap-1.5">
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </span>
                          <span className="font-extrabold text-indigo-700">{score}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Strategic Recommendation & Quick Links */}
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-3xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
                    💡
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-indigo-950 mb-1">
                      Lời khuyên Sư phạm Chiến lược từ AI:
                    </h4>
                    <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                      {data.recommendation}
                    </p>

                    {/* Shortcut buttons */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-indigo-200/60">
                      {onOpenSpeaking && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenSpeaking();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-indigo-300 text-indigo-700 text-xs font-bold transition shadow-sm"
                        >
                          🎙️ Luyện Khẩu ngữ AI
                        </button>
                      )}
                      {onOpenWriting && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenWriting();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-indigo-300 text-indigo-700 text-xs font-bold transition shadow-sm"
                        >
                          ✍️ Sửa lỗi Viết AI
                        </button>
                      )}
                      {onOpenVocab && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenVocab();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-indigo-300 text-indigo-700 text-xs font-bold transition shadow-sm"
                        >
                          🗂️ Sổ tay Từ vựng SRS
                        </button>
                      )}
                      {onOpenMistakes && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenMistakes();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-indigo-300 text-indigo-700 text-xs font-bold transition shadow-sm"
                        >
                          🎯 Sổ tay Câu sai
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
