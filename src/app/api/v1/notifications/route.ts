import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

// GET /api/v1/notifications - Lấy danh sách thông báo của người dùng
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    const targetUserId = queryUserId || authUser?.id;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "Yêu cầu đăng nhập để xem thông báo." },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      items: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        desc: n.message,
        type: n.type,
        isRead: n.isRead,
        read: n.isRead,
        linkUrl: n.linkUrl,
        createdAt: n.createdAt,
        time: formatRelativeTime(n.createdAt),
      })),
    });
  } catch (error) {
    console.error("GET /notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi tải thông báo." },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/notifications - Đánh dấu thông báo đã đọc
export async function PATCH(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    const body = await request.json().catch(() => ({}));
    const { id, markAllAsRead, userId } = body;
    const targetUserId = userId || authUser?.id;

    if (markAllAsRead && targetUserId) {
      await prisma.notification.updateMany({
        where: { userId: targetUserId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "Đã đánh dấu tất cả là đã đọc." });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "Đã đánh dấu thông báo đã đọc." });
    }

    return NextResponse.json({ success: false, message: "Thiếu thông tin cập nhật." }, { status: 400 });
  } catch (error) {
    console.error("PATCH /notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi cập nhật thông báo." },
      { status: 500 }
    );
  }
}

function formatRelativeTime(date: Date): string {
  const diffSec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diffSec < 60) return "Vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} ngày trước`;
}
