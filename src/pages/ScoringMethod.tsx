import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead, breadcrumbJsonLd } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Shield,
  Scale,
  Users,
  Heart,
  Lightbulb,
  SlidersHorizontal,
  CheckCircle,
  AlertTriangle,
  Eye,
  Lock,
  Zap,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/* ─── JSON-LD schemas for GEO (kept in French for SEO indexing) ──── */

const scoringHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment fonctionne la notation sur Weekly Music Awards",
  description:
    "Guide complet du système de notation du concours musical Weekly Music Awards : 3 critères (émotion, originalité, production), pondération par genre, calcul du score moyen pondéré et mesures anti-fraude IA.",
  totalTime: "PT2M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Écouter l'extrait musical", text: "L'auditeur écoute l'extrait audio de 30 à 60 secondes soumis par l'artiste dans l'une des 12 catégories musicales." },
    { "@type": "HowToStep", position: 2, name: "Évaluer les 3 critères", text: "Le votant attribue une note de 1 à 5 étoiles sur trois critères indépendants : Émotion, Originalité et Production." },
    { "@type": "HowToStep", position: 3, name: "Application de la pondération", text: "Les trois notes sont pondérées selon les coefficients spécifiques à chaque catégorie musicale." },
    { "@type": "HowToStep", position: 4, name: "Calcul du score moyen pondéré", text: "Le score final d'un morceau est la moyenne pondérée de tous les votes valides reçus pendant la semaine." },
    { "@type": "HowToStep", position: 5, name: "Validation anti-fraude IA", text: "Chaque vote passe par un système anti-fraude à intelligence artificielle." },
  ],
};

const scoringFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Comment le score d'un morceau est-il calculé sur Weekly Music Awards ?", acceptedAnswer: { "@type": "Answer", text: "Le score d'un morceau est la moyenne pondérée de tous les votes valides reçus." } },
    { "@type": "Question", name: "Pourquoi les pondérations varient-elles selon les catégories musicales ?", acceptedAnswer: { "@type": "Answer", text: "Chaque genre musical a des valeurs artistiques propres." } },
    { "@type": "Question", name: "Les abonnements payants influencent-ils le classement ?", acceptedAnswer: { "@type": "Answer", text: "Non, jamais. Le concours est 100% méritocratique." } },
    { "@type": "Question", name: "Comment l'anti-fraude fonctionne-t-il sur les votes ?", acceptedAnswer: { "@type": "Answer", text: "Un système d'intelligence artificielle analyse chaque vote en temps réel." } },
    { "@type": "Question", name: "Que se passe-t-il en cas d'égalité au classement ?", acceptedAnswer: { "@type": "Answer", text: "Le morceau ayant reçu le plus grand nombre de votes valides est classé devant." } },
    { "@type": "Question", name: "Combien de votes faut-il pour être classé ?", acceptedAnswer: { "@type": "Answer", text: "Tout morceau approuvé avec au moins un vote valide est inclus dans le classement." } },
  ],
};

/* ─── Animations ────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

/* ─── Component ─────────────────────────────────────── */

