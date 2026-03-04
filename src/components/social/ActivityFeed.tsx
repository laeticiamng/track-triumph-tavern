import { Link } from "react-router-dom";
import { Music, Trophy, Award, Heart, Users } from "lucide-react";
import { useActivityFeed, type ActivityWithProfile } from "@/hooks/use-activity-feed";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, de } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const ICON_MAP: Record<string, typeof Music> = {
  new_submission: Music,
  podium: Trophy,
  badge_earned: Award,
};

const LOCALE_MAP: Record<string, typeof fr> = { fr, en: enUS, de };

function ActivityItem({ activity }: { activity: ActivityWithProfile }) {
  const { t, i18n } = useTranslation();
  const locale = LOCALE_MAP[i18n.language] || enUS;
  const Icon = ICON_MAP[activity.type] || Heart;
  const meta = activity.metadata || {};

  const getLink = () => {
    if (activity.type === "new_submission" && meta.submission_id) return `/submissions/${meta.submission_id}`;
    if (activity.type === "podium") return "/results";
    return `/artist/${activity.user_id}`;
  };

  const getDescription = () => {
    switch (activity.type) {
      case "new_submission":
        return t("feed.newSubmission", "a soumis un nouveau morceau");
      case "podium":
        return t("feed.podium", { rank: meta.rank, defaultValue: "est monté sur le podium (#{{rank}})" });
      case "badge_earned":
        return t("feed.badgeEarned", "a obtenu un nouveau badge");
      default:
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={getLink()}
        className="flex items-start gap-3 rounded-xl border border-border p-3 hover:bg-accent/50 transition-colors group"
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {activity.avatar_url ? (
            <img
              src={activity.avatar_url}
              alt={activity.display_name || ""}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold">
              {(activity.display_name || "?")[0]}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-semibold group-hover:text-primary transition-colors">
              {activity.display_name || t("feed.unknownArtist", "Artiste")}
            </span>{" "}
            <span className="text-muted-foreground">{getDescription()}</span>
          </p>
          {activity.type === "new_submission" && (
            <p className="text-sm font-medium mt-0.5 truncate">{activity.title}</p>
          )}
          {activity.type === "podium" && (
            <p className="text-sm font-medium mt-0.5 truncate">
              {meta.rank === 1 ? "🥇" : meta.rank === 2 ? "🥈" : "🥉"} {activity.title}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale })}
          </p>
        </div>

        {/* Cover thumbnail if available */}
        {meta.cover_image_url && (
          <img
            src={meta.cover_image_url as string}
            alt=""
            className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
          />
        )}

        {/* Type icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1">
          <Icon className="h-4 w-4" />
        </div>
      </Link>
    </motion.div>
  );
}

export function ActivityFeed() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activities, loading } = useActivityFeed();

  if (!user) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold">
            {t("feed.title", "Fil d'activité")}
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Users className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {t("feed.empty", "Suivez des artistes pour voir leur activité ici")}
            </p>
            <Link
              to="/explore"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              {t("feed.discoverArtists", "Découvrir des artistes →")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
