import { motion } from "framer-motion";
import { Mic2, Waves, Globe, Zap, Heart, Guitar, Music, Music2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const categoryMeta: Record<string, { icon: React.ElementType; gradient: string; iconBg: string }> = {
  pop: { icon: Music, gradient: "from-pink-500/20 to-rose-500/20", iconBg: "bg-pink-500/15 text-pink-600 dark:text-pink-400" },
  rock: { icon: Guitar, gradient: "from-orange-500/20 to-red-500/20", iconBg: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
  "hip-hop": { icon: Mic2, gradient: "from-violet-500/20 to-purple-500/20", iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  electro: { icon: Zap, gradient: "from-cyan-500/20 to-blue-500/20", iconBg: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400" },
  rnb: { icon: Heart, gradient: "from-red-500/20 to-pink-500/20", iconBg: "bg-red-500/15 text-red-600 dark:text-red-400" },
  jazz: { icon: Music2, gradient: "from-blue-500/20 to-indigo-500/20", iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  classique: { icon: BookOpen, gradient: "from-amber-500/20 to-yellow-500/20", iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  world: { icon: Globe, gradient: "from-emerald-500/20 to-teal-500/20", iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  autres: { icon: Waves, gradient: "from-indigo-500/20 to-violet-500/20", iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400" },
};

const defaultMeta = { icon: Music, gradient: "from-primary/10 to-primary/5", iconBg: "bg-primary/15 text-primary" };

const fallbackCategories: { id: string; name: string; slug: string }[] = [
  { id: "fb-pop", name: "Pop", slug: "pop" },
  { id: "fb-rock", name: "Rock", slug: "rock" },
  { id: "fb-hiphop", name: "Hip-Hop / Rap", slug: "hip-hop" },
  { id: "fb-electro", name: "Electro", slug: "electro" },
  { id: "fb-rnb", name: "R&B", slug: "rnb" },
  { id: "fb-jazz", name: "Jazz", slug: "jazz" },
  { id: "fb-classique", name: "Classique", slug: "classique" },
  { id: "fb-world", name: "World / Afro", slug: "world" },
  { id: "fb-autres", name: "Autres", slug: "autres" },
];

export function CategoriesSection() {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>(fallbackCategories);

  useEffect(() => {
    supabase.from("categories").select("id, name, slug").order("sort_order").then(({ data }) => {
      if (data && data.length > 0) setCategories(data);
    }).catch(() => {});
  }, []);

  return (
    <section id="categories" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 to-transparent" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4">
            Tous les styles
          </span>
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
          className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4"
        >
          {categories.map((cat, i) => {
            const meta = categoryMeta[cat.slug] || defaultMeta;
            const Icon = meta.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to={`/categories/${cat.slug}`}
                  className={`group flex flex-col items-center gap-3 rounded-2xl border border-border bg-gradient-to-br ${meta.gradient} p-5 transition-all hover:scale-[1.04] hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${meta.iconBg} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">{cat.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
