import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";

const CGV = () => (
  <Layout>
    <SEOHead title="Conditions generales de vente" description="Conditions Generales de Vente des abonnements et services de Weekly Music Awards." url="/legal/cgv" />
    <div className="container max-w-3xl py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Conditions Générales de Vente</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p><em>Dernière mise à jour : Février 2026</em></p>

        <h2 className="text-foreground font-display">1. Objet</h2>
        <p>
          Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre EMOTIONSCARE SASU (ci-après « l'Éditeur ») et toute personne physique ou morale (ci-après « le Client ») souscrivant un abonnement payant sur la plateforme Weekly Music Awards (ci-après « la Plateforme »).
        </p>

        <h2 className="text-foreground font-display">2. Services proposés</h2>
        <p>La Plateforme propose les services suivants :</p>
        <ul>
          <li><strong>Accès gratuit :</strong> écoute des soumissions, vote (5 votes/semaine), accès au classement et aux profils artistes.</li>
          <li><strong>Abonnement Pro (9,99 €/mois) :</strong> soumission d'un morceau par semaine et par catégorie, votes illimités, commentaires sur les votes, profil artiste personnalisé, statistiques de votes, outils IA (résumé IA, recommandations, chatbot).</li>
          <li><strong>Abonnement Elite (19,99 €/mois) :</strong> toutes les fonctionnalités Pro, plus feedback IA structuré détaillé, commentaires illimités, badge Elite et profil premium.</li>
        </ul>
        <p>
          Les abonnements donnent accès à des outils et services additionnels (SaaS). Ils <strong>n'influencent en aucun cas</strong> le classement ni les résultats du concours, qui sont déterminés uniquement par les votes de la communauté.
        </p>

        <h2 className="text-foreground font-display">3. Prix et paiement</h2>
        <p>
          Les prix sont indiqués en euros (€) TTC. Le paiement est effectué par carte bancaire via notre prestataire de paiement sécurisé <strong>Stripe</strong>. Le prélèvement est mensuel et automatique à compter de la date de souscription.
        </p>
        <p>
          L'Éditeur se réserve le droit de modifier les tarifs à tout moment. Toute modification sera communiquée aux abonnés au moins 30 jours avant son entrée en vigueur.
        </p>

        <h2 className="text-foreground font-display">4. Droit de rétractation</h2>
        <p>
          Conformément à l'article L.221-28 du Code de la consommation, le Client reconnaît expressément que l'exécution du service commence dès la validation du paiement. Le Client peut toutefois résilier son abonnement à tout moment, sans justification, avec effet à la fin de la période de facturation en cours.
        </p>
        <p>
          Aucun remboursement partiel ne sera effectué pour la période entamée, sauf disposition légale contraire.
        </p>

        <h2 className="text-foreground font-display">5. Résiliation</h2>
        <p>
          L'abonnement est <strong>sans engagement</strong>. Le Client peut résilier à tout moment depuis son espace personnel ou via le portail de gestion Stripe. La résiliation prend effet à la fin de la période de facturation en cours. L'accès aux fonctionnalités payantes est maintenu jusqu'à cette date.
        </p>
        <p>
          L'Éditeur se réserve le droit de suspendre ou résilier un abonnement en cas de violation des CGU, de fraude avérée ou de comportement visant à fausser les résultats du concours.
        </p>

        <h2 className="text-foreground font-display">6. Récompenses et versement des gains</h2>
        <p>
          Chaque semaine, une cagnotte est répartie entre les trois premiers du classement :
        </p>
        <ul>
          <li>1er : 200 €</li>
          <li>2e : 100 €</li>
          <li>3e : 50 €</li>
        </ul>
        <p>
          Les récompenses sont intégralement financées par les sponsors et partenaires de la Plateforme. Elles ne proviennent en aucun cas des abonnements des utilisateurs.
        </p>
        <p>
          Le versement des gains s'effectue par virement bancaire dans un délai de 14 jours ouvrés après la publication officielle des résultats hebdomadaires. Le gagnant doit fournir un RIB valide et les informations nécessaires à l'émission du virement. L'Éditeur se réserve le droit de suspendre le versement en cas de suspicion de fraude, le temps de l'investigation.
        </p>
        <p>
          Les gains sont soumis à la fiscalité applicable selon la législation en vigueur dans le pays de résidence du bénéficiaire. Il appartient au bénéficiaire de déclarer ses revenus conformément à ses obligations fiscales.
        </p>

        <h2 className="text-foreground font-display">7. Responsabilité</h2>
        <p>
          L'Éditeur met tout en œuvre pour assurer la disponibilité et le bon fonctionnement de la Plateforme. Toutefois, il ne saurait être tenu responsable en cas d'interruption temporaire du service pour maintenance, mise à jour ou cas de force majeure.
        </p>
        <p>
          L'Éditeur ne garantit pas que la Plateforme sera exempte de tout bug ou erreur. L'utilisation du service est effectuée aux risques et périls du Client.
        </p>

        <h2 className="text-foreground font-display">8. Protection des données</h2>
        <p>
          Les données collectées dans le cadre de la souscription et de l'utilisation des services sont traitées conformément à notre <Link to="/privacy" className="text-primary hover:underline">Politique de confidentialité</Link> et au Règlement Général sur la Protection des Données (RGPD).
        </p>

        <h2 className="text-foreground font-display">9. Service client</h2>
        <p>
          Pour toute question relative à votre abonnement, vos factures ou le fonctionnement de la Plateforme, contactez-nous à : <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>
        </p>

        <h2 className="text-foreground font-display">10. Médiation</h2>
        <p>
          Conformément aux articles L.611-1 et suivants du Code de la consommation, en cas de litige non résolu avec l'Éditeur, le Client peut recourir gratuitement à un médiateur de la consommation. Les coordonnées du médiateur seront communiquées sur demande.
        </p>

        <h2 className="text-foreground font-display">11. Droit applicable et juridiction</h2>
        <p>
          Les présentes CGV sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux français seront seuls compétents.
        </p>

        <p className="text-sm font-medium text-foreground">
          Éditeur : EMOTIONSCARE SASU — SIREN 944 505 445 — contact@emotionscare.com
        </p>
      </div>
    </div>
    <Footer />
  </Layout>
);

export default CGV;
