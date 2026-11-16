import { Radar } from "lucide-react";
import type { examStatistics } from "@/lib/exam-center-core";
import { levelLabel } from "@/lib/exam-center-core";
import { skillNames } from "./exam-client";
import s from "./ExamCenter.module.css";

export default function HskKnowledgeRadar({ level, statistics }: {
  level: number;
  statistics?: ReturnType<typeof examStatistics>;
}) {
  const measured = statistics?.skills.filter(skill => skill.percent !== null) ?? [];
  const points = (ratio: (index: number) => number) => measured.map((_, index) => {
    const angle = index * 2 * Math.PI / measured.length - Math.PI / 2;
    return [100 + Math.cos(angle) * 82 * ratio(index), 100 + Math.sin(angle) * 82 * ratio(index)].join(",");
  }).join(" ");
  return (
    <section className={s.panel}>
      <div className={s.sectionHeading}><h2><Radar size={20} /> Radar năng lực{level ? ` · ${levelLabel(level)}` : ""}</h2></div>
      {!measured.length ? <p className={s.empty}>Chưa có bài đã chấm để phân tích kỹ năng.</p> : (
        <div className={s.radarReal}>
          {measured.length >= 3 && (
            <svg viewBox="0 0 200 200" aria-hidden="true">
              {[0.25, 0.5, 0.75, 1].map(scale => <polygon key={scale} points={points(() => scale)} fill="none" stroke="#b9cbb9" />)}
              <polygon points={points(index => (measured[index].percent ?? 0) / 100)} fill="#77ae8388" stroke="#326a4b" strokeWidth="2" />
            </svg>
          )}
          <div className={s.skills}>{statistics?.skills.map(skill => (
            <div key={skill.skill}>
              <span>{skillNames[skill.skill]}</span>
              {skill.percent !== null && <progress aria-label={skillNames[skill.skill]} max={100} value={skill.percent} />}
              <small>{skill.percent === null ? "Chưa có điểm" : `${skill.percent}% · ${skill.count} lượt`}</small>
            </div>
          ))}</div>
        </div>
      )}
    </section>
  );
}
