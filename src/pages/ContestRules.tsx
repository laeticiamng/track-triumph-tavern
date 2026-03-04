import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslation } from "react-i18next";

const ContestRules = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <SEOHead title={t("legal.contestRulesTitle")} description={t("legal.contestRulesSeoDesc")} url="/contest-rules" />
      <div className="container max-w-3xl py-12">
        <h1 className="font-display text-3xl font-bold mb-8">{t("legal.contestRulesTitle")}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p><em>{t("legal.lastUpdated")}</em></p>

          <h2 className="text-foreground font-display">Article 1 — Nature du concours</h2>
          <p>Le Weekly Music Awards est un concours artistique basé exclusivement sur le mérite. Le classement est déterminé par les votes de la communauté. Aucun élément de hasard n'intervient.</p>

          <h2 className="text-foreground font-display">Article 2 — Participation</h2>
          <p>La participation est gratuite et ouverte à tout utilisateur inscrit et majeur. Les abonnements Pro/Elite offrent des outils SaaS mais ne confèrent aucun avantage compétitif.</p>

          <h2 className="text-foreground font-display">Article 3 — Soumissions</h2>
          <p>Un morceau par catégorie par semaine. Extrait audio (30-60 secondes) et image de couverture obligatoires. Soumis à modération.</p>

          <h2 className="text-foreground font-display">Article 4 — Votes</h2>
          <p>Un vote par catégorie par semaine. Mesures anti-fraude en place. Les votes individuels ne sont jamais publics.</p>

          <h2 className="text-foreground font-display">Article 5 — Classement</h2>
          <p>Score calculé par moyenne pondérée de 3 critères : Émotion, Originalité et Production. Les poids varient par catégorie.</p>

          <h2 className="text-foreground font-display">Article 6 — Récompenses</h2>
          <p>Podium : 1er 200 €, 2e 100 €, 3e 50 €. Financées par les sponsors uniquement.</p>

          <h2 className="text-foreground font-display">Article 7 — Fraude et disqualification</h2>
          <p>Tout comportement frauduleux entraîne la disqualification immédiate.</p>

          <h2 className="text-foreground font-display">Article 8 — Litiges</h2>
          <p>Droit français applicable. Décision de l'équipe de modération fait foi.</p>

          <p className="text-sm font-medium text-foreground">{t("legal.editor")}</p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default ContestRules;
