"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowUpRight, Bookmark, BookOpen, Check, ChevronRight, Clock3, LoaderCircle, Search, Sparkles, Volume2, X } from "lucide-react";
import type { DictionaryEntry } from "@/lib/dictionary-data";
import type { PublicDictionaryEntry } from "@/lib/dictionary-types";
import DictionaryStrokeWriter from "./DictionaryStrokeWriter";
import DictionarySentencePanel from "./DictionarySentencePanel";
import styles from "./Dictionary.module.css";
import {useDraggableDictionaryLauncher} from "./use-draggable-dictionary-launcher";
import { isDictionarySentence, type DictionarySentenceResult } from "@/lib/dictionary-input";

type ConnectedEntry = DictionaryEntry & { key: string; meaningEn: string[]; meaningsVi: string[]; traditional: string };

type View = "all" | "sentence" | "saved" | "recent";
const STORAGE_KEY = "hsk-dictionary-v2";
const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/\s+/g, "").trim();
const HANZII_URL = "https://hanzii.net/?hl=vi";

function PandaLogo({ size = 48 }: { size?: number }) {
  return <span className="relative block shrink-0 overflow-hidden rounded-2xl bg-[#f7f7f7]" style={{ width: size, height: size }}>
    <Image src="/brand/hanzii.jpg" alt="Logo Hanzii" draggable={false} fill sizes={`${size}px`} className="scale-125 object-cover" />
  </span>;
}

