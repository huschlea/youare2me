/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

serve(async (req: Request) => {
  /* -------- payload -------- */
  const payload = await req.json().catch(() => ({}));
  let record = payload.record as
    | {
        id: string;
        contact: string;
        contact_type: "sms" | "email" | "phone";
        tribute_id: string;
      }
    | undefined;

  // Fallback: fetch the row if caller only sent { invite_id }
  if (!record && payload.invite_id) {
    const sr = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // bypass RLS
    );
    const { data, error } = await sr
      .from("invites")
      .select("*")
      .eq("id", payload.invite_id)
      .single();
    if (error || !data) {
      console.error("invite lookup failed:", error);
      return new Response("Invite not found", { status: 404 });
    }
    record = data as typeof record;
  }

  if (!record) {
    return new Response("Bad request: missing record or invite_id", {
      status: 400,
    });
  }

  const { id, contact, contact_type, tribute_id } = record;

  /* -------- body + opt‑out -------- */
  const body = `Someone wrote a tribute — add yours at https://youare2.me/contribute/${tribute_id}

Reply STOP to opt out • HELP for help`;

  /* -------- runtime flags -------- */
  const isSms = contact_type === "sms" || contact_type === "phone";
  const isMock = Deno.env.get("TWILIO_MOCK") === "true";

  /* -------- delivery -------- */
  if (isSms) {
    /* Twilio SMS */
    const accountSid = isMock
      ? Deno.env.get("TWILIO_TEST_SID")!
      : Deno.env.get("TWILIO_SID")!;
    const authToken = isMock
      ? Deno.env.get("TWILIO_TEST_TOKEN")!
      : Deno.env.get("TWILIO_TOKEN")!;

    const from = isMock
      ? "+15005550006" /* magic success number */
      : Deno.env.get("TWILIO_FROM")!;
    const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE");

    const params = new URLSearchParams({
      To: contact,
      Body: body,
      ...(isMock
        ? { From: from }
        : { MessagingServiceSid: messagingServiceSid! }),
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
    /* SendGrid email */
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

  /* -------- mark invite as sent -------- */
  const admin = createClient(
    SUPABASE_URL,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // anon key is provided to Edge Functions
  );

  try {
    await admin.from("invites").update({ sent: true }).eq("id", id);
  } catch (e) {
    console.error("failed to mark sent:", e);
  }

  return new Response("ok");
});
