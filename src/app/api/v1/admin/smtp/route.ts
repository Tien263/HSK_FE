import { NextResponse } from "next/server";
import { getSmtpConfig, updateSmtpConfig } from "@/lib/mailer";

export async function GET() {
  const config = getSmtpConfig();
  return NextResponse.json({
    success: true,
    config: {
      host: config.host || "",
      port: config.port || 587,
      user: config.user || "",
      password: config.pass ? "••••••••••••••••" : "",
      senderName: config.from || "",
      isConfigured: !!(config.host && config.user && config.pass),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { host, port, user, password, senderName } = body;

    updateSmtpConfig({
      host: (host || "").trim(),
      port: port ? Number(port) : 587,
      user: (user || "").trim(),
      pass: (password || "").trim(),
      from: (senderName || "").trim() ? `"${senderName.trim()}" <${user}>` : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật cấu hình máy chủ gửi email SMTP thành công!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi cập nhật cấu hình SMTP." },
      { status: 500 }
    );
  }
}
