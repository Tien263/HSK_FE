"use client";

import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";
import {
  CLOZE_CODES,
  CLOZE_PASSAGE,
  PASSAGE_CHOICE,
  PASSAGE_JUDGEMENT,
  JUDGEMENT_OPTIONS,
  WORD_BANK,
  isReadingCloze,
  clozeChoice,
  passageParts,
  passageChoiceIssues,
  passageJudgementIssues,
  readingClozeIssues,
  repeatedWordAnswer,
} from "@/lib/reading-cloze";
import { getQuestionNumber, nextQuestionNumber } from "@/lib/question-number";
import type { ExamSectionGroup, QuestionItem, QuestionOption } from "./hsk-sample-templates";
import QuestionNumberInput from "./QuestionNumberInput";
import s from "./ExamCenter.module.css";

type ClozeMode = typeof WORD_BANK | typeof CLOZE_PASSAGE;
export const readingItemId = () => crypto.randomUUID?.() || `cloze_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const emptyOptions = (count: number) => CLOZE_CODES.slice(0, count).map(id => ({ id, text: "", pinyin: "" }));

function newQuestion(points = 2, questionNumber?: number): QuestionItem {
  return { id: readingItemId(), questionNumber, type: "fill_blank", content: "", points, correctAnswer: "", options: [] };
}

function markersOf(passage: string) {
  return passageParts(passage).flatMap(part => part.blankId ? [part.blankId] : []);
}

function nextBlank(passage: string, assigned: Set<string | undefined>) {
  const markers = markersOf(passage);
  const free = markers.find(id => !assigned.has(id));
  if (free) return { blankId: free, passage };
  let number = 1;
  while (assigned.has(`blank${number}`) || markers.includes(`blank${number}`)) number++;
  const blankId = `blank${number}`;
  return { blankId, passage: passage ? `${passage} [${blankId}]` : `[${blankId}]` };
}

export function initializeReadingCloze(group: ExamSectionGroup, mode: ClozeMode, startNumber?: number): Partial<ExamSectionGroup> {
  if (group.groupType === mode) return {};
  const fromCloze = isReadingCloze(group.groupType);
  const questions = group.questions.length ? group.questions : [newQuestion(2, startNumber)];
  if (mode === WORD_BANK) {
    const words = group.groupWords || emptyOptions(6);
    const existingCount = questions.length;
    return {
      groupType: mode, skill: "READING", groupWords: words,
      groupCustom: questions.length > 5 || words.length !== 6,
      questions: [
        ...questions.map((q, i) => ({
          ...q,
          questionNumber: q.questionNumber !== undefined ? q.questionNumber : (startNumber !== undefined ? startNumber + i : undefined),
          correctAnswer: "",
        })),
        ...Array.from({ length: Math.max(0, 5 - existingCount) }, (_, i) =>
          newQuestion(questions[0]?.points ?? 2, startNumber !== undefined ? startNumber + existingCount + i : undefined)
        ),
      ],
    };
  }

  let passage = group.passage || "";
  const assigned = new Set<string>();
  const linkedQuestions = questions.map((q, qIndex) => {
    const next = nextBlank(passage, assigned);
    passage = next.passage;
    assigned.add(next.blankId);
    const keepOptions = (!fromCloze || !!q.blankId) && q.type === "fill_blank" && q.options.length >= 2 && q.options.every(clozeChoice);
    return {
      ...q,
      questionNumber: q.questionNumber !== undefined ? q.questionNumber : (startNumber !== undefined ? startNumber + qIndex : undefined),
      blankId: next.blankId,
      options: keepOptions ? q.options : emptyOptions(4),
      correctAnswer: keepOptions && !fromCloze ? q.correctAnswer : "",
    };
  });
  return { groupType: mode, skill: "READING", questions: linkedQuestions, passage };
}

export default function ReadingClozeEditor({ group, allQuestions, duplicatedNumbers, onChange }: {
  group: ExamSectionGroup;
  allQuestions?: readonly QuestionItem[];
  duplicatedNumbers?: readonly number[];
  onChange: (patch: Partial<ExamSectionGroup>) => void;
}) {
  const bank = group.groupType === WORD_BANK;
  const judgement = group.groupType === PASSAGE_JUDGEMENT;
  const choice = group.groupType === PASSAGE_CHOICE || judgement;
  const words = group.groupWords || [];
  const passage = group.passage || "";
  const canResize = !bank || !!group.groupCustom;
  const standardSize = group.questions.length === 5 && words.length === 6 &&
    CLOZE_CODES.slice(0, 6).every(id => words.some(word => word.id === id));
  const issues = judgement ? passageJudgementIssues(passage, group.questions) : choice ? passageChoiceIssues(passage, group.questions) : readingClozeIssues(bank ? WORD_BANK : CLOZE_PASSAGE, {
    words, passage, custom: group.groupCustom,
  }, group.questions);
  const updateQuestion = (id: string, patch: Partial<QuestionItem>) =>
    onChange({ questions: group.questions.map(q => q.id === id ? { ...q, ...patch } : q) });

  function addQuestion(source?: QuestionItem) {
    const nextNum = nextQuestionNumber(allQuestions || group.questions);
    const question = source
      ? { ...source, id: readingItemId(), questionNo: undefined, questionNumber: nextNum, options: source.options.map(option => ({ ...option })) }
      : newQuestion(group.questions.at(-1)?.points, nextNum);
    if (bank || choice) {
      onChange({ questions: [...group.questions, choice ? {
        ...question, type: judgement ? "true_false" : "multiple_choice",
        options: judgement ? JUDGEMENT_OPTIONS : source ? question.options : emptyOptions(4),
      } : question] });
      return;
    }
    const next = nextBlank(passage, new Set(group.questions.map(q => q.blankId)));
    onChange({
      passage: next.passage,
      questions: [...group.questions, { ...question, blankId: next.blankId, options: source ? question.options : emptyOptions(4) }],
    });
  }

  function removeQuestion(question: QuestionItem) {
    const questions = group.questions.filter(item => item.id !== question.id);
    const removeMarker = !bank && !choice && question.blankId && !questions.some(q => q.blankId === question.blankId);
    onChange({ questions, passage: removeMarker ? passage.replaceAll(`[${question.blankId}]`, "") : passage });
  }

  function moveQuestion(index: number, offset: -1 | 1) {
    const questions = [...group.questions];
    [questions[index], questions[index + offset]] = [questions[index + offset], questions[index]];
    onChange({ questions });
  }

  function updateChoices(question: QuestionItem, options: QuestionOption[]) {
    updateQuestion(question.id, {
      options,
      correctAnswer: options.some(option => option.id === question.correctAnswer) ? question.correctAnswer : "",
    });
  }

  return (
    <div className={s.examReadingFields}>
      <section className={s.examGroupCard}>
        {bank ? (
          <>
            <strong>Ngân hàng từ dùng chung</strong>
            <label>Chế độ soạn
              <select value={group.groupCustom ? "custom" : "standard"} onChange={event => onChange({ groupCustom: event.target.value === "custom" })}>
                <option value="standard" disabled={!standardSize}>Đề HSK chuẩn · 5 câu, 6 từ A–F</option>
                <option value="custom">Bài tùy chỉnh</option>
              </select>
            </label>
            {words.map(word => (
              <div key={word.id} className={s.clozeChoiceFields}>
                <label>Từ {word.id}
                  <input lang="zh" value={word.text} onChange={event => onChange({
                    groupWords: words.map(item => item.id === word.id ? { ...item, text: event.target.value } : item),
                  })} />
                </label>
                <label>Pinyin {word.id} (tùy chọn)
                  <input value={word.pinyin || ""} onChange={event => onChange({
                    groupWords: words.map(item => item.id === word.id ? { ...item, pinyin: event.target.value } : item),
                  })} />
                </label>
                {canResize && <button type="button" className={s.secondary} disabled={words.length <= 2} aria-label={`Xóa từ ${word.id}`} onClick={() => onChange({
                  groupWords: words.filter(item => item.id !== word.id),
                  questions: group.questions.map(q => q.correctAnswer === word.id ? { ...q, correctAnswer: "" } : q),
                })}><Trash2 size={14} /></button>}
              </div>
            ))}
            {canResize && <button type="button" className={s.secondary} disabled={words.length === CLOZE_CODES.length} onClick={() => {
              const id = CLOZE_CODES.find(code => !words.some(word => word.id === code));
              if (id) onChange({ groupWords: [...words, { id, text: "" }] });
            }}><Plus size={15} /> Thêm từ</button>}
          </>
        ) : (
          <>
            <strong>Đoạn văn chung</strong>
            <label>Đoạn văn chữ Hán
              <textarea rows={5} lang="zh" value={passage} onChange={event => onChange({ passage: event.target.value })} />
            </label>
            {!choice && <p>Dùng mã [blank1], [blank2]… tại vị trí cần điền. Khi thêm câu, hệ thống dùng mã còn trống trong đoạn văn trước.</p>}
            <label>Pinyin đoạn văn (tùy chọn)
              <textarea rows={2} value={group.passagePinyin || ""} onChange={event => onChange({ passagePinyin: event.target.value })} />
            </label>
            <details>
              <summary>Xem trước đoạn văn</summary>
              <div className={s.clozePassagePreview} lang="zh">
                {choice ? passage : passageParts(passage).map((part, index) => part.blankId
                  ? <mark key={index}>({part.blankId.slice(5)}) ______</mark>
                  : <span key={index}>{part.text}</span>)}
              </div>
            </details>
          </>
        )}
        {issues.map(issue => <p key={issue} className={s.error}>{issue}</p>)}
        {bank && group.groupCustom && repeatedWordAnswer(group.questions) && (
          <p className={s.notice}>Có từ được đặt làm đáp án đúng ở nhiều câu.</p>
        )}
      </section>
      <section className={s.examGroupCard}>
        <strong>{bank ? "Câu cần điền" : judgement ? "Phát biểu Đúng/Sai" : choice ? "Câu hỏi đọc hiểu" : "Lựa chọn cho từng chỗ trống"}</strong>
        {group.questions.map((question, index) => (
          <fieldset key={question.id} className={s.examReplyQuestion}>
            <legend>
              <QuestionNumberInput
                question={question}
                isDuplicate={duplicatedNumbers ? duplicatedNumbers.includes(getQuestionNumber(question)!) : false}
                onChange={questionNumber => updateQuestion(question.id, { questionNumber })}
              />
              {!bank && !choice && <small>Chỗ trống {question.blankId?.slice(5) || index + 1}</small>}
            </legend>
            {bank ? (
              <>
                <label>Câu chữ Hán chứa [blank]
                  <input lang="zh" value={question.content} onChange={event => updateQuestion(question.id, { content: event.target.value })} />
                </label>
                <label>Pinyin câu (tùy chọn)
                  <input value={question.pinyin || ""} onChange={event => updateQuestion(question.id, { pinyin: event.target.value })} />
                </label>
                <div className={s.examPictureAnswers} role="group" aria-label="Chọn từ đúng">
                  {words.map(word => (
                    <label key={word.id}>
                      <input type="radio" name={`answer-${group.id}-${question.id}`} checked={question.correctAnswer === word.id}
                        onChange={() => updateQuestion(question.id, { correctAnswer: word.id })} />
                      {word.id}
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <>
                {choice ? (
                  <>
                    <label>{judgement ? "Phát biểu chữ Hán" : "Câu hỏi chữ Hán"}
                      <input lang="zh" value={question.content} onChange={event => updateQuestion(question.id, { content: event.target.value })} />
                    </label>
                    <label>Pinyin câu (tùy chọn)
                      <input value={question.pinyin || ""} onChange={event => updateQuestion(question.id, { pinyin: event.target.value })} />
                    </label>
                  </>
                ) : (
                  <label>Mã chỗ trống
                    <input placeholder="blank1" value={question.blankId || ""} onChange={event => updateQuestion(question.id, { blankId: event.target.value })} />
                  </label>
                )}
                {!judgement && question.options.map(option => (
                  <div className={s.clozeChoiceFields} key={option.id}>
                    <label>Lựa chọn {option.id}
                      <input lang="zh" value={option.text || ""} onChange={event => updateChoices(question, question.options.map(item =>
                        item.id === option.id ? { ...item, text: event.target.value } : item
                      ))} />
                    </label>
                    <label>Pinyin {option.id} (tùy chọn)
                      <input value={option.pinyin || ""} onChange={event => updateChoices(question, question.options.map(item =>
                        item.id === option.id ? { ...item, pinyin: event.target.value } : item
                      ))} />
                    </label>
                    {!choice && <button type="button" className={s.secondary} disabled={question.options.length <= 2}
                      aria-label={`Xóa lựa chọn ${option.id}`}
                      onClick={() => updateChoices(question, question.options.filter(item => item.id !== option.id))}><Trash2 size={14} /></button>}
                  </div>
                ))}
                <div className={s.examPictureAnswers} role="group" aria-label="Chọn đáp án đúng">
                  {(judgement ? JUDGEMENT_OPTIONS : question.options).map(option => (
                    <label key={option.id}>
                      <input type="radio" name={`answer-${group.id}-${question.id}`} checked={question.correctAnswer === option.id}
                        onChange={() => updateQuestion(question.id, { correctAnswer: option.id })} />
                      {judgement ? option.text : option.id}
                    </label>
                  ))}
                </div>
                {!choice && <button type="button" className={s.secondary} disabled={question.options.length >= CLOZE_CODES.length} onClick={() => {
                  const id = CLOZE_CODES.find(code => !question.options.some(option => option.id === code));
                  if (id) updateChoices(question, [...question.options, { id, text: "" }]);
                }}><Plus size={14} /> Thêm lựa chọn</button>}
              </>
            )}
            <label>Điểm
              <input type="number" min={0} step="any" value={question.points} onChange={event => updateQuestion(question.id, { points: Number(event.target.value) })} />
            </label>
            {judgement && <label>Căn cứ trong đoạn văn (tùy chọn)
              <textarea rows={2} lang="zh" placeholder="Trích nguyên văn câu hoặc cụm từ làm căn cứ"
                value={question.evidence || ""} onChange={event => updateQuestion(question.id, { evidence: event.target.value })} />
            </label>}
            <label>{judgement ? "Giải thích đáp án (tùy chọn)" : "Giải thích ngữ pháp hoặc ngữ cảnh (tùy chọn)"}
              <textarea rows={2} value={question.explanation || ""} onChange={event => updateQuestion(question.id, { explanation: event.target.value })} />
            </label>
            {canResize && (
              <div className={s.rowActions}>
                {judgement && <>
                  <button type="button" className={s.secondary} disabled={index === 0} aria-label={`Đưa phát biểu ${index + 1} lên`}
                    onClick={() => moveQuestion(index, -1)}><ChevronUp size={15} /></button>
                  <button type="button" className={s.secondary} disabled={index === group.questions.length - 1} aria-label={`Đưa phát biểu ${index + 1} xuống`}
                    onClick={() => moveQuestion(index, 1)}><ChevronDown size={15} /></button>
                </>}
                <button type="button" className={s.secondary} onClick={() => addQuestion(question)}><Copy size={14} /> Nhân bản</button>
                <button type="button" className={s.secondary} disabled={!judgement && group.questions.length === 1}
                  onClick={() => removeQuestion(question)}><Trash2 size={14} /> Xóa câu</button>
              </div>
            )}
          </fieldset>
        ))}
        {canResize ? (
          <button type="button" className={s.secondary} onClick={() => addQuestion()}><Plus size={15} /> Thêm câu hỏi nhỏ</button>
        ) : (
          <button type="button" className={s.secondary} onClick={() => onChange({
            groupCustom: true,
            questions: [...group.questions, newQuestion(group.questions.at(-1)?.points, nextQuestionNumber(allQuestions || group.questions))],
          })}><Plus size={15} /> Thêm câu hỏi nhỏ (chuyển sang tùy chỉnh)</button>
        )}
      </section>
    </div>
  );
}
