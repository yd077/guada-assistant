import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "client" | "artisan" | "admin";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listener AVANT getSession (évite la race condition)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (!sess?.user) {
        setRole(null);
      } else {
        // Defer DB call to éviter les deadlocks dans le callback
        setTimeout(() => fetchRole(sess.user.id), 0);
      }
    });

    // 2. Récupère la session existante
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchRole(data.session.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function fetchRole(userId: string) {
    const priority: Record<AppRole, number> = { client: 1, artisan: 2, admin: 3 };

    // 1. Lecture directe (RLS : l'utilisateur voit ses propres rôles)
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const roles = (data ?? [])
      .map((r) => r.role as AppRole)
      .filter((r) => !!r && r in priority)
      .sort((a, b) => priority[b] - priority[a]);

    if (roles.length > 0) {
      setRole(roles[0]);
      return;
    }

    // 2. Repli serveur si les policies bloquent la lecture
    try {
      const { getMyRole } = await import("@/lib/roles.functions");
      const res = await getMyRole();
      setRole((res?.role as AppRole) ?? null);
    } catch {
      setRole(null);
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, user, role, loading, signOut, isAuthenticated: !!user };
}
