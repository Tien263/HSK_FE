"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Check, Copy, Languages, LoaderCircle, Sparkles, Volume2 } from "lucide-react";
import type { DictionarySentenceResult } from "@/lib/dictionary-input";
import DictionaryStrokeWriter from "./DictionaryStrokeWriter";
import styles from "./Dictionary.module.css";

export default function DictionarySentencePanel({ text, result, busy, error, onTranslate, onSpeak, onLookUp }: {
  text: string; result: DictionarySentenceResult | null; busy: boolean;
  error: { message: string; status: number } | null;
  onTranslate: () => void; onSpeak: (value: string) => void; onLookUp: (value: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const chineseInput = /\p{Script=Han}/u.test(text);
  const chineseText = result ? (result.targetLanguage === "vi" ? result.sourceText : result.translatedText) : (chineseInput ? text : "");
  const words = useMemo(() => {
    const parts = typeof Intl.Segmenter === "function"
      ? [...new Intl.Segmenter("zh", { granularity: "word" }).segment(chineseText)].map((part) => part.segment)
      : [...chineseText];
    return [...new Set(parts.filter((part) => /\p{Script=Han}/u.test(part)))];
  }, [chineseText]);
  return <div className={styles.sentenceWorkspace}>
    <div className={styles.sentenceToolbar}>
      <span className={styles.sentenceIntro}><Languages size={16} />{chineseInput ? "Tiếng Trung → Tiếng Việt" : "Tiếng Việt → Tiếng Trung"}</span>
      {result ? <span className={styles.tag}><Sparkles size={12} />Dịch theo ngữ cảnh</span> : <button type="button" disabled={busy || !text.trim()} onClick={onTranslate} className={styles.primary}>{busy ? <LoaderCircle size={15} className="animate-spin" /> : <Sparkles size={15} />}{busy ? "Đang dịch…" : "Dịch câu bằng AI"}</button>}
    </div>
    {error && <div role="alert" className={styles.error}>{error.message}{error.status === 401 && <Link href="/login" className="ml-2 font-bold underline">Đăng nhập</Link>}</div>}
    <div className={styles.sentenceGrid}>
      <div className={styles.sentenceMain}>
        {result ? <article aria-live="polite">
          <section className={styles.paper}>
            <div className={styles.wordHeading}><span className={styles.tag}><Languages size={12} />TRA CỨU CÂU</span><span className={styles.eyebrow}>中 · VI</span></div>
            <h3 className={styles.sentenceOriginal} lang={result.targetLanguage === "vi" ? "zh-CN" : "vi"}>{result.sourceText}</h3>
            {result.targetLanguage === "vi" && result.pinyin && <p className={styles.pinyin}>{result.pinyin}</p>}
            <div className={styles.actions}>
              <button onClick={() => onSpeak(chineseText)} className={styles.secondary}><Volume2 size={14} />Phát âm</button>
              <button className={styles.secondary} onClick={async () => { try { await navigator.clipboard.writeText(`${result.sourceText}\n${result.pinyin}\n${result.translatedText}`); setCopied(true); setCopyError(false); } catch { setCopyError(true); } }}>{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Đã sao chép" : "Sao chép"}</button>
            </div>
            {copyError && <p role="status" className={styles.help}>Bạn có thể chọn nội dung bên trên để sao chép.</p>}
          </section>
          <section className={styles.paper}>
            <h4 className={styles.cardTitle}>{result.targetLanguage === "vi" ? "Nghĩa tiếng Việt" : "Bản dịch tiếng Trung"}</h4>
            <p className={styles.sentenceTranslation} lang={result.targetLanguage === "zh" ? "zh-CN" : "vi"}>{result.translatedText}</p>
            {result.targetLanguage === "zh" && result.pinyin && <p className={styles.pinyin}>{result.pinyin}</p>}
            <p className={styles.source}>Bản dịch AI · Nghĩa được dịch theo ngữ cảnh của câu.</p>
          </section>
        </article> : <section className={`${styles.paper} ${styles.sentenceEmpty}`}>
          <span className={styles.tag}><Sparkles size={12} />DỊCH & KHÁM PHÁ</span>
          <div className={styles.emptyCharacters} lang="zh-CN"><span>我</span><span>爱</span><span>你</span></div>
          <h3 className={styles.cardTitle}>Hiểu cả câu, khám phá từng chữ.</h3>
          <p className={styles.muted}>Nhập câu tiếng Trung hoặc tiếng Việt rồi nhấn Enter. Bản dịch, pinyin và các chữ Hán sẽ được trình bày cùng nhau để bạn dễ học và ghi nhớ.</p>
        </section>}
        {words.length > 0 && <section className={styles.paper}>
          <h4 className={styles.cardTitle}>Từ trong câu</h4>
          <div className={styles.tokens}>{words.map((word) => <button key={word} className={styles.token} onClick={() => onLookUp(word)} aria-label={`Tra từ ${word}`}><span lang="zh-CN">{word}</span><ArrowUpRight size={12} /></button>)}</div>
          <p className={styles.help}>Chạm vào một từ để xem nghĩa, cách đọc và âm Hán Việt.</p>
        </section>}
      </div>
      <aside className={styles.sentenceAside}>
        {chineseText && <DictionaryStrokeWriter key={chineseText} word={chineseText} />}
        <div className={styles.landscapeNote}><p>Mỗi chữ một nét,<br />mỗi ngày một hay.</p><small>Học chậm rãi · Nhớ dài lâu</small></div>
      </aside>
    </div>
  </div>;
}
