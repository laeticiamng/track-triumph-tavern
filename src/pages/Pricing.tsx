import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star, Zap, Loader2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/lib/subscription-tiers";

const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
  free: <Zap className="h-6 w-6" />,
  pro: <Star className="h-6 w-6" />,
  elite: <Crown className="h-6 w-6" />,
};

const Pricing = () => {
  const { user } = useAuth();
  const { tier: currentTier, loading: subLoading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Handle checkout cancelled return
  useEffect(() => {
    if (searchParams.get("checkout") === "cancelled") {
      toast({
        title: "Paiement annulé",
        description: "Vous pouvez reprendre votre abonnement à tout moment.",
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
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: plan.price_id },
      });
      if (error) throw error;
      const result = typeof data === "string" ? JSON.parse(data) : data;
      if (result.error) {
        toast({ title: "Erreur", description: result.error, variant: "destructive" });
      } else if (result.url) {
        window.open(result.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: "Impossible de créer la session de paiement.", variant: "destructive" });
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
      if (result.url) window.open(result.url, "_blank");
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ouvrir le portail.", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const isSubscribed = currentTier && currentTier !== "free";

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">
              Choisissez votre plan
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Écoutez et votez gratuitement. Débloquez la soumission et des outils pro avec un abonnement.
            </p>
            <p className="mt-2 text-sm text-muted-foreground/70">
              Les abonnements n'influencent pas le classement — seuls les votes comptent.
            </p>
            {user && isSubscribed && (
              <Button
                variant="outline"
                className="mt-4"
                disabled={portalLoading}
                onClick={handleManageSubscription}
              >
                {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                Gérer mon abonnement
              </Button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {(Object.entries(SUBSCRIPTION_TIERS) as [SubscriptionTier, typeof SUBSCRIPTION_TIERS[SubscriptionTier]][]).map(
              ([key, plan], index) => {
                const isCurrentPlan = currentTier === key;
                const isPopular = key === "pro";

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`relative flex flex-col h-full ${
                        isPopular
                          ? "border-primary shadow-lg scale-[1.02]"
                          : "border-border"
                      } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
                    >
                      {isPopular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                          Populaire
                        </Badge>
                      )}
                      {isCurrentPlan && (
                        <Badge className="absolute -top-3 right-4 bg-success text-success-foreground">
                          Votre plan
                        </Badge>
                      )}

                      <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          {tierIcons[key]}
                        </div>
                        <CardTitle className="font-display text-2xl">{plan.name}</CardTitle>
                        <div className="mt-2">
                          <span className="font-display text-4xl font-bold">
                            {plan.price === 0 ? "Gratuit" : `${plan.price}€`}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-sm text-muted-foreground"> /mois</span>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1">
                        <ul className="space-y-3">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter>
                        {key === "free" ? (
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled={isCurrentPlan}
                            onClick={() => {
                              if (!user && !isCurrentPlan) navigate("/auth?tab=signup");
                            }}
                          >
                            {isCurrentPlan ? "Plan actuel" : "Créer mon compte"}
                          </Button>
                        ) : (
                          <Button
                            className={`w-full ${isPopular ? "bg-gradient-primary hover:opacity-90" : ""}`}
                            disabled={isCurrentPlan || loadingTier === key || subLoading}
                            onClick={() => handleSubscribe(key)}
                          >
                            {loadingTier === key ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {isCurrentPlan ? "Plan actuel" : "S'abonner"}
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
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Sans engagement · Annulable à tout moment · Paiement sécurisé par Stripe
          </p>
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default Pricing;
