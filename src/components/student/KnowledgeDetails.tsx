"use client";

import { useState, useMemo } from "react";
import {
  Volume2,
  Mic,
  Sparkles,
  MessageCircle,
  FileText,
  Image as ImageIcon,
  Music,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Compass,
  Layers,
  ArrowRightLeft,
} from "lucide-react";
import type { KnowledgeItem } from "@/lib/self-study-knowledge";
import { cleanChineseForSpeech } from "@/lib/chinese-speech";
import { playChineseSpeech } from "@/lib/chinese-speech-player";
import { normalizePinyinTone, resolveSinoVietnamese, cleanMalformedPinyin } from "@/lib/chinese-sino-vietnamese";
import AiPronunciationModal from "./AiPronunciationModal";
import s from "./SelfStudyLessonDetail.module.css";

// Từ điển nhãn tiếng Việt cho các trường JSON mở rộng
const FIELD_LABELS: Record<string, string> = {
  meaning: "Nghĩa tiếng Việt",
  meaningVi: "Nghĩa tiếng Việt",
  definition: "Định nghĩa",
  usageExplanation: "Cách dùng & Giải thích chi tiết",
  usagePatterns: "Cấu trúc & Mẫu câu",
  examples: "Ví dụ minh họa",
  comparison: "So sánh & Phân biệt",
  comparisonNote: "Ghi chú so sánh",
  commonMistakes: "Lỗi sai thường gặp",
  type: "Từ loại",
  wordType: "Từ loại",
  partOfSpeech: "Từ loại",
  structure: "Cấu trúc ngữ pháp",
  summary: "Tổng quan kiến thức",
  usageSteps: "Các bước áp dụng",
  usageContexts: "Bối cảnh sử dụng",
  example: "Ví dụ minh họa",
  explanation: "Giải thích chi tiết",
  notes: "Lưu ý quan trọng",
  note: "Ghi chú",
  memo: "Mẹo ghi nhớ",
  usage: "Cách sử dụng",
  title: "Tiêu đề",
  titleZh: "Tiêu đề tiếng Trung",
  titleVi: "Tiêu đề tiếng Việt",
  zh: "Tiếng Trung",
  vi: "Nghĩa tiếng Việt",
  py: "Pinyin",
  pinyin: "Pinyin",
  speaker: "Nhân vật",
  lines: "Nội dung hội thoại",
  dialogue: "Nội dung hội thoại",
  contentZh: "Nguyên văn bài đọc (Tiếng Trung)",
  originalText: "Nguyên văn bài đọc",
  contentPy: "Pinyin bài đọc",
  contentVi: "Bản dịch tiếng Việt",
  translation: "Bản dịch tiếng Việt",
  analysisExplanation: "Phân tích đọc hiểu chuyên sâu",
  mainEvent: "Diễn biến chính",
  keywords: "Từ khóa trọng tâm",
  keySentence: "Câu then chốt trong bài",
  evidenceExplanation: "Dẫn chứng & Cơ sở lý luận",
  mainIdea: "Ý chính toàn bài",
  mainIdeaExplanation: "Giải thích ý chính",
  secondaryDetails: "Chi tiết bổ trợ",
  commonTrap: "Bẫy thường gặp trong đề thi",
  readingTip: "Mẹo đọc hiểu nhanh",
  wordCount: "Số lượng từ",
  extraVocabs: "Từ vựng mở rộng",
  extendedVocabulary: "Từ vựng mở rộng",
  hanzi: "Chữ Hán",
  tag: "Phân loại",
  context: "Bối cảnh giao tiếp",
  targetAudience: "Đối tượng giao tiếp",
  naturalExpressions: "Cách nói tự nhiên của người bản xứ",
  politeExpressions: "Cách nói lịch sự, trang trọng",
  cautionNotes: "Lưu ý văn hóa & Ứng xử",
  practiceScenario: "Tình huống thực hành",
  culture: "Kiến thức văn hóa",
  culturalNote: "Văn hóa giao tiếp thực tế",
  rule: "Quy tắc ngữ âm",
  explanationVi: "Giải thích ví dụ",
  desc: "Mô tả bài học",
  durationMin: "Thời lượng dự kiến (phút)",
  grammarExercises: "Bài tập củng cố",
  historyContext: "Bối cảnh lịch sử",
  synonyms: "Từ đồng nghĩa",
  antonyms: "Từ trái nghĩa",
  collocations: "Cụm từ thường gặp",
  examTips: "Mẹo làm bài thi HSK",
  audioUrl: "Tệp âm thanh",
  imageUrl: "Hình ảnh minh họa",
  quiz: "Câu hỏi củng cố",
};

// Các trường hệ thống không hiển thị ở card bổ sung
const SYSTEM_IGNORED_KEYS = new Set([
  "id",
  "number",
  "vocabCount",
  "grammarCount",
  "isUnlockedDefault",
  "unlockedScheduleText",
  "lessonNumber",
  "level",
  "section",
  "kind",
]);

