import { NextResponse } from "next/server";
import {
  getSepayConfig,
  getPackageById,
  generateOrderCode,
  generateVietQRUrl,
  createTransaction,
} from "@/lib/sepay";
import { requireAuth } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const authCheck = await requireAuth(request);
    if (!authCheck.ok || !authCheck.user) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập để tiếp tục" }, { status: 401 });
    }

    const body = await request.json();
    const { packageId } = body;

    const pkg = getPackageById(packageId);
    if (!pkg || !pkg.isActive) {
      return NextResponse.json({ success: false, error: "Gói học không tồn tại hoặc đã ngừng cung cấp" }, { status: 404 });
    }

    const sepayConfig = getSepayConfig();
    if (!sepayConfig.enabled) {
      return NextResponse.json(
        { success: false, error: "Hệ thống thanh toán tự động đang bảo trì, vui lòng liên hệ Admin" },
        { status: 503 }
      );
    }

    // Generate unique order code (e.g., HSK712391)
    const orderCode = generateOrderCode(sepayConfig.transferPrefix || "HSK");

    // Dynamic VietQR Link from SePay
    const qrUrl = generateVietQRUrl({
      bankCode: sepayConfig.bankCode,
      accountNumber: sepayConfig.accountNumber,
      amount: pkg.price,
      transferContent: orderCode,
      template: sepayConfig.qrTemplate || "compact",
    });

    // Record pending transaction
    const tx = createTransaction({
      orderCode,
      userId: authCheck.user.id,
      userName: authCheck.user.name || authCheck.user.username,
      userEmail: authCheck.user.email || undefined,
      packageId: pkg.id,
      packageName: pkg.name,
      amount: pkg.price,
      bankCode: sepayConfig.bankCode,
      accountNumber: sepayConfig.accountNumber,
      transferContent: orderCode,
    });

    return NextResponse.json({
      success: true,
      order: {
        orderCode,
        package: pkg,
        amount: pkg.price,
        bankCode: sepayConfig.bankCode,
        accountNumber: sepayConfig.accountNumber,
        accountHolder: sepayConfig.accountHolder,
        transferContent: orderCode,
        qrUrl,
        transactionId: tx.id,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
