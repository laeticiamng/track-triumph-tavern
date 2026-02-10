import { motion } from "framer-motion";
import { Mic2, Waves, Globe, Zap, Heart, Guitar, Music, Music2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const categoryMeta: Record<string, { icon: React.ElementType; color: string }> = {
  pop: { icon: Music, color: "from-pink-500/20 to-rose-500/20" },
  rock: { icon: Guitar, color: "from-orange-500/20 to-red-500/20" },
  "hip-hop": { icon: Mic2, color: "from-violet-500/20 to-purple-500/20" },
  electro: { icon: Zap, color: "from-cyan-500/20 to-blue-500/20" },
  rnb: { icon: Heart, color: "from-red-500/20 to-pink-500/20" },
  jazz: { icon: Music2, color: "from-blue-500/20 to-indigo-500/20" },
  classique: { icon: BookOpen, color: "from-amber-500/20 to-yellow-500/20" },
  world: { icon: Globe, color: "from-emerald-500/20 to-teal-500/20" },
  autres: { icon: Waves, color: "from-indigo-500/20 to-violet-500/20" },
};

const defaultColor = "from-primary/10 to-primary/5";

export function CategoriesSection() {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    supabase.from("categories").select("id, name, slug").order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  return (
    <section id="categories" className="border-t border-border py-24 md:py-32 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {categories.length} catégories musicales
          </h2>
          <p className="mt-4 text-muted-foreground">
            Chaque semaine, participez dans votre style.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4"
        >
          {categories.map((cat) => {
            const meta = categoryMeta[cat.slug] || { icon: Music, color: defaultColor };
            const Icon = meta.icon;
            return (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className={`group flex flex-col items-center gap-3 rounded-2xl border border-border bg-gradient-to-br ${meta.color} p-6 transition-all hover:scale-[1.02] hover:shadow-soft cursor-pointer`}
              >
                <Icon className="h-7 w-7 text-foreground/70 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium">{cat.name}</span>
              </Link>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
