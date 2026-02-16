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

        <h2 className="text-foreground font-display">5. Cookies marketing</h2>
        <p>Les cookies marketing sont utilisés pour suivre les visiteurs sur les sites web. Leur objectif est d'afficher des publicités pertinentes et personnalisées pour l'utilisateur, ce qui les rend plus précieuses pour les éditeurs et les annonceurs tiers. Ces cookies permettent notamment :</p>
        <ul>
          <li><strong>Personnalisation :</strong> adapter le contenu et les suggestions en fonction de vos centres d'intérêt et de votre activité sur la plateforme.</li>
          <li><strong>Remarketing :</strong> vous proposer des annonces ciblées sur d'autres sites web en rapport avec votre utilisation de notre service, afin de vous rappeler nos offres ou événements pertinents.</li>
        </ul>
        <p>Ces cookies ne sont déposés qu'avec votre consentement explicite.</p>

        <h2 className="text-foreground font-display">6. Cookies tiers</h2>
        <p>Certains cookies sont déposés par des services tiers intégrés à notre plateforme :</p>
        <ul>
          <li><strong>Stripe :</strong> cookies nécessaires au traitement sécurisé des paiements. Ces cookies permettent la détection de fraude et la gestion des sessions de paiement.</li>
          <li><strong>Analytics :</strong> cookies déposés par notre solution d'analyse d'audience pour mesurer la fréquentation du site, identifier les pages les plus visitées et améliorer l'expérience utilisateur. Ces données sont collectées de manière anonyme.</li>
        </ul>
        <p>Pour en savoir plus sur les cookies déposés par ces tiers, nous vous invitons à consulter leurs politiques de confidentialité respectives.</p>

        <h2 className="text-foreground font-display">7. Retrait du consentement</h2>
        <p>Vous pouvez retirer votre consentement à tout moment en cliquant sur le lien <Link to="#" className="text-primary hover:underline">« Gérer mes cookies »</Link> disponible dans le pied de page du site. Ce lien vous permet de modifier vos préférences concernant les cookies non essentiels (analytiques, marketing, tiers). Le retrait de votre consentement n'affecte pas la licéité du traitement fondé sur le consentement effectué avant ce retrait.</p>

        <p className="text-sm font-medium text-foreground">Éditeur : EMOTIONSCARE SASU — SIREN 944 505 445 — contact@emotionscare.com</p>
      </div>
    </div>
    <Footer />
  </Layout>
);

export default Cookies;
