import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";

const Terms = () => (
  <Layout>
    <div className="container max-w-3xl py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p><em>Dernière mise à jour : Février 2026</em></p>

        <h2 className="text-foreground font-display">1. Objet</h2>
        <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Weekly Music Awards (ci-après "la Plateforme"), un concours artistique musical hebdomadaire en ligne.</p>

        <h2 className="text-foreground font-display">2. Nature du service</h2>
        <p>La Plateforme organise un concours artistique basé exclusivement sur le mérite et l'appréciation de la communauté. Il ne s'agit en aucun cas d'un jeu de hasard, d'une loterie ou d'un pari. Aucun élément aléatoire n'intervient dans le classement. Les résultats sont déterminés uniquement par les votes de la communauté et l'évaluation artistique.</p>

        <h2 className="text-foreground font-display">3. Inscription</h2>
        <p>L'inscription est gratuite et ouverte à toute personne majeure. La participation au concours ne nécessite aucun paiement. Les abonnements Pro et Elite offrent des services SaaS additionnels (analytics, outils marketing) mais n'influencent en aucun cas le classement ou les chances de gagner.</p>

        <h2 className="text-foreground font-display">4. Propriété intellectuelle</h2>
        <p>Chaque artiste conserve l'intégralité de ses droits sur ses œuvres. En soumettant un morceau, l'artiste accorde à la Plateforme une licence non exclusive et limitée pour diffuser l'extrait audio dans le cadre du concours.</p>

        <h2 className="text-foreground font-display">5. Comportement</h2>
        <p>Les utilisateurs s'engagent à ne pas manipuler les votes, créer de faux comptes ou tout comportement visant à fausser les résultats. La Plateforme se réserve le droit de suspendre tout compte suspect.</p>

        <h2 className="text-foreground font-display">6. Responsabilité</h2>
        <p>La Plateforme ne peut être tenue responsable des contenus soumis par les utilisateurs. Tout contenu contrevenant aux lois en vigueur sera retiré.</p>

        <h2 className="text-foreground font-display">7. Modification</h2>
        <p>Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés de toute modification substantielle.</p>

        <p className="text-sm font-medium text-foreground">Éditeur : EMOTIONSCARE SASU — SIREN 944 505 445 — contact@emotionscare.com</p>

        
      </div>
    </div>
    <Footer />
  </Layout>
);

export default Terms;
