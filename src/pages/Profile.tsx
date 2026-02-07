import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
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
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { User, Music, LogOut, Edit2, Save, Crown, Star, CreditCard, BarChart3, Heart } from "lucide-react";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription-tiers";
import type { Tables } from "@/integrations/supabase/types";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { tier, subscribed, subscriptionEnd, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [submissions, setSubmissions] = useState<Tables<"submissions">[]>([]);
  const [voteCount, setVoteCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Show success toast after checkout
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast({ title: "Abonnement activé ! 🎉", description: "Bienvenue dans votre nouveau plan." });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("submissions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("votes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([{ data: prof }, { data: subs }, { count }]) => {
      if (prof) {
        setProfile(prof);
        setDisplayName(prof.display_name || "");
        setBio(prof.bio || "");
      }
      setSubmissions(subs || []);
      setVoteCount(count || 0);
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

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      const result = typeof data === "string" ? JSON.parse(data) : data;
      if (result.url) {
        window.location.href = result.url;
      } else if (result.error) {
        toast({ title: "Erreur", description: result.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ouvrir le portail.", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) return null;

  const currentPlan = SUBSCRIPTION_TIERS[tier];
  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    approved: "bg-green-500/10 text-green-500",
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

        {/* Subscription Card */}
        <Card className="mb-8 border-primary/20">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-display text-xl flex items-center gap-2">
              {tier === "elite" ? <Crown className="h-5 w-5 text-primary" /> :
               tier === "pro" ? <Star className="h-5 w-5 text-primary" /> :
               <CreditCard className="h-5 w-5" />}
              Plan {currentPlan.name}
            </CardTitle>
            {subscribed ? (
              <Badge className="bg-green-600 text-white">Actif</Badge>
            ) : (
              <Badge variant="secondary">Gratuit</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {subscriptionEnd && (
              <p className="text-sm text-muted-foreground">
                Prochain renouvellement : {new Date(subscriptionEnd).toLocaleDateString("fr-FR")}
              </p>
            )}
            <div className="flex gap-2">
              {subscribed ? (
                <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={portalLoading}>
                  {portalLoading ? "..." : "Gérer l'abonnement"}
                </Button>
              ) : (
                <Button size="sm" asChild>
                  <Link to="/pricing">Voir les plans Pro & Elite</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <p className="font-display text-2xl font-bold">{submissions.length}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Music className="h-3 w-3" /> Soumissions</p>
          </Card>
          <Card className="text-center p-4">
            <p className="font-display text-2xl font-bold">{voteCount}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Heart className="h-3 w-3" /> Votes donnés</p>
          </Card>
          <Card className="text-center p-4">
            <p className="font-display text-2xl font-bold">
              {submissions.reduce((sum, s) => sum + s.vote_count, 0)}
            </p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><BarChart3 className="h-3 w-3" /> Votes reçus</p>
          </Card>
        </div>

        {/* Profile Info */}
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

        {/* Submissions */}
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
                {currentPlan.limits.can_submit ? (
                  <Button asChild><Link to="/compete">Soumettre un morceau</Link></Button>
                ) : (
                  <Button asChild variant="outline"><Link to="/pricing">Passer à Pro pour soumettre</Link></Button>
                )}
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
                      <p className="text-xs text-muted-foreground">{sub.artist_name} · {sub.vote_count} votes</p>
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
