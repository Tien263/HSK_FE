"use client";

import { useEffect, useRef, useState, type PointerEvent, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, Download, Eraser, Feather, FolderOpen, Grid2X2, Plus, RotateCcw, Save, Search, Stamp, Trash2, X } from "lucide-react";
import s from "./CalligraphyStudio.module.css";

const papers = [
  { id: "xuan", name: "Tuyên chỉ", zh: "宣纸", hint: "Mộc mạc · giấy thư pháp", color: "#f4ecd9" },
  { id: "gold", name: "Sái kim", zh: "洒金", hint: "Trang trọng · vảy vàng", color: "#efe0b8" },
  { id: "wax", name: "Lạp tiên", zh: "蜡笺", hint: "Ấm áp · ánh sáp", color: "#eacb93" },
  { id: "royal", name: "Hoàng lăng", zh: "黄绫", hint: "Hoàng gia · lụa vàng", color: "#e7bd61" },
  { id: "bamboo", name: "Trúc chỉ", zh: "竹纸", hint: "Tự nhiên · sợi tre", color: "#ddd5af" },
  { id: "mica", name: "Vân mẫu", zh: "云母笺", hint: "Thanh nhã · ánh mica", color: "#e8e7df" },
] as const;
type Paper = typeof papers[number]["id"];
type Seal = { id: string; symbol: string; x: number; y: number };
type Page = { content: string; drawingDataUrl?: string; stamps: Seal[] };
type Note = { id: string; title: string; content: string; lessonNumber: number; hskLevel: number; createdAt: string; paperType: string; brushType?: string; drawingDataUrl?: string; pages?: Page[]; layout?: "scroll" | "codex"; vertical?: boolean };
type Props = { isOpen: boolean; onClose: () => void; lessonNumber: number; hskLevel: number; studentId?: string; lessonTitle?: string };
const blank = (): Page => ({ content: "", stamps: [] });
const paperId = (id: string): Paper => papers.some(p => p.id === id) ? id as Paper : id === "silk" ? "royal" : "xuan";

