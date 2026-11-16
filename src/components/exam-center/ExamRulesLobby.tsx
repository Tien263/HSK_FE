"use client";

import BrandMark from "@/components/common/BrandMark";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  BarChart2,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cloud,
  Compass,
  FileCheck2,
  FileText,
  GraduationCap,
  Headphones,
  Home,
  Info,
  Layers,
  Mic,
  Monitor,
  PenTool,
  Play,
  Radio,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  Volume2,
  Wifi,
} from "lucide-react";
import { levelGroup, levelLabel } from "@/lib/exam-center-core";
import { skillNames } from "./exam-client";
import type { dashboard } from "@/lib/exam-center-service";
import s from "./ExamRulesLobby.module.css";

type Dashboard = Awaited<ReturnType<typeof dashboard>>;
type Paper = Dashboard["papers"][number];
type Blueprint = Dashboard["blueprints"][number];
type ActiveAttempt = Dashboard["attempts"][number];

export interface ExamRulesLobbyProps {
  paper: Paper;
  blueprint?: Blueprint;
  activeAttempt?: ActiveAttempt | null;
  onStart: () => void;
  onContinueAttempt?: (attemptId: string) => void;
  onBack: () => void;
  busy?: boolean;
  role?: string;
  onEdit?: () => void;
}

