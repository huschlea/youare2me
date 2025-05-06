import { supabase } from "@/lib/supabaseClient";

/** Bulk-update the position column after drag-and-drop. */
export async function updatePositions(tributeId: string, orderedIds: string[]) {
  const updates = orderedIds.map((inviteId, idx) => ({
    id: inviteId,
    position: idx,
  }));
  await supabase.from("invites").upsert(updates);
}
