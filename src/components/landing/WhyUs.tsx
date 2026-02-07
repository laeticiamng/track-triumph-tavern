import { motion } from "framer-motion";
import { Scale, ShieldCheck, Trophy, Users } from "lucide-react";

const pillars = [
  {
    icon: Scale,
    title: "100% méritocratique",
    description: "Le classement repose uniquement sur les votes de la communauté. Aucun paiement n'influence les résultats.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-fraude IA",
    description: "Chaque vote est analysé par notre système d'intelligence artificielle pour garantir l'intégrité du concours.",
  },
  {
    icon: Trophy,
    title: "Récompenses réelles",
    description: "Un reward pool alimenté chaque semaine. Les artistes du podium repartent avec des récompenses concrètes.",
  },
  {
    icon: Users,
    title: "Communauté engagée",
    description: "Rejoignez des artistes et des passionnés de musique qui s'écoutent, se votent et se soutiennent.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function WhyUs() {
  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Pourquoi Weekly Music Awards ?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Un concours conçu pour mettre en avant le talent, pas le portefeuille.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {pillars.map((p) => (
            <motion.div
              key={p.title}
              variants={itemVariants}
              className="rounded-2xl border border-border bg-card p-6 text-center transition-shadow hover:shadow-soft"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                <p.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
