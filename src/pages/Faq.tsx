import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqSections = [
  {
    title: "Général",
    items: [
      {
        q: "C'est vraiment gratuit ?",
        a: "Le vote et l'écoute sont 100 % gratuits pour tous les membres. Pour soumettre un morceau au concours, un abonnement Pro (à partir de 9,99 €/mois) est nécessaire. Aucun paiement n'influence le classement.",
      },
      {
        q: "Qui peut participer ?",
        a: "Tout artiste ou groupe musical majeur peut s'inscrire. Il suffit de posséder les droits sur le morceau soumis et de respecter le règlement du concours.",
      },
      {
        q: "Faut-il être professionnel pour participer ?",
        a: "Non. Weekly Music Awards est ouvert à tous les artistes, qu'ils soient amateurs ou professionnels. Le concours est basé uniquement sur le talent et l'appréciation de la communauté.",
      },
    ],
  },
  {
    title: "Votes et notation",
    items: [
      {
        q: "Comment les notes sont-elles calculées ?",
        a: "Chaque vote évalue trois critères : émotion, originalité et production. La moyenne pondérée des trois donne le score final. Notre système anti-fraude IA garantit l'intégrité de chaque vote.",
      },
      {
        q: "Combien de votes puis-je donner ?",
        a: "Avec un compte gratuit, vous disposez de 5 votes par semaine. Les abonnés Pro et Elite bénéficient de votes illimités.",
      },
      {
        q: "Comment fonctionne l'anti-fraude ?",
        a: "Notre intelligence artificielle analyse chaque vote en temps réel : détection de comptes suspects, rafales de votes, comportements anormaux. Les votes frauduleux sont automatiquement invalidés.",
      },
    ],
  },
  {
    title: "Soumissions et catégories",
    items: [
      {
        q: "Puis-je soumettre plusieurs morceaux ?",
        a: "Vous pouvez soumettre un morceau par semaine et par catégorie. Cela garantit une compétition équitable pour tous les artistes.",
      },
      {
        q: "Quelles sont les catégories musicales ?",
        a: "Nous proposons 9 catégories : Pop, Rock, Hip-Hop/Rap, Electro, R&B, Jazz, Classique, World/Afro et Autres. Chaque catégorie a son propre classement hebdomadaire.",
      },
      {
        q: "Quel format audio est accepté ?",
        a: "Les soumissions doivent être un extrait audio de 30 à 60 secondes accompagné d'une image de couverture. Les formats audio courants (MP3, WAV, FLAC) sont acceptés.",
      },
    ],
  },
  {
    title: "Récompenses",
    items: [
      {
        q: "Quelles sont les récompenses ?",
        a: "Chaque semaine, une cagnotte sponsorisée récompense les 3 premiers du podium : 🥇 200 € pour le 1er, 🥈 100 € pour le 2e et 🥉 50 € pour le 3e. Les récompenses sont financées par nos sponsors, jamais par les participants.",
      },
      {
        q: "Comment recevoir mes gains ?",
        a: "Les gains sont versés par virement bancaire dans un délai de 14 jours ouvrés après la publication des résultats. Vous devez fournir un RIB valide depuis votre espace profil.",
      },
      {
        q: "Les gains sont-ils imposables ?",
        a: "Les gains sont soumis à la fiscalité applicable dans votre pays de résidence. Il vous appartient de déclarer vos revenus conformément à vos obligations fiscales locales.",
      },
    ],
  },
  {
    title: "Abonnements",
    items: [
      {
        q: "Quels abonnements proposez-vous ?",
        a: "Nous proposons trois formules : Gratuit (écoute + 5 votes/semaine), Pro à 9,99 €/mois (soumission + votes illimités + outils IA) et Elite à 19,99 €/mois (toutes les fonctionnalités Pro + feedback IA détaillé + badge Elite).",
      },
      {
        q: "Puis-je résilier à tout moment ?",
        a: "Oui, tous nos abonnements sont sans engagement. Vous pouvez résilier à tout moment depuis votre espace personnel. L'accès est maintenu jusqu'à la fin de la période facturée.",
      },
      {
        q: "Le paiement influence-t-il le classement ?",
        a: "Absolument pas. Le classement est 100 % méritocratique. Les abonnements donnent accès à des outils (soumission, analytics, IA) mais n'influencent jamais les résultats.",
      },
    ],
  },
];

const Faq = () => {
  return (
    <Layout>
      <SEOHead
        title="FAQ"
        description="Toutes les réponses à vos questions sur Weekly Music Awards : participation, votes, récompenses, abonnements et plus."
        url="/faq"
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
              Questions fréquentes
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Tout ce que vous devez savoir sur Weekly Music Awards.
            </p>
          </motion.div>

          <div className="mt-12 space-y-10">
            {faqSections.map((section, si) => (
              <motion.div
                key={section.title}
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
                      value={`${section.title}-${i}`}
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
              Vous ne trouvez pas votre réponse ?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Contactez-nous directement, on vous répond rapidement.
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
