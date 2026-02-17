import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Music, Headphones } from "lucide-react";
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
          {/* Animated background orbs */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/5 blur-[60px]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-400/5 blur-[50px]"
              animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.05, 0.12, 0.05] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </div>

          {/* Floating icons */}
          <div className="absolute inset-0 hidden sm:block" aria-hidden="true">
            <motion.div
              className="absolute top-8 left-10 text-white/10"
              animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Music className="h-6 w-6" />
            </motion.div>
            <motion.div
              className="absolute bottom-10 right-12 text-white/10"
              animate={{ y: [0, -10, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Headphones className="h-7 w-7" />
            </motion.div>
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                </span>
                Inscriptions ouvertes
              </span>
            </motion.div>

            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Prêt à rejoindre le concours ?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/70">
              Rejoignez les premiers membres de la bêta. Les premières semaines sont décisives — faites-vous un nom dès le début.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-8 shadow-lg shadow-white/10"
                asChild
              >
                <Link to="/auth?tab=signup">
                  Rejoindre le concours
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link to="/pricing">Voir les abonnements</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-300" />
                Inscription en 30s
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-amber-300" />
                Sans engagement
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-pink-300" />
                Vote gratuit
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
