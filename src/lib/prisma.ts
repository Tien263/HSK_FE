import { PrismaClient } from "../generated/prisma/index.js";

/**
 * Tự động tối ưu cấu hình Connection Pooling cho PostgreSQL
 * Đảm bảo hệ thống không bị lỗi "too many clients already" khi nhiều học viên cùng truy cập
 */
function getOptimizedDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl);

    // Tự động chuyển Supabase Pooler từ Session Mode (Port 5432, giới hạn 15 clients)
    // sang Transaction Mode (Port 6543 + pgbouncer=true) để chịu tải cao và không bao giờ bị EMAXCONNSESSION
    if (url.hostname.includes("pooler.supabase.com")) {
      if (url.port === "5432") {
        url.port = "6543";
      }
      if (!url.searchParams.has("pgbouncer")) {
        url.searchParams.set("pgbouncer", "true");
      }
    }

    // Giới hạn connection pool an toàn cho môi trường Cloud (Render/Neon/Supabase)
    if (!url.searchParams.has("connection_limit")) {
      const defaultLimit = process.env.NODE_ENV === "production" ? "10" : "5";
      url.searchParams.set("connection_limit", process.env.DB_CONNECTION_LIMIT || defaultLimit);
    }
    // Thời gian chờ mượn connection tối đa 20s
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", process.env.DB_POOL_TIMEOUT || "20");
    }
    // Thời gian timeout thiết lập socket
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "15");
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const optimizedUrl = getOptimizedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: optimizedUrl ? { db: { url: optimizedUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Always cache client on globalThis to prevent connection leaks across requests
globalForPrisma.prisma = prisma;
