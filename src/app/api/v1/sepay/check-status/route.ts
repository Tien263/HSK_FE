import { NextResponse } from "next/server";
import { findTransactionByOrderCode, getUserSubscription } from "@/lib/sepay";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("orderCode");

    if (!orderCode) {
      return NextResponse.json({ success: false, error: "Thiếu mã đơn hàng" }, { status: 400 });
    }

    const tx = findTransactionByOrderCode(orderCode);
    if (!tx) {
      return NextResponse.json({ success: false, error: "Không tìm thấy giao dịch" }, { status: 404 });
    }

    const isPaid = tx.status === "PAID";
    let subscription = null;
    if (isPaid && tx.userId) {
      subscription = getUserSubscription(tx.userId);
    }

    return NextResponse.json({
      success: true,
      status: tx.status,
      isPaid,
      activated: tx.activated,
      paidAt: tx.paidAt,
      packageName: tx.packageName,
      subscription,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
