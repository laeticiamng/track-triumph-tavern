import { motion } from "framer-motion";
import { Trophy, MessageSquare, Users, BadgeCheck, Banknote } from "lucide-react";

const benefits = [
  {
    icon: Banknote,
    title: "Jusqu'à 200 € par semaine",
    description: "Le podium est récompensé chaque semaine : 200 €, 100 € et 50 € pour les trois premiers.",
    gradient: "from-emerald-500/20 to-green-500/20",
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Trophy,
    title: "Visibilité garantie",
    description: "Les gagnants sont mis en avant sur la page d'accueil et la page Explore.",
    gradient: "from-amber-500/20 to-yellow-500/20",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    icon: MessageSquare,
    title: "Feedback détaillé",
    description: "Chaque vote évalue votre morceau sur 3 critères : émotion, originalité et production.",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Users,
    title: "Communauté de passionnés",
    description: "Faites-vous connaître auprès d'une audience qui écoute et note votre musique.",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  {
    icon: BadgeCheck,
    title: "Badges & classements",
    description: "Affichez vos résultats et vos badges sur votre profil artiste pour crédibiliser votre parcours.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
];

export function ArtistBenefits() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/30 to-transparent" />
      <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-primary/5 blur-[120px]" />

      <div className="container px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
            Pour les artistes
          </span>
          <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
            Ce que vous gagnez en participant
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Un concours pensé pour valoriser les artistes, pas seulement les classer.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`group rounded-2xl border border-border bg-gradient-to-br ${b.gradient} p-6 transition-all hover:shadow-lg hover:-translate-y-1`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${b.iconBg} mb-4 transition-transform group-hover:scale-110`}>
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
