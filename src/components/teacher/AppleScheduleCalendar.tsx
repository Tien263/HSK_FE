"use client";

import {portalFetch} from "@/components/learning/use-portal-data";
import {addDays} from "@/lib/schedule-core";
import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Users,
  CheckCircle2,
  Trash2,
  Edit3,
  ExternalLink,
  X,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  AlertCircle,
  Laptop,
} from "lucide-react";

export interface ScheduleEvent {
  scheduleId?:string;originalDate?:string;revision?:number;exceptionRevision?:number;
  id: string;
  classId: string;
  className: string;
  levelText?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "19:30"
  endTime: string; // "21:00"
  mode: "ONLINE" | "OFFLINE";
  location: string; // "Google Meet" or "Phòng 302, Tòa nhà Hán Ngữ"
  meetUrl?: string;
  lessonTopic: string;
  studentCount?: number;
  color?: "emerald" | "amber" | "blue" | "rose" | "purple";
}

interface AppleScheduleCalendarProps {
  classes: Array<{ id: string; name: string; levelText?: string; studentCount?: number }>;
  onScheduleChange?: (events: ScheduleEvent[]) => void;
}

export default function AppleScheduleCalendar({
  classes,
  onScheduleChange,
}: AppleScheduleCalendarProps) {
  // Navigation & View mode
  const [viewMode, setViewMode] = useState<"month" | "week" | "agenda">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Event states
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states for creating session
  const [formClassId, setFormClassId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formMode, setFormMode] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [formLocation, setFormLocation] = useState("");
  const [formTopic, setFormTopic] = useState("");
  const [formRepeatWeekly, setFormRepeatWeekly] = useState(false);
  const [formColor, setFormColor] = useState<"emerald" | "amber" | "blue" | "purple">("emerald");

  // Format Helper: YYYY-MM-DD
  const formatYYYYMMDD = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Load saved events or default to empty schedule (teacher creates from scratch)


  const [refresh,setRefresh]=useState(0),[calendarError,setCalendarError]=useState(""),[saving,setSaving]=useState(false),[editingEvent,setEditingEvent]=useState<ScheduleEvent|null>(null),[repeatDays,setRepeatDays]=useState<number[]>([]),[changeNote,setChangeNote]=useState("");
  useEffect(()=>{let active=true;const first=new Date(currentDate.getFullYear(),currentDate.getMonth(),1);first.setDate(first.getDate()-(first.getDay()+6)%7);const from=formatYYYYMMDD(first);portalFetch<{items:any[]}>("/api/v1/schedules?from="+from+"&to="+addDays(from,41)).then(result=>{if(!active)return;const rows:ScheduleEvent[]=result.items.filter(row=>!row.cancelled&&classes.some(item=>item.id===row.classId)).map(row=>({...row,mode:row.meetUrl?"ONLINE":"OFFLINE",location:row.room,lessonTopic:row.title,levelText:"HSK "+row.level,studentCount:classes.find(item=>item.id===row.classId)?.studentCount}));setEvents(rows);onScheduleChange?.(rows);setCalendarError("");}).catch(error=>{if(active)setCalendarError(error.message);});return()=>{active=false;};},[currentDate,refresh,classes]);
  // Navigations
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === "week") {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === "week") {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Add new session handler
  const handleCreateSession = async(e:React.FormEvent)=>{e.preventDefault();if(!formClassId){setCalendarError("Chọn lớp học.");return;}setCalendarError("");setSaving(true);try{if(editingEvent){await portalFetch("/api/v1/schedules",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editingEvent.scheduleId,originalDate:editingEvent.originalDate,date:formDate,startTime:formStartTime,endTime:formEndTime,cancelled:false,note:changeNote,revision:editingEvent.revision,exceptionRevision:editingEvent.exceptionRevision})});}else{const day=new Date(formDate+"T12:00:00Z").getUTCDay()||7;await portalFetch("/api/v1/schedules",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({classId:formClassId,title:formTopic,startDate:formDate,endDate:formRepeatWeekly?null:formDate,weekdays:formRepeatWeekly&&repeatDays.length?repeatDays:[day],startTime:formStartTime,endTime:formEndTime,room:formMode==="OFFLINE"?formLocation:"",meetUrl:formMode==="ONLINE"?formLocation:"",color:formColor})});}setIsAddModalOpen(false);setSelectedEvent(null);setEditingEvent(null);setRefresh(value=>value+1);}catch(error){setCalendarError((error as Error).message);}finally{setSaving(false);}};

  // Delete session handler
  const handleDeleteEvent = async(id:string)=>{const event=events.find(row=>row.id===id);if(!event)return;setCalendarError("");try{await portalFetch("/api/v1/schedules",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:event.scheduleId,originalDate:event.originalDate,date:event.date,startTime:event.startTime,endTime:event.endTime,cancelled:true,note:"Giáo viên hủy riêng buổi học",revision:event.revision,exceptionRevision:event.exceptionRevision})});setSelectedEvent(null);setRefresh(value=>value+1);}catch(error){setCalendarError((error as Error).message);}};

  // Copy link helper
  const handleCopyLink = (url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Date Calculation for Month Grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Vietnam / ISO starts week on Monday: 0=Mon, 1=Tue, ..., 6=Sun
  const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  // Days before
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const daysBefore: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
  for (let i = startDayIndex - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const dateObj = new Date(year, month - 1, d);
    daysBefore.push({
      day: d,
      dateStr: formatYYYYMMDD(dateObj),
      isCurrentMonth: false,
    });
  }

  // Days of current month
  const currentMonthDays: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    currentMonthDays.push({
      day: d,
      dateStr: formatYYYYMMDD(dateObj),
      isCurrentMonth: true,
    });
  }

  // Days after to fill 35 or 42 grid cells
  const totalCellsSoFar = daysBefore.length + currentMonthDays.length;
  const targetTotal = totalCellsSoFar > 35 ? 42 : 35;
  const daysAfter: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
  for (let d = 1; d <= targetTotal - totalCellsSoFar; d++) {
    const dateObj = new Date(year, month + 1, d);
    daysAfter.push({
      day: d,
      dateStr: formatYYYYMMDD(dateObj),
      isCurrentMonth: false,
    });
  }

  const allMonthCells = [...daysBefore, ...currentMonthDays, ...daysAfter];
  const todayStr = formatYYYYMMDD(new Date());

  // Week View calculation: 7 days of the current week (Monday -> Sunday)
  const getWeekDates = (baseDate: Date) => {
    const d = new Date(baseDate);
    const day = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - day); // Start at Monday
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  // Month Title (e.g. "Tháng 10, 2026")
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  const dayHeaderNames = ["Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "CN"];

  // Helper for color styles
  const getColorStyles = (color?: string, mode?: string) => {
    if (color === "amber" || mode === "OFFLINE") {
      return {
        bg: "bg-amber-50 hover:bg-amber-100",
        border: "border-amber-300",
        text: "text-amber-900",
        dot: "bg-amber-500",
        badge: "bg-amber-100 text-amber-800",
      };
    }
    if (color === "blue") {
      return {
        bg: "bg-sky-50 hover:bg-sky-100",
        border: "border-sky-300",
        text: "text-sky-900",
        dot: "bg-sky-500",
        badge: "bg-sky-100 text-sky-800",
      };
    }
    if (color === "purple") {
      return {
        bg: "bg-purple-50 hover:bg-purple-100",
        border: "border-purple-300",
        text: "text-purple-900",
        dot: "bg-purple-500",
        badge: "bg-purple-100 text-purple-800",
      };
    }
    // Default Emerald
    return {
      bg: "bg-emerald-50 hover:bg-emerald-100",
      border: "border-emerald-300",
      text: "text-emerald-900",
      dot: "bg-emerald-600",
      badge: "bg-emerald-100 text-emerald-800",
    };
  };

  return (
    <div className="space-y-4">{calendarError&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{calendarError}</p>}
      {/* =================================================================== */}
      {/* 1. APPLE CALENDAR TOP TOOLBAR */}
      {/* =================================================================== */}
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Navigation and Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1.5 bg-[#FAF7F0] p-1 rounded-2xl border border-[#E5DEC9]/70">
            <button
              onClick={handlePrev}
              title="Kỳ trước"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#204434] hover:bg-white transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold rounded-xl text-[#204434] hover:bg-white transition cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              onClick={handleNext}
              title="Kỳ tiếp theo"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#204434] hover:bg-white transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-serif font-bold text-lg text-[#204434] tracking-tight">
            {monthNames[month]}, {year}
          </h3>
        </div>

        {/* Right: Segmented Switcher & Add Session */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Apple-style Segmented Control */}
          <div className="inline-flex bg-[#FAF7F0] p-1 rounded-2xl border border-[#E5DEC9]/70 text-xs font-medium">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-xl transition ${
                viewMode === "month"
                  ? "bg-white text-[#204434] font-bold shadow-2xs"
                  : "text-[#315E48] hover:text-[#204434]"
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-xl transition ${
                viewMode === "week"
                  ? "bg-white text-[#204434] font-bold shadow-2xs"
                  : "text-[#315E48] hover:text-[#204434]"
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1.5 rounded-xl transition ${
                viewMode === "agenda"
                  ? "bg-white text-[#204434] font-bold shadow-2xs"
                  : "text-[#315E48] hover:text-[#204434]"
              }`}
            >
              Danh sách ({events.length})
            </button>
          </div>

          {/* Clear all schedules button */}
          {events.length > 0 && (
            <button onClick={async()=>{if(!confirm("Xóa toàn bộ chuỗi lịch của những lớp đang hiển thị?"))return;try{const data=await portalFetch<{rules:{id:string;classId:string}[]}>("/api/v1/schedules");for(const rule of data.rules.filter(row=>classes.some(item=>item.id===row.classId)))await portalFetch("/api/v1/schedules?id="+rule.id,{method:"DELETE"});setSelectedEvent(null);setRefresh(value=>value+1);}catch(error){setCalendarError((error as Error).message);}}} className="rounded-xl border border-red-200 px-3 py-2 text-xs text-red-700">Xóa chuỗi lịch</button>
          )}

          {/* Add Session Button */}
          <button
            onClick={() => {
              if (classes.length > 0) setFormClassId(classes[0].id);
              setFormDate(todayStr);
              setEditingEvent(null);setFormClassId(classes[0]?.id||"");setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-2xl bg-[#204434] text-white hover:bg-[#183629] text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm ca dạy</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. CALENDAR BODY: MONTH VIEW */}
      {/* =================================================================== */}
      {viewMode === "month" && (
        <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl overflow-hidden shadow-2xs">
          {/* Day Headers (Th 2 -> CN) */}
          <div className="grid grid-cols-7 border-b border-[#E5DEC9] bg-[#FAF7F0] text-center text-xs font-semibold text-[#315E48] py-2.5">
            {dayHeaderNames.map((dName, idx) => (
              <div key={dName} className={idx >= 5 ? "text-amber-700/80" : ""}>
                {dName}
              </div>
            ))}
          </div>

          {/* Month 7x5 or 7x6 Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#E5DEC9]">
            {allMonthCells.map((cell, index) => {
              const isToday = cell.dateStr === todayStr;
              const cellEvents = events.filter((e) => e.date === cell.dateStr);

              return (
                <div
                  key={`${cell.dateStr}-${index}`}
                  onClick={() => {
                    // Open quick add for this day if clicked on empty area
                    setFormDate(cell.dateStr);
                  }}
                  className={`min-h-[110px] p-1.5 flex flex-col justify-between transition group relative ${
                    cell.isCurrentMonth ? "bg-white/80" : "bg-[#FAF7F0]/40 text-gray-400"
                  } hover:bg-[#FFFBF0]/60`}
                >
                  {/* Date Number Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex items-center justify-center text-xs font-bold w-6 h-6 rounded-full transition ${
                        isToday
                          ? "bg-[#204434] text-white shadow-xs"
                          : cell.isCurrentMonth
                          ? "text-[#204434]"
                          : "text-gray-400 font-normal"
                      }`}
                    >
                      {cell.day}
                    </span>

                    {/* Quick "+" hover button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormDate(cell.dateStr);
                        if (classes.length > 0) setFormClassId(classes[0].id);
                        setIsAddModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[#204434] hover:bg-[#204434]/10 rounded-md p-0.5 transition cursor-pointer"
                      title="Thêm ca dạy ngày này"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Events stack inside day cell */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {cellEvents.slice(0, 3).map((ev) => {
                      const colorStyle = getColorStyles(ev.color, ev.mode);
                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`px-1.5 py-1 rounded-lg border text-[11px] leading-tight font-medium cursor-pointer transition truncate flex items-center gap-1 shadow-2xs ${colorStyle.bg} ${colorStyle.border} ${colorStyle.text}`}
                          title={`${ev.startTime} - ${ev.className} (${ev.mode})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorStyle.dot}`} />
                          <span className="font-bold text-[10px] shrink-0">{ev.startTime}</span>
                          <span className="truncate">{ev.className}</span>
                        </div>
                      );
                    })}

                    {cellEvents.length > 3 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(cellEvents[0]);
                        }}
                        className="text-[10px] text-[#315E48] font-semibold text-center cursor-pointer hover:underline"
                      >
                        +{cellEvents.length - 3} ca nữa
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. CALENDAR BODY: WEEK VIEW */}
      {/* =================================================================== */}
      {viewMode === "week" && (
        <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl overflow-hidden shadow-2xs">
          {/* Week Day Header */}
          <div className="grid grid-cols-7 border-b border-[#E5DEC9] bg-[#FAF7F0] divide-x divide-[#E5DEC9]">
            {weekDates.map((d, idx) => {
              const dStr = formatYYYYMMDD(d);
              const isToday = dStr === todayStr;
              return (
                <div key={dStr} className="p-3 text-center">
                  <div className="text-[11px] font-semibold text-[#315E48]">{dayHeaderNames[idx]}</div>
                  <div
                    className={`inline-flex items-center justify-center text-sm font-bold w-7 h-7 rounded-full mt-1 ${
                      isToday ? "bg-[#204434] text-white shadow-xs" : "text-[#204434]"
                    }`}
                  >
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week Columns with Sessions */}
          <div className="grid grid-cols-7 divide-x divide-[#E5DEC9] min-h-[460px] bg-white">
            {weekDates.map((d) => {
              const dStr = formatYYYYMMDD(d);
              const dayEvents = events.filter((e) => e.date === dStr);

              return (
                <div
                  key={dStr}
                  className="p-2 space-y-2 bg-[#FFFCF6]/40 hover:bg-[#FFFBF0]/50 transition flex flex-col"
                >
                  {dayEvents.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[11px] text-gray-300 italic">
                      Trống
                    </div>
                  ) : (
                    dayEvents.map((ev) => {
                      const style = getColorStyles(ev.color, ev.mode);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-2.5 rounded-2xl border shadow-2xs cursor-pointer transition hover:scale-[1.02] ${style.bg} ${style.border} ${style.text}`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span>{ev.startTime} - {ev.endTime}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] uppercase font-bold ${style.badge}`}>
                              {ev.mode}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs mt-1 leading-snug line-clamp-2">{ev.className}</h4>
                          <p className="text-[10px] opacity-80 mt-1 line-clamp-1 flex items-center gap-1">
                            {ev.mode === "ONLINE" ? <Video className="w-2.5 h-2.5 shrink-0" /> : <MapPin className="w-2.5 h-2.5 shrink-0" />}
                            <span>{ev.location}</span>
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. CALENDAR BODY: AGENDA / LIST VIEW */}
      {/* =================================================================== */}
      {viewMode === "agenda" && (
        <div className="bg-[#FFFCF6] border border-[#E5DEC9] rounded-3xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-base text-[#204434]">
              Toàn bộ lịch dạy ({events.length} ca học)
            </h4>
            <span className="text-xs text-[#315E48]">Sắp xếp theo thứ tự thời gian</span>
          </div>

          {events.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs text-[#315E48]">Chưa có ca dạy nào được thiết lập. Nhấn "+ Thêm ca dạy" nhé!</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5DEC9]/80">
              {events
                .slice()
                .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
                .map((ev) => {
                  const style = getColorStyles(ev.color, ev.mode);
                  const isToday = ev.date === todayStr;

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-[#FFFBF0]/60 px-3 rounded-2xl transition cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#204434]/10 text-[#204434] flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-semibold uppercase">
                            {ev.date.split("-")[1]}/{ev.date.split("-")[2]}
                          </span>
                          <span className="text-xs font-bold">{ev.startTime}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#204434]">{ev.className}</h4>
                            {isToday && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#204434] text-white">
                                Hôm nay
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${style.badge}`}>
                              {ev.mode}
                            </span>
                          </div>

                          <p className="text-xs text-[#315E48] mt-0.5 font-medium">{ev.lessonTopic}</p>

                          <div className="flex items-center gap-3 text-[11px] text-[#8ea394] mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {ev.startTime} - {ev.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              {ev.mode === "ONLINE" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                              {ev.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {ev.studentCount ?? 0} học viên
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        {ev.mode === "ONLINE" ? (
                          <a
                            href={ev.meetUrl || "https://meet.google.com/new"}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3.5 py-1.5 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Vào lớp ngay</span>
                          </a>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(ev);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold hover:bg-[#FAF7F0] transition"
                          >
                            Xem giáo án
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. MODAL: SESSION DETAILS & APPLE INSPECTOR */}
      {/* =================================================================== */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl p-6 shadow-2xl space-y-5 animate-scaleUp">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mb-1.5 ${
                  selectedEvent.mode === "ONLINE" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {selectedEvent.mode === "ONLINE" ? "Trực tuyến (Google Meet / Zoom)" : "Trực tiếp (Tại trung tâm)"}
                </span>
                <h3 className="font-serif font-bold text-xl text-[#204434] leading-snug">
                  {selectedEvent.className}
                </h3>
                <p className="text-xs text-[#315E48]">{selectedEvent.levelText || "Khóa đào tạo HSK chuẩn"}</p>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5DEC9]/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#315E48] flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#204434]" />
                  Ngày học:
                </span>
                <span className="font-bold text-[#204434]">{selectedEvent.date}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#315E48] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#204434]" />
                  Thời gian:
                </span>
                <span className="font-bold text-[#204434]">
                  {selectedEvent.startTime} - {selectedEvent.endTime} (90 phút)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#315E48] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#204434]" />
                  Sĩ số:
                </span>
                <span className="font-bold text-[#204434]">
                  {selectedEvent.studentCount ?? 0} học sinh đã ghi danh
                </span>
              </div>

              <div className="pt-2 border-t border-[#E5DEC9]">
                <span className="text-[#315E48] block mb-1 font-medium">Chủ đề bài giảng:</span>
                <p className="font-semibold text-[#204434] bg-white p-2.5 rounded-xl border border-[#E5DEC9]/60">
                  {selectedEvent.lessonTopic}
                </p>
              </div>

              {selectedEvent.mode === "ONLINE" && (
                <div className="pt-2 border-t border-[#E5DEC9] space-y-2">
                  <span className="text-[#315E48] block font-medium">Đường dẫn phòng học trực tuyến:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedEvent.meetUrl || "https://meet.google.com/new"}
                      className="w-full text-xs bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 text-[#204434] font-mono select-all"
                    />
                    <button
                      onClick={() => handleCopyLink(selectedEvent.meetUrl || "https://meet.google.com/new")}
                      className="px-3 py-2 rounded-xl bg-white border border-[#E5DEC9] text-[#204434] text-xs font-semibold flex items-center gap-1 hover:bg-[#FAF7F0] cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? "Đã chép" : "Chép"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hủy ca dạy này</span>
              </button>

              <div className="flex items-center gap-2"><button className="rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs" onClick={()=>{setEditingEvent(selectedEvent);setFormClassId(selectedEvent.classId);setFormDate(selectedEvent.date);setFormStartTime(selectedEvent.startTime);setFormEndTime(selectedEvent.endTime);setFormLocation(selectedEvent.meetUrl||selectedEvent.location);setFormTopic(selectedEvent.lessonTopic);setFormMode(selectedEvent.mode);setIsAddModalOpen(true);setSelectedEvent(null);}}>Đổi buổi học</button>
                {selectedEvent.mode === "ONLINE" ? (
                  <a
                    href={selectedEvent.meetUrl || "https://meet.google.com/new"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Mở phòng Meet ngay</span>
                  </a>
                ) : (
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-xs transition"
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. MODAL: + THÊM CA DẠY / BUỔI HỌC MỚI */}
      {/* =================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <form
            role="dialog" aria-label={editingEvent?"Đổi buổi học":"Thêm ca dạy"}
            onSubmit={handleCreateSession}
            className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#204434]/10 text-[#204434] flex items-center justify-center font-bold">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#204434]">Thêm ca dạy mới</h3>
                  <p className="text-[11px] text-[#315E48]">Lên lịch học trực tuyến hoặc trực tiếp tại trung tâm</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              {/* Select Class */}
              <div>
                <label className="block font-semibold text-[#204434] mb-1">Chọn lớp phụ trách *</label>
                <select
                  disabled={!!editingEvent} value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 text-[#204434] font-medium"
                  required
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.levelText || "Khóa học"})
                    </option>
                  ))}
                  {classes.length === 0 && <option value="">Chưa có lớp học được phân công</option>}
                </select>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#204434] mb-1">Ngày học *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 text-[#204434]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#204434] mb-1">Giờ bắt đầu *</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 text-[#204434]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#204434] mb-1">Giờ kết thúc *</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 text-[#204434]"
                    required
                  />
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block font-semibold text-[#204434] mb-1">Hình thức giảng dạy *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={!!editingEvent} onClick={() => {
                      setFormMode("ONLINE");
                      setFormLocation("");
                      setFormColor("emerald");
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2 cursor-pointer transition ${
                      formMode === "ONLINE"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                        : "bg-white border-[#E5DEC9] text-[#315E48]"
                    }`}
                  >
                    <Video className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs">Trực tuyến (Online)</div>
                      <div className="text-[10px] opacity-75">Google Meet / Zoom</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormMode("OFFLINE");
                      setFormLocation("");
                      setFormColor("amber");
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2 cursor-pointer transition ${
                      formMode === "OFFLINE"
                        ? "bg-amber-50 border-amber-500 text-amber-900 font-bold"
                        : "bg-white border-[#E5DEC9] text-[#315E48]"
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs">Trực tiếp (Offline)</div>
                      <div className="text-[10px] opacity-75">Phòng học trung tâm</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Location or Meet Link */}
              <div>
                <label className="block font-semibold text-[#204434] mb-1">
                  {formMode === "ONLINE" ? "Đường link Google Meet / Zoom" : "Địa điểm phòng học"} *
                </label>
                <input
                  type="text"
                  readOnly={!!editingEvent} value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder={formMode === "ONLINE" ? "https://meet.google.com/..." : "Phòng 302, Cơ sở 1..."}
                  className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 text-[#204434]"
                  required
                />
              </div>

              {/* Topic */}
              <div>
                <label className="block font-semibold text-[#204434] mb-1">Chủ đề bài giảng / Giáo án *</label>
                <input
                  type="text"
                  readOnly={!!editingEvent} value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="Ví dụ: Bài 4 - Ôn tập thanh điệu và ngữ pháp câu chữ 把"
                  className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 text-[#204434]"
                  required
                />
              </div>

              {/* Repeat Checkbox */}
              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E5DEC9]/60 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="repeatWeekly"
                  disabled={!!editingEvent} checked={formRepeatWeekly}
                  onChange={(e) => setFormRepeatWeekly(e.target.checked)}
                  className="w-4 h-4 text-[#204434] rounded cursor-pointer"
                />
                <label htmlFor="repeatWeekly" className="text-xs text-[#204434] font-medium cursor-pointer">
                  Tự động lặp theo tuần cho đến khi thay đổi hoặc xóa chuỗi lịch
                </label>
              </div>
            </div>

            {formRepeatWeekly&&!editingEvent&&<fieldset className="flex flex-wrap gap-3 text-xs"><legend className="mb-2 font-semibold">Lặp vào các thứ</legend>{[1,2,3,4,5,6,7].map(day=><label key={day} className="flex items-center gap-1"><input type="checkbox" checked={repeatDays.includes(day)} onChange={event=>setRepeatDays(previous=>event.target.checked?[...previous,day]:previous.filter(value=>value!==day))}/>{day===7?"CN":"T"+(day+1)}</label>)}</fieldset>}{editingEvent&&<label className="block text-xs">Ghi chú đổi lịch<textarea className="mt-2 w-full rounded-xl border border-[#E5DEC9] p-3" value={changeNote} onChange={event=>setChangeNote(event.target.value)}/></label>}{calendarError&&<p role="alert" className="text-xs text-red-700">{calendarError}</p>}
            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DEC9]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button disabled={saving}
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#204434] hover:bg-[#183629] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving?"Đang lưu…":editingEvent?"Lưu thay đổi buổi học":"Lưu ca dạy"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
