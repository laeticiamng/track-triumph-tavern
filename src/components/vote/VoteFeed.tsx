import { useRef, useState, useEffect, useCallback } from "react";
import { VoteCard } from "./VoteCard";

interface FeedSubmission {
  id: string;
  title: string;
  artist_name: string;
  cover_image_url: string;
  audio_excerpt_url: string;
  tags: string[] | null;
  user_id: string;
  category_id: string;
  category_name: string;
  artist_avatar: string | null;
}

interface VoteFeedProps {
  submissions: FeedSubmission[];
  canVote: (categoryId: string) => boolean;
  votedCategories: Set<string>;
  onVoted: (categoryId: string, hadComment?: boolean) => void;
  isAuthenticated: boolean;
  tier: string;
  commentsUsed: number;
  commentsMax: number | "unlimited";
}

export function VoteFeed({
  submissions,
  canVote,
  votedCategories,
  onVoted,
  isAuthenticated,
  tier,
  commentsUsed,
  commentsMax,
}: VoteFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);

  // IntersectionObserver to track which card is visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) setVisibleIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.7 }
    );

    const cards = container.querySelectorAll("[data-index]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [submissions]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {submissions.map((sub, i) => (
        <div
          key={sub.id}
          data-index={i}
          className="h-full snap-start"
          style={{ scrollSnapAlign: "start" }}
        >
          <VoteCard
            submission={sub}
            isVisible={i === visibleIndex}
            canVote={canVote(sub.category_id)}
            hasVotedCategory={votedCategories.has(sub.category_id)}
            categoryName={sub.category_name}
            onVoted={onVoted}
            isAuthenticated={isAuthenticated}
            tier={tier}
            commentsUsed={commentsUsed}
            commentsMax={commentsMax}
          />
        </div>
      ))}
    </div>
  );
}
