import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const BASE_URL = "https://weeklymusicawards.com";

export function SEOHead({
  title,
  description,
  url,
  image,
  type = "website",
  jsonLd,
}: SEOHeadProps) {
  const { t } = useTranslation();
  const defaultTitle = t("seo.defaultTitle");
  const defaultDescription = t("seo.defaultDescription");
  const resolvedDescription = description || defaultDescription;
  const fullTitle = title ? `${title} | Weekly Music Awards` : defaultTitle;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd, null, 0)}
        </script>
      )}
    </Helmet>
  );
}

// ─── Reusable JSON-LD schemas ───────────────────────────────

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Weekly Music Awards",
  alternateName: "WMA",
  url: BASE_URL,
  description: "Le seul concours musical hebdomadaire 100% communautaire et méritocratique. Les artistes indépendants soumettent leur musique, la communauté vote sur 3 critères, et les gagnants remportent jusqu'à 200€ par semaine.",
  foundingDate: "2025",
  founder: {
    "@type": "Organization",
    name: "EMOTIONSCARE SASU",
    taxID: "944505445",
  },
  areaServed: { "@type": "Country", name: "France" },
  knowsAbout: [
    "Concours musical en ligne",
    "Découverte d'artistes indépendants",
    "Vote communautaire musical",
    "Gamification musicale",
    "Anti-fraude IA pour vote en ligne",
  ],
  sameAs: [],
};

export const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Weekly Music Awards",
  url: BASE_URL,
  description: "Concours musical hebdomadaire communautaire avec 12 catégories, votes sur 3 critères et récompenses chaque semaine.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/explore?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

// ─── FAQ JSON-LD builder ──────────────────────────────────

export function faqJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

// ─── HowTo JSON-LD ──────────────────────────────────────

export const howItWorksJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment participer à Weekly Music Awards",
  description: "Guide étape par étape pour participer au concours musical hebdomadaire Weekly Music Awards : inscription, soumission, vote et récompenses.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Créez votre compte gratuit",
      text: "Inscrivez-vous gratuitement sur Weekly Music Awards en 30 secondes. Aucune carte bancaire requise pour voter.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Soumettez votre musique",
      text: "Uploadez un extrait audio (30-60 secondes) avec une image de couverture dans l'une des 12 catégories musicales. Abonnement Pro requis pour soumettre.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "La communauté écoute et vote",
      text: "Les membres écoutent les morceaux et votent sur 3 critères : originalité, production et émotion. Chaque critère est noté de 1 à 5 étoiles.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Montez sur le podium",
      text: "À la fin de chaque semaine, les 3 premiers de chaque catégorie montent sur le podium et se partagent la cagnotte : 🥇 200€, 🥈 100€, 🥉 50€.",
    },
  ],
};

// ─── BreadcrumbList builder ──────────────────────────────

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

// Combined schemas for the homepage
export const homePageJsonLd = [
  organizationJsonLd,
  webSiteJsonLd,
  howItWorksJsonLd,
  faqJsonLd([
    { q: "C'est vraiment gratuit ?", a: "Le vote et l'écoute sont 100% gratuits pour tous les membres. Pour soumettre un morceau au concours, un abonnement Pro (à partir de 9,99 €/mois) est nécessaire. Aucun paiement n'influence le classement." },
    { q: "Qui peut participer ?", a: "Tout artiste ou groupe musical peut s'inscrire. Il suffit de posséder les droits sur le morceau soumis et de respecter le règlement du concours." },
    { q: "Comment les notes sont-elles calculées ?", a: "Chaque vote évalue trois critères : originalité, production et émotion. La moyenne pondérée des trois donne le score final. Un système anti-fraude IA garantit l'intégrité de chaque vote." },
    { q: "Quelles sont les récompenses ?", a: "Chaque semaine, une cagnotte sponsorisée récompense les 3 premiers du podium : 200€ pour le 1er, 100€ pour le 2e et 50€ pour le 3e. Les récompenses sont financées par les sponsors, jamais par les participants." },
    { q: "Comment fonctionne l'anti-fraude ?", a: "Une intelligence artificielle analyse chaque vote en temps réel : détection de comptes suspects, rafales de votes, comportements anormaux. Les votes frauduleux sont automatiquement invalidés." },
    { q: "Puis-je soumettre plusieurs morceaux ?", a: "Vous pouvez soumettre un morceau par semaine et par catégorie, garantissant une compétition équitable pour tous les artistes." },
  ]),
];

export function eventJsonLd(week: { title?: string | null; voting_open_at: string; voting_close_at: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: week.title || "Weekly Music Awards — Compétition Hebdomadaire",
    description: "Concours musical hebdomadaire communautaire. Écoutez les morceaux soumis par des artistes indépendants et votez sur 3 critères : originalité, production, émotion.",
    startDate: week.voting_open_at,
    endDate: week.voting_close_at,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    organizer: {
      "@type": "Organization",
      name: "Weekly Music Awards",
      url: BASE_URL,
    },
    location: {
      "@type": "VirtualLocation",
      url: `${BASE_URL}/vote`,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      description: "Vote gratuit pour tous les membres",
    },
  };
}

export function musicGroupJsonLd(artist: { name: string; id: string; image?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: artist.name,
    url: `${BASE_URL}/artist/${artist.id}`,
    ...(artist.image ? { image: artist.image } : {}),
  };
}

export function categoryJsonLd(category: { name: string; slug: string; description?: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} — Weekly Music Awards`,
    url: `${BASE_URL}/categories/${category.slug}`,
    description: category.description || `Découvrez les morceaux ${category.name} en compétition sur Weekly Music Awards.`,
    isPartOf: {
      "@type": "WebSite",
      name: "Weekly Music Awards",
      url: BASE_URL,
    },
  };
}
