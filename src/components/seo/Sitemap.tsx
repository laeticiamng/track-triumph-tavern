import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://weeklymusicawards.com";

const staticRoutes = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/explore", priority: 0.9, changefreq: "daily" },
  { path: "/vote", priority: 0.9, changefreq: "daily" },
  { path: "/compete", priority: 0.8, changefreq: "weekly" },
  { path: "/results", priority: 0.8, changefreq: "weekly" },
  { path: "/stats", priority: 0.7, changefreq: "daily" },
  { path: "/pricing", priority: 0.7, changefreq: "monthly" },
  { path: "/hall-of-fame", priority: 0.6, changefreq: "weekly" },
  { path: "/about", priority: 0.5, changefreq: "monthly" },
  { path: "/contest-rules", priority: 0.4, changefreq: "monthly" },
  { path: "/scoring-method", priority: 0.4, changefreq: "monthly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/cookies", priority: 0.3, changefreq: "yearly" },
];

/**
 * Component that generates sitemap XML and sets it as downloadable.
 * Renders the sitemap as preformatted text for search engines.
 */
const Sitemap = () => {
  const [xml, setXml] = useState("");

  useEffect(() => {
    const generate = async () => {
      // Fetch dynamic routes
      const [{ data: categories }, { data: submissions }] = await Promise.all([
        supabase.from("categories").select("slug, created_at"),
        supabase
          .from("submissions")
          .select("id, updated_at")
          .eq("status", "approved")
          .order("updated_at", { ascending: false })
          .limit(100),
      ]);

      const today = new Date().toISOString().split("T")[0];
      let urls = staticRoutes.map(
        (r) =>
          `  <url>
    <loc>${BASE_URL}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
      );

      // Category pages
      categories?.forEach((cat) => {
        urls.push(
          `  <url>
    <loc>${BASE_URL}/categories/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
        );
      });

      // Submission pages
      submissions?.forEach((sub) => {
        urls.push(
          `  <url>
    <loc>${BASE_URL}/submissions/${sub.id}</loc>
    <lastmod>${new Date(sub.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`
        );
      });

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

      setXml(sitemapXml);
    };

    generate();
  }, []);

  return (
    <pre
      style={{
        fontFamily: "monospace",
        fontSize: "12px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        padding: "16px",
        background: "#000",
        color: "#ccc",
        minHeight: "100vh",
      }}
    >
      {xml || "Generating sitemap..."}
    </pre>
  );
};

export default Sitemap;
