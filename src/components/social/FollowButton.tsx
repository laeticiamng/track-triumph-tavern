import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFollow } from "@/hooks/use-follow";
import { useTranslation } from "react-i18next";

interface FollowButtonProps {
  targetUserId: string;
  compact?: boolean;
}

export function FollowButton({ targetUserId, compact = false }: FollowButtonProps) {
  const { t } = useTranslation();
  const { isFollowing, toggleFollow, loading, canFollow } = useFollow(targetUserId);

  if (!canFollow) return null;

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size={compact ? "sm" : "default"}
      onClick={toggleFollow}
      disabled={loading}
      className={`gap-1.5 ${isFollowing ? "" : "bg-gradient-primary hover:opacity-90 transition-opacity"}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {isFollowing ? t("follow.unfollow", "Ne plus suivre") : t("follow.follow", "Suivre")}
    </Button>
  );
}
