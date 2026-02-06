import { motion } from "framer-motion";
import { Mic2, Waves, Globe, Zap, Heart, Guitar, Headphones, Music } from "lucide-react";

const categories = [
  { name: "Rap / Trap", icon: Mic2, color: "from-violet-500/20 to-purple-500/20" },
  { name: "Pop", icon: Music, color: "from-pink-500/20 to-rose-500/20" },
  { name: "Afro", icon: Globe, color: "from-amber-500/20 to-orange-500/20" },
  { name: "Electronic", icon: Zap, color: "from-cyan-500/20 to-blue-500/20" },
  { name: "R&B", icon: Heart, color: "from-red-500/20 to-pink-500/20" },
  { name: "Lofi", icon: Headphones, color: "from-emerald-500/20 to-teal-500/20" },
  { name: "Rock / Indé", icon: Guitar, color: "from-orange-500/20 to-red-500/20" },
  { name: "Open", icon: Waves, color: "from-indigo-500/20 to-violet-500/20" },
];

export function CategoriesSection() {
  return (
    <section className="border-t border-border py-24 md:py-32 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            8 catégories musicales
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
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`group flex flex-col items-center gap-3 rounded-2xl border border-border bg-gradient-to-br ${cat.color} p-6 transition-all hover:scale-[1.02] hover:shadow-soft cursor-pointer`}
            >
              <cat.icon className="h-7 w-7 text-foreground/70 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">{cat.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
