import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { User, Music, LogOut, Edit2, Save, Crown, Star, CreditCard, BarChart3, Heart, Camera, ExternalLink, Plus, X, ImagePlus, Loader2, Trash2, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription-tiers";
import { VoteStatsChart } from "@/components/profile/VoteStatsChart";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { BadgeShowcase } from "@/components/gamification/BadgeShowcase";
import { AIVoteSummary } from "@/components/ai/AIVoteSummary";
import type { Tables } from "@/integrations/supabase/types";
// WelcomeDialog is rendered in Layout.tsx — no need to import here

const SOCIAL_PLATFORMS = ["Instagram", "Spotify", "SoundCloud", "YouTube", "TikTok"];

const Profile = () => {
  const { t, i18n } = useTranslation();
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
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const getLocale = () => {
    const lang = i18n.language;
    if (lang.startsWith("de")) return "de-DE";
    if (lang.startsWith("en")) return "en-GB";
    return "fr-FR";
  };

  // Show success toast after checkout
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast({ title: t("profilePage.subscriptionActivated"), description: t("profilePage.welcomeNewPlan") });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/profile");
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
        setSocialLinks((prof.social_links as Record<string, string>) || {});
      }
      setSubmissions(subs || []);
      setVoteCount(count || 0);
    }).catch(() => {});
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t("profilePage.fileTooLarge"), description: t("profilePage.max2mb"), variant: "destructive" });
      return;
    }
    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("cover-images").upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("cover-images").getPublicUrl(path);
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      const { error: updateErr } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
      if (updateErr) throw updateErr;
      setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev);
      toast({ title: t("profilePage.avatarUpdated") });
    } catch (err) {
      toast({ title: t("errors.error"), description: err instanceof Error ? err.message : t("profilePage.uploadError"), variant: "destructive" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("profilePage.fileTooLarge"), description: t("profilePage.max5mb"), variant: "destructive" });
      return;
    }
    setBannerUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/banner.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("cover-images").upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("cover-images").getPublicUrl(path);
      const bannerUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      const { error: updateErr } = await supabase.from("profiles").update({ banner_url: bannerUrl }).eq("id", user.id);
      if (updateErr) throw updateErr;
      setProfile((prev) => prev ? { ...prev, banner_url: bannerUrl } : prev);
      toast({ title: t("profilePage.bannerUpdated") });
    } catch (err) {
      toast({ title: t("errors.error"), description: err instanceof Error ? err.message : t("profilePage.uploadError"), variant: "destructive" });
    } finally {
      setBannerUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const filteredLinks = Object.fromEntries(Object.entries(socialLinks).filter(([, v]) => v.trim()));
    const { error } = await supabase.from("profiles").update({
      display_name: displayName.trim(),
      bio: bio.trim() || null,
      social_links: Object.keys(filteredLinks).length > 0 ? filteredLinks : null,
    }).eq("id", user.id);

    if (error) {
      toast({ title: t("errors.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("profilePage.profileUpdated") });
      setEditing(false);
      setProfile((prev) => prev ? { ...prev, display_name: displayName.trim(), bio: bio.trim() || null, social_links: filteredLinks } : prev);
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
        toast({ title: t("errors.error"), description: result.error, variant: "destructive" });
      }
    } catch {
      toast({ title: t("errors.error"), description: t("pricing.portalError"), variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      const result = typeof data === "string" ? JSON.parse(data) : data;
      if (result.error) throw new Error(result.error);
      await signOut();
      navigate("/");
    } catch (err) {
      toast({
        title: t("errors.error"),
        description: err instanceof Error ? err.message : t("profilePage.deleteError"),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const addSocialLink = (platform: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: "" }));
  };

  const removeSocialLink = (platform: string) => {
    setSocialLinks((prev) => {
      const copy = { ...prev };
      delete copy[platform];
      return copy;
    });
  };

  if (authLoading || !user) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const currentPlan = SUBSCRIPTION_TIERS[tier];
    const canEditProfile = true; // All users can edit basic profile info
    const canEditSocial = tier !== "free"; // Social links require paid plan
  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    approved: "bg-green-500/10 text-green-500",
    rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <Layout>
      <SEOHead title={t("profilePage.seoTitle")} description={t("profilePage.seoDesc")} url="/profile" />
      {/* WelcomeDialog is rendered in Layout.tsx */}
      <div className="container max-w-2xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold">{t("profilePage.title")}</h1>
            {tier === "elite" && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 gap-1">
                <Crown className="h-3 w-3" /> Elite
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> {t("profilePage.logout")}
          </Button>
        </div>

        {/* Subscription Card */}
        <Card className="mb-8 card-elevated border-primary/20">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-display text-xl flex items-center gap-2">
              {tier === "elite" ? <Crown className="h-5 w-5 text-yellow-500" /> :
               tier === "pro" ? <Star className="h-5 w-5 text-primary" /> :
               <CreditCard className="h-5 w-5" />}
              Plan {currentPlan.name}
              {subscribed && <span className="text-sm font-normal text-muted-foreground">— {currentPlan.price}€/{t("pricing.perMonth").replace("/", "")}</span>}
            </CardTitle>
            {subscribed ? (
              <Badge className="bg-green-600 text-white">{t("profilePage.active")}</Badge>
            ) : (
              <Badge variant="secondary">{t("profilePage.freeLabel")}</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {subscriptionEnd && (
              <p className="text-sm text-muted-foreground">
                {t("profilePage.nextRenewal")} {new Date(subscriptionEnd).toLocaleDateString(getLocale())}
              </p>
            )}
            <div className="flex gap-2">
              {subscribed ? (
                <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={portalLoading}>
                  {portalLoading ? "..." : t("profilePage.manageSubscription")}
                </Button>
              ) : (
                <Button size="sm" asChild>
                  <Link to="/pricing">{t("profilePage.viewPlans")}</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card className="text-center p-4 card-elevated border-gradient-hover">
            <p className="font-display text-2xl font-bold">{submissions.length}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Music className="h-3 w-3" /> {t("profilePage.submissions")}</p>
          </Card>
          <Card className="text-center p-4 card-elevated border-gradient-hover">
            <p className="font-display text-2xl font-bold">{voteCount}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Heart className="h-3 w-3" /> {t("profilePage.votesGiven")}</p>
          </Card>
          <Card className="text-center p-4 card-elevated border-gradient-hover">
            <p className="font-display text-2xl font-bold">
              {submissions.reduce((sum, s) => sum + s.vote_count, 0)}
            </p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><BarChart3 className="h-3 w-3" /> {t("profilePage.votesReceived")}</p>
          </Card>
        </div>

        {/* Vote Streak */}
        <StreakBadge showRecord />

        {/* Weekly Badges */}
        <div className="mb-8">
          <BadgeShowcase showEmpty />
        </div>

        {/* Stats Chart (Pro/Elite) */}
        {tier !== "free" && (
          <VoteStatsChart userId={user.id} tier={tier} />
        )}

        {/* AI Vote Summary (Pro/Elite) */}
        {tier !== "free" && <AIVoteSummary tier={tier} />}

        {/* Banner Upload (Elite only) */}
        {tier === "elite" && (
          <Card className="mb-8 card-elevated">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <ImagePlus className="h-5 w-5" /> {t("profilePage.profileBanner")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.banner_url ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={profile.banner_url} alt={t("profilePage.profileBanner")} className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" onClick={() => bannerInputRef.current?.click()} disabled={bannerUploading}>
                      <Camera className="mr-1 h-3.5 w-3.5" /> {bannerUploading ? "..." : t("profilePage.changeBanner")}
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={bannerUploading}
                  className="w-full h-32 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-sm">{bannerUploading ? "..." : t("profilePage.addBanner")}</span>
                </button>
              )}
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
              <p className="text-xs text-muted-foreground">{t("profilePage.bannerInfo")}</p>
            </CardContent>
          </Card>
        )}

        {/* Profile Info */}
        <Card className="mb-8 card-elevated">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <User className="h-5 w-5" /> {t("profilePage.info")}
            </CardTitle>
            {!editing && (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Edit2 className="mr-1 h-3.5 w-3.5" /> {t("common.edit")}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-lg font-bold">{(profile?.display_name || "?")[0]}</AvatarFallback>
                </Avatar>
                {true && (
                  <>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                      aria-label={t("profilePage.changeAvatar")}
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </>
                )}
              </div>
              <div>
                <p className="font-medium">{profile?.display_name || t("profilePage.notDefined")}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                {!canEditProfile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <Link to="/pricing" className="text-primary hover:underline">{t("profilePage.upgradeForProfile")}</Link>
                  </p>
                )}
              </div>
            </div>

            {editing ? (
              <>
                <div className="space-y-2">
                  <Label>{t("profilePage.artistName")}</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label>{t("profilePage.bio")}</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500} />
                </div>

                {/* Social Links (Pro/Elite only) */}
                {canEditProfile && (
                  <div className="space-y-2">
                    <Label>{t("profilePage.socialLinks")}</Label>
                    {Object.entries(socialLinks).map(([platform, url]) => (
                      <div key={platform} className="flex items-center gap-2">
                        <span className="text-sm w-24 shrink-0">{platform}</span>
                        <Input
                          value={url}
                          onChange={(e) => setSocialLinks((prev) => ({ ...prev, [platform]: e.target.value }))}
                          placeholder={`https://${platform.toLowerCase()}.com/...`}
                          className="flex-1"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeSocialLink(platform)} className="shrink-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {SOCIAL_PLATFORMS.filter((p) => !(p in socialLinks)).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {SOCIAL_PLATFORMS.filter((p) => !(p in socialLinks)).map((p) => (
                          <Button key={p} variant="outline" size="sm" onClick={() => addSocialLink(p)} className="text-xs">
                            <Plus className="mr-1 h-3 w-3" /> {p}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    <Save className="mr-1 h-3.5 w-3.5" /> {saving ? "..." : t("common.save")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>{t("common.cancel")}</Button>
                </div>
              </>
            ) : (
              <>
                {profile?.bio && (
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("profilePage.bio")}</Label>
                    <p className="text-sm">{profile.bio}</p>
                  </div>
                )}
                {/* Display social links */}
                {profile?.social_links && Object.keys(profile.social_links as Record<string, string>).length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("profilePage.socialLinks")}</Label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Object.entries(profile.social_links as Record<string, string>).map(([platform, url]) => (
                        <Button key={platform} variant="outline" size="sm" asChild>
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-1 h-3 w-3" /> {platform}
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Submissions */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Music className="h-5 w-5" /> {t("profilePage.mySubmissions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">{t("profilePage.noSubmissions")}</p>
                {currentPlan.limits.can_submit ? (
                  <Button asChild><Link to="/compete">{t("profilePage.submitTrack")}</Link></Button>
                ) : (
                  <Button asChild variant="outline"><Link to="/pricing">{t("profilePage.viewPlans")}</Link></Button>
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
                    <img src={sub.cover_image_url} alt={sub.title} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sub.title}</p>
                      <p className="text-xs text-muted-foreground">{sub.artist_name} · {sub.vote_count} {t("stats.votes")}</p>
                    </div>
                    <Badge variant="outline" className={statusColor[sub.status]}>
                      {sub.status === "pending" ? t("profilePage.pending") : sub.status === "approved" ? t("profilePage.approved") : t("profilePage.rejected")}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* GDPR Data Export — Article 20 */}
        <Card className="mt-8 card-elevated">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Download className="h-5 w-5" /> {t("profilePage.exportData")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{t("profilePage.exportDataDesc")}</p>
            <Button
              variant="outline"
              size="sm"
              disabled={exporting}
              onClick={async () => {
                setExporting(true);
                try {
                  const { data, error } = await supabase.functions.invoke("export-data");
                  if (error) throw error;
                  const result = typeof data === "string" ? data : JSON.stringify(data, null, 2);
                  const blob = new Blob([result], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `wma-export-${new Date().toISOString().slice(0, 10)}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast({ title: t("profilePage.exportSuccess"), description: t("profilePage.exportSuccessDesc") });
                } catch {
                  toast({ title: t("errors.error"), description: t("profilePage.exportError"), variant: "destructive" });
                } finally {
                  setExporting(false);
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              {exporting ? "..." : t("profilePage.exportDataBtn")}
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account — GDPR Article 17 */}
        <Card className="mt-8 card-elevated border-destructive/30">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> {t("profilePage.deleteAccount")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{t("profilePage.deleteAccountDesc")}</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={deleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? "..." : t("profilePage.deleteAccountBtn")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("profilePage.deleteConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("profilePage.deleteConfirmDesc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t("profilePage.deleteConfirmBtn")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
};

export default Profile;
