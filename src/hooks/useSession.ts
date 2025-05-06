import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

/**
 * Lightweight replacement for the old helper hook.
 * Returns `null` for anonymous visitors or the live Session object when logged-in.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // initial fetch
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    // subscribe to future auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) =>
      setSession(newSession)
    );

    return () => subscription.unsubscribe();
  }, []);

  return session;
}
