// supabase/functions/send-invite-batch/index.ts
//
// 1. Accepts { tribute_id } (tolerant JSON parse)
// 2. Fetches unsent invites, invokes `send-invite` for each
// 3. Adds CORS headers + OPTIONS handler
// 4. Verbose logging for easy debugging
// 5. Uses SERVICE_ROLE_KEY to bypass RLS and sign sub-function calls

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

/* ---------- CORS helper ---------- */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/* ---------- Edge handler ---------- */
Deno.serve(async (req) => {
  /* OPTIONS pre-flight */
  if (req.method === "OPTIONS") {
    console.log("CORS pre-flight OK");
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("send-invite-batch invoked");

  /* tolerant JSON parse */
  let payload: { tribute_id?: string } = {};
  try {
    const raw = await req.text();
    payload = raw ? JSON.parse(raw) : {};
    console.log("Parsed body:", payload);
  } catch (e) {
    console.error("Malformed JSON body", e);
  }

  const tribute_id = payload.tribute_id;
  if (!tribute_id) {
    console.warn("Missing tribute_id");
    return new Response(JSON.stringify({ error: "tribute_id required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  /* Supabase service client (bypasses RLS) */
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!
  );

  console.log("Fetching unsent invites for tribute:", tribute_id);
  const { data: invites, error } = await supabase
    .from("invites")
    .select("id")
    .eq("tribute_id", tribute_id)
    .eq("sent", false);

  if (error) {
    console.error("DB select error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`Found ${invites.length} unsent invites`);

  /* ---------- invoke single-row function ---------- */
  let successCount = 0;

  for (const { id } of invites) {
    console.log("Invoking send-invite for", id);

    const { error: fnErr } = await supabase.functions.invoke("send-invite", {
      // stringify → survives transport
      body: JSON.stringify({ invite_id: id }),
      headers: {
        // let supabase-js add JSON header; just supply auth
        Authorization: `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`,
      },
    });

    if (fnErr) {
      console.error("send-invite →", id, "ERROR", fnErr.message);
    } else {
      console.log("send-invite →", id, "OK");
      successCount++;
    }
  }

  console.log(`Batch complete: ${successCount}/${invites.length} succeeded`);

  return new Response(
    JSON.stringify({
      message: "queued",
      count: invites.length,
      ok: successCount,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
