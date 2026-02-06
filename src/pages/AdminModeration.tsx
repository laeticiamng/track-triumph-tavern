import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/Layout";
import { Footer } from "@/components/layout/Footer";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Shield, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Submission = Tables<"submissions">;

const AdminModeration = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .then(({ data }) => {
          const roles = data?.map((r) => r.role) || [];
          if (roles.includes("admin") || roles.includes("moderator")) {
            setIsAdmin(true);
            loadSubmissions();
          } else {
            navigate("/");
          }
        });
    }
  }, [user, authLoading, navigate]);

  const loadSubmissions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: "approved" | "rejected", reason?: string) => {
    const update: any = { status };
    if (reason) update.rejection_reason = reason;

    const { error } = await supabase.from("submissions").update(update).eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: status === "approved" ? "Approuvée ✓" : "Rejetée" });
      loadSubmissions();
    }
  };

  if (authLoading || !isAdmin) return null;

  const pending = submissions.filter((s) => s.status === "pending");
  const approved = submissions.filter((s) => s.status === "approved");
  const rejected = submissions.filter((s) => s.status === "rejected");

  const statusColor = {
    pending: "bg-warning/10 text-warning border-warning/30",
    approved: "bg-success/10 text-success border-success/30",
    rejected: "bg-destructive/10 text-destructive border-destructive/30",
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl font-bold">Modération</h1>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold font-display text-warning">{pending.length}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold font-display text-success">{approved.length}</p>
              <p className="text-xs text-muted-foreground">Approuvées</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold font-display text-destructive">{rejected.length}</p>
              <p className="text-xs text-muted-foreground">Rejetées</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending list */}
        <h2 className="mb-4 font-display text-xl font-semibold">En attente de modération</h2>
        {loading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : pending.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Aucune soumission en attente.</p>
        ) : (
          <div className="space-y-4">
            {pending.map((sub) => (
              <Card key={sub.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <img
                      src={sub.cover_image_url}
                      alt={sub.title}
                      className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{sub.title}</h3>
                        <Badge variant="outline" className={statusColor[sub.status]}>
                          {sub.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{sub.artist_name}</p>
                      {sub.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{sub.description}</p>
                      )}
                      <div className="mt-3">
                        <AudioPlayer src={sub.audio_excerpt_url} compact />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90 text-success-foreground"
                        onClick={() => updateStatus(sub.id, "approved")}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Approuver
                      </Button>
                      <div className="flex gap-1">
                        <Input
                          placeholder="Motif..."
                          className="h-9 text-xs"
                          value={rejectReasons[sub.id] || ""}
                          onChange={(e) => setRejectReasons({ ...rejectReasons, [sub.id]: e.target.value })}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(sub.id, "rejected", rejectReasons[sub.id])}
                        >
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

        {/* All submissions */}
        <h2 className="mt-10 mb-4 font-display text-xl font-semibold">Toutes les soumissions</h2>
        <div className="space-y-2">
          {submissions.map((sub) => (
            <div key={sub.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <img src={sub.cover_image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{sub.title}</p>
                <p className="text-xs text-muted-foreground">{sub.artist_name}</p>
              </div>
              <Badge variant="outline" className={statusColor[sub.status]}>
                {sub.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default AdminModeration;
