import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import {
  Clock, CheckCircle2, XCircle, AlertCircle, Music, ArrowLeft, ExternalLink,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type Submission = Tables<"submissions">;

interface EnrichedSubmission extends Submission {
  category_name: string;
  week_title: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "En attente de moderation",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    description: "Votre soumission est en cours d'examen par notre equipe.",
  },
  approved: {
    icon: CheckCircle2,
    label: "Approuvee",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    description: "Votre morceau est maintenant en competition !",
  },
  rejected: {
    icon: XCircle,
    label: "Rejetee",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    description: "Votre soumission n'a pas ete retenue.",
  },
};

const SubmissionReview = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/submit/review");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data: subs } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!subs || subs.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      // Get categories and weeks for display
      const [{ data: categories }, { data: weeks }] = await Promise.all([
        supabase.from("categories").select("id, name"),
        supabase.from("weeks").select("id, title, week_number"),
      ]);

      const catMap = new Map(categories?.map((c) => [c.id, c.name]) ?? []);
      const weekMap = new Map(
        weeks?.map((w) => [w.id, w.title || `Semaine ${w.week_number}`]) ?? []
      );

      setSubmissions(
        subs.map((s) => ({
          ...s,
          category_name: catMap.get(s.category_id) || "",
          week_title: weekMap.get(s.week_id) || "",
        }))
      );
      setLoading(false);
    };

    load();
  }, [user]);

  // Subscribe to realtime changes on user's submissions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("submission-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "submissions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setSubmissions((prev) =>
            prev.map((s) =>
              s.id === payload.new.id
                ? { ...s, ...payload.new as Submission }
                : s
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <Layout>
      <SEOHead
        title="Suivi des soumissions"
        description="Suivez le statut de vos soumissions musicales."
        url="/submit/review"
      />
      <div className="container max-w-2xl py-8">
        <Link
          to="/compete"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Nouvelle soumission
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Suivi des soumissions
          </h1>
          <p className="mt-2 text-muted-foreground">
            Suivez le statut de chaque morceau soumis. Vous recevrez une notification a chaque changement.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 rounded bg-muted animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mb-4">
              <Music className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold">Aucune soumission</h2>
            <p className="mt-2 text-muted-foreground max-w-sm">
              Vous n'avez pas encore soumis de morceau. Participez a la competition !
            </p>
            <Button asChild className="mt-6 bg-gradient-primary">
              <Link to="/compete">Soumettre un morceau</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub, i) => {
              const config = statusConfig[sub.status];
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`border ${config.color.split(" ")[0].replace("bg-", "border-")}/30`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Cover */}
                        <img
                          src={sub.cover_image_url}
                          alt={sub.title}
                          className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          {/* Title & meta */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-display font-semibold truncate">
                                {sub.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {sub.artist_name} · {sub.category_name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {sub.week_title}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`flex-shrink-0 ${config.color}`}
                            >
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {config.label}
                            </Badge>
                          </div>

                          {/* Status message */}
                          <p className="mt-2 text-sm text-muted-foreground">
                            {config.description}
                          </p>

                          {/* Rejection reason */}
                          {sub.status === "rejected" && sub.rejection_reason && (
                            <div className="mt-2 rounded-lg bg-destructive/5 border border-destructive/10 p-3">
                              <p className="text-xs font-medium text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Motif du rejet
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {sub.rejection_reason}
                              </p>
                            </div>
                          )}

                          {/* Audio preview */}
                          <div className="mt-3">
                            <AudioPlayer
                              src={sub.audio_excerpt_url}
                              title={sub.title}
                              artist={sub.artist_name}
                              compact
                            />
                          </div>

                          {/* Stats if approved */}
                          {sub.status === "approved" && (
                            <div className="mt-3 flex items-center gap-3">
                              <Badge className="bg-primary/10 text-primary text-xs">
                                {sub.vote_count} votes
                              </Badge>
                              <Link
                                to={`/submissions/${sub.id}`}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" /> Voir la page
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </Layout>
  );
};

export default SubmissionReview;
