import { Link } from "react-router-dom";
import { Music } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary">
                <Music className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-display text-sm font-bold">Weekly Music Awards</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-xs">
              Le concours musical hebdomadaire où la communauté vote pour les meilleurs artistes indépendants.
            </p>
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Bêta
            </span>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-sm font-semibold mb-3">Navigation</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/explore" className="hover:text-foreground transition-colors">Explorer</Link>
              <Link to="/scoring-method" className="hover:text-foreground transition-colors">Classement</Link>
              <Link to="/hall-of-fame" className="hover:text-foreground transition-colors">Hall of Fame</Link>
              <Link to="/pricing" className="hover:text-foreground transition-colors">Abonnements</Link>
              <Link to="/about" className="hover:text-foreground transition-colors">À propos</Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-sm font-semibold mb-3">Légal</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">CGU</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link>
              <Link to="/contest-rules" className="hover:text-foreground transition-colors">Règlement</Link>
              <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold mb-3">Contact</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Une question, un partenariat ou un retour ? On adore échanger.
            </p>
            <a
              href="mailto:contact@emotionscare.com"
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              contact@emotionscare.com
            </a>

            {/* TODO: Remettre la section "Suivez-nous" une fois les vrais comptes créés */}
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Weekly Music Awards. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
