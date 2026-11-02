"use client";

import { useState } from "react";
import { Volume2, Sparkles, MessageCircle, FileText, Image as ImageIcon, Music, HelpCircle } from "lucide-react";
import type { KnowledgeItem } from "@/lib/self-study-knowledge";
import { cleanChineseForSpeech } from "@/lib/chinese-speech";
import s from "./SelfStudyLessonDetail.module.css";

const labels: Record<string, string> = {
  meaning: "Nghĩa tiếng Việt",
  meaningVi: "Nghĩa tiếng Việt",
  usageExplanation: "Cách dùng & Giải thích",
  usagePatterns: "Cấu trúc & Mẫu câu",
  examples: "Ví dụ minh họa",
  comparison: "So sánh & Phân biệt",
  commonMistakes: "Lỗi sai thường gặp",
  type: "Từ loại",
  wordType: "Từ loại",
  exampleZh: "Câu ví dụ",
  examplePy: "Pinyin ví dụ",
  exampleVi: "Dịch ví dụ",
  structure: "Cấu trúc ngữ pháp",
  summary: "Tổng quan",
  usageSteps: "Các bước sử dụng",
  usageContexts: "Bối cảnh sử dụng",
  example: "Ví dụ",
  explanation: "Giải thích chi tiết",
  notes: "Lưu ý quan trọng",
  memo: "Mẹo ghi nhớ",
  usage: "Cách sử dụng",
  title: "Tiêu đề",
  titleZh: "Tiêu đề tiếng Trung",
  titleVi: "Tiêu đề tiếng Việt",
  zh: "Tiếng Trung",
  vi: "Nghĩa tiếng Việt",
  py: "Pinyin",
  pinyin: "Pinyin",
  incorrect: "Cách dùng sai",
  correct: "Cách dùng đúng",
  speaker: "Nhân vật",
  lines: "Nội dung hội thoại",
  dialogue: "Hội thoại",
  contentZh: "Nguyên văn bài đọc (Tiếng Trung)",
  originalText: "Nguyên văn",
  contentPy: "Pinyin bài đọc",
  contentVi: "Bản dịch tiếng Việt",
  translation: "Bản dịch",
  analysisExplanation: "Phân tích đọc hiểu chuyên sâu",
  mainEvent: "Diễn biến chính",
  keywords: "Từ khóa trọng tâm",
  keySentence: "Câu then chốt",
  evidenceExplanation: "Dẫn chứng & Cơ sở lý luận",
  mainIdea: "Ý chính",
  mainIdeaExplanation: "Giải thích ý chính",
  secondaryDetails: "Chi tiết bổ trợ",
  commonTrap: "Bẫy thường gặp trong đề thi",
  readingTip: "Mẹo đọc hiểu nhanh",
  wordCount: "Số lượng từ",
  extraVocabs: "Từ vựng mở rộng",
  hanzi: "Chữ Hán",
  tag: "Phân loại",
  context: "Bối cảnh giao tiếp",
  targetAudience: "Đối tượng giao tiếp",
  naturalExpressions: "Cách nói tự nhiên của người bản xứ",
  politeExpressions: "Cách nói lịch sự, trang trọng",
  cautionNotes: "Lưu ý văn hóa & Ứng xử",
  comparisonNote: "So sánh khẩu ngữ & Văn viết",
  practiceScenario: "Tình huống thực hành",
  note: "Ghi chú",
  culture: "Kiến thức văn hóa",
  culturalNote: "Văn hóa giao tiếp",
  rule: "Quy tắc ngữ âm",
  explanationVi: "Giải thích ví dụ",
  desc: "Mô tả bài học",
  durationMin: "Thời lượng dự kiến (phút)",
  vocabList: "Từ vựng",
  grammarList: "Ngữ pháp",
  phonetics: "Ngữ âm",
  reading: "Đọc hiểu",
  grammarExercises: "Bài tập ngữ pháp",
  historyContext: "Bối cảnh lịch sử",
  synonyms: "Từ đồng nghĩa",
  antonyms: "Từ trái nghĩa",
  collocations: "Cụm từ thường gặp",
  examTips: "Mẹo làm bài thi HSK",
  audioUrl: "Tệp âm thanh bài học",
  imageUrl: "Hình ảnh minh họa",
  quiz: "Câu hỏi củng cố",
};

