import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslation } from "react-i18next";

const MentionsLegales = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <SEOHead title={t("legal.mentionsTitle")} description={t("legal.mentionsSeoDesc")} url="/legal/mentions" />
      <div className="container max-w-3xl py-12">
        <h1 className="font-display text-3xl font-bold mb-8">{t("legal.mentionsTitle")}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p><em>{t("legal.lastUpdated")}</em></p>

          <h2 className="text-foreground font-display">1. Éditeur du site</h2>
          <ul className="list-none space-y-1 pl-0">
            <li><strong>Raison sociale :</strong> EMOTIONSCARE SASU</li>
            <li><strong>SIREN :</strong> 944 505 445</li>
            <li><strong>E-mail :</strong> <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a></li>
            <li><strong>DPO :</strong> <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a></li>
          </ul>

          <h2 className="text-foreground font-display">2. Hébergement</h2>
          <ul className="list-none space-y-1 pl-0">
            <li><strong>Hébergeur :</strong> Lovable / Netlify</li>
            <li><strong>Backend :</strong> Supabase Inc.</li>
            <li><strong>Paiements :</strong> Stripe Payments Europe, Ltd.</li>
          </ul>

          <h2 className="text-foreground font-display">3. Propriété intellectuelle</h2>
          <p>L'ensemble des contenus est protégé par les lois relatives à la propriété intellectuelle. Les morceaux soumis restent la propriété de leurs auteurs.</p>

          <h2 className="text-foreground font-display">4. Données personnelles</h2>
          <p>Voir notre <Link to="/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>.</p>

          <h2 className="text-foreground font-display">5. Cookies</h2>
          <p>Voir notre <Link to="/cookies" className="text-primary hover:underline">Politique de cookies</Link>.</p>

          <h2 className="text-foreground font-display">6. Limitation de responsabilité</h2>
          <p>EMOTIONSCARE SASU s'efforce de fournir des informations exactes et à jour.</p>

          <h2 className="text-foreground font-display">7. Droit applicable</h2>
          <p>Droit français. Tribunaux français compétents.</p>

          <p className="text-sm font-medium text-foreground">{t("legal.editor")}</p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default MentionsLegales;
