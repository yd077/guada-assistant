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
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .order("role", { ascending: true })
      .limit(1)
      .maybeSingle();
    setRole((data?.role as AppRole) ?? null);
  }

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, user, role, loading, signOut, isAuthenticated: !!user };
}
