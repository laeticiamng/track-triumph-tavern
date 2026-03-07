import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Trophy, Calendar } from "lucide-react";
import { BADGE_CONFIG, type BadgeType } from "@/hooks/use-weekly-badges";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

interface BadgeWithProfile {
  id: string;
  user_id: string;
  week_id: string;
  badge_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
  week_number: number | null;
}

const Badges = () => {
  const { t } = useTranslation();
  const [badges, setBadges] = useState<BadgeWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState<Tables<"weeks"> | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("weeks").select("*").eq("is_active", true).maybeSingle(),
      supabase.from("weekly_badges").select("*").order("created_at", { ascending: false }).limit(50),
    ]).then(async ([weekRes, badgesRes]) => {
      setActiveWeek(weekRes.data || null);

      if (badgesRes.data && badgesRes.data.length > 0) {
        const userIds = [...new Set(badgesRes.data.map(b => b.user_id))];
        const weekIds = [...new Set(badgesRes.data.map(b => b.week_id))];

        const [profilesRes, weeksRes] = await Promise.all([
          supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds),
          supabase.from("weeks").select("id, week_number").in("id", weekIds),
        ]);

        const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);
        const weekMap = new Map(weeksRes.data?.map(w => [w.id, w.week_number]) || []);

        const enriched: BadgeWithProfile[] = badgesRes.data.map(b => ({
          ...b,
          metadata: (b.metadata as Record<string, unknown>) || {},
          display_name: profileMap.get(b.user_id)?.display_name || null,
          avatar_url: profileMap.get(b.user_id)?.avatar_url || null,
          week_number: weekMap.get(b.week_id) || null,
        }));
        setBadges(enriched);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Group by week
  const badgesByWeek = badges.reduce<Record<string, BadgeWithProfile[]>>((acc, b) => {
    const key = b.week_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});

  return (
    <Layout>
      <SEOHead
        title={t("badgesPage.seoTitle")}
        description={t("badgesPage.seoDesc")}
        url="/badges"
      />
      <div className="container max-w-3xl py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
            <Award className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">{t("badgesPage.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("badgesPage.subtitle")}</p>
          </div>
        </div>

        {/* Badge legend */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(BADGE_CONFIG) as [BadgeType, typeof BADGE_CONFIG[BadgeType]][]).map(([type, config]) => (
            <Card key={type} className="text-center p-4">
              <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${config.color} text-2xl shadow-lg`}>
                {config.emoji}
              </div>
              <p className="text-sm font-semibold">{t(config.labelKey)}</p>
              <p className="text-xs text-muted-foreground mt-1">{t(config.descriptionKey)}</p>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : Object.keys(badgesByWeek).length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-semibold">{t("badgesPage.noBadgesAwarded")}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {t("badgesPage.noBadgesDesc")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(badgesByWeek).map(([weekId, weekBadges]) => (
              <motion.div
                key={weekId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {t("badgesPage.week")} {weekBadges[0]?.week_number ?? "?"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {weekBadges.map((badge) => {
                        const config = BADGE_CONFIG[badge.badge_type as BadgeType];
                        if (!config) return null;
                        return (
                          <Link
                            key={badge.id}
                            to={`/artist/${badge.user_id}`}
                            className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent/50 transition-colors"
                          >
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${config.color} text-lg shadow-md`}>
                              {config.emoji}
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={badge.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">{(badge.display_name || "?")[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{badge.display_name || t("badgesPage.anonymous")}</p>
                              <p className="text-xs text-muted-foreground">{t(config.labelKey)}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </Layout>
  );
};

export default Badges;
