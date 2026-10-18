import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CoursesSection from "@/components/CoursesSection";
import AboutWhyUs from "@/components/AboutWhyUs";
import ClassroomGallery from "@/components/ClassroomGallery";
import StudyProcess from "@/components/StudyProcess";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#061609] text-white">
      {/* Top Header / Navigation Bar */}
      <Navbar />

      {/* Screen 1: Full-viewport Cinematic Hero with Submerged Video */}
      <Hero />

      {/* Screen 2: Dedicated Course Cards Section (4 Arched Dome Cards) */}
      <CoursesSection />

      {/* About & Why Us Section with Circular Segmented Collage & 5 Stats */}
      <AboutWhyUs />

      {/* Classroom Activities & Mock Exam Rooms (3 Cards + Nav Arrows) */}
      <ClassroomGallery />

      {/* 4-Step Learning & Certification Process */}
      <StudyProcess />

      {/* Footer */}
      <Footer />
    </div>
  );
}
