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

/* ─── JSON-LD schemas for GEO ──────────────────────────── */

const scoringHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment fonctionne la notation sur Weekly Music Awards",
  description:
    "Guide complet du système de notation du concours musical Weekly Music Awards : 3 critères (émotion, originalité, production), pondération par genre, calcul du score moyen pondéré et mesures anti-fraude IA.",
  totalTime: "PT2M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Écouter l'extrait musical",
      text: "L'auditeur écoute l'extrait audio de 30 à 60 secondes soumis par l'artiste dans l'une des 12 catégories musicales.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Évaluer les 3 critères",
      text: "Le votant attribue une note de 1 à 5 étoiles sur trois critères indépendants : Émotion (capacité à toucher l'auditeur), Originalité (créativité et singularité) et Production (qualité du mixage et mastering).",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Application de la pondération",
      text: "Les trois notes sont pondérées selon les coefficients spécifiques à chaque catégorie musicale. Par exemple, le Rap/Trap accorde 40% à l'Originalité tandis que le Lofi accorde 45% à l'Émotion.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Calcul du score moyen pondéré",
      text: "Le score final d'un morceau est la moyenne pondérée de tous les votes valides reçus pendant la semaine. Le classement est établi du score le plus élevé au plus bas dans chaque catégorie.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Validation anti-fraude IA",
      text: "Chaque vote passe par un système anti-fraude à intelligence artificielle qui détecte les rafales de votes, les clusters d'IP, les comptes suspects et les comportements de bots. Les votes frauduleux sont automatiquement invalidés.",
    },
  ],
};

const scoringFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Comment le score d'un morceau est-il calculé sur Weekly Music Awards ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le score d'un morceau est la moyenne pondérée de tous les votes valides reçus. Chaque vote évalue trois critères sur 5 étoiles : Émotion, Originalité et Production. Les notes sont pondérées selon les coefficients de la catégorie musicale (ex : 40% Originalité pour le Rap). Le classement est déterminé du score le plus élevé au plus bas.",
      },
    },
    {
      "@type": "Question",
      name: "Pourquoi les pondérations varient-elles selon les catégories musicales ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Chaque genre musical a des valeurs artistiques propres. Le Rap valorise l'originalité (40%) car l'innovation lyrique et sonore est centrale. Le Lofi met l'émotion en avant (45%) car l'atmosphère est l'essence du genre. La Pop accorde plus de poids à la production (35%) car le polissage sonore est un standard du genre.",
      },
    },
    {
      "@type": "Question",
      name: "Les abonnements payants influencent-ils le classement ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non, jamais. Les abonnements Pro et Elite offrent uniquement des services SaaS (analytics avancés, feedback IA, kit marketing). Aucun paiement ne peut modifier les votes, le score ou le classement. Le concours est 100% méritocratique.",
      },
    },
    {
      "@type": "Question",
      name: "Comment l'anti-fraude fonctionne-t-il sur les votes ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Un système d'intelligence artificielle analyse chaque vote en temps réel : détection de rafales de votes, clusters d'adresses IP, comptes nouvellement créés votant massivement, et comportements de bots. Les votes suspects sont automatiquement marqués comme invalides (is_valid = false) et exclus du calcul du classement. Chaque vote dispose d'un audit trail complet.",
      },
    },
    {
      "@type": "Question",
      name: "Que se passe-t-il en cas d'égalité au classement ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En cas d'égalité parfaite du score moyen pondéré, le morceau ayant reçu le plus grand nombre de votes valides est classé devant. Cela récompense l'engagement de la communauté tout en maintenant la qualité comme critère principal.",
      },
    },
    {
      "@type": "Question",
      name: "Combien de votes faut-il pour être classé ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tout morceau approuvé avec au moins un vote valide est inclus dans le classement. Cependant, un plus grand nombre de votes tend à stabiliser le score moyen, offrant un classement plus représentatif de la qualité perçue par la communauté.",
      },
    },
  ],
};

const pageJsonLd = [
  scoringHowToJsonLd,
  scoringFaqJsonLd,
  breadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Méthode de notation", url: "/scoring-method" },
  ]),
];

/* ─── Pondération examples ──────────────────────────── */

