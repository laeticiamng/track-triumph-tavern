import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { User, Music, LogOut, Edit2, Save } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [submissions, setSubmissions] = useState<Tables<"submissions">[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
      }
    });

    supabase.from("submissions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      setSubmissions(data || []);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName.trim(),
      bio: bio.trim() || null,
    }).eq("id", user.id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profil mis à jour ✓" });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) return null;

  const statusColor = {
    pending: "bg-warning/10 text-warning",
    approved: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Mon Profil</h1>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Déconnexion
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <User className="h-5 w-5" /> Informations
            </CardTitle>
            {!editing && (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Edit2 className="mr-1 h-3.5 w-3.5" /> Modifier
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm">{user.email}</p>
            </div>
            {editing ? (
              <>
                <div className="space-y-2">
                  <Label>Nom d'artiste</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    <Save className="mr-1 h-3.5 w-3.5" /> {saving ? "..." : "Enregistrer"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Annuler</Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">Nom d'artiste</Label>
                  <p className="text-sm">{profile?.display_name || "Non défini"}</p>
                </div>
                {profile?.bio && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Bio</Label>
                    <p className="text-sm">{profile.bio}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Music className="h-5 w-5" /> Mes Soumissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Aucune soumission pour le moment.</p>
                <Button asChild>
                  <Link to="/compete">Soumettre un morceau</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/submissions/${sub.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <img src={sub.cover_image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sub.title}</p>
                      <p className="text-xs text-muted-foreground">{sub.artist_name}</p>
                    </div>
                    <Badge variant="outline" className={statusColor[sub.status]}>
                      {sub.status === "pending" ? "En attente" : sub.status === "approved" ? "Approuvé" : "Rejeté"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
};

export default Profile;
