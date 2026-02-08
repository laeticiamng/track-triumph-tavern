import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";

const ContestRules = () => (
  <Layout>
    <div className="container max-w-3xl py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Règlement du Concours</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p><em>Dernière mise à jour : Février 2026</em></p>

        <h2 className="text-foreground font-display">Article 1 — Nature du concours</h2>
        <p>Le Weekly Music Awards est un concours artistique basé exclusivement sur le mérite. Le classement est déterminé par les votes de la communauté et un bonus jury optionnel, plafonné et transparent. Aucun élément de hasard n'intervient. Ce concours n'est ni un jeu de hasard, ni une loterie, ni un pari.</p>

        <h2 className="text-foreground font-display">Article 2 — Participation</h2>
        <p>La participation au concours est gratuite et ouverte à tout utilisateur inscrit et majeur. Aucun paiement n'est requis pour participer, soumettre un morceau ou être classé. Les abonnements Pro/Elite offrent des services SaaS (analytics, outils marketing) mais ne confèrent aucun avantage compétitif.</p>

        <h2 className="text-foreground font-display">Article 3 — Soumissions</h2>
        <p>Chaque participant peut soumettre un morceau par catégorie par semaine. L'extrait audio (30-60 secondes) et une image de couverture sont obligatoires. Le participant déclare être l'auteur ou détenir les droits nécessaires. Toute soumission est soumise à modération.</p>

        <h2 className="text-foreground font-display">Article 4 — Votes</h2>
        <p>Chaque utilisateur inscrit dispose d'un vote par catégorie par semaine. Les votes ne sont possibles que pendant la période de vote définie. Des mesures anti-fraude sont en place : vérification email, détection de comportements suspects, audit trail. Les votes individuels ne sont jamais rendus publics.</p>

        <h2 className="text-foreground font-display">Article 5 — Classement</h2>
        <p>Le score final est calculé selon une moyenne pondérée de trois critères : Émotion, Originalité et Production. Chaque votant attribue une note de 1 à 5 pour chacun de ces critères. Les poids appliqués varient selon la catégorie musicale afin de refléter les valeurs artistiques propres à chaque genre (par exemple, l'Émotion est davantage pondérée en Lofi, l'Originalité en Rap/Trap). Le classement est déterminé par la moyenne pondérée obtenue. La méthode de classement et les poids par catégorie sont publics et transparents.</p>

        <h2 className="text-foreground font-display">Article 6 — Récompenses</h2>
        <p>Les récompenses sont sponsorisées par des partenaires et le budget marketing de la plateforme. Elles ne proviennent jamais des paiements des participants. Le podium de chaque semaine reçoit : 1er 200 €, 2e 100 €, 3e 50 €. Les récompenses financières ne sont activées que lorsque le budget sponsorisé minimum est confirmé. En cas de budget insuffisant, des récompenses alternatives sont offertes (visibilité, badges, coaching).</p>

        <h2 className="text-foreground font-display">Article 7 — Fraude et disqualification</h2>
        <p>Tout comportement frauduleux (manipulation de votes, faux comptes, bots) entraîne la disqualification immédiate et la suspension du compte. Les votes suspects sont invalidés.</p>

        <h2 className="text-foreground font-display">Article 8 — Litiges</h2>
        <p>En cas de litige, la décision de l'équipe de modération fait foi. Les présentes règles sont soumises au droit français.</p>

        <p className="text-sm font-medium text-foreground">Éditeur : EMOTIONSCARE SASU — SIREN 944 505 445 — contact@emotionscare.com</p>
      </div>
    </div>
    <Footer />
  </Layout>
);

export default ContestRules;
