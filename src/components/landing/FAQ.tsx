import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "C'est vraiment gratuit ?",
    a: "Le vote et l'écoute sont 100% gratuits pour tous les membres. Pour soumettre un morceau au concours, un abonnement Pro (à partir de 9,99 €/mois) est nécessaire. Aucun paiement n'influence le classement.",
  },
  {
    q: "Qui peut participer ?",
    a: "Tout artiste ou groupe musical peut s'inscrire. Il suffit de posséder les droits sur le morceau soumis et de respecter le règlement du concours.",
  },
  {
    q: "Comment les notes sont-elles calculées ?",
    a: "Chaque vote évalue trois critères : originalité, production et émotion. La moyenne pondérée des trois donne le score final. Notre système anti-fraude IA garantit l'intégrité de chaque vote.",
  },
  {
    q: "Quelles sont les récompenses ?",
    a: "Un reward pool est alimenté chaque semaine. Les montants varient selon les sponsors et la participation. Les 3 premiers du podium se partagent les récompenses.",
  },
  {
    q: "Comment fonctionne l'anti-fraude ?",
    a: "Notre intelligence artificielle analyse chaque vote en temps réel : détection de comptes suspects, rafales de votes, comportements anormaux. Les votes frauduleux sont automatiquement invalidés.",
  },
  {
    q: "Puis-je soumettre plusieurs morceaux ?",
    a: "Vous pouvez soumettre un morceau par semaine et par catégorie. Cela garantit une compétition équitable pour tous les artistes.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 md:py-32">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tout ce que vous devez savoir avant de vous lancer.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
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
      </div>
    </section>
  );
}
