import { motion } from "framer-motion";
import { Upload, Headphones, Trophy, ChevronRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Créez un compte",
    description: "Inscrivez-vous gratuitement en 30 secondes. Votre compte vous donne accès à l'écoute et au vote.",
    badge: "Gratuit",
  },
  {
    icon: Headphones,
    title: "Écoutez & Votez",
    description: "Découvrez les soumissions de la semaine et votez pour vos favoris dans chaque catégorie. Le vote est gratuit pour tous.",
    badge: "Gratuit",
  },
  {
    icon: Trophy,
    title: "Soumettez & Montez sur le podium",
    description: "Avec un abonnement Pro, soumettez vos morceaux et visez le podium chaque semaine. Jusqu'à 200 € à gagner.",
    badge: "Pro",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function HowItWorks() {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Comment ça marche
          </h2>
          <p className="mt-4 text-muted-foreground">
            Trois étapes simples pour participer au concours.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="relative flex flex-col items-center text-center"
            >
              {/* Connecting arrow between steps (desktop only) */}
              {i < steps.length - 1 && (
                <div className="absolute -right-4 top-7 hidden md:flex items-center justify-center w-8 text-muted-foreground/40" style={{ transform: "translateX(100%)" }}>
                  <ChevronRight className="h-6 w-6" />
                </div>
              )}
              {/* Step number */}
              <span className="absolute -top-3 right-4 font-display text-6xl font-bold text-muted/80 md:right-8">
                {i + 1}
              </span>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                <step.icon className="h-6 w-6 text-accent-foreground" />
              </div>

              <h3 className="mt-6 font-display text-xl font-semibold">
                {step.title}
              </h3>
              {step.badge && (
                <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                  step.badge === "Gratuit"
                    ? "bg-success/15 text-success"
                    : "bg-primary/15 text-primary"
                }`}>
                  {step.badge}
                </span>
              )}
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
