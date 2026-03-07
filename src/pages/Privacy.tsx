import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslation } from "react-i18next";

const Privacy = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <SEOHead title={t("legal.privacyTitle")} description={t("legal.privacySeoDesc")} url="/privacy" />
      <div className="container max-w-3xl py-12">
        <h1 className="font-display text-3xl font-bold mb-8">{t("legal.privacyTitle")}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p><em>{t("legal.lastUpdated")}</em></p>

          <h2 className="text-foreground font-display">1. Données collectées</h2>
          <p>Nous collectons les données suivantes : adresse email, nom d'artiste, contenu musical soumis, votes, et données de navigation (cookies). Nous ne collectons jamais de données de paiement directement — celles-ci sont traitées par notre prestataire Stripe.</p>

          <h2 className="text-foreground font-display">2. Finalité du traitement</h2>
          <p>Vos données sont utilisées pour : gérer votre compte, organiser le concours, afficher les résultats, prévenir la fraude, et améliorer le service.</p>

          <h2 className="text-foreground font-display">3. Base légale (RGPD)</h2>
          <p>Le traitement est fondé sur votre consentement (inscription), l'exécution du contrat (participation au concours) et notre intérêt légitime (prévention de la fraude).</p>

          <h2 className="text-foreground font-display">4. Durée de conservation</h2>
          <p>Vos données sont conservées pendant la durée de votre compte actif, plus 3 ans après suppression pour les obligations légales.</p>

          <h2 className="text-foreground font-display">5. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression, de portabilité et d'opposition. Contactez-nous à contact@emotionscare.com.</p>.</p>

          <h2 className="text-foreground font-display">6. Cookies</h2>
          <p>Nous utilisons des cookies essentiels pour le fonctionnement du site. Voir notre Politique Cookies pour plus de détails.</p>

          <h2 className="text-foreground font-display">7. Sécurité</h2>
          <p>Vos données sont protégées par chiffrement en transit et au repos. L'accès est restreint au personnel autorisé.</p>

          <h2 className="text-foreground font-display">8. Sous-traitants</h2>
          <p>Dans le cadre de nos services, nous faisons appel aux sous-traitants suivants :</p>
          <ul>
            <li><strong>Supabase</strong> — hébergement et base de données.</li>
            <li><strong>Stripe</strong> — traitement des paiements.</li>
            <li><strong>Vercel</strong> — hébergement front-end.</li>
          </ul>
          <p>Chaque sous-traitant est lié par un accord de traitement des données (DPA) garantissant un niveau de protection conforme au RGPD.</p>

          <h2 className="text-foreground font-display">9. Notification de violation</h2>
          <p>Conformément à l'article 33 du RGPD, en cas de violation de données à caractère personnel susceptible d'engendrer un risque pour vos droits et libertés, nous nous engageons à notifier l'autorité de contrôle compétente (CNIL) dans un délai de 72 heures.</p>

          <h2 className="text-foreground font-display">10. Horodatage du consentement cookies</h2>
          <p>Lorsque vous acceptez ou refusez les cookies via notre bandeau de consentement, nous enregistrons un horodatage de votre choix, conservé pendant 13 mois conformément aux exigences de la CNIL et du RGPD.</p>

          <p className="text-sm font-medium text-foreground">{t("legal.editor")}</p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default Privacy;
