import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Music, Target, Shield, Gift, Users, Rocket, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
      "Notre système anti-fraude par IA analyse chaque vote en temps réel. Le classement ne peut être influencé par aucun paiement ni manipulation.",
  },
  {
    icon: Gift,
    title: "Cagnotte hebdomadaire",
    description:
      "Chaque semaine, une cagnotte sponsorisée est redistribuée au podium : 🥇 200 € · 🥈 100 € · 🥉 50 €. 100 % financée par nos sponsors, jamais par les participants.",
  },
  {
    icon: Users,
    title: "Communauté",
    description:
      "Weekly Music Awards est construit par et pour les passionnés de musique. Écoutez, votez, partagez et soutenez les artistes émergents.",
  },
];

const timeline = [
  { label: "Bêta ouverte", description: "Testez la plateforme, soumettez vos morceaux et donnez-nous vos retours.", active: true },
  { label: "Saison 1 — Lancement officiel", description: "Cagnotte active chaque semaine, classement complet et premiers sponsors.", active: false },
  { label: "Croissance", description: "Nouveaux genres, événements live, partenariats labels et coaching artistes.", active: false },
  { label: "Internationalisation", description: "Ouverture à de nouveaux pays et catégories musicales.", active: false },
];

const About = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
              <Rocket className="h-3.5 w-3.5" />
              Équipe de passionnés
            </span>
            <h1 className="font-display text-3xl font-bold sm:text-5xl">
              À propos de Weekly Music Awards
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Le concours musical hebdomadaire où la communauté écoute, vote et récompense
              les meilleurs artistes indépendants. Un projet édité par{" "}
              <strong className="text-foreground">EMOTIONSCARE SASU</strong>.
            </p>
          </motion.div>

          {/* Notre histoire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-14 rounded-2xl border border-border bg-card p-8"
          >
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Notre histoire
            </h2>
            <div className="mt-4 space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Tout est parti d'un constat simple : des milliers d'artistes indépendants créent des morceaux incroyables chaque jour, mais la plupart n'ont aucune visibilité. Les algorithmes des plateformes de streaming favorisent les artistes déjà établis, et les concours traditionnels manquent souvent de transparence.
              </p>
              <p>
                Weekly Music Awards est né de cette frustration. L'idée ? Créer un concours <strong>100 % méritocratique</strong>, où seul le talent compte. Pas de jury opaque, pas de passe-droits : c'est la communauté qui écoute, qui vote, et qui décide du podium.
              </p>
              <p>
                La plateforme est éditée par <strong>EMOTIONSCARE SASU</strong> (SIREN 944 505 445), une entreprise française dédiée à la valorisation des talents musicaux émergents.
              </p>
              <p>
                Nous sommes actuellement en <strong>bêta ouverte</strong> — chaque retour de votre part nous aide à construire la meilleure plateforme possible. Rejoignez-nous et participez à cette aventure dès le début.
              </p>
            </div>
          </motion.div>

          {/* Nos valeurs */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + 0.1 * i }}
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

          {/* Timeline bêta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-14"
          >
            <h2 className="font-display text-xl font-semibold text-center mb-8">Où en sommes-nous ?</h2>
            <div className="relative flex flex-col gap-6 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {timeline.map((step, i) => (
                <div key={step.label} className="relative">
                  <div className={`absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    step.active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}>
                    {step.active ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className={`font-display font-semibold ${step.active ? "text-primary" : "text-muted-foreground"}`}>
                      {step.label}
                      {step.active && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          En cours
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact + CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-14 rounded-2xl border border-border bg-card p-8 text-center"
          >
            <h2 className="font-display text-xl font-semibold">Envie de participer ou de poser une question ?</h2>
            <p className="mt-2 text-muted-foreground">
              On adore échanger avec notre communauté. Écrivez-nous ou rejoignez directement le concours.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild>
                <Link to="/auth?tab=signup">
                  Rejoindre le concours
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:contact@emotionscare.com">
                  Nous contacter
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default About;
