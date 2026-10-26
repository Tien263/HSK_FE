"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Flame,
  X,
  Medal,
  Award,
  Sparkles,
  Users,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface ClassLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId?: string;
  className?: string;
  currentUserId?: string;
}

export default function ClassLeaderboardModal({
  isOpen,
  onClose,
  classId,
  className = "Lớp học",
  currentUserId,
}: ClassLeaderboardModalProps) {
  const [scope, setScope] = useState<"CLASS" | "GLOBAL">(classId ? "CLASS" : "GLOBAL");
  const [loading, setLoading] = useState<boolean>(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const queryClass = scope === "CLASS" && classId ? `classId=${classId}&` : "";
      const res = await fetch(`/api/v1/leaderboard?${queryClass}userId=${currentUserId || ""}`, {
        headers: currentUserId ? { "x-user-id": currentUserId } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setLeaderboard(data.items);
          setMyRank(data.currentUserRank || null);
        }
      }
    } catch (e) {
      console.warn("fetchLeaderboard error:", e);
    } finally {
      setLoading(false);
    }
  }, [scope, classId, currentUserId]);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, fetchLeaderboard]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#FFFCF6] border border-[#E5DEC9] w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#204434]">
                Bảng Vàng Thi Đua HSK
              </h3>
              <p className="text-[11px] text-[#315E48]">
                Vinh danh học viên nỗ lực & có chuỗi rèn luyện xuất sắc nhất
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E5DEC9] text-[#315E48] hover:text-[#204434] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scope Switcher: Lớp vs Toàn trường */}
        <div className="flex items-center gap-2 bg-[#FAF7F0] p-1 rounded-2xl border border-[#E5DEC9]">
          {classId && (
            <button
              onClick={() => setScope("CLASS")}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                scope === "CLASS"
                  ? "bg-[#204434] text-white shadow-xs"
                  : "text-[#315E48] hover:text-[#204434]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Trong Lớp ({className})</span>
            </button>
          )}
          <button
            onClick={() => setScope("GLOBAL")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              scope === "GLOBAL"
                ? "bg-[#204434] text-white shadow-xs"
                : "text-[#315E48] hover:text-[#204434]"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Toàn Trường HSK</span>
          </button>
        </div>

        {/* Podium Top 3 */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 pt-2 pb-1 items-end text-center">
            {/* Top 2 */}
            <div className="p-3 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-1">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center mx-auto shadow-xs">
                #2
              </div>
              <div className="font-bold text-xs text-[#204434] truncate">
                {leaderboard[1]?.name}
              </div>
              <div className="text-[10px] text-[#8F6D3B] font-mono font-bold">
                {leaderboard[1]?.totalXp} XP
              </div>
            </div>

            {/* Top 1 */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 shadow-md space-y-1 relative -mt-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-white font-extrabold text-sm flex items-center justify-center mx-auto shadow-sm">
                👑 1
              </div>
              <div className="font-bold text-xs text-[#204434] truncate">
                {leaderboard[0]?.name}
              </div>
              <div className="text-[11px] text-amber-900 font-mono font-extrabold">
                {leaderboard[0]?.totalXp} XP
              </div>
            </div>

            {/* Top 3 */}
            <div className="p-3 rounded-2xl bg-white border border-[#E5DEC9] shadow-2xs space-y-1">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center mx-auto shadow-xs">
                #3
              </div>
              <div className="font-bold text-xs text-[#204434] truncate">
                {leaderboard[2]?.name}
              </div>
              <div className="text-[10px] text-[#8F6D3B] font-mono font-bold">
                {leaderboard[2]?.totalXp} XP
              </div>
            </div>
          </div>
        )}

        {/* Danh sách học viên */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#315E48]">
              Đang tải bảng xếp hạng thi đua...
            </div>
          ) : leaderboard.length > 0 ? (
            leaderboard.map((item, idx) => {
              const isMe = item.id === currentUserId;
              return (
                <div
                  key={item.id || idx}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between text-xs ${
                    isMe
                      ? "bg-emerald-50/80 border-emerald-300 shadow-xs"
                      : "bg-white border-[#E5DEC9]/80 hover:bg-[#FAF7F0]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                        idx === 0
                          ? "bg-amber-400 text-white font-extrabold"
                          : idx === 1
                          ? "bg-slate-300 text-slate-800"
                          : idx === 2
                          ? "bg-amber-200 text-amber-900"
                          : "text-[#6B766D]"
                      }`}
                    >
                      {item.rank}
                    </span>
                    <div>
                      <div className="font-bold text-[#204434] flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-600 text-white text-[9px] font-bold">
                            Bạn
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#6B766D] flex items-center gap-2">
                        <span>HSK {item.currentHskLevel}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5 text-orange-600 font-semibold">
                          <Flame className="w-3 h-3 fill-orange-500" />
                          <span>{item.streakDays} ngày</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-serif font-bold text-sm text-[#204434]">
                      {item.totalXp} <span className="text-[10px] font-sans font-normal text-[#8F6D3B]">XP</span>
                    </div>
                    <div className="text-[9.5px] text-[#315E48]">
                      {item.completedCount} bài xong
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-xs text-[#315E48]">
              Chưa có học sinh nào trong bảng xếp hạng này.
            </div>
          )}
        </div>

        {/* Footer info: Vị trí của bạn */}
        {myRank && (
          <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-[#E5DEC9] text-xs text-[#204434] flex items-center justify-between">
            <span className="font-semibold">
              Vị trí hiện tại của bạn: <strong className="text-emerald-700">Hạng #{myRank}</strong>
            </span>
            <button
              onClick={fetchLeaderboard}
              className="text-[#315E48] hover:text-[#204434] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Cập nhật</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