// Các trường kỹ thuật hệ thống không hiển thị trực tiếp trong card
const hiddenKeys = new Set([
  "id",
  "number",
  "vocabCount",
  "grammarCount",
  "isUnlockedDefault",
  "unlockedScheduleText",
  "lessonNumber",
  "level",
]);

// Danh sách các trường chuẩn đã có vị trí hiển thị riêng
const standardKeys = new Set([
  "meaning",
  "meaningVi",
  "usageExplanation",
  "usagePatterns",
  "examples",
  "comparison",
  "commonMistakes",
  "type",
  "wordType",
  "exampleZh",
  "examplePy",
  "exampleVi",
  "structure",
  "summary",
  "usageSteps",
  "usageContexts",
  "example",
  "explanation",
  "notes",
  "memo",
  "usage",
  "title",
  "titleZh",
  "titleVi",
  "zh",
  "vi",
  "py",
  "pinyin",
  "incorrect",
  "correct",
  "speaker",
  "lines",
  "dialogue",
  "contentZh",
  "originalText",
  "contentPy",
  "contentVi",
  "translation",
  "analysisExplanation",
  "mainEvent",
  "keywords",
  "keySentence",
  "evidenceExplanation",
  "mainIdea",
  "mainIdeaExplanation",
  "secondaryDetails",
  "commonTrap",
  "readingTip",
  "wordCount",
  "extraVocabs",
  "hanzi",
  "tag",
  "context",
  "targetAudience",
  "naturalExpressions",
  "politeExpressions",
  "cautionNotes",
  "comparisonNote",
  "practiceScenario",
  "note",
  "culture",
  "culturalNote",
  "rule",
  "explanationVi",
  "desc",
  "durationMin",
  "vocabList",
  "grammarList",
  "phonetics",
  "reading",
  "grammarExercises",
]);

