import {Suspense} from "react";
import Content from "@/components/learning/StudentAttempt";
export default function Page(){return <Suspense fallback={<main className="min-h-screen bg-[#F7F5EE] p-8 text-[#204434]">Đang tải bài làm…</main>}><Content/></Suspense>;}
