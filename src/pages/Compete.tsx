import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Music, Image, ArrowLeft, Lock, Clock, AlertCircle, Play, Pause, Scissors, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AITagSuggest } from "@/components/ai/AITagSuggest";
import type { Tables } from "@/integrations/supabase/types";

type Category = Tables<"categories">;

interface ActiveWeek {
  id: string;
  title: string | null;
  submission_open_at: string;
  submission_close_at: string;
}

const Compete = () => {
  const { user, loading: authLoading } = useAuth();
  const { tier, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeWeek, setActiveWeek] = useState<ActiveWeek | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weekLoading, setWeekLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [rightsDeclaration, setRightsDeclaration] = useState(false);
  const [acceptRules, setAcceptRules] = useState(false);

  // Audio preview trimmer state
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [previewStart, setPreviewStart] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const PREVIEW_LENGTH = 30; // 30 seconds preview

  const handleAudioFileChange = useCallback((file: File | null) => {
    setAudioFile(file);
    setPreviewStart(0);
    setPreviewPlaying(false);
    setPreviewTime(0);
    setAudioDuration(0);
  }, []);

  // Load audio metadata for preview
  useEffect(() => {
    if (!audioFile) return;
    const url = URL.createObjectURL(audioFile);
    const audio = previewAudioRef.current;
    if (audio) {
      audio.src = url;
      audio.load();
    }
    return () => URL.revokeObjectURL(url);
  }, [audioFile]);

  // Stop preview at end of 30s window
  useEffect(() => {
    const audio = previewAudioRef.current;
    if (!audio || !previewPlaying) return;
    const endTime = previewStart + PREVIEW_LENGTH;
    const interval = setInterval(() => {
      if (audio.currentTime >= endTime || audio.currentTime >= audioDuration) {
        audio.pause();
        setPreviewPlaying(false);
      }
      setPreviewTime(audio.currentTime);
    }, 100);
    return () => clearInterval(interval);
  }, [previewPlaying, previewStart, audioDuration]);

  const togglePreview = () => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    if (previewPlaying) {
      audio.pause();
      setPreviewPlaying(false);
    } else {
      audio.currentTime = previewStart;
      audio.play().then(() => setPreviewPlaying(true)).catch(() => {});
    }
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?tab=signup&redirect=/compete");
    }
  }, [user, authLoading, navigate]);

  // Pre-fill artist name from profile
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("id", user.id).single().then(({ data }) => {
      if (data?.display_name && !artistName) {
        setArtistName(data.display_name);
      }
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    }).catch(() => {});

    supabase
      .from("weeks")
      .select("id, title, submission_open_at, submission_close_at")
      .eq("is_active", true)
      .single()
      .then(({ data }) => {
        setActiveWeek(data as ActiveWeek | null);
        setWeekLoading(false);
      })
      .catch(() => {
        setWeekLoading(false);
      });
  }, []);

  // Check if user already submitted this week
  useEffect(() => {
    if (!user || !activeWeek) return;
    supabase
      .from("submissions")
      .select("id")
      .eq("user_id", user.id)
      .eq("week_id", activeWeek.id)
      .limit(1)
      .then(({ data }) => {
        setAlreadySubmitted((data?.length ?? 0) > 0);
      })
      .catch(() => {});
  }, [user, activeWeek]);

  // Derived state
  const now = new Date();
  const submissionOpen = activeWeek ? new Date(activeWeek.submission_open_at) : null;
  const submissionClose = activeWeek ? new Date(activeWeek.submission_close_at) : null;
  const isInSubmissionPeriod = submissionOpen && submissionClose && now >= submissionOpen && now <= submissionClose;
  const canSubmit = tier !== "free";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeWeek) return;

    if (!title.trim() || !artistName.trim() || !categoryId || !audioFile || !coverFile) {
      toast({ title: "Champs requis", description: "Remplissez tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    if (audioFile.size > 10 * 1024 * 1024) {
      toast({ title: "Fichier trop volumineux", description: "L'extrait audio ne doit pas dépasser 10 MB.", variant: "destructive" });
      return;
    }
    if (!rightsDeclaration || !acceptRules) {
      toast({ title: "Déclarations requises", description: "Vous devez accepter les conditions.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const audioPath = `${user.id}/${Date.now()}-${audioFile.name}`;
      const { error: audioError } = await supabase.storage.from("audio-excerpts").upload(audioPath, audioFile);
      if (audioError) throw audioError;
      const { data: audioUrl } = supabase.storage.from("audio-excerpts").getPublicUrl(audioPath);

      const coverPath = `${user.id}/${Date.now()}-${coverFile.name}`;
      const { error: coverError } = await supabase.storage.from("cover-images").upload(coverPath, coverFile);
      if (coverError) throw coverError;
      const { data: coverUrl } = supabase.storage.from("cover-images").getPublicUrl(coverPath);

      const { error: insertError } = await supabase.from("submissions").insert({
        user_id: user.id,
        week_id: activeWeek.id,
        category_id: categoryId,
        title: title.trim(),
        artist_name: artistName.trim(),
        description: description.trim() || null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        audio_excerpt_url: audioUrl.publicUrl,
        cover_image_url: coverUrl.publicUrl,
        external_url: externalUrl.trim() || null,
        preview_start_sec: previewStart,
        preview_end_sec: Math.min(previewStart + PREVIEW_LENGTH, audioDuration || previewStart + PREVIEW_LENGTH),
        rights_declaration: true,
      });

      if (insertError) throw insertError;
      toast({ title: "Soumission envoyée !", description: "Elle sera examinée par l'équipe de modération." });
      navigate("/explore");
    } catch (err) {
      console.error("Submission error:", err);
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur lors de l'envoi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || subLoading || weekLoading) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  // Gate: Free users cannot submit
  if (!canSubmit) {
    return (
      <Layout>
        <SEOHead
          title="Soumettre"
          description="Soumettez votre morceau au concours musical Weekly Music Awards."
          url="/compete"
        />
        <div className="container max-w-lg py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">Abonnement requis</h1>
          <p className="mt-3 text-muted-foreground">
            La soumission de morceaux est réservée aux abonnés Pro et Elite. Votre participation au concours ne coûte rien de plus que l'abonnement.
          </p>
          <Button asChild className="mt-6 bg-gradient-primary" size="lg">
            <Link to="/pricing">Voir les offres</Link>
          </Button>
        </div>
        <Footer />
      </Layout>
    );
  }

  // Gate: Already submitted this week
  if (alreadySubmitted) {
    return (
      <Layout>
        <div className="container max-w-lg py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/50">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Soumission déjà envoyée</h1>
          <p className="mt-3 text-muted-foreground">
            Vous avez déjà soumis un morceau cette semaine. Une seule soumission par semaine est autorisée.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild className="bg-gradient-primary" size="lg">
              <Link to="/submit/review">Suivre mes soumissions</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/explore">Explorer les soumissions</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title="Soumettre"
        description="Soumettez votre morceau au concours musical Weekly Music Awards."
        url="/compete"
      />
      <div className="container max-w-2xl py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Soumettre votre morceau</CardTitle>
            <CardDescription>
              <span className="block font-medium text-foreground">Votre musique mérite d'être entendue. 🎶</span>
              {activeWeek && isInSubmissionPeriod
                ? `${activeWeek.title || "Semaine en cours"} — Votre soumission sera examinée avant publication.`
                : null}
              {activeWeek && !isInSubmissionPeriod
                ? "La période de soumission n'est pas active actuellement."
                : null}
              {!activeWeek && "Aucune semaine de soumission active pour le moment."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!activeWeek || !isInSubmissionPeriod ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Clock className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  {activeWeek && submissionOpen && now < submissionOpen
                    ? `Les soumissions ouvrent le ${submissionOpen.toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}.`
                    : "Les soumissions ne sont pas ouvertes actuellement. Revenez bientôt !"}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre du morceau *</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mon morceau" required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artist">Nom d'artiste *</Label>
                    <Input id="artist" value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="Votre nom" required maxLength={100} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categoryId && (() => {
                    const cat = categories.find((c) => c.id === categoryId);
                    const tips = cat?.production_tips as Array<{ label: string; value: string }> | null;
                    if (!tips || tips.length === 0) return null;
                    return (
                      <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
                        <p className="text-xs font-medium text-primary flex items-center gap-1">
                          <Music className="h-3 w-3" /> Conseils de production — {cat?.name}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tips.map((tip, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                              <span className="font-medium">{tip.label}</span> {tip.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre morceau..." rows={3} maxLength={500} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                  <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="rap, français, chill" maxLength={200} />
                  <AITagSuggest
                    title={title}
                    description={description}
                    category={categories.find((c) => c.id === categoryId)?.name || ""}
                    currentTags={tags}
                    onAcceptTags={setTags}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Extrait audio (30s) *</Label>
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-accent/30">
                    <Music className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {audioFile ? audioFile.name : "Cliquez pour uploader un fichier audio (MP3, WAV, max 10 MB)"}
                    </span>
                    <span className="text-xs text-muted-foreground/70">MP3 ou WAV uniquement</span>
                    <input
                      type="file"
                      accept="audio/mp3,audio/wav,audio/mpeg"
                      className="hidden"
                      onChange={(e) => handleAudioFileChange(e.target.files?.[0] || null)}
                    />
                  </label>

                  {/* Audio Preview Trimmer */}
                  {audioFile && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                      <audio
                        ref={previewAudioRef}
                        preload="metadata"
                        onLoadedMetadata={() => {
                          if (previewAudioRef.current) {
                            setAudioDuration(previewAudioRef.current.duration);
                          }
                        }}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          Sélectionner l'extrait de 30 secondes
                        </span>
                      </div>
                      {audioDuration > 0 && (
                        <>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Début: {fmtTime(previewStart)}</span>
                              <span>Fin: {fmtTime(Math.min(previewStart + PREVIEW_LENGTH, audioDuration))}</span>
                              <span>Durée totale: {fmtTime(audioDuration)}</span>
                            </div>
                            <Slider
                              value={[previewStart]}
                              max={Math.max(0, audioDuration - PREVIEW_LENGTH)}
                              step={0.5}
                              onValueChange={(v) => setPreviewStart(v[0])}
                              className="cursor-pointer"
                            />
                            {/* Visual indicator of selected range */}
                            <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="absolute h-full bg-primary/40 rounded-full"
                                style={{
                                  left: `${(previewStart / audioDuration) * 100}%`,
                                  width: `${(Math.min(PREVIEW_LENGTH, audioDuration - previewStart) / audioDuration) * 100}%`,
                                }}
                              />
                              {previewPlaying && (
                                <div
                                  className="absolute h-full w-0.5 bg-primary"
                                  style={{
                                    left: `${(previewTime / audioDuration) * 100}%`,
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={togglePreview}
                            className="gap-2"
                          >
                            {previewPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                            {previewPlaying ? "Pause" : "Écouter l'extrait"}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Image de couverture *</Label>
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-accent/30">
                    <Image className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {coverFile ? coverFile.name : "Cliquez pour uploader une image (JPG, PNG, max 5 MB)"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file && file.size > 5 * 1024 * 1024) {
                          toast({ title: "Image trop volumineuse", description: "Max 5 MB.", variant: "destructive" });
                          return;
                        }
                        setCoverFile(file);
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="external">Lien externe (optionnel)</Label>
                  <Input id="external" type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://open.spotify.com/..." />
                </div>

                <div className="space-y-3 rounded-xl bg-secondary/50 p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox id="rights" checked={rightsDeclaration} onCheckedChange={(c) => setRightsDeclaration(c === true)} />
                    <Label htmlFor="rights" className="text-sm leading-relaxed">
                      Je déclare être l'auteur ou avoir les droits sur ce morceau. *
                    </Label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="rules" checked={acceptRules} onCheckedChange={(c) => setAcceptRules(c === true)} />
                    <Label htmlFor="rules" className="text-sm leading-relaxed">
                      J'accepte le{" "}
                      <Link to="/contest-rules" className="text-primary hover:underline" target="_blank">
                        règlement du concours
                      </Link>{" "}
                      et les{" "}
                      <Link to="/terms" className="text-primary hover:underline" target="_blank">
                        conditions d'utilisation
                      </Link>. *
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    "Envoi en cours..."
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Soumettre mon morceau
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
};

export default Compete;
