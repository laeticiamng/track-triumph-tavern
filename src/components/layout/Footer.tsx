import { Link } from "react-router-dom";
import { Instagram, Music, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com/weeklymusicawards", icon: Instagram },
  { name: "YouTube", href: "https://www.youtube.com/@weeklymusicawards", icon: Youtube },
] as const;

export function Footer() {
  const { t } = useTranslation();

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
              {t("footer.tagline")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-sm font-semibold mb-3">{t("footer.navigation")}</h4>
            <nav aria-label={t("a11y.footerNavigation")} className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/explore" className="hover:text-foreground transition-colors">{t("footer.explore")}</Link>
              <Link to="/scoring-method" className="hover:text-foreground transition-colors">{t("footer.ranking")}</Link>
              <Link to="/hall-of-fame" className="hover:text-foreground transition-colors">{t("footer.hallOfFame")}</Link>
              <Link to="/pricing" className="hover:text-foreground transition-colors">{t("footer.subscriptions")}</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">{t("footer.faq")}</Link>
              <Link to="/articles" className="hover:text-foreground transition-colors">{t("footer.articles")}</Link>
              <Link to="/about" className="hover:text-foreground transition-colors">{t("footer.about")}</Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-sm font-semibold mb-3">{t("footer.legal")}</h4>
            <nav aria-label={t("a11y.footerLegal")} className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/legal/mentions" className="hover:text-foreground transition-colors">{t("footer.legalNotices")}</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">{t("footer.cgu")}</Link>
              <Link to="/legal/cgv" className="hover:text-foreground transition-colors">{t("footer.cgv")}</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">{t("footer.privacy")}</Link>
              <Link to="/contest-rules" className="hover:text-foreground transition-colors">{t("footer.rules")}</Link>
              <Link to="/cookies" className="hover:text-foreground transition-colors">{t("footer.cookies")}</Link>
              <button
                type="button"
                onClick={() => (window as Window & { __reopenCookieBanner?: () => void }).__reopenCookieBanner?.()}
                className="text-left hover:text-foreground transition-colors"
              >
                {t("footer.manageCookies")}
              </button>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold mb-3">{t("footer.contact")}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footer.contactText")}
            </p>
            <a href="mailto:contact@weeklymusicawards.com" className="mt-2 inline-block text-sm text-primary hover:underline">
              contact@weeklymusicawards.com
            </a>
            <div className="mt-4">
              <p className="text-xs font-medium text-foreground">{t("footer.followUs")}</p>
              <div className="mt-2 flex items-center gap-2">
                {socialLinks.map(({ name, href, icon: Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t("footer.followOnPlatform", { platform: name })}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
