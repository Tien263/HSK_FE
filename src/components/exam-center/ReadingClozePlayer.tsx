"use client";

import { useId, useState } from "react";
import type { attemptForOwner } from "@/lib/exam-center-core";
import { passageParts, wordSentenceParts } from "@/lib/reading-cloze";
import s from "./ExamPlayer.module.css";

type Question = ReturnType<typeof attemptForOwner>["questions"][number];

export default function ReadingClozePlayer({ questions, wordBank, answers, finished, disabled, onAnswer }: {
  questions: Question[];
  wordBank: boolean;
  answers: Record<string, string>;
  finished: boolean;
  disabled: boolean;
  onAnswer: (id: string, choice: string) => void;
}) {
  const idPrefix = useId();
  const [highlighted, setHighlighted] = useState<string>();
  const words = questions.find(question => question.groupWords?.length)?.groupWords || [];
  const passage = questions.find(question => question.passage);
  const instruction = questions.find(question => question.groupInstruction)?.groupInstruction;
  const byBlank = new Map(questions.map(question => [question.blankId, question]));
  const fieldId = (id: string) => `${idPrefix}-${id}`;

  function goToChoices(question: Question) {
    setHighlighted(question.id);
    const field = document.getElementById(fieldId(question.id));
    const target = field?.querySelector<HTMLInputElement>("input:checked") || field?.querySelector<HTMLInputElement>("input");
    (disabled || finished ? field : target || field)?.focus({ preventScroll: true });
    field?.scrollIntoView({ block: "nearest" });
  }

  return (
    <section className={s.clozeGroup} aria-label={wordBank ? "Đọc điền từ dùng chung" : "Đoạn văn điền từ"}>
      {instruction && <p>{instruction}</p>}
      {wordBank ? (
        <section className={s.replyBank} aria-label="Ngân hàng từ">
          <h2>Ngân hàng từ</h2>
          <ul>
            {words.map(word => (
              <li key={word.id}>
                <strong>{word.id}</strong>
                <div>
                  <span lang="zh" className={s.matchingSentence}>{word.text}</span>
                  {word.pinyin && <div className={s.matchingPinyin}>{word.pinyin}</div>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className={s.clozePassage}>
          <div className={s.clozeText} lang="zh">
            {passageParts(passage?.passage || "").map((part, index) => {
              if (!part.blankId) return <span key={index}>{part.text}</span>;
              const question = byBlank.get(part.blankId);
              const option = question?.options.find(choice => choice.id === answers[question.id]);
              const number = part.blankId.slice(5);
              return question ? (
                <button key={index} type="button" className={s.clozeBlank}
                  aria-label={`Chỗ trống ${number}${option ? `, đã chọn ${option.text}` : ""}`}
                  aria-controls={fieldId(question.id)} data-highlighted={highlighted === question.id}
                  onClick={() => goToChoices(question)}>
                  <small>({number})</small> {option?.text || "______"}
                </button>
              ) : <span key={index}> ({number}) ______ </span>;
            })}
          </div>
          {passage?.passagePinyin && <p className={s.matchingPinyin}>{passage.passagePinyin}</p>}
        </div>
      )}

      <div className={s.clozeQuestions}>
        {questions.map((question, index) => {
          const options = wordBank ? words : question.options;
          const selected = answers[question.id];
          const selectedWord = wordBank ? words.find(word => word.id === selected) : undefined;
          const correct = finished ? options.find(option => option.id === question.correctAnswer) : undefined;
          const [before, after] = wordSentenceParts(question.content);
          return (
            <fieldset key={question.id} id={fieldId(question.id)} tabIndex={-1} className={s.clozeQuestion}
              data-highlighted={highlighted === question.id} disabled={finished || disabled}>
              <legend>{wordBank ? `Câu ${question.questionNo || index + 1}` : `Chỗ trống (${question.blankId.slice(5)})`}</legend>
              {wordBank && (
                <div className={s.matchingSentence} lang="zh">{before}<span className={s.clozeBlank}>{selectedWord?.text || "______"}</span>{after}</div>
              )}
              {question.pinyin && <p className={s.matchingPinyin}>{question.pinyin}</p>}
              <div className={wordBank ? s.clozeCodes : s.clozeOptions}>
                {options.map(option => (
                  <label key={option.id} data-selected={selected === option.id} data-correct={finished && option.id === question.correctAnswer}>
                    <input type="radio" name={fieldId(question.id)} checked={selected === option.id} onChange={() => {
                      setHighlighted(question.id);
                      onAnswer(question.id, option.id);
                    }} />
                    <strong>{option.id}</strong>
                    {!wordBank && (
                      <span><span lang="zh">{option.text}</span>{option.pinyin && <small className={s.matchingPinyin}> {option.pinyin}</small>}</span>
                    )}
                  </label>
                ))}
              </div>
              {finished && (
                <div className={s.clozeSolution}>
                  {correct && <div><strong>Đáp án đúng</strong> {correct.id} · <span lang="zh">{correct.text}</span>
                    {correct.pinyin && <small className={s.matchingPinyin}> {correct.pinyin}</small>}
                  </div>}
                  {question.result && <p>{question.result.earned}/{question.result.max} điểm</p>}
                  {question.explanation && <p>{question.explanation}</p>}
                </div>
              )}
            </fieldset>
          );
        })}
      </div>
    </section>
  );
}
