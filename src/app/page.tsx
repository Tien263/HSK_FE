import Image from "next/image";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CourseCategories from "@/components/CourseCategories";
import LearningModes from "@/components/LearningModes";
import LearningRoadmap from "@/components/LearningRoadmap";
import PracticeFeatures from "@/components/PracticeFeatures";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7efe2] text-[#173d2d] font-sans selection:bg-[#1a3d2f] selection:text-white relative overflow-x-hidden">
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
