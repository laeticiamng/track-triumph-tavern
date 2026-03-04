import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslation } from "react-i18next";

const ContestRules = () => {
  const { t } = useTranslation();

  const articles = Array.from({ length: 8 }, (_, i) => ({
    title: t(`legal.cr${i + 1}Title`),
    text: t(`legal.cr${i + 1}Text`),
  }));

  return (
    <Layout>
      <SEOHead title={t("legal.contestRulesTitle")} description={t("legal.contestRulesSeoDesc")} url="/contest-rules" />
      <div className="container max-w-3xl py-12">
        <h1 className="font-display text-3xl font-bold mb-8">{t("legal.contestRulesTitle")}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p><em>{t("legal.lastUpdated")}</em></p>

          {articles.map((art, i) => (
            <div key={i}>
              <h2 className="text-foreground font-display">{art.title}</h2>
              <p>{art.text}</p>
            </div>
          ))}

          <p className="text-sm font-medium text-foreground">{t("legal.editor")}</p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default ContestRules;
