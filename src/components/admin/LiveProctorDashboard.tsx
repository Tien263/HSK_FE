"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Smartphone,
  Volume2,
  Users,
  Eye,
  RefreshCw,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  Maximize2,
  X,
  VolumeX,
} from "lucide-react";

interface ProctorViolation {
  id: string;
  createdAt: string;
  studentId: string;
  studentName: string;
  examTitle: string;
  classId: string | null;
  violationType: string;
  details: string;
  count: number;
  snapshot: string | null;
}

export default function LiveProctorDashboard() {
  const [violations, setViolations] = useState<ProctorViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedSnapshot, setSelectedSnapshot] = useState<ProctorViolation | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastCountRef = useRef(0);

  const fetchViolations = async () => {
    try {
      const res = await fetch("/api/v1/proctor/violation?take=80");
      const json = await res.json();
      if (json.success && Array.isArray(json.violations)) {
        if (soundEnabled && lastCountRef.current > 0 && json.violations.length > lastCountRef.current) {
          playBeep();
        }
        lastCountRef.current = json.violations.length;
        setViolations(json.violations);
      }
    } catch (e: any) {
      setError(e.message || "Lỗi nạp nhật ký giám sát.");
    } finally {
      setLoading(false);
    }
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  useEffect(() => {
    fetchViolations();
    const interval = setInterval(fetchViolations, 4000); // Tự động làm mới mỗi 4 giây
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleClearAll = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn dọn sạch toàn bộ bằng chứng vi phạm giám sát không?")) return;
    try {
      const res = await fetch("/api/v1/proctor/violation?action=CLEAR_ALL", { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setViolations([]);
        lastCountRef.current = 0;
      }
    } catch (e: any) {
      alert("Không thể xóa: " + e.message);
    }
  };

  const filtered = violations.filter((v) => {
    const matchesSearch =
      v.studentName.toLowerCase().includes(search.toLowerCase()) ||
      v.examTitle.toLowerCase().includes(search.toLowerCase()) ||
      v.details.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "ALL" || v.violationType === selectedType;
    return matchesSearch && matchesType;
  });

  const phoneCount = violations.filter((v) => v.violationType.includes("PHONE") || v.violationType.includes("DEVICE")).length;
  const audioCount = violations.filter((v) => v.violationType.includes("AUDIO")).length;
  const multiCount = violations.filter((v) => v.violationType.includes("MULTIPLE")).length;
  const tabCount = violations.filter((v) => v.violationType.includes("TAB") || v.violationType.includes("APP")).length;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Top Banner Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b", fontSize: 12 }}>
            <span>Tổng số cảnh báo</span>
            <ShieldAlert size={16} color="#dc2626" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", marginTop: 4 }}>
            {violations.length}
          </div>
        </div>

        <div style={{ background: "#fef2f2", padding: "14px 18px", borderRadius: 14, border: "1px solid #fecaca" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#991b1b", fontSize: 12 }}>
            <span>Phát hiện điện thoại</span>
            <Smartphone size={16} color="#dc2626" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#991b1b", marginTop: 4 }}>
            {phoneCount}
          </div>
        </div>

        <div style={{ background: "#fffbeb", padding: "14px 18px", borderRadius: 14, border: "1px solid #fde68a" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#92400e", fontSize: 12 }}>
            <span>Âm thanh lạ / Nói chuyện</span>
            <Volume2 size={16} color="#d97706" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#92400e", marginTop: 4 }}>
            {audioCount}
          </div>
        </div>

        <div style={{ background: "#f5f3ff", padding: "14px 18px", borderRadius: 14, border: "1px solid #ddd6fe" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#5b21b6", fontSize: 12 }}>
            <span>Chuyển tab / Ứng dụng</span>
            <Eye size={16} color="#7c3aed" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#5b21b6", marginTop: 4 }}>
            {tabCount}
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div
        style={{
          background: "#ffffff",
          padding: "14px 18px",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: 220 }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: 10, color: "#94a3b8" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên học sinh, đề thi..."
              style={{
                padding: "7px 10px 7px 32px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 12,
                width: "100%",
              }}
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: "7px 10px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: 12,
              background: "#ffffff",
            }}
          >
            <option value="ALL">Tất cả dạng vi phạm</option>
            <option value="CELL_PHONE_DETECTED">📱 Cầm điện thoại</option>
            <option value="AUDIO_SUSPICIOUS">🔊 Âm thanh lạ / Nói chuyện</option>
            <option value="MULTIPLE_PEOPLE_DETECTED">👥 Người thứ 2</option>
            <option value="TAB_SWITCH">🔀 Chuyển tab</option>
            <option value="NO_FACE_DETECTED">👤 Vắng mặt camera</option>
          </select>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: soundEnabled ? "#f0fdf4" : "#ffffff",
              color: soundEnabled ? "#15803d" : "#64748b",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
            title={soundEnabled ? "Tắt âm báo khi có vi phạm mới" : "Bật âm báo khi có vi phạm mới"}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{soundEnabled ? "Âm báo: BẬT" : "Âm báo: TẮT"}</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={fetchViolations}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <RefreshCw size={13} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: "none",
              background: "#fee2e2",
              color: "#991b1b",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Trash2 size={13} />
            <span>Dọn sạch nhật ký</span>
          </button>
        </div>
      </div>

      {/* Live Feed Table */}
      <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <strong style={{ fontSize: 13, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 1.5s infinite" }} />
            Giám sát trực tiếp ({filtered.length} sự kiện)
          </strong>
          <span style={{ fontSize: 11, color: "#64748b" }}>Tự động đồng bộ mỗi 4 giây</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: 13 }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: "0 auto 8px" }} />
            <p style={{ margin: 0 }}>Không có vi phạm nào được ghi nhận. Phòng thi đang diễn ra an toàn!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left" }}>Thời gian</th>
                  <th style={{ padding: "10px 14px", textAlign: "left" }}>Thí sinh</th>
                  <th style={{ padding: "10px 14px", textAlign: "left" }}>Đề thi</th>
                  <th style={{ padding: "10px 14px", textAlign: "left" }}>Hành vi vi phạm</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" }}>Lần vi phạm</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" }}>Ảnh bằng chứng</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const d = new Date(item.createdAt);
                  const timeStr = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;

                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 14px", color: "#64748b", whiteSpace: "nowrap" }}>
                        {timeStr}
                      </td>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "#1e293b" }}>
                        {item.studentName}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#334155" }}>
                        {item.examTitle}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            background:
                              item.violationType.includes("PHONE") || item.violationType.includes("DEVICE")
                                ? "#fee2e2"
                                : item.violationType.includes("AUDIO")
                                ? "#fef3c7"
                                : "#f1f5f9",
                            color:
                              item.violationType.includes("PHONE") || item.violationType.includes("DEVICE")
                                ? "#dc2626"
                                : item.violationType.includes("AUDIO")
                                ? "#d97706"
                                : "#475569",
                          }}
                        >
                          {item.details}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: item.count >= 3 ? "#dc2626" : "#f59e0b" }}>
                        {item.count}/3
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        {item.snapshot ? (
                          <button
                            type="button"
                            onClick={() => setSelectedSnapshot(item)}
                            style={{
                              background: "#0284c7",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              padding: "4px 8px",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Camera size={12} /> Xem ảnh
                          </button>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>Không có ảnh</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Snapshot Modal Viewer */}
      {selectedSnapshot && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              maxWidth: 520,
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ padding: "14px 18px", background: "#1e293b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Camera size={16} color="#38bdf8" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  Ảnh chụp bằng chứng vi phạm: {selectedSnapshot.studentName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSnapshot(null)}
                style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 16 }}>
              {selectedSnapshot.snapshot ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selectedSnapshot.snapshot}
                  alt="Ảnh chụp webcam bằng chứng"
                  style={{ width: "100%", borderRadius: 12, border: "2px solid #ef4444", display: "block" }}
                />
              ) : (
                <p>Không có hình ảnh</p>
              )}
              <div style={{ marginTop: 12, fontSize: 12, color: "#334155" }}>
                <div><strong>Lý do:</strong> {selectedSnapshot.details}</div>
                <div><strong>Đề thi:</strong> {selectedSnapshot.examTitle}</div>
                <div><strong>Thời điểm:</strong> {new Date(selectedSnapshot.createdAt).toLocaleString("vi-VN")}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
