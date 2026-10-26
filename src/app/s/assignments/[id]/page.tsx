import {Suspense} from "react";
import StartAssignedExercise from "@/components/learning/StartAssignedExercise";
export default function Page(){return <Suspense fallback={<p>Đang mở bài tập…</p>}><StartAssignedExercise/></Suspense>;}
