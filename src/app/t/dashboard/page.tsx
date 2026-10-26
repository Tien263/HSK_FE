import {Suspense} from "react";
import TeacherClassicDashboard from "@/components/teacher/TeacherClassicDashboard";
export default function Page(){return <Suspense fallback={<main className="min-h-screen bg-[#F8F5ED] p-10 text-[#204434]">Đang tải không gian giáo viên…</main>}><TeacherClassicDashboard/></Suspense>;}
