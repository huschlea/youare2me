import { supabase } from "@/lib/supabaseClient";

/** Persist a new accent colour on the tribute row. */
export async function setAccentColor(tributeId: string, hex: string) {
  await supabase
    .from("tributes")
    .update({ accent_color: hex })
    .eq("id", tributeId);
}
