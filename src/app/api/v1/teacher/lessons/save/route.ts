import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lessonId, title, selectedItems, collectionName, notes } = body;

    // Save teacher's custom collection
    return NextResponse.json({
      success: true,
      message: `Đã lưu bài học "${title}" vào Thư viện cá nhân thành công!`,
      savedItem: {
        id: `saved-${Date.now()}`,
        lessonId,
        title,
        collectionName: collectionName || "Bộ bài giảng mặc định",
        selectedCount:
          (selectedItems?.vocabIds?.length || 0) +
          (selectedItems?.grammarIds?.length || 0) +
          (selectedItems?.dialogue ? 1 : 0) +
          (selectedItems?.reading ? 1 : 0) +
          (selectedItems?.listening ? 1 : 0),
        savedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi lưu vào thư viện cá nhân" },
      { status: 500 }
    );
  }
}
