import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Music, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const timeline = [
  { week: "Semaine 1", title: "Rencontre & Inspiration", desc: "Les 5 artistes se découvrent, partagent leurs influences et choisissent une direction créative." },
  { week: "Semaine 2-3", title: "Exploration & Esquisses", desc: "Chacun contribue des éléments musicaux issus de sa tradition culturelle." },
  { week: "Semaine 4-5", title: "Production Collaborative", desc: "Sessions de co-création en ligne, mixage et arrangements collectifs." },
  { week: "Semaine 6", title: "Présentation", desc: "Le morceau co-créé est présenté lors d'un événement culturel européen en ligne." },
];

const countries = ["🇫🇷", "🇩🇪", "🇮🇹", "🇪🇸", "🇵🇱", "🇳🇱", "🇸🇪", "🇵🇹", "🇬🇷", "🇮🇪", "🇧🇪", "🇦🇹"];

const VirtualResidency = () => (
  <Layout>
    <SEOHead
      title="Virtual Residency — Track Triumph"
      description="Résidence virtuelle européenne : 6 semaines de création collaborative entre 5 artistes de 5 pays de l'UE."
      url="/virtual-residency"
    />

    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
      <div className="container relative max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 mb-4">
            <MapPin className="h-3.5 w-3.5" />
            Virtual Residency
          </span>
          <h1 className="font-display text-4xl font-bold sm:text-5xl mb-4">
            5 pays, 5 artistes, 1 <span className="text-primary">morceau</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Une résidence créative virtuelle de 6 semaines où des talents de toute l'Europe collaborent
            pour produire un morceau présenté lors d'un événement culturel européen.
          </p>

          <div className="mt-6 flex justify-center gap-2 text-2xl">
            {countries.map((flag, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i, type: "spring" }}
              >
                {flag}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-6 mb-16">
          {timeline.map((t, i) => (
            <motion.div
              key={t.week}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * i }}
            >
              <Card>
                <CardContent className="p-6 flex gap-5 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">{t.week}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{t.title}</h3>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Example progress */}
        <Card className="mb-12">
          <CardContent className="p-8 text-center">
            <h3 className="font-display text-xl font-bold mb-2">Résidence en cours — Cohorte #1</h3>
            <p className="text-sm text-muted-foreground mb-4">5 artistes · France, Allemagne, Italie, Espagne, Pologne</p>
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progression</span>
                <span>Semaine 4 / 6</span>
              </div>
              <Progress value={66} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button size="lg">
            <Users className="mr-2 h-4 w-4" />
            Postuler pour la prochaine cohorte (bientôt)
          </Button>
        </div>
      </div>
    </section>
    <Footer />
  </Layout>
);

export default VirtualResidency;
