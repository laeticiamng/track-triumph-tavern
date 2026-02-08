import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Music, Target, Shield, Gift } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Notre mission",
    description:
      "Offrir à chaque artiste indépendant une scène équitable pour se faire connaître, basée uniquement sur le talent et le vote de la communauté.",
  },
  {
    icon: Shield,
    title: "Intégrité",
    description:
      "Notre système anti-fraude par IA garantit que chaque vote compte. Le classement ne peut être influencé par aucun paiement.",
  },
  {
    icon: Gift,
    title: "Récompenses",
    description:
      "Chaque semaine, une cagnotte est constituée et redistribuée aux artistes du podium. Les montants varient selon la participation et les sponsors.",
  },
  {
    icon: Music,
    title: "Communauté",
    description:
      "Weekly Music Awards est construit par et pour les passionnés de musique. Écoutez, votez, partagez et soutenez les artistes émergents.",
  },
];

const About = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-display text-3xl font-bold sm:text-5xl">
              À propos
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Weekly Music Awards est un concours musical hebdomadaire où la communauté
              écoute, vote et récompense les meilleurs artistes indépendants. Notre
              plateforme est actuellement en <strong>bêta</strong>.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <v.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {v.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 rounded-2xl border border-border bg-card p-8 text-center"
          >
            <h2 className="font-display text-xl font-semibold">Une question ?</h2>
            <p className="mt-2 text-muted-foreground">
              Contactez-nous à{" "}
              <a
                href="mailto:contact@weeklymusicawards.com"
                className="text-primary hover:underline"
              >
                contact@weeklymusicawards.com
              </a>
            </p>
          </motion.div>
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default About;
