import { Link } from "react-router-dom";
import { Music, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <SEOHead title={t("notFound.title")} description={t("notFound.description")} url="" />
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary mb-6">
        <Music className="h-8 w-8 text-primary-foreground" />
      </div>
      <h1 className="font-display text-6xl font-bold text-foreground">404</h1>
      <p className="mt-3 text-lg text-muted-foreground">{t("notFound.message")}</p>
      <Button asChild className="mt-8 bg-gradient-primary hover:opacity-90 transition-opacity" size="lg">
        <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{t("notFound.backHome")}</Link>
      </Button>
    </div>
  );
};

export default NotFound;
