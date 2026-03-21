import { useParams, Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead, breadcrumbJsonLd } from "@/components/seo/SEOHead";
import { getArticleBySlug, getRelatedArticles } from "@/lib/articles-data";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Tag, Lightbulb, ArrowRight, Music } from "lucide-react";
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

const LOCALE_MAP: Record<string, string> = { fr: "fr-FR", en: "en-GB", de: "de-DE" };

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const article = slug ? getArticleBySlug(slug) : undefined;
  const relatedArticles = article ? getRelatedArticles(article) : [];
  const dateLocale = LOCALE_MAP[i18n.language] || "fr-FR";

  if (!article) return <Navigate to="/articles" replace />;

  const jsonLd = [
    articleJsonLd(article)!,
    breadcrumbJsonLd([
      { name: t("articleDetail.breadcrumbHome"), url: "/" },
      { name: t("articleDetail.breadcrumbArticles"), url: "/articles" },
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
      <article className="container max-w-3xl py-8 sm:py-10 md:py-16 px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {t("articleDetail.allArticles")}
          </Link>
        </nav>

        {/* CTA above the fold */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="text-sm text-muted-foreground">
            {t("articleDetail.ctaTop")}
          </p>
          <Button asChild size="sm" className="bg-gradient-primary whitespace-nowrap">
            <Link to="/compete">
              {t("articleDetail.submit")} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </motion.div>

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
              {new Date(article.publishedAt).toLocaleDateString(dateLocale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {t("articleDetail.readTime", { count: article.readTime })}
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
                  <p key={pi}>
                    {paragraph.split(/(\*\*.*?\*\*|\n)/g).map((segment, si) => {
                      if (segment === "\n") return <br key={si} />;
                      const boldMatch = segment.match(/^\*\*(.*)\*\*$/);
                      if (boldMatch) return <strong key={si}>{boldMatch[1]}</strong>;
                      return segment;
                    })}
                  </p>
                ))}
              </div>
              {section.tip && (
                <div className="mt-4 flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <Lightbulb className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <p className="text-sm text-foreground/80">
                    <strong className="text-primary">{t("articleDetail.proTip")}</strong> {section.tip}
                  </p>
                </div>
              )}
            </motion.section>
          ))}
        </div>

        {/* Category link */}
        {article.categorySlug && (
          <div className="mt-10">
            <Link
              to={`/categories/${article.categorySlug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Music className="h-4 w-4" />
              {t("articleDetail.viewCategory", { category: article.category })}
            </Link>
          </div>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <h2 className="font-display text-xl font-semibold mb-4">{t("articleDetail.relatedArticles")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedArticles.map((ra) => (
                <Link
                  key={ra.slug}
                  to={`/articles/${ra.slug}`}
                  className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <span className="text-xs font-medium text-primary">{ra.category}</span>
                  <h3 className="mt-1 font-display text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {ra.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{ra.subtitle}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                    {t("articleDetail.read")} <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 rounded-2xl border border-border bg-card p-8 text-center"
        >
          <h2 className="font-display text-xl font-semibold">
            {t("articleDetail.ctaTitle")}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t("articleDetail.ctaDesc")}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="bg-gradient-primary">
              <Link to="/compete">
                {t("articleDetail.submitTrack")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/articles">{t("articleDetail.viewAllArticles")}</Link>
            </Button>
          </div>
        </motion.div>
      </article>
      <Footer />
    </Layout>
  );
};

export default ArticleDetail;
