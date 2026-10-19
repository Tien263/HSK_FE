import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/v1/admin/users - Lấy danh sách tài khoản & thống kê
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const role = (searchParams.get("role") || "").trim().toUpperCase();

    // Điều kiện tìm kiếm
    const where: any = {};
    if (role && ["STUDENT", "TEACHER", "ADMIN"].includes(role)) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { username: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        status: true,
        currentHskLevel: true,
        totalXp: true,
        streakDays: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            enrolledClasses: true,
            taughtClasses: true,
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Thống kê tổng hợp
    const [totalUsers, studentCount, teacherCount, adminCount, lockedCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { status: "LOCKED" } }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        studentCount,
        teacherCount,
        adminCount,
        activeCount: totalUsers - lockedCount,
        lockedCount,
      },
      users: users.map((u) => ({
        ...u,
        enrolledCount: u._count.enrolledClasses,
        taughtCount: u._count.taughtClasses,
        attemptCount: u._count.attempts,
      })),
    });
  } catch (error) {
    console.error("GET /api/v1/admin/users error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi tải danh sách người dùng." },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/users - Cấp/tạo tài khoản mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, email, password, role } = body;

    const trimmedName = (name || "").trim();
    const cleanUsername = (username || "").toLowerCase().trim();
    const cleanEmail = (email || "").toLowerCase().trim() || null;
    const cleanPassword = (password || "").trim();
    const assignedRole = ["STUDENT", "TEACHER", "ADMIN"].includes(role) ? role : "STUDENT";

    if (!trimmedName) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập họ và tên." },
        { status: 400 }
      );
    }

    if (!cleanUsername) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên đăng nhập." },
        { status: 400 }
      );
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu tối thiểu phải từ 6 ký tự." },
        { status: 400 }
      );
    }

    // Kiểm tra trùng lặp
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          cleanEmail ? { email: cleanEmail } : { username: cleanUsername },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Tên đăng nhập hoặc email này đã tồn tại." },
        { status: 409 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        name: trimmedName,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: cleanPassword,
        role: assignedRole,
        status: "ACTIVE",
        currentHskLevel: assignedRole === "STUDENT" ? 1 : 0,
        totalXp: assignedRole === "STUDENT" ? 50 : 0,
        streakDays: 1,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã cấp tài khoản thành công cho ${assignedRole} ${trimmedName}!`,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/admin/users error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi tạo tài khoản người dùng." },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/admin/users - Cập nhật trạng thái hoặc đổi mật khẩu
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, newPassword, newRole } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID người dùng." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng." },
        { status: 404 }
      );
    }

    // Toggle Lock / Unlock
    if (action === "TOGGLE_STATUS") {
      const nextStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
      await prisma.user.update({
        where: { id: userId },
        data: { status: nextStatus },
      });
      return NextResponse.json({
        success: true,
        message: `Đã ${nextStatus === "ACTIVE" ? "mở khóa" : "khóa"} tài khoản ${user.username}.`,
        newStatus: nextStatus,
      });
    }

    // Reset Password
    if (action === "RESET_PASSWORD") {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "Mật khẩu mới tối thiểu 6 ký tự." },
          { status: 400 }
        );
      }
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPassword },
      });
      return NextResponse.json({
        success: true,
        message: `Đã đặt lại mật khẩu thành công cho tài khoản ${user.username}!`,
      });
    }

    // Change Role
    if (action === "CHANGE_ROLE" && newRole) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });
      return NextResponse.json({
        success: true,
        message: `Đã cập nhật quyền thành ${newRole} cho tài khoản ${user.username}!`,
      });
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ." }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/v1/admin/users error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi cập nhật người dùng." },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/admin/users - Xóa tài khoản
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID người dùng cần xóa." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Người dùng không tồn tại." },
        { status: 404 }
      );
    }

    // Không cho phép xóa chính tài khoản admin gốc
    if (user.username === "admin") {
      return NextResponse.json(
        { success: false, message: "Không thể xóa tài khoản Quản trị viên gốc (admin)." },
        { status: 403 }
      );
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({
      success: true,
      message: `Đã xóa thành công tài khoản ${user.username}.`,
    });
  } catch (error) {
    console.error("DELETE /api/v1/admin/users error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi xóa người dùng." },
      { status: 500 }
    );
  }
}
