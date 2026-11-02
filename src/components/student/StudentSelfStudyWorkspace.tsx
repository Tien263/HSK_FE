"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Archive, ArrowLeft, ArrowRight, BookOpen, Dumbbell, FileCheck2, Lock, Moon, PenTool, Sparkles } from "lucide-react";
import { useCurriculumLessons } from "@/lib/use-curriculum";
import { getLessonsByHskLevel } from "@/lib/hsk-lessons-resolver";
import { useSelfStudySelection } from "@/lib/use-self-study-selection";
import { fetchCloudProgress, saveCloudPass } from "@/lib/self-study-cloud-service";
import AncientScrollPathway from "./AncientScrollPathway";
import AncientSideDrawerNotes from "./AncientSideDrawerNotes";
import ImperialPassSealModal from "./ImperialPassSealModal";
import AncientHanziEtymologyModal from "./AncientHanziEtymologyModal";
import VirtualStudyRoomModal from "./VirtualStudyRoomModal";
import InkStudyDashboard from "./InkStudyDashboard";
import SelfStudyRoadmapPage from "./SelfStudyRoadmapPage";
import VocabNotebookModal from "./VocabNotebookModal";
import AiDialogueRoleplayModal from "./AiDialogueRoleplayModal";
import MistakeNotebookModal from "./MistakeNotebookModal";
import HanziPracticeModal from "./HanziPracticeModal";
import HskLevelMasteryWidget from "./HskLevelMasteryWidget";
import SelfStudyLessonDetail from "./SelfStudyLessonDetail";
import SelfStudyKnowledgeArchive from "./SelfStudyKnowledgeArchive";
import { updateLibrary, lessonKey } from "@/lib/use-lesson-library";
import type { KnowledgeItem } from "@/lib/self-study-knowledge";
import SelfStudyLessonCatalog from "./SelfStudyLessonCatalog";
import styles from "./SelfStudyWorkspace.module.css";

export interface StudentSelfStudyWorkspaceProps {
  currentUser?: { id?: string; name?: string; currentHskLevel?: number };
  activeHskLevel?: number;
  onNavigateToTab?: (tab: string) => void;
  onOpenJoinModal?: () => void;
  view?: "roadmap" | "lessons";
  screen?: "catalog" | "reader";
  onScreenChange?: (screen: "catalog" | "reader") => void;
  home?: boolean;
}

