import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Mic2, Waves, Globe, Zap, Heart, Guitar, Headphones, Music, Disc3,
  Palmtree, Wheat, Music2, ArrowLeft, ArrowRight, BookOpen, Users, ExternalLink,
  Quote, Tag, Palette, ChevronLeft, ChevronRight, SlidersHorizontal,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  "rap-trap": Mic2, pop: Music, afro: Globe, electronic: Zap,
  rnb: Heart, lofi: Headphones, "rock-indie": Guitar, open: Waves,
  dj: Disc3, reggae: Palmtree, country: Wheat, jazz: Music2,
};

const gradientMap: Record<string, string> = {
  "rap-trap": "from-violet-500/30 to-purple-500/30",
  pop: "from-pink-500/30 to-rose-500/30",
  afro: "from-amber-500/30 to-orange-500/30",
  electronic: "from-cyan-500/30 to-blue-500/30",
  rnb: "from-red-500/30 to-pink-500/30",
  lofi: "from-emerald-500/30 to-teal-500/30",
  "rock-indie": "from-orange-500/30 to-red-500/30",
  open: "from-indigo-500/30 to-violet-500/30",
  dj: "from-fuchsia-500/30 to-pink-500/30",
  reggae: "from-green-500/30 to-yellow-500/30",
  country: "from-yellow-500/30 to-amber-500/30",
  jazz: "from-blue-500/30 to-indigo-500/30",
};

type ProductionTip = { label: string; value: string };

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  history: string | null;
  notable_artists: string[] | null;
  sub_genres: string[] | null;
  mood_tags: string[] | null;
  fun_fact: string | null;
  production_tips: ProductionTip[] | null;
  sort_order: number;
};

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [allCategories, setAllCategories] = useState<{ slug: string; name: string; sort_order: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, description, history, notable_artists, sub_genres, mood_tags, fun_fact, production_tips, sort_order")
        .eq("slug", slug)
        .single(),
      supabase
        .from("categories")
        .select("slug, name, sort_order")
        .order("sort_order"),
    ]).then(([{ data: cat }, { data: all }]) => {
      setCategory(cat as CategoryRow | null);
      if (all) setAllCategories(all);
      setLoading(false);
    });
  }, [slug]);

  const Icon = slug ? iconMap[slug] || Music : Music;
  const gradient = slug ? gradientMap[slug] || "from-primary/20 to-primary/10" : "from-primary/20 to-primary/10";

  // Navigation prev/next
  const currentIndex = allCategories.findIndex((c) => c.slug === slug);
  const prevCat = currentIndex > 0 ? allCategories[currentIndex - 1] : null;
  const nextCat = currentIndex < allCategories.length - 1 ? allCategories[currentIndex + 1] : null;

  // Split history into paragraphs
  const historyParagraphs = category?.history?.split(/\n\n+/).filter(Boolean) || [];

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32" />
        </div>
        <Footer />
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Catégorie introuvable</h1>
          <Link to="/#categories" className="mt-4 inline-block text-primary hover:underline">
            Retour aux catégories
          </Link>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero banner */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-gradient-to-br ${gradient} border-b border-border`}
      >
        <div className="container py-16 md:py-24">
          <Link
            to="/#categories"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Toutes les catégories
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background/60 backdrop-blur">
              <Icon className="h-8 w-8 text-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">{category.name}</h1>
              {category.description && (
                <p className="mt-1 text-lg text-muted-foreground">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      <div className="container py-12 space-y-16">
        {/* Fun Fact / Citation */}
        {category.fun_fact && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className={`relative rounded-2xl bg-gradient-to-br ${gradient} border border-border p-8 md:p-10`}>
              <Quote className="absolute top-4 left-4 h-8 w-8 text-foreground/10" />
              <p className="font-display text-xl md:text-2xl font-medium italic text-foreground/90 leading-relaxed pl-6">
                {category.fun_fact}
              </p>
            </div>
          </motion.section>
        )}

        {/* Sous-genres acceptés */}
        {category.sub_genres && category.sub_genres.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold">Sous-genres acceptés</h2>
            </div>
            <p className="text-muted-foreground mb-5">
              Ton style rentre dans cette catégorie ? Voici les sous-genres bienvenus.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {category.sub_genres.map((sg) => (
                <Badge
                  key={sg}
                  variant="outline"
                  className="px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5"
                >
                  {sg}
                </Badge>
              ))}
            </div>
          </motion.section>
        )}

        {/* Mood tags */}
        {category.mood_tags && category.mood_tags.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold">Ambiances typiques</h2>
            </div>
            <p className="text-muted-foreground mb-5">
              Les vibes qu'on retrouve le plus dans ce genre. Positionne ton morceau.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {category.mood_tags.map((mood) => (
                <span
                  key={mood}
                  className="inline-flex items-center rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
                >
                  {mood}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Conseils de production */}
        {category.production_tips && (category.production_tips as ProductionTip[]).length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold">Conseils de production</h2>
            </div>
            <p className="text-muted-foreground mb-5">
              Repères techniques pour bien préparer ta soumission dans cette catégorie.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {(category.production_tips as ProductionTip[]).map((tip) => (
                <div
                  key={tip.label}
                  className={`rounded-xl border border-border p-5 ${
                    tip.label === "Conseil" ? "sm:col-span-2 bg-primary/5" : "bg-card"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                    {tip.label}
                  </p>
                  <p className="text-foreground leading-relaxed">{tip.value}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Histoire */}
        {historyParagraphs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold">Histoire du genre</h2>
            </div>
            <div className="space-y-4">
              {historyParagraphs.map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </motion.section>
        )}

        {/* Grandes figures */}
        {category.notable_artists && category.notable_artists.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold">Grandes figures</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {category.notable_artists.map((artist) => (
                <Badge
                  key={artist}
                  variant="secondary"
                  className="px-4 py-2 text-sm font-medium"
                >
                  {artist}
                </Badge>
              ))}
            </div>
          </motion.section>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button asChild size="lg" className="rounded-full">
            <Link to={`/explore?category=${category.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir les soumissions
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link to="/compete">Participer au concours</Link>
          </Button>
        </motion.div>

        {/* Navigation inter-catégories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-between border-t border-border pt-8"
        >
          {prevCat ? (
            <Link
              to={`/categories/${prevCat.slug}`}
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>{prevCat.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {nextCat ? (
            <Link
              to={`/categories/${nextCat.slug}`}
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>{nextCat.name}</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <span />
          )}
        </motion.div>
      </div>

      <Footer />
    </Layout>
  );
};

export default CategoryDetail;
