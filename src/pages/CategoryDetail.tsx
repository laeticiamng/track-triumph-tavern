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
  Palmtree, Wheat, Music2, ArrowLeft, BookOpen, Users, ExternalLink,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  "rap-trap": Mic2,
  pop: Music,
  afro: Globe,
  electronic: Zap,
  rnb: Heart,
  lofi: Headphones,
  "rock-indie": Guitar,
  open: Waves,
  dj: Disc3,
  reggae: Palmtree,
  country: Wheat,
  jazz: Music2,
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

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  history: string | null;
  notable_artists: string[] | null;
};

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("categories")
      .select("id, name, slug, description, history, notable_artists")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        setCategory(data as CategoryRow | null);
        setLoading(false);
      });
  }, [slug]);

  const Icon = slug ? iconMap[slug] || Music : Music;
  const gradient = slug ? gradientMap[slug] || "from-primary/20 to-primary/10" : "from-primary/20 to-primary/10";

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
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            Retour à l'accueil
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
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
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
        {/* Histoire */}
        {category.history && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold">Histoire du genre</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {category.history}
              </p>
            </div>
          </motion.section>
        )}

        {/* Grandes figures */}
        {category.notable_artists && category.notable_artists.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
      </div>

      <Footer />
    </Layout>
  );
};

export default CategoryDetail;
