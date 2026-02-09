import { useState, useEffect } from "react";
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

// GDPR: mask sensitive data
function maskIp(ip: string) {
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.xxx.xxx`;
  return ip.replace(/:[\da-f]+$/i, ":xxxx");
}

function maskUserId(id: string) {
  return id.substring(0, 8) + "…";
}

const FLAG_LABELS: Record<string, string> = {
  burst: "Rafale",
  new_account: "Compte récent",
  ip_cluster: "Cluster IP",
  ip_concentration: "Concentration IP",
};

export function FraudMonitoring({ weeks }: { weeks: Week[] }) {
  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [invalidating, setInvalidating] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runScan = async (invalidate = false) => {
    if (!selectedWeekId) return;
    invalidate ? setInvalidating(true) : setScanning(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("fraud-scan", {
        body: { week_id: selectedWeekId, invalidate, dry_run: !invalidate },
      });
      if (fnError) throw fnError;
      setResults(data as ScanResults);
    } catch (err: any) {
      setError(err.message || "Erreur lors du scan");
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
    // Fetch vote_events for the week via votes
    const { data: votes } = await supabase
      .from("votes")
      .select("id")
      .eq("week_id", selectedWeekId);

    if (!votes || votes.length === 0) return;

    const voteIds = votes.map((v) => v.id);
    const { data: events } = await supabase
      .from("vote_events")
      .select("id, vote_id, user_id, event_type, ip_address, user_agent, created_at")
      .in("vote_id", voteIds.slice(0, 100)); // batch

    if (!events || events.length === 0) return;

    const masked = events.map((e: any) => ({
      ...e,
      ip_address: e.ip_address ? maskIp(String(e.ip_address)) : "",
      user_id: maskUserId(e.user_id),
    }));
    downloadCSV(masked, "vote-events");
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" /> Monitoring Anti-Fraude
        </h2>
      </div>

      {/* Fraud Detection Rules Reference */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Regles de detection actives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Rate limiting</p>
                <p className="text-xs text-muted-foreground">Max 50 votes/heure par utilisateur. 1 vote par track par semaine.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <Globe className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Detection IP</p>
                <p className="text-xs text-muted-foreground">Alerte si &gt;3 comptes distincts votent depuis la meme IP.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Pattern temporel</p>
                <p className="text-xs text-muted-foreground">Detection de rafales : &gt;10 votes en 5 min = flag automatique.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <Users className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Comptes recents</p>
                <p className="text-xs text-muted-foreground">Comptes crees &lt;24h avant le vote sont signales pour review.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Launch scan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lancer un scan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Semaine</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedWeekId}
              onChange={(e) => { setSelectedWeekId(e.target.value); setResults(null); }}
            >
              <option value="">Sélectionner une semaine…</option>
              {weeks.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title || `Semaine ${w.week_number}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => runScan(false)}
              disabled={!selectedWeekId || scanning || invalidating}
            >
              {scanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Analyser (dry run)
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={!selectedWeekId || scanning || invalidating || !results || results.summary.flagged_votes === 0}
                >
                  {invalidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                  Invalider les suspects
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer l'invalidation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action va marquer {results?.summary.flagged_votes || 0} vote(s) comme invalides.
                    Cette opération est irréversible. Continuer ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={() => runScan(true)}>
                    Confirmer l'invalidation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Summary cards */}
      {results && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold font-display">{results.summary.total_votes}</p>
                <p className="text-xs text-muted-foreground">Votes totaux</p>
              </CardContent>
            </Card>
            <Card className={results.summary.flagged_votes > 0 ? "border-destructive/30" : ""}>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold font-display text-destructive">
                  {results.summary.flagged_votes}
                </p>
                <p className="text-xs text-muted-foreground">Votes flaggés</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold font-display">{results.summary.flagged_users}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="h-3 w-3" /> Users suspects
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold font-display">{results.summary.flagged_ips}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Globe className="h-3 w-3" /> IPs suspectes
                </p>
              </CardContent>
            </Card>
          </div>

          {results.summary.invalidated > 0 && (
            <Card className="border-primary/30">
              <CardContent className="py-3 text-center text-sm text-primary font-medium">
                ✓ {results.summary.invalidated} vote(s) invalidé(s) avec succès
              </CardContent>
            </Card>
          )}

          {/* Section 3: Tables */}
          {results.suspicious_users.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" /> Top Users Suspects ({results.suspicious_users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Votes</TableHead>
                      <TableHead>Flags</TableHead>
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
                  <Globe className="h-4 w-4" /> Top IPs Suspectes ({results.suspicious_ips.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP (masquée)</TableHead>
                      <TableHead>Users distincts</TableHead>
                      <TableHead>Votes</TableHead>
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
                  <Music className="h-4 w-4" /> Soumissions Suspectes ({results.suspicious_submissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Artiste</TableHead>
                      <TableHead>Concentration IP</TableHead>
                      <TableHead>Flags</TableHead>
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
                ✓ Aucune activité suspecte détectée pour cette semaine.
              </CardContent>
            </Card>
          )}

          {/* Section 4: Export */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={exportEventsCSV} disabled={!selectedWeekId}>
              <Download className="mr-1 h-3.5 w-3.5" /> Export vote_events (CSV)
            </Button>
            <Button variant="outline" size="sm" onClick={exportScanCSV} disabled={!results}>
              <Download className="mr-1 h-3.5 w-3.5" /> Export résultats scan (CSV)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
