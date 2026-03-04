import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead, faqJsonLd, breadcrumbJsonLd } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqStructure = [
  { titleKey: "general", prefix: "gen", count: 5 },
  { titleKey: "votesAndScoring", prefix: "vote", count: 4 },
  { titleKey: "submissionsAndCategories", prefix: "sub", count: 3 },
  { titleKey: "rewardsAndPool", prefix: "reward", count: 3 },
  { titleKey: "gamificationAndBadges", prefix: "badge", count: 2 },
  { titleKey: "subscriptionsSection", prefix: "abo", count: 3 },
];

const Faq = () => {
  const { t } = useTranslation();

  const faqSections = faqStructure.map((section) => ({
    title: t(`faqPage.${section.titleKey}`),
    items: Array.from({ length: section.count }, (_, i) => ({
      q: t(`faqPage.${section.prefix}_q${i + 1}`),
      a: t(`faqPage.${section.prefix}_a${i + 1}`),
    })),
  }));

  const allFaqs = faqSections.flatMap((s) => s.items);

  return (
    <Layout>
      <SEOHead
        title={t("faqPage.seoTitle")}
        description={t("faqPage.seoDesc")}
        url="/faq"
        jsonLd={[
          faqJsonLd(allFaqs),
          breadcrumbJsonLd([
            { name: t("nav.home"), url: "/" },
            { name: "FAQ", url: "/faq" },
          ]),
        ]}
      />
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-display text-3xl font-bold sm:text-5xl">
              {t("faqPage.title")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("faqPage.subtitle")}
            </p>
          </motion.div>

          <div className="mt-12 space-y-10">
            {faqSections.map((section, si) => (
              <motion.div
                key={si}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + si * 0.08 }}
              >
                <h2 className="font-display text-xl font-semibold mb-4">
                  {section.title}
                </h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {section.items.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`${si}-${i}`}
                      className="rounded-xl border border-border bg-card px-6"
                    >
                      <AccordionTrigger className="text-left font-display font-semibold hover:no-underline">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-14 rounded-2xl border border-border bg-card p-8 text-center"
          >
            <h2 className="font-display text-xl font-semibold">
              {t("faqPage.noAnswer")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("faqPage.contactUs")}
            </p>
            <a
              href="mailto:contact@emotionscare.com"
              className="mt-4 inline-block text-primary hover:underline font-medium"
            >
              contact@emotionscare.com
            </a>
          </motion.div>
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default Faq;
