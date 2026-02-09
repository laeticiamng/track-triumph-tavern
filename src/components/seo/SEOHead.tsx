import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const BASE_URL = "https://weeklymusicawards.com";
const DEFAULT_TITLE = "Weekly Music Awards — Concours Musical Hebdomadaire";
const DEFAULT_DESCRIPTION =
  "Soumettez votre musique, recevez des votes de la communaute et montez sur le podium. Participation 100% gratuite chaque semaine.";

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  url,
  image,
  type = "website",
  jsonLd,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | Weekly Music Awards` : DEFAULT_TITLE;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(
            Array.isArray(jsonLd) ? jsonLd : jsonLd,
            null,
            0
          )}
        </script>
      )}
    </Helmet>
  );
}

// Reusable JSON-LD schemas
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Weekly Music Awards",
  url: BASE_URL,
  description: DEFAULT_DESCRIPTION,
  sameAs: [],
};

export function eventJsonLd(week: { title?: string | null; voting_open_at: string; voting_close_at: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: week.title || "Weekly Music Awards — Competition Hebdomadaire",
    startDate: week.voting_open_at,
    endDate: week.voting_close_at,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    organizer: {
      "@type": "Organization",
      name: "Weekly Music Awards",
      url: BASE_URL,
    },
    location: {
      "@type": "VirtualLocation",
      url: `${BASE_URL}/vote`,
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
