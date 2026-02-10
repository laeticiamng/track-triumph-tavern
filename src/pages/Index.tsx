import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead, homePageJsonLd } from "@/components/seo/SEOHead";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WeeklyPodium } from "@/components/landing/WeeklyPodium";
import { WhyUs } from "@/components/landing/WhyUs";
import { ArtistBenefits } from "@/components/landing/ArtistBenefits";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { SocialProof } from "@/components/landing/SocialProof";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";

const Index = () => {
  return (
    <Layout>
      <SEOHead
        url="/"
        jsonLd={homePageJsonLd}
      />
      <HeroSection />
      <HowItWorks />
      <WeeklyPodium />
      <WhyUs />
      <ArtistBenefits />
      <CategoriesSection />
      <SocialProof />
      <FAQ />
      <CTASection />
      <Footer />
    </Layout>
  );
};

export default Index;
