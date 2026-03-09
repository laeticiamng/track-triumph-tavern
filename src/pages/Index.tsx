import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead, homePageJsonLd } from "@/components/seo/SEOHead";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WeeklyPodium } from "@/components/landing/WeeklyPodium";
import { WhyParticipate } from "@/components/landing/WhyParticipate";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { SocialProof } from "@/components/landing/SocialProof";
import { CTASection } from "@/components/landing/CTASection";
import { ActivityFeed } from "@/components/social/ActivityFeed";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";
import { SocialMissionSection } from "@/components/landing/SocialMissionSection";
import { MentorshipResidencySection } from "@/components/landing/MentorshipResidencySection";
import { ProgramsOverview } from "@/components/landing/ProgramsOverview";

const Index = () => {
  return (
    <Layout>
      <SEOHead
        url="/"
        jsonLd={homePageJsonLd}
      />
      <HeroSection />
      <ActivityFeed />
      <HowItWorks />
      <WeeklyPodium />
      <SocialMissionSection />
      <MentorshipResidencySection />
      <WhyParticipate />
      <CategoriesSection />
      <ProgramsOverview />
      <SocialProof />
      <CTASection />
      <StickyMobileCTA />
      <Footer />
    </Layout>
  );
};

export default Index;
