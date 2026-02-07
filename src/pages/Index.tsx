import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyUs } from "@/components/landing/WhyUs";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { SocialProof } from "@/components/landing/SocialProof";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorks />
      <WhyUs />
      <CategoriesSection />
      <SocialProof />
      <FAQ />
      <CTASection />
      <Footer />
    </Layout>
  );
};

export default Index;
