import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AlertTriangle, Download, Search, ShieldAlert, Users, Globe, Music, Loader2,
  Shield, Clock, Zap,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Week = Tables<"weeks">;

interface ScanResults {
  suspicious_users: { user_id: string; display_name: string; vote_count: number; flags: string[] }[];
  suspicious_ips: { ip: string; distinct_users: number; vote_count: number }[];
  suspicious_submissions: { submission_id: string; title: string; artist_name: string; ip_vote_ratio: number; flags: string[] }[];
  summary: { total_votes: number; flagged_votes: number; flagged_users: number; flagged_ips: number; invalidated: number; mode: string };
}

function maskIp(ip: string) {
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.xxx.xxx`;
  return ip.replace(/:[\da-f]+$/i, ":xxxx");
}

function maskUserId(id: string) {
  return id.substring(0, 8) + "…";
}

export function FraudMonitoring({ weeks }: { weeks: Week[] }) {
  const { t } = useTranslation();
  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [invalidating, setInvalidating] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const FLAG_LABELS: Record<string, string> = {
    burst: t("fraud.flagBurst"),
    new_account: t("fraud.flagNewAccount"),
    ip_cluster: t("fraud.flagIpCluster"),
    ip_concentration: t("fraud.flagIpConcentration"),
  };

  const runScan = async (invalidate = false) => {
    if (!selectedWeekId) return;
    if (invalidate) { setInvalidating(true); } else { setScanning(true); }
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("fraud-scan", {
        body: { week_id: selectedWeekId, invalidate, dry_run: !invalidate },
      });
      if (fnError) throw fnError;
      setResults(data as ScanResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("fraud.scanError"));
    } finally {
      setScanning(false);
      setInvalidating(false);
    }
  };

  const exportScanCSV = () => {
    if (!results) return;
    const rows = results.suspicious_users.map((u) => ({
      user_id: maskUserId(u.user_id),
      display_name: u.display_name,
      vote_count: u.vote_count,
      flags: u.flags.join("; "),
    }));
    downloadCSV(rows, "fraud-scan-results");
  };

  const exportEventsCSV = async () => {
    if (!selectedWeekId) return;
    const { data: votes } = await supabase.from("votes").select("id").eq("week_id", selectedWeekId);
    if (!votes || votes.length === 0) return;
    const voteIds = votes.map((v) => v.id);
    const { data: events } = await supabase
      .from("vote_events")
      .select("id, vote_id, user_id, event_type, ip_address, user_agent, created_at")
      .in("vote_id", voteIds.slice(0, 100));
    if (!events || events.length === 0) return;
    const masked = events.map((e) => ({
      ...e,
      ip_address: e.ip_address ? maskIp(String(e.ip_address)) : "",
      user_id: maskUserId(e.user_id),
    }));
    downloadCSV(masked, "vote-events");
  };

  const downloadCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" /> {t("fraud.title")}
        </h2>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> {t("fraud.rulesTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{t("fraud.ruleRateLimit")}</p>
                <p className="text-xs text-muted-foreground">{t("fraud.ruleRateLimitDesc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <Globe className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{t("fraud.ruleIP")}</p>
                <p className="text-xs text-muted-foreground">{t("fraud.ruleIPDesc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{t("fraud.rulePattern")}</p>
                <p className="text-xs text-muted-foreground">{t("fraud.rulePatternDesc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <Users className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{t("fraud.ruleNewAccount")}</p>
                <p className="text-xs text-muted-foreground">{t("fraud.ruleNewAccountDesc")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("fraud.launchScan")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("admin.week")}</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedWeekId}
              onChange={(e) => { setSelectedWeekId(e.target.value); setResults(null); }}
            >
              <option value="">{t("fraud.selectWeek")}</option>
              {weeks.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title || t("fraud.weekLabel", { number: w.week_number })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => runScan(false)} disabled={!selectedWeekId || scanning || invalidating}>
              {scanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {t("fraud.analyzeDryRun")}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!selectedWeekId || scanning || invalidating || !results || results.summary.flagged_votes === 0}>
                  {invalidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                  {t("fraud.invalidateSuspects")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("fraud.confirmInvalidation")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("fraud.confirmInvalidationDesc", { count: results?.summary.flagged_votes || 0 })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("fraud.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => runScan(true)}>
                    {t("fraud.confirmBtn")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {results && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold font-display">{results.summary.total_votes}</p>
                <p className="text-xs text-muted-foreground">{t("fraud.totalVotes")}</p>
              </CardContent>
            </Card>
            <Card className={results.summary.flagged_votes > 0 ? "border-destructive/30" : ""}>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold font-display text-destructive">{results.summary.flagged_votes}</p>
                <p className="text-xs text-muted-foreground">{t("fraud.flaggedVotes")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold font-display">{results.summary.flagged_users}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="h-3 w-3" /> {t("fraud.suspiciousUsers")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold font-display">{results.summary.flagged_ips}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Globe className="h-3 w-3" /> {t("fraud.suspiciousIPs")}
                </p>
              </CardContent>
            </Card>
          </div>

          {results.summary.invalidated > 0 && (
            <Card className="border-primary/30">
              <CardContent className="py-3 text-center text-sm text-primary font-medium">
                {t("fraud.invalidatedSuccess", { count: results.summary.invalidated })}
              </CardContent>
            </Card>
          )}

          {results.suspicious_users.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" /> {t("fraud.topSuspiciousUsers", { count: results.suspicious_users.length })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("fraud.userId")}</TableHead>
                      <TableHead>{t("fraud.name")}</TableHead>
                      <TableHead>{t("fraud.votes")}</TableHead>
                      <TableHead>{t("fraud.flags")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.suspicious_users.map((u) => (
                      <TableRow key={u.user_id}>
                        <TableCell className="font-mono text-xs">{maskUserId(u.user_id)}</TableCell>
                        <TableCell>{u.display_name}</TableCell>
                        <TableCell>{u.vote_count}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {u.flags.map((f) => (
                              <Badge key={f} variant="outline" className="text-xs">
                                {FLAG_LABELS[f] || f}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {results.suspicious_ips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" /> {t("fraud.topSuspiciousIPs", { count: results.suspicious_ips.length })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("fraud.ipMasked")}</TableHead>
                      <TableHead>{t("fraud.distinctUsers")}</TableHead>
                      <TableHead>{t("fraud.votes")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.suspicious_ips.map((ip) => (
                      <TableRow key={ip.ip}>
                        <TableCell className="font-mono text-xs">{maskIp(ip.ip)}</TableCell>
                        <TableCell>{ip.distinct_users}</TableCell>
                        <TableCell>{ip.vote_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {results.suspicious_submissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Music className="h-4 w-4" /> {t("fraud.suspiciousSubmissions", { count: results.suspicious_submissions.length })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("fraud.trackTitle")}</TableHead>
                      <TableHead>{t("fraud.artist")}</TableHead>
                      <TableHead>{t("fraud.ipConcentration")}</TableHead>
                      <TableHead>{t("fraud.flags")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.suspicious_submissions.map((s) => (
                      <TableRow key={s.submission_id}>
                        <TableCell className="font-medium">{s.title}</TableCell>
                        <TableCell>{s.artist_name}</TableCell>
                        <TableCell>{s.ip_vote_ratio}%</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {s.flags.map((f) => (
                              <Badge key={f} variant="outline" className="text-xs">
                                {FLAG_LABELS[f] || f}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {results.suspicious_users.length === 0 && results.suspicious_ips.length === 0 && results.suspicious_submissions.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {t("fraud.noSuspiciousActivity")}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={exportEventsCSV} disabled={!selectedWeekId}>
              <Download className="mr-1 h-3.5 w-3.5" /> {t("fraud.exportEvents")}
            </Button>
            <Button variant="outline" size="sm" onClick={exportScanCSV} disabled={!results}>
              <Download className="mr-1 h-3.5 w-3.5" /> {t("fraud.exportScanResults")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
