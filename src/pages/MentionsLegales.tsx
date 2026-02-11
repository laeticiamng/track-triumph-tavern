import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";

const MentionsLegales = () => (
  <Layout>
    <SEOHead title="Mentions legales" description="Mentions legales de la plateforme Weekly Music Awards, editee par EMOTIONSCARE SASU." url="/legal/mentions" />
    <div className="container max-w-3xl py-12">
      <h1 className="font-display text-3xl font-bold mb-8">Mentions Légales</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p><em>Dernière mise à jour : Février 2026</em></p>

        <h2 className="text-foreground font-display">1. Éditeur du site</h2>
        <p>
          Le site <strong>Weekly Music Awards</strong> (ci-après « la Plateforme ») est édité par :
        </p>
        <ul className="list-none space-y-1 pl-0">
          <li><strong>Raison sociale :</strong> EMOTIONSCARE SASU</li>
          <li><strong>Forme juridique :</strong> Société par actions simplifiée unipersonnelle</li>
          <li><strong>SIREN :</strong> 944 505 445</li>
          <li><strong>RCS :</strong> Registre du Commerce et des Sociétés (immatriculation en cours ou à vérifier sur infogreffe.fr)</li>
          <li><strong>Siège social :</strong> [Adresse complète à renseigner], France</li>
          <li><strong>E-mail :</strong> <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a></li>
          <li><strong>Directeur de la publication :</strong> Le représentant légal d'EMOTIONSCARE SASU</li>
          <li><strong>Délégué à la Protection des Données (DPO) :</strong> <a href="mailto:dpo@emotionscare.com" className="text-primary hover:underline">dpo@emotionscare.com</a></li>
        </ul>

        <h2 className="text-foreground font-display">2. Hébergement</h2>
        <p>
          La Plateforme est hébergée par :
        </p>
        <ul className="list-none space-y-1 pl-0">
          <li><strong>Hébergeur :</strong> Lovable / Netlify (infrastructure cloud)</li>
          <li><strong>Base de données et fonctions backend :</strong> Supabase Inc.</li>
          <li><strong>Paiements :</strong> Stripe Payments Europe, Ltd.</li>
        </ul>

        <h2 className="text-foreground font-display">3. Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur la Plateforme (textes, graphismes, logo, icônes, images, extraits sonores, logiciels, base de données) est la propriété exclusive d'EMOTIONSCARE SASU ou fait l'objet d'une autorisation d'utilisation, et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication, distribution ou retransmission, totale ou partielle, du contenu de la Plateforme, par quelque procédé que ce soit, sans l'autorisation écrite préalable d'EMOTIONSCARE SASU, est strictement interdite.
        </p>
        <p>
          Les morceaux musicaux soumis par les artistes restent la propriété exclusive de leurs auteurs respectifs. La Plateforme dispose d'une licence non exclusive et limitée de diffusion dans le cadre du concours.
        </p>

        <h2 className="text-foreground font-display">4. Données personnelles</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée, vous disposez d'un droit d'accès, de rectification, de suppression, de portabilité et d'opposition concernant vos données personnelles.
        </p>
        <p>
          Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>
        </p>
        <p>
          Pour en savoir plus, consultez notre <a href="/privacy" className="text-primary hover:underline">Politique de confidentialité</a>.
        </p>

        <h2 className="text-foreground font-display">5. Cookies</h2>
        <p>
          La Plateforme utilise des cookies pour assurer son bon fonctionnement et améliorer l'expérience utilisateur. Pour en savoir plus, consultez notre <a href="/cookies" className="text-primary hover:underline">Politique de cookies</a>.
        </p>

        <h2 className="text-foreground font-display">6. Limitation de responsabilité</h2>
        <p>
          EMOTIONSCARE SASU s'efforce de fournir des informations exactes et à jour sur la Plateforme. Toutefois, elle ne saurait garantir l'exactitude, la complétude ou l'actualité des informations diffusées. La Plateforme ne pourra être tenue responsable des dommages directs ou indirects résultant de l'accès ou de l'utilisation du site.
        </p>

        <h2 className="text-foreground font-display">7. Droit applicable</h2>
        <p>
          Les présentes mentions légales sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux français seront seuls compétents.
        </p>

        <p className="text-sm font-medium text-foreground">
          Éditeur : EMOTIONSCARE SASU — SIREN 944 505 445 — contact@emotionscare.com
        </p>
      </div>
    </div>
    <Footer />
  </Layout>
);

export default MentionsLegales;
