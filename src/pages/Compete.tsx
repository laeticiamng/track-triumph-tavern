import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Music, Image, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Category = Tables<"categories">;

const Compete = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeWeek, setActiveWeek] = useState<{ id: string; title: string | null } | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?tab=signup");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    });

    supabase
      .from("weeks")
      .select("id, title")
      .eq("is_active", true)
      .single()
      .then(({ data }) => {
        if (data) setActiveWeek(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeWeek) return;

    if (!title.trim() || !artistName.trim() || !categoryId || !audioFile || !coverFile) {
      toast({ title: "Champs requis", description: "Remplissez tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    if (!rightsDeclaration || !acceptRules) {
      toast({ title: "Déclarations requises", description: "Vous devez accepter les conditions.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Upload audio
      const audioPath = `${user.id}/${Date.now()}-${audioFile.name}`;
      const { error: audioError } = await supabase.storage
        .from("audio-excerpts")
        .upload(audioPath, audioFile);
      if (audioError) throw audioError;

      const { data: audioUrl } = supabase.storage.from("audio-excerpts").getPublicUrl(audioPath);

      // Upload cover
      const coverPath = `${user.id}/${Date.now()}-${coverFile.name}`;
      const { error: coverError } = await supabase.storage
        .from("cover-images")
        .upload(coverPath, coverFile);
      if (coverError) throw coverError;

      const { data: coverUrl } = supabase.storage.from("cover-images").getPublicUrl(coverPath);

      // Insert submission
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
        rights_declaration: true,
      });

      if (insertError) throw insertError;

      toast({ title: "Soumission envoyée !", description: "Elle sera examinée par l'équipe de modération." });
      navigate("/explore");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast({ title: "Erreur", description: err.message || "Erreur lors de l'envoi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Soumettre votre morceau</CardTitle>
            <CardDescription>
              {activeWeek
                ? `${activeWeek.title || "Semaine en cours"} — Votre soumission sera examinée avant publication.`
                : "Aucune semaine de soumission active pour le moment."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!activeWeek ? (
              <p className="text-center py-8 text-muted-foreground">
                Les soumissions ne sont pas ouvertes actuellement. Revenez bientôt !
              </p>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre morceau..." rows={3} maxLength={500} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                  <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="rap, français, chill" maxLength={200} />
                </div>

                {/* Audio upload */}
                <div className="space-y-2">
                  <Label>Extrait audio (30-60s) *</Label>
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-accent/30">
                    <Music className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {audioFile ? audioFile.name : "Cliquez pour uploader un fichier audio (MP3, WAV)"}
                    </span>
                    <input
                      type="file"
                      accept="audio/mp3,audio/wav,audio/mpeg"
                      className="hidden"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                {/* Cover upload */}
                <div className="space-y-2">
                  <Label>Image de couverture *</Label>
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-accent/30">
                    <Image className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {coverFile ? coverFile.name : "Cliquez pour uploader une image (JPG, PNG)"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
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
