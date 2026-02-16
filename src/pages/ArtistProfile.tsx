import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { ArrowLeft, Music, ExternalLink, Crown, Star } from "lucide-react";
import { motion } from "framer-motion";
import { SEOHead, musicGroupJsonLd } from "@/components/seo/SEOHead";
import type { Tables } from "@/integrations/supabase/types";

const ArtistProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [submissions, setSubmissions] = useState<Tables<"submissions">[]>([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string>("free");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", id).single();
        if (prof) {
          setProfile(prof);

          const { data: subs } = await supabase
            .from("submissions")
            .select("*")
            .eq("user_id", id)
            .eq("status", "approved")
            .order("created_at", { ascending: false });
          setSubmissions(subs || []);

          // Check artist tier (authenticated endpoint)
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
              const { data: tierData } = await supabase.functions.invoke("check-subscription-public", {
                body: { user_id: id },
              });
              const result = typeof tierData === "string" ? JSON.parse(tierData) : tierData;
              if (result?.tier) setTier(result.tier);
            }
          } catch {
            // Silently fail - default to "free"
          }
        }
      } catch (err) {
        console.error("Error loading artist profile:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-20 text-center">
          <h2 className="font-display text-2xl font-bold">Artiste introuvable</h2>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/explore"><ArrowLeft className="mr-2 h-4 w-4" />Explorer</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const socialLinks = (profile.social_links as Record<string, string>) || {};
  const totalVotes = submissions.reduce((sum, s) => sum + s.vote_count, 0);

  return (
    <Layout>
      <SEOHead
        title={profile.display_name || "Artiste"}
        description={profile.bio || `Découvrez le profil de ${profile.display_name || "cet artiste"} sur Weekly Music Awards.`}
        url={`/artist/${id}`}
        image={profile.avatar_url || undefined}
        jsonLd={musicGroupJsonLd({
          name: profile.display_name || "Artiste",
          id: id || "",
          image: profile.avatar_url || undefined,
        })}
      />
      <div className="container max-w-3xl py-8">
        <Link to="/explore" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        {/* Banner & Avatar */}
        <div className="relative mb-8">
          {profile.banner_url ? (
            <img src={profile.banner_url} alt={`Bannière de ${profile.display_name || "l'artiste"}`} className="h-48 w-full rounded-2xl object-cover" />
          ) : (
            <div className="h-48 w-full rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5" />
          )}
          <div className="absolute -bottom-10 left-6 flex items-end gap-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={`Photo de ${profile.display_name || "l'artiste"}`} className="h-20 w-20 rounded-full border-4 border-background object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-secondary text-2xl font-bold">
                {(profile.display_name || "?")[0]}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold">{profile.display_name || "Artiste"}</h1>
            {tier === "elite" && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 gap-1">
                <Crown className="h-3 w-3" /> Elite
              </Badge>
            )}
            {tier === "pro" && (
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                <Star className="h-3 w-3" /> Pro
              </Badge>
            )}
          </div>
          {profile.bio && <p className="mt-2 text-muted-foreground">{profile.bio}</p>}

          {/* Social Links */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <Button key={platform} variant="outline" size="sm" asChild>
                  <a href={url as string} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3 w-3" /> {platform}
                  </a>
                </Button>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Card className="text-center p-4">
              <p className="font-display text-2xl font-bold">{submissions.length}</p>
              <p className="text-xs text-muted-foreground">Morceaux</p>
            </Card>
            <Card className="text-center p-4">
              <p className="font-display text-2xl font-bold">{totalVotes}</p>
              <p className="text-xs text-muted-foreground">Votes reçus</p>
            </Card>
          </div>

          {/* Tracks */}
          <h2 className="mt-8 mb-4 font-display text-xl font-semibold flex items-center gap-2">
            <Music className="h-5 w-5" /> Morceaux
          </h2>
          {submissions.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Aucun morceau publié.</p>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Link
                    to={`/submissions/${sub.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <img src={sub.cover_image_url} alt={`Couverture de ${sub.title}`} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{sub.title}</p>
                      <p className="text-xs text-muted-foreground">{sub.vote_count} votes</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default ArtistProfile;
