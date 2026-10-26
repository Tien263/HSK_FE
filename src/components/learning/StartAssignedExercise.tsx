"use client";
import {useEffect,useState} from "react";
import {useParams,useRouter} from "next/navigation";
import Link from "next/link";
import {portalFetch} from "./use-portal-data";
export default function StartAssignedExercise(){const {id}=useParams<{id:string}>(),router=useRouter(),[error,setError]=useState("");useEffect(()=>{let active=true;portalFetch<{attemptId:string}>("/api/v1/assignments/"+id+"/start",{method:"POST"}).then(result=>{if(active)router.replace("/s/attempts/"+result.attemptId);}).catch(error=>{if(active)setError(error.message);});return()=>{active=false;};},[id,router]);return <main className="min-h-screen bg-[#F8F5ED] p-8 text-[#204434]"><h1 className="font-serif text-2xl font-bold">Bài tập được giao</h1><p className="my-5">{error||"Đang mở lượt làm bài của bạn…"}</p>{error&&<div className="flex gap-5 text-sm"><Link className="underline" href="/login">Đăng nhập</Link><Link className="underline" href="/s/home?tab=assignments">Về bài tập của tôi</Link></div>}</main>;}
