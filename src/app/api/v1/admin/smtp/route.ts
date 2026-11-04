import { NextResponse } from "next/server";
import { getSmtpConfig, updateSmtpConfig, testSmtpConnection } from "@/lib/mailer";
import { requireAdmin } from "@/lib/auth-server";

export async function GET(request: Request) {
  const authCheck = await requireAdmin(request);
  if (!authCheck.ok) return authCheck.response;

  const config = getSmtpConfig();
  return NextResponse.json({
    success: true,
    config: {
      authType: config.authType || "PASSWORD",
      host: config.host || "smtp.gmail.com",
      port: config.port || 465,
      user: config.user || "",
      password: config.pass ? "••••••••••••••••" : "",
      senderName: config.from || "",
      clientId: config.clientId || "",
      clientSecret: config.clientSecret ? "••••••••••••••••" : "",
      refreshToken: config.refreshToken ? "••••••••••••••••" : "",
      resendApiKey: config.resendApiKey ? "••••••••••••••••" : "",
      brevoApiKey: config.brevoApiKey ? "••••••••••••••••" : "",
      isConfigured: !!(
        (config.authType === "RESEND" && config.resendApiKey) ||
        (config.authType === "BREVO" && config.brevoApiKey) ||
        (config.authType === "OAUTH2" && config.user && config.clientId && config.refreshToken) ||
        (config.user && config.pass) ||
        (config.resendApiKey && config.resendApiKey.startsWith("re_"))
      ),
    },
  });
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireAdmin(request);
    if (!authCheck.ok) return authCheck.response;

    const body = await request.json();
    const {
      authType,
      host,
      port,
      user,
      password,
      senderName,
      clientId,
      clientSecret,
      refreshToken,
      resendApiKey,
      brevoApiKey,
      action,
      testRecipient,
    } = body;

    const current = getSmtpConfig();

    // Cập nhật cấu hình
    updateSmtpConfig({
      authType: authType || current.authType || "PASSWORD",
      host: host !== undefined ? host.trim() : current.host,
      port: port ? Number(port) : current.port,
      user: user !== undefined ? user.trim() : current.user,
      pass: password && !password.includes("••••") ? password.trim() : current.pass,
      from: senderName !== undefined ? senderName.trim() : current.from,
      clientId: clientId !== undefined ? clientId.trim() : current.clientId,
      clientSecret:
        clientSecret && !clientSecret.includes("••••") ? clientSecret.trim() : current.clientSecret,
      refreshToken:
        refreshToken && !refreshToken.includes("••••") ? refreshToken.trim() : current.refreshToken,
      resendApiKey:
        resendApiKey && !resendApiKey.includes("••••") ? resendApiKey.trim() : current.resendApiKey,
      brevoApiKey:
        brevoApiKey && !brevoApiKey.includes("••••") ? brevoApiKey.trim() : current.brevoApiKey,
    });

    // Nếu yêu cầu kiểm thử gửi email ngay
    if (action === "TEST_CONNECTION") {
      const recipient = (testRecipient || user || "").trim();
      if (!recipient || !recipient.includes("@")) {
        return NextResponse.json(
          { success: false, message: "Vui lòng nhập địa chỉ email người nhận để gửi thử." },
          { status: 400 }
        );
      }

      const cfg = getSmtpConfig();
      if (cfg.authType === "RESEND" && (!cfg.resendApiKey || !cfg.resendApiKey.startsWith("re_"))) {
        return NextResponse.json(
          {
            success: false,
            message: "Chưa có Resend API Key hợp lệ! Vui lòng dán mã re_... vào ô Resend API Key và bấm 'Lưu cấu hình' trước khi gửi thử.",
          },
          { status: 400 }
        );
      }

      const testResult = await testSmtpConnection(recipient);
      if (testResult.sent) {
        return NextResponse.json({
          success: true,
          message: `✓ Đã kết nối và gửi thành công email thử nghiệm tới ${recipient}! Hãy kiểm tra hộp thư đến.`,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            message: `❌ Không thể gửi email: ${testResult.message}. ${
              testResult.errorDetail ? "Chi tiết: " + testResult.errorDetail : ""
            }`,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Đã lưu cấu hình máy chủ gửi email thành công!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: `Lỗi cập nhật cấu hình: ${error?.message || "Không xác định"}` },
      { status: 500 }
    );
  }
}
