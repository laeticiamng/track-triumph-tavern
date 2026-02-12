import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";

const Cookies = () => (
  <Layout>
    <SEOHead title="Politique de cookies" description="Politique d'utilisation des cookies sur la plateforme Weekly Music Awards." url="/cookies" />
    <div className="container max-w-3xl py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Politique Cookies</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p><em>Dernière mise à jour : Février 2026</em></p>

        <h2 className="text-foreground font-display">1. Qu'est-ce qu'un cookie ?</h2>
        <p>Un cookie est un petit fichier texte stocké sur votre appareil lors de la visite d'un site web.</p>

        <h2 className="text-foreground font-display">2. Cookies utilisés</h2>
        <ul>
          <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site (authentification, session).</li>
          <li><strong>Cookies analytiques :</strong> mesure d'audience anonyme pour améliorer le service.</li>
        </ul>

        <h2 className="text-foreground font-display">3. Gestion des cookies</h2>
        <p>Vous pouvez configurer votre navigateur pour refuser les cookies. Notez que certaines fonctionnalités du site pourraient ne plus fonctionner correctement. Pour en savoir plus sur vos données, consultez notre <Link to="/privacy" className="text-primary hover:underline">Politique de Confidentialité</Link>.</p>

        <h2 className="text-foreground font-display">4. Durée</h2>
        <p>Les cookies de session sont supprimés à la fermeture du navigateur. Les cookies persistants ont une durée maximale de 13 mois.</p>

        <p className="text-sm font-medium text-foreground">Éditeur : EMOTIONSCARE SASU — SIREN 944 505 445 — contact@emotionscare.com</p>
      </div>
    </div>
    <Footer />
  </Layout>
);

export default Cookies;
