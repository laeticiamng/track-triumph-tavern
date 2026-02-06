import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { CTASection } from "@/components/landing/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorks />
      <CategoriesSection />
      <CTASection />
      <Footer />
    </Layout>
  );
};

export default Index;
