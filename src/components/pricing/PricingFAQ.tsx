import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Est-ce que l'abonnement influence le classement ?",
    a: "Non, jamais. Le classement est 100 % basé sur les votes de la communauté. L'abonnement vous donne accès à des outils (IA, stats, soumission) mais n'affecte pas votre position.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui, sans engagement. Vous pouvez annuler votre abonnement en un clic depuis votre espace. Vous conservez les avantages jusqu'à la fin de la période payée.",
  },
  {
    q: "Quelle est la différence entre Pro et Elite ?",
    a: "Pro vous permet de soumettre un morceau et d'accéder aux outils IA de base. Elite ajoute le feedback IA structuré, les commentaires illimités, le badge exclusif et la personnalisation avancée de votre profil.",
  },
];

export function PricingFAQ() {
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
            Questions fréquentes
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-semibold">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          D'autres questions ?{" "}
          <Link to="/faq" className="text-primary hover:underline">
            Consultez notre FAQ complète
          </Link>
        </p>
      </div>
    </section>
  );
}
