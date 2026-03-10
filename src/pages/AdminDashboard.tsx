import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield, Check, X, Calendar, Trophy, DollarSign,
  Download, Clock, Plus, Trash2, Lock, Loader2
} from "lucide-react";
import { FraudMonitoring } from "@/components/admin/FraudMonitoring";
import { AnalyticsTab } from "@/components/admin/AnalyticsTab";
import type { Tables } from "@/integrations/supabase/types";

type Submission = Tables<"submissions">;
type Week = Tables<"weeks">;
type RewardPool = Tables<"reward_pools">;

interface Sponsor {
  name: string;
  url: string;
}

const pathTabMap: Record<string, string> = {
  "/admin/fraud": "fraud",
  "/admin/weeks": "weeks",
  "/admin/rewards": "rewards",
  "/admin/moderation": "moderation",
  "/admin/analytics": "analytics",
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const defaultTab = pathTabMap[location.pathname] || "moderation";

  const [weeks, setWeeks] = useState<Week[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [rewardPools, setRewardPools] = useState<RewardPool[]>([]);
  const [voteStats, setVoteStats] = useState<{ total: number; suspicious: number }>({ total: 0, suspicious: 0 });
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Reward pool form
  const [rpWeekId, setRpWeekId] = useState("");
  const [rpMinimum, setRpMinimum] = useState("");
  const [rpCurrent, setRpCurrent] = useState("");
  const [rpTop1, setRpTop1] = useState("");
  const [rpTop2, setRpTop2] = useState("");
  const [rpTop3, setRpTop3] = useState("");
  const [rpFallback, setRpFallback] = useState("");
  const [rpSponsors, setRpSponsors] = useState<Sponsor[]>([]);
  const [rpSaving, setRpSaving] = useState(false);

  // Week creation form
  const [newWeekTitle, setNewWeekTitle] = useState("");
  const [newWeekNumber, setNewWeekNumber] = useState("");
  const [newWeekSubOpen, setNewWeekSubOpen] = useState("");
  const [newWeekSubClose, setNewWeekSubClose] = useState("");
  const [newWeekVoteOpen, setNewWeekVoteOpen] = useState("");
  const [newWeekVoteClose, setNewWeekVoteClose] = useState("");
  const [creatingWeek, setCreatingWeek] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
    if (user) {
      Promise.resolve(supabase.from("user_roles").select("role").eq("user_id", user.id)).then(({ data }) => {
        const roles = data?.map((r) => r.role) || [];
        if (roles.includes("admin")) {
          setIsAdmin(true);
          loadData();
        } else {
          navigate("/");
        }
      }).catch(() => {});
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: w }, { data: s }, { data: rp }, { count: totalV }, { count: suspV }] = await Promise.all([
        supabase.from("weeks").select("*").order("week_number", { ascending: false }),
        supabase.from("submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("reward_pools").select("*"),
        supabase.from("votes").select("id", { count: "exact", head: true }),
        supabase.from("votes").select("id", { count: "exact", head: true }).eq("is_valid", false),
      ]);

      setWeeks(w || []);
      setSubmissions(s || []);
      setRewardPools(rp || []);
      setVoteStats({ total: totalV || 0, suspicious: suspV || 0 });
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rpWeekId) return;
    const existing = rewardPools.find((rp) => rp.week_id === rpWeekId);
    if (existing) {
      setRpMinimum(String(existing.minimum_cents / 100));
      setRpCurrent(String(existing.current_cents / 100));
      setRpTop1(String(existing.top1_amount_cents / 100));
      setRpTop2(String(existing.top2_amount_cents / 100));
      setRpTop3(String(existing.top3_amount_cents / 100));
      setRpFallback(existing.fallback_label || "");
      setRpSponsors(Array.isArray(existing.sponsors) ? (existing.sponsors as unknown as Sponsor[]) : []);
    } else {
      setRpMinimum(""); setRpCurrent(""); setRpTop1(""); setRpTop2(""); setRpTop3("");
      setRpFallback(""); setRpSponsors([]);
    }
  }, [rpWeekId, rewardPools]);

  const updateSubmissionStatus = async (id: string, status: "approved" | "rejected", reason?: string) => {
    const update: Record<string, string> = { status };
    if (reason) update.rejection_reason = reason;
    const { error } = await supabase.from("submissions").update(update).eq("id", id);
    if (error) {
      toast({ title: t("admin.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: status === "approved" ? t("admin.approved") : t("admin.rejected") });
      supabase.functions.invoke("notify-status-change", {
        body: { submission_id: id, new_status: status, reason },
      }).catch((err) => console.error("Notification error:", err));
      loadData();
    }
  };

  const publishResults = async (weekId: string) => {
    const { data, error } = await supabase.functions.invoke("publish-results", {
      body: { week_id: weekId },
    });
    if (error) {
      toast({ title: t("admin.error"), description: t("admin.publishError"), variant: "destructive" });
    } else {
      toast({ title: t("admin.publishSuccess", { count: data?.winners_count || 0, mode: data?.reward_mode }) });
      loadData();
    }
  };

  const saveRewardPool = async () => {
    if (!rpWeekId) return;
    setRpSaving(true);
    const { error } = await supabase.functions.invoke("update-reward-pool", {
      body: {
        action: "update_pool",
        week_id: rpWeekId,
        minimum_cents: parseInt(rpMinimum || "0") * 100,
        current_cents: parseInt(rpCurrent || "0") * 100,
        top1_amount_cents: parseInt(rpTop1 || "0") * 100,
        top2_amount_cents: parseInt(rpTop2 || "0") * 100,
        top3_amount_cents: parseInt(rpTop3 || "0") * 100,
        fallback_label: rpFallback || t("admin.fallbackPlaceholder"),
        sponsors: rpSponsors,
      },
    });
    if (error) {
      toast({ title: t("admin.error"), description: t("admin.saveError"), variant: "destructive" });
    } else {
      toast({ title: t("admin.poolUpdated") });
      loadData();
    }
    setRpSaving(false);
  };

  const createWeek = async () => {
    setCreatingWeek(true);
    const { data: season } = await supabase.from("seasons").select("id").eq("is_active", true).maybeSingle();
    if (!season) {
      toast({ title: t("admin.error"), description: t("admin.noActiveSeason"), variant: "destructive" });
      setCreatingWeek(false);
      return;
    }
    const { error } = await supabase.from("weeks").insert({
      season_id: season.id,
      week_number: parseInt(newWeekNumber),
      title: newWeekTitle || null,
      submission_open_at: new Date(newWeekSubOpen).toISOString(),
      submission_close_at: new Date(newWeekSubClose).toISOString(),
      voting_open_at: new Date(newWeekVoteOpen).toISOString(),
      voting_close_at: new Date(newWeekVoteClose).toISOString(),
      is_active: false,
    });
    if (error) {
      toast({ title: t("admin.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("admin.weekCreated") });
      setNewWeekTitle(""); setNewWeekNumber(""); setNewWeekSubOpen(""); setNewWeekSubClose("");
      setNewWeekVoteOpen(""); setNewWeekVoteClose("");
      loadData();
    }
    setCreatingWeek(false);
  };

  const activateWeek = async (weekId: string) => {
    await supabase.from("weeks").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    const { error } = await supabase.from("weeks").update({ is_active: true }).eq("id", weekId);
    if (error) {
      toast({ title: t("admin.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("admin.weekActivated") });
      loadData();
    }
  };

  const lockPool = async (poolId: string) => {
    const { error } = await supabase.from("reward_pools").update({ status: "locked" }).eq("id", poolId);
    if (error) {
      toast({ title: t("admin.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("admin.poolLocked") });
      loadData();
    }
  };

  const addSponsor = () => setRpSponsors([...rpSponsors, { name: "", url: "" }]);
  const removeSponsor = (i: number) => setRpSponsors(rpSponsors.filter((_, idx) => idx !== i));
  const updateSponsor = (i: number, field: "name" | "url", val: string) => {
    const copy = [...rpSponsors];
    copy[i] = { ...copy[i], [field]: val };
    setRpSponsors(copy);
  };

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((r) => Object.values(r).map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || !isAdmin) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const pending = submissions.filter((s) => s.status === "pending");

  const getPoolStatusColor = (status: string) => {
    switch (status) {
      case "active": case "threshold_met": return "bg-green-600 text-white";
      case "locked": return "bg-primary text-primary-foreground";
      case "pending": return "bg-yellow-600 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Layout>
      <SEOHead title={t("admin.seoTitle")} description={t("admin.seoDesc")} url="/admin" />
      <div className="container py-6 sm:py-8 px-4 sm:px-6">
        <div className="mb-6 sm:mb-8 flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{t("admin.dashboard")}</h1>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card><CardContent className="py-4 text-center">
            <p className="text-2xl font-bold font-display">{submissions.length}</p>
            <p className="text-xs text-muted-foreground">{t("admin.submissions")}</p>
          </CardContent></Card>
          <Card><CardContent className="py-4 text-center">
            <p className="text-2xl font-bold font-display text-yellow-500">{pending.length}</p>
            <p className="text-xs text-muted-foreground">{t("admin.pending")}</p>
          </CardContent></Card>
          <Card><CardContent className="py-4 text-center">
            <p className="text-2xl font-bold font-display">{voteStats.total}</p>
            <p className="text-xs text-muted-foreground">{t("admin.totalVotes")}</p>
          </CardContent></Card>
          <Card><CardContent className="py-4 text-center">
            <p className="text-2xl font-bold font-display text-destructive">{voteStats.suspicious}</p>
            <p className="text-xs text-muted-foreground">{t("admin.suspiciousVotes")}</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto scrollbar-hide">
            <TabsTrigger value="moderation" className="flex-1 min-w-0 text-xs sm:text-sm whitespace-nowrap">{t("admin.tabModeration")}</TabsTrigger>
            <TabsTrigger value="weeks" className="flex-1 min-w-0 text-xs sm:text-sm whitespace-nowrap">{t("admin.tabWeeks")}</TabsTrigger>
            <TabsTrigger value="rewards" className="flex-1 min-w-0 text-xs sm:text-sm whitespace-nowrap">{t("admin.tabRewards")}</TabsTrigger>
            <TabsTrigger value="fraud" className="flex-1 min-w-0 text-xs sm:text-sm whitespace-nowrap">{t("admin.tabFraud")}</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 min-w-0 text-xs sm:text-sm whitespace-nowrap">{t("admin.tabAnalytics")}</TabsTrigger>
          </TabsList>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">{t("admin.pendingCount", { count: pending.length })}</h2>
              <Button variant="outline" size="sm" onClick={() => exportCSV(submissions, "submissions")}>
                <Download className="mr-1 h-3.5 w-3.5" /> {t("admin.exportCSV")}
              </Button>
            </div>
            {pending.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">{t("admin.noPending")}</p>
            ) : (
              <div className="space-y-3">
                {pending.map((sub) => (
                  <Card key={sub.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <img src={sub.cover_image_url} alt={t("admin.coverAlt", { title: sub.title })} className="h-16 w-16 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{sub.title}</h3>
                          <p className="text-sm text-muted-foreground">{sub.artist_name}</p>
                          <div className="mt-2">
                            <AudioPlayer src={sub.audio_excerpt_url} compact />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateSubmissionStatus(sub.id, "approved")}>
                            <Check className="mr-1 h-3.5 w-3.5" /> {t("admin.approve")}
                          </Button>
                          <div className="flex gap-1">
                            <Input
                              placeholder={t("admin.rejectPlaceholder")}
                              className="h-9 text-xs"
                              value={rejectReasons[sub.id] || ""}
                              onChange={(e) => setRejectReasons({ ...rejectReasons, [sub.id]: e.target.value })}
                            />
                            <Button size="sm" variant="destructive" onClick={() => updateSubmissionStatus(sub.id, "rejected", rejectReasons[sub.id])}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Weeks Tab */}
          <TabsContent value="weeks" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">{t("admin.weekManagement")}</h2>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("admin.createWeek")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.weekTitle")}</Label>
                    <Input value={newWeekTitle} onChange={(e) => setNewWeekTitle(e.target.value)} placeholder={t("admin.weekTitlePlaceholder")} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.weekNumber")}</Label>
                    <Input type="number" value={newWeekNumber} onChange={(e) => setNewWeekNumber(e.target.value)} placeholder="2" min="1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.subOpen")}</Label>
                    <Input type="datetime-local" value={newWeekSubOpen} onChange={(e) => setNewWeekSubOpen(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.subClose")}</Label>
                    <Input type="datetime-local" value={newWeekSubClose} onChange={(e) => setNewWeekSubClose(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.voteOpen")}</Label>
                    <Input type="datetime-local" value={newWeekVoteOpen} onChange={(e) => setNewWeekVoteOpen(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.voteClose")}</Label>
                    <Input type="datetime-local" value={newWeekVoteClose} onChange={(e) => setNewWeekVoteClose(e.target.value)} />
                  </div>
                </div>
                <Button onClick={createWeek} disabled={creatingWeek || !newWeekNumber || !newWeekSubOpen || !newWeekSubClose || !newWeekVoteOpen || !newWeekVoteClose}>
                  {creatingWeek ? t("admin.creating") : <><Plus className="mr-1 h-3.5 w-3.5" /> {t("admin.createWeekBtn")}</>}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {weeks.map((w) => (
                <Card key={w.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">{w.title || t("admin.weekLabel", { number: w.week_number })}</h3>
                          {w.is_active && <Badge className="bg-green-600 text-white">{t("admin.active")}</Badge>}
                          {w.results_published_at && <Badge variant="secondary">{t("admin.resultsPublished")}</Badge>}
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {t("admin.submissionsLabel")}: {new Date(w.submission_open_at).toLocaleDateString()} → {new Date(w.submission_close_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t("admin.votesLabel")}: {new Date(w.voting_open_at).toLocaleDateString()} → {new Date(w.voting_close_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!w.is_active && (
                          <Button size="sm" variant="outline" onClick={() => activateWeek(w.id)}>
                            {t("admin.activate")}
                          </Button>
                        )}
                        {w.is_active && !w.results_published_at && (
                          <Button size="sm" onClick={() => publishResults(w.id)}>
                            <Trophy className="mr-1 h-3.5 w-3.5" /> {t("admin.publishResults")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Récompenses Tab */}
          <TabsContent value="rewards" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">{t("admin.rewardPool")}</h2>

            {rewardPools.map((rp) => (
              <Card key={rp.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPoolStatusColor(rp.status)}>
                          {rp.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {weeks.find((w) => w.id === rp.week_id)?.title || ""}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t("admin.budget")}: {rp.current_cents / 100}€ / {t("admin.threshold")}: {rp.minimum_cents / 100}€
                      </p>
                      <p className="text-xs text-muted-foreground">
                        🥇 {rp.top1_amount_cents / 100}€ · 🥈 {rp.top2_amount_cents / 100}€ · 🥉 {rp.top3_amount_cents / 100}€
                      </p>
                      {Array.isArray(rp.sponsors) && (rp.sponsors as unknown as Sponsor[]).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("admin.sponsors")}: {(rp.sponsors as unknown as Sponsor[]).map((s) => s.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {rp.status === "active" && (
                        <Button size="sm" variant="outline" onClick={() => lockPool(rp.id)}>
                          <Lock className="mr-1 h-3.5 w-3.5" /> {t("admin.lock")}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("admin.configurePool")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("admin.week")}</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={rpWeekId}
                    onChange={(e) => setRpWeekId(e.target.value)}
                  >
                    <option value="">{t("admin.selectWeek")}</option>
                    {weeks.map((w) => (
                      <option key={w.id} value={w.id}>{w.title || t("admin.weekLabel", { number: w.week_number })}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.currentBudget")}</Label>
                    <Input type="number" value={rpCurrent} onChange={(e) => setRpCurrent(e.target.value)} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.minimumThreshold")}</Label>
                    <Input type="number" value={rpMinimum} onChange={(e) => setRpMinimum(e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.top1")}</Label>
                    <Input type="number" value={rpTop1} onChange={(e) => setRpTop1(e.target.value)} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.top2")}</Label>
                    <Input type="number" value={rpTop2} onChange={(e) => setRpTop2(e.target.value)} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.top3")}</Label>
                    <Input type="number" value={rpTop3} onChange={(e) => setRpTop3(e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.fallbackLabel")}</Label>
                  <Input value={rpFallback} onChange={(e) => setRpFallback(e.target.value)} placeholder={t("admin.fallbackPlaceholder")} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t("admin.sponsors")}</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSponsor}>
                      <Plus className="mr-1 h-3.5 w-3.5" /> {t("admin.addSponsor")}
                    </Button>
                  </div>
                  {rpSponsors.map((sp, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder={t("admin.sponsorNamePlaceholder")}
                        value={sp.name}
                        onChange={(e) => updateSponsor(i, "name", e.target.value)}
                      />
                      <Input
                        placeholder="https://..."
                        value={sp.url}
                        onChange={(e) => updateSponsor(i, "url", e.target.value)}
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeSponsor(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button onClick={saveRewardPool} disabled={rpSaving || !rpWeekId}>
                  {rpSaving ? t("admin.saving") : t("admin.save")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fraud Tab */}
          <TabsContent value="fraud" className="space-y-4">
            <FraudMonitoring weeks={weeks} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </Layout>
  );
};

export default AdminDashboard;
