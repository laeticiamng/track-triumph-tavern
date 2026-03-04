import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslation } from "react-i18next";

const Cookies = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <SEOHead title={t("legal.cookiesTitle")} description={t("legal.cookiesSeoDesc")} url="/cookies" />
      <div className="container max-w-3xl py-12">
        <h1 className="font-display text-3xl font-bold mb-8">{t("legal.cookiesTitle")}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p><em>{t("legal.lastUpdated")}</em></p>

          <h2 className="text-foreground font-display">1. Qu'est-ce qu'un cookie ?</h2>
          <p>Un cookie est un petit fichier texte stocké sur votre appareil lors de la visite d'un site web.</p>

          <h2 className="text-foreground font-display">2. Cookies utilisés</h2>
          <ul>
            <li><strong>Cookies essentiels :</strong> authentification, session.</li>
            <li><strong>Cookies analytiques :</strong> mesure d'audience anonyme.</li>
          </ul>

          <h2 className="text-foreground font-display">3. Gestion des cookies</h2>
          <p>Vous pouvez configurer votre navigateur pour refuser les cookies. Voir notre <Link to="/privacy" className="text-primary hover:underline">Politique de Confidentialité</Link>.</p>

          <h2 className="text-foreground font-display">4. Durée</h2>
          <p>Les cookies de session sont supprimés à la fermeture du navigateur. Les cookies persistants ont une durée maximale de 13 mois.</p>

          <h2 className="text-foreground font-display">5. Cookies marketing</h2>
          <p>Ces cookies ne sont déposés qu'avec votre consentement explicite.</p>

          <h2 className="text-foreground font-display">6. Cookies tiers</h2>
          <p>Stripe (paiements) et notre solution d'analytics utilisent des cookies. Consultez leurs politiques respectives.</p>

          <h2 className="text-foreground font-display">7. Retrait du consentement</h2>
          <p>Modifiez vos préférences via le lien « Gérer mes cookies » en pied de page.</p>

          <p className="text-sm font-medium text-foreground">{t("legal.editor")}</p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default Cookies;
