import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { VoteButton } from "@/components/vote/VoteButton";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Music, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type Submission = Tables<"submissions">;
type Category = Tables<"categories">;

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const activeCategory = searchParams.get("category") || "all";

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from("submissions")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (activeCategory !== "all") {
      query = query.eq("category_id", activeCategory);
    }

    query.then(({ data }) => {
      setSubmissions(data || []);
      setLoading(false);
    });
  }, [activeCategory]);

  const filtered = submissions.filter((s) =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.artist_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Explorer</h1>
            <p className="mt-2 text-muted-foreground">Découvrez les soumissions approuvées de la semaine.</p>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un titre ou artiste..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category filters */}
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setSearchParams({})}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              Toutes
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSearchParams({ category: cat.id })}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Music className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-display text-lg font-semibold">Aucune soumission</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeCategory !== "all" ? "Aucune soumission dans cette catégorie." : "Les soumissions apparaîtront ici une fois approuvées."}
              </p>
              <Link
                to="/compete"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Soumettre un morceau
              </Link>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/submissions/${sub.id}`}
                  className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-soft hover:border-primary/20"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={sub.cover_image_url}
                      alt={sub.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="truncate font-display text-lg font-semibold text-white">
                        {sub.title}
                      </h3>
                      <p className="truncate text-sm text-white/70">{sub.artist_name}</p>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <AudioPlayer src={sub.audio_excerpt_url} compact />
                    <div className="flex items-center justify-between" onClick={(e) => e.preventDefault()}>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {sub.vote_count}
                      </span>
                      <VoteButton submissionId={sub.id} compact />
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default Explore;
