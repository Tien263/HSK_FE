"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CourseCategories from "@/components/CourseCategories";
import LearningModes from "@/components/LearningModes";
import LearningRoadmap from "@/components/LearningRoadmap";
import PracticeFeatures from "@/components/PracticeFeatures";
import Footer from "@/components/Footer";

export default function HomePage() {
  const router = useRouter();
  const [quickLoginError, setQuickLoginError] = useState("");
  const [quickLoginBusy, setQuickLoginBusy] = useState(false);

  // Quick 1-click test simulation for student & teacher
  const handleQuickLogin = async (role: "STUDENT" | "TEACHER") => {
    setQuickLoginBusy(true); setQuickLoginError("");
    const username = role === "STUDENT" ? "student" : "teacher";
    try {
      const response = await fetch("/api/v1/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password: `${username}123` }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Chưa đăng nhập được.");
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      sessionStorage.removeItem("currentUser");
      router.push(role === "STUDENT" ? "/s/home" : "/t/dashboard");
    } catch (error) { setQuickLoginError(error instanceof Error ? error.message : "Chưa đăng nhập được."); }
    finally { setQuickLoginBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#f7efe2] text-[#173d2d] font-sans selection:bg-[#1a3d2f] selection:text-white relative overflow-x-hidden">
      {/* ===================== FLOATING ONE-CLICK ROLE SWITCH PILL ===================== */}
      <aside aria-label="Thử vai nhanh" className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-[#1a3d2f]/95 text-white shadow-2xl border border-white/20 backdrop-blur-md text-[11px] font-bold">
        <span className="px-2 py-0.5 text-emerald-300">🧪 Thử vai:</span>
        <button
          type="button"
          onClick={() => handleQuickLogin("STUDENT")}
          disabled={quickLoginBusy}
          className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/30 text-white transition flex items-center gap-1 cursor-pointer"
          title="Đăng nhập thử vai Học sinh (Bạn Thảo)"
        >
          <span>Học sinh (Thảo)</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickLogin("TEACHER")}
          disabled={quickLoginBusy}
          className="px-3 py-1 rounded-full bg-[#a8383b] hover:bg-[#b91c1c] text-white transition flex items-center gap-1 cursor-pointer shadow-xs"
          title="Đăng nhập thử vai Giáo viên (Cô Ning Ning)"
        >
          <span>Giáo viên (Cô Ning Ning)</span>
        </button>
      </aside>
      {quickLoginError && <p role="alert" className="fixed bottom-20 right-5 z-50 max-w-sm rounded-xl bg-red-50 p-3 text-xs text-red-800">{quickLoginError}</p>}

      {/* ===================== TOP HERO MASTER WRAPPER (Exact Mockup Artwork Background) ===================== */}
      <div className="relative w-full overflow-hidden">
        {/* Full-width continuous Shanshui background (exact user image, seamlessly feathered) */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <Image
            src="/theme/hero-master-bg-feathered.png"
            alt="Traditional Chinese Shanshui Landscape"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Navigation Bar */}
        <Header />

        {/* Hero Section */}
        <HeroSection />
      </div>

      {/* ===================== SECTION 1: COURSE CATEGORIES (01, 02, 03) ===================== */}
      <CourseCategories />

      {/* ===================== SECTION 2: LEARNING MODES ===================== */}
      <LearningModes />

      {/* ===================== SECTION 3: LEARNING ROADMAP ===================== */}
      <LearningRoadmap />

      {/* ===================== SECTION 4: PRACTICE & EXERCISES ===================== */}
      <PracticeFeatures />

      {/* ===================== FOOTER ===================== */}
      <Footer />
    </div>
  );
}
