import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        _count: { select: { students: true, assignments: true } },
      },
      orderBy: { level: "asc" },
    });

    return NextResponse.json({
      success: true,
      items: classes.map((c) => ({
        id: c.id,
        name: c.name,
        level: c.level,
        description: c.description,
        totalStudents: c._count.students,
        totalAssignments: c._count.assignments,
        isActive: c.isActive,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi tải danh sách lớp" }, { status: 500 });
  }
}
