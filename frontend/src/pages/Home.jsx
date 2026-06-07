import Navigation from "@/components/ddls/Navigation";
import Hero from "@/components/ddls/Hero";
import Mission from "@/components/ddls/Mission";
import CoreTeam from "@/components/ddls/CoreTeam";
import ProjectsPreview from "@/components/ddls/ProjectsPreview";
import Impact from "@/components/ddls/Impact";
import Donate from "@/components/ddls/Donate";
import WallOfHearts from "@/components/ddls/WallOfHearts";
import Footer from "@/components/ddls/Footer";

export default function Home() {
  return (
    <div data-testid="home-page" className="min-h-screen bg-[#FDFBF7] text-[#2C3E42] font-sans">
      <Navigation transparent />
      <main>
        <Hero />
        <Mission />
        <CoreTeam />
        <ProjectsPreview />
        <Impact />
        <Donate />
        <WallOfHearts />
      </main>
      <Footer />
    </div>
  );
}
