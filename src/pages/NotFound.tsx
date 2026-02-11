import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Music, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <SEOHead title="Page introuvable" description="La page que vous recherchez n'existe pas ou a ete deplacee." url="" />
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary mb-6">
        <Music className="h-8 w-8 text-primary-foreground" />
      </div>
      <h1 className="font-display text-6xl font-bold text-foreground">404</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Button asChild className="mt-8 bg-gradient-primary hover:opacity-90 transition-opacity" size="lg">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
