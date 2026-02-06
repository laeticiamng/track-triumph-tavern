import { motion } from "framer-motion";
import { Upload, Headphones, Trophy } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Soumettez",
    description: "Uploadez un extrait de votre morceau et remplissez les informations. C'est rapide et gratuit pour participer.",
  },
  {
    icon: Headphones,
    title: "Écoutez & Votez",
    description: "Découvrez les soumissions de la semaine. Écoutez, votez pour vos favoris dans chaque catégorie.",
  },
  {
    icon: Trophy,
    title: "Résultats & Podium",
    description: "À la fin de chaque semaine, les artistes les mieux notés montent sur le podium. Récompenses sponsorisées à la clé.",
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
