import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getAuthUser } from "@/lib/auth-server";

async function AuthorizedAdmin({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser(new Request("http://localhost/admin", { headers: new Headers(await headers()) }));
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect(user.role === "TEACHER" ? "/t/dashboard" : "/s/home");
  return children;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<p role="status">Đang kiểm tra quyền quản trị…</p>}>
    <AuthorizedAdmin>{children}</AuthorizedAdmin>
  </Suspense>;
}
