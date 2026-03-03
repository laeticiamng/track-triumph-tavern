import { Crown, Mic, TrendingUp, MessageSquareHeart, BarChart3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Feedback IA structuré",
    description: "Recevez une analyse détaillée de vos forces et axes d'amélioration après chaque soumission.",
  },
  {
    icon: <MessageSquareHeart className="h-6 w-6" />,
    title: "Commentaires illimités",
    description: "Échangez sans limite avec la communauté et construisez votre réseau musical.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Statistiques avancées",
    description: "Comprenez précisément ce qui plaît dans votre musique grâce à des données détaillées.",
  },
  {
    icon: <Crown className="h-6 w-6" />,
    title: "Badge Elite exclusif",
    description: "Démarquez-vous avec un profil premium qui attire l'attention des votants.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Visibilité accrue",
    description: "Votre profil personnalisé et votre banner custom vous font sortir du lot.",
  },
  {
    icon: <Mic className="h-6 w-6" />,
    title: "Soumission hebdomadaire",
    description: "Participez chaque semaine au concours et développez votre audience régulièrement.",
  },
];

export function WhyEliteSection() {
  return (
    <section className="pb-16">
      <div className="container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-4">
            Elite
          </span>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Pourquoi les artistes choisissent{" "}
            <span className="text-amber-600 dark:text-amber-400">Elite</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Les artistes qui progressent le plus vite sont ceux qui obtiennent du feedback précis.
            Elite vous donne les outils pour comprendre, améliorer et vous démarquer.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3">
                {b.icon}
              </div>
              <h3 className="font-display text-sm font-semibold">{b.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground italic">
            « Depuis que j'ai Elite, je comprends enfin pourquoi certains morceaux fonctionnent mieux que d'autres. Le feedback IA a changé ma façon de produire. »
          </p>
          <p className="mt-1 text-xs text-muted-foreground">— Un artiste Elite</p>
        </motion.div>
      </div>
    </section>
  );
}
