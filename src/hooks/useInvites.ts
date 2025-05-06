// src/hooks/useInvites.ts
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Invite } from "@/types/invite";

/* column names from your Supabase table */
const TRIBUTE_ID_COL = "tribute_id";
const POSITION_COL = "position";

export function useInvites(tributeId?: string) {
  const [rawInvites, setRawInvites] = useState<Invite[] | undefined>();
  const [error, setError] = useState<Error | null>(null);

  /* ---------- fetch & subscribe ---------- */
  useEffect(() => {
    if (!tributeId) return;

    supabase
      .from<Invite>("invites")
      .select("*")
      .eq(TRIBUTE_ID_COL, tributeId)
      .order(POSITION_COL, { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error);
        else setRawInvites(data ?? undefined);
      });

    const channel = supabase.channel(`invites:${tributeId}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "invites",
        filter: `${TRIBUTE_ID_COL}=eq.${tributeId}`,
      },
      (payload) => {
        setRawInvites((curr) => {
          if (!curr) return curr;
          const row = payload.new as Invite;
          const next = curr.filter((i) => i.id !== row.id);
          next.push(row); // push; sort later
          return next;
        });
      }
    );

    channel.subscribe();
    return () => channel.unsubscribe();
  }, [tributeId]);

  /* ---------- stable ordered list ---------- */
  const invites = useMemo(() => {
    if (!rawInvites) return undefined;

    return rawInvites.slice().sort((a, b) =>
      a.role === b.role
        ? a.position - b.position // same role → by position
        : a.role === "organizer"
          ? -1 // organizer always first
          : 1
    );
  }, [rawInvites]);

  return { invites, error };
}
