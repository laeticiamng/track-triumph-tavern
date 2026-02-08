import { motion } from "framer-motion";
import { Trophy, MessageSquare, Users, BadgeCheck, Banknote } from "lucide-react";

const benefits = [
  {
    icon: Banknote,
    title: "Jusqu'à 200 € par semaine",
    description: "Le podium est récompensé chaque semaine : 200 €, 100 € et 50 € pour les trois premiers.",
  },
  {
    icon: Trophy,
    title: "Visibilité garantie",
    description: "Les gagnants sont mis en avant sur la page d'accueil et la page Explore.",
  },
  {
    icon: MessageSquare,
    title: "Feedback détaillé",
    description: "Chaque vote évalue votre morceau sur 3 critères : émotion, originalité et production.",
  },
  {
    icon: Users,
    title: "Communauté de passionnés",
    description: "Faites-vous connaître auprès d'une audience qui écoute et note votre musique.",
  },
  {
    icon: BadgeCheck,
    title: "Badges & classements",
    description: "Affichez vos résultats et vos badges sur votre profil artiste pour crédibiliser votre parcours.",
  },
];

export function ArtistBenefits() {
  return (
    <section className="py-16 md:py-24 bg-accent/30">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
            Ce que vous gagnez en participant
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Un concours pensé pour valoriser les artistes, pas seulement les classer.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-soft transition-shadow"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {b.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
