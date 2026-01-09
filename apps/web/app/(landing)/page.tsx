import { CompareSection } from "@/components/landing/CompareSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { Footer } from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import { PricingPlans } from "@/components/landing/PricingPlans";
import { TabsSection } from "@/components/landing/TabsSection";
import { VideoSection } from "@/components/landing/VideoSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <TabsSection />
      <VideoSection />
      <CompareSection />
      <FaqSection />
      <Footer />
    </div>
  );
}
