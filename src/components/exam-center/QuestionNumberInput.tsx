"use client";

import type { QuestionItem } from "./hsk-sample-templates";
import s from "./ExamCenter.module.css";

export default function QuestionNumberInput({
  question,
  isDuplicate = false,
  onChange,
}: {
  question: QuestionItem;
  isDuplicate?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={`${s.questionNumberField} ${isDuplicate ? s.questionNumberDuplicate : ""}`}
      title={isDuplicate ? "Cảnh báo: Trùng số thứ tự câu hỏi trong đề thi!" : undefined}
    >
      <span>Câu</span>
      <input
        aria-label="Số thứ tự câu hỏi"
        type="number"
        min={1}
        step={1}
        required
        value={question.questionNumber ?? ""}
        onChange={(event) => {
          const val = event.target.value.replace(/^(?:câu|c)\s*/i, "").trim();
          onChange(val);
        }}
        style={
          isDuplicate
            ? {
                borderColor: "#dc2626",
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                fontWeight: 700,
              }
            : undefined
        }
      />
      {isDuplicate && (
        <span
          role="status"
          aria-label="Cảnh báo trùng số câu"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            color: "#dc2626",
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: 4,
            padding: "1px 6px",
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          ⚠️ Trùng số
        </span>
      )}
    </label>
  );
}
