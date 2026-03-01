import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead, breadcrumbJsonLd } from "@/components/seo/SEOHead";
import { articles } from "@/lib/articles-data";
import { motion } from "framer-motion";
import { BookOpen, Clock, ArrowRight, PenTool } from "lucide-react";
import { Link } from "react-router-dom";

const pageJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Articles & Guides de production musicale — Weekly Music Awards",
    url: "https://weeklymusicawards.com/articles",
    description:
      "Guides experts de production musicale : mixage vocal rap, ambiance lofi, sound design EDM, songwriting pop, production R&B. Conseils et techniques pour artistes indépendants.",
    isPartOf: {
      "@type": "WebSite",
      name: "Weekly Music Awards",
      url: "https://weeklymusicawards.com",
    },
  },
  breadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Articles", url: "/articles" },
  ]),
];

const Articles = () => (
  <Layout>
    <SEOHead
      title="Articles & Guides de production musicale"
      description="Guides experts de production musicale pour artistes indépendants : mixage vocal rap, ambiance lofi, sound design EDM, songwriting pop, production R&B. Techniques et conseils par Weekly Music Awards."
      url="/articles"
      jsonLd={pageJsonLd}
    />
    <section className="py-12 md:py-20">
      <div className="container max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            <PenTool className="h-3.5 w-3.5" />
            Ressources pour artistes
          </span>
          <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">
            Guides de production musicale
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Des guides experts écrits par l'équipe Weekly Music Awards pour vous aider à améliorer
            votre production, comprendre les critères de notation et maximiser vos chances au
            concours.
          </p>
        </motion.div>

        {/* Articles grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {articles.map((article, i) => (
            <motion.article
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
            >
              <Link
                to={`/articles/${article.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-card/80"
              >
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground mb-3">
                  {article.category}
                </span>
                <h2 className="font-display text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {article.description}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {article.readTime} min de lecture
                  </span>
                  <span className="inline-flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Lire <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            <BookOpen className="inline h-4 w-4 mr-1 -mt-0.5" />
            Nouveaux guides publiés régulièrement.{" "}
            <Link to="/auth?tab=signup" className="text-primary hover:underline">
              Créez un compte
            </Link>{" "}
            pour être notifié.
          </p>
        </motion.div>
      </div>
    </section>
    <Footer />
  </Layout>
);

export default Articles;
