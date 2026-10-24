"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Users,
  FileCheck2,
  Calendar,
  Layers,
  Trash2,
  Archive,
  ChevronRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { ClassDetailItem } from "./types";

interface ClassesListProps {
  classes: ClassDetailItem[];
  loading: boolean;
  selectedBulkClassIds: string[];
  setSelectedBulkClassIds: (ids: string[]) => void;
  onSelectClass: (classId: string) => void;
  onOpenCreateClassModal: () => void;
  onBulkDeleteClasses: () => void;
  isBulkDeleting: boolean;
}

export default function ClassesList({
  classes,
  loading,
  selectedBulkClassIds,
  setSelectedBulkClassIds,
  onSelectClass,
  onOpenCreateClassModal,
  onBulkDeleteClasses,
  isBulkDeleting,
}: ClassesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"MANAGING" | "ARCHIVED">("MANAGING");
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");

  const filteredClasses = useMemo(() => {
    return classes.filter((cl) => {
      if (filterTab === "MANAGING" && (cl.isArchived || cl.status === "ARCHIVED")) return false;
      if (filterTab === "ARCHIVED" && !cl.isArchived && cl.status !== "ARCHIVED") return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        cl.name.toLowerCase().includes(q) ||
        cl.code.toLowerCase().includes(q) ||
        (cl.description && cl.description.toLowerCase().includes(q))
      );
    });
  }, [classes, filterTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-serif font-bold text-[#17382F]">
              Quản lý Lớp học
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1F513F]/10 text-[#1F513F] text-xs font-semibold">
              {classes.filter((c) => !c.isArchived && c.status !== "ARCHIVED").length} lớp đang hoạt động
            </span>
          </div>
          <p className="text-xs text-[#6B766D] mt-1">
            Tạo lớp, tùy chỉnh nội dung 15 bài học, giao bài tập và đồng bộ tiến độ học sinh thời gian thực.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateClassModal}
          className="px-5 py-2.5 rounded-xl bg-[#1F513F] hover:bg-[#17382F] text-white text-xs font-bold shadow-md transition flex items-center justify-center cursor-pointer self-start md:self-auto"
        >
          <span>Tạo lớp học mới</span>
        </button>
      </div>

      {/* Toolbar: Search, Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F7F5EE] p-1 rounded-2xl border border-[#E5DFD0] text-xs">
          <button
            type="button"
            onClick={() => setFilterTab("MANAGING")}
            className={`px-3.5 py-1.5 rounded-xl transition font-semibold cursor-pointer ${
              filterTab === "MANAGING"
                ? "bg-white text-[#1F513F] shadow-2xs font-bold"
                : "text-[#6B766D] hover:text-[#17382F]"
            }`}
          >
            Đang quản lý ({classes.filter((c) => !c.isArchived && c.status !== "ARCHIVED").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("ARCHIVED")}
            className={`px-3.5 py-1.5 rounded-xl transition font-semibold cursor-pointer ${
              filterTab === "ARCHIVED"
                ? "bg-white text-[#1F513F] shadow-2xs font-bold"
                : "text-[#6B766D] hover:text-[#17382F]"
            }`}
          >
            Lưu trữ ({classes.filter((c) => c.isArchived || c.status === "ARCHIVED").length})
          </button>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B766D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã lớp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-[#E5DFD0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#17382F] focus:outline-hidden w-60 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F7F5EE] p-1 rounded-xl border border-[#E5DFD0]">
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "GRID" ? "bg-white text-[#1F513F] shadow-2xs" : "text-[#6B766D]"
              }`}
              title="Dạng lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("LIST")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "LIST" ? "bg-white text-[#1F513F] shadow-2xs" : "text-[#6B766D]"
              }`}
              title="Dạng danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedBulkClassIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700" />
            <span>Đã chọn {selectedBulkClassIds.length} lớp học</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedBulkClassIds([])}
              className="px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              disabled={isBulkDeleting}
              onClick={onBulkDeleteClasses}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBulkDeleting ? "Đang xóa..." : `Xóa ${selectedBulkClassIds.length} lớp đã chọn`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Classes Grid or List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#6B766D] rounded-3xl bg-[#FFFCF7] border border-[#E5DFD0]">
          <div className="w-6 h-6 border-2 border-[#1F513F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p>Đang tải danh sách lớp học...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-[#E5DFD0] bg-[#FFFCF7] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F7F5EE] text-[#1F513F] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="font-serif font-bold text-base text-[#17382F]">
            {filterTab === "ARCHIVED" ? "Không có lớp học nào trong mục lưu trữ" : "Chưa có lớp học nào phù hợp"}
          </h4>
          <p className="text-xs text-[#6B766D] max-w-sm mx-auto">
            {filterTab === "ARCHIVED"
              ? "Các lớp học cũ khi lưu trữ sẽ xuất hiện ở đây để bảo tồn lịch sử học tập."
              : "Hãy tạo lớp học mới để bắt đầu giảng dạy và giao bài tập cho học viên."}
          </p>
          {filterTab === "MANAGING" && (
            <button
              type="button"
              onClick={onOpenCreateClassModal}
              className="px-4 py-2 rounded-xl bg-[#1F513F] text-white text-xs font-semibold hover:bg-[#17382F] transition cursor-pointer inline-flex items-center justify-center shadow-xs"
            >
              <span>Tạo lớp học mới</span>
            </button>
          )}
        </div>
      ) : viewMode === "GRID" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClasses.map((cl) => {
            const isBulkChecked = selectedBulkClassIds.includes(cl.id);
            return (
              <div
                key={cl.id}
                onClick={() => onSelectClass(cl.id)}
                className="rounded-2xl border border-[#E5DFD0] hover:border-[#1F513F] transition-all cursor-pointer flex flex-col justify-between overflow-hidden bg-[#FFFCF7] shadow-2xs hover:shadow-md group"
              >
                {/* Artwork header */}
                <div className="h-28 w-full relative overflow-hidden bg-[#F7F5EE]">
                  <Image
                    src={cl.artwork || "/theme/card-hsk-scroll.webp"}
                    alt={cl.name}
                    fill
                    className="object-cover filter saturate-90 group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Badges & Checkbox */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5">
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white/90 backdrop-blur-xs rounded-md p-1 flex items-center shadow-2xs"
                      >
                        <input
                          type="checkbox"
                          checked={isBulkChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedBulkClassIds([...selectedBulkClassIds, cl.id]);
                            else setSelectedBulkClassIds(selectedBulkClassIds.filter((id) => id !== cl.id));
                          }}
                          className="w-3.5 h-3.5 rounded border-[#E5DFD0] accent-[#1F513F] cursor-pointer"
                        />
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-white/95 text-[#17382F] text-[10px] font-bold shadow-2xs">
                        HSK {cl.level || 1}.0
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-600 text-white shadow-2xs">
                      {cl.statusText || "Đang dạy"}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                    <span className="text-[10px] font-mono tracking-wider bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      Mã: {cl.code}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#17382F] group-hover:text-[#1F513F] line-clamp-1">
                      {cl.name}
                    </h3>
                    <p className="text-[11px] text-[#6B766D] mt-0.5 line-clamp-2 leading-relaxed">
                      {cl.description || "Lớp học tiêu chuẩn với giáo viên phụ trách."}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="pt-2 border-t border-[#E5DFD0]/60 space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#6B766D]">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#1F513F]" />
                        <span>{cl.studentCount} học sinh</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-[#BC9B6B]" />
                        <span>{cl.totalAssignments || 0} bài tập</span>
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#6B766D]">
                        <span>Tiến độ bài nộp</span>
                        <span className="font-bold text-[#17382F]">
                          {cl.progressPercent !== null ? `${cl.progressPercent}%` : "Chưa có"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E5DFD0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1F513F] rounded-full"
                          style={{ width: `${cl.progressPercent || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-3xl border border-[#E5DFD0] bg-[#FFFCF7] overflow-hidden shadow-2xs divide-y divide-[#E5DFD0]">
          {filteredClasses.map((cl) => {
            const isBulkChecked = selectedBulkClassIds.includes(cl.id);
            return (
              <div
                key={cl.id}
                onClick={() => onSelectClass(cl.id)}
                className="p-4 flex items-center justify-between gap-4 hover:bg-[#FDFBF7] transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isBulkChecked}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedBulkClassIds([...selectedBulkClassIds, cl.id]);
                        else setSelectedBulkClassIds(selectedBulkClassIds.filter((id) => id !== cl.id));
                      }}
                      className="w-4 h-4 rounded border-[#E5DFD0] accent-[#1F513F] cursor-pointer"
                    />
                  </div>

                  <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-[#E5DFD0] shrink-0 bg-[#F7F5EE]">
                    <Image
                      src={cl.artwork || "/theme/card-hsk-scroll.webp"}
                      alt={cl.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-sm text-[#17382F] hover:text-[#1F513F]">
                        {cl.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1F513F]/10 text-[#1F513F]">
                        HSK {cl.level || 1}.0
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B766D] font-mono">
                      Mã lớp: {cl.code} • Sĩ số: {cl.studentCount} • Bài tập: {cl.totalAssignments || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#1F513F] hidden sm:inline">
                    Xem chi tiết &rarr;
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
