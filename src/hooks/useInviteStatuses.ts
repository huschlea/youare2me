import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface InviteStatus {
  id: string;
  display_name: string;
  sent: boolean;
  attempts: number;
  submitted_at: string | null;
}

/**
 * Subscribe to real-time invite statuses for a tribute.
 * If tributeId is null/undefined, the hook immediately returns the
 * last cached rows (initially []) and does nothing else.
 */
export const useInviteStatuses = (tributeId: string | null | undefined) => {
  const [rows, setRows] = useState<InviteStatus[]>([]);

  /* ── initial fetch ── */
  useEffect(() => {
    if (!tributeId) return; // guard: nothing to do yet

    supabase
      .from("invite_status_v")
      .select("*")
      .eq("tribute_id", tributeId)
      .order("submitted_at", { ascending: true, nullsLast: true })
      .then(({ data }) => setRows(data ?? []));
  }, [tributeId]);

  /* ── realtime subscription ── */
  useEffect(() => {
    if (!tributeId) return; // guard

    const channel = supabase
      .channel(`invite-status-${tributeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invites",
          filter: `tribute_id=eq.${tributeId}`,
        },
        (payload) =>
          setRows((curr) =>
            curr.map((r) => (r.id === payload.new.id ? payload.new : r))
          )
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tributeId]);

  return rows;
};
