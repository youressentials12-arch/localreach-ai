import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import PrelaunchBanner from "@/components/landing/PrelaunchBanner";
import StatsBar from "@/components/landing/StatsBar";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ProductMockup from "@/components/landing/ProductMockup";
import HookShowcase from "@/components/landing/HookShowcase";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="bg-[#080810] text-white overflow-x-hidden">
      <PrelaunchBanner />
      <Navbar />
      <Hero />
      <StatsBar />
      <ProblemSection />
      <HowItWorks />
      <ProductMockup />
      <HookShowcase />
      <FeaturesGrid />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
