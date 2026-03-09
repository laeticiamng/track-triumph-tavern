import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Video, Clock, Star, Users, MessageSquare, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mentors = [
  { name: "Elena Vasquez", country: "Espagne 🇪🇸", speciality: "Flamenco / Fusion", initials: "EV" },
  { name: "Lars Eriksson", country: "Suède 🇸🇪", speciality: "Electronic / Ambient", initials: "LE" },
  { name: "Chiara Bianchi", country: "Italie 🇮🇹", speciality: "Jazz / Neo-Soul", initials: "CB" },
  { name: "Tomasz Nowak", country: "Pologne 🇵🇱", speciality: "Hip-Hop / Production", initials: "TN" },
  { name: "Marie Dupont", country: "France 🇫🇷", speciality: "Chanson / Pop", initials: "MD" },
  { name: "Dimitris Papadopoulos", country: "Grèce 🇬🇷", speciality: "World Music / Rebetiko", initials: "DP" },
];

const steps = [
  { icon: Users, title: "Choisissez un mentor", desc: "Parcourez les profils selon votre genre et vos objectifs." },
  { icon: Clock, title: "Réservez une session", desc: "Créneaux de 30 minutes, flexibles selon les fuseaux horaires." },
  { icon: Video, title: "Échangez en vidéo", desc: "Feedback personnalisé sur votre production, voix ou composition." },
  { icon: Star, title: "Progressez", desc: "Recevez un rapport de session et des recommandations d'exercices." },
];

const MentorMatch = () => (
  <Layout>
    <SEOHead
      title="Mentor Match — Track Triumph"
      description="Programme de mentorat européen. Des musiciens confirmés vous accompagnent par sessions vidéo de 30 minutes."
      url="/mentor-match"
    />

    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
      <div className="container relative max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
            <Video className="h-3.5 w-3.5" />
            Mentor Match
          </span>
          <h1 className="font-display text-4xl font-bold sm:text-5xl mb-4">
            Apprenez des <span className="text-primary">meilleurs</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Des musiciens européens confirmés partagent leur expertise lors de sessions vidéo individuelles de 30 minutes.
          </p>
        </motion.div>

        {/* How it works */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Mentor grid */}
        <h2 className="font-display text-2xl font-bold text-center mb-8">Nos mentors</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((m, i) => (
            <motion.div key={m.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 * i }}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{m.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.country}</p>
                    <p className="text-xs text-primary mt-0.5">{m.speciality}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg">
            <MessageSquare className="mr-2 h-4 w-4" />
            Demander une session (bientôt)
          </Button>
        </div>
      </div>
    </section>
    <Footer />
  </Layout>
);

export default MentorMatch;
