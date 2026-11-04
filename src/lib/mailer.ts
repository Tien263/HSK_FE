import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export interface SmtpOptions {
  authType?: "RESEND" | "BREVO" | "PASSWORD" | "OAUTH2" | "CUSTOM";
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
  // Google OAuth 2.0 fields
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  // Resend API (HTTP Transactional - Siêu tốc 1-2s)
  resendApiKey?: string;
  // Brevo API (Gửi bất kỳ email nào không cần domain riêng - Miễn phí 300 mail/ngày)
  brevoApiKey?: string;
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
  resendApiKey: stored.resendApiKey || process.env.RESEND_API_KEY || "",
  brevoApiKey: stored.brevoApiKey || process.env.BREVO_API_KEY || "",
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
      pool: true,
      maxConnections: 3,
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
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

  // 1. Chế độ RESEND API (HTTP REST API Siêu tốc 1-2s - Khuyên dùng nhất cho OTP)
  const resendApiKey = (config.resendApiKey || process.env.RESEND_API_KEY || "").trim();
  if (config.authType === "RESEND" || (resendApiKey && resendApiKey.startsWith("re_"))) {
    try {
      let sender = "Hanyu Tiếng Trung <onboarding@resend.dev>";
      const rawFrom = (config.from || "").trim();
      // Resend không cho phép gửi từ @gmail.com nếu chưa verify domain riêng, tự động dùng onboarding@resend.dev
      if (rawFrom && !/@(gmail|googlemail|yahoo|hotmail|outlook)\.com/i.test(rawFrom) && rawFrom.includes("@")) {
        sender = rawFrom;
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: sender,
          to: [toEmail],
          subject: `[Hanyu] Mã xác thực OTP của bạn: ${otpCode}`,
          html: htmlContent,
          text: `Mã xác thực OTP của bạn là: ${otpCode}. Mã có hiệu lực trong 5 phút.`,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.id) {
        console.log(`[MAILER] ✓ Đã gửi email OTP siêu tốc qua Resend API đến ${toEmail}. MessageId: ${resData.id}`);
        return { sent: true, message: `Email OTP đã được gửi thành công đến ${toEmail} qua Resend siêu tốc.` };
      }

      let errorMsg = resData.message || `Resend API trả về mã lỗi ${res.status}`;
      if (errorMsg.includes("You can only send testing emails to your own email address")) {
        errorMsg = `Resend đang ở chế độ dùng thử (onboarding@resend.dev), chỉ cho phép gửi tới chính email tạo tài khoản (${toEmail}). Để gửi cho mọi học viên bất kỳ, vui lòng xác minh tên miền tại resend.com/domains hoặc dùng Brevo API.`;
      }
      throw new Error(errorMsg);
    } catch (err: any) {
      console.error("[MAILER] ❌ Lỗi gửi email qua Resend API:", err);
      // Nếu người dùng chủ động chọn RESEND, thông báo lỗi thẳng chứ không nhảy sang SMTP làm treo timeout
      if (config.authType === "RESEND" || !transporter || !user) {
        return {
          sent: false,
          message: `Lỗi gửi qua Resend: ${err.message || String(err)}`,
          errorDetail: err.message || String(err),
        };
      }
      console.log("[MAILER] Đang thử gửi chuyển tiếp qua SMTP dự phòng...");
    }
  }

  // 1.5. Chế độ BREVO (Sendinblue) API - Miễn phí 300 mail/ngày, cho phép gửi tới bất kỳ ai không cần tên miền
  const brevoApiKey = (config.brevoApiKey || process.env.BREVO_API_KEY || "").trim();
  if (config.authType === "BREVO" || (brevoApiKey && brevoApiKey.startsWith("xkeysib-"))) {
    try {
      const senderEmail = (config.user || "xuantien50d@gmail.com").trim();
      const senderName = "Hanyu - Lớp Tiếng Trung Cô Ning Ning";
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: toEmail }],
          subject: `[Hanyu] Mã xác thực OTP của bạn: ${otpCode}`,
          htmlContent: htmlContent,
        }),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && (resData.messageId || resData.id)) {
        return { sent: true, message: `Email OTP đã được gửi thành công đến ${toEmail} qua Brevo.` };
      }
      return {
        sent: false,
        message: `Lỗi Brevo: ${resData.message || "Không thể gửi email"}`,
        errorDetail: JSON.stringify(resData),
      };
    } catch (err: any) {
      return { sent: false, message: `Lỗi kết nối Brevo: ${err.message}`, errorDetail: err.message };
    }
  }

  // 2. Chế độ SMTP / Google OAuth 2.0 dự phòng
  if (transporter && user) {
    try {
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
