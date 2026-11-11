"use client";

import type { QuestionItem } from "./hsk-sample-templates";
import { countHanzi } from "@/lib/writing-essay";

export default function EssayEditor({
  question,
  onChange,
}: {
  question: QuestionItem;
  onChange: (patch: Partial<QuestionItem>) => void;
}) {
  const passage = (question as any).passage || "";
  const passageHanziCount = countHanzi(passage);

  const essayMin = (question as any).essayMin !== undefined ? Number((question as any).essayMin) : 80;
  const essayMax = (question as any).essayMax !== undefined ? Number((question as any).essayMax) : 400;

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
          📝 Cấu hình: Viết đoạn văn tự luận (Essay Writing ~80–400 chữ)
        </strong>
        <span style={{ fontSize: 11, color: "#64748b" }}>
          HSK 5–6: Học sinh đọc đoạn văn tư liệu và viết bài thu gọn hoặc viết đoạn văn tự luận
        </span>
      </div>

      {/* 1. GIỚI HẠN SỐ LƯỢNG CHỮ HÁN */}
      <div style={{ background: "#ffffff", padding: 12, borderRadius: 10, border: "1px solid #e0ebd3" }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#2b4a27", display: "block", marginBottom: 6 }}>
          1. Yêu cầu độ dài bài viết của học sinh (Số chữ Hán):
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#455d3f" }}>Tối thiểu:</span>
            <input
              type="number"
              min={10}
              max={2000}
              value={essayMin}
              onChange={(e) => onChange({ essayMin: Number(e.target.value) } as any)}
              style={{
                width: 90,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #cbd7c1",
                fontSize: 13,
                fontWeight: 600,
              }}
            />
            <span style={{ fontSize: 12, color: "#455d3f" }}>chữ</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#455d3f" }}>Tối đa:</span>
            <input
              type="number"
              min={10}
              max={3000}
              value={essayMax}
              onChange={(e) => onChange({ essayMax: Number(e.target.value) } as any)}
              style={{
                width: 90,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #cbd7c1",
                fontSize: 13,
                fontWeight: 600,
              }}
            />
            <span style={{ fontSize: 12, color: "#455d3f" }}>chữ</span>
          </div>

          <span style={{ fontSize: 11, color: "#64748b" }}>
            (Phổ biến: HSK 5 khoảng ~80 chữ, HSK 6 viết bài thu gọn khoảng ~400 chữ)
          </span>
        </div>
      </div>

      {/* 2. Ô VĂN BẢN LỚN NHẬP TOÀN BỘ ĐOẠN VĂN LÀM TƯ LIỆU */}
      <div style={{ background: "#ffffff", padding: 12, borderRadius: 10, border: "1px solid #e0ebd3" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#2b4a27", margin: 0 }}>
            📖 2. Đoạn văn ngữ liệu / Đề bài làm tư liệu viết (阅读材料):
          </label>
          <span style={{ fontSize: 12, color: "#32532f", fontWeight: 600 }}>
            Độ dài ngữ liệu: <strong>{passageHanziCount}</strong> chữ Hán
          </span>
        </div>
        <p style={{ fontSize: 11, color: "#5d7a57", margin: "0 0 6px" }}>
          Hỗ trợ văn bản tiếng Trung dài, nhiều đoạn văn, ngắt dòng tự nhiên và đầy đủ dấu câu. Học sinh sẽ vừa đọc ngữ liệu này vừa viết bài trong cùng giao diện.
        </p>
        <textarea
          lang="zh"
          rows={9}
          value={passage}
          onChange={(e) => onChange({ passage: e.target.value } as any)}
          placeholder={`Nhập toàn bộ bài đọc ngữ liệu tiếng Trung tại đây...\n\nVí dụ (HSK 6):\n从前有一只住在深山里的小松鼠，它每天都要去树林里收集各种各样的松果。\n有一天，它在树洞旁发现了一颗特别奇怪的果实……\n\n(Học sinh sẽ dựa vào văn bản này để viết bài thu gọn hoặc nghị luận)`}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1.5px solid #27492c",
            background: "#fcfdfa",
            fontSize: 14,
            lineHeight: 1.8,
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* 3. DÀN Ý / BÀI VĂN MẪU & TIÊU CHÍ CHẤM */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#2b4a27", display: "block", marginBottom: 4 }}>
          3. Dàn ý gợi ý & Bài văn mẫu tham khảo:
        </label>
        <textarea
          rows={5}
          value={question.correctAnswer || ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange({ correctAnswer: val, sampleAnswer: val } as any);
          }}
          placeholder="Ví dụ: Bài văn thu gọn cần đảm bảo:\n1. Nêu được nguồn gốc và bối cảnh câu chuyện.\n2. Tóm tắt trung thực các sự kiện chính theo thứ tự thời gian.\n3. Rút ra bài học hoặc kết luận ở cuối bài.\n\nTham khảo bài mẫu: ..."
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

      {/* 4. BIỂU ĐIỂM & HƯỚNG DẪN CHẤM GIÁO VIÊN */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#2b4a27", display: "block", marginBottom: 4 }}>
          4. Biểu điểm chấm thi (Rubric / Hướng dẫn giáo viên):
        </label>
        <textarea
          rows={3}
          value={question.explanation || ""}
          onChange={(e) => onChange({ explanation: e.target.value })}
          placeholder="Ví dụ: Thang điểm 30 điểm:\n- Ý nghĩa và cấu trúc nội dung: 12 điểm\n- Độ chính xác từ vựng và ngữ pháp: 10 điểm\n- Chữ Hán, dấu câu và trình bày: 8 điểm"
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
    </div>
  );
}
