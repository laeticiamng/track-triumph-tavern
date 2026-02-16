import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";

const Privacy = () => (
  <Layout>
    <SEOHead title="Politique de confidentialité" description="Politique de confidentialité et protection des données personnelles de Weekly Music Awards." url="/privacy" />
    <div className="container max-w-3xl py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Politique de Confidentialité</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p><em>Dernière mise à jour : Février 2026</em></p>

        <h2 className="text-foreground font-display">1. Données collectées</h2>
        <p>Nous collectons les données suivantes : adresse email, nom d'artiste, contenu musical soumis, votes, et données de navigation (cookies). Nous ne collectons jamais de données de paiement directement — celles-ci sont traitées par notre prestataire Stripe.</p>

        <h2 className="text-foreground font-display">2. Finalité du traitement</h2>
        <p>Vos données sont utilisées pour : gérer votre compte, organiser le concours, afficher les résultats, prévenir la fraude, et améliorer le service.</p>

        <h2 className="text-foreground font-display">3. Base légale (RGPD)</h2>
        <p>Le traitement est fondé sur votre consentement (inscription), l'exécution du contrat (participation au concours) et notre intérêt légitime (prévention de la fraude).</p>

        <h2 className="text-foreground font-display">4. Durée de conservation</h2>
        <p>Vos données sont conservées pendant la durée de votre compte actif, plus 3 ans après suppression pour les obligations légales.</p>

        <h2 className="text-foreground font-display">5. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression, de portabilité et d'opposition. Contactez-nous à contact@emotionscare.com.</p>

        <h2 className="text-foreground font-display">6. Cookies</h2>
        <p>Nous utilisons des cookies essentiels pour le fonctionnement du site. Voir notre Politique Cookies pour plus de détails.</p>

        <h2 className="text-foreground font-display">7. Sécurité</h2>
        <p>Vos données sont protégées par chiffrement en transit et au repos. L'accès est restreint au personnel autorisé.</p>

        <h2 className="text-foreground font-display">8. Sous-traitants</h2>
        <p>Dans le cadre de nos services, nous faisons appel aux sous-traitants suivants :</p>
        <ul>
          <li><strong>Supabase</strong> — hébergement et base de données. Les données sont stockées sur des serveurs sécurisés conformes au RGPD.</li>
          <li><strong>Stripe</strong> — traitement des paiements. Stripe agit en tant que sous-traitant pour la gestion sécurisée des transactions financières. Aucune donnée bancaire n'est stockée sur nos serveurs.</li>
          <li><strong>Vercel</strong> — hébergement front-end. Vercel assure la diffusion et l'hébergement de l'interface utilisateur du site.</li>
        </ul>
        <p>Chaque sous-traitant est lié par un accord de traitement des données (DPA) garantissant un niveau de protection conforme au RGPD.</p>

        <h2 className="text-foreground font-display">9. Notification de violation</h2>
        <p>Conformément à l'article 33 du RGPD, en cas de violation de données à caractère personnel susceptible d'engendrer un risque pour vos droits et libertés, nous nous engageons à notifier l'autorité de contrôle compétente (CNIL) dans un délai de 72 heures après en avoir pris connaissance. Si la violation est susceptible d'engendrer un risque élevé pour vos droits et libertés, vous en serez également informé(e) dans les meilleurs délais, conformément à l'article 34 du RGPD.</p>

        <h2 className="text-foreground font-display">10. Horodatage du consentement cookies</h2>
        <p>Lorsque vous acceptez ou refusez les cookies via notre bandeau de consentement, nous enregistrons un horodatage (date et heure) de votre choix. Cet horodatage constitue la preuve de votre consentement conformément aux exigences de la CNIL et du RGPD. Il est conservé pendant une durée de 13 mois, au terme de laquelle votre consentement vous sera de nouveau demandé. Vous pouvez modifier vos préférences à tout moment via le lien « Gérer mes cookies » disponible en pied de page.</p>

        <p className="text-sm font-medium text-foreground">Éditeur : EMOTIONSCARE SASU — SIREN 944 505 445 — contact@emotionscare.com</p>
      </div>
    </div>
    <Footer />
  </Layout>
);

export default Privacy;
