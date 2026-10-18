import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustFeatures from "@/components/TrustFeatures";
import PopularLevels from "@/components/PopularLevels";
import CategoryPills from "@/components/CategoryPills";
import StudyGuides from "@/components/StudyGuides";
import SpecialExamBanner from "@/components/SpecialExamBanner";
import MetricsRow from "@/components/MetricsRow";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] text-slate-900 selection:bg-[#e86a24] selection:text-white">
      {/* Top Header / Navigation */}
      <Navbar />

      {/* Hero with framed background video from user download & floating search bar */}
      <Hero />

      {/* 4 Value proposition features */}
      <TrustFeatures />

      {/* Popular HSK Levels Grid (Pomaii style) */}
      <PopularLevels />

      {/* Circular skill & category pills */}
      <CategoryPills />

      {/* Study Guides & Exam Tips (Pomaii Travel stories style) */}
      <StudyGuides />

      {/* Special Exam Banner (Deep forest green card with orange CTA) */}
      <SpecialExamBanner />

      {/* Key Numbers / Metrics Row */}
      <MetricsRow />

      {/* Clean modern light Footer */}
      <Footer />
    </div>
  );
}
