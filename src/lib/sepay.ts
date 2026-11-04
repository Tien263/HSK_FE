import fs from "fs";
import path from "path";
import {
  SepayConfig,
  PackageItem,
  TransactionRecord,
  UserSubscription,
  VIETQR_BANKS,
  generateVietQRUrl,
} from "./sepay-types";

export * from "./sepay-types";

// Config file locations
const SEPAY_CONFIG_FILE = path.join(process.cwd(), "prisma", "sepay-config.json");
const PACKAGES_CONFIG_FILE = path.join(process.cwd(), "prisma", "packages-config.json");
const TRANSACTIONS_FILE = path.join(process.cwd(), "prisma", "sepay-transactions.json");
const USER_SUBSCRIPTIONS_FILE = path.join(process.cwd(), "prisma", "user-subscriptions.json");

// Default SePay Configuration
const DEFAULT_SEPAY_CONFIG: SepayConfig = {
  enabled: true,
  bankCode: "MBBank",
  accountNumber: "0987654321",
  accountHolder: "CONG TY TNHH HSK EDU",
  apiToken: "SEPAY_API_TOKEN_KEY",
  transferPrefix: "HSK",
  qrTemplate: "compact",
};

// Default commercial study packages
const DEFAULT_PACKAGES: PackageItem[] = [
  {
    id: "pkg_starter",
    name: "Gói Khởi Động HSK 1 - 2",
    tagline: "Dành cho người mới bắt đầu học tiếng Trung nhập môn",
    levelRange: "HSK 1 - HSK 2",
    price: 149000,
    originalPrice: 299000,
    durationDays: 60,
    dailyAiQuota: 30,
    features: [
      "Mở khóa toàn bộ giáo trình HSK 1 & HSK 2 chuẩn quốc tế",
      "Hỗ trợ Pinyin chi tiết và phát âm chuẩn từng nét",
      "30 lượt đàm thoại cùng AI Doubao/Gemini mỗi ngày",
      "Ngân hàng đề thi thử HSK 1 & HSK 2",
      "Sổ tay từ vựng & vở tập viết chữ Hán thông minh",
    ],
    recommended: false,
    isActive: true,
    order: 1,
  },
  {
    id: "pkg_comprehensive",
    name: "Gói Toàn Diện HSK 1 - 6 (Được khuyên dùng)",
    tagline: "Lộ trình học bài bản từ sơ cấp đến thành thạo giao tiếp & đi làm",
    levelRange: "HSK 1 - HSK 6",
    price: 399000,
    originalPrice: 799000,
    durationDays: 365,
    dailyAiQuota: 100,
    features: [
      "Mở khóa toàn bộ kho giáo trình HSK 1 đến HSK 6",
      "100 lượt luyện đàm thoại giọng bản địa Doubao mỗi ngày",
      "Chấm chữa bài viết AI chi tiết ngữ pháp & lỗi sai",
      "Ngân hàng đề thi thử HSK chính thức có AI giám sát thi",
      "Phòng học ảo Cổ Phong cùng chuỗi Streak bảo vệ",
      "Cẩm nang hướng dẫn & tra cứu từ điển offline không giới hạn",
    ],
    recommended: true,
    isActive: true,
    order: 2,
  },
  {
    id: "pkg_vip_infinity",
    name: "Gói VIP Trọn Đời HSK 1 - 9 & AI Không Giới Hạn",
    tagline: "Đặc quyền cao cấp nhất - Đồng hành suốt chặng đường chinh phục HSK",
    levelRange: "HSK 1 - HSK 9 Cao cấp",
    price: 799000,
    originalPrice: 1599000,
    durationDays: 9999, // Trọn đời
    dailyAiQuota: 9999, // Không giới hạn
    features: [
      "Quyền lợi VĨNH VIỄN không bao giờ hết hạn",
      "AI Doubao & Gemini không giới hạn số lượt (Unlimited)",
      "Mở khóa độc quyền nội dung HSK 7, 8, 9 chuyên ngành & học thuật",
      "Hệ thống giám sát thi thật AI Proctoring có cấp chứng chỉ online",
      "Ưu tiên hỗ trợ 1:1 từ đội ngũ học vụ & giáo viên",
      "Huy hiệu VIP Cổ Phong Hoàng Kim trên toàn hệ thống",
    ],
    recommended: false,
    isActive: true,
    order: 3,
  },
];

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 1. Sepay Config Accessors
export function getSepayConfig(): SepayConfig {
  try {
    if (fs.existsSync(SEPAY_CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(SEPAY_CONFIG_FILE, "utf-8"));
      return { ...DEFAULT_SEPAY_CONFIG, ...data };
    }
  } catch (err) {
    console.error("Error reading sepay-config.json:", err);
  }
  return DEFAULT_SEPAY_CONFIG;
}

