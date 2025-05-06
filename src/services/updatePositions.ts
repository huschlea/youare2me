// src/services/updatePositions.ts
import { supabase } from "@/lib/supabaseClient"; // adjust path if needed

/**
 * Persists the new invite ordering in Supabase.
 * @param ids Strictly-ordered array of invite IDs (index 0 == position 0).
 */
export async function updatePositions(ids: string[]) {
  const rows = ids.map((id, idx) => ({ id, position: idx }));

  const { error } = await supabase
    .from("invites") // 👈 your table name here
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("updatePositions failed:", error.message);
    throw error;
  }
}
