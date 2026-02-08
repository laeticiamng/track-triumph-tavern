import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Aminata D.",
    role: "Artiste R&B",
    quote: "J'ai soumis mon premier titre en pensant que personne n'écouterait. J'ai fini 2e de la semaine. Le système de vote est vraiment transparent.",
    avatar: "AD",
  },
  {
    name: "Kévin L.",
    role: "Beatmaker",
    quote: "Enfin un concours où c'est le talent qui parle, pas le nombre de followers. Le retour de la communauté est super motivant.",
    avatar: "KL",
  },
  {
    name: "Sarah M.",
    role: "Auditrice & Voteuse",
    quote: "J'adore découvrir de nouveaux artistes chaque semaine. L'interface est fluide et voter prend moins d'une minute.",
    avatar: "SM",
  },
];

export function Testimonials() {
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
            Ce qu'en disent nos bêta-testeurs
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Premiers retours de la communauté en avant-première.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                "{t.quote}"
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-display text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