export default function StudentSelfStudyWorkspace({ currentUser, activeHskLevel = 1, onNavigateToTab, view = "roadmap", screen = "catalog", onScreenChange, home = false }: StudentSelfStudyWorkspaceProps) {
  const router = useRouter();
  const dedicatedRoadmap = view === "roadmap" && !home;
  const [maxLevel, setMaxLevel] = useState(currentUser?.currentHskLevel || activeHskLevel);
  const selection = useSelfStudySelection(currentUser?.id, maxLevel);
  const level = Math.min(selection.level, maxLevel);
  const [unlocked, setUnlocked] = useState<number[]>([1, 2]);
  const [libraryUnlockScope, setLibraryUnlockScope] = useState("");
  const unlockScope = `${level}_${currentUser?.id || "guest"}`;
  const libraryUnlocked = libraryUnlockScope === unlockScope ? unlocked : [];
  const [savedOnly, setSavedOnly] = useState(false);
  const [notice, setNotice] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [passedLessonInfo, setPassedLessonInfo] = useState<{ completed: number; next: number }>({ completed: 1, next: 2 });
  const [showEtymologyModal, setShowEtymologyModal] = useState(false);
  const [showVocabModal, setShowVocabModal] = useState(false);
  const [showDialogueModal, setShowDialogueModal] = useState(false);
  const [showMistakesModal, setShowMistakesModal] = useState(false);
  const [showHanziPracticeModal, setShowHanziPracticeModal] = useState(false);
  const [hanziPracticeChar, setHanziPracticeChar] = useState("你");
  const [hanziPracticePinyin, setHanziPracticePinyin] = useState("");
  const [hanziPracticeMeaning, setHanziPracticeMeaning] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const { lessons: apiLessons, loading, error } = useCurriculumLessons(level);
  const lessons = useMemo(() => (dedicatedRoadmap || view === "lessons") ? apiLessons : apiLessons.length ? apiLessons : getLessonsByHskLevel(level), [apiLessons, level, dedicatedRoadmap, view]);
  const current = lessons.find(lesson => lesson.number === selection.lessonNumber) || lessons[0];
  const canStudy = !!current && (view === "lessons" ? libraryUnlocked : unlocked).includes(current.number);
  const reading = view === "lessons" && screen === "reader";
  const openCount = lessons.filter(lesson => unlocked.includes(lesson.number)).length;

  const totalVocabInLevel = useMemo(() => {
    return lessons.reduce((acc, l) => acc + (l.vocabList?.length || 0), 0);
  }, [lessons]);

  const unlockedVocabInLevel = useMemo(() => {
    return lessons
      .filter((l) => unlocked.includes(l.number))
      .reduce((acc, l) => acc + (l.vocabList?.length || 0), 0);
  }, [lessons, unlocked]);

  const totalGrammarInLevel = useMemo(() => {
    return lessons.reduce((acc, l) => acc + (l.grammarList?.length || (l as any).grammar?.length || 0), 0);
  }, [lessons]);

  const unlockedGrammarInLevel = useMemo(() => {
    return lessons
      .filter((l) => unlocked.includes(l.number))
      .reduce((acc, l) => acc + (l.grammarList?.length || (l as any).grammar?.length || 0), 0);
  }, [lessons, unlocked]);

  /* eslint-disable react-hooks/set-state-in-effect -- Restore existing profile and unlock data from the browser after hydration. */
  useEffect(() => {
    try { const profile = JSON.parse(localStorage.getItem("hanyu_study_profile") || "null"); setMaxLevel(Math.max(Number(profile?.currentHskLevel || currentUser?.currentHskLevel || activeHskLevel) || 1, 1)); } catch { /* Keep the account level. */ }
  }, [currentUser?.currentHskLevel, activeHskLevel]);
  useEffect(() => {
    if (dedicatedRoadmap) return;
    let active = true;
    if (view === "lessons") {
      const controller = new AbortController();
      const cacheKey = `hsk_self_unlocked_lvl_${unlockScope}`;
      void (async () => {
        let numbers: number[] = [];
        try {
          const response = await fetch(`/api/v1/my/self-study/progress?level=${level}`, { cache: "no-store", signal: controller.signal });
          const data = await response.json();
          if (!response.ok || !data.success || !Array.isArray(data.unlockedLessons) || !data.unlockedLessons.every((n: number) => Number.isInteger(n) && n > 0)) throw new Error();
          numbers = data.unlockedLessons;
          if (active) { try { localStorage.setItem(cacheKey, JSON.stringify(numbers)); } catch { /* Continue with server permissions. */ } }
        } catch {
          if (!active) return;
          try { const stored = JSON.parse(localStorage.getItem(cacheKey) || "null"); if (Array.isArray(stored) && stored.every(n => Number.isInteger(n) && n > 0)) numbers = stored; } catch { /* No usable cache. */ }
          setNotice("Chưa đồng bộ được trạng thái mở bài. Đang dùng dữ liệu đã lưu trên trình duyệt nếu có.");
        }
        if (active) { setUnlocked(numbers); setLibraryUnlockScope(unlockScope); }
      })();
      return () => { active = false; controller.abort(); };
    }
    try { const stored = JSON.parse(localStorage.getItem(`hsk_self_unlocked_lvl_${level}_${currentUser?.id || "guest"}`) || "null"); setUnlocked(Array.isArray(stored) ? stored : [1, 2]); } catch { setUnlocked([1, 2]); }
    // Đồng bộ từ đám mây (Cloud Sync)
    fetchCloudProgress(level, currentUser?.id).then(cloudUnlocked => {
      if (active && Array.isArray(cloudUnlocked) && cloudUnlocked.length) {
        setUnlocked(cloudUnlocked);
      }
    });
    return () => { active = false; };
  }, [level, currentUser?.id, dedicatedRoadmap, view, unlockScope]);

  useEffect(() => {
    function handleProgressUpdate(e: Event) {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.level === level && Array.isArray(customEvent.detail.unlockedLessons)) {
        setUnlocked(customEvent.detail.unlockedLessons);
        setLibraryUnlockScope(unlockScope);
      }
    }
    function handleLevelPromoted(e: Event) {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.newLevel) {
        setMaxLevel(customEvent.detail.newLevel);
        selection.select({ level: customEvent.detail.newLevel, lessonNumber: 1 });
      }
    }
    window.addEventListener("self-study-progress-updated", handleProgressUpdate);
    window.addEventListener("hsk-level-promoted", handleLevelPromoted);
    return () => {
      window.removeEventListener("self-study-progress-updated", handleProgressUpdate);
      window.removeEventListener("hsk-level-promoted", handleLevelPromoted);
    };
  }, [level, selection, unlockScope]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function navigate(tab: string) { if (onNavigateToTab) onNavigateToTab(tab); else router.push(`/s/home?tab=${tab}`); }
  function rememberOpenLessons() {
    // Preserve the lessons already offered by the reader when handing off to practice.
    const key = `hsk_self_unlocked_lvl_${level}_${currentUser?.id || "guest"}`;
    try { if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify(unlocked)); } catch { /* Keep the current in-memory permissions. */ }
  }
  function openLesson(number: number) {
    if (!(view === "lessons" ? libraryUnlocked : unlocked).includes(number)) return;
    rememberOpenLessons();
    selection.select({ level, lessonNumber: number }); onScreenChange?.("reader"); navigate("lessons");
    topRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  async function openArchived(item: KnowledgeItem) {
    if (item.level > maxLevel) { setNotice(`HSK ${item.level} chưa mở khóa.`); return; }
    try {
      const [curriculumResponse, progressResponse] = await Promise.all([fetch(`/api/v1/curriculum?level=${item.level}`, { cache: "no-store" }), fetch(`/api/v1/my/self-study/progress?level=${item.level}`, { cache: "no-store" })]);
      const [curriculum, progress] = await Promise.all([curriculumResponse.json(), progressResponse.json()]);
      if (!curriculumResponse.ok || !curriculum.success || !Array.isArray(curriculum.items) || !curriculum.items.some((lesson: {number:number}) => lesson.number === item.lessonNumber)) { setNotice("Bài gốc không còn trong giáo trình hoặc chưa tải được. Bạn vẫn có thể xem bản lưu."); return; }
      if (!progressResponse.ok || !progress.success || !Array.isArray(progress.unlockedLessons) || !progress.unlockedLessons.includes(item.lessonNumber)) { setNotice("Bài gốc chưa mở hoặc chưa xác nhận được quyền học. Bạn vẫn có thể xem nội dung đã lưu."); return; }
      if (item.kind !== "lesson") updateLibrary(currentUser?.id, store => { const key = lessonKey(item.level, item.lessonNumber); return { ...store, reading: { ...store.reading, [key]: { ...store.reading[key], tab: item.section, itemId: item.id, viewed: store.reading[key]?.viewed || [], updatedAt: new Date().toISOString() } } }; });
      selection.select({ level: item.level, lessonNumber: item.lessonNumber }); setSavedOnly(false); setNotice(""); onScreenChange?.("reader"); navigate("lessons");
    } catch { setNotice("Chưa mở được bài gốc. Hãy thử lại khi có kết nối."); }
  }
  function changeLevel(next: number) {
    if (next > maxLevel) {
      setNotice(`HSK ${next} chưa mở khóa. Bạn cần hoàn thành tất cả các bài học và đạt điểm bài thi thử của HSK ${next - 1} để tiếp tục.`);
      return;
    }
    selection.select({ level: next, lessonNumber: 1 }); onScreenChange?.("catalog"); setNotice("");
  }
  function practice() { if (!canStudy) return; rememberOpenLessons(); selection.select({ level, lessonNumber: current.number }); navigate("practice"); }
  async function complete() {
    if (!current || !canStudy) return;
    const completedNum = current.number;
    const nextNum = completedNum + 1;
    const nextUnlocked = [...new Set([...unlocked, nextNum])].sort((a, b) => a - b);
    
    setUnlocked(nextUnlocked);
    setPassedLessonInfo({ completed: completedNum, next: nextNum });
    setPassModalOpen(true);
    setNotice(`Đã thông quan Bài ${completedNum}! Đã mở khóa Bài ${nextNum} (+50 XP).`);

    await saveCloudPass({
      level,
      completedLessonNumber: completedNum,
      nextLessonNumber: nextNum,
      currentUnlocked: unlocked,
      studentId: currentUser?.id,
      xpReward: 50,
    });
  }
  function openNotes() { if (canStudy) { selection.select({ level, lessonNumber: current.number }); setNotesOpen(true); } }
  const actions = <div className={styles.actions} aria-label="Thao tác với bài đang chọn">
    <button className={reading ? styles.secondary : styles.primary} disabled={!canStudy} onClick={() => openLesson(current.number)}><BookOpen size={16}/>{reading ? "Đang học bài" : "Học tiếp"}</button>
    <button className={styles.secondary} disabled={!canStudy} onClick={practice}><Dumbbell size={16}/>Luyện bài này</button>
    <button className={styles.secondary} disabled={!canStudy} onClick={openNotes}><PenTool size={16}/>Ghi chép</button>
    <button className={styles.secondary} disabled={!canStudy} onClick={() => setShowEtymologyModal(true)} title="Chiết tự chữ Hán"><Sparkles size={16}/>Chiết tự</button>
  </div>;

  return <div ref={topRef} className={styles.workspace} data-self-study-view={view} data-self-study-page={home ? "home" : view} data-catalog={view === "lessons" && !reading} data-reader={reading}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>HANYU · TỰ HỌC HSK {level}</p><h1>{reading ? "Một bài học, một bước tiến." : view === "roadmap" ? home ? "Góc tự học của bạn" : "Lộ trình của tôi" : "Kho bài học & Khám phá"}</h1><p>{dedicatedRoadmap ? "Theo dõi bài đã mở, chọn điểm bắt đầu và đi tiếp từng trang giáo trình." : view === "roadmap" ? "Tiếp tục bài đang học và nhìn lại những chặng phía trước." : "Tìm bài theo tên, chữ Hán hoặc Pinyin. Học và luyện theo cùng một bài."}</p></div>
      <div className={styles.headerTools} data-dashboard={view === "roadmap"}>
        <button className={styles.secondary} onClick={() => setShowVocabModal(true)} title="Sổ từ vựng cá nhân & Flashcard SRS 5 hộp Leitner Thất Nhật Ôn Tập"><BookOpen size={16}/>Thất Nhật Ôn Tập</button>
        <button className={styles.secondary} onClick={() => setShowDialogueModal(true)} title="Trợ lý Hán ngữ AI Nhập vai Tình huống"><Sparkles size={16}/>AI Đối Thoại</button>
        <button className={styles.secondary} onClick={() => setShowMistakesModal(true)} title="Bản đồ nhiệt điểm yếu & Bộ đề giải độc ngữ pháp"><FileCheck2 size={16}/>Giải Độc Ngữ Pháp</button>
        <button
          className={styles.secondary}
          onClick={() => {
            const firstChar = current?.vocabList?.[0]?.hanzi || "你";
            setHanziPracticeChar(firstChar);
            setShowHanziPracticeModal(true);
          }}
          title="Luyện viết từng nét chữ Hán theo ô mễ tự chuẩn mực"
        >
          <PenTool size={16} />
          Luyện Thuận Bút
        </button>
        <button className={styles.secondary} onClick={() => setRoomOpen(true)}><Moon size={16}/>Phòng tập trung</button>
        {view === "lessons" && <button className={styles.secondary} aria-pressed={savedOnly && !reading} onClick={() => { setSavedOnly(true); onScreenChange?.("catalog"); }}><Archive size={16}/>Kho lưu trữ</button>}
      </div>
    </header>

    {!dedicatedRoadmap && <div className={styles.levels} aria-label="Chọn cấp độ HSK"><span>Cấp độ của bạn</span><div>{[1, 2, 3, 4, 5, 6].map(n => <button key={n} aria-pressed={level === n} onClick={() => changeLevel(n)}>HSK {n}{n > maxLevel && <Lock size={12}/>}</button>)}</div><Link href={`/s/mock-exam?level=${level}`}><FileCheck2 size={15}/>Thi thử HSK {level}</Link></div>}
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    {dedicatedRoadmap ? <SelfStudyRoadmapPage level={level} maxLevel={maxLevel} lessons={apiLessons} loading={loading} error={error} selectedLesson={selection.lessonNumber} studentId={currentUser?.id} onLevelChange={changeLevel} onOpenLesson={openLesson} onProgressLoaded={setUnlocked} onPractice={number => { if (unlocked.includes(number)) { selection.select({ level, lessonNumber: number }); navigate("practice"); } }} onNotes={number => { if (unlocked.includes(number)) { selection.select({ level, lessonNumber: number }); setNotesOpen(true); } }} onCatalog={() => { onScreenChange?.("catalog"); navigate("lessons"); }}/> : view === "lessons" && !reading && savedOnly ? <SelfStudyKnowledgeArchive studentId={currentUser?.id} onBack={() => setSavedOnly(false)} onOpen={openArchived}/> : loading ? <p className={styles.empty} role="status">Đang mở kho giáo trình HSK {level}…</p> : error ? <p role="alert" className={styles.empty}>{error}</p> : !lessons.length ? <p className={styles.empty}>Cấp độ này chưa có bài học.</p> : <>
      {view === "roadmap" ? <>
        <InkStudyDashboard lesson={current} level={level} totalLessons={lessons.length} openCount={openCount} studentId={currentUser?.id} actions={actions} canStudy={canStudy} onRead={() => openLesson(current.number)} onVocab={() => setShowVocabModal(true)} onDialogue={() => setShowDialogueModal(true)} onMistakes={() => setShowMistakesModal(true)} onFocus={() => setRoomOpen(true)} onWriting={() => { setHanziPracticeChar(current?.vocabList?.[0]?.hanzi || "你"); setShowHanziPracticeModal(true); }}/>
        <HskLevelMasteryWidget
          level={level}
          totalLessons={lessons.length}
          openCount={openCount}
          totalVocab={totalVocabInLevel}
          unlockedVocab={unlockedVocabInLevel}
          totalGrammar={totalGrammarInLevel}
          unlockedGrammar={unlockedGrammarInLevel}
          onOpenVocabModal={() => setShowVocabModal(true)}
          onOpenStudyRoomModal={() => setRoomOpen(true)}
        />
        <AncientScrollPathway lessons={lessons} selectedLesson={current.number} unlockedLessons={unlocked} onSelectLesson={openLesson} hskLevel={level}/>
        <button className={styles.catalogLink} onClick={() => { onScreenChange?.("catalog"); navigate("lessons"); }}>Khám phá toàn bộ kho bài học <ArrowRight size={16}/></button>
      </> : reading ? <>
        <div className={styles.readerNavigation}><button className={styles.textButton} onClick={() => onScreenChange?.("catalog")}><ArrowLeft size={15}/>Về kho bài học</button><span>HSK {level} · Bài {current.number}</span></div>
        {libraryUnlockScope !== unlockScope ? <p role="status" className={styles.empty}>Đang tải quyền học…</p> : canStudy ? <SelfStudyLessonDetail key={`${currentUser?.id}-${level}-${current.number}`} lesson={current} level={level} studentId={currentUser?.id} onPractice={practice} onNotes={openNotes} onEtymology={() => setShowEtymologyModal(true)} onComplete={complete} onArchive={() => { setSavedOnly(true); onScreenChange?.("catalog"); }}/> : <p className={styles.empty}><Lock size={22}/>Bài này chưa mở. Hãy chọn một bài đã mở trong kho bài học.</p>}
      </> : <>
        <SelfStudyLessonCatalog key={`${currentUser?.id}-${level}`} lessons={lessons} level={level} studentId={currentUser?.id} selected={selection.lessonNumber} unlocked={libraryUnlocked} savedOnly={savedOnly} onSavedOnly={setSavedOnly} onOpen={openLesson}/>
      </>}
    </>}
    <AncientSideDrawerNotes isOpen={notesOpen} onClose={() => setNotesOpen(false)} lessonNumber={current?.number || selection.lessonNumber} hskLevel={level} studentId={currentUser?.id} lessonTitle={current?.titleVi || current?.titleZh} lesson={canStudy ? current : undefined}/>
    <VirtualStudyRoomModal
      isOpen={roomOpen}
      onClose={() => setRoomOpen(false)}
      studentName={currentUser?.name || "Bạn"}
      initialHskLevel={level}
      initialLessonNumber={current?.number || selection.lessonNumber}
    />
    <ImperialPassSealModal
      isOpen={passModalOpen}
      onClose={() => setPassModalOpen(false)}
      hskLevel={level}
      completedLessonNumber={passedLessonInfo.completed}
      nextLessonNumber={passedLessonInfo.next}
      xpReward={50}
      onNextLesson={(nextNum) => openLesson(nextNum)}
      onPractice={practice}
      onWriteNotes={openNotes}
    />
    <AncientHanziEtymologyModal
      isOpen={showEtymologyModal}
      onClose={() => setShowEtymologyModal(false)}
      initialCharacter={current?.vocabList?.[0]?.hanzi || "你"}
      onOpenWritingPractice={(char, py, mean) => {
        setHanziPracticeChar(char);
        setHanziPracticePinyin(py || "");
        setHanziPracticeMeaning(mean || "");
        setShowHanziPracticeModal(true);
      }}
    />
    <HanziPracticeModal
      isOpen={showHanziPracticeModal}
      onClose={() => setShowHanziPracticeModal(false)}
      initialHanzi={hanziPracticeChar}
      initialPinyin={hanziPracticePinyin}
      initialMeaning={hanziPracticeMeaning}
      username={currentUser?.name}
      studentId={currentUser?.id}
      words={current?.vocabList?.map((v: any) => ({
        hanzi: v.hanzi,
        pinyin: v.pinyin,
        meaning: v.meaningVi || v.meaning || "",
        meaningVi: v.meaningVi || v.meaning,
        rule: v.rule,
        exampleZh: v.examples?.[0]?.zh || v.exampleZh,
        examplePinyin: v.examples?.[0]?.pinyin || v.examplePy,
        exampleVi: v.examples?.[0]?.vi || v.exampleVi,
      }))}
    />
    <VocabNotebookModal
      isOpen={showVocabModal}
      onClose={() => setShowVocabModal(false)}
      studentId={currentUser?.id}
    />
    <AiDialogueRoleplayModal
      isOpen={showDialogueModal}
      initialDialogue={current?.dialogue}
      onClose={() => setShowDialogueModal(false)}
      studentId={currentUser?.id}
      hskLevel={level}
      lessonNumber={current?.number || 1}
      lessonTitle={current?.titleVi || current?.titleZh || `Bài học HSK ${level}`}
    />
    <MistakeNotebookModal
      isOpen={showMistakesModal}
      onClose={() => setShowMistakesModal(false)}
      studentId={currentUser?.id}
    />
  </div>;
}
