import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser(new Request("http://localhost/admin", { headers: new Headers(await headers()) }));
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect(user.role === "TEACHER" ? "/t/dashboard" : "/s/home");
  return children;
}