const ScoringMethod = () => {
  const { t } = useTranslation();

  const pageJsonLd = [
    scoringHowToJsonLd,
    scoringFaqJsonLd,
    breadcrumbJsonLd([
      { name: t("scoring.breadcrumbHome"), url: "/" },
      { name: t("scoring.breadcrumbScoring"), url: "/scoring-method" },
    ]),
  ];

  const weightExamples = [
    { genre: t("scoring.wRapGenre"), emotion: 30, originality: 40, production: 30, accent: t("scoring.wRapAccent"), reason: t("scoring.wRapReason") },
    { genre: t("scoring.wLofiGenre"), emotion: 45, originality: 25, production: 30, accent: t("scoring.wLofiAccent"), reason: t("scoring.wLofiReason") },
    { genre: t("scoring.wPopGenre"), emotion: 30, originality: 35, production: 35, accent: t("scoring.wPopAccent"), reason: t("scoring.wPopReason") },
    { genre: t("scoring.wElectroGenre"), emotion: 25, originality: 35, production: 40, accent: t("scoring.wElectroAccent"), reason: t("scoring.wElectroReason") },
    { genre: t("scoring.wRnbGenre"), emotion: 40, originality: 30, production: 30, accent: t("scoring.wRnbAccent"), reason: t("scoring.wRnbReason") },
    { genre: t("scoring.wRockGenre"), emotion: 35, originality: 30, production: 35, accent: t("scoring.wRockAccent"), reason: t("scoring.wRockReason") },
  ];

  const antiFraudMeasures = [
    { icon: Shield, title: t("scoring.afEmailTitle"), desc: t("scoring.afEmailDesc") },
    { icon: Zap, title: t("scoring.afRateTitle"), desc: t("scoring.afRateDesc") },
    { icon: Eye, title: t("scoring.afPatternTitle"), desc: t("scoring.afPatternDesc") },
    { icon: AlertTriangle, title: t("scoring.afInvalidTitle"), desc: t("scoring.afInvalidDesc") },
    { icon: Lock, title: t("scoring.afAuditTitle"), desc: t("scoring.afAuditDesc") },
  ];

  const scoringFaqs = [
    { q: t("scoring.faq1Q"), a: t("scoring.faq1A") },
    { q: t("scoring.faq2Q"), a: t("scoring.faq2A") },
    { q: t("scoring.faq3Q"), a: t("scoring.faq3A") },
    { q: t("scoring.faq4Q"), a: t("scoring.faq4A") },
    { q: t("scoring.faq5Q"), a: t("scoring.faq5A") },
    { q: t("scoring.faq6Q"), a: t("scoring.faq6A") },
  ];

  const criteria = [
    {
      icon: Heart,
      name: t("scoring.emotionName"),
      color: "text-red-500",
      desc: t("scoring.emotionDesc"),
      examples: t("scoring.emotionExamples"),
    },
    {
      icon: Lightbulb,
      name: t("scoring.originalityName"),
      color: "text-yellow-500",
      desc: t("scoring.originalityDesc"),
      examples: t("scoring.originalityExamples"),
    },
    {
      icon: SlidersHorizontal,
      name: t("scoring.productionName"),
      color: "text-blue-500",
      desc: t("scoring.productionDesc"),
      examples: t("scoring.productionExamples"),
    },
  ];

  const s6Items = [
    t("scoring.s6Item1"),
    t("scoring.s6Item2"),
    t("scoring.s6Item3"),
    t("scoring.s6Item4"),
  ];

  return (
    <Layout>
      <SEOHead
        title={t("scoring.seoTitle")}
        description={t("scoring.seoDesc")}
        url="/scoring-method"
        jsonLd={pageJsonLd}
      />
      <article className="container max-w-3xl py-8 sm:py-10 md:py-16 px-4 sm:px-6">
        {/* Breadcrumb nav */}
        <nav aria-label="Breadcrumb">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {t("scoring.home")}
          </Link>
        </nav>

        {/* ── Header ─────────────────────────── */}
        <motion.header {...fadeUp()}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            <Scale className="h-3.5 w-3.5" />
            {t("scoring.badge")}
          </span>
          <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">
            {t("scoring.title")}
          </h1>
          <p
            className="mt-4 text-lg text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t("scoring.intro") }}
          />
        </motion.header>

        <div className="mt-12 space-y-14">
          {/* ── 1. La formule ─────────────────── */}
          <motion.section {...fadeUp(0.1)} aria-labelledby="formule">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h2 id="formule" className="font-display text-xl font-semibold">
                {t("scoring.s1Title")}
              </h2>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <code className="block text-center text-lg font-mono font-semibold text-primary leading-relaxed">
                {t("scoring.formula")}
              </code>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                {t("scoring.formulaNote")}
              </p>
            </div>
            <div className="mt-4 space-y-2 text-muted-foreground">
              <p dangerouslySetInnerHTML={{ __html: t("scoring.s1P1") }} />
              <p dangerouslySetInnerHTML={{ __html: t("scoring.s1P2") }} />
            </div>
          </motion.section>

          {/* ── 2. Les 3 critères ─────────────── */}
          <motion.section {...fadeUp(0.15)} aria-labelledby="criteres">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
              </div>
              <h2 id="criteres" className="font-display text-xl font-semibold">
                {t("scoring.s2Title")}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {criteria.map((c) => (
                <div key={c.name} className="rounded-xl border border-border bg-card p-5 space-y-2">
                  <c.icon className={`h-7 w-7 ${c.color}`} />
                  <h3 className="font-display font-semibold text-lg">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                  <p className="text-xs text-muted-foreground/70 italic">
                    {t("scoring.examples", { examples: c.examples })}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── 3. Pondérations par genre ──────── */}
          <motion.section {...fadeUp(0.2)} aria-labelledby="ponderations">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <h2 id="ponderations" className="font-display text-xl font-semibold">
                {t("scoring.s3Title")}
              </h2>
            </div>
            <p className="text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: t("scoring.s3Desc") }} />
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold">{t("scoring.thGenre")}</th>
                    <th className="px-4 py-3 text-center font-semibold">
                      <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-red-500" /> {t("scoring.thEmotion")}</span>
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      <span className="inline-flex items-center gap-1"><Lightbulb className="h-3.5 w-3.5 text-yellow-500" /> {t("scoring.thOriginality")}</span>
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      <span className="inline-flex items-center gap-1"><SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" /> {t("scoring.thProduction")}</span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">{t("scoring.thAccent")}</th>
                  </tr>
                </thead>
                <tbody>
                  {weightExamples.map((w, i) => (
                    <tr key={w.genre} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                      <td className="px-4 py-3 font-medium">{w.genre}</td>
                      <td className="px-4 py-3 text-center">{w.emotion}%</td>
                      <td className="px-4 py-3 text-center">{w.originality}%</td>
                      <td className="px-4 py-3 text-center">{w.production}%</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{w.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("scoring.s3Note").split("<link>")[0]}
              <Link to="/explore" className="text-primary hover:underline">
                {t("scoring.s3Note").match(/<link>(.*?)<\/link>/)?.[1] || ""}
              </Link>
              {t("scoring.s3Note").split("</link>")[1] || ""}
            </p>
          </motion.section>

          {/* ── 4. Exemple concret ────────────── */}
          <motion.section {...fadeUp(0.25)} aria-labelledby="exemple">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h2 id="exemple" className="font-display text-xl font-semibold">
                {t("scoring.s4Title")}
              </h2>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <p className="text-muted-foreground">
                <strong>{t("scoring.s4Category")}</strong> {t("scoring.s4Weights")}
              </p>
              <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t("scoring.s4VoterGives") }} />
              <div className="rounded-lg bg-muted/50 p-4">
                <code className="text-sm font-mono text-primary">
                  Score = (4 × 0.30 + 5 × 0.40 + 3 × 0.30) ÷ 1.00
                  <br />
                  Score = (1.20 + 2.00 + 0.90) ÷ 1.00
                  <br />
                  Score = <strong>4.10 / 5</strong>
                </code>
              </div>
              <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t("scoring.s4Result") }} />
            </div>
          </motion.section>

          {/* ── 5. Anti-fraude ────────────────── */}
          <motion.section {...fadeUp(0.3)} aria-labelledby="anti-fraude">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h2 id="anti-fraude" className="font-display text-xl font-semibold">
                {t("scoring.s5Title")}
              </h2>
            </div>
            <p className="text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: t("scoring.s5Desc") }} />
            <div className="grid gap-3 sm:grid-cols-2">
              {antiFraudMeasures.map((m) => (
                <div key={m.title} className="rounded-xl border border-border bg-card p-4 flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <m.icon className="h-4.5 w-4.5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{m.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── 6. Équité ────────────────────── */}
          <motion.section {...fadeUp(0.35)} aria-labelledby="equite">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h2 id="equite" className="font-display text-xl font-semibold">
                {t("scoring.s6Title")}
              </h2>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-3 text-muted-foreground">
              <p dangerouslySetInnerHTML={{ __html: t("scoring.s6Principle") }} />
              <ul className="space-y-2">
                {s6Items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium border-t border-border pt-3" dangerouslySetInnerHTML={{ __html: t("scoring.s6Footer") }} />
            </div>
          </motion.section>

          {/* ── 7. FAQ ───────────────────────── */}
          <motion.section {...fadeUp(0.4)} aria-labelledby="faq">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 id="faq" className="font-display text-xl font-semibold">
                {t("scoring.s7Title")}
              </h2>
            </div>
            <div className="space-y-4">
              {scoringFaqs.map((f) => (
                <details key={f.q} className="group rounded-xl border border-border bg-card overflow-hidden">
                  <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium text-sm hover:bg-muted/30 transition-colors">
                    {f.q}
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </motion.section>

          {/* ── CTA ──────────────────────────── */}
          <motion.section {...fadeUp(0.45)} className="rounded-2xl border border-border bg-card p-8 text-center">
            <h2 className="font-display text-xl font-semibold">{t("scoring.ctaTitle")}</h2>
            <p className="mt-2 text-muted-foreground">{t("scoring.ctaDesc")}</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild>
                <Link to="/auth?tab=signup">
                  {t("scoring.ctaJoin")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/explore">{t("scoring.ctaExplore")}</Link>
              </Button>
            </div>
          </motion.section>
        </div>
      </article>
      <Footer />
    </Layout>
  );
};

export default ScoringMethod;
