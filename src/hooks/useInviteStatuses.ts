// src/hooks/useInviteStatuses.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Invite } from "@/types/invite";

/**
 * One-shot fetch of all invite rows for a tribute.
 * Returns the full Invite objects so downstream pages
 * (preview rail, sent-status page, etc.) can access
 * `role`, `contact_type`, `position`, and every other column.
 *
 * If you later need true realtime, wire up a channel
 * exactly like in the old version and call setRows(next).
 */
export function useInviteStatuses(tributeId?: string) {
  const [rows, setRows] = useState<Invite[]>([]);

  useEffect(() => {
    if (!tributeId) return;

    supabase
      .from<Invite>("invites")
      .select("*") // pull every column, incl. role / contact_type
      .eq("tribute_id", tributeId)
      .order("position", { ascending: true }) // keep stable order
      .then(({ data }) => setRows(data ?? []));
  }, [tributeId]);

  return rows;
}