export default function CalligraphyNotebook({ isOpen, onClose, lessonNumber, hskLevel, studentId = "default", lessonTitle = "Bài học" }: Props) {
  const [view, setView] = useState<"write" | "archive">("write");
  const [layout, setLayout] = useState<"scroll" | "codex">("scroll");
  const [paper, setPaper] = useState<Paper>("xuan");
  const [vertical, setVertical] = useState(true);
  const [tool, setTool] = useState<"text" | "brush" | "eraser">("text");
  const [grid, setGrid] = useState(false), [ink, setInk] = useState("#273f35"), [brushSize, setBrushSize] = useState(5);
  const [title, setTitle] = useState(""), [pages, setPages] = useState<Page[]>([blank()]), [index, setIndex] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]), [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState(""), [status, setStatus] = useState(""), [dirty, setDirty] = useState(false), [readyFor, setReadyFor] = useState("");
  const [history, setHistory] = useState<string[]>([]), [revision, setRevision] = useState(0);
  const dialog = useRef<HTMLElement>(null), closeButton = useRef<HTMLButtonElement>(null), canvas = useRef<HTMLCanvasElement>(null), sheet = useRef<HTMLDivElement>(null);
  const drawing = useRef<{ x: number; y: number } | null>(null);
  const drag = useRef<{ id: string; x: number; y: number; startX: number; startY: number } | null>(null);
  const closeAction = useRef(onClose);
  const page = pages[index];
  const key = `hsk_ancient_notes_${studentId}`;
  const material = papers.find(p => p.id === paper)!;

  useEffect(() => { closeAction.current = onClose; }, [onClose]);

  /* eslint-disable react-hooks/set-state-in-effect -- Hydrate the existing browser notebook after mount and when the signed-in student changes. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key), stored: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(stored)) throw new Error();
      setNotes(stored.filter((n): n is Note => !!n && typeof n.id === "string" && typeof n.content === "string")); setReadyFor(key);
      setTitle(""); setPages([blank()]); setIndex(0); setEditingId(null); setDirty(false); setRevision(r => r + 1);
    } catch { setReadyFor(""); setStatus("Chưa đọc được sổ đã lưu. Hãy mở lại để tránh ghi đè ghi chú cũ."); }
  }, [key]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null, overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; closeButton.current?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); closeAction.current(); }
      if (e.key !== "Tab") return;
      const elements = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input, textarea, select, [tabindex="0"]') || []).filter(el => el.getClientRects().length);
      const first = elements[0], last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", handleKey); previous?.focus(); };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || view !== "write") return;
    const ctx = canvas.current?.getContext("2d"); if (!ctx) return;
    let active = true; ctx.clearRect(0, 0, 800, 640); setHistory([]);
    if (page.drawingDataUrl) { const img = new Image(); img.onload = () => { if (active) { ctx.globalCompositeOperation = "source-over"; ctx.drawImage(img, 0, 0, 800, 640); } }; img.src = page.drawingDataUrl; }
    return () => { active = false; };
    // Restore artwork on navigation; drawing updates must not reset the canvas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, view, index, revision]);

  function update(patch: Partial<Page>) { setPages(ps => ps.map((p, i) => i === index ? { ...p, ...patch } : p)); setDirty(true); setStatus(""); }
  function persist(next: Note[]) {
    if (readyFor !== key) { setStatus("Sổ chưa sẵn sàng. Hãy mở lại trước khi lưu."); return false; }
    try { localStorage.setItem(key, JSON.stringify(next)); setNotes(next); return true; }
    catch { setStatus("Chưa lưu được: bộ nhớ trình duyệt đã đầy hoặc không khả dụng. Bút ký đang viết vẫn được giữ trong cửa sổ này."); return false; }
  }
  function save() {
    if (!pages.some(p => p.content.trim() || p.drawingDataUrl || p.stamps.length)) { setStatus("Hãy viết vài dòng hoặc thêm nét bút trước khi đóng ấn."); return; }
    const old = notes.find(n => n.id === editingId);
    const note: Note = { ...old, id: editingId || crypto.randomUUID(), title: title.trim() || `Bút ký · Bài ${lessonNumber}`, content: pages.map(p => p.content).join("\n\n"), lessonNumber: old?.lessonNumber ?? lessonNumber, hskLevel: old?.hskLevel ?? hskLevel, createdAt: old?.createdAt || new Date().toLocaleString("vi-VN"), paperType: paper, brushType: "langhao", drawingDataUrl: pages[0].drawingDataUrl, pages, layout, vertical };
    if (persist([note, ...notes.filter(n => n.id !== note.id)])) { setEditingId(note.id); setDirty(false); setStatus("Đã đóng ấn và lưu bút ký trên trình duyệt này."); }
  }
  function open(note?: Note) {
    if (dirty) { setStatus("Hãy lưu bút ký đang viết trước khi mở tác phẩm khác hoặc tạo bút ký mới."); return; }
    setEditingId(note?.id || null); setTitle(note?.title || ""); setPaper(paperId(note?.paperType || "xuan")); setLayout(note?.layout || "scroll"); setVertical(note?.vertical ?? !note);
    setPages(note ? note.pages?.length ? note.pages.map(p => ({ ...p, stamps: p.stamps || [] })) : [{ content: note.content, drawingDataUrl: note.drawingDataUrl, stamps: [] }] : [blank()]);
    setIndex(0); setRevision(r => r + 1); setView("write"); setStatus("");
  }
  function position(e: PointerEvent<HTMLCanvasElement>) { const rect = e.currentTarget.getBoundingClientRect(); return { x: (e.clientX - rect.left) * 800 / rect.width, y: (e.clientY - rect.top) * 640 / rect.height }; }
  function draw(e: PointerEvent<HTMLCanvasElement>, start = false) {
    const ctx = e.currentTarget.getContext("2d"); if (!ctx) return; const pos = position(e);
    if (start) { e.currentTarget.setPointerCapture(e.pointerId); const snapshot = e.currentTarget.toDataURL(); setHistory(h => [...h.slice(-9), snapshot]); drawing.current = pos; }
    if (!drawing.current) return;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over"; ctx.strokeStyle = ink; ctx.lineWidth = tool === "eraser" ? brushSize * 5 : brushSize * (e.pointerType === "pen" ? Math.max(.3, e.pressure * 2) : 1); ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(drawing.current.x, drawing.current.y); ctx.lineTo(pos.x + (start ? .01 : 0), pos.y); ctx.stroke(); drawing.current = pos;
  }
  function capture() { const el = canvas.current; if (!el) return; const pixels = el.getContext("2d")!.getImageData(0, 0, 800, 640).data; update({ drawingDataUrl: pixels.some((v, i) => i % 4 === 3 && v > 0) ? el.toDataURL() : undefined }); }
  function finish() { if (drawing.current) { drawing.current = null; capture(); } }
  function undo() { const snapshot = history.at(-1); if (!snapshot) return; const img = new Image(); img.onload = () => { const ctx = canvas.current?.getContext("2d"); if (ctx) { ctx.clearRect(0, 0, 800, 640); ctx.globalCompositeOperation = "source-over"; ctx.drawImage(img, 0, 0); capture(); } }; img.src = snapshot; setHistory(h => h.slice(0, -1)); }
  function downloadDrawing() { if (!page.drawingDataUrl) return; const link = document.createElement("a"); link.href = page.drawingDataUrl; link.download = `but-ky-hsk${hskLevel}-bai${lessonNumber}-trang${index + 1}.png`; link.click(); }
  function move(id: string, x: number, y: number) { update({ stamps: page.stamps.map(st => st.id === id ? { ...st, x: Math.max(5, Math.min(95, x)), y: Math.max(8, Math.min(92, y)) } : st) }); }
  if (!isOpen) return null;
  const results = notes.filter(n => `${n.title} ${n.content}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")));

  return <div className={s.overlay}>
    <button className={s.backdrop} aria-label="Đóng bút ký" onClick={onClose} tabIndex={-1}/>
    <aside className={s.studio} ref={dialog} role="dialog" aria-modal="true" aria-labelledby="calligraphy-title">
      <header className={s.header}><div className={s.brandSeal} aria-hidden="true">墨</div><div className={s.heading}><span className={s.eyebrow}>THƯ PHÒNG · HSK {hskLevel} / BÀI {lessonNumber}</span><h2 id="calligraphy-title">Băng Thư Cuộn Chiếu Chỉ</h2><p>{lessonTitle}<span> · Một trang giấy, một bước tiến.</span></p></div><button ref={closeButton} className={s.iconButton} onClick={onClose} aria-label="Đóng thư phòng"><X size={20}/></button></header>
      <nav className={s.navigation} aria-label="Không gian bút ký"><button aria-pressed={view === "write"} onClick={() => setView("write")}><Feather size={16}/> Bàn viết</button><button aria-pressed={view === "archive"} onClick={() => setView("archive")}><FolderOpen size={16}/> Bút ký đã lưu <small>{notes.length}</small></button><span className={s.localHint}>Lưu riêng trên trình duyệt</span></nav>
      {status && <p className={s.status} role="status"><Stamp size={16}/>{status}</p>}
      {view === "archive" ? <div className={s.archive}>
        <div className={s.archiveHeader}><div><span className={s.eyebrow}>TÀNG THƯ CÁC</span><h3>Những trang đã viết</h3></div><button className={s.primary} onClick={() => open()}><Plus size={16}/> Bút ký mới</button></div>
        <label className={s.search}><Search size={17}/><input aria-label="Tìm bút ký" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm tên hoặc nội dung bút ký…"/></label>
        <div className={s.archiveGrid}>{results.map(note => <article key={note.id} className={s.archiveCard} data-paper={paperId(note.paperType)}><span className={s.eyebrow}>HSK {note.hskLevel} · BÀI {note.lessonNumber}</span><h4>{note.title}</h4><p>{note.content || "Bút tích thư pháp"}</p><small>{note.createdAt} · {note.pages?.length || 1} trang</small><div><button onClick={() => open(note)}>Mở bút ký <ArrowRight size={14}/></button><button aria-label={`Xóa ${note.title}`} onClick={() => { if (window.confirm(`Xóa bút ký “${note.title}”?`) && persist(notes.filter(n => n.id !== note.id)) && editingId === note.id) { setEditingId(null); setDirty(true); } }}><Trash2 size={15}/></button></div></article>)}</div>
        {!results.length && <div className={s.empty}><BookOpen size={32}/><h3>{query ? "Chưa tìm thấy bút ký" : "Trang đầu tiên đang chờ bạn"}</h3><p>{query ? "Thử tìm bằng một từ khác." : "Ghi lại một chữ mới, một câu hay, một điều vừa hiểu."}</p><button className={s.primary} onClick={() => setView("write")}>Về bàn viết <ArrowRight size={15}/></button></div>}
      </div> : <div className={s.workspace}>
        <section className={s.materialPanel} aria-label="Chất liệu và dụng cụ"><div className={s.panelTitle}><span>01</span><h3>Chọn mặt giấy</h3></div><div className={s.materials}>{papers.map(p => <button key={p.id} className={s.material} aria-pressed={paper === p.id} onClick={() => { setPaper(p.id); setDirty(true); }}><span className={s.swatch} data-paper={p.id} style={{ backgroundColor: p.color }}><span>{p.zh}</span>{paper === p.id && <Check size={13}/>}</span><span><strong>{p.name}</strong><small>{p.hint}</small></span></button>)}</div>
          <div className={s.panelTitle}><span>02</span><h3>Mực & ấn triện</h3></div><div className={s.inks}>{[{ color: "#273f35", name: "Mực tùng" }, { color: "#9b3930", name: "Chu sa" }, { color: "#26211c", name: "Mực đen" }].map(i => <button key={i.color} aria-label={i.name} aria-pressed={ink === i.color} style={{ background: i.color }} onClick={() => setInk(i.color)}>{ink === i.color && <Check size={13}/>}</button>)}</div><div className={s.stampPalette}>{["印", "福", "龍"].map(symbol => <button key={symbol} aria-label={`Thêm ấn ${symbol}`} onClick={() => update({ stamps: [...page.stamps, { id: crypto.randomUUID(), symbol, x: 82, y: 75 }] })}>{symbol}</button>)}</div><p className={s.tip}>Chạm để thêm ấn, kéo để đặt lên giấy. Dùng phím mũi tên để di chuyển; Delete để bỏ ấn.</p><div className={s.materialFooter}><span>学而时习之</span><p>Học rồi ôn lại,<br/>mỗi ngày một chút.</p></div>
        </section>
        <section className={s.desk} aria-label="Bàn viết thư pháp">
          <div className={s.deskTop}><div className={s.segmented} aria-label="Hình thức bút ký"><button aria-pressed={layout === "scroll"} onClick={() => { setLayout("scroll"); setDirty(true); }}><Stamp size={15}/> Cuộn thư</button><button aria-pressed={layout === "codex"} onClick={() => { setLayout("codex"); setDirty(true); }}><BookOpen size={15}/> Sổ đóng gáy</button></div><span className={s.paperLabel}>{material.zh} · {material.name}</span></div>
          <div className={s.toolbar}><div className={s.toolGroup}><button aria-pressed={tool === "text"} onClick={() => setTool("text")}>Gõ chữ</button><button aria-pressed={tool === "brush"} onClick={() => setTool("brush")}><Feather size={14}/> Bút lông</button><button aria-label="Tẩy nét bút" aria-pressed={tool === "eraser"} onClick={() => setTool("eraser")}><Eraser size={15}/></button></div>{tool === "text" ? <button aria-pressed={vertical} onClick={() => { setVertical(v => !v); setDirty(true); }}>Chữ {vertical ? "dọc ↓" : "ngang →"}</button> : <label className={s.brushLabel}>Cỡ bút<input type="range" min="2" max="16" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))}/></label>}<button aria-label="Bật tắt ô luyện chữ" aria-pressed={grid} onClick={() => setGrid(g => !g)}><Grid2X2 size={15}/></button><button aria-label="Hoàn tác nét bút" disabled={!history.length} onClick={undo}><RotateCcw size={15}/></button></div>
          <div className={s.artwork} data-layout={layout}><div className={s.bookCover} aria-hidden="true"><span>拾<br/>光<br/>手<br/>札</span><small>HANYU · BÚT KÝ</small></div><div className={s.scrollSheet} data-paper={paper}><div className={s.rollerLeft} aria-hidden="true"/><div className={s.rollerRight} aria-hidden="true"/><div className={s.sheetInner} key={`${revision}-${index}`}>
            <div className={s.sheetHeading}><span>HSK {hskLevel} · BÀI {lessonNumber}</span><span className={s.imperialSeal} aria-hidden="true">宁<br/>记</span></div><input className={s.titleInput} aria-label="Tên bút ký" value={title} onChange={e => { setTitle(e.target.value); setDirty(true); }} placeholder="Đặt tên cho bút ký…"/>
            <div ref={sheet} className={`${s.writingArea} ${grid ? s.riceGrid : ""}`} style={{ "--ink": ink } as CSSProperties}>
              <textarea aria-label={`Nội dung trang ${index + 1}`} className={vertical ? s.verticalText : s.horizontalText} style={{ pointerEvents: tool === "text" ? "auto" : "none" }} value={page.content} onChange={e => update({ content: e.target.value })} placeholder={vertical ? "落笔生花\nHạ bút, nở hoa…" : "Một chữ mới, một câu hay…"} spellCheck={false}/>
              <canvas ref={canvas} width={800} height={640} className={s.canvas} style={{ pointerEvents: tool === "text" ? "none" : "auto" }} aria-label="Mặt giấy luyện nét bút" onPointerDown={e => draw(e, true)} onPointerMove={e => draw(e)} onPointerUp={finish} onPointerCancel={finish}/>
              {page.stamps.map(st => <button key={st.id} className={s.decoration} style={{ left: `${st.x}%`, top: `${st.y}%` }} aria-label={`Ấn ${st.symbol}, dùng mũi tên di chuyển hoặc Delete để bỏ`} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { id: st.id, x: st.x, y: st.y, startX: e.clientX, startY: e.clientY }; }} onPointerMove={e => { const d = drag.current, rect = sheet.current?.getBoundingClientRect(); if (d?.id === st.id && rect) move(st.id, d.x + (e.clientX - d.startX) * 100 / rect.width, d.y + (e.clientY - d.startY) * 100 / rect.height); }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onKeyDown={e => { const offsets: Record<string, [number, number]> = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }; if (offsets[e.key]) { e.preventDefault(); move(st.id, st.x + offsets[e.key][0], st.y + offsets[e.key][1]); } else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); update({ stamps: page.stamps.filter(p => p.id !== st.id) }); } }}>{st.symbol}</button>)}
            </div><div className={s.sheetFoot}><span>笔墨之间，皆是成长</span><span>{String(index + 1).padStart(2, "0")}</span></div>
          </div></div></div>
          <div className={s.pagination}><button aria-label="Trang trước" disabled={index === 0} onClick={() => setIndex(i => i - 1)}><ChevronLeft size={17}/></button><span aria-live="polite">Trang {index + 1} / {pages.length}</span><button aria-label="Trang sau" disabled={index === pages.length - 1} onClick={() => setIndex(i => i + 1)}><ChevronRight size={17}/></button><button onClick={() => { setPages(ps => [...ps, blank()]); setIndex(pages.length); setDirty(true); }}><Plus size={14}/> Thêm trang</button><button aria-label="Tải nét bút PNG" disabled={!page.drawingDataUrl} onClick={downloadDrawing}><Download size={14}/></button></div>
          <footer className={s.deskFooter}><div><span className={s.saveDot} data-dirty={dirty}/>{dirty ? "Có thay đổi chưa lưu" : editingId ? "Bút ký đã lưu" : "Sẵn sàng hạ bút"}</div><button className={s.primary} disabled={readyFor !== key} onClick={save}><Save size={16}/> Đóng ấn & lưu</button></footer><button className={s.backToLesson} onClick={onClose}><ArrowLeft size={14}/> Trở về bài học</button>
        </section>
      </div>}
    </aside>
  </div>;
}
