import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqKeys = [
  { qKey: "pricing.pricingFaqQ1", aKey: "pricing.pricingFaqA1" },
  { qKey: "pricing.pricingFaqQ2", aKey: "pricing.pricingFaqA2" },
  { qKey: "pricing.pricingFaqQ3", aKey: "pricing.pricingFaqA3" },
];

export function PricingFAQ() {
  const { t } = useTranslation();

  return (
    <section className="pb-16">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            {t("pricing.pricingFaqTitle")}
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqKeys.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="card-elevated border-gradient-hover px-4">
              <AccordionTrigger className="text-left text-sm font-semibold">
                {t(faq.qKey)}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {t(faq.aKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("pricing.pricingFaqMore")}{" "}
          <Link to="/faq" className="text-primary hover:underline">
            {t("pricing.pricingFaqLink")}
          </Link>
        </p>
      </div>
    </section>
  );
}
