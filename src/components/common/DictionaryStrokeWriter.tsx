"use client";

import { useEffect, useRef, useState } from "react";
import { PencilLine, Play, RotateCcw } from "lucide-react";
import type HanziWriter from "hanzi-writer";
import styles from "./Dictionary.module.css";

function CharacterWriter({ character }: { character: string }) {
  const target = useRef<HTMLDivElement>(null);
  const writer = useRef<HanziWriter | null>(null);
  const [error, setError] = useState(false);
  const [strokes, setStrokes] = useState<number | null>(null);
  const [practicing, setPracticing] = useState(false);
  useEffect(() => {
    let active = true;
    const element = target.current;
    const controller = new AbortController();
    import("hanzi-writer").then(({ default: Writer }) => {
      if (!active || !element) return;
      writer.current = Writer.create(element, character, {
        width: 184, height: 184, padding: 15, strokeColor: "#204434", radicalColor: "#9d493e", outlineColor: "#ded8c5",
        charDataLoader: (_char, onComplete, onError) => {
          fetch(`/api/dictionary/strokes/${encodeURIComponent(character)}`, { signal: controller.signal })
            .then((response) => { if (!response.ok) throw new Error("No strokes"); return response.json(); })
            .then((data) => { if (active) { onComplete(data); setStrokes(data.strokes.length); } })
            .catch(() => { if (active) { setError(true); onError(); } });
        },
      });
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; controller.abort(); writer.current?.cancelQuiz(); writer.current = null; element?.replaceChildren(); };
  }, [character]);
  return <>
    <div className={styles.writerGrid} aria-label={`Nét viết chữ ${character}`}><div ref={target} />{error && <span className={styles.writerFallback}>{character}</span>}</div>
    <div className={styles.writerInfo}><span>Chữ <strong lang="zh-CN">{character}</strong></span><span>{error ? "Chưa có dữ liệu nét" : strokes === null ? "Đang tải nét viết…" : `${strokes} nét`}</span></div>
    <div className={styles.writerActions}>
      <button className={styles.secondary} disabled={strokes === null} onClick={() => { writer.current?.cancelQuiz(); setPracticing(false); void writer.current?.animateCharacter(); }}><Play size={12} />Xem nét</button>
      <button className={styles.secondary} disabled={strokes === null} aria-pressed={practicing} onClick={() => {
        if (practicing) { writer.current?.cancelQuiz(); void writer.current?.showCharacter(); setPracticing(false); }
        else { writer.current?.quiz({ onComplete: () => setPracticing(false) }); setPracticing(true); }
      }}>{practicing ? <RotateCcw size={12} /> : <PencilLine size={12} />}{practicing ? "Dừng" : "Tập viết"}</button>
    </div>
    <p className={styles.writerHint}>{practicing ? "Dùng chuột hoặc ngón tay viết theo nét gợi ý." : "Chọn Xem nét để xem thứ tự viết từng nét."}</p>
  </>;
}

export default function DictionaryStrokeWriter({ word }: { word: string }) {
  const characters = [...new Set([...word].filter((character) => /^\p{Script=Han}$/u.test(character)))];
  const [selected, setSelected] = useState(characters[0]);
  const current = characters.includes(selected) ? selected : characters[0];
  if (!current) return null;
  return <section className={styles.writerCard} aria-label="Hán tự và nét viết">
    <h4 className={styles.cardTitle}>Hán tự & nét viết</h4>
    <div className={styles.characterTabs} aria-label="Chọn chữ Hán">{characters.map((character) => <button key={character} className={styles.characterTab} aria-pressed={current === character} aria-label={`Xem chữ ${character}`} onClick={() => setSelected(character)} lang="zh-CN">{character}</button>)}</div>
    <CharacterWriter key={current} character={current} />
  </section>;
}
