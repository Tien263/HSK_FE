import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (searchParams.get("code") || "").trim();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập mã lớp học." },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");

    // 1. Ưu tiên tìm chính xác theo ID hoặc 6 ký tự đuôi của mã lớp hoặc tên lớp chính xác
    let foundClass: any = await prisma.class.findFirst({
      where: {
        OR: [
          { id: code },
          { id: { endsWith: code.toLowerCase() } },
          { id: { endsWith: normalizedCode.toLowerCase() } },
          { name: { equals: code.trim(), mode: "insensitive" } },
        ],
      },
      include: {
        teacher: true,
        _count: { select: { students: true } },
      },
    });

    // 2. Tìm theo tên lớp chứa mã hoặc mô tả chứa mã
    if (!foundClass) {
      foundClass = await prisma.class.findFirst({
        where: {
          OR: [
            { name: { contains: code.trim(), mode: "insensitive" } },
            { description: { contains: code.trim(), mode: "insensitive" } },
            { description: { contains: normalizedCode, mode: "insensitive" } },
          ],
        },
        include: {
          teacher: true,
          _count: { select: { students: true } },
        },
      });
    }

    // 3. Fallback: Quét danh sách lớp khớp 6 ký tự cuối của CUID
    if (!foundClass) {
      const allClasses = await prisma.class.findMany({
        include: { teacher: true, _count: { select: { students: true } } },
      });
      foundClass = allClasses.find(
        (c) =>
          c.id.slice(-6).toUpperCase() === normalizedCode ||
          c.id.toUpperCase().endsWith(normalizedCode) ||
          c.name.trim().toUpperCase() === code.trim().toUpperCase()
      );
    }

    // 4. Nếu là mã demo HANYU3A mà chưa có lớp trong DB, tự động khởi tạo lớp mẫu HSK 3
    if (!foundClass && (normalizedCode === "HANYU3A" || normalizedCode.includes("HANYU"))) {
      let teacher = await prisma.user.findFirst({
        where: { role: "TEACHER" },
      });

      if (!teacher) {
        teacher = await prisma.user.create({
          data: {
            username: "teacher",
            name: "Nguyễn Thảo (Cô Ning Ning)",
            email: "coningning@ningning.edu.vn",
            passwordHash: "teacher123",
            role: "TEACHER",
            status: "ACTIVE",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
          },
        });
      }

      foundClass = await prisma.class.create({
        data: {
          name: "Lớp HSK 3 Chuẩn Quốc Tế (HANYU3A)",
          level: 3,
          teacherId: teacher.id,
          description: "Lớp học chuẩn HSK 3.0 với cô Ning Ning: nhận bài tập hàng tuần, chấm bài và theo dõi tiến độ.",
          isActive: true,
        },
        include: {
          teacher: true,
          _count: { select: { students: true } },
        },
      });
    }

    if (!foundClass) {
      return NextResponse.json(
        { success: false, message: `Không tìm thấy lớp học với mã "${code}". Vui lòng kiểm tra lại.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      classInfo: {
        id: foundClass.id,
        name: foundClass.name,
        level: foundClass.level,
        description: foundClass.description,
        code: foundClass.name.includes("1A")
          ? "HSK1A"
          : foundClass.name.includes("HANYU3A")
          ? "HANYU3A"
          : foundClass.id.slice(-6).toUpperCase(),
        teacherName: foundClass.teacher?.name || "Cô Ning Ning",
        teacherAvatar: foundClass.teacher?.avatar || "/theme/avatar-teacher.jpg",
        teacherEmail: foundClass.teacher?.email || "coningning@ningning.edu.vn",
        studentCount: foundClass._count.students,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi kiểm tra mã lớp." },
      { status: 500 }
    );
  }
}
