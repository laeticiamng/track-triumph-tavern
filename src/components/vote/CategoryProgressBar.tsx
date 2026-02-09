import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

interface CategoryProgressBarProps {
  categories: { id: string; name: string }[];
  votedCategories: Set<string>;
}

export function CategoryProgressBar({ categories, votedCategories }: CategoryProgressBarProps) {
  const total = categories.length;
  const voted = categories.filter((c) => votedCategories.has(c.id)).length;
  const pct = total > 0 ? (voted / total) * 100 : 0;

  if (total === 0) return null;

  return (
    <div className="glass rounded-2xl px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">
          Progression : {voted}/{total} categories votees
        </span>
        <span className="text-xs text-muted-foreground">
          {Math.round(pct)}%
        </span>
      </div>
      <Progress value={pct} className="h-2" />
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => {
          const isVoted = votedCategories.has(cat.id);
          return (
            <span
              key={cat.id}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                isVoted
                  ? "bg-green-500/15 text-green-500"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {isVoted ? (
                <CheckCircle2 className="h-2.5 w-2.5" />
              ) : (
                <Circle className="h-2.5 w-2.5" />
              )}
              {cat.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