const weightExamples = [
  { genre: "Rap / Trap", emotion: 30, originality: 40, production: 30, accent: "Originalité", reason: "L'innovation lyrique et les flows uniques sont au cœur du genre." },
  { genre: "Lofi / Chill", emotion: 45, originality: 25, production: 30, accent: "Émotion", reason: "L'atmosphère et la capacité à créer un espace émotionnel priment." },
  { genre: "Pop", emotion: 30, originality: 35, production: 35, accent: "Production", reason: "Le polissage sonore et les arrangements sont des standards incontournables." },
  { genre: "Électro / EDM", emotion: 25, originality: 35, production: 40, accent: "Production", reason: "La qualité du sound design et du mastering est déterminante." },
  { genre: "R&B / Soul", emotion: 40, originality: 30, production: 30, accent: "Émotion", reason: "L'interprétation vocale et la profondeur émotionnelle sont essentielles." },
  { genre: "Rock / Métal", emotion: 35, originality: 30, production: 35, accent: "Émotion", reason: "L'énergie brute et l'authenticité de la performance comptent autant que la prod." },
];

const antiFraudMeasures = [
  { icon: Shield, title: "Vérification e-mail", desc: "Chaque votant doit confirmer son adresse e-mail avant de pouvoir voter. Pas de comptes jetables." },
  { icon: Zap, title: "Rate limiting strict", desc: "Maximum 5 votes par minute et par utilisateur. Prévient les rafales automatisées." },
  { icon: Eye, title: "Détection de patterns", desc: "L'IA analyse les comportements en temps réel : clusters d'IP, votes séquentiels, timing suspect, user-agents répétitifs." },
  { icon: AlertTriangle, title: "Invalidation automatique", desc: "Les votes détectés comme frauduleux sont marqués is_valid = false et exclus du calcul, sans pénaliser l'artiste." },
  { icon: Lock, title: "Audit trail complet", desc: "Chaque vote est enregistré avec horodatage, adresse IP, user-agent et métadonnées pour traçabilité complète." },
];

const scoringFaqs = [
  { q: "Comment le score d'un morceau est-il calculé ?", a: "Le score est la moyenne pondérée de tous les votes valides. Chaque vote évalue 3 critères sur 5 étoiles : Émotion, Originalité et Production. Les notes sont multipliées par les coefficients de la catégorie, puis divisées par la somme des poids." },
  { q: "Pourquoi les pondérations varient selon les genres ?", a: "Chaque genre musical a ses propres valeurs artistiques. Le Rap valorise l'originalité car l'innovation est centrale. Le Lofi met l'émotion en avant car l'atmosphère est l'essence du genre. Les pondérations sont définies par notre équipe éditoriale en concertation avec la communauté." },
  { q: "Les abonnements payants influencent-ils le classement ?", a: "Jamais. Les abonnements Pro et Elite offrent des services SaaS (analytics, feedback IA, kit marketing) mais n'influencent en aucun cas les votes, le score ou le classement. Le concours est 100% méritocratique." },
  { q: "Comment l'anti-fraude fonctionne-t-il ?", a: "Une IA analyse chaque vote en temps réel : détection de rafales, clusters d'IP, comptes suspects, comportements de bots. Les votes frauduleux sont automatiquement invalidés et exclus du classement. Chaque vote a un audit trail complet." },
  { q: "Que se passe-t-il en cas d'égalité ?", a: "En cas d'égalité parfaite du score moyen pondéré, le morceau ayant reçu le plus grand nombre de votes valides est classé devant, récompensant l'engagement communautaire." },
  { q: "Combien de votes faut-il pour être classé ?", a: "Tout morceau approuvé avec au moins un vote valide est inclus dans le classement. Un plus grand nombre de votes stabilise le score moyen et le rend plus représentatif." },
];

/* ─── Animations ────────────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

/* ─── Component ─────────────────────────────────────── */

