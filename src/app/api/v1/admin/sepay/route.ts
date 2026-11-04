import { NextResponse } from "next/server";
import { getSepayConfig, saveSepayConfig, VIETQR_BANKS } from "@/lib/sepay";
import { requireAdmin } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const config = getSepayConfig();
    const url = new URL(request.url);
    const webhookUrl = `${url.origin}/api/v1/sepay/webhook`;

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        // Mask token partially if configured
        apiTokenMasked: config.apiToken
          ? config.apiToken.substring(0, 4) + "••••••••" + config.apiToken.slice(-4)
          : "",
      },
      webhookUrl,
      supportedBanks: VIETQR_BANKS,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const body = await request.json();
    const { enabled, bankCode, accountNumber, accountHolder, apiToken, transferPrefix, qrTemplate } = body;

    const current = getSepayConfig();
    const updated = saveSepayConfig({
      enabled: enabled !== undefined ? Boolean(enabled) : current.enabled,
      bankCode: bankCode ? bankCode.trim() : current.bankCode,
      accountNumber: accountNumber ? accountNumber.trim() : current.accountNumber,
      accountHolder: accountHolder ? accountHolder.trim().toUpperCase() : current.accountHolder,
      apiToken: apiToken && !apiToken.includes("••••") ? apiToken.trim() : current.apiToken,
      transferPrefix: transferPrefix ? transferPrefix.trim().toUpperCase() : current.transferPrefix,
      qrTemplate: qrTemplate || current.qrTemplate,
    });

    return NextResponse.json({
      success: true,
      message: "Lưu cấu hình SePay thành công!",
      config: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
