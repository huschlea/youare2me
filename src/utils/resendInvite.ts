import { supabase } from "@/lib/supabaseClient";

export async function resendInvite(tributeId: string, inviteId: string) {
  // Reinvoke your serverless function for a single row
  await supabase.functions.invoke("send-invite-single", {
    body: { tribute_id: tributeId, invite_id: inviteId },
  });
}
