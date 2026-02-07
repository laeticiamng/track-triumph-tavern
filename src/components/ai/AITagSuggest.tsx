import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, X } from "lucide-react";

interface AITagSuggestProps {
  title: string;
  description: string;
  category: string;
  currentTags: string;
  onAcceptTags: (tags: string) => void;
}

export function AITagSuggest({ title, description, category, currentTags, onAcceptTags }: AITagSuggestProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleSuggest = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setSuggestions([]);
    setSelected(new Set());

    try {
      const { data, error } = await supabase.functions.invoke("ai-suggest-tags", {
        body: { title, description, category },
      });
      if (error) throw error;
      const result = typeof data === "string" ? JSON.parse(data) : data;
      if (result.error) {
        console.error("AI tag error:", result.error);
      } else {
        setSuggestions(result.tags || []);
        setSelected(new Set(result.tags || []));
      }
    } catch (err) {
      console.error("AI tag suggest error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const acceptSelected = () => {
    const existing = currentTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const merged = [...new Set([...existing, ...selected])];
    onAcceptTags(merged.join(", "));
    setSuggestions([]);
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSuggest}
        disabled={loading || !title.trim()}
        className="gap-1.5"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        Suggérer des tags avec l'IA
      </Button>

      {suggestions.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((tag) => (
              <Badge
                key={tag}
                variant={selected.has(tag) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {selected.has(tag) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={acceptSelected} disabled={selected.size === 0}>
              Ajouter {selected.size} tag{selected.size > 1 ? "s" : ""}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSuggestions([])}>
              Ignorer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
