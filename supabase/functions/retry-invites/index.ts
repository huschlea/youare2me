/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAX_ATTEMPTS = 3;
const RETRY_WINDOW = "10 minutes"; // wait this long after last try
const SEND_FN_URL = "/functions/v1/send-invite"; // reuse existing sender

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

serve(async () => {
  /* ── find stuck invites ─────────────────────────── */
  const { data: rows, error } = await admin
    .from("invites")
    .select("*")
    .eq("sent", false)
    .lt("attempts", MAX_ATTEMPTS)
    .lte("updated_at", `now() - interval '${RETRY_WINDOW}'`);

  if (error) {
    console.error("query error", error);
    return new Response("query failed", { status: 500 });
  }

  if (!rows?.length) return new Response("nothing to retry");

  /* ── retry each one serially (<= free edge 30s) ── */
  for (const row of rows) {
    /* call existing send-invite function with just { invite_id } */
    const res = await fetch(`${SUPABASE_URL}${SEND_FN_URL}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SERVICE_ROLE}` },
      body: JSON.stringify({ invite_id: row.id }),
    });

    const ok = res.status >= 200 && res.status < 300;

    /* bump attempts regardless; send-invite marks sent=true if success */
    await admin
      .from("invites")
      .update({
        attempts: row.attempts + 1,
        last_error: ok ? null : await res.text(),
      })
      .eq("id", row.id);
  }

  return new Response("done");
});
