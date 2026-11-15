import type { ExamSectionGroup } from "./hsk-sample-templates";

const templates = {
  HSKK_BEGINNER: {
    label: "Sơ cấp",
    durationMin: 20,
    sections: [
      ["Nghe rồi nhắc lại (听后重复)", "hskk_listen_repeat"],
      ["Nghe rồi trả lời ngắn (听后回答)", "hskk_listen_answer"],
      ["Trả lời câu hỏi (回答问题)", "hskk_read_prompt"],
    ],
  },
  HSKK_INTERMEDIATE: {
    label: "Trung cấp",
    durationMin: 23,
    sections: [
      ["Nghe rồi nhắc lại (听后重复)", "hskk_listen_repeat"],
      ["Nhìn tranh nói (看图说话)", "hskk_picture_speaking"],
      ["Trả lời câu hỏi (回答问题)", "hskk_read_prompt"],
    ],
  },
  HSKK_ADVANCED: {
    label: "Cao cấp",
    durationMin: 25,
    sections: [
      ["Nghe rồi thuật lại (听后复述)", "hskk_listen_retell"],
      ["Đọc to đoạn văn (朗读)", "hskk_read_prompt"],
      ["Trả lời câu hỏi (回答问题)", "hskk_read_prompt"],
    ],
  },
} as const;

export type HskkLevel = keyof typeof templates;

export function buildHskkTemplate(level: HskkLevel) {
  const { label, durationMin, sections } = templates[level];
  const groups = sections.map(([title, groupType], index): ExamSectionGroup => ({
    id: `${level}_${index + 1}`,
    title: `Phần ${index + 1}. ${title}`,
    skill: "SPEAKING",
    groupType,
    questions: [],
  }));
  return { level, label, durationMin, groups };
}

export function hskkQuestionType(groupType: ExamSectionGroup["groupType"]) {
  if (groupType === "hskk_picture_speaking") return "speaking_picture";
  if (groupType?.startsWith("hskk_listen_")) return "speaking_audio";
  return "speaking_prompt";
}
