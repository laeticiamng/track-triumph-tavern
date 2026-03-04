import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star, Zap, Loader2, Settings, ShieldCheck, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/lib/subscription-tiers";
import { WhyEliteSection } from "@/components/pricing/WhyEliteSection";
import { SocialProofCounters } from "@/components/pricing/SocialProofCounters";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { trackEvent } from "@/lib/analytics";

const tierConfig: Record<SubscriptionTier, {
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  buttonClass: string;
}> = {
  free: {
    icon: <Zap className="h-6 w-6" />,
    gradient: "from-gray-500/10 to-slate-500/10",
    iconBg: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
    buttonClass: "",
  },
  pro: {
    icon: <Star className="h-6 w-6" />,
    gradient: "from-violet-500/15 to-purple-500/15",
    iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    buttonClass: "bg-gradient-primary hover:opacity-90",
  },
  elite: {
    icon: <Crown className="h-6 w-6" />,
    gradient: "from-amber-500/15 to-orange-500/15",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    buttonClass: "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white",
  },
};

// Comparison table rows - uses i18n keys
const comparisonRowKeys = [
  { labelKey: "pricing.listenTracks", free: true, pro: true, elite: true },
  { labelKey: "pricing.voteWeekly", free: "pricing.votes5", pro: "pricing.unlimited", elite: "pricing.unlimited" },
  { labelKey: "pricing.liveRanking", free: true, pro: true, elite: true },
  { labelKey: "pricing.submitTrack", free: false, pro: "pricing.onePerWeek", elite: "pricing.onePerWeek" },
  { labelKey: "pricing.voteComments", free: false, pro: "pricing.fivePerWeek", elite: "pricing.unlimited" },
  { labelKey: "pricing.customProfile", free: false, pro: true, elite: "pricing.premiumBadge" },
  { labelKey: "pricing.voteStats", free: false, pro: true, elite: "pricing.detailed" },
  { labelKey: "pricing.aiSummary", free: false, pro: true, elite: true },
  { labelKey: "pricing.aiRecommendations", free: false, pro: true, elite: true },
  { labelKey: "pricing.aiChatbot", free: false, pro: true, elite: true },
  { labelKey: "pricing.aiFeedback", free: false, pro: false, elite: true },
  { labelKey: "pricing.bannerProfile", free: false, pro: false, elite: true },
];

