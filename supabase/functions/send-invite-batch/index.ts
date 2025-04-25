// supabase/functions/send-invite-batch/index.ts
//
// 1. Accepts { tribute_id } in JSON body (tolerant parse)
// 2. Queues unsent invites by invoking `send-invite`
// 3. Requires SERVICE_ROLE_KEY in env

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

Deno.serve(async (req) => {
  /* tolerant JSON parse */
  let payload: { tribute_id?: string } = {};
  try {
    payload = await req.json();
  } catch {
    /* empty body */
  }

  const tribute_id = payload.tribute_id;
  if (!tribute_id) {
    return new Response(JSON.stringify({ error: "tribute_id required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")! // service-role bypasses RLS
  );

  /* fetch unsent invites */
  const { data: invites, error } = await supabase
    .from("invites")
    .select("id")
    .eq("tribute_id", tribute_id)
    .eq("sent", false);

  if (error) {
    console.error("DB select error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  /* invoke single-row function */
  for (const row of invites) {
    await supabase.functions.invoke("send-invite", {
      body: { invite_id: row.id },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`,
      },
    });
  }

  return new Response(
    JSON.stringify({ message: "queued", count: invites.length }),
    { headers: { "Content-Type": "application/json" } }
  );
});
