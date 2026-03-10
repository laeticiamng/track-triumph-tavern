import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, useReducedMotion } from "framer-motion";
import { Video, Clock, Star, Users, MessageSquare, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const mentors = [
  { nameKey: "mentorMatch.mentors.elena", countryKey: "mentorMatch.mentors.elenaCountry", specialityKey: "mentorMatch.mentors.elenaSpeciality", initials: "EV" },
  { nameKey: "mentorMatch.mentors.lars", countryKey: "mentorMatch.mentors.larsCountry", specialityKey: "mentorMatch.mentors.larsSpeciality", initials: "LE" },
  { nameKey: "mentorMatch.mentors.chiara", countryKey: "mentorMatch.mentors.chiaraCountry", specialityKey: "mentorMatch.mentors.chiaraSpeciality", initials: "CB" },
  { nameKey: "mentorMatch.mentors.tomasz", countryKey: "mentorMatch.mentors.tomaszCountry", specialityKey: "mentorMatch.mentors.tomaszSpeciality", initials: "TN" },
  { nameKey: "mentorMatch.mentors.marie", countryKey: "mentorMatch.mentors.marieCountry", specialityKey: "mentorMatch.mentors.marieSpeciality", initials: "MD" },
  { nameKey: "mentorMatch.mentors.dimitris", countryKey: "mentorMatch.mentors.dimitrisCountry", specialityKey: "mentorMatch.mentors.dimitrisSpeciality", initials: "DP" },
];

const MentorMatch = () => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const fade = shouldReduceMotion ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  const steps = [
    { icon: Users, titleKey: "mentorMatch.steps.choose", descKey: "mentorMatch.steps.chooseDesc" },
    { icon: Clock, titleKey: "mentorMatch.steps.book", descKey: "mentorMatch.steps.bookDesc" },
    { icon: Video, titleKey: "mentorMatch.steps.exchange", descKey: "mentorMatch.steps.exchangeDesc" },
    { icon: Star, titleKey: "mentorMatch.steps.progress", descKey: "mentorMatch.steps.progressDesc" },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("mentorMatch.seo.title")}
        description={t("mentorMatch.seo.description")}
        url="/mentor-match"
      />

      <section className="py-12 sm:py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
        <div className="container relative max-w-5xl px-4 sm:px-6">
          <motion.div {...fade} className="text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
              <Video className="h-3.5 w-3.5" />
              {t("mentorMatch.badge")}
            </span>
            <h1 className="font-display text-2xl font-bold sm:text-4xl md:text-5xl mb-4">
              {t("mentorMatch.titlePrefix")} <span className="text-primary">{t("mentorMatch.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("mentorMatch.subtitle")}
            </p>
          </motion.div>

          <Alert className="mb-12 max-w-2xl mx-auto border-emerald-500/30 bg-emerald-500/5">
            <Info className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-sm text-emerald-700 dark:text-emerald-400">
              {t("mentorMatch.comingSoon")}
            </AlertDescription>
          </Alert>

          {/* How it works */}
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-10 sm:mb-16">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.titleKey}
                  {...fade}
                  transition={shouldReduceMotion ? undefined : { delay: 0.1 * i }}
                  className="text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{t(s.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(s.descKey)}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Mentor grid */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <h2 className="font-display text-2xl font-bold text-center">{t("mentorMatch.ourMentors")}</h2>
            <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
              {t("mentorMatch.fictitious")}
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((m, i) => (
              <motion.div key={m.initials} {...(shouldReduceMotion ? {} : { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } })} transition={shouldReduceMotion ? undefined : { delay: 0.08 * i }}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{m.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{t(m.nameKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(m.countryKey)}</p>
                      <p className="text-xs text-primary mt-0.5">{t(m.specialityKey)}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" disabled className="opacity-60 cursor-not-allowed">
              <MessageSquare className="mr-2 h-4 w-4" />
              {t("mentorMatch.requestSession")}
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default MentorMatch;
