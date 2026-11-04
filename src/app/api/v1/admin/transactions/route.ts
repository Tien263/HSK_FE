import { NextResponse } from "next/server";
import { getTransactions, saveTransactions, activateUserSubscription, getPackageById } from "@/lib/sepay";
import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const txs = getTransactions();
    return NextResponse.json({ success: true, transactions: txs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const body = await request.json();
    const { action, transactionId } = body;

    const txs = getTransactions();
    const tx = txs.find((t) => t.id === transactionId);
    if (!tx) {
      return NextResponse.json({ success: false, error: "Không tìm thấy giao dịch" }, { status: 404 });
    }

    if (action === "manual_activate") {
      tx.status = "PAID";
      tx.activated = true;
      tx.paidAt = new Date().toISOString();

      // Activate subscription
      const sub = activateUserSubscription(tx.userId, tx.packageId);

      // Also update dailyAiQuota in prisma database
      const pkg = getPackageById(tx.packageId);
      if (pkg && tx.userId) {
        try {
          await prisma.user.update({
            where: { id: tx.userId },
            data: {
              dailyAiQuota: Math.max(pkg.dailyAiQuota, 50),
            },
          });
        } catch (dbErr) {
          console.warn("DB update dailyAiQuota error:", dbErr);
        }
      }

      saveTransactions(txs);
      return NextResponse.json({
        success: true,
        message: `Đã kích hoạt thành công gói cho học viên ${tx.userName}!`,
        transaction: tx,
        subscription: sub,
      });
    }

    if (action === "cancel") {
      tx.status = "CANCELLED";
      saveTransactions(txs);
      return NextResponse.json({ success: true, message: "Đã hủy đơn giao dịch", transaction: tx });
    }

    return NextResponse.json({ success: false, error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
