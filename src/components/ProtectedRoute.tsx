import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, user must have this role in user_roles table */
  requiredRole?: AppRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  // Mémorise pour quel utilisateur et quel rôle la vérification a été faite,
  // afin de revérifier si l'utilisateur ou le rôle exigé change.
  const [roleCheck, setRoleCheck] = useState<{ key: string; ok: boolean } | null>(null);
  const checkKey = user && requiredRole ? `${user.id}:${requiredRole}` : null;

  useEffect(() => {
    if (!requiredRole || !user) return;
    let cancelled = false;
    const key = `${user.id}:${requiredRole}`;

    // PostgREST ne rejette pas la promesse en cas d'erreur : elle est renvoyée
    // dans `error`. On refuse l'accès (ok = false) dans tous les cas d'échec.
    Promise.resolve(
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    )
      .then(({ data, error }) => {
        if (error) {
          logger.warn("ProtectedRoute", `Role lookup failed for user ${user.id}`);
        }
        const roles = data?.map((r) => r.role) ?? [];
        const ok = roles.includes(requiredRole);
        if (!ok && !error) {
          logger.warn("ProtectedRoute", `User ${user.id} lacks role "${requiredRole}"`);
        }
        if (!cancelled) setRoleCheck({ key, ok });
      })
      .catch(() => {
        if (!cancelled) setRoleCheck({ key, ok: false });
      });

    return () => {
      cancelled = true;
    };
  }, [user, requiredRole]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Le visiteur non connecté est redirigé vers /auth, y compris sur une route
  // à rôle (auparavant il restait bloqué sur le chargement indéfiniment).
  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requiredRole) {
    if (!roleCheck || roleCheck.key !== checkKey) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    if (!roleCheck.ok) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
