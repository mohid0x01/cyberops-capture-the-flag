import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Challenges from "@/components/Challenges";
import Leaderboard from "@/components/Leaderboard";
import About from "@/components/About";
import Resources from "@/components/Resources";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";
import { initVisitorTracking } from "@/lib/visitorTracker";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Index = () => {
  const { settings } = useSiteSettings();
  const toggles = settings.feature_toggles;

  useEffect(() => {
    initVisitorTracking();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Challenges />
      {toggles.leaderboard && <Leaderboard />}
      <About />
      <Resources />
      <FAQ />
      {toggles.contact_form && <Contact />}
      <Sponsors />
      <Footer />
    </div>
  );
};

export default Index;
