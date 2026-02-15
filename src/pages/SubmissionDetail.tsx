import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useVoteState } from "@/hooks/use-vote-state";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { VoteButton } from "@/components/vote/VoteButton";
import { AIFeedback } from "@/components/elite/AIFeedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/seo/SEOHead";
import type { Tables } from "@/integrations/supabase/types";

type Submission = Tables<"submissions">;

const SubmissionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [category, setCategory] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  const voteState = useVoteState(submission?.week_id ?? null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const { data: sub } = await supabase.from("submissions").select("*").eq("id", id).single();
      if (sub) {
        setSubmission(sub);
        const [{ data: prof }, { data: cat }] = await Promise.all([
          supabase.from("profiles").select("display_name, avatar_url").eq("id", sub.user_id).single(),
          supabase.from("categories").select("name").eq("id", sub.category_id).single(),
        ]);
        setProfile(prof);
        setCategory(cat);

        if (user) {
          const { data: existingVote } = await supabase
            .from("votes")
            .select("id")
            .eq("user_id", user.id)
            .eq("category_id", sub.category_id)
            .eq("week_id", sub.week_id)
            .maybeSingle();
          setHasVoted(!!existingVote);
        }
      }
      setLoading(false);
    };

    load();
  }, [id, user]);

  const handleVoted = () => {
    setHasVoted(true);
    if (submission) {
      setSubmission({ ...submission, vote_count: submission.vote_count + 1 });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!submission) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-20 text-center">
          <h2 className="font-display text-2xl font-bold">Soumission introuvable</h2>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/explore"><ArrowLeft className="mr-2 h-4 w-4" />Retour à l'explorer</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const isOwnSubmission = user?.id === submission.user_id;

  return (
    <Layout>
      <SEOHead
        title={`${submission.title} — ${submission.artist_name}`}
        description={submission.description || `Ecoutez ${submission.title} par ${submission.artist_name} sur Weekly Music Awards.`}
        url={`/submissions/${submission.id}`}
        image={submission.cover_image_url}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "MusicRecording",
          name: submission.title,
          byArtist: { "@type": "MusicGroup", name: submission.artist_name },
          url: `https://weeklymusicawards.com/submissions/${submission.id}`,
          image: submission.cover_image_url,
          ...(category ? { genre: category.name } : {}),
          description: submission.description || undefined,
        }}
      />
      <div className="container py-8">
        <Link to="/explore" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
          {/* Cover */}
          <div className="overflow-hidden rounded-2xl">
            <img
              src={submission.cover_image_url}
              alt={submission.title}
              className="aspect-square w-full object-cover"
            />
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              {category && (
                <Badge variant="secondary" className="rounded-full">
                  {category.name}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(submission.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold sm:text-4xl">{submission.title}</h1>

            <Link to={`/artist/${submission.user_id}`} className="mt-3 flex items-center gap-3 group">
              {profile?.avatar_url && (
                <img src={profile.avatar_url} alt={`Avatar de ${profile.display_name || "l'artiste"}`} className="h-8 w-8 rounded-full object-cover" />
              )}
              <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                {submission.artist_name}
              </span>
            </Link>

            {submission.description && (
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {submission.description}
              </p>
            )}

            {submission.tags && submission.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {submission.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-full text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Audio Player */}
            <div className="mt-8">
              <AudioPlayer
                src={submission.audio_excerpt_url}
                title={submission.title}
                artist={submission.artist_name}
                coverUrl={submission.cover_image_url}
                previewStart={submission.preview_start_sec}
                previewEnd={submission.preview_end_sec}
              />
            </div>

            {submission.external_url && (
              <Button variant="outline" className="mt-4" asChild>
                <a href={submission.external_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Écouter en entier
                </a>
              </Button>
            )}

            {/* Vote Section */}
            <div className="mt-8">
              {isOwnSubmission ? (
                <div className="rounded-xl bg-secondary/50 p-4 text-center">
                  <p className="text-3xl font-display font-bold">{submission.vote_count}</p>
                  <p className="text-sm text-muted-foreground">votes reçus</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <VoteButton
                    submissionId={submission.id}
                    categoryId={submission.category_id}
                    hasVoted={hasVoted}
                    onVoted={handleVoted}
                    tier={voteState.tier}
                    commentsUsed={voteState.commentsUsed}
                    commentsMax={voteState.commentsMax}
                  />
                  <p className="text-center text-sm text-muted-foreground">
                    {submission.vote_count} vote{submission.vote_count !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>

            {/* AI Feedback (Elite only) */}
            {isOwnSubmission && (
              <div className="mt-8">
                <AIFeedback
                  submission={{
                    title: submission.title,
                    artist_name: submission.artist_name,
                    description: submission.description,
                    tags: submission.tags,
                    category_name: category?.name,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default SubmissionDetail;
