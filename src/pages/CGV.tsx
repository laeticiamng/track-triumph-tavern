import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslation } from "react-i18next";

const CGV = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <SEOHead title={t("legal.cgvTitle")} description={t("legal.cgvSeoDesc")} url="/legal/cgv" />
      <div className="container max-w-3xl py-12">
        <h1 className="font-display text-3xl font-bold mb-8">{t("legal.cgvTitle")}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p><em>{t("legal.lastUpdated")}</em></p>

          {/* Body content kept in French as it's jurisdiction-specific legal text */}
          <h2 className="text-foreground font-display">1. Objet</h2>
          <p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre EMOTIONSCARE SASU (ci-après « l'Éditeur ») et toute personne physique ou morale (ci-après « le Client ») souscrivant un abonnement payant sur la plateforme Weekly Music Awards.</p>

          <h2 className="text-foreground font-display">2. Services proposés</h2>
          <p>La Plateforme propose les services suivants :</p>
          <ul>
            <li><strong>Accès gratuit :</strong> écoute des soumissions, vote (5 votes/semaine), accès au classement.</li>
            <li><strong>Abonnement Pro (9,99 €/mois) :</strong> soumission, votes illimités, commentaires, profil personnalisé, outils IA.</li>
            <li><strong>Abonnement Elite (19,99 €/mois) :</strong> toutes les fonctionnalités Pro, plus feedback IA, commentaires illimités, badge Elite.</li>
          </ul>
          <p>Les abonnements <strong>n'influencent en aucun cas</strong> le classement ni les résultats du concours.</p>

          <h2 className="text-foreground font-display">3. Prix et paiement</h2>
          <p>Les prix sont indiqués en euros (€) TTC. Le paiement est effectué par carte bancaire via <strong>Stripe</strong>.</p>

          <h2 className="text-foreground font-display">4. Droit de rétractation</h2>
          <p>Conformément à l'article L.221-28 du Code de la consommation, l'exécution du service commence dès la validation du paiement. Le Client peut résilier à tout moment, sans remboursement de la période entamée.</p>

          <h2 className="text-foreground font-display">5. Résiliation</h2>
          <p>L'abonnement est <strong>sans engagement</strong>. Résiliation possible à tout moment depuis l'espace personnel.</p>

          <h2 className="text-foreground font-display">6. Récompenses et versement des gains</h2>
          <p>Cagnotte hebdomadaire : 1er 200 €, 2e 100 €, 3e 50 €. 100 % financée par les sponsors. Versement par virement sous 14 jours ouvrés.</p>

          <h2 className="text-foreground font-display">7. Responsabilité</h2>
          <p>L'Éditeur met tout en œuvre pour assurer la disponibilité de la Plateforme.</p>

          <h2 className="text-foreground font-display">8. Protection des données</h2>
          <p>Voir notre <Link to="/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>.</p>

          <h2 className="text-foreground font-display">9. Service client</h2>
          <p>Contact : <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a></p>

          <h2 className="text-foreground font-display">10. Médiation</h2>
          <p>Conformément au Code de la consommation, le Client peut recourir à un médiateur.</p>

          <h2 className="text-foreground font-display">11. Droit applicable</h2>
          <p>Les présentes CGV sont soumises au droit français.</p>

          <p className="text-sm font-medium text-foreground">{t("legal.editor")}</p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default CGV;
