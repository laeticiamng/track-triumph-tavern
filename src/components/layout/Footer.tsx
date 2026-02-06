import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Music } from "lucide-react";

export const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  return (
    <footer ref={ref} className="border-t border-border py-12">
      <div className="container">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary">
              <Music className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-bold">Weekly Music Awards</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">CGU</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link>
            <Link to="/contest-rules" className="hover:text-foreground transition-colors">Règlement</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Weekly Music Awards
          </p>
        </div>
      </div>
    </footer>
  );
});