function formatFieldTitle(key: string): string {
  if (labels[key]) return labels[key];
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AudioButton({ text, phonetic = false }: { text: string; phonetic?: boolean }) {
  const [status, setStatus] = useState("");
  function play() {
    if (!("speechSynthesis" in window)) {
      setStatus("Trình duyệt chưa hỗ trợ phát âm.");
      return;
    }
    const target = phonetic ? cleanChineseForSpeech(text) : text;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(target);
    utterance.lang = "zh-CN";
    utterance.rate = 0.85;
    utterance.onerror = () => setStatus("Chưa phát được âm thanh. Vui lòng thử lại.");
    setStatus("");
    window.speechSynthesis.speak(utterance);
  }
  return (
    <span className={s.audio}>
      <button type="button" aria-label={`Nghe ${text}`} onClick={play}>
        <Volume2 size={17} />
      </button>
      {status && <small role="status">{status}</small>}
    </span>
  );
}

function present(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

/**
 * Giao diện Hội thoại hiển thị 2 bên (Two-Sided Chat UI)
 * - Nhân vật 1 (Speaker A) -> Bong bóng chat bên trái
 * - Nhân vật 2 (Speaker B) -> Bong bóng chat bên phải
 * - Nhân vật 3+ -> Giữ quy tắc: Cùng một nhân vật = Luôn cùng một phía nhất quán
 */
function DialogueChatView({ lines, phonetic = false }: { lines: unknown[]; phonetic?: boolean }) {
  if (!Array.isArray(lines) || lines.length === 0) return null;

  const parsedLines = lines.map((row, idx) => {
    if (typeof row === "string") {
      const text = row.trim();
      const colonIdx = text.search(/[:：]/);
      let spk = idx % 2 === 0 ? "A" : "B";
      let rest = text;
      if (colonIdx > 0 && colonIdx < 15) {
        spk = text.slice(0, colonIdx).trim();
        rest = text.slice(colonIdx + 1).trim();
      }
      return { speaker: spk, zh: rest, pinyin: "", vi: rest, extra: {} };
    }
    if (record(row)) {
      const { speaker, role, name, zh, chinese, text, content, pinyin, py, vi, meaning, meaningVi, translation, ...extra } = row;
      return {
        speaker: String(speaker || role || name || (idx % 2 === 0 ? "A" : "B")).trim(),
        zh: String(zh || chinese || text || content || "").trim(),
        pinyin: String(pinyin || py || "").trim(),
        vi: String(vi || meaningVi || meaning || translation || "").trim(),
        extra,
      };
    }
    return { speaker: "A", zh: String(row), pinyin: "", vi: String(row), extra: {} };
  });

  // Xác định danh sách nhân vật xuất hiện theo thứ tự
  const speakers: string[] = [];
  parsedLines.forEach((l) => {
    if (l.speaker && !speakers.includes(l.speaker)) {
      speakers.push(l.speaker);
    }
  });

  // Phân chia cố định: Nhân vật 1 bên trái, nhân vật 2 bên phải, cùng 1 nhân vật luôn ở cùng 1 bên!
  const getSide = (speaker: string) => {
    const idx = speakers.indexOf(speaker);
    if (idx === -1) return "left";
    return idx % 2 === 0 ? "left" : "right";
  };

  const getInitial = (speaker: string) => {
    return speaker.charAt(0) || "话";
  };

  return (
    <div className={s.chatContainer} role="region" aria-label="Nội dung hội thoại 2 bên">
      {parsedLines.map((line, idx) => {
        const side = getSide(line.speaker);
        const isLeft = side === "left";

        return (
          <div key={idx} className={`${s.chatRow} ${isLeft ? s.chatRowLeft : s.chatRowRight}`}>
            {/* Avatar nhân vật bên trái */}
            {isLeft && (
              <div className={`${s.chatAvatar} ${s.chatAvatarLeft}`} title={line.speaker} aria-hidden="true">
                {getInitial(line.speaker)}
              </div>
            )}

            <div className={s.chatBubbleWrapper}>
              <span className={isLeft ? s.chatSpeakerLabelLeft : s.chatSpeakerLabelRight}>
                {line.speaker}
              </span>

              <div className={`${s.chatBubble} ${isLeft ? s.chatBubbleLeft : s.chatBubbleRight}`}>
                {!!line.zh && (
                  <p className={s.chatChinese} lang="zh-CN">
                    {line.zh}
                  </p>
                )}
                {!!line.pinyin && (
                  <p className={s.chatPinyin}>
                    {line.pinyin}
                  </p>
                )}
                {!!line.vi && line.vi !== line.zh && (
                  <p className={s.chatMeaning}>
                    {line.vi}
                  </p>
                )}

                {/* Dữ liệu mở rộng trong từng câu thoại nếu có */}
                {Object.keys(line.extra).length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px dashed rgba(188,155,107,0.3)" }}>
                    <Fields data={line.extra} phonetic={phonetic} />
                  </div>
                )}

                {/* Loa phát âm từng câu thoại */}
                {typeof line.zh === "string" && line.zh.trim() && (
                  <div className={s.chatFooter}>
                    <AudioButton text={line.zh} phonetic={phonetic} />
                  </div>
                )}
              </div>
            </div>

            {/* Avatar nhân vật bên phải */}
            {!isLeft && (
              <div className={`${s.chatAvatar} ${s.chatAvatarRight}`} title={line.speaker} aria-hidden="true">
                {getInitial(line.speaker)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ExampleRow({ value, index, phonetic }: { value: unknown; index: number; phonetic: boolean }) {
  if (!record(value)) return <p className={s.prose}>{String(value)}</p>;
  const { zh, pinyin, vi, speaker, ...extra } = value;
  return (
    <article className={s.compactExample}>
      <span className={s.exampleIndex}>{index + 1}</span>
      <div>
        {!!speaker && <strong className={s.speaker}>{String(speaker)}</strong>}
        {!!zh && (
          <p className={s.exampleChinese} lang="zh-CN">
            {String(zh)}
          </p>
        )}
        {!!pinyin && <p className={s.pinyin}>{String(pinyin)}</p>}
        {!!vi && vi !== zh && <p className={s.exampleMeaning}>{String(vi)}</p>}
        <Fields data={extra} phonetic={phonetic} />
      </div>
      {typeof zh === "string" && <AudioButton text={zh} phonetic={phonetic} />}
    </article>
  );
}

/**
 * Hiển thị trường dữ liệu bổ sung / động (Dynamic Custom Field Card)
 * Tự động thích ứng theo kiểu dữ liệu (Hình ảnh, Âm thanh, Danh sách, Tiếng Trung, Đối tượng)
 */
function DynamicFieldCard({ fieldKey, value, phonetic }: { fieldKey: string; value: unknown; phonetic: boolean }) {
  const title = formatFieldTitle(fieldKey);

  // 1. Âm thanh URL (audio)
  if (
    typeof value === "string" &&
    (/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(value) || /audio|sound|recording/i.test(fieldKey))
  ) {
    return (
      <article className={s.supplementaryCard}>
        <h5>
          <Music size={14} />
          <span>{title}</span>
        </h5>
        <audio controls src={value} className={s.dynamicMediaAudio} />
      </article>
    );
  }

  // 2. Hình ảnh URL (image)
  if (
    typeof value === "string" &&
    (/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value) || /image|img|pic|photo|diagram|illustration/i.test(fieldKey))
  ) {
    return (
      <article className={s.supplementaryCard}>
        <h5>
          <ImageIcon size={14} />
          <span>{title}</span>
        </h5>
        <img src={value} alt={title} className={s.dynamicMediaImage} loading="lazy" />
      </article>
    );
  }

  // 3. Chuỗi Tiếng Trung
  if (typeof value === "string" && /[\u4e00-\u9fa5]/.test(value) && value.length > 1) {
    return (
      <article className={s.supplementaryCard}>
        <h5>
          <FileText size={14} />
          <span>{title}</span>
        </h5>
        <div className={s.readingText}>
          <p className={s.chinese} lang="zh-CN">
            {value}
          </p>
          <AudioButton text={value} phonetic={phonetic} />
        </div>
      </article>
    );
  }

  // 4. Mảng dữ liệu
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "string")) {
      return (
        <article className={s.supplementaryCard}>
          <h5>
            <FileText size={14} />
            <span>{title} ({value.length})</span>
          </h5>
          <div className={s.tagList}>
            {value.map((tag, idx) => (
              <span key={idx}>{tag}</span>
            ))}
          </div>
        </article>
      );
    }

    if (value.some((v) => record(v) && (v.zh || v.hanzi))) {
      return (
        <article className={s.supplementaryCard}>
          <h5>
            <FileText size={14} />
            <span>{title} ({value.length})</span>
          </h5>
          <div className={s.exampleRows}>
            {value.map((v, idx) => (
              <ExampleRow key={idx} value={v} index={idx} phonetic={phonetic} />
            ))}
          </div>
        </article>
      );
    }

    return (
      <article className={s.supplementaryCard}>
        <h5>
          <FileText size={14} />
          <span>{title} ({value.length})</span>
        </h5>
        <div className={s.fieldList}>
          {value.map((v, idx) => (
            <Fields key={idx} data={v} phonetic={phonetic} />
          ))}
        </div>
      </article>
    );
  }

  // 5. Đối tượng lồng nhau
  if (record(value)) {
    return (
      <article className={s.supplementaryCard}>
        <h5>
          <FileText size={14} />
          <span>{title}</span>
        </h5>
        <Fields data={value} phonetic={phonetic} />
      </article>
    );
  }

  // 6. Kiểu nguyên thủy (string, number, boolean)
  return (
    <article className={s.supplementaryCard}>
      <h5>
        <FileText size={14} />
        <span>{title}</span>
      </h5>
      <p className={s.prose}>
        {typeof value === "boolean" ? (value ? "Có (Đúng)" : "Không") : String(value)}
      </p>
    </article>
  );
}

function Fields({ data, phonetic = false }: { data: unknown; phonetic?: boolean }) {
  if (!present(data)) return null;
  if (["string", "number", "boolean"].includes(typeof data)) {
    return <p className={s.prose}>{typeof data === "boolean" ? (data ? "Có" : "Không") : String(data)}</p>;
  }
  if (Array.isArray(data)) {
    return (
      <div className={s.fieldList}>
        {data.map((value, index) => (
          <Fields key={index} data={value} phonetic={phonetic} />
        ))}
      </div>
    );
  }
  if (!record(data)) return null;

  return (
    <div className={s.fields}>
      {Object.entries(data)
        .filter(([key, value]) => !hiddenKeys.has(key) && present(value))
        .map(([key, value]) => {
          const rows = Array.isArray(value) ? value : [value];

          // 1. Trường hợp hội thoại -> Hiển thị bong bóng chat 2 bên
          if (key === "lines" || key === "dialogue") {
            return (
              <section key={key} className={s.field} data-field={key}>
                <h4>
                  {labels[key] || "Nội dung hội thoại"} <small>({rows.length})</small>
                </h4>
                <DialogueChatView lines={rows} phonetic={phonetic} />
              </section>
            );
          }

          // 2. Trường hợp câu ví dụ, biểu thức ngôn ngữ
          const isExample = ["examples", "naturalExpressions", "politeExpressions"].includes(key);
          if (isExample) {
            return (
              <section key={key} className={s.field} data-field={key}>
                <h4>
                  {labels[key] || formatFieldTitle(key)} <small>({rows.length})</small>
                </h4>
                <div className={s.exampleRows}>
                  {rows.map((row, index) => (
                    <ExampleRow key={index} value={row} index={index} phonetic={phonetic} />
                  ))}
                </div>
              </section>
            );
          }

          // 3. Lỗi sai thường gặp
          if (key === "commonMistakes") {
            return (
              <section key={key} className={s.field} data-field={key}>
                <h4>{labels[key] || "Lỗi sai thường gặp"}</h4>
                <div className={s.mistakeList}>
                  {rows.map((row, index) => (
                    <article className={s.mistake} key={index}>
                      {record(row) ? (
                        <>
                          {!!row.incorrect && (
                            <p>
                              <strong>Cách dùng sai: </strong>
                              {String(row.incorrect)}
                            </p>
                          )}
                          {!!row.correct && (
                            <p>
                              <strong>Cách dùng đúng: </strong>
                              {String(row.correct)}
                            </p>
                          )}
                          {!!row.explanation && (
                            <p>
                              <strong>Giải thích: </strong>
                              {String(row.explanation)}
                            </p>
                          )}
                          <Fields
                            data={Object.fromEntries(
                              Object.entries(row).filter(
                                ([field]) => !["incorrect", "correct", "explanation"].includes(field)
                              )
                            )}
                          />
                        </>
                      ) : (
                        <p>{String(row)}</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          }

          // 4. Danh sách các tag / từ khóa chuỗi đơn thuần
          if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
            return (
              <section key={key} className={s.field} data-field={key}>
                <h4>{labels[key] || formatFieldTitle(key)}</h4>
                <div className={s.tagList}>
                  {value.map((text, index) => (
                    <span key={index}>{text}</span>
                  ))}
                </div>
              </section>
            );
          }

          // 5. Văn bản tiếng Trung đọc hiểu
          if (
            typeof value === "string" &&
            ["zh", "hanzi", "exampleZh", "contentZh", "originalText", "keySentence", "structure"].includes(key)
          ) {
            return (
              <section key={key} className={s.field} data-field={key}>
                <h4>{labels[key] || formatFieldTitle(key)}</h4>
                <div className={s.readingText}>
                  <p className={s.chinese} lang="zh-CN">
                    {value}
                  </p>
                  {["contentZh", "originalText", "zh"].includes(key) && <AudioButton text={value} />}
                </div>
              </section>
            );
          }

          // 6. Trường thông thường khác
          return (
            <section key={key} className={s.field} data-field={key}>
              <h4>{labels[key] || formatFieldTitle(key)}</h4>
              <Fields data={value} phonetic={phonetic} />
            </section>
          );
        })}
    </div>
  );
}

export default function KnowledgeDetails({ item }: { item: KnowledgeItem }) {
  const subtitle =
    item.kind === "vocab"
      ? String(item.data.pinyin || item.subtitle)
      : item.kind === "reading"
      ? String(item.data.titleVi || item.subtitle)
      : item.kind === "dialogue"
      ? item.subtitle
      : "";

  // Sử dụng dữ liệu JSON nguyên bản mà không tự ý xóa, gộp hoặc rút gọn nội dung gốc
  const rawData: Record<string, unknown> = { ...(item.data || {}) };

  // Với từ vựng: hanzi và pinyin đã hiển thị nổi bật ở tiêu đề chính
  if (item.kind === "vocab") {
    delete rawData.hanzi;
    delete rawData.pinyin;
  }

  // Tách biệt giữa các trường chuẩn (đã có thiết kế vị trí) và các trường mở rộng mới từ JSON
  const standardData: Record<string, unknown> = {};
  const supplementaryData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rawData)) {
    if (hiddenKeys.has(key) || !present(value)) continue;

    if (standardKeys.has(key)) {
      standardData[key] = value;
    } else {
      supplementaryData[key] = value;
    }
  }

  const examples = Array.isArray(rawData.examples) ? rawData.examples : [];
  const supplementaryCount = Object.keys(supplementaryData).length;

  return (
    <div className={s.knowledge} data-knowledge-detail={item.id} data-knowledge-kind={item.kind}>
      {/* Tiêu đề mục kiến thức */}
      <header className={s.knowledgeHeading}>
        <div>
          <h3 lang="zh-CN">{item.title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {item.kind === "vocab" && <AudioButton text={String(item.data.hanzi || item.title)} />}
      </header>

      {/* 1. Các trường tiêu chuẩn được đặt đúng vị trí giao diện */}
      <Fields data={standardData} phonetic={item.kind === "phonetics"} />

      {/* 2. KHU VỰC HIỂN THỊ ĐỘNG TOÀN BỘ CÁC TRƯỜNG DỮ LIỆU MỚI TỪ JSON */}
      {supplementaryCount > 0 && (
        <section className={s.supplementarySection} aria-label="Nội dung bổ sung từ JSON">
          <div className={s.supplementaryHeading}>
            <Sparkles size={16} />
            <span>Nội dung bổ sung & Dữ liệu mở rộng ({supplementaryCount} mục)</span>
          </div>
          <div className={s.supplementaryGrid}>
            {Object.entries(supplementaryData).map(([key, value]) => (
              <DynamicFieldCard
                key={key}
                fieldKey={key}
                value={value}
                phonetic={item.kind === "phonetics"}
              />
            ))}
          </div>
        </section>
      )}

      {item.kind === "vocab" && examples.length < 2 && (
        <p className={s.hint}>
          Giáo trình hiện có {examples.length} ví dụ cho từ này; chưa có đủ hai câu ví dụ.
        </p>
      )}
    </div>
  );
}
