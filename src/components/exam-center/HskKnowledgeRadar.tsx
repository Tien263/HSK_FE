"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Radar,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

interface SkillScore {
  name: string;
  key: string;
  score: number; // 0 - 100
  target: number;
  description: string;
  weakTopics: string[];
  recommendation: string;
}

interface HskKnowledgeRadarProps {
  level: number;
  skillsData?: {
    listening?: number;
    reading?: number;
    writing?: number;
    speaking?: number;
    vocabulary?: number;
  };
  totalAttempts?: number;
  averageScore?: number;
  onNavigateToTopic?: (topic: string) => void;
}

export default function HskKnowledgeRadar({
  level,
  skillsData,
  totalAttempts = 5,
  averageScore = 186,
  onNavigateToTopic,
}: HskKnowledgeRadarProps) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>("reading");

  // Chuẩn hóa dữ liệu 5 trục kỹ năng HSK 3.0
  const skills: SkillScore[] = useMemo(() => {
    const l = skillsData?.listening ?? 74;
    const r = skillsData?.reading ?? 62;
    const w = skillsData?.writing ?? 58;
    const s = skillsData?.speaking ?? 68;
    const v = skillsData?.vocabulary ?? 81;

    return [
      {
        name: "Nghe hiểu",
        key: "listening",
        score: Math.min(100, Math.max(0, Math.round(l))),
        target: 80,
        description: "Khả năng bắt từ khóa, liên kết ý và phân biệt thanh điệu ngữ cảnh.",
        weakTopics: [
          "Phân biệt ngữ điệu nghi vấn tu từ",
          "Bắt bẫy từ đồng âm khác nghĩa trong hội thoại nhanh",
          "Số liệu, ngày tháng và đại từ chỉ nơi chốn",
        ],
        recommendation: "Luyện nghe shadow 15 phút mỗi ngày với các đoạn hội thoại HSK " + (level || 3),
      },
      {
        name: "Đọc hiểu",
        key: "reading",
        score: Math.min(100, Math.max(0, Math.round(r))),
        target: 80,
        description: "Tốc độ quét ý, đọc lướt tìm bằng chứng và phân tích mạch logic đoạn văn.",
        weakTopics: [
          "Điền từ vào chỗ trống đoạn văn ngắn (Cloze Passage)",
          "Tìm thông tin suy luận logic không nêu trực tiếp",
          "Phân biệt cặp từ cận nghĩa thường gặp",
        ],
        recommendation: "Tập trung làm nhóm câu hỏi Đọc đoạn văn chọn Đúng/Sai để rèn mắt tìm từ khóa đối chiếu.",
      },
      {
        name: "Viết & Ngữ pháp",
        key: "writing",
        score: Math.min(100, Math.max(0, Math.round(w))),
        target: 75,
        description: "Cấu trúc ngữ pháp chuẩn (把, 被, 比), trật tự trạng ngữ định ngữ và viết chữ Hán.",
        weakTopics: [
          "Sắp xếp thứ tự từ tạo câu hoàn chỉnh (Lián cí chéng jù)",
          "Trật tự bổ ngữ kết quả và bổ ngữ xu hướng",
          "Viết đúng nét chữ Hán hay quên nét",
        ],
        recommendation: "Ghi nhớ công thức câu chữ 把 và các phó từ chỉ thời gian thường đứng trước động từ.",
      },
      {
        name: "Nói HSKK",
        key: "speaking",
        score: Math.min(100, Math.max(0, Math.round(s))),
        target: 75,
        description: "Phát âm thanh điệu, độ trôi chảy, phản xạ trả lời câu hỏi và diễn đạt ý tự nhiên.",
        weakTopics: [
          "Biến điệu của thanh 3 và chữ 一 (Yī), 不 (Bù)",
          "Thời gian ngập ngừng khi mô tả tranh ảnh",
          "Độ dài câu trả lời ngắn dưới yêu cầu bài thi",
        ],
        recommendation: "Sử dụng tính năng 'Chấm thi Nói bằng AI' để luyện đọc to và nhận phản hồi tức thì.",
      },
      {
        name: "Từ vựng & Hán tự",
        key: "vocabulary",
        score: Math.min(100, Math.max(0, Math.round(v))),
        target: 85,
        description: "Khả năng nhận diện mặt chữ, pinyin chuẩn và kết hợp từ (collocations).",
        weakTopics: [
          "Từ đa nghĩa trong ngữ cảnh kinh tế / đời sống",
          "Lượng từ đi kèm danh từ chuyên biệt",
          "Thành ngữ 4 chữ cơ bản (HSK 5-6)",
        ],
        recommendation: "Ôn lại các thẻ từ vựng đã gắn cờ 'Câu sai' trong mục Ôn tập để củng cố trí nhớ dài hạn.",
      },
    ];
  }, [skillsData, level]);

  // Tính xác suất đỗ ước tính (Pass Probability)
  const averageAll = useMemo(() => {
    const sum = skills.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / skills.length);
  }, [skills]);

  const passProbability = useMemo(() => {
    // Thang điểm Hanban 180/300 là đỗ (~60%)
    if (averageAll >= 85) return 96;
    if (averageAll >= 75) return 88;
    if (averageAll >= 65) return 74;
    if (averageAll >= 55) return 56;
    return 38;
  }, [averageAll]);

  // Tính tọa độ Radar SVG đa giác 5 cạnh
  const radarPoints = useMemo(() => {
    const size = 320;
    const center = size / 2;
    const radius = 110;
    const totalAxes = skills.length;

    // Trục góc: bắt đầu từ trên cùng (-90 deg)
    const angleStep = (2 * Math.PI) / totalAxes;

    // Vòng lưới đa giác (20%, 40%, 60%, 80%, 100%)
    const gridLevels = [0.25, 0.5, 0.75, 1.0].map((scale) => {
      return skills
        .map((_, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          const x = center + radius * scale * Math.cos(angle);
          const y = center + radius * scale * Math.sin(angle);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
    });

    // Đường dữ liệu thực tế của học sinh
    const polygonPoints = skills
      .map((skill, i) => {
        const scale = skill.score / 100;
        const angle = -Math.PI / 2 + i * angleStep;
        const x = center + radius * scale * Math.cos(angle);
        const y = center + radius * scale * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    // Điểm nhãn xung quanh
    const labelPoints = skills.map((skill, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = center + (radius + 28) * Math.cos(angle);
      const y = center + (radius + 24) * Math.sin(angle);
      return {
        x,
        y,
        name: skill.name,
        score: skill.score,
        key: skill.key,
      };
    });

    return { size, center, gridLevels, polygonPoints, labelPoints };
  }, [skills]);

  const activeSkillObj = skills.find((s) => s.key === selectedSkill) || skills[0];

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        padding: 24,
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        marginTop: 20,
      }}
    >
      {/* Tiêu đề & Tóm tắt nhanh */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: 16,
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "#f0fdf4",
                color: "#166534",
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                border: "1px solid #bbf7d0",
              }}
            >
              <Radar size={14} /> Phân tích chẩn đoán HSK {level || 3}
            </span>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              Dựa trên {totalAttempts} lượt thi gần nhất
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e293b" }}>
            Biểu đồ Radar Năng lực & Lỗ hổng Kiến thức
          </h2>
        </div>

        {/* Thẻ xác suất đỗ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: passProbability >= 70 ? "#f0fdf4" : "#fffbeb",
            border: `1px solid ${passProbability >= 70 ? "#86efac" : "#fde68a"}`,
            padding: "10px 18px",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: passProbability >= 70 ? "#22c55e" : "#f59e0b",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            {passProbability}%
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
              Xác suất đạt HSK chuẩn
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: passProbability >= 70 ? "#15803d" : "#b45309",
              }}
            >
              {passProbability >= 80 ? "Sẵn sàng thi đỗ" : passProbability >= 60 ? "Cần củng cố thêm" : "Nguy cơ trượt"}
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 cột: Cột trái Radar SVG, Cột phải Chi tiết Lỗ hổng & Lời khuyên */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          alignItems: "center",
        }}
      >
        {/* Radar SVG Visualizer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            background: "#f8fafc",
            borderRadius: 16,
            padding: "20px 10px",
            border: "1px solid #e2e8f0",
          }}
        >
          <svg
            width={radarPoints.size}
            height={radarPoints.size}
            viewBox={`0 0 ${radarPoints.size} ${radarPoints.size}`}
            style={{ overflow: "visible" }}
          >
            {/* Lưới đa giác nền */}
            {radarPoints.gridLevels.map((pts, idx) => (
              <polygon
                key={idx}
                points={pts}
                fill={idx === 3 ? "#ffffff" : "transparent"}
                stroke="#cbd5e1"
                strokeWidth={idx === 3 ? "1.5" : "1"}
                strokeDasharray={idx < 3 ? "3 3" : undefined}
              />
            ))}

            {/* Các trục nan hoa từ tâm */}
            {skills.map((_, i) => {
              const angle = -Math.PI / 2 + i * ((2 * Math.PI) / skills.length);
              const x = radarPoints.center + 110 * Math.cos(angle);
              const y = radarPoints.center + 110 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={radarPoints.center}
                  y1={radarPoints.center}
                  x2={x}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1.2"
                />
              );
            })}

            {/* Vùng màu dữ liệu năng lực học sinh */}
            <polygon
              points={radarPoints.polygonPoints}
              fill="rgba(34, 197, 94, 0.28)"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Các điểm neo (data points) */}
            {skills.map((skill, i) => {
              const angle = -Math.PI / 2 + i * ((2 * Math.PI) / skills.length);
              const scale = skill.score / 100;
              const x = radarPoints.center + 110 * scale * Math.cos(angle);
              const y = radarPoints.center + 110 * scale * Math.sin(angle);
              const isSelected = skill.key === selectedSkill;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : 4.5}
                  fill={isSelected ? "#15803d" : "#22c55e"}
                  stroke="#ffffff"
                  strokeWidth="2"
                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                  onClick={() => setSelectedSkill(skill.key)}
                />
              );
            })}

            {/* Nhãn xung quanh trục */}
            {radarPoints.labelPoints.map((lbl, idx) => {
              const isSelected = lbl.key === selectedSkill;
              return (
                <text
                  key={idx}
                  x={lbl.x}
                  y={lbl.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: 11,
                    fontWeight: isSelected ? 800 : 600,
                    fill: isSelected ? "#15803d" : "#475569",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedSkill(lbl.key)}
                >
                  {lbl.name} ({lbl.score}%)
                </text>
              );
            })}
          </svg>

          <div style={{ fontSize: 11, color: "#64748b", marginTop: 8, textAlign: "center" }}>
            💡 Nhấp vào một đỉnh kỹ năng hoặc thẻ bên dưới để soi chi tiết lỗ hổng.
          </div>
        </div>

        {/* Cột phải: Bảng chi tiết lỗ hổng và lời khuyên */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Bộ chọn kỹ năng nhanh */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {skills.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelectedSkill(s.key)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: s.key === selectedSkill ? "1px solid #16a34a" : "1px solid #e2e8f0",
                  background: s.key === selectedSkill ? "#f0fdf4" : "#ffffff",
                  color: s.key === selectedSkill ? "#15803d" : "#475569",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>{s.name}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: s.score >= 75 ? "#dcfce7" : "#fee2e2",
                    color: s.score >= 75 ? "#166534" : "#991b1b",
                    padding: "1px 5px",
                    borderRadius: 4,
                  }}
                >
                  {s.score}%
                </span>
              </button>
            ))}
          </div>

          {/* Hộp chi tiết kỹ năng đang xem */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: 18,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                {activeSkillObj.name} · {activeSkillObj.score}/100 điểm
              </h3>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: activeSkillObj.score >= activeSkillObj.target ? "#15803d" : "#ea580c",
                  background: activeSkillObj.score >= activeSkillObj.target ? "#dcfce7" : "#ffedd5",
                  padding: "3px 8px",
                  borderRadius: 6,
                }}
              >
                {activeSkillObj.score >= activeSkillObj.target ? "Đạt chuẩn yêu cầu" : "Dưới ngưỡng an toàn"}
              </span>
            </div>

            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#475569" }}>
              {activeSkillObj.description}
            </p>

            {/* Danh sách lỗ hổng kiến thức thường mất điểm */}
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#991b1b",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <AlertCircle size={14} /> Các lỗ hổng kiến thức trọng tâm cần vá:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                {activeSkillObj.weakTopics.map((topic, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    <strong>{topic}</strong>
                  </li>
                ))}
              </ul>
            </div>

            {/* Đề xuất hành động thông minh */}
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <Lightbulb size={18} style={{ color: "#2563eb", flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 2 }}>
                  Chiến thuật nâng điểm nhanh:
                </div>
                <div style={{ fontSize: 13, color: "#1e3a8a", lineHeight: 1.5 }}>
                  {activeSkillObj.recommendation}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
