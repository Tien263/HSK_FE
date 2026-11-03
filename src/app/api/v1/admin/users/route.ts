import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { hashPassword } from "@/lib/password-security";
import { logSystemError } from "@/lib/error-logger";

// GET /api/v1/admin/users - Lấy danh sách tài khoản & thống kê
export async function GET(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

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
        avatar: true,
        role: true,
        status: true,
        currentHskLevel: true,
        totalXp: true,
        streakDays: true,
        dailyAiQuota: true,
        aiUsageToday: true,
        aiUsageResetDate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            enrolledClasses: true,
            taughtClasses: true,
            attempts: true,
          },
        },
        enrolledClasses: {
          select: {
            classId: true,
            status: true,
            class: {
              select: {
                id: true,
                name: true,
                level: true,
                teacher: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Thống kê tổng hợp toàn hệ thống và danh sách lớp học
    const [
      totalUsers,
      studentCount,
      teacherCount,
      adminCount,
      lockedCount,
      totalClasses,
      totalAssignments,
      totalAttempts,
      availableClasses,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { status: "LOCKED" } }),
      prisma.class.count(),
      prisma.assignment.count(),
      prisma.attempt.count(),
      prisma.class.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          level: true,
          teacher: {
            select: { name: true },
          },
          _count: {
            select: { students: true },
          },
        },
        orderBy: [{ level: "asc" }, { name: "asc" }],
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalUsers,
          studentCount,
          teacherCount,
          adminCount,
          activeCount: totalUsers - lockedCount,
          lockedCount,
          totalClasses,
          totalAssignments,
          totalAttempts,
        },
        classes: availableClasses,
        users: users.map((u) => ({
          ...u,
          enrolledCount: u._count.enrolledClasses,
          taughtCount: u._count.taughtClasses,
          attemptCount: u._count.attempts,
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
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
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

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
        passwordHash: hashPassword(cleanPassword),
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
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

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
        data: { passwordHash: hashPassword(newPassword) },
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

    // Update Profile (Name, Email, Avatar)
    if (action === "UPDATE_PROFILE") {
      const { name, email, avatar } = body;
      const dataToUpdate: any = {};
      if (typeof name === "string" && name.trim()) dataToUpdate.name = name.trim();
      if (typeof email === "string") dataToUpdate.email = email.trim() || null;
      if (typeof avatar === "string") dataToUpdate.avatar = avatar.trim() || null;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: { id: true, name: true, username: true, email: true, avatar: true, role: true },
      });
      return NextResponse.json({
        success: true,
        message: `Đã cập nhật thông tin tài khoản ${user.username}!`,
        user: updated,
      });
    }

    // Update Daily AI Quota
    if (action === "UPDATE_AI_QUOTA") {
      const { dailyAiQuota } = body;
      const parsedQuota = parseInt(String(dailyAiQuota), 10);
      if (isNaN(parsedQuota) || parsedQuota < -1) {
        return NextResponse.json(
          {
            success: false,
            message: "Hạn mức AI không hợp lệ (-1: Không giới hạn, hoặc từ 0 trở lên).",
          },
          { status: 400 }
        );
      }
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { dailyAiQuota: parsedQuota },
        select: {
          id: true,
          username: true,
          name: true,
          dailyAiQuota: true,
          aiUsageToday: true,
        },
      });
      return NextResponse.json({
        success: true,
        message: `Đã cập nhật hạn mức AI cho ${user.username} thành ${
          parsedQuota === -1 ? "Không giới hạn" : parsedQuota + " lượt/ngày"
        }!`,
        user: updated,
      });
    }

    // Reset Daily AI Usage count to 0
    if (action === "RESET_AI_USAGE") {
      await prisma.user.update({
        where: { id: userId },
        data: { aiUsageToday: 0 },
      });
      return NextResponse.json({
        success: true,
        message: `Đã làm mới số lượt AI hôm nay của ${user.username} về 0.`,
      });
    }

    // Cập nhật cấp độ HSK và/hoặc Lớp học cho học sinh tự học
    if (action === "UPDATE_STUDENT_LEVEL" || action === "UPDATE_STUDENT_LEVEL_AND_CLASS") {
      const { hskLevel, classId } = body;
      const parsedLevel = parseInt(String(hskLevel), 10);
      if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 6) {
        return NextResponse.json(
          { success: false, message: "Cấp độ HSK phải từ 1 đến 6." },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        // 1. Cập nhật cấp độ HSK học viên
        await tx.user.update({
          where: { id: userId },
          data: { currentHskLevel: parsedLevel },
        });

        // 2. Xử lý lớp học (nếu có chọn xếp lớp hoặc chuyển về tự học)
        if (classId !== undefined) {
          if (classId && typeof classId === "string" && classId !== "NONE" && classId !== "SELF") {
            const targetClass = await tx.class.findUnique({ where: { id: classId } });
            if (targetClass) {
              await tx.classStudent.upsert({
                where: {
                  classId_studentId: {
                    classId,
                    studentId: userId,
                  },
                },
                create: {
                  classId,
                  studentId: userId,
                  status: "APPROVED",
                },
                update: {
                  status: "APPROVED",
                },
              });
            }
          } else if (classId === "NONE" || classId === "SELF") {
            await tx.classStudent.deleteMany({
              where: { studentId: userId },
            });
          }
        }

        // 3. Ghi log kiểm toán
        await tx.auditLog.create({
          data: {
            userId: authCheck.user.id,
            action: "UPDATE_STUDENT_LEVEL",
            entity: "User",
            details: JSON.stringify({
              targetUserId: userId,
              targetUsername: user.username,
              previousLevel: user.currentHskLevel,
              newLevel: parsedLevel,
              classId: classId || null,
            }),
          },
        });
      });

      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          name: true,
          currentHskLevel: true,
          enrolledClasses: {
            select: {
              classId: true,
              status: true,
              class: {
                select: {
                  id: true,
                  name: true,
                  level: true,
                  teacher: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Đã cập nhật cấp độ HSK ${parsedLevel} thành công cho học viên ${user.name} (@${user.username})!`,
        user: updatedUser,
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
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

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
