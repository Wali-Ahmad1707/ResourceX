import { Header } from "@/components/header";
import { HeroSection } from "@/components/sections/hero-section";
import { CategoriesSection } from "@/components/sections/categories-section";
import { FeaturedResourcesSection } from "@/components/sections/featured-resources-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { CommunityBenefitsSection } from "@/components/sections/community-benefits-section";
import { ShareCtaSection } from "@/components/sections/share-cta-section";
import { FooterSection } from "@/components/sections/footer-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CategoriesSection />
      <FeaturedResourcesSection />
      <HowItWorksSection />
      <CommunityBenefitsSection />
      <ShareCtaSection />
      <FooterSection />
    </main>
  );
}
