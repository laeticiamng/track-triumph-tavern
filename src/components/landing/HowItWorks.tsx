import { motion } from "framer-motion";
import { Upload, Headphones, Trophy } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Créez un compte",
    description: "Inscrivez-vous gratuitement en 30 secondes. Votre compte vous donne accès à l'écoute et au vote.",
    badge: "Gratuit",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    accentColor: "bg-emerald-500",
  },
  {
    icon: Headphones,
    title: "Écoutez & Votez",
    description: "Découvrez les soumissions de la semaine et votez pour vos favoris dans chaque catégorie.",
    badge: "Gratuit",
    gradient: "from-blue-500/20 to-violet-500/20",
    iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    accentColor: "bg-blue-500",
  },
  {
    icon: Trophy,
    title: "Soumettez & Montez sur le podium",
    description: "Avec un abonnement Pro, soumettez vos morceaux et visez le podium. Jusqu'à 200 € à gagner.",
    badge: "Pro",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    accentColor: "bg-amber-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function HowItWorks() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
            Simple comme 1-2-3
          </span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Comment ça marche
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Trois étapes simples pour participer au concours musical hebdomadaire.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className={`relative flex flex-col items-center text-center rounded-2xl border border-border bg-gradient-to-br ${step.gradient} p-8 transition-all hover:shadow-lg hover:-translate-y-1`}
            >
              {/* Step number indicator */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-card border-2 border-border font-display text-sm font-bold">
                {i + 1}
              </div>

              {/* Connecting line (desktop) */}
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden md:block w-6 h-0.5 bg-border z-10" />
              )}

              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${step.iconBg} mt-2`}>
                <step.icon className="h-7 w-7" />
              </div>

              <h3 className="mt-6 font-display text-xl font-semibold">
                {step.title}
              </h3>

              <span className={`mt-3 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                step.badge === "Gratuit"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}>
                {step.badge}
              </span>

              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
