export interface ScheduleRule { id: string; classId: string; title: string; startDate: string; endDate: string | null; weekdays: number[]; startTime: string; endTime: string; room: string; meetUrl: string; color?:string; revision: number; exceptions: ScheduleChange[]; class?: { name: string; level: number } }
export interface ScheduleChange { originalDate: string; date: string; startTime: string; endTime: string; cancelled: boolean; note: string; revision?: number }
export function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value; }
export function addDays(value: string, days: number) { const date = new Date(value + "T00:00:00Z"); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
export function vietnamToday() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
export function occurs(rule: Pick<ScheduleRule, "startDate" | "endDate" | "weekdays">, date: string) { return date >= rule.startDate && (!rule.endDate || date <= rule.endDate) && rule.weekdays.includes(new Date(date + "T00:00:00Z").getUTCDay() || 7); }
export function expandSchedule(rules: ScheduleRule[], from: string, to: string) {
  const items: { color:string; id: string; scheduleId: string; originalDate: string; date: string; title: string; classId: string; className: string; level: number; startTime: string; endTime: string; room: string; meetUrl: string; cancelled: boolean; moved: boolean; note: string; revision: number; exceptionRevision: number }[] = [];
  for (const rule of rules) {
    const dates = new Set<string>();
    for (let date = from; date <= to; date = addDays(date, 1)) if (occurs(rule, date)) dates.add(date);
    for (const exception of rule.exceptions) if (exception.date >= from && exception.date <= to && occurs(rule, exception.originalDate)) dates.add(exception.originalDate);
    for (const originalDate of dates) {
      const change = rule.exceptions.find(item => item.originalDate === originalDate);
      const date = change?.date || originalDate;
      if (date < from || date > to) continue;
      items.push({ color:rule.color||"emerald", id: `${rule.id}:${originalDate}`, scheduleId: rule.id, originalDate, date, title: rule.title, classId: rule.classId, className: rule.class?.name || "", level: rule.class?.level || 1, startTime: change?.startTime || rule.startTime, endTime: change?.endTime || rule.endTime, room: rule.room, meetUrl: rule.meetUrl, cancelled: change?.cancelled || false, moved: Boolean(change && (change.date !== originalDate || change.startTime !== rule.startTime || change.endTime !== rule.endTime)), note: change?.note || "", revision: rule.revision, exceptionRevision: change?.revision || 0 });
    }
  }
  return items.sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
}
export function rulesOverlap(a: Pick<ScheduleRule,"startDate"|"endDate"|"weekdays"|"startTime"|"endTime">, b: Pick<ScheduleRule,"startDate"|"endDate"|"weekdays"|"startTime"|"endTime">) {
  if (a.startTime >= b.endTime || b.startTime >= a.endTime) return false;
  const start = a.startDate > b.startDate ? a.startDate : b.startDate;
  const end = [a.endDate, b.endDate].filter(Boolean).sort()[0] || "9999-12-31";
  for (let index = 0; index < 7; index++) { const day = addDays(start,index); if (day > end) break; if (occurs(a,day) && occurs(b,day)) return true; }
  return false;
}
