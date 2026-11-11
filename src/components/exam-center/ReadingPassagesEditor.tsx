"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";
import { CLOZE_PASSAGE, CLOZE_SECTION, PASSAGE_CHOICE, PASSAGE_SECTION, PASSAGE_JUDGEMENT, JUDGEMENT_SECTION, JUDGEMENT_OPTIONS, WORD_BANK } from "@/lib/reading-cloze";
import type { ExamSectionGroup, QuestionItem } from "./hsk-sample-templates";
import ReadingClozeEditor, { initializeReadingCloze, readingItemId } from "./ReadingClozeEditor";
import s from "./ExamCenter.module.css";

type SectionType = typeof PASSAGE_SECTION | typeof CLOZE_SECTION | typeof JUDGEMENT_SECTION;
type PassageType = typeof PASSAGE_CHOICE | typeof PASSAGE_JUDGEMENT;

function passageQuestion(mode: PassageType, source?: QuestionItem): QuestionItem {
  const judgement = mode === PASSAGE_JUDGEMENT;
  const options = judgement ? JUDGEMENT_OPTIONS :
    ["A", "B", "C", "D"].map(id => source?.options.find(option => option.id === id) || { id, text: "" });
  return {
    id: source?.id || readingItemId(),
    type: judgement ? "true_false" : "multiple_choice",
    questionNo: source?.questionNo,
    content: source?.content || "",
    pinyin: source?.pinyin,
    points: source?.points ?? 2,
    correctAnswer: options.some(option => option.id === source?.correctAnswer) ? source?.correctAnswer || "" : "",
    explanation: source?.explanation,
    evidence: judgement ? source?.evidence : undefined,
    options,
  };
}

function passageMode(type: SectionType | undefined) {
  if (type === PASSAGE_SECTION) return PASSAGE_CHOICE;
  if (type === JUDGEMENT_SECTION) return PASSAGE_JUDGEMENT;
  return undefined;
}

function newPassage(mode: PassageType | undefined, title: string): ExamSectionGroup {
  const passage: ExamSectionGroup = { id: readingItemId(), title, skill: "READING", questions: [] };
  if (mode) return { ...passage, groupType: mode, questions: [passageQuestion(mode)] };
  return { ...passage, ...initializeReadingCloze(passage, WORD_BANK) };
}

export function initializeReadingSection(group: ExamSectionGroup, type: SectionType, fresh = false): Partial<ExamSectionGroup> {
  if (group.groupType === type) return {};
  const mode = passageMode(type);
  const convert = (passage: ExamSectionGroup): ExamSectionGroup => {
    if (mode) return { ...passage, skill: "READING", groupType: mode, questions: passage.questions.map(q => passageQuestion(mode, q)) };
    if (passage.groupType === WORD_BANK || passage.groupType === CLOZE_PASSAGE) return passage;
    return { ...passage, ...initializeReadingCloze(passage, passage.passage ? CLOZE_PASSAGE : WORD_BANK) };
  };
  if (group.passages?.length) {
    return { groupType: type, skill: "READING", passages: group.passages.map(convert) };
  }
  const passage = newPassage(mode, "Bài 1");
  const first = !fresh && group.questions.length
    ? convert({ ...group, id: passage.id, title: passage.title, instruction: undefined, passages: undefined })
    : passage;
  return { groupType: type, skill: "READING", passages: [first], questions: [] };
}

export default function ReadingPassagesEditor({ section, onChange }: {
  section: ExamSectionGroup;
  onChange: (patch: Partial<ExamSectionGroup>) => void;
}) {
  const passages = section.passages || [];
  const mode = passageMode(section.groupType === PASSAGE_SECTION || section.groupType === JUDGEMENT_SECTION ? section.groupType : undefined);
  const [closed, setClosed] = useState<Set<string>>(() => new Set());
  const update = (id: string, patch: Partial<ExamSectionGroup>) =>
    onChange({ passages: passages.map(passage => passage.id === id ? { ...passage, ...patch } : passage) });

  function move(index: number, offset: -1 | 1) {
    const next = [...passages];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange({ passages: next });
  }

  function duplicate(index: number) {
    const passage = passages[index];
    const copy = {
      ...passage,
      id: readingItemId(),
      title: `${passage.title} (bản sao)`,
      groupWords: passage.groupWords?.map(word => ({ ...word })),
      questions: passage.questions.map(question => ({
        ...question, id: readingItemId(), options: question.options.map(option => ({ ...option })),
      })),
    };
    const next = [...passages];
    next.splice(index + 1, 0, copy);
    onChange({ passages: next });
  }

  return (
    <div className={s.examReadingFields}>
      {!passages.length && <p className={s.notice}>Thêm một bài lớn để hoàn tất phần thi.</p>}
      {passages.map((passage, index) => {
        const expanded = !closed.has(passage.id);
        return (
          <section className={s.examGroupCard} key={passage.id}>
            <div className={s.readingPassageHeader}>
              <button type="button" className={s.readingPassageToggle} aria-expanded={expanded} onClick={() => setClosed(previous => {
                const next = new Set(previous);
                if (next.has(passage.id)) next.delete(passage.id);
                else next.add(passage.id);
                return next;
              })}>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <strong>{passage.title || `Bài ${index + 1}`}</strong>
                <small>{passage.questions.length} câu</small>
              </button>
              <div className={s.rowActions}>
                <button type="button" className={s.secondary} disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Đưa bài ${index + 1} lên`}><ChevronUp size={15} /></button>
                <button type="button" className={s.secondary} disabled={index === passages.length - 1} onClick={() => move(index, 1)} aria-label={`Đưa bài ${index + 1} xuống`}><ChevronDown size={15} /></button>
                <button type="button" className={s.secondary} onClick={() => duplicate(index)}><Copy size={14} /> Nhân bản bài</button>
                <button type="button" className={s.secondary}
                  onClick={() => onChange({ passages: passages.filter(item => item.id !== passage.id) })}><Trash2 size={14} /> Xóa bài</button>
              </div>
            </div>
            {expanded && (
              <>
                <label>Tiêu đề bài lớn
                  <input value={passage.title} onChange={event => update(passage.id, { title: event.target.value })} />
                </label>
                <label>Hướng dẫn riêng (tùy chọn)
                  <input value={passage.instruction || ""} onChange={event => update(passage.id, { instruction: event.target.value })} />
                </label>
                {!mode && (
                  <label>Chế độ của bài lớn
                    <select value={passage.groupType} onChange={event => update(passage.id,
                      initializeReadingCloze(passage, event.target.value === CLOZE_PASSAGE ? CLOZE_PASSAGE : WORD_BANK)
                    )}>
                      <option value={WORD_BANK}>A – Ngân hàng từ chung</option>
                      <option value={CLOZE_PASSAGE}>B – Đoạn văn nhiều chỗ trống</option>
                    </select>
                  </label>
                )}
                <ReadingClozeEditor group={passage} onChange={patch => update(passage.id, patch)} />
              </>
            )}
          </section>
        );
      })}
      <button type="button" className={s.secondary} onClick={() => {
        let number = passages.length + 1;
        while (passages.some(passage => passage.title === `Bài ${number}`)) number++;
        onChange({ passages: [...passages, newPassage(mode, `Bài ${number}`)] });
      }}><Plus size={16} /> Thêm bài lớn</button>
    </div>
  );
}
