export interface SepayConfig {
  enabled: boolean;
  bankCode: string; // e.g. "MBBank", "VCB", "ACB", "TPBank", "Techcombank", "VPBank", "BIDV", "VietinBank"
  accountNumber: string;
  accountHolder: string;
  apiToken: string; // SePay Webhook Token / API Key
  transferPrefix: string; // default "HSK"
  qrTemplate: "compact" | "compact2" | "qr_only" | "print";
  updatedAt?: string;
}

export interface PackageItem {
  id: string;
  name: string;
  tagline: string;
  levelRange: string; // e.g. "HSK 1 - 3", "HSK 1 - 6", "HSK 1 - 9 VIP"
  price: number; // VND
  originalPrice?: number;
  durationDays: number; // 30, 90, 180, 365, or 9999 for lifetime
  dailyAiQuota: number; // e.g. 50, 100, 9999
  features: string[];
  recommended?: boolean;
  isActive: boolean;
  order: number;
}

export interface TransactionRecord {
  id: string;
  orderCode: string; // e.g. "HSK8291"
  userId: string;
  userName: string;
  userEmail?: string;
  packageId: string;
  packageName: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  transferContent: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
  sepayTransactionId?: string;
  gateway?: string;
  referenceCode?: string;
  createdAt: string;
  paidAt?: string;
  activated: boolean;
}

export interface UserSubscription {
  userId: string;
  packageId: string;
  packageName: string;
  startDate: string;
  expiresAt: string; // ISO date string
  isLifetime: boolean;
  dailyAiQuota: number;
  isActive: boolean;
}

// Supported VietQR Banks
export const VIETQR_BANKS = [
  { code: "MBBank", name: "MB Bank (Ngân hàng Quân Đội)", bin: "970422" },
  { code: "Vietcombank", name: "Vietcombank (Ngoại thương Việt Nam)", bin: "970436" },
  { code: "Techcombank", name: "Techcombank (Kỹ Thương Việt Nam)", bin: "970407" },
  { code: "ACB", name: "ACB (Á Châu)", bin: "970416" },
  { code: "TPBank", name: "TPBank (Tiên Phong)", bin: "970423" },
  { code: "VPBank", name: "VPBank (Việt Nam Thịnh Vượng)", bin: "970432" },
  { code: "BIDV", name: "BIDV (Đầu tư và Phát triển)", bin: "970418" },
  { code: "VietinBank", name: "VietinBank (Công Thương Việt Nam)", bin: "970415" },
  { code: "Agribank", name: "Agribank (Nông nghiệp & PT Nông thôn)", bin: "970405" },
  { code: "OCB", name: "OCB (Phương Đông)", bin: "970448" },
  { code: "Sacombank", name: "Sacombank (Sài Gòn Thương Tín)", bin: "970403" },
  { code: "VIB", name: "VIB (Quốc tế)", bin: "970441" },
  { code: "HDBank", name: "HDBank (Phát triển TP.HCM)", bin: "970437" },
  { code: "MSB", name: "MSB (Hàng Hải)", bin: "970426" },
  { code: "SHB", name: "SHB (Sài Gòn - Hà Nội)", bin: "970443" },
];

// Generate VietQR Link via SePay (Pure client safe function)
export function generateVietQRUrl(params: {
  bankCode: string;
  accountNumber: string;
  amount: number;
  transferContent: string;
  template?: string;
}): string {
  const { bankCode, accountNumber, amount, transferContent, template = "compact" } = params;
  const encodedDes = encodeURIComponent(transferContent.trim());
  return `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankCode}&amount=${amount}&des=${encodedDes}&template=${template}`;
}