const Pricing = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tier: currentTier, loading: subLoading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("checkout") === "cancelled") {
      toast({
        title: t("pricing.paymentCancelled"),
        description: t("pricing.paymentCancelledDesc"),
      });
    }
  }, [searchParams, toast]);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!user) {
      navigate("/auth?tab=signup&redirect=/pricing");
      return;
    }

    const plan = SUBSCRIPTION_TIERS[tier];
    if (!plan.price_id) return;

    setLoadingTier(tier);
    trackEvent("plan_upgrade_clicked", { tier, price_id: plan.price_id });
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: plan.price_id },
      });
      if (error) throw error;
      const result = typeof data === "string" ? JSON.parse(data) : data;
      if (result.error) {
        toast({ title: t("errors.error"), description: result.error, variant: "destructive" });
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      toast({ title: t("errors.error"), description: t("pricing.checkoutError"), variant: "destructive" });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      const result = typeof data === "string" ? JSON.parse(data) : data;
      if (result.url) window.location.href = result.url;
    } catch {
      toast({ title: t("errors.error"), description: t("pricing.portalError"), variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const isSubscribed = currentTier && currentTier !== "free";

  return (
    <Layout>
      <SEOHead title={t("pricing.seoTitle")} description={t("pricing.seoDesc")} url="/pricing" />

      {/* Header */}
      <section className="pt-12 pb-8 md:pt-20 md:pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/30 to-transparent" />
        <div className="absolute top-0 right-1/4 h-48 w-48 rounded-full bg-primary/5 blur-[100px]" />

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
              {t("pricing.badge")}
            </span>
            <h1 className="font-display text-4xl font-bold sm:text-5xl">
              {t("pricing.chooseYour")}{" "}
              <span className="text-gradient">{t("pricing.plan")}</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("pricing.subtitle")}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("pricing.noInfluence")}
            </div>
            {user && isSubscribed && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  disabled={portalLoading}
                  onClick={handleManageSubscription}
                >
                  {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                  {t("pricing.manageSubscription")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {(Object.entries(SUBSCRIPTION_TIERS) as [SubscriptionTier, typeof SUBSCRIPTION_TIERS[SubscriptionTier]][]).map(
              ([key, plan], index) => {
                const isCurrentPlan = currentTier === key;
                const isPopular = key === "pro";
                const config = tierConfig[key];

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`relative flex flex-col h-full bg-gradient-to-br ${config.gradient} transition-all hover:shadow-lg ${
                        isPopular
                          ? "border-primary shadow-lg md:scale-[1.03]"
                          : "border-border"
                      } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
                    >
                      {isPopular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-white border-0 px-4 py-1">
                          {t("pricing.mostPopular")}
                        </Badge>
                      )}
                      {isCurrentPlan && (
                        <Badge className="absolute -top-3 right-4 bg-success text-success-foreground">
                          {t("pricing.yourPlan")}
                        </Badge>
                      )}

                      <CardHeader className="text-center pb-4">
                        <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${config.iconBg}`}>
                          {config.icon}
                        </div>
                        <CardTitle className="font-display text-2xl">{t(`pricing.${key}Name`)}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">{t(`pricing.${key}Tagline`)}</p>
                        <div className="mt-4">
                          <span className="font-display text-4xl font-bold">
                            {plan.price === 0 ? t("pricing.free") : `${plan.price}€`}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-sm text-muted-foreground"> {t("pricing.perMonth")}</span>
                          )}
                        </div>
                      </CardHeader>

                      {/* Quick highlights */}
                      <CardContent className="flex-1 space-y-4">
                        <div className="space-y-2 rounded-xl bg-background/50 p-3">
                          {plan.highlights.map((h, hi) => {
                            const highlightLabelKeys: Record<string, string> = {
                              "Votes": "pricing.highlightVotes",
                              "Soumission": "pricing.highlightSubmission",
                              "Commentaires": "pricing.highlightComments",
                              "Profil artiste": "pricing.highlightProfile",
                              "Statistiques": "pricing.highlightStats",
                              "Outils IA": "pricing.highlightAI",
                            };
                            const highlightValueKeys: Record<string, string> = {
                              "5 / semaine": "pricing.fivePerWeek",
                              "Non": "pricing.no",
                              "Basique": "pricing.highlightBasic",
                              "Illimités": "pricing.unlimited",
                              "1 / semaine": "pricing.onePerWeek",
                              "Personnalisé": "pricing.highlightCustom",
                              "Oui": "pricing.unlimited",
                              "3 outils": "pricing.highlight3tools",
                              "Premium + badge": "pricing.premiumBadge",
                              "Détaillées": "pricing.detailed",
                              "4 outils (+ feedback)": "pricing.highlight4tools",
                            };
                            const labelKey = highlightLabelKeys[h.label] || h.label;
                            const valueKey = highlightValueKeys[h.value] || h.value;
                            return (
                              <div key={hi} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{t(labelKey)}</span>
                                <span className={`font-medium ${h.value === "Non" ? "text-muted-foreground/50" : ""}`}>
                                  {t(valueKey)}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <ul className="space-y-2.5">
                          {plan.features.map((_f, fi) => (
                            <li key={fi} className="flex items-start gap-2 text-sm">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{t(`pricing.${key}Feature${fi + 1}`)}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter className="pt-4">
                        {key === "free" ? (
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled={isCurrentPlan}
                            onClick={() => {
                              if (!user && !isCurrentPlan) navigate("/auth?tab=signup");
                            }}
                          >
                            {isCurrentPlan ? t("pricing.currentPlan") : user ? t("pricing.planFree") : t("pricing.createMyAccount")}
                          </Button>
                        ) : (
                          <Button
                            className={`w-full ${config.buttonClass}`}
                            disabled={isCurrentPlan || loadingTier === key || subLoading}
                            onClick={() => handleSubscribe(key)}
                          >
                            {loadingTier === key ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {isCurrentPlan ? t("pricing.currentPlan") : currentTier !== "free" ? t("pricing.upgrade") : t("pricing.startWinning")}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              }
            )}
          </div>

          {/* Reassurance */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-success" />
              {t("pricing.noCommitment")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-success" />
              {t("pricing.cancelAnytime")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-success" />
              {t("pricing.securePayment")}
            </span>
          </div>
        </div>
      </section>

      {/* Social proof counters */}
      <SocialProofCounters />

      {/* Why Elite */}
      <WhyEliteSection />

      {/* Pricing FAQ */}
      <PricingFAQ />

      {/* Comparison table */}
      <section className="pb-20">
        <div className="container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {t("pricing.comparison")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("pricing.comparisonDesc")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="overflow-x-auto rounded-2xl border border-border"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left font-display font-semibold">{t("pricing.feature")}</th>
                  <th className="px-4 py-3 text-center font-display font-semibold">Free</th>
                  <th className="px-4 py-3 text-center font-display font-semibold text-primary">Pro</th>
                  <th className="px-4 py-3 text-center font-display font-semibold text-amber-600 dark:text-amber-400">Elite</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRowKeys.map((row, i) => (
                  <tr key={row.labelKey} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-card" : "bg-background"}`}>
                    <td className="px-4 py-3 font-medium">{t(row.labelKey)}</td>
                    {(["free", "pro", "elite"] as const).map((tier) => {
                      const val = row[tier];
                      return (
                        <td key={tier} className="px-4 py-3 text-center">
                          {val === true ? (
                            <Check className="mx-auto h-4 w-4 text-success" />
                          ) : val === false ? (
                            <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                          ) : (
                            <span className="text-xs font-medium">{t(val)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      <Footer />
    </Layout>
  );
};

export default Pricing;
