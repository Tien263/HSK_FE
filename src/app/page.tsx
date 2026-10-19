"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CourseCategories from "@/components/CourseCategories";
import LearningModes from "@/components/LearningModes";
import LearningRoadmap from "@/components/LearningRoadmap";
import PracticeFeatures from "@/components/PracticeFeatures";
import Footer from "@/components/Footer";

export default function HomePage() {
  const router = useRouter();

  // Quick 1-click test simulation for student & teacher
  const handleQuickLogin = (role: "STUDENT" | "TEACHER") => {
    if (role === "STUDENT") {
      const studentUser = {
        id: "student",
        username: "student",
        name: "Thảo",
        role: "STUDENT",
        currentHskLevel: 3,
        totalXp: 450,
        streakDays: 7,
      };
      localStorage.setItem("currentUser", JSON.stringify(studentUser));
      router.push("/s/home");
    } else {
      const teacherUser = {
        id: "teacher",
        username: "teacher",
        name: "Cô Ning Ning",
        role: "TEACHER",
      };
      localStorage.setItem("currentUser", JSON.stringify(teacherUser));
      router.push("/t/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f2e9] text-[#173d2d] font-sans selection:bg-[#1a3d2f] selection:text-white relative overflow-x-hidden">
      {/* ===================== FLOATING ONE-CLICK ROLE SWITCH PILL ===================== */}
      <aside aria-label="Thử vai nhanh" className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-[#1a3d2f]/95 text-white shadow-2xl border border-white/20 backdrop-blur-md text-[11px] font-bold">
        <span className="px-2 py-0.5 text-emerald-300">🧪 Thử vai:</span>
        <button
          type="button"
          onClick={() => handleQuickLogin("STUDENT")}
          className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/30 text-white transition flex items-center gap-1 cursor-pointer"
          title="Đăng nhập thử vai Học sinh (Bạn Thảo)"
        >
          <span>Học sinh (Thảo)</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickLogin("TEACHER")}
          className="px-3 py-1 rounded-full bg-[#991b1b] hover:bg-[#b91c1c] text-white transition flex items-center gap-1 cursor-pointer shadow-xs"
          title="Đăng nhập thử vai Giáo viên (Cô Ning Ning)"
        >
          <span>Giáo viên (Cô Ning Ning)</span>
        </button>
      </aside>

      {/* ===================== HEADER / NAVBAR ===================== */}
      <Header />

      {/* ===================== HERO SECTION ===================== */}
      <HeroSection />

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
