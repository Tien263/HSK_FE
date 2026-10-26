"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Gift,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface QuestItem {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentUsername?: string;
  onXpClaimed?: (newXp: number) => void;
}

export default function DailyQuestsModal({
  isOpen,
  onClose,
  studentId,
  studentUsername,
  onXpClaimed,
}: DailyQuestsModalProps) {
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [streakDays, setStreakDays] = useState(1);
  const [totalXp, setTotalXp] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    try {
      let query = "";
      if (studentId) query = `studentId=${encodeURIComponent(studentId)}`;
      else if (studentUsername) query = `username=${encodeURIComponent(studentUsername)}`;

      const res = await fetch(`/api/v1/my/daily-quests?${query}`);
      const data = await res.json();
      if (data.success && data.data) {
        setQuests(data.data.quests || []);
        setStreakDays(data.data.student.streakDays || 1);
        setTotalXp(data.data.student.totalXp || 0);
        setCompletedCount(data.data.progress.completedCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [studentId, studentUsername]);

  useEffect(() => {
    if (isOpen) {
      fetchQuests();
      setClaimMessage(null);
    }
  }, [isOpen, fetchQuests]);

  const handleClaim = async (questId: string) => {
    setClaimingId(questId);
    setClaimMessage(null);
    try {
      const res = await fetch("/api/v1/my/daily-quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          username: studentUsername,
          questId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimMessage(data.message);
        setTotalXp(data.totalXp);
        if (onXpClaimed) onXpClaimed(data.totalXp);
        fetchQuests();
      } else {
        setClaimMessage(data.message || "Không thể nhận thưởng");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClaimingId(null);
    }
  };

  if (!isOpen) return null;

  const progressPercent = Math.round((completedCount / (quests.length || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with Streak Banner */}
        <div className="relative px-6 py-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15 pointer-events-none text-9xl">
            🔥
          </div>

          <div className="flex items-center justify-between relative z-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                🔥
              </div>
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  Nhiệm vụ Hàng ngày & Chuỗi Streak
                </h2>
                <p className="text-xs text-orange-100 font-medium">
                  Hoàn thành nhiệm vụ mỗi ngày để giữ vững chuỗi học tập và tích lũy XP
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-400/40 flex items-center justify-center text-xl font-bold">
                🔥
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-orange-100 font-bold">Chuỗi ngày học</div>
                <div className="text-xl font-black text-white">{streakDays} Ngày liên tiếp</div>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/40 flex items-center justify-center text-xl font-bold">
                ⭐
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-amber-100 font-bold">Tổng điểm tích lũy</div>
                <div className="text-xl font-black text-white">{totalXp} XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quest Progress Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tiến độ hôm nay: {completedCount} / {quests.length} nhiệm vụ
            </span>
            <span className="text-amber-600 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modal Body: List of Quests */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-100/50">
          {claimMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {claimMessage}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <div className="animate-spin text-3xl mb-2">⏳</div>
              <p className="text-sm font-medium">Đang kiểm tra tiến độ nhiệm vụ...</p>
            </div>
          ) : (
            quests.map((quest) => (
              <div
                key={quest.id}
                className={`bg-white rounded-2xl p-4 border-2 transition-all flex items-center justify-between gap-4 ${
                  quest.isClaimed
                    ? "border-slate-200 opacity-60 bg-slate-50"
                    : quest.isCompleted
                    ? "border-amber-400 bg-amber-50/40 shadow-md ring-2 ring-amber-200/60"
                    : "border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900">{quest.title}</span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      +{quest.rewardXp} XP
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{quest.description}</p>
                </div>

                <div>
                  {quest.isClaimed ? (
                    <span className="px-3.5 py-1.5 rounded-xl bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã nhận
                    </span>
                  ) : quest.isCompleted ? (
                    <button
                      onClick={() => handleClaim(quest.id)}
                      disabled={claimingId === quest.id}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md hover:shadow-lg active:scale-95 transition flex items-center gap-1.5 animate-bounce"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      {claimingId === quest.id ? "Đang nhận..." : "Nhận thưởng!"}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium border border-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Chưa xong
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Tự động làm mới nhiệm vụ vào 00:00 hàng ngày</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
