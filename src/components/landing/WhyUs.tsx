import { motion } from "framer-motion";
import { Scale, ShieldCheck, Trophy, Users } from "lucide-react";

const pillars = [
  {
    icon: Scale,
    title: "100 % méritocratique",
    description: "Le classement repose uniquement sur les votes de la communauté. Aucun paiement n'influence les résultats.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    icon: ShieldCheck,
    title: "Anti-fraude IA",
    description: "Chaque vote est analysé par notre système d'intelligence artificielle pour garantir l'intégrité du concours.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Trophy,
    title: "Récompenses réelles",
    description: "200 € pour le 1er, 100 € pour le 2e, 50 € pour le 3e — chaque semaine, financé par nos sponsors.",
    gradient: "from-amber-500/20 to-yellow-500/20",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    icon: Users,
    title: "Communauté engagée",
    description: "Rejoignez des artistes et des passionnés de musique qui s'écoutent, se votent et se soutiennent.",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
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
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background accent orbs */}
      <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-amber-500/5 blur-[80px]" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-4">
            Nos engagements
          </span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Pourquoi{" "}
            <span className="text-gradient">Weekly Music Awards</span> ?
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
              className={`group rounded-2xl border border-border bg-gradient-to-br ${p.gradient} p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1`}
            >
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${p.iconBg} transition-transform group-hover:scale-110`}>
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{p.title}</h3>
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