export default function HanziiDictionaryDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedSentenceQuery = query.normalize("NFC").trim().replace(/\s+/g, " ");
  const [view, setView] = useState<View>("all");
  const [forceWordQuery, setForceWordQuery] = useState<string | null>(null);
  const sentenceMode = view === "sentence" || (view === "all" && forceWordQuery !== query && isDictionarySentence(query));
  const activeView = sentenceMode ? "sentence" : view;
  const [sentenceResult, setSentenceResult] = useState<DictionarySentenceResult | null>(null);
  const [sentenceError, setSentenceError] = useState<{ query: string; message: string; status: number } | null>(null);
  const [translatingQuery, setTranslatingQuery] = useState<string | null>(null);
  const sentenceRequestRef = useRef<AbortController | null>(null);
  const lookupQueryRef = useRef<string | null>(null);
  const [entries, setEntries] = useState<ConnectedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const {launcherRef, position, dragging, shouldOpen, handlers: dragHandlers} = useDraggableDictionaryLauncher();
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const launcher = launcherRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 50);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key !== "Tab") return;
      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, [tabindex="0"]') || []).filter((el) => el.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.speechSynthesis?.cancel();
      sentenceRequestRef.current?.abort();
      launcher?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        if (sentenceMode) { setEntries([]); setLoadError(false); return; }
        const ids = view === "saved" ? saved : recent;
        if (view !== "all" && ids.length === 0) { setEntries([]); setHasMore(false); setLoadError(false); return; }
        const params = new URLSearchParams(view === "all" ? { q: query } : { ids: ids.join(",") });
        const response = await fetch(`/api/dictionary/search?${params}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Search failed");
        const data: { items: PublicDictionaryEntry[]; hasMore: boolean } = await response.json();
        if (controller.signal.aborted) return;
        setEntries(data.items.map((entry) => ({
          key: String(entry.id), hanzi: entry.simplified, traditional: entry.traditional, pinyin: entry.pinyin,
          hanViet: entry.characters.filter((part) => part.character.hanViet).map((part) => `${part.traditionalCharacter}: ${part.character.hanViet}`).join(" · "),
          meaningVi: entry.definitionsVi.join("; ") || "Chưa có nghĩa tiếng Việt cho mục từ này.",
          meaningEn: entry.definitionsEn, meaningsVi: entry.definitionsVi, source: "CC-CEDICT · CVDICT · Unihan", examples: [],
        })));
        setHasMore(data.hasMore); setLoadError(false);
        if (lookupQueryRef.current === query) {
          setSelected(data.items[0] ? String(data.items[0].id) : null);
          lookupQueryRef.current = null;
        }
      } catch { if (!controller.signal.aborted) { setEntries([]); setLoadError(true); } }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 200);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [isOpen, query, view, saved, recent, retry, sentenceMode]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const results = useMemo(() => {
    const q = normalize(query);
    const pool = view === "all" ? entries : (view === "saved" ? saved : recent).flatMap((word) => {
      const entry = entries.find((item) => item.key === word);
      return entry ? [entry] : [];
    });
    if (!q || view === "all") return pool;
    return pool.filter((entry) => [entry.hanzi, entry.pinyin, entry.meaningVi, entry.hanViet || ""].some((field) => normalize(field).includes(q)))
      .sort((a, b) => Number(normalize(b.hanzi) === q || normalize(b.pinyin) === q) - Number(normalize(a.hanzi) === q || normalize(a.pinyin) === q));
  }, [entries, query, view, saved, recent]);
  const current = results.find((entry) => entry.key === selected) || results[0];

  async function translateSentence() {
    const text = normalizedSentenceQuery;
    if (!text) return;
    sentenceRequestRef.current?.abort();
    const controller = new AbortController();
    sentenceRequestRef.current = controller;
    setTranslatingQuery(text); setSentenceError(null); setSentenceResult(null);
    try {
      const response = await fetch("/api/dictionary/translate", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({ text }) });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) { setSentenceError({ query: text, message: data.message || "Chưa dịch được câu này.", status: response.status }); return; }
      setSentenceResult(data.translation);
    } catch { if (!controller.signal.aborted) setSentenceError({ query: text, message: "Chưa kết nối được máy chủ dịch câu.", status: 503 }); }
    finally { if (sentenceRequestRef.current === controller) setTranslatingQuery(null); }
  }

  function openDictionary() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (Array.isArray(stored.saved)) setSaved(stored.saved.filter((word: unknown) => typeof word === "string").slice(0, 100));
      if (Array.isArray(stored.recent)) setRecent(stored.recent.filter((word: unknown) => typeof word === "string").slice(0, 20));
    } catch { /* Storage may be unavailable in private browsing. */ }
    setIsOpen(true);
  }

  function persist(nextSaved: string[], nextRecent: string[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ saved: nextSaved, recent: nextRecent })); }
    catch { setNotice("Trình duyệt chưa cho phép lưu lâu dài. Từ vẫn được giữ trong phiên này."); }
  }
  function selectEntry(entry: ConnectedEntry) {
    setSelected(entry.key);
    const next = [entry.key, ...recent.filter((word) => word !== entry.key)].slice(0, 20);
    setRecent(next);
    persist(saved, next);
    detailRef.current?.scrollTo({ top: 0 });
    requestAnimationFrame(() => detailRef.current?.focus({ preventScroll: true }));
  }
  function toggleSaved(entry: ConnectedEntry) {
    const next = saved.includes(entry.key) ? saved.filter((word) => word !== entry.key) : [entry.key, ...saved].slice(0, 100);
    setSaved(next);
    persist(next, recent);
  }
  function speak(text: string) {
    if (!("speechSynthesis" in window)) { setNotice("Trình duyệt này chưa hỗ trợ đọc phát âm."); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.8;
    const voice = window.speechSynthesis.getVoices().find((item) => /^zh(-|_)/i.test(item.lang));
    if (voice) utterance.voice = voice;
    utterance.onerror = (event) => { if (event.error !== "interrupted" && event.error !== "canceled") setNotice("Chưa phát được âm thanh. Hãy kiểm tra giọng đọc tiếng Trung trên thiết bị."); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
  function changeView(next: View) {
    sentenceRequestRef.current?.abort();
    setView(next); setSelected(null); setForceWordQuery(next === "all" ? query : null);
    if (next === "saved" || next === "recent") setQuery("");
  }

  function lookUpWord(word: string) {
    sentenceRequestRef.current?.abort();
    lookupQueryRef.current = word;
    setQuery(word); setForceWordQuery(word); setView("all"); setSelected(null);
  }
  function submitSearch() {
    if (sentenceMode) void translateSentence();
    else { setRetry((value) => value + 1); setSelected(results[0]?.key || null); }
  }

  return <>
    <button ref={launcherRef} {...dragHandlers} onClick={() => { if (shouldOpen()) openDictionary(); }}
      title="Kéo để đổi vị trí · Bấm để mở từ điển · Alt + phím mũi tên để di chuyển"
      style={{...(position ? {left: position.x, top: position.y, right: "auto", bottom: "auto"} : {}), touchAction: "none", userSelect: "none", cursor: dragging ? "grabbing" : "grab"}} aria-haspopup="dialog" aria-expanded={isOpen} aria-label="Mở từ điển Hanzii"
      className="group fixed bottom-20 right-5 z-40 flex items-center gap-3 rounded-[22px] border border-[#E5DEC9] bg-[#FFFCF6] p-2 pr-5 text-[#204434] shadow-[0_8px_36px_#173d2d26] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#315E48] max-sm:bottom-20 max-sm:right-4 max-sm:pr-2">
      <PandaLogo size={48} />
      <span className="text-left max-sm:hidden"><span className="block font-serif text-sm font-bold">Từ điển Trung–Việt</span><span className="mt-0.5 block text-[10px] tracking-wide text-[#7a827b]">Tra một từ · Hiểu một câu</span></span>
    </button>
    {isOpen && createPortal(
      <div className={styles.overlay}>
        <div className={styles.backdrop} onClick={() => setIsOpen(false)} aria-hidden="true" />
        <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="dictionary-title" className={styles.dialog}>
          <header className={styles.hero}>
            <Image src="/theme/dashboard/banner-bg.webp" alt="" fill sizes="1240px" className={styles.landscape} />
            <div className={styles.brand}><PandaLogo size={54} /><div><p className={styles.eyebrow}>Không gian học tiếng Trung</p><h2 id="dictionary-title" className={styles.title}>Từ điển Trung–Việt</h2><p className={styles.subtitle}>Tra một từ, hiểu một câu. Mở thêm một chân trời.</p></div></div>
            <span className={styles.seal} aria-hidden="true">学而时习</span>
            <button onClick={() => setIsOpen(false)} aria-label="Đóng từ điển" className={`${styles.iconButton} ${styles.close}`}><X size={18} /></button>
          </header>
          <div className={styles.searchArea}>
            <label htmlFor="dictionary-search" className="sr-only">Tra từ hoặc dịch câu Trung–Việt</label>
            <form className={styles.searchRow} onSubmit={(event) => { event.preventDefault(); submitSearch(); }}>
              <Search size={20} className="shrink-0 text-[#647d59]" />
              <input ref={searchRef} id="dictionary-search" value={query} onChange={(event) => { sentenceRequestRef.current?.abort(); setQuery(event.target.value); setSelected(null); }} onKeyDown={(event) => { if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault(); }} placeholder="Nhập chữ Hán, pinyin, nghĩa Việt hoặc cả câu…" autoComplete="off" maxLength={500} />
              {query && <button type="button" aria-label="Xóa nội dung tìm kiếm" onClick={() => { sentenceRequestRef.current?.abort(); setQuery(""); setSelected(null); searchRef.current?.focus(); }} className={styles.iconButton}><X size={15} /></button>}
              <button type="submit" className={styles.primary} disabled={sentenceMode && translatingQuery === normalizedSentenceQuery} aria-label={sentenceMode ? "Dịch câu" : "Tra cứu"}>{sentenceMode ? <Sparkles size={15} /> : <Search size={15} />}<span className={styles.searchButtonLabel}>{sentenceMode ? "Dịch câu" : "Tra cứu"}</span></button>
            </form>
            <div className={styles.suggestions}><span>Thử tra</span>{["你好", "学习", "cảm ơn", "我爱你"].map((word) => <button key={word} onClick={() => { sentenceRequestRef.current?.abort(); setQuery(word); setView("all"); setForceWordQuery(null); setSelected(null); }}>{word}</button>)}<span className="ml-auto hidden text-[10px] sm:block">Giản thể · Phồn thể · Pinyin</span></div>
            <nav aria-label="Chọn danh sách từ" className={styles.tabs}>
              {([{ id: "all", label: "Tra từ", icon: BookOpen }, { id: "sentence", label: "Dịch câu", icon: Sparkles }, { id: "saved", label: "Đã lưu", icon: Bookmark }, { id: "recent", label: "Gần đây", icon: Clock3 }] as const).map(({ id, label, icon: Icon }) => <button key={id} onClick={() => changeView(id)} aria-pressed={activeView === id} className={styles.tab}><Icon size={15} />{label}{id === "saved" && saved.length > 0 && <small>{saved.length}</small>}</button>)}
            </nav>
          </div>
          <div aria-live="polite" className="sr-only">{notice || (sentenceMode ? "Chế độ dịch câu" : `${results.length} kết quả`)}</div>
          {notice && <p role="status" className={styles.notice}>{notice}</p>}
          {sentenceMode ? <DictionarySentencePanel key={normalizedSentenceQuery} text={query} result={sentenceResult?.sourceText === normalizedSentenceQuery ? sentenceResult : null} busy={translatingQuery === normalizedSentenceQuery} error={sentenceError?.query === normalizedSentenceQuery ? sentenceError : null} onTranslate={() => void translateSentence()} onSpeak={speak} onLookUp={lookUpWord} />
            : loading && entries.length === 0 && !loadError ? <div role="status" className={styles.empty}><LoaderCircle className="animate-spin" size={22} /><p>Đang mở kho từ vựng…</p></div>
            : loadError ? <div className={styles.empty}><BookOpen size={30} /><h3>Kho từ đang nghỉ một chút</h3><p>Chưa tải được dữ liệu. Bạn thử kết nối lại nhé.</p><button onClick={() => { setLoadError(false); setRetry((value) => value + 1); }} className={styles.primary}>Thử lại</button></div>
            : results.length === 0 ? <div className={styles.empty}><BookOpen size={33} /><h3>{query ? "Khám phá nghĩa của câu này" : view === "saved" ? "Những từ bạn muốn ghi nhớ" : "Mỗi ngày, thêm một từ mới"}</h3><p>{query ? "Chưa có mục từ khớp trong kho. Chuyển sang dịch câu để tìm hiểu nghĩa theo ngữ cảnh." : view === "saved" ? "Nhấn Lưu từ ở mỗi mục để tạo góc ôn tập của riêng mình." : "Chọn một từ để tra cứu. Những từ đã mở sẽ được lưu lại ở đây."}</p>{query ? <><button onClick={() => changeView("sentence")} className={styles.primary}><Sparkles size={15} />Dịch bằng AI</button><a href={HANZII_URL} target="_blank" rel="noopener noreferrer" className={styles.secondary}>Tra thêm trên Hanzii<ArrowUpRight size={13} /></a></> : <button onClick={() => changeView("all")} className={styles.primary}>Khám phá từ vựng</button>}</div>
            : <div className={styles.workspace}>
              <aside className={`${styles.list} ${selected ? styles.mobileHidden : ""}`} aria-label="Kết quả tra từ">
                <p className={styles.sectionLabel}>Kết quả tra cứu <span className="ml-auto">{results.length}{hasMore ? "+" : ""}</span></p>
                {results.map((entry) => <button key={entry.key} onClick={() => selectEntry(entry)} aria-pressed={current?.key === entry.key} className={styles.listItem}><div className={styles.listText}><div className={styles.listHanzi}><span lang="zh-CN">{entry.hanzi}</span>{saved.includes(entry.key) && <Bookmark size={12} className="fill-[#BC9B6B] text-[#BC9B6B]" />}</div><p className={styles.listPinyin}>{entry.pinyin}</p><p className={styles.listMeaning}>{entry.meaningVi}</p></div><ChevronRight size={14} className="shrink-0 text-[#a0ad95]" /></button>)}
              </aside>
              {current && <>
                <div ref={detailRef} tabIndex={-1} className={`${styles.wordDetail} ${selected ? "" : styles.mobileHidden}`}>
                  <button onClick={() => { setSelected(null); searchRef.current?.focus(); }} className={styles.mobileBack}><ArrowLeft size={14} />Danh sách từ</button>
                  {sentenceResult && <button onClick={() => { setQuery(sentenceResult.sourceText); setView("sentence"); setSelected(null); }} className={`${styles.secondary} mb-3`}><ArrowLeft size={13} />Về câu vừa dịch</button>}
                  <section className={styles.paper}>
                    <div className={styles.wordHeading}><span className={styles.tag}><BookOpen size={12} />{current.level || "TỪ VỰNG"}</span><button onClick={() => toggleSaved(current)} aria-label={saved.includes(current.key) ? `Bỏ lưu ${current.hanzi}` : `Lưu từ ${current.hanzi}`} aria-pressed={saved.includes(current.key)} className={styles.secondary}><Bookmark size={13} className={saved.includes(current.key) ? "fill-[#BC9B6B] text-[#BC9B6B]" : ""} />{saved.includes(current.key) ? "Đã lưu" : "Lưu từ"}</button></div>
                    <div className={styles.wordTitle}><h3 lang="zh-CN">{current.hanzi}</h3>{current.traditional !== current.hanzi && <span className={styles.traditional} lang="zh-TW">〔{current.traditional}〕</span>}<button onClick={() => speak(current.hanzi)} aria-label={`Nghe phát âm ${current.hanzi}`} className={styles.iconButton}><Volume2 size={17} /></button></div>
                    <p className={styles.pinyin}>{current.pinyin}</p>
                    {current.hanViet && <p className={styles.hanViet}>Hán Việt · {current.hanViet}</p>}
                  </section>
                  <section className={styles.paper}><h4 className={styles.cardTitle}>Nghĩa tiếng Việt</h4><div className={styles.meanings}>{(current.meaningsVi.length ? current.meaningsVi : [current.meaningVi]).map((meaning, index) => <p key={`${index}:${meaning}`} className={styles.meaning}><span className={styles.meaningNumber}>{String(index + 1).padStart(2, "0")}</span><span>{meaning}</span></p>)}</div>
                    {current.meaningEn.length > 0 && <details className="mt-6 text-xs text-[#7b8671]"><summary className="cursor-pointer font-semibold">Đối chiếu nghĩa tiếng Anh</summary><p className="mt-3 leading-7">{current.meaningEn.join("; ")}</p></details>}
                    <p className={styles.source}>{current.source}</p>
                  </section>
                  <div className={styles.actions}><button onClick={() => { setView("sentence"); setForceWordQuery(null); }} className={styles.secondary}><Sparkles size={13} />Dịch cả câu với từ này</button><a href={HANZII_URL} target="_blank" rel="noopener noreferrer" className={styles.secondary}>Tra thêm trên Hanzii<ArrowUpRight size={13} /></a></div>
                </div>
                <aside className={`${styles.characterAside} ${selected ? "" : styles.mobileHidden}`}><DictionaryStrokeWriter key={current.key} word={current.hanzi} /><div className={styles.landscapeNote}><p>Nét chữ hôm nay,<br />tri thức ngày mai.</p><small>Tĩnh tâm học · Bền bỉ nhớ</small></div></aside>
              </>}
            </div>}
          <footer className={styles.footer}><a href="/dictionary/sources" target="_blank" rel="noopener noreferrer"><Check size={12} />CC-CEDICT / CVDICT · CC BY-SA 4.0</a><a href={HANZII_URL} target="_blank" rel="noopener noreferrer">Hanzii.net<ArrowUpRight size={12} /></a></footer>
        </div>
      </div>, document.body)}
  </>;
}
