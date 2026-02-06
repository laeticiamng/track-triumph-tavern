import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";

const Privacy = () => (
  <Layout>
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
        <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression, de portabilité et d'opposition. Contactez-nous à privacy@weeklymusicawards.com.</p>

        <h2 className="text-foreground font-display">6. Cookies</h2>
        <p>Nous utilisons des cookies essentiels pour le fonctionnement du site. Voir notre Politique Cookies pour plus de détails.</p>

        <h2 className="text-foreground font-display">7. Sécurité</h2>
        <p>Vos données sont protégées par chiffrement en transit et au repos. L'accès est restreint au personnel autorisé.</p>

        <p className="text-xs italic">Ce document est un modèle MVP conforme RGPD. Il est recommandé de le faire relire par un DPO ou juriste avant mise en production.</p>
      </div>
    </div>
    <Footer />
  </Layout>
);

export default Privacy;
