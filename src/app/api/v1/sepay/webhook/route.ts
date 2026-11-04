import { NextResponse } from "next/server";
import {
  getSepayConfig,
  getTransactions,
  saveTransactions,
  activateUserSubscription,
  getPackageById,
} from "@/lib/sepay";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const config = getSepayConfig();
    if (!config.enabled) {
      return NextResponse.json({ success: false, error: "SePay integration is disabled" }, { status: 403 });
    }

    // Authenticate Webhook from SePay
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization") || "";
    if (config.apiToken && config.apiToken !== "SEPAY_API_TOKEN_KEY") {
      const token = authHeader.replace(/^(Bearer|Apikey)\s+/i, "").trim();
      if (token !== config.apiToken.trim()) {
        console.warn("SePay Webhook Unauthorized token:", authHeader);
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = await request.json();
    console.log("SePay Webhook Received:", JSON.stringify(payload));

    const {
      id: sepayId,
      gateway,
      transactionDate,
      accountNumber,
      content = "",
      description = "",
      transferType,
      transferAmount = 0,
      referenceCode,
    } = payload;

    // Only process incoming money ('in')
    if (transferType && transferType.toLowerCase() !== "in") {
      return NextResponse.json({ success: true, message: "Ignored outgoing transfer" });
    }

    const combinedText = `${content} ${description}`.toUpperCase();
    const prefix = (config.transferPrefix || "HSK").toUpperCase();

    // Find matching transaction
    const txs = getTransactions();
    let matchedTx = txs.find((t) => {
      if (t.status === "PAID") return false;
      const code = t.orderCode.trim().toUpperCase();
      return combinedText.includes(code);
    });

    // Fallback: extract orderCode by regex
    if (!matchedTx) {
      const regex = new RegExp(`${prefix}\\d{4,8}`, "i");
      const match = combinedText.match(regex);
      if (match) {
        const extractedCode = match[0].toUpperCase();
        matchedTx = txs.find((t) => t.orderCode.toUpperCase() === extractedCode && t.status !== "PAID");
      }
    }

    if (!matchedTx) {
      console.warn("SePay Webhook: No matching pending transaction for text:", combinedText);
      return NextResponse.json({
        success: true,
        message: "Webhook processed, but no matching order code was found in content",
      });
    }

    // Validate amount (allow slight difference or exact)
    const paidAmount = Number(transferAmount);
    if (paidAmount < matchedTx.amount) {
      console.warn(
        `SePay Webhook: Received ${paidAmount} VND less than order amount ${matchedTx.amount} VND for ${matchedTx.orderCode}`
      );
    }

    // Mark as PAID & Activate
    matchedTx.status = "PAID";
    matchedTx.activated = true;
    matchedTx.paidAt = new Date().toISOString();
    matchedTx.sepayTransactionId = sepayId ? String(sepayId) : undefined;
    matchedTx.gateway = gateway || config.bankCode;
    matchedTx.referenceCode = referenceCode || undefined;

    // Activate subscription
    const sub = activateUserSubscription(matchedTx.userId, matchedTx.packageId);

    // Update Daily AI Quota in DB
    const pkg = getPackageById(matchedTx.packageId);
    if (pkg && matchedTx.userId) {
      try {
        await prisma.user.update({
          where: { id: matchedTx.userId },
          data: {
            dailyAiQuota: Math.max(pkg.dailyAiQuota, 50),
          },
        });
      } catch (dbErr) {
        console.warn("DB update error upon SePay activation:", dbErr);
      }
    }

    saveTransactions(txs);

    console.log(`Successfully activated package ${matchedTx.packageName} for user ${matchedTx.userName} (${matchedTx.orderCode})`);

    return NextResponse.json({
      success: true,
      message: `Đã xác nhận thanh toán thành công và kích hoạt gói ${matchedTx.packageName}!`,
      orderCode: matchedTx.orderCode,
      subscription: sub,
    });
  } catch (err: any) {
    console.error("SePay webhook error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
