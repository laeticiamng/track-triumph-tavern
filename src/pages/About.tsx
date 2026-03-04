import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead, organizationJsonLd, breadcrumbJsonLd } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Target, Shield, Gift, Users, Rocket, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  const { t } = useTranslation();

  const values = [
    { icon: Target, titleKey: "aboutPage.missionTitle", descKey: "aboutPage.missionDesc" },
    { icon: Shield, titleKey: "aboutPage.integrityTitle", descKey: "aboutPage.integrityDesc" },
    { icon: Gift, titleKey: "aboutPage.poolTitle", descKey: "aboutPage.poolDesc" },
    { icon: Users, titleKey: "aboutPage.communityTitle", descKey: "aboutPage.communityDesc" },
  ];

  const timeline = [
    { labelKey: "aboutPage.betaOpen", descKey: "aboutPage.betaOpenDesc", active: true },
    { labelKey: "aboutPage.season1", descKey: "aboutPage.season1Desc", active: false },
    { labelKey: "aboutPage.growth", descKey: "aboutPage.growthDesc", active: false },
    { labelKey: "aboutPage.international", descKey: "aboutPage.internationalDesc", active: false },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("aboutPage.seoTitle")}
        description={t("aboutPage.seoDesc")}
        url="/about"
        jsonLd={[
          organizationJsonLd,
          breadcrumbJsonLd([
            { name: t("nav.home"), url: "/" },
            { name: t("aboutPage.seoTitle"), url: "/about" },
          ]),
        ]}
      />
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
              <Rocket className="h-3.5 w-3.5" />
              {t("aboutPage.teamBadge")}
            </span>
            <h1 className="font-display text-3xl font-bold sm:text-5xl">
              {t("aboutPage.title")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              <strong>{t("aboutPage.intro")}</strong>{" "}
              {t("aboutPage.introDesc")}{" "}
              {t("aboutPage.editedBy")} <strong>EMOTIONSCARE SASU</strong> (SIREN 944 505 445).
            </p>
          </motion.div>

          {/* Notre histoire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-14 rounded-2xl border border-border bg-card p-8"
          >
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              {t("aboutPage.ourStory")}
            </h2>
            <div className="mt-4 space-y-3 text-muted-foreground leading-relaxed">
              <p>{t("aboutPage.storyP1")}</p>
              <p>{t("aboutPage.storyP2")}</p>
              <p>{t("aboutPage.storyP3")}</p>
              <p>{t("aboutPage.storyP4")}</p>
            </div>
          </motion.div>

          {/* Nos valeurs */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <motion.div
                key={v.titleKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + 0.1 * i }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <v.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{t(v.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(v.descKey)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Timeline bêta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-14"
          >
            <h2 className="font-display text-xl font-semibold text-center mb-8">{t("aboutPage.whereAreWe")}</h2>
            <div className="relative flex flex-col gap-6 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {timeline.map((step, i) => (
                <div key={step.labelKey} className="relative">
                  <div className={`absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    step.active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}>
                    {step.active ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className={`font-display font-semibold ${step.active ? "text-primary" : "text-muted-foreground"}`}>
                      {t(step.labelKey)}
                      {step.active && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {t("aboutPage.inProgress")}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{t(step.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact + CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-14 rounded-2xl border border-border bg-card p-8 text-center"
          >
            <h2 className="font-display text-xl font-semibold">{t("aboutPage.contactTitle")}</h2>
            <p className="mt-2 text-muted-foreground">
              {t("aboutPage.contactDesc")}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild>
                <Link to="/auth?tab=signup">
                  {t("aboutPage.joinContest")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:contact@emotionscare.com">
                  {t("aboutPage.contactUs")}
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default About;