const ScoringMethod = () => (
  <Layout>
    <SEOHead
      title="Méthode de notation — Comment le classement est calculé"
      description="Découvrez en détail comment le classement de Weekly Music Awards est calculé : 3 critères de notation (émotion, originalité, production), pondération spécifique par genre musical, système anti-fraude IA et transparence totale. Aucun paiement n'influence les résultats."
      url="/scoring-method"
      jsonLd={pageJsonLd}
    />
    <article className="container max-w-3xl py-10 md:py-16">
      {/* Breadcrumb nav */}
      <nav aria-label="Breadcrumb">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Accueil
        </Link>
      </nav>

      {/* ── Header ─────────────────────────── */}
      <motion.header {...fadeUp()}>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
          <Scale className="h-3.5 w-3.5" />
          Transparence totale
        </span>
        <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">
          Comment le classement est calculé
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          Weekly Music Awards est{" "}
          <strong>le seul concours musical où le classement est 100 % méritocratique</strong>.
          Chaque morceau est évalué par la communauté sur trois critères objectifs, pondérés
          spécifiquement pour chaque genre musical. Aucun paiement, aucun jury, aucun hasard
          n'influence les résultats. Voici exactement comment ça fonctionne.
        </p>
      </motion.header>

      <div className="mt-12 space-y-14">
        {/* ── 1. La formule ─────────────────── */}
        <motion.section {...fadeUp(0.1)} aria-labelledby="formule">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h2 id="formule" className="font-display text-xl font-semibold">
              1. La formule de score
            </h2>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <code className="block text-center text-lg font-mono font-semibold text-primary leading-relaxed">
              Score = (Émotion × P₁ + Originalité × P₂ + Production × P₃) ÷ (P₁ + P₂ + P₃)
            </code>
            <p className="mt-4 text-sm text-muted-foreground text-center">
              P₁, P₂, P₃ = coefficients de pondération propres à chaque catégorie musicale
            </p>
          </div>
          <div className="mt-4 space-y-2 text-muted-foreground">
            <p>
              Chaque vote attribue une note de <strong>1 à 5 étoiles</strong> sur trois critères
              indépendants. Les trois notes sont ensuite multipliées par les coefficients de
              pondération de la catégorie, puis divisées par la somme des poids pour obtenir un
              score normalisé sur 5.
            </p>
            <p>
              Le <strong>score final d'un morceau</strong> est la moyenne de tous les scores
              individuels des votes valides reçus pendant la semaine. Le classement est établi du
              score le plus élevé au plus bas, par catégorie.
            </p>
          </div>
        </motion.section>

        {/* ── 2. Les 3 critères ─────────────── */}
        <motion.section {...fadeUp(0.15)} aria-labelledby="criteres">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
            </div>
            <h2 id="criteres" className="font-display text-xl font-semibold">
              2. Les 3 critères de notation
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Heart,
                name: "Émotion",
                color: "text-red-500",
                desc: "Capacité du morceau à toucher, émouvoir ou transporter l'auditeur. La connexion émotionnelle est-elle authentique et puissante ?",
                examples: "Frissons, nostalgie, euphorie, mélancolie, énergie",
              },
              {
                icon: Lightbulb,
                name: "Originalité",
                color: "text-yellow-500",
                desc: "Créativité, innovation et singularité artistique. Le morceau apporte-t-il quelque chose de nouveau ou de surprenant au genre ?",
                examples: "Flows inédits, arrangements atypiques, fusion de genres",
              },
              {
                icon: SlidersHorizontal,
                name: "Production",
                color: "text-blue-500",
                desc: "Qualité technique du mixage, mastering, arrangement et sound design. Le son est-il professionnel et bien équilibré ?",
                examples: "Clarté du mix, dynamique, spatialisation, texture sonore",
              },
            ].map((c) => (
              <div
                key={c.name}
                className="rounded-xl border border-border bg-card p-5 space-y-2"
              >
                <c.icon className={`h-7 w-7 ${c.color}`} />
                <h3 className="font-display font-semibold text-lg">{c.name}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
                <p className="text-xs text-muted-foreground/70 italic">
                  Exemples : {c.examples}
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
              3. Pondérations par genre musical
            </h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Chaque catégorie possède ses propres coefficients de pondération, calibrés pour refléter
            les <strong>valeurs artistiques essentielles</strong> du genre. Si aucun poids n'est
            défini, le système applique une répartition égale (33/34/33).
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold">Genre</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-red-500" /> Émotion</span>
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    <span className="inline-flex items-center gap-1"><Lightbulb className="h-3.5 w-3.5 text-yellow-500" /> Originalité</span>
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    <span className="inline-flex items-center gap-1"><SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" /> Production</span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Accent</th>
                </tr>
              </thead>
              <tbody>
                {weightExamples.map((w, i) => (
                  <tr
                    key={w.genre}
                    className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}
                  >
                    <td className="px-4 py-3 font-medium">{w.genre}</td>
                    <td className="px-4 py-3 text-center">{w.emotion}%</td>
                    <td className="px-4 py-3 text-center">{w.originality}%</td>
                    <td className="px-4 py-3 text-center">{w.production}%</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                      {w.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Consultez la page de chaque{" "}
            <Link to="/explore" className="text-primary hover:underline">
              catégorie
            </Link>{" "}
            pour voir ses poids spécifiques et son contexte artistique.
          </p>
        </motion.section>

        {/* ── 4. Exemple concret ────────────── */}
        <motion.section {...fadeUp(0.25)} aria-labelledby="exemple">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h2 id="exemple" className="font-display text-xl font-semibold">
              4. Exemple concret
            </h2>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <p className="text-muted-foreground">
              <strong>Catégorie : Rap / Trap</strong> (Émotion 30%, Originalité 40%, Production 30%)
            </p>
            <p className="text-muted-foreground">
              Un votant donne : Émotion <strong>4/5</strong>, Originalité <strong>5/5</strong>,
              Production <strong>3/5</strong>.
            </p>
            <div className="rounded-lg bg-muted/50 p-4">
              <code className="text-sm font-mono text-primary">
                Score = (4 × 0.30 + 5 × 0.40 + 3 × 0.30) ÷ 1.00
                <br />
                Score = (1.20 + 2.00 + 0.90) ÷ 1.00
                <br />
                Score = <strong>4.10 / 5</strong>
              </code>
            </div>
            <p className="text-sm text-muted-foreground">
              Le score final du morceau sera la <strong>moyenne de tous les scores individuels</strong>{" "}
              de ce type. Avec 50 votes valides, le score moyen reflète fidèlement la perception de
              la communauté.
            </p>
          </div>
        </motion.section>

        {/* ── 5. Anti-fraude ────────────────── */}
        <motion.section {...fadeUp(0.3)} aria-labelledby="anti-fraude">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h2 id="anti-fraude" className="font-display text-xl font-semibold">
              5. Système anti-fraude par intelligence artificielle
            </h2>
          </div>
          <p className="text-muted-foreground mb-4">
            L'intégrité du concours repose sur un système multicouche d'anti-fraude qui
            analyse <strong>chaque vote en temps réel</strong>. Aucun vote frauduleux ne peut
            influencer le classement.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {antiFraudMeasures.map((m) => (
              <div
                key={m.title}
                className="rounded-xl border border-border bg-card p-4 flex gap-3"
              >
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
              6. Équité & indépendance des abonnements
            </h2>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-3 text-muted-foreground">
            <p>
              <strong>Principe fondamental :</strong> aucun paiement ne peut influencer le classement.
              Les abonnements Pro et Elite offrent exclusivement des services SaaS :
            </p>
            <ul className="space-y-2">
              {[
                "Analytics avancés sur les performances de vos morceaux",
                "Feedback IA personnalisé sur votre production musicale",
                "Kit marketing et partage social amélioré",
                "Soumission prioritaire (file d'attente, pas de boost au classement)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm font-medium border-t border-border pt-3">
              Le vote est <strong>100 % gratuit</strong>. L'écoute est{" "}
              <strong>100 % gratuite</strong>. Le classement est{" "}
              <strong>100 % méritocratique</strong>.
            </p>
          </div>
        </motion.section>

        {/* ── 7. FAQ ───────────────────────── */}
        <motion.section {...fadeUp(0.4)} aria-labelledby="faq">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <h2 id="faq" className="font-display text-xl font-semibold">
              7. Questions fréquentes sur la notation
            </h2>
          </div>
          <div className="space-y-4">
            {scoringFaqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border bg-card overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium text-sm hover:bg-muted/30 transition-colors">
                  {f.q}
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ──────────────────────────── */}
        <motion.section
          {...fadeUp(0.45)}
          className="rounded-2xl border border-border bg-card p-8 text-center"
        >
          <h2 className="font-display text-xl font-semibold">
            Convaincu par notre transparence ?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Rejoignez le concours et faites entendre votre musique à une communauté de passionnés.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <Link to="/auth?tab=signup">
                Rejoindre le concours
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/explore">Explorer les morceaux</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </article>
    <Footer />
  </Layout>
);

export default ScoringMethod;