function formatFieldTitle(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isPresent(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

const isRecord = (val: unknown): val is Record<string, unknown> =>
  Boolean(val && typeof val === "object" && !Array.isArray(val));

export function AudioButton({
  text,
  phonetic = false,
  allowPractice = true,
  pinyin,
  meaning,
}: {
  text: string;
  phonetic?: boolean;
  allowPractice?: boolean;
  pinyin?: string;
  meaning?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState("");
  const [showPronounceModal, setShowPronounceModal] = useState(false);

  const play = async (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    setStatus("");
    setIsPlaying(true);
    await playChineseSpeech(text, {
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => {
        setIsPlaying(false);
        setStatus("Chưa phát được âm thanh.");
      },
    });
  };

  const openPractice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPronounceModal(true);
  };

  return (
    <>
      <span className={s.audio}>
        <button
          type="button"
          aria-label={`Nghe ${text}`}
          onClick={play}
          title={`Nghe phát âm chuẩn: ${text}`}
        >
          <Volume2 size={16} className={isPlaying ? "animate-pulse text-emerald-600" : ""} />
        </button>
        {allowPractice && (
          <button
            type="button"
            aria-label={`Luyện phát âm ${text}`}
            onClick={openPractice}
            title="Luyện nói & Chấm điểm phát âm AI"
            className="hover:text-emerald-700 transition"
          >
            <Mic size={14} className="text-[#315E48] hover:text-emerald-700" />
          </button>
        )}
        {status && <small role="status">{status}</small>}
      </span>

      {showPronounceModal && (
        <AiPronunciationModal
          isOpen={showPronounceModal}
          onClose={() => setShowPronounceModal(false)}
          targetText={text}
          pinyin={pinyin}
          meaning={meaning}
        />
      )}
    </>
  );
}

/**
 * Thẻ hiển thị một câu ví dụ chuẩn:
 * Chữ Hán to + Pinyin màu hổ phách + Dịch nghĩa tiếng Việt + Nút loa nghe + Ghi chú giải thích.
 * Tuyệt đối không tách nhỏ thành các card riêng lẻ!
 */
export interface UnifiedExample {
  zh: string;
  pinyin?: string;
  vi?: string;
  speaker?: string;
  explanation?: string;
  extra?: Record<string, unknown>;
}

function UnifiedExampleCard({
  example,
  index,
  phonetic = false,
}: {
  example: UnifiedExample;
  index: number;
  phonetic?: boolean;
}) {
  const cleanPy = normalizePinyinTone(example.pinyin || "");
  return (
    <article className={s.compactExample}>
      <span className={s.exampleIndex}>{index + 1}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {!!example.speaker && <strong className={s.speaker}>{example.speaker}: </strong>}
        {!!example.zh && (
          <p className={s.exampleChinese} lang="zh-CN">
            {example.zh}
          </p>
        )}
        {!!cleanPy && <p className={s.pinyin}>{cleanPy}</p>}
        {!!example.vi && example.vi !== example.zh && (
          <p className={s.exampleMeaning}>{example.vi}</p>
        )}
        {!!example.explanation && (
          <p style={{ fontSize: 11.5, color: "#7a6b47", marginTop: 4, fontStyle: "italic" }}>
            💡 {example.explanation}
          </p>
        )}
        {example.extra && Object.keys(example.extra).length > 0 && (
          <div style={{ marginTop: 6 }}>
            <DynamicFieldRenderer data={example.extra} phonetic={phonetic} />
          </div>
        )}
      </div>
      {!!example.zh && <AudioButton text={example.zh} phonetic={phonetic} />}
    </article>
  );
}

/**
 * Chuẩn hóa và gộp tất cả các nguồn ví dụ của một đối tượng JSON,
 * loại bỏ hoàn toàn việc trùng lặp câu ví dụ đơn và mảng ví dụ.
 */
function extractAndDeduplicateExamples(data: Record<string, unknown>): UnifiedExample[] {
  const list: UnifiedExample[] = [];
  const seenZh = new Set<string>();

  // 1. Duyệt mảng examples
  if (Array.isArray(data.examples)) {
    for (const item of data.examples) {
      if (typeof item === "string" && item.trim()) {
        const trimmed = item.trim();
        if (!seenZh.has(trimmed)) {
          seenZh.add(trimmed);
          list.push({ zh: trimmed, vi: trimmed });
        }
      } else if (isRecord(item)) {
        const zh = String(item.zh || item.chinese || item.hanzi || item.text || "").trim();
        if (zh && !seenZh.has(zh)) {
          seenZh.add(zh);
          const { zh: _z, chinese: _c, hanzi: _h, text: _t, pinyin, py, vi, meaning, meaningVi, speaker, explanation, explanationVi, ...extra } = item;
          list.push({
            zh,
            pinyin: String(pinyin || py || "").trim(),
            vi: String(vi || meaningVi || meaning || "").trim(),
            speaker: speaker ? String(speaker).trim() : undefined,
            explanation: String(explanationVi || explanation || "").trim() || undefined,
            extra,
          });
        }
      }
    }
  }

  // 2. Kiểm tra các trường câu ví dụ đơn lẻ: exampleZh, example, zh
  const singleZh = String(data.exampleZh || data.example || "").trim();
  if (singleZh && !seenZh.has(singleZh)) {
    seenZh.add(singleZh);
    list.push({
      zh: singleZh,
      pinyin: String(data.examplePy || "").trim(),
      vi: String(data.exampleVi || "").trim(),
    });
  }

  return list;
}

/**
 * Giao diện Hội thoại hiển thị 2 bên (Two-Sided Chat UI)
 * - Nhân vật A -> Bong bóng chat bên trái (align left)
 * - Nhân vật B -> Bong bóng chat bên phải (align right)
 * - Nếu có nhân vật thứ 3+ -> Cùng một nhân vật = Luôn cùng một phía nhất quán
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
      return { speaker: spk, zh: rest, pinyin: "", vi: rest, side: undefined, extra: {} };
    }
    if (isRecord(row)) {
      const {
        speaker,
        role,
        name,
        zh,
        chinese,
        text,
        content,
        pinyin,
        py,
        vi,
        meaning,
        meaningVi,
        translation,
        side,
        ...extra
      } = row;
      return {
        speaker: String(speaker || role || name || (idx % 2 === 0 ? "A" : "B")).trim(),
        zh: String(zh || chinese || text || content || "").trim(),
        pinyin: normalizePinyinTone(String(pinyin || py || "").trim()),
        vi: String(vi || meaningVi || meaning || translation || "").trim(),
        side: side === "left" || side === "right" ? (side as "left" | "right") : undefined,
        extra,
      };
    }
    return { speaker: "A", zh: String(row), pinyin: "", vi: String(row), side: undefined, extra: {} };
  });

  // Xác định danh sách nhân vật
  const speakerOrder: string[] = [];
  parsedLines.forEach((l) => {
    if (l.speaker && !speakerOrder.includes(l.speaker)) {
      speakerOrder.push(l.speaker);
    }
  });

  const getSide = (speaker: string, explicitSide?: "left" | "right") => {
    if (explicitSide) return explicitSide;
    const idx = speakerOrder.indexOf(speaker);
    if (idx === -1) return "left";
    return idx % 2 === 0 ? "left" : "right";
  };

  const getInitial = (speaker: string) => {
    const clean = speaker.replace(/^课文\d+\s*·\s*/, "").trim();
    return clean.charAt(0) || "话";
  };

  return (
    <div className={s.chatContainer} role="region" aria-label="Nội dung hội thoại 2 bên">
      {parsedLines.map((line, idx) => {
        const side = getSide(line.speaker, line.side);
        const isLeft = side === "left";

        return (
          <div key={idx} className={`${s.chatRow} ${isLeft ? s.chatRowLeft : s.chatRowRight}`}>
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
                {!!line.pinyin && <p className={s.chatPinyin}>{line.pinyin}</p>}
                {!!line.vi && line.vi !== line.zh && <p className={s.chatMeaning}>{line.vi}</p>}

                {Object.keys(line.extra).length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px dashed rgba(188,155,107,0.3)" }}>
                    <DynamicFieldRenderer data={line.extra} phonetic={phonetic} />
                  </div>
                )}

                {typeof line.zh === "string" && line.zh.trim() && (
                  <div className={s.chatFooter}>
                    <AudioButton text={line.zh} phonetic={phonetic} />
                  </div>
                )}
              </div>
            </div>

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

/**
 * Hiển thị trường dữ liệu bổ sung / tự động nhận diện trường mới từ JSON.
 * Thích ứng theo kiểu dữ liệu (Audio, Image, Array, Object, Chinese text, String).
 */
function DynamicCustomFieldCard({
  fieldKey,
  value,
  phonetic = false,
}: {
  fieldKey: string;
  value: unknown;
  phonetic?: boolean;
}) {
  const title = formatFieldTitle(fieldKey);

  // 1. URL Âm thanh
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

  // 2. URL Hình ảnh
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
    // Mảng chuỗi ngắn -> render dạng tag pills
    if (value.every((v) => typeof v === "string")) {
      return (
        <article className={s.supplementaryCard}>
          <h5>
            <FileText size={14} />
            <span>
              {title} ({value.length})
            </span>
          </h5>
          <div className={s.tagList}>
            {value.map((tag, idx) => (
              <span key={idx}>{tag}</span>
            ))}
          </div>
        </article>
      );
    }

    // Mảng câu ví dụ hoặc từ vựng
    if (value.some((v) => isRecord(v) && (v.zh || v.hanzi || v.speaker))) {
      return (
        <article className={s.supplementaryCard}>
          <h5>
            <FileText size={14} />
            <span>
              {title} ({value.length})
            </span>
          </h5>
          <div className={s.exampleRows}>
            {value.map((v, idx) => {
              if (isRecord(v)) {
                return (
                  <UnifiedExampleCard
                    key={idx}
                    index={idx}
                    example={{
                      zh: String(v.zh || v.hanzi || "").trim(),
                      pinyin: String(v.pinyin || v.py || "").trim(),
                      vi: String(v.vi || v.meaning || v.meaningVi || "").trim(),
                      speaker: v.speaker ? String(v.speaker) : undefined,
                    }}
                    phonetic={phonetic}
                  />
                );
              }
              return <p key={idx} className={s.prose}>{String(v)}</p>;
            })}
          </div>
        </article>
      );
    }

    // Mảng đối tượng tùy ý
    return (
      <article className={s.supplementaryCard}>
        <h5>
          <FileText size={14} />
          <span>
            {title} ({value.length})
          </span>
        </h5>
        <div className={s.fieldList}>
          {value.map((v, idx) => (
            <DynamicFieldRenderer key={idx} data={v} phonetic={phonetic} />
          ))}
        </div>
      </article>
    );
  }

  // 5. Đối tượng lồng nhau
  if (isRecord(value)) {
    return (
      <article className={s.supplementaryCard}>
        <h5>
          <FileText size={14} />
          <span>{title}</span>
        </h5>
        <DynamicFieldRenderer data={value} phonetic={phonetic} />
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

function DynamicFieldRenderer({ data, phonetic = false }: { data: unknown; phonetic?: boolean }) {
  if (!isPresent(data)) return null;
  if (["string", "number", "boolean"].includes(typeof data)) {
    return <p className={s.prose}>{typeof data === "boolean" ? (data ? "Có" : "Không") : String(data)}</p>;
  }
  if (Array.isArray(data)) {
    return (
      <div className={s.fieldList}>
        {data.map((value, index) => (
          <DynamicFieldRenderer key={index} data={value} phonetic={phonetic} />
        ))}
      </div>
    );
  }
  if (!isRecord(data)) return null;

  return (
    <div className={s.fields}>
      {Object.entries(data)
        .filter(([key, value]) => !SYSTEM_IGNORED_KEYS.has(key) && isPresent(value))
        .map(([key, value]) => (
          <DynamicCustomFieldCard key={key} fieldKey={key} value={value} phonetic={phonetic} />
        ))}
    </div>
  );
}

/**
 * 1. BỐ CỤC CHUYÊN BIỆT TỪ VỰNG (Vocab Knowledge View)
 * Gọn gàng, gộp toàn bộ pinyin, Hán Việt, định nghĩa, ví dụ và cụm từ. Không tách card rời.
 */
function VocabKnowledgeView({ data, subtitle }: { data: Record<string, unknown>; subtitle: string }) {
  const hanzi = String(data.hanzi || "").trim();
  const rawPinyin = String(data.pinyin || subtitle || "").trim();
  const cleanPinyin = normalizePinyinTone(rawPinyin);
  const sinoVi = resolveSinoVietnamese(hanzi, cleanPinyin, typeof data.sinoVietnamese === "string" ? data.sinoVietnamese : null);
  const wordType = String(data.type || data.wordType || data.partOfSpeech || "").trim();

  // Gom nghĩa & định nghĩa (chống trùng lặp tuyệt đối)
  const meaning = String(data.meaning || "").trim();
  const meaningVi = String(data.meaningVi || "").trim();
  const definition = String(data.definition || "").trim();
  const finalMeaning = meaningVi || meaning || definition;

  // Gom giải thích cách dùng
  const usageExplanation = String(data.usageExplanation || "").trim();
  const explanation = String(data.explanation || "").trim();
  const memo = String(data.memo || "").trim();
  const finalExplanation = usageExplanation || (explanation !== finalMeaning ? explanation : "") || memo;

  // Mẫu câu / cấu trúc
  const usagePatterns = Array.isArray(data.usagePatterns)
    ? data.usagePatterns
    : typeof data.usagePatterns === "string"
    ? [data.usagePatterns]
    : [];

  // Gom và deduplicate ví dụ minh họa
  const examples = extractAndDeduplicateExamples(data);

  // So sánh & Lỗi sai
  const comparison = String(data.comparison || data.comparisonNote || "").trim();
  const commonMistakes = Array.isArray(data.commonMistakes) ? data.commonMistakes : [];

  // Cụm từ thường gặp
  const collocations = Array.isArray(data.collocations) ? data.collocations : [];

  return (
    <div className={s.knowledge}>
      {/* 1. Khối Nghĩa tiếng Việt & Từ loại */}
      <section className={s.sectionBlock}>
        <div className={s.sectionBlockTitle}>
          <BookOpen size={14} />
          <span>Ý nghĩa & Định nghĩa từ vựng</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <h4 style={{ fontSize: 17, fontWeight: 700, color: "#244d38", margin: 0 }}>
            {finalMeaning}
          </h4>
          <div className={s.badgeList}>
            {!!cleanPinyin && <span className={`${s.badge} ${s.badgePinyin}`}>Pinyin: {cleanPinyin}</span>}
            {!!sinoVi && <span className={`${s.badge} ${s.badgeHanViet}`}>Hán Việt: {sinoVi}</span>}
            {!!wordType && <span className={`${s.badge} ${s.badgeType}`}>{wordType}</span>}
          </div>
        </div>

        {!!finalExplanation && (
          <p className={s.prose} style={{ marginTop: 6, paddingTop: 6, borderTop: "1px dashed #e2d7c0" }}>
            {finalExplanation}
          </p>
        )}
      </section>

      {/* 2. Cấu trúc & Mẫu câu thông dụng (nếu có) */}
      {usagePatterns.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <Compass size={14} />
            <span>Mẫu câu & Cách kết hợp ({usagePatterns.length})</span>
          </div>
          <div className={s.tagList}>
            {usagePatterns.map((pat, idx) => (
              <span key={idx}>{String(pat)}</span>
            ))}
          </div>
        </section>
      )}

      {/* 3. Ví dụ minh họa thống nhất (Gộp toàn bộ tiếng Trung + Pinyin + Dịch nghĩa + Loa) */}
      {examples.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <FileText size={14} />
            <span>Ví dụ minh họa thực tế ({examples.length})</span>
          </div>
          <div className={s.exampleRows}>
            {examples.map((ex, idx) => (
              <UnifiedExampleCard key={idx} example={ex} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Cụm từ thường gặp / Collocations (nếu có) */}
      {collocations.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <Layers size={14} />
            <span>Cụm từ ghép thường gặp ({collocations.length})</span>
          </div>
          <div className={s.tagList}>
            {collocations.map((c, idx) => {
              if (isRecord(c)) {
                return (
                  <span key={idx} title={String(c.vi || "")}>
                    <strong>{String(c.zh || c.hanzi)}</strong> {c.py ? `(${normalizePinyinTone(String(c.py))})` : ""}: {String(c.vi || "")}
                  </span>
                );
              }
              return <span key={idx}>{String(c)}</span>;
            })}
          </div>
        </section>
      )}

      {/* 5. So sánh & Phân biệt (nếu có) */}
      {!!comparison && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <ArrowRightLeft size={14} />
            <span>So sánh & Phân biệt sắc thái</span>
          </div>
          <p className={s.prose}>{comparison}</p>
        </section>
      )}

      {/* 6. Lỗi sai thường gặp (nếu có) */}
      {commonMistakes.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <AlertTriangle size={14} />
            <span>Lỗi sai thường gặp cần tránh ({commonMistakes.length})</span>
          </div>
          <div className={s.mistakeList}>
            {commonMistakes.map((row, index) => {
              if (isRecord(row)) {
                return (
                  <article className={s.mistake} key={index}>
                    {!!row.incorrect && (
                      <p>
                        <strong>Cách dùng sai: </strong> {String(row.incorrect)}
                      </p>
                    )}
                    {!!row.correct && (
                      <p>
                        <strong>Cách dùng đúng: </strong> {String(row.correct)}
                      </p>
                    )}
                    {!!row.explanation && (
                      <p>
                        <strong>Giải thích: </strong> {String(row.explanation)}
                      </p>
                    )}
                  </article>
                );
              }
              return (
                <article className={s.mistake} key={index}>
                  <p>{String(row)}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * 2. BỐ CỤC CHUYÊN BIỆT NGỮ PHÁP (Grammar Knowledge View)
 * Cấu trúc công thức nổi bật, giải thích cách dùng, ví dụ gộp và bảng lỗi sai.
 */
function GrammarKnowledgeView({ data }: { data: Record<string, unknown> }) {
  const structure = String(data.structure || "").trim();
  const summary = String(data.summary || "").trim();
  const usageExplanation = String(data.usageExplanation || "").trim();
  const explanation = String(data.explanation || "").trim();
  const finalExplanation = usageExplanation || explanation;

  const usageSteps = Array.isArray(data.usageSteps) ? data.usageSteps : [];
  const usageContexts = Array.isArray(data.usageContexts) ? data.usageContexts : [];
  const examples = extractAndDeduplicateExamples(data);
  const comparison = String(data.comparison || data.comparisonNote || "").trim();
  const commonMistakes = Array.isArray(data.commonMistakes) ? data.commonMistakes : [];

  return (
    <div className={s.knowledge}>
      {/* 1. Khối Cấu trúc công thức ngữ pháp nổi bật */}
      {!!structure && (
        <div className={s.formulaCard}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#54784a" }}>
              Công thức ngữ pháp
            </span>
            <div className={s.formulaText} lang="zh-CN">
              {structure}
            </div>
          </div>
          <AudioButton text={structure} />
        </div>
      )}

      {/* 2. Tổng quan & Cách dùng */}
      {(summary || finalExplanation) && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <BookOpen size={14} />
            <span>Cách dùng & Giải thích chi tiết</span>
          </div>
          {!!summary && summary !== finalExplanation && (
            <p style={{ fontWeight: 600, color: "#244d38", fontSize: 13, marginBottom: 4 }}>
              {summary}
            </p>
          )}
          {!!finalExplanation && <p className={s.prose}>{finalExplanation}</p>}
        </section>
      )}

      {/* 3. Các bước áp dụng (nếu có) */}
      {usageSteps.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <Compass size={14} />
            <span>Các bước sử dụng ({usageSteps.length})</span>
          </div>
          <div className={s.stepsList}>
            {usageSteps.map((st, idx) => (
              <div key={idx} className={s.stepItem}>
                <span className={s.stepNumber}>{idx + 1}</span>
                <span>{String(st)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Bối cảnh sử dụng (nếu có) */}
      {usageContexts.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <Lightbulb size={14} />
            <span>Bối cảnh giao tiếp phù hợp</span>
          </div>
          <div className={s.tagList}>
            {usageContexts.map((ctx, idx) => (
              <span key={idx}>{String(ctx)}</span>
            ))}
          </div>
        </section>
      )}

      {/* 5. Ví dụ minh họa thống nhất */}
      {examples.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <FileText size={14} />
            <span>Ví dụ câu minh họa ({examples.length})</span>
          </div>
          <div className={s.exampleRows}>
            {examples.map((ex, idx) => (
              <UnifiedExampleCard key={idx} example={ex} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* 6. So sánh & Phân biệt (nếu có) */}
      {!!comparison && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <ArrowRightLeft size={14} />
            <span>So sánh ngữ pháp</span>
          </div>
          <p className={s.prose}>{comparison}</p>
        </section>
      )}

      {/* 7. Lỗi sai thường gặp */}
      {commonMistakes.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <AlertTriangle size={14} />
            <span>Lỗi sai thường gặp ({commonMistakes.length})</span>
          </div>
          <div className={s.mistakeList}>
            {commonMistakes.map((row, index) => {
              if (isRecord(row)) {
                return (
                  <article className={s.mistake} key={index}>
                    {!!row.incorrect && (
                      <p>
                        <strong>Cách dùng sai: </strong> {String(row.incorrect)}
                      </p>
                    )}
                    {!!row.correct && (
                      <p>
                        <strong>Cách dùng đúng: </strong> {String(row.correct)}
                      </p>
                    )}
                    {!!row.explanation && (
                      <p>
                        <strong>Giải thích: </strong> {String(row.explanation)}
                      </p>
                    )}
                  </article>
                );
              }
              return (
                <article className={s.mistake} key={index}>
                  <p>{String(row)}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * 3. BỐ CỤC CHUYÊN BIỆT HỘI THOẠI (Dialogue Knowledge View)
 * Bong bóng chat 2 bên chuẩn mực (Nhân vật A bên trái, Nhân vật B bên phải).
 */
function DialogueKnowledgeView({ data }: { data: Record<string, unknown> }) {
  const lines = Array.isArray(data.lines)
    ? data.lines
    : Array.isArray(data.dialogue)
    ? data.dialogue
    : [];

  return (
    <div className={s.knowledge}>
      <section className={s.sectionBlock} style={{ padding: "12px 14px" }}>
        <div className={s.sectionBlockTitle}>
          <MessageCircle size={14} />
          <span>Hội thoại giao tiếp 2 chiều ({lines.length} câu)</span>
        </div>
        <DialogueChatView lines={lines} />
      </section>
    </div>
  );
}

/**
 * 4. BỐ CỤC CHUYÊN BIỆT ĐỌC HIỂU (Reading Knowledge View)
 * Bài đọc chữ Hán to có loa phát âm toàn bài, Pinyin có dấu, Bản dịch tiếng Việt, Phân tích chuyên sâu.
 */
function ReadingKnowledgeView({ data }: { data: Record<string, unknown> }) {
  // Gom văn bản tiếng Trung (chống trùng lặp giữa contentZh và originalText)
  const contentZh = String(data.contentZh || data.originalText || "").trim();
  const contentPy = normalizePinyinTone(String(data.contentPy || "").trim());
  const contentVi = String(data.contentVi || data.translation || "").trim();

  const analysisExplanation = String(data.analysisExplanation || "").trim();
  const mainEvent = String(data.mainEvent || "").trim();
  const mainIdea = String(data.mainIdea || "").trim();
  const mainIdeaExplanation = String(data.mainIdeaExplanation || "").trim();
  const keySentence = String(data.keySentence || "").trim();
  const evidenceExplanation = String(data.evidenceExplanation || "").trim();

  const commonTrap = String(data.commonTrap || "").trim();
  const readingTip = String(data.readingTip || "").trim();

  const keywords = Array.isArray(data.keywords) ? data.keywords : [];
  const secondaryDetails = Array.isArray(data.secondaryDetails) ? data.secondaryDetails : [];
  const extraVocabs = Array.isArray(data.extraVocabs) ? data.extraVocabs : [];

  return (
    <div className={s.knowledge}>
      {/* 1. Khối Nguyên văn bài đọc (Chữ Hán + Loa + Pinyin + Dịch nghĩa) */}
      <section className={s.sectionBlock}>
        <div className={s.sectionBlockTitle}>
          <FileText size={14} />
          <span>Văn bản bài đọc & Luyện nghe chuẩn</span>
        </div>

        <div className={s.readingZhBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <p className={s.readingZhText} lang="zh-CN">
              {contentZh}
            </p>
            {!!contentZh && <AudioButton text={contentZh} />}
          </div>

          {!!contentPy && (
            <p className={s.readingPyText}>
              <strong>Pinyin: </strong>
              {contentPy}
            </p>
          )}

          {!!contentVi && (
            <p className={s.readingViText}>
              <strong>Bản dịch tiếng Việt: </strong>
              {contentVi}
            </p>
          )}
        </div>
      </section>

      {/* 2. Phân tích đọc hiểu chuyên sâu (nếu có) */}
      {(analysisExplanation || mainEvent || mainIdea || keySentence) && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <Compass size={14} />
            <span>Phân tích cấu trúc & Ý chính bài đọc</span>
          </div>

          <div className={s.analysisGrid}>
            {!!mainIdea && (
              <div className={s.analysisCard}>
                <strong>💡 Ý chính toàn bài</strong>
                <p>{mainIdea}</p>
                {!!mainIdeaExplanation && (
                  <p style={{ marginTop: 4, fontSize: 11.5, color: "#687a55" }}>{mainIdeaExplanation}</p>
                )}
              </div>
            )}

            {!!mainEvent && (
              <div className={s.analysisCard}>
                <strong>📌 Diễn biến chính</strong>
                <p>{mainEvent}</p>
              </div>
            )}

            {!!keySentence && (
              <div className={s.analysisCard}>
                <strong>🎯 Câu then chốt</strong>
                <p lang="zh-CN" style={{ fontWeight: 600 }}>{keySentence}</p>
                {!!evidenceExplanation && (
                  <p style={{ marginTop: 4, fontSize: 11.5, color: "#687a55" }}>{evidenceExplanation}</p>
                )}
              </div>
            )}

            {!!analysisExplanation && (
              <div className={s.analysisCard} style={{ gridColumn: "1 / -1" }}>
                <strong>📖 Diễn giải sư phạm chi tiết</strong>
                <p>{analysisExplanation}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Mẹo thi & Bẫy thường gặp (nếu có) */}
      {(commonTrap || readingTip) && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <Lightbulb size={14} />
            <span>Chiến thuật thi HSK & Mẹo đọc hiểu</span>
          </div>
          <div className={s.analysisGrid}>
            {!!readingTip && (
              <div className={s.analysisCard} style={{ borderColor: "#a3c293", background: "#f6faf2" }}>
                <strong style={{ color: "#2d5e38" }}>✨ Mẹo đọc hiểu nhanh</strong>
                <p>{readingTip}</p>
              </div>
            )}
            {!!commonTrap && (
              <div className={s.analysisCard} style={{ borderColor: "#e2b8b0", background: "#faf2f0" }}>
                <strong style={{ color: "#a04030" }}>⚠️ Bẫy đề thi cần chú ý</strong>
                <p>{commonTrap}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Từ khóa trọng tâm (keywords) */}
      {keywords.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <BookOpen size={14} />
            <span>Từ khóa then chốt ({keywords.length})</span>
          </div>
          <div className={s.tagList}>
            {keywords.map((kw, idx) => (
              <span key={idx}>{String(kw)}</span>
            ))}
          </div>
        </section>
      )}

      {/* 5. Chi tiết bổ trợ (secondaryDetails) */}
      {secondaryDetails.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <Layers size={14} />
            <span>Chi tiết bổ trợ ({secondaryDetails.length})</span>
          </div>
          <div className={s.stepsList}>
            {secondaryDetails.map((dt, idx) => (
              <div key={idx} className={s.stepItem}>
                <span className={s.stepNumber}>{idx + 1}</span>
                <span>{String(dt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Từ vựng mở rộng trong bài đọc (extraVocabs) */}
      {extraVocabs.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <Sparkles size={14} />
            <span>Từ vựng mở rộng ({extraVocabs.length})</span>
          </div>
          <div className={s.exampleRows}>
            {extraVocabs.map((v, idx) => {
              if (isRecord(v)) {
                return (
                  <UnifiedExampleCard
                    key={idx}
                    index={idx}
                    example={{
                      zh: String(v.hanzi || v.zh || "").trim(),
                      pinyin: String(v.pinyin || v.py || "").trim(),
                      vi: String(v.meaningVi || v.meaning || v.vi || "").trim(),
                    }}
                  />
                );
              }
              return <p key={idx} className={s.prose}>{String(v)}</p>;
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * 5. BỐ CỤC CHUYÊN BIỆT NGỮ ÂM (Phonetics Knowledge View)
 * Quy tắc ngữ âm, Bảng phát âm mẫu (chữ Hán + pinyin, nút loa CHỈ đọc tiếng Trung, không đọc tiếng Việt).
 */
function PhoneticsKnowledgeView({ data }: { data: Record<string, unknown> }) {
  const rule = String(data.rule || data.explanation || "").trim();
  const notes = String(data.notes || data.note || "").trim();
  const rawExamples = Array.isArray(data.examples) ? data.examples : [];

  return (
    <div className={s.knowledge}>
      {/* 1. Quy tắc ngữ âm */}
      {!!rule && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <BookOpen size={14} />
            <span>Quy tắc ngữ âm chuẩn</span>
          </div>
          <p className={s.prose}>{rule}</p>
        </section>
      )}

      {/* 2. Bảng luyện mẫu âm (Nút loa chỉ phát âm tiếng Trung sạch) */}
      {rawExamples.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <Volume2 size={14} />
            <span>Mẫu phát âm thực hành ({rawExamples.length})</span>
          </div>
          <div className={s.exampleRows}>
            {rawExamples.map((item, idx) => {
              const text = typeof item === "string" ? item : isRecord(item) ? String(item.zh || item.pinyin || "") : String(item);
              const cleanSpeech = cleanChineseForSpeech(text);

              return (
                <article key={idx} className={s.compactExample}>
                  <span className={s.exampleIndex}>{idx + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className={s.exampleChinese} lang="zh-CN">
                      {cleanMalformedPinyin(text)}
                    </p>
                    {isRecord(item) && !!item.vi && <p className={s.exampleMeaning}>{cleanMalformedPinyin(String(item.vi))}</p>}
                  </div>
                  {!!cleanSpeech && <AudioButton text={cleanSpeech} phonetic={true} />}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Lưu ý biến điệu (nếu có) */}
      {!!notes && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <Lightbulb size={14} />
            <span>Lưu ý biến điệu</span>
          </div>
          <p className={s.prose}>{notes}</p>
        </section>
      )}
    </div>
  );
}

/**
 * 6. BỐ CỤC CHUYÊN BIỆT VĂN HÓA (Culture Knowledge View)
 * Bối cảnh văn hóa, cách diễn đạt tự nhiên, cách nói lịch sự, lưu ý ứng xử.
 */
function CultureKnowledgeView({ data }: { data: Record<string, unknown> }) {
  const culture = String(data.culture || data.culturalNote || "").trim();
  const historyContext = String(data.historyContext || "").trim();
  const context = String(data.context || "").trim();
  const cautionNotes = Array.isArray(data.cautionNotes)
    ? data.cautionNotes
    : typeof data.cautionNotes === "string"
    ? [data.cautionNotes]
    : [];

  const naturalExpressions = Array.isArray(data.naturalExpressions) ? data.naturalExpressions : [];
  const politeExpressions = Array.isArray(data.politeExpressions) ? data.politeExpressions : [];

  return (
    <div className={s.knowledge}>
      {/* 1. Kiến thức & Bối cảnh văn hóa */}
      {(culture || historyContext || context) && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <Compass size={14} />
            <span>Văn hóa & Đời sống giao tiếp</span>
          </div>
          {!!culture && <p className={s.prose} style={{ whiteSpace: "pre-wrap" }}>{culture}</p>}
          {!!historyContext && (
            <p className={s.prose} style={{ marginTop: 8, fontStyle: "italic", color: "#6a5734" }}>
              🏛️ <strong>Bối cảnh lịch sử:</strong> {historyContext}
            </p>
          )}
          {!!context && (
            <p className={s.prose} style={{ marginTop: 8, color: "#305638" }}>
              🌐 <strong>Bối cảnh thực tế:</strong> {context}
            </p>
          )}
        </section>
      )}

      {/* 2. Cách nói tự nhiên của người bản xứ */}
      {naturalExpressions.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <Sparkles size={14} />
            <span>Cách nói tự nhiên của người bản xứ ({naturalExpressions.length})</span>
          </div>
          <div className={s.exampleRows}>
            {naturalExpressions.map((ex, idx) => (
              <UnifiedExampleCard
                key={idx}
                index={idx}
                example={
                  isRecord(ex)
                    ? {
                        zh: String(ex.zh || ex.hanzi || ""),
                        pinyin: String(ex.pinyin || ex.py || ""),
                        vi: String(ex.vi || ex.meaning || ""),
                      }
                    : { zh: String(ex), vi: String(ex) }
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Cách nói lịch sự, trang trọng */}
      {politeExpressions.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <CheckCircle size={14} />
            <span>Cách nói lịch sự, trang trọng ({politeExpressions.length})</span>
          </div>
          <div className={s.exampleRows}>
            {politeExpressions.map((ex, idx) => (
              <UnifiedExampleCard
                key={idx}
                index={idx}
                example={
                  isRecord(ex)
                    ? {
                        zh: String(ex.zh || ex.hanzi || ""),
                        pinyin: String(ex.pinyin || ex.py || ""),
                        vi: String(ex.vi || ex.meaning || ""),
                      }
                    : { zh: String(ex), vi: String(ex) }
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Lưu ý văn hóa & Ứng xử (cautionNotes) */}
      {cautionNotes.length > 0 && (
        <section className={s.sectionBlock}>
          <div className={s.sectionBlockTitle}>
            <AlertTriangle size={14} />
            <span>Lưu ý văn hóa & Điều cấm kỵ ({cautionNotes.length})</span>
          </div>
          <div className={s.stepsList}>
            {cautionNotes.map((nt, idx) => (
              <div key={idx} className={s.stepItem}>
                <span className={s.stepNumber}>{idx + 1}</span>
                <span>{String(nt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * COMPONENT CHÍNH: KnowledgeDetails
 * Tự động thích ứng toàn bộ dữ liệu JSON (HSK 1 - 6),
 * Gộp các trường liên quan, loại bỏ lặp dữ liệu và tự động nhận diện các trường mới.
 */
export default function KnowledgeDetails({ item }: { item: KnowledgeItem }) {
  const subtitle =
    item.kind === "vocab"
      ? String(item.data.pinyin || item.subtitle || "")
      : item.kind === "reading"
      ? String(item.data.titleVi || item.subtitle || "")
      : item.subtitle || "";

  const cleanSubtitle = normalizePinyinTone(subtitle);
  const rawData: Record<string, unknown> = { ...(item.data || {}) };

  // Xác định tập hợp các trường đã được nhóm vào các View chuyên biệt (để tránh lặp lại ở mục bổ sung)
  const consumedKeys = useMemo(() => {
    const set = new Set<string>([
      ...SYSTEM_IGNORED_KEYS,
      "hanzi",
      "pinyin",
      "sinoVietnamese",
      "meaning",
      "meaningVi",
      "definition",
      "type",
      "wordType",
      "partOfSpeech",
      "usageExplanation",
      "explanation",
      "memo",
      "notes",
      "note",
      "usagePatterns",
      "examples",
      "example",
      "exampleZh",
      "examplePy",
      "exampleVi",
      "collocations",
      "comparison",
      "comparisonNote",
      "commonMistakes",
      "structure",
      "summary",
      "usageSteps",
      "usageContexts",
      "lines",
      "dialogue",
      "dialogueLayout",
      "side",
      "contentZh",
      "originalText",
      "contentPy",
      "contentVi",
      "translation",
      "analysisExplanation",
      "mainEvent",
      "mainIdea",
      "mainIdeaExplanation",
      "keySentence",
      "evidenceExplanation",
      "commonTrap",
      "readingTip",
      "keywords",
      "secondaryDetails",
      "extraVocabs",
      "extendedVocabulary",
      "rule",
      "culture",
      "culturalNote",
      "historyContext",
      "context",
      "cautionNotes",
      "naturalExpressions",
      "politeExpressions",
      "practiceScenario",
      "title",
      "titleZh",
      "titleVi",
      "desc",
      "durationMin",
      "vocabList",
      "grammarList",
      "phonetics",
      "reading",
      "culture_items",
      "contentType",
      "extension",
      "grammarExercises",
    ]);
    return set;
  }, []);

  // Các trường bổ sung mới hoàn toàn xuất hiện trong file JSON chưa được map
  const supplementaryEntries = useMemo(() => {
    return Object.entries(rawData).filter(
      ([key, value]) => !consumedKeys.has(key) && isPresent(value)
    );
  }, [rawData, consumedKeys]);

  return (
    <div className={s.knowledge} data-knowledge-detail={item.id} data-knowledge-kind={item.kind}>
      {/* Tiêu đề mục kiến thức */}
      <header className={s.knowledgeHeading}>
        <div>
          <h3 lang="zh-CN">{item.title}</h3>
          {cleanSubtitle && <p>{cleanSubtitle}</p>}
        </div>
        {item.kind === "vocab" && <AudioButton text={String(item.data.hanzi || item.title)} />}
      </header>

      {/* 1. GIAO DIỆN BỐ CỤC CHUYÊN BIỆT THEO TỪNG KIND ĐÃ ĐƯỢC GỘP CHUẨN */}
      {item.kind === "vocab" && <VocabKnowledgeView data={rawData} subtitle={subtitle} />}
      {item.kind === "grammar" && <GrammarKnowledgeView data={rawData} />}
      {item.kind === "dialogue" && <DialogueKnowledgeView data={rawData} />}
      {item.kind === "reading" && <ReadingKnowledgeView data={rawData} />}
      {item.kind === "phonetics" && <PhoneticsKnowledgeView data={rawData} />}
      {item.kind === "culture" && <CultureKnowledgeView data={rawData} />}
      {item.kind === "lesson" && (
        <div className={s.fields}>
          {Object.entries(rawData)
            .filter(([k, v]) => !SYSTEM_IGNORED_KEYS.has(k) && isPresent(v))
            .map(([k, v]) => (
              <DynamicCustomFieldCard key={k} fieldKey={k} value={v} />
            ))}
        </div>
      )}

      {/* 2. KHU VỰC HIỂN THỊ ĐỘNG TOÀN BỘ CÁC TRƯỜNG DỮ LIỆU MỚI BỔ SUNG TỪ JSON */}
      {supplementaryEntries.length > 0 && (
        <section className={s.supplementarySection} aria-label="Nội dung bổ sung từ JSON">
          <div className={s.supplementaryHeading}>
            <Sparkles size={16} />
            <span>Nội dung bổ sung & Dữ liệu mở rộng ({supplementaryEntries.length} mục)</span>
          </div>
          <div className={s.supplementaryGrid}>
            {supplementaryEntries.map(([key, value]) => (
              <DynamicCustomFieldCard
                key={key}
                fieldKey={key}
                value={value}
                phonetic={item.kind === "phonetics"}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
