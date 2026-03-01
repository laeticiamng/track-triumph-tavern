import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead, faqJsonLd, breadcrumbJsonLd } from "@/components/seo/SEOHead";
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
        q: "Qu'est-ce que Weekly Music Awards ?",
        a: "Weekly Music Awards est le seul concours musical hebdomadaire 100% communautaire et méritocratique. Chaque semaine, des artistes indépendants soumettent leur musique dans 12 catégories. La communauté écoute et vote sur 3 critères (originalité, production, émotion), et les 3 meilleurs de chaque catégorie montent sur le podium.",
      },
      {
        q: "C'est vraiment gratuit ?",
        a: "Le vote et l'écoute sont 100 % gratuits pour tous les membres. Pour soumettre un morceau au concours, un abonnement Pro (à partir de 9,99 €/mois) est nécessaire. Aucun paiement n'influence le classement — le classement est 100% méritocratique.",
      },
      {
        q: "Qui peut participer ?",
        a: "Tout artiste ou groupe musical majeur peut s'inscrire. Il suffit de posséder les droits sur le morceau soumis et de respecter le règlement du concours. Amateurs comme professionnels sont les bienvenus.",
      },
      {
        q: "En quoi Weekly Music Awards est différent des autres concours musicaux ?",
        a: "Contrairement aux concours traditionnels avec jury opaque, Weekly Music Awards est 100% communautaire : c'est le public qui décide. Notre système anti-fraude IA garantit l'intégrité des votes. Les récompenses sont hebdomadaires (pas annuelles), et le classement ne peut jamais être influencé par un paiement.",
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
        q: "Comment fonctionne le système de vote ?",
        a: "Chaque vote évalue trois critères : originalité, production et émotion, chacun noté de 1 à 5 étoiles. La moyenne pondérée des trois donne le score final. Les poids de chaque critère peuvent varier selon la catégorie musicale.",
      },
      {
        q: "Combien de votes puis-je donner ?",
        a: "Avec un compte gratuit, vous disposez de 5 votes par semaine. Les abonnés Pro et Elite bénéficient de votes illimités. Chaque vote est unique par artiste et par semaine.",
      },
      {
        q: "Comment fonctionne l'anti-fraude ?",
        a: "Weekly Music Awards utilise une intelligence artificielle qui analyse chaque vote en temps réel. Le système détecte les comptes suspects, les rafales de votes anormales, les adresses IP suspectes et les comportements frauduleux. Les votes frauduleux sont automatiquement invalidés pour garantir un classement 100% méritocratique.",
      },
      {
        q: "Puis-je laisser un commentaire sur un morceau ?",
        a: "Les abonnés Pro et Elite peuvent laisser des commentaires constructifs sur les morceaux. Les commentaires enrichissent le feedback pour les artistes et contribuent au badge 'Critique étoilé' de la gamification.",
      },
    ],
  },
  {
    title: "Soumissions et catégories",
    items: [
      {
        q: "Quelles sont les 12 catégories musicales ?",
        a: "Weekly Music Awards propose 12 catégories : Rap/Trap, Pop, Afro, Electronic, R&B, Lofi, Rock/Indé, Open, DJ, Reggae, Country et Jazz. Chaque catégorie a ses propres critères de notation, sous-genres acceptés et conseils de production.",
      },
      {
        q: "Puis-je soumettre plusieurs morceaux ?",
        a: "Vous pouvez soumettre un morceau par semaine et par catégorie. Cela garantit une compétition équitable pour tous les artistes.",
      },
      {
        q: "Quel format audio est accepté ?",
        a: "Les soumissions doivent être un extrait audio de 30 à 60 secondes accompagné d'une image de couverture. Les formats audio courants (MP3, WAV, FLAC) sont acceptés.",
      },
    ],
  },
  {
    title: "Récompenses et cagnotte",
    items: [
      {
        q: "Quelles sont les récompenses hebdomadaires ?",
        a: "Chaque semaine, une cagnotte sponsorisée récompense les 3 premiers du podium : 🥇 200 € pour le 1er, 🥈 100 € pour le 2e et 🥉 50 € pour le 3e. Les récompenses sont 100% financées par nos sponsors, jamais par les participants.",
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
    title: "Gamification et badges",
    items: [
      {
        q: "Comment fonctionnent les badges hebdomadaires ?",
        a: "Weekly Music Awards attribue 4 badges chaque semaine : 🏆 Top Voter (le plus de votes), 🔍 Découvreur (premier à voter pour un futur gagnant), 📝 Critique étoilé (le plus de commentaires), 🌈 Éclectique (votes dans le plus de catégories). Les badges sont visibles sur votre profil et dans le leaderboard.",
      },
      {
        q: "Comment fonctionne le streak de votes ?",
        a: "Voter chaque semaine consécutive augmente votre streak (série). Les paliers vont de Start (1 semaine) à Legendary (10+ semaines). Un streak élevé témoigne de votre engagement dans la communauté.",
      },
    ],
  },
  {
    title: "Abonnements",
    items: [
      {
        q: "Quels abonnements proposez-vous ?",
        a: "Trois formules : Gratuit (écoute + 5 votes/semaine), Pro à 9,99 €/mois (soumission + votes illimités + outils IA) et Elite à 19,99 €/mois (toutes les fonctionnalités Pro + feedback IA détaillé + badge Elite + commentaires illimités).",
      },
      {
        q: "Le paiement influence-t-il le classement ?",
        a: "Absolument pas. Le classement de Weekly Music Awards est 100 % méritocratique. Les abonnements donnent accès à des outils (soumission, analytics, IA) mais n'influencent jamais les résultats du concours.",
      },
      {
        q: "Puis-je résilier à tout moment ?",
        a: "Oui, tous nos abonnements sont sans engagement. Vous pouvez résilier à tout moment depuis votre espace personnel. L'accès est maintenu jusqu'à la fin de la période facturée.",
      },
    ],
  },
];

const Faq = () => {
  // Flatten all FAQs for JSON-LD
  const allFaqs = faqSections.flatMap(s => s.items);

  return (
    <Layout>
      <SEOHead
        title="FAQ — Questions fréquentes"
        description="Toutes les réponses sur Weekly Music Awards : comment ça marche, comment voter, les récompenses hebdomadaires, le système anti-fraude IA, les 12 catégories musicales et les abonnements."
        url="/faq"
        jsonLd={[
          faqJsonLd(allFaqs),
          breadcrumbJsonLd([
            { name: "Accueil", url: "/" },
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
