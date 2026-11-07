import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { examAccess, ExamError } from "@/lib/exam-center-service";
import ExamCenter from "@/components/exam-center/ExamCenter";

export const metadata = {
  title: "HSK Exam Center · Hanyu",
  robots: { index: false, follow: false },
};

async function AuthenticatedCenter() {
  await connection();
  const request = new Request("http://hanyu.local/s/mock-exam", {
    headers: new Headers(await headers()),
  });
  let user;
  try {
    user = await examAccess(request);
  } catch (error) {
    if (error instanceof ExamError && error.status === 401) user = null;
    else if (error instanceof ExamError)
      return (
        <main style={{ padding: 40, fontFamily: "sans-serif" }}>
          <h1>Chưa có quyền vào phòng thi</h1>
          <p>{error.message}</p>
          <a href="/s/home">Về tài khoản</a>
        </main>
      );
    else throw error;
  }
  if (!user) redirect("/login?next=%2Fs%2Fmock-exam");
  return <ExamCenter user={{ id: user.id, name: user.name, role: user.role }} />;
}
export default function MockExamPage(){return <Suspense fallback={<main style={{padding:40}}>Đang kiểm tra quyền vào phòng thi…</main>}><AuthenticatedCenter/></Suspense>;}
