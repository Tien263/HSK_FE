"use client";
import ReportsWorkspace from "@/components/learning/ReportsWorkspace";
export default function StudentReportsWorkspace(_props:{currentUser?:unknown;onNavigateToTab?:(tab:string)=>void;classesCount?:number;onOpenJoinModal?:()=>void}){return <ReportsWorkspace student/>;}