export function saveSepayConfig(config: Partial<SepayConfig>): SepayConfig {
  ensureDir(SEPAY_CONFIG_FILE);
  const current = getSepayConfig();
  const updated: SepayConfig = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(SEPAY_CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

// 2. Packages Accessors
export function getPackages(): PackageItem[] {
  try {
    if (fs.existsSync(PACKAGES_CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(PACKAGES_CONFIG_FILE, "utf-8"));
      if (Array.isArray(data) && data.length > 0) {
        return data.sort((a, b) => a.order - b.order);
      }
    }
  } catch (err) {
    console.error("Error reading packages-config.json:", err);
  }
  return DEFAULT_PACKAGES;
}

export function savePackages(packages: PackageItem[]): PackageItem[] {
  ensureDir(PACKAGES_CONFIG_FILE);
  fs.writeFileSync(PACKAGES_CONFIG_FILE, JSON.stringify(packages, null, 2), "utf-8");
  return packages;
}

export function getPackageById(packageId: string): PackageItem | undefined {
  const list = getPackages();
  return list.find((p) => p.id === packageId);
}

// 3. Transactions Accessors
export function getTransactions(): TransactionRecord[] {
  try {
    if (fs.existsSync(TRANSACTIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, "utf-8"));
      if (Array.isArray(data)) {
        return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
  } catch (err) {
    console.error("Error reading sepay-transactions.json:", err);
  }
  return [];
}

export function saveTransactions(txs: TransactionRecord[]) {
  ensureDir(TRANSACTIONS_FILE);
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(txs, null, 2), "utf-8");
}

export function createTransaction(tx: Omit<TransactionRecord, "id" | "createdAt" | "status" | "activated">): TransactionRecord {
  const txs = getTransactions();
  const newTx: TransactionRecord = {
    ...tx,
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    status: "PENDING",
    activated: false,
    createdAt: new Date().toISOString(),
  };
  txs.unshift(newTx);
  if (txs.length > 1000) txs.length = 1000;
  saveTransactions(txs);
  return newTx;
}

export function findTransactionByOrderCode(orderCode: string): TransactionRecord | undefined {
  const txs = getTransactions();
  const clean = orderCode.trim().toUpperCase();
  return txs.find((t) => t.orderCode.trim().toUpperCase() === clean);
}

// 4. User Subscriptions Accessors
export function getUserSubscriptions(): Record<string, UserSubscription> {
  try {
    if (fs.existsSync(USER_SUBSCRIPTIONS_FILE)) {
      return JSON.parse(fs.readFileSync(USER_SUBSCRIPTIONS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading user-subscriptions.json:", err);
  }
  return {};
}

export function getUserSubscription(userId: string): UserSubscription | null {
  const map = getUserSubscriptions();
  const sub = map[userId];
  if (!sub) return null;

  if (!sub.isLifetime) {
    const exp = new Date(sub.expiresAt).getTime();
    if (Date.now() > exp) {
      sub.isActive = false;
    }
  }
  return sub;
}

export function activateUserSubscription(userId: string, packageId: string): UserSubscription | null {
  const pkg = getPackageById(packageId);
  if (!pkg) return null;

  const map = getUserSubscriptions();
  const now = new Date();
  const isLifetime = pkg.durationDays >= 9999;
  const expires = new Date(now.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000);

  const sub: UserSubscription = {
    userId,
    packageId: pkg.id,
    packageName: pkg.name,
    startDate: now.toISOString(),
    expiresAt: expires.toISOString(),
    isLifetime,
    dailyAiQuota: pkg.dailyAiQuota,
    isActive: true,
  };

  map[userId] = sub;
  ensureDir(USER_SUBSCRIPTIONS_FILE);
  fs.writeFileSync(USER_SUBSCRIPTIONS_FILE, JSON.stringify(map, null, 2), "utf-8");

  return sub;
}

// 5. Generate a Unique Order Transfer Code
export function generateOrderCode(prefix = "HSK"): string {
  const cleanPrefix = (prefix || "HSK").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${cleanPrefix}${randomDigits}`;
}
