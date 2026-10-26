import { hskArtwork } from "./hsk-theme";
// Utility functions for Class management, date formatting, status calculation, and artwork selection

export interface ClassMetadata {
  text: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "UPCOMING" | "PAUSED" | "ENDED" | "ARCHIVED";
  statusText: string;
  track: "HSK" | "TOPIC" | "MAJOR";
  isArchived?: boolean;
}

/**
 * Normalizes any date string or Date object into strict DD/MM/YYYY format.
 */
export function normalizeDMY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = now.getFullYear();
    return `${d}/${m}/${y}`;
  }

  if (dateInput instanceof Date) {
    const d = String(dateInput.getDate()).padStart(2, "0");
    const m = String(dateInput.getMonth() + 1).padStart(2, "0");
    const y = dateInput.getFullYear();
    return `${d}/${m}/${y}`;
  }

  const str = String(dateInput).trim();

  // If already DD/MM/YYYY or D/M/YYYY
  if (str.includes("/")) {
    const parts = str.split("/");
    if (parts.length === 3) {
      const d = parts[0].padStart(2, "0");
      const m = parts[1].padStart(2, "0");
      let y = parts[2];
      if (y.length === 2) y = "20" + y;
      return `${d}/${m}/${y}`;
    }
  }

  // If ISO YYYY-MM-DD
  if (str.includes("-")) {
    const clean = str.split("T")[0];
    const parts = clean.split("-");
    if (parts.length === 3) {
      const y = parts[0];
      const m = parts[1].padStart(2, "0");
      const d = parts[2].padStart(2, "0");
      return `${d}/${m}/${y}`;
    }
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, "0");
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const y = parsed.getFullYear();
    return `${d}/${m}/${y}`;
  }

  return str;
}

/**
 * Parses DD/MM/YYYY into a valid Date object.
 */
export function parseDMY(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const str = String(dateStr).trim();

  if (str.includes("/")) {
    const parts = str.split("/");
    if (parts.length === 3) {
      const d = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      let y = Number(parts[2]);
      if (y < 100) y += 2000;
      const date = new Date(y, m, d);
      return isNaN(date.getTime()) ? null : date;
    }
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Computes class status strictly according to start date, end date, and pause flag.
 * CLASS-001: Lớp có ngày bắt đầu sau ngày hiện tại phải có trạng thái "Sắp bắt đầu" (UPCOMING).
 * Lỗi 1: Hỗ trợ trạng thái "Tạm dừng" (PAUSED).
 */
export function computeClassStatus(
  startDateStr?: string | null,
  endDateStr?: string | null,
  isActive: boolean = true,
  customStatus?: string | null,
  isArchived: boolean = false
): { status: "ACTIVE" | "UPCOMING" | "PAUSED" | "ENDED" | "ARCHIVED"; statusText: string } {
  if (isArchived || customStatus === "ARCHIVED") {
    return { status: "ARCHIVED", statusText: "Đã lưu trữ" };
  }
  const normStatus = (customStatus || "").toUpperCase();
  if (normStatus === "PAUSED" || normStatus === "TAM_DUNG") {
    return { status: "PAUSED", statusText: "Tạm dừng" };
  }
  if (!isActive || normStatus === "ENDED" || normStatus === "DA_KET_THUC") {
    return { status: "ENDED", statusText: "Đã kết thúc" };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const start = parseDMY(startDateStr);
  const end = parseDMY(endDateStr);

  if (start && start > today) {
    return { status: "UPCOMING", statusText: "Sắp bắt đầu" };
  }

  if (end && end < today) {
    return { status: "ENDED", statusText: "Đã kết thúc" };
  }

  return { status: "ACTIVE", statusText: "Đang dạy" };
}

/**
 * Encodes metadata into class description JSON string for seamless persistence.
 */
export function encodeClassDescription(params: {
  text?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  track?: string;
  isArchived?: boolean;
}): string {
  const meta = {
    text: params.text || "",
    startDate: params.startDate ? normalizeDMY(params.startDate) : undefined,
    endDate: params.endDate ? normalizeDMY(params.endDate) : undefined,
    status: params.isArchived ? "ARCHIVED" : params.status,
    track: params.track,
    isArchived: !!params.isArchived,
  };
  return JSON.stringify(meta);
}

/**
 * Decodes metadata from class description JSON string or plain text.
 */
export function decodeClassDescription(
  rawDesc: string | null | undefined,
  createdAt?: Date | string | null,
  isActive: boolean = true,
  level: number = 1
): ClassMetadata {
  let text = rawDesc || "";
  let startDate: string | undefined;
  let endDate: string | undefined;
  let customStatus: string | undefined;
  let isArchived: boolean = false;
  let track: "HSK" | "TOPIC" | "MAJOR" = level <= 3 ? "HSK" : level === 4 ? "TOPIC" : "MAJOR";

  if (rawDesc && rawDesc.trim().startsWith("{") && rawDesc.trim().endsWith("}")) {
    try {
      const parsed = JSON.parse(rawDesc.trim());
      text = parsed.text ?? "";
      if (parsed.startDate) startDate = normalizeDMY(parsed.startDate);
      if (parsed.endDate) endDate = normalizeDMY(parsed.endDate);
      if (parsed.status) customStatus = parsed.status;
      if (parsed.isArchived !== undefined) isArchived = Boolean(parsed.isArchived);
      if (parsed.track && ["HSK", "TOPIC", "MAJOR"].includes(parsed.track)) {
        track = parsed.track;
      }
    } catch {}
  }

  if (customStatus === "ARCHIVED") {
    isArchived = true;
  }

  // Fallback dates if not present
  const createdDate = createdAt ? new Date(createdAt) : new Date();
  if (!startDate) {
    startDate = normalizeDMY(createdDate);
  }
  if (!endDate) {
    // Default 6 months later
    const end = new Date(createdDate.getTime() + 180 * 86400000);
    endDate = normalizeDMY(end);
  }

  const { status, statusText } = computeClassStatus(startDate, endDate, isActive, customStatus, isArchived);

  return {
    text,
    startDate,
    endDate,
    status,
    statusText,
    track,
    isArchived,
  };
}

/**
 * Selects an intelligent, non-repeating Chinese watercolor illustration based on Track, Level, Index, and Name.
 * Resolves Lỗi 4 – Ảnh card đang bị lặp.
 */
export function getClassArtwork(track: string, level: number = 1, index: number = 0, name: string = ""): string {
const topicArtworks = [
    "/theme/dashboard/card-topic.webp",
    "/theme/tinh_vat_tra_ben_canh_hoa_mai_dao.jpg",
    "/theme/course-02-fan-bamboo.jpg",
    "/theme/art-fan.jpg",
    "/theme/card-topic-tea.webp",
  ];

  const majorArtworks = [
    "/theme/dashboard/card-major.webp",
    "/theme/course-03-grad-cap-books.jpg",
    "/theme/hero-student-pavilion.jpg",
    "/theme/phong_canh_thuy_mac_ben_ho_suong_som.jpg",
    "/theme/card-major-study.webp",
  ];

  // Hash class name
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);

  const norm = (track || "").toUpperCase();
  if (norm === "TOPIC" || norm.includes("CHỦ ĐỀ") || norm.includes("GIAO TIẾP")) {
    return topicArtworks[(hash + index) % topicArtworks.length];
  }
  if (norm === "MAJOR" || norm.includes("CHUYÊN NGÀNH") || norm.includes("KINH TẾ") || norm.includes("THƯƠNG MẠI")) {
    return majorArtworks[(hash + index) % majorArtworks.length];
  }
  return hskArtwork(level);
}
