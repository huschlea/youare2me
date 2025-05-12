// src/hooks/useInviteStatuses.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Invite } from "@/types/invite";

export function useInviteStatuses(tributeId?: string) {
  const [rows, setRows] = useState<Invite[]>([]);

  useEffect(() => {
    if (!tributeId) return;

    /* 1. initial fetch */
    supabase
      .from<Invite>("invites")
      .select("*") // every column incl. hidden
      .eq("tribute_id", tributeId)
      .order("position", { ascending: true })
      .then(({ data }) => setRows(data ?? []));

    /* 2. realtime subscription */
    const channel = supabase
      .channel(`invites:${tributeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invites",
          filter: `tribute_id=eq.${tributeId}`,
        },
        (payload) => {
          setRows((prev) => {
            const next = [...prev];
            const idx = next.findIndex((r) => r.id === payload.new.id);

            if (payload.eventType === "DELETE") {
              if (idx !== -1) next.splice(idx, 1);
            } else if (idx === -1) {
              next.push(payload.new as Invite); // INSERT
            } else {
              next[idx] = payload.new as Invite; // UPDATE
            }
            return next;
          });
        }
      )
      .subscribe();

    /* 3. clean up on unmount / tributeId change */
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tributeId]);

  return rows;
}
