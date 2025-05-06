/// <reference lib="deno.ns" />
/**
 * Edge Function: send-invite
 *  – delivery of an invitation (SMS / email)
 *  – optional persistence of participant submission
 */
console.log("line 7");
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
console.log("line 10");
console.log("line 11");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
console.log("SUPABASE_URL", SUPABASE_URL);
serve(async (req: Request) => {
  /* ───────────────── parse payload ───────────────── */
  const payload = await req.json().catch(() => ({}));

  const display_name: string | undefined = payload.display_name;
  const message: string | undefined = payload.message;

  let record = payload.record as
    | {
        id: string;
        contact: string;
        contact_type: "sms" | "email" | "phone";
        tribute_id: string;
        sent: boolean;
        attempts?: number;
      }
    | undefined;
  console.log("payload line 31", payload);
  console.log("record line 32", record);
  /* Fallback: fetch row when only { invite_id } supplied */
  if (!record && payload.invite_id) {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data } = await admin
      .from("invites")
      .select("*")
      .eq("id", payload.invite_id)
      .single();
    record = data as typeof record;
  }
  if (!record) return new Response("Bad request", { status: 400 });
  console.log("record line 44", record);
  const { id, contact, contact_type, tribute_id } = record;

  /* ─────── persist participant submission, if provided ─────── */
  if (display_name || message) {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const updateFields: Record<string, unknown> = {
      submitted_at: new Date().toISOString(),
      ...(display_name && { display_name }),
      ...(message && { message }),
    };
    await admin.from("invites").update(updateFields).eq("id", id);
  }
  console.log("record line 57", record);
  /* ───────────────── compose + deliver ───────────────── */
  const body = `Someone wrote a tribute — add yours at https://youare2.me/contribute/${tribute_id}\n\nReply STOP to opt out • HELP for help`;
  const isSms = contact_type === "sms" || contact_type === "phone";
  const isMock = Deno.env.get("TWILIO_MOCK") === "true";

  if (isSms) {
    /* —— Twilio —— */
    const accountSid = isMock
      ? Deno.env.get("TWILIO_TEST_SID")!
      : Deno.env.get("TWILIO_SID")!;
    const authToken = isMock
      ? Deno.env.get("TWILIO_TEST_TOKEN")!
      : Deno.env.get("TWILIO_TOKEN")!;
    const from = isMock ? "+15005550006" : Deno.env.get("TWILIO_FROM")!;
    const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE")!;

    const params = new URLSearchParams({
      To: contact,
      Body: body,
      ...(isMock
        ? { From: from }
        : { MessagingServiceSid: messagingServiceSid }),
    });

    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    console.log("twilio status", twilioRes.status, await twilioRes.text());
  } else {
    /* —— SendGrid —— */
    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("SENDGRID_TOKEN")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: contact }] }],
        from: { email: "hi@youare2.me" },
        subject: "You’ve been invited!",
        content: [{ type: "text/plain", value: body }],
      }),
    });

    console.log("sendgrid status", sgRes.status, await sgRes.text());
  }

  /* ─────── ALWAYS mark invite as sent + bump attempts ─────── */
  {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    await admin
      .from("invites")
      .update({ sent: true, attempts: (record.attempts ?? 0) + 1 })
      .eq("id", id);
  }

  /* —— DEBUG —— see exactly what Postgres said —— */
  {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: dbg, error: dbgErr } = await admin
      .from("invites")
      .select("sent, attempts, last_error")
      .eq("id", id)
      .single();

    console.log("POST-UPDATE ROW ➜", id, { dbg, dbgErr });
  }

  return new Response("ok");
});
