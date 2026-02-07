import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, BarChart3, Shield, Scale, Users } from "lucide-react";
import { Link } from "react-router-dom";

const ScoringMethod = () => (
  <Layout>
    <div className="container max-w-3xl py-8 md:py-12">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <h1 className="font-display text-3xl font-bold sm:text-4xl">Méthode de classement</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Transparence totale sur le calcul des scores et l'attribution des classements.
      </p>

      <div className="mt-10 space-y-10">
        {/* Score formula */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">Formule de score</h2>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <code className="text-lg font-mono font-semibold text-primary">
              Score = Votes validés + Bonus jury (max 15&nbsp;%)
            </code>
          </div>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Chaque vote validé vaut 1 point.</li>
            <li>Le bonus jury est optionnel, configurable par l'admin et plafonné à 15 % du total des votes.</li>
            <li>Le classement est établi par catégorie, du score le plus élevé au plus bas.</li>
          </ul>
        </section>

        {/* No randomness */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">Aucun hasard</h2>
          </div>
          <p className="text-muted-foreground">
            Le classement repose exclusivement sur la qualité musicale et l'engagement de la communauté.
            Il n'y a aucun tirage au sort, aucun aléa et aucun facteur de chance. Les résultats sont déterministes et reproductibles.
          </p>
        </section>

        {/* Anti-fraud */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">Anti-fraude</h2>
          </div>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Vérification e-mail obligatoire pour chaque votant.</li>
            <li>Rate limiting strict : maximum 5 votes par minute.</li>
            <li>Détection automatique de patterns suspects : rafales de votes, clusters d'IP, comportements de bots.</li>
            <li>Audit trail complet : chaque vote est enregistré avec horodatage, user-agent et IP.</li>
            <li>Les votes suspects sont invalidés (<code>is_valid = false</code>) et exclus du classement.</li>
          </ul>
        </section>

        {/* Fair play */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">Équité & abonnements</h2>
          </div>
          <p className="text-muted-foreground">
            La participation au concours est gratuite. Les abonnements Pro et Elite offrent uniquement des services SaaS
            (analytics, feedback IA, kit marketing) et <strong>n'influencent jamais</strong> les chances de gagner, le classement ou les votes.
          </p>
        </section>
      </div>
    </div>
    <Footer />
  </Layout>
);

export default ScoringMethod;
