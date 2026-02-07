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
          className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-center sm:p-16"
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-[60px]" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/5 blur-[40px]" />
          </div>

          <div className="relative z-10">
            <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
              Prêt à rejoindre le concours ?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-primary-foreground/80">
              Créez votre compte en 30 secondes. Écoutez, votez gratuitement et soumettez vos morceaux avec un abonnement Pro.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-primary-foreground text-background hover:bg-primary-foreground/90 font-semibold px-8"
                asChild
              >
                <Link to="/auth?tab=signup">
                  Créer mon compte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/pricing">Voir les abonnements</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
