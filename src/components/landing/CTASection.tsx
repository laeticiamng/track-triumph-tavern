import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 text-center sm:p-16"
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-[60px]" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/5 blur-[40px]" />
          </div>

          <div className="relative z-10">
            <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
              Prêt à montrer votre talent ?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-primary-foreground/70">
              Inscrivez-vous gratuitement et participez au concours de la semaine. 
              Aucun frais d'entrée requis.
            </p>
            <Button
              size="lg"
              className="mt-8 bg-primary-foreground text-foreground hover:bg-primary-foreground/90 font-semibold px-8"
              asChild
            >
              <Link to="/auth?tab=signup">
                Commencer maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
