import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead, breadcrumbJsonLd } from "@/components/seo/SEOHead";
import { getArticleBySlug } from "@/lib/articles-data";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Tag, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function articleJsonLd(article: ReturnType<typeof getArticleBySlug>) {
  if (!article) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `https://weeklymusicawards.com/articles/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Organization",
      name: "Weekly Music Awards",
      url: "https://weeklymusicawards.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Weekly Music Awards",
      url: "https://weeklymusicawards.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://weeklymusicawards.com/articles/${article.slug}`,
    },
    keywords: article.tags.join(", "),
    articleSection: article.category,
    wordCount: article.sections.reduce((sum, s) => sum + s.content.split(/\s+/).length + s.heading.split(/\s+/).length, 0),
    inLanguage: "fr",
  };
}

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) return <Navigate to="/articles" replace />;

  const jsonLd = [
    articleJsonLd(article)!,
    breadcrumbJsonLd([
      { name: "Accueil", url: "/" },
      { name: "Articles", url: "/articles" },
      { name: article.title, url: `/articles/${article.slug}` },
    ]),
  ];

  return (
    <Layout>
      <SEOHead
        title={article.title}
        description={article.description}
        url={`/articles/${article.slug}`}
        type="article"
        jsonLd={jsonLd}
      />
      <article className="container max-w-3xl py-10 md:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Tous les articles
          </Link>
        </nav>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground mb-3">
            {article.category}
          </span>
          <h1 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl leading-tight">
            {article.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{article.subtitle}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.readTime} min de lecture
            </span>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        </motion.header>

        {/* Sections */}
        <div className="mt-10 space-y-10">
          {article.sections.map((section, i) => (
            <motion.section
              key={section.heading}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              aria-labelledby={`section-${i}`}
            >
              <h2
                id={`section-${i}`}
                className="font-display text-xl font-semibold mb-3"
              >
                {section.heading}
              </h2>
              <div className="prose-custom space-y-3 text-muted-foreground leading-relaxed">
                {section.content.split("\n\n").map((paragraph, pi) => (
                  <p
                    key={pi}
                    dangerouslySetInnerHTML={{
                      __html: paragraph
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br />"),
                    }}
                  />
                ))}
              </div>
              {section.tip && (
                <div className="mt-4 flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <Lightbulb className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <p className="text-sm text-foreground/80">
                    <strong className="text-primary">Conseil pro :</strong> {section.tip}
                  </p>
                </div>
              )}
            </motion.section>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 rounded-2xl border border-border bg-card p-8 text-center"
        >
          <h2 className="font-display text-xl font-semibold">
            Prêt à mettre ces conseils en pratique ?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Soumettez votre morceau au concours Weekly Music Awards et recevez les votes de la communauté.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <Link to="/auth?tab=signup">
                Rejoindre le concours
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/articles">Voir tous les articles</Link>
            </Button>
          </div>
        </motion.div>
      </article>
      <Footer />
    </Layout>
  );
};

export default ArticleDetail;
