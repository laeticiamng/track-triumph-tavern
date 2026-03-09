import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Globe, Music, Star, Calendar, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const themes = [
  { month: "Janvier", tradition: "Flamenco", country: "Espagne 🇪🇸", color: "bg-red-500/10 text-red-600 dark:text-red-400", desc: "Passion, palmas et guitare — intégrez l'essence du flamenco dans votre production." },
  { month: "Février", tradition: "Rythmes Balkans", country: "Balkans 🇷🇸🇧🇬", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", desc: "Mesures asymétriques, cuivres et énergie folle — les Balkans invitent à la fête." },
  { month: "Mars", tradition: "Folk Celtique", country: "Irlande 🇮🇪 / Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", desc: "Violon, tin whistle et mélodies mélancoliques — la magie celte dans vos beats." },
  { month: "Avril", tradition: "Fado", country: "Portugal 🇵🇹", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", desc: "Saudade et guitare portugaise — l'émotion brute du fado rencontre la production moderne." },
  { month: "Mai", tradition: "Chanson française", country: "France 🇫🇷", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", desc: "Texte poétique et mélodie raffinée — la tradition de Brel, Piaf et Barbara." },
  { month: "Juin", tradition: "Polka / Folklore", country: "Europe Centrale 🇵🇱🇨🇿", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", desc: "Accordéon et rythmes de danse — l'énergie joyeuse d'Europe centrale." },
];

const criteria = [
  { label: "Qualité musicale", weight: "50%", icon: Music },
  { label: "Authenticité culturelle", weight: "30%", icon: Globe },
  { label: "Créativité dans la fusion", weight: "20%", icon: Star },
];

const CulturalExchange = () => (
  <Layout>
    <SEOHead
      title="Échange Culturel Européen — Track Triumph"
      description="Compétitions mensuelles thématiques célébrant les traditions musicales européennes. Flamenco, Balkans, Celtique et plus."
      url="/cultural-exchange"
    />

    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-amber-500/5" />
      <div className="container relative max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4">
            <Globe className="h-3.5 w-3.5" />
            Échange Culturel
          </span>
          <h1 className="font-display text-4xl font-bold sm:text-5xl mb-4">
            Un continent, mille <span className="text-primary">traditions</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Chaque mois, une tradition musicale européenne devient le fil conducteur du concours.
            Fusionnez votre style avec un héritage culturel unique.
          </p>
        </motion.div>

        {/* Criteria */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-4 mb-16 max-w-xl mx-auto">
          {criteria.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="text-center rounded-xl border border-border p-4">
                <Icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-sm font-semibold">{c.weight}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Monthly themes */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((t, i) => (
            <motion.div
              key={t.month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className={t.color}>{t.month}</Badge>
                    <span className="text-xs text-muted-foreground">{t.country}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t.tradition}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/compete">
              <Music className="mr-2 h-4 w-4" />
              Participer au concours du mois
            </Link>
          </Button>
        </div>
      </div>
    </section>
    <Footer />
  </Layout>
);

export default CulturalExchange;
