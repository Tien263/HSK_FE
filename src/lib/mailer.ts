import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export interface SmtpOptions {
  authType?: "PASSWORD" | "OAUTH2";
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
  // Google OAuth 2.0 fields
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

const CONFIG_FILE = path.join(process.cwd(), "prisma", "smtp-config.json");

function loadStoredConfig(): SmtpOptions {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Không thể đọc smtp-config.json:", e);
  }
  return {};
}

function saveStoredConfig(config: SmtpOptions) {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (e) {
    console.error("Không thể ghi smtp-config.json:", e);
  }
}

const stored = loadStoredConfig();

let activeSmtpConfig: SmtpOptions = {
  authType: stored.authType || (process.env.GMAIL_CLIENT_ID ? "OAUTH2" : "PASSWORD"),
  host: stored.host || process.env.SMTP_HOST || "smtp.gmail.com",
  port: stored.port || (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465),
  user: stored.user || process.env.GMAIL_USER || process.env.SMTP_USER || "",
  pass: stored.pass || process.env.SMTP_PASS || "",
  from: stored.from || process.env.SMTP_FROM || "",
  clientId: stored.clientId || process.env.GMAIL_CLIENT_ID || "",
  clientSecret: stored.clientSecret || process.env.GMAIL_CLIENT_SECRET || "",
  refreshToken: stored.refreshToken || process.env.GMAIL_REFRESH_TOKEN || "",
};

export function updateSmtpConfig(config: SmtpOptions) {
  activeSmtpConfig = {
    ...activeSmtpConfig,
    ...config,
  };
  saveStoredConfig(activeSmtpConfig);
}

export function getSmtpConfig(): SmtpOptions {
  const storedConfig = loadStoredConfig();
  return {
    ...activeSmtpConfig,
    ...storedConfig,
  };
}

/**
 * Tạo nodemailer transporter hỗ trợ Google OAuth 2.0 & Gmail App Password & Custom SMTP
 */
function createTransporter() {
  const config = getSmtpConfig();
  const user = (config.user || process.env.GMAIL_USER || process.env.SMTP_USER || "").trim();

  // 1. Chế độ GOOGLE OAUTH 2.0 (Khuyên dùng và bảo mật nhất cho Gmail)
  const isOAuth =
    config.authType === "OAUTH2" ||
    (!config.authType && !!(config.clientId && config.clientSecret && config.refreshToken));

  if (isOAuth) {
    const clientId = (config.clientId || process.env.GMAIL_CLIENT_ID || "").trim();
    const clientSecret = (config.clientSecret || process.env.GMAIL_CLIENT_SECRET || "").trim();
    const refreshToken = (config.refreshToken || process.env.GMAIL_REFRESH_TOKEN || "").trim();

    if (user && clientId && clientSecret && refreshToken) {
      console.log(`[MAILER] Khởi tạo Nodemailer qua Google OAuth 2.0 cho ${user}`);
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user,
          clientId,
          clientSecret,
          refreshToken,
        },
      });
    }
  }

  // 2. Chế độ Mật khẩu ứng dụng Google (App Password) hoặc SMTP thông thường
  const host = (config.host || process.env.SMTP_HOST || "smtp.gmail.com").trim().toLowerCase();
  const pass = (config.pass || process.env.SMTP_PASS || "").trim();
  const port = config.port || Number(process.env.SMTP_PORT) || 465;

  if (!user || !pass) {
    return null;
  }

  // Tối ưu riêng cho Gmail với App Password
  if (host.includes("gmail") || user.endsWith("@gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  // Custom SMTP (TLS/SSL)
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

/**
 * Gửi email chứa mã OTP xác thực
 */
export async function sendOtpEmail(
  toEmail: string,
  otpCode: string,
  purpose = "Xác minh tài khoản"
): Promise<{ sent: boolean; message: string; errorDetail?: string }> {
  const config = getSmtpConfig();
  const user = (config.user || process.env.GMAIL_USER || process.env.SMTP_USER || "").trim();
  const from = config.from || `"Hanyu Tiếng Trung" <${user || "support@hanyu.edu.vn"}>`;
  const transporter = createTransporter();

  // Kiểm tra nếu có transporter hợp lệ
  if (transporter && user) {
    try {
      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFFCF6; border: 1px solid #BC9B6B40; border-radius: 16px; overflow: hidden; color: #204434;">
          <div style="background-color: #204434; padding: 24px; text-align: center; color: #FFFCF6;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">宁 HANYU</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #BC9B6B;">Nền tảng Học Tiếng Trung & Luyện Thi HSK 3.0</p>
          </div>
          
          <div style="padding: 32px 24px; text-align: center;">
            <h2 style="margin: 0 0 12px 0; color: #204434; font-size: 20px;">Mã xác thực OTP của bạn</h2>
            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #315E48;">
              Bạn vừa thực hiện yêu cầu: <strong>${purpose}</strong>.<br />
              Dưới đây là mã xác thực 6 chữ số để hoàn tất thao tác:
            </p>
            
            <div style="display: inline-block; background-color: #F8F5ED; border: 2px dashed #204434; border-radius: 12px; padding: 14px 28px; margin: 12px 0 24px 0;">
              <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #9D493E;">${otpCode}</span>
            </div>
            
            <p style="margin: 0 0 16px 0; font-size: 13px; color: #315E48;">
              ⏱️ Mã có hiệu lực trong vòng <strong>5 phút</strong>.<br />
              Tuyệt đối không chia sẻ mã xác thực này cho người khác để bảo vệ tài khoản.
            </p>
          </div>
          
          <div style="background-color: #F8F5ED; padding: 16px 24px; text-align: center; font-size: 11px; color: #315E48; border-top: 1px solid #BC9B6B25;">
            <p style="margin: 0;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với giáo viên.</p>
            <p style="margin: 4px 0 0 0;">© 2026 Hanyu · Lớp Tiếng Trung Cô Ning Ning</p>
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject: `[Hanyu] Mã xác thực OTP của bạn: ${otpCode}`,
        text: `Mã xác thực OTP của bạn là: ${otpCode}. Mã có hiệu lực trong 5 phút.`,
        html: htmlContent,
      });

      console.log(`[MAILER] ✓ Đã gửi email OTP thực tế đến ${toEmail}. MessageId: ${info.messageId}`);
      return { sent: true, message: `Email đã được gửi thành công đến ${toEmail}` };
    } catch (error: any) {
      console.error("[MAILER] ❌ Lỗi gửi email qua Google OAuth / SMTP:", error);
      return {
        sent: false,
        message: `Lỗi kết nối máy chủ gửi email: ${error?.message || "Không xác định"}`,
        errorDetail: error?.message || String(error),
      };
    }
  }

  // Khi chưa cấu hình
  console.log(`[MAILER] [MÔ PHỎNG] Mã OTP cho ${toEmail} là: ${otpCode} (Chưa cấu hình Google OAuth 2.0 hoặc SMTP trong Admin Dashboard)`);
  return {
    sent: false,
    message: "Hệ thống chưa kết nối Google OAuth 2.0 hoặc SMTP. Vui lòng vào Admin Portal cấu hình.",
  };
}

/**
 * Kiểm thử gửi email test kết nối
 */
export async function testSmtpConnection(targetEmail: string) {
  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
  return sendOtpEmail(targetEmail, testOtp, "Thử nghiệm kết nối máy chủ Email Hanyu (OAuth 2.0 / SMTP)");
}