export default function ExamRulesLobby({
  paper,
  activeAttempt,
  onStart,
  onContinueAttempt,
  onBack,
  busy = false,
  role,
  onEdit,
}: ExamRulesLobbyProps) {
  // Device Check States (NOT checked by default)
  const [audioTested, setAudioTested] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [networkTested, setNetworkTested] = useState(false);
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);
  const [networkChecking, setNetworkChecking] = useState(false);
  const [imeInput, setImeInput] = useState("");
  const [imeTested, setImeTested] = useState(false);
  const [micTested, setMicTested] = useState(false);
  const [micChecking, setMicChecking] = useState(false);

  // User agreement checkboxes
  const [agreedRules, setAgreedRules] = useState(false);
  const [agreedDevices, setAgreedDevices] = useState(false);

  const level = paper?.level ?? 1;
  const skills = Array.isArray(paper?.skills) ? paper.skills : [];
  const needsMic = skills.includes("SPEAKING");

  const totalQuestions = paper?.questionsCount ?? 0;
  const durationMin = paper?.durationMin ?? null;
  const maxScore = paper?.maxScore ?? null;
  const passScore = paper?.passScore ?? null;
  const sections = (paper?.sections ?? []).map(section => ({
    ...section,
    name: skillNames[section.skill],
  }));

  // Audio Test via Web Audio API synth chime
  const playAudioChime = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      setAudioPlaying(true);

      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.3);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.3);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.3 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.3 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.3);
        osc.stop(ctx.currentTime + idx * 0.3 + 0.75);
      });

      setTimeout(() => {
        setAudioPlaying(false);
        setAudioTested(true);
      }, 1800);
    } catch {
      setAudioPlaying(false);
      setAudioTested(false);
    }
  }, []);

  // Network Latency Test
  const checkNetwork = useCallback(async () => {
    setNetworkChecking(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/health?t=" + Date.now(), { cache: "no-store" });
      const latency = Math.round(performance.now() - start);
      setNetworkLatency(latency);
      setNetworkTested(res.ok);
    } catch {
      setNetworkLatency(null);
      setNetworkTested(false);
    } finally {
      setNetworkChecking(false);
    }
  }, []);

  // Chinese IME Check
  const handleImeInput = (val: string) => {
    setImeInput(val);
    if (/[\u4e00-\u9fa5]/.test(val)) {
      setImeTested(true);
    }
  };

  // Mic test
  const checkMicrophone = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicTested(false);
      return;
    }
    setMicChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setTimeout(() => {
        stream.getTracks().forEach((track) => track.stop());
        setMicChecking(false);
        setMicTested(true);
      }, 1200);
    } catch {
      setMicChecking(false);
      setMicTested(false);
    }
  }, []);

  // Tự động kiểm tra mạng nhẹ nhàng khi vừa mở trang quy chế
  useEffect(() => {
    checkNetwork();
  }, [checkNetwork]);

  const devicesReady = networkTested && (!skills.includes("LISTENING") || audioTested) && (!needsMic || micTested);
  const canStart = agreedRules && agreedDevices && devicesReady && !busy;

  const handleStartExam = () => {
    if (canStart) onStart();
  };

  return (
    <div className={s.pageWrapper}>
      {/* Decorative Hanging Bamboo Branch in Top Left Corner (Khớp Ảnh Mẫu) */}
      <div className={s.topBambooDecor} aria-hidden="true" />

      {/* =========================================================================
          TOP NAVIGATION BAR (KHỚP 100% ẢNH THIẾT KẾ)
         ========================================================================= */}
      <nav className={s.topNav}>
        <div className={s.brandCluster}>
          <BrandMark size={40} />
          <div className={s.brandTexts}>
            <strong className={s.brandEn}>HSK Exam Center</strong>
            <span className={s.brandZh}>汉语水平考试中心</span>
          </div>
        </div>

        <div className={s.navTabs}>
          <button type="button" className={s.navTabBtn} onClick={onBack}>
            <Home size={15} /> Trang chủ
          </button>
          <button type="button" className={`${s.navTabBtn} ${s.navTabActive}`}>
            <Play size={13} fill="currentColor" /> Thi thử
          </button>
          <button type="button" className={s.navTabBtn} onClick={onBack}>
            <BookOpen size={15} /> Ôn tập
          </button>
          <button type="button" className={s.navTabBtn} onClick={onBack}>
            <BarChart2 size={15} /> Thống kê
          </button>
        </div>

        <div className={s.navRightCluster}>
          <div className={s.searchWrap}>
            <Search size={14} className={s.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm đề thi, bài ôn tập..."
              className={s.searchInput}
            />
          </div>
          <button type="button" className={s.bellBtn} title="Thông báo">
            <Bell size={18} />
            <span className={s.redDot} />
          </button>
          <div className={s.avatarWrap}>
            <Image
              unoptimized
              src="/theme/exam-bamboo-depth.png"
              alt="Avatar"
              width={34}
              height={34}
              className={s.avatarImg}
            />
            <ChevronDown size={13} className={s.avatarChevron} />
          </div>
        </div>
      </nav>

      {/* Main Container Content */}
      <div className={s.innerContent}>
        {/* Breadcrumb Navigation */}
        <div className={s.breadcrumbBar}>
          <button type="button" onClick={onBack} className={s.crumbLink}>
            <Home size={13} />
          </button>
          <span className={s.crumbSep}>›</span>
          <button type="button" onClick={onBack} className={s.crumbLink}>
            Thi thử
          </button>
          <span className={s.crumbSep}>/</span>
          <span className={s.crumbText}>{levelLabel(level)}</span>
          <span className={s.crumbSep}>/</span>
          <span className={s.crumbText}>{paper.title}</span>
          <span className={s.crumbSep}>/</span>
          <span className={s.crumbActive}>Quy chế thi</span>
        </div>

        {/* Title Section with Ink Line Subtitle */}
        <div className={s.titleBlock}>
          <div className={s.examBadge}>
            {levelLabel(level)} · {paper.title}
          </div>
          <h1 className={s.mainTitle}>Quy chế thi</h1>
          <div className={s.subtitleLine}>
            <span className={s.inkLine} />
            <span className={s.subtitleText}>Quy chế thi & Thông tin bài thi</span>
          </div>
        </div>

        {/* =========================================================================
            ROW OF 5 FAST STATS CARDS (SINGLE UNIFIED GLASS CONTAINER)
           ========================================================================= */}
        <section className={s.statsBar} aria-label="Thông số nhanh bài thi">
          <div className={s.statUnit}>
            <div className={s.statIconBox}>
              <FileCheck2 size={20} />
            </div>
            <strong className={s.statBigText}>{totalQuestions} câu hỏi</strong>
          </div>

          <div className={s.statUnit}>
            <div className={s.statIconBox}>
              <Clock size={20} />
            </div>
            <strong className={s.statBigText}>{durationMin} phút</strong>
          </div>

          <div className={s.statUnit}>
            <div className={s.statIconBox}>
              <Layers size={20} />
            </div>
            <div className={s.statColText}>
              <strong className={s.statBigText}>{paper.skills.length} kỹ năng</strong>
              <span className={s.statSubText}>
                {paper.skills.map((k) => skillNames[k] || k).join(" · ")}
              </span>
            </div>
          </div>

          <div className={s.statUnit}>
            <div className={s.statIconBox}>
              <Trophy size={20} />
            </div>
            <strong className={s.statBigText}>
              {maxScore ? `${maxScore} điểm` : "Xếp bậc HSK 7–9"}
            </strong>
          </div>

          <div className={s.statUnit}>
            <div className={s.statIconBox}>
              <Target size={20} />
            </div>
            <div className={s.statColText}>
              <strong className={s.statBigText}>
                {passScore !== null ? `≥ ${passScore} điểm` : "—"}
              </strong>
              <span className={s.statSubText}>mục tiêu</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            ROW 1: 3-COLUMN GRID (THÔNG TIN CHUNG | CẤU TRÚC BÀI THI | TÌNH TRẠNG THIẾT BỊ)
           ========================================================================= */}
        <div className={s.topGridRow}>
          {/* Card 1: 1. Thông tin chung */}
          <div className={s.glassCard}>
            <h2 className={s.cardHead}>
              <Info size={17} /> 1. Thông tin chung
            </h2>
            <p className={s.cardIntroText}>
              Đây là đề thi mô phỏng {levelLabel(level)}, giúp bạn làm quen với cấu trúc, dạng câu
              hỏi và thời gian làm bài của kỳ thi HSK chính thức.
            </p>
            <div className={s.infoPointList}>
              <div className={s.infoPoint}>
                <GraduationCap size={16} className={s.pointIcon} />
                <span>
                  <strong>Cấp độ:</strong> {levelLabel(level)}
                </span>
              </div>
              <div className={s.infoPoint}>
                <FileText size={16} className={s.pointIcon} />
                <span>
                  <strong>Hình thức:</strong> Thi trực tuyến (mô phỏng)
                </span>
              </div>
              <div className={s.infoPoint}>
                <Compass size={16} className={s.pointIcon} />
                <span>
                  <strong>Mục đích:</strong> Luyện tập, đánh giá năng lực và làm quen với quy trình
                  thi.
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: 2. Cấu trúc bài thi (Dynamic Table) */}
          <div className={s.glassCard}>
            <h2 className={s.cardHead}>
              <Layers size={17} /> 2. Cấu trúc bài thi
            </h2>
            <table className={s.structureTable}>
              <thead>
                <tr>
                  <th>Phần thi</th>
                  <th>Số câu hỏi</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((sec, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={s.sectionNameCell}>
                        {sec.skill === "LISTENING" ? (
                          <Headphones size={14} />
                        ) : sec.skill === "READING" ? (
                          <BookOpen size={14} />
                        ) : sec.skill === "WRITING" ? (
                          <PenTool size={14} />
                        ) : (
                          <Mic size={14} />
                        )}
                        <strong>{sec.name}</strong>
                      </span>
                    </td>
                    <td>{sec.questionCount} câu</td>
                    <td>—</td>
                  </tr>
                ))}
                <tr className={s.totalTableRow}>
                  <td>
                    <strong>Tổng cộng</strong>
                  </td>
                  <td>
                    <strong>{totalQuestions} câu</strong>
                  </td>
                  <td>
                    <strong>{durationMin} phút</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Card 3: Tình trạng thiết bị (Summary) */}
          <div className={s.glassCard}>
            <h2 className={s.cardHead}>
              <Monitor size={17} /> Tình trạng thiết bị
            </h2>
            <div className={s.deviceStatusLines}>
              <div className={s.deviceRow}>
                <span className={s.deviceLabel}>
                  <Headphones size={15} /> Âm thanh
                </span>
                <span className={audioTested ? s.tagReady : s.tagWaiting}>
                  <CheckCircle2 size={13} /> {audioTested ? "Sẵn sàng" : "Chưa thử"}
                </span>
              </div>

              <div className={s.deviceRow}>
                <span className={s.deviceLabel}>
                  <Wifi size={15} /> Kết nối mạng
                </span>
                <span className={networkTested ? s.tagReady : s.tagWaiting}>
                  <CheckCircle2 size={13} /> {networkTested ? "Ổn định" : "Chưa thử"}
                </span>
              </div>

              <div className={s.deviceRow}>
                <span className={s.deviceLabel}>
                  <FileText size={15} /> Bàn phím tiếng Trung
                </span>
                <span className={imeTested ? s.tagReady : s.tagWaiting}>
                  <CheckCircle2 size={13} /> {imeTested ? "Đã sẵn sàng" : "Chưa thử"}
                </span>
              </div>

              {needsMic && (
                <div className={s.deviceRow}>
                  <span className={s.deviceLabel}>
                    <Mic size={15} /> Micro (Khẩu ngữ)
                  </span>
                  <span className={micTested ? s.tagReady : s.tagWaiting}>
                    <CheckCircle2 size={13} /> {micTested ? "Sẵn sàng" : "Chưa thử"}
                  </span>
                </div>
              )}
            </div>

            <div className={`${s.deviceSummaryBanner} ${devicesReady ? s.bannerReady : s.bannerWaiting}`}>
              <CheckCircle2 size={15} />
              <span>
                {devicesReady
                  ? "Thiết bị của bạn đã sẵn sàng để tham gia thi."
                  : "Vui lòng kiểm tra thiết bị ở mục 4 bên dưới."}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 2: 2-COLUMN GRID (3. QUY ĐỊNH VÀ LƯU Ý | 4. KIỂM TRA THIẾT BỊ)
           ========================================================================= */}
        <div className={s.middleGridRow}>
          {/* Card 4: 3. Quy định và lưu ý khi thi */}
          <div className={s.glassCard}>
            <h2 className={s.cardHead}>
              <ShieldCheck size={17} /> 3. Quy định và lưu ý khi thi
            </h2>
            <div className={s.rulesListStack}>
              <div className={s.ruleLine}>
                <Clock size={16} className={s.ruleIcon} />
                <span>Thời gian làm bài được tính từ khi bài thi bắt đầu.</span>
              </div>
              <div className={s.ruleLine}>
                <Radio size={16} className={s.ruleIcon} />
                <span>
                  Âm thanh (phần Nghe) được phát theo đúng tiến trình bài thi, không thể phát lại hoặc tua.
                </span>
              </div>
              <div className={s.ruleLine}>
                <Cloud size={16} className={s.ruleIcon} />
                <span>Câu trả lời được tự động lưu trong quá trình làm bài.</span>
              </div>
              <div className={s.ruleLine}>
                <Ban size={16} className={s.ruleIcon} />
                <span>Không thể xem gợi ý, đáp án hoặc bản dịch trong khi làm bài.</span>
              </div>
              <div className={s.ruleLine}>
                <Send size={16} className={s.ruleIcon} />
                <span>Khi hết thời gian, hệ thống sẽ tự động nộp bài.</span>
              </div>
            </div>
          </div>

          {/* Card 5: 4. Kiểm tra thiết bị thực tế */}
          <div className={s.glassCard}>
            <h2 className={s.cardHead}>
              <Settings size={17} /> 4. Kiểm tra thiết bị
            </h2>

            <div className={s.interactiveTestsStack}>
              {/* Audio Test Row */}
              <div className={s.interactiveRow}>
                <span className={s.interactiveLabel}>
                  <Headphones size={15} /> Kiểm tra âm thanh
                </span>
                <div className={s.audioMiniBar}>
                  <button
                    type="button"
                    className={s.miniPlayBtn}
                    onClick={playAudioChime}
                    disabled={audioPlaying}
                  >
                    <Play size={12} fill="currentColor" />
                  </button>
                  <span className={s.miniTime}>0:00 / 0:05</span>
                  <div className={s.miniWaveTrack}>
                    <div
                      className={s.miniWaveFill}
                      style={{ width: audioPlaying ? "100%" : audioTested ? "100%" : "0%" }}
                    />
                  </div>
                  <Volume2 size={14} className={s.miniSpeaker} />
                </div>
                <button
                  type="button"
                  className={s.checkBtn}
                  onClick={playAudioChime}
                  disabled={audioPlaying}
                >
                  {audioPlaying ? "Đang phát..." : "Kiểm tra"}
                </button>
              </div>

              {/* Network Latency Row */}
              <div className={s.interactiveRow}>
                <span className={s.interactiveLabel}>
                  <Wifi size={15} /> Kiểm tra kết nối mạng
                </span>
                <div className={s.statusPillMiddle}>
                  <CheckCircle2 size={13} />
                  <span>
                    {networkTested
                      ? `Kết nối ổn định (${networkLatency ?? 0}ms)`
                      : "Chưa kiểm tra"}
                  </span>
                </div>
                <button
                  type="button"
                  className={s.checkBtn}
                  onClick={checkNetwork}
                  disabled={networkChecking}
                >
                  {networkChecking ? "Đang đo..." : "Kiểm tra"}
                </button>
              </div>

              {/* Chinese IME Typing Row */}
              <div className={s.interactiveRow}>
                <span className={s.interactiveLabel}>
                  <FileText size={15} /> Kiểm tra nhập tiếng Trung
                </span>
                <div style={{ display: "flex", gap: 8, flex: 1, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Thử nhập tiếng Trung... (例如: 你好)"
                    value={imeInput}
                    onChange={(e) => handleImeInput(e.target.value)}
                    className={s.imeTypingInput}
                    style={{ flex: 1 }}
                  />
                  {!imeTested && (
                    <button
                      type="button"
                      className={s.checkBtn}
                      style={{ padding: "6px 10px", fontSize: 11, whiteSpace: "nowrap" }}
                      onClick={() => {
                        setImeInput("你好");
                        setImeTested(true);
                      }}
                      title="Nhấp để tự động điền '你好' nếu máy bạn chưa cài bộ gõ tiếng Trung"
                    >
                      Thử: 你好
                    </button>
                  )}
                </div>
              </div>

              {/* Microphone Row if HSK 7-9 */}
              {needsMic && (
                <div className={s.interactiveRow}>
                  <span className={s.interactiveLabel}>
                    <Mic size={15} /> Kiểm tra micro (Khẩu ngữ)
                  </span>
                  <div className={s.statusPillMiddle}>
                    <CheckCircle2 size={13} />
                    <span>{micTested ? "Micro sẵn sàng" : "Chưa thử"}</span>
                  </div>
                  <button
                    type="button"
                    className={s.checkBtn}
                    onClick={checkMicrophone}
                    disabled={micChecking}
                  >
                    {micChecking ? "Đang thu..." : "Kiểm tra"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 3: FULL WIDTH CARD (5. XÁC NHẬN THAM GIA & NÚT BẮT ĐẦU THI)
           ========================================================================= */}
        <div className={s.bottomConfirmCard}>
          <div className={s.confirmLeftCol}>
            <h2 className={s.cardHead}>
              <CheckCircle2 size={18} /> 5. Xác nhận tham gia
            </h2>
            <div className={s.checkboxStack}>
              <label className={s.checkRow}>
                <input
                  type="checkbox"
                  checked={agreedRules}
                  onChange={(e) => setAgreedRules(e.target.checked)}
                />
                <span>Tôi đã đọc và đồng ý với các quy định và lưu ý khi thi.</span>
              </label>

              <label className={s.checkRow}>
                <input
                  type="checkbox"
                  checked={agreedDevices}
                  onChange={(e) => setAgreedDevices(e.target.checked)}
                />
                <span>
                  Tôi xác nhận thiết bị, âm thanh, mạng và bàn phím tiếng Trung đã sẵn sàng.
                </span>
              </label>
            </div>
          </div>

          <div className={s.confirmRightCol}>
            {role === "ADMIN" && onEdit && (
              <button
                type="button"
                className={s.resumeBigBtn}
                style={{ background: "#f0f6ec", borderColor: "#a4c498", color: "#22411e" }}
                onClick={onEdit}
              >
                ⚙️ Sửa & Cấu hình đề này
              </button>
            )}

            {activeAttempt && onContinueAttempt && (
              <button
                type="button"
                className={s.resumeBigBtn}
                onClick={() => onContinueAttempt(activeAttempt.id)}
              >
                <RotateCcw size={16} /> Tiếp tục bài đang thi
              </button>
            )}

            <button
              type="button"
              className={s.startBigPillBtn}
              disabled={!canStart}
              onClick={handleStartExam}
            >
              <Play size={16} fill="currentColor" />
              <span>{busy ? "Đang chuẩn bị đề..." : "Bắt đầu thi"}</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
