import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import HskLevelsSection from "@/components/HskLevelsSection";
import InteractiveFlashcardDemo from "@/components/InteractiveFlashcardDemo";
import MockExamsSection from "@/components/MockExamsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e1b] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Header Navigation */}
      <Navbar />

      {/* Hero Section based on Pinterest design */}
      <Hero />

      {/* Key Metric Highlights Bar */}
      <StatsBar />

      {/* Interactive HSK 1 - 6 Curriculum Roadmap */}
      <HskLevelsSection />

      {/* 3D Interactive Vocabulary Flashcard Preview */}
      <InteractiveFlashcardDemo />

      {/* Real-time Mock Exams Showcase */}
      <MockExamsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
