/// <reference lib="deno.ns" />

/**
 * Edge Function: send‑invite
 *
 * Handles two use‑cases:
 *  1. Webhook (Supabase row trigger) — sends the actual invite via Twilio / SendGrid
 *  2. Direct POST  { invite_id, display_name, message } — participant has submitted their
 *     sentiment; we persist that data in `invites` (display_name, message, submitted_at)
 *     and fall through to the same delivery route if the row still needs to be sent.
 *
 *  Step‑1 Day‑6 update: write `display_name`, `message`, and `submitted_at` to the
 *  `public.invites` table (≤40 / ≤280 chars enforced by DB CHECKs).
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  /* ------------------------------------------------------------------
   *  Parse payload
   * ------------------------------------------------------------------ */
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
      }
    | undefined;

  /* Fallback: fetch the row if caller only sent { invite_id } */
  if (!record && payload.invite_id) {
    const sr = createClient(SUPABASE_URL, SERVICE_ROLE_KEY); // bypass RLS
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

  /* ------------------------------------------------------------------
   *  Persist participant submission, if provided
   * ------------------------------------------------------------------ */
  if (display_name || message) {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const updateFields: Record<string, unknown> = {
      sent: true,
      submitted_at: new Date().toISOString(),
    };
    if (display_name) updateFields.display_name = display_name;
    if (message) updateFields.message = message;

    const { error: upErr } = await admin
      .from("invites")
      .update(updateFields)
      .eq("id", id);

    if (upErr) {
      console.error("failed to persist submission:", upErr);
      return new Response("DB update failed", { status: 500 });
    }
  }

  /* ------------------------------------------------------------------
   *  Compose invite body + opt‑out footer
   * ------------------------------------------------------------------ */
  const body = `Someone wrote a tribute — add yours at https://youare2.me/contribute/${tribute_id}\n\nReply STOP to opt out • HELP for help`;

  const isSms = contact_type === "sms" || contact_type === "phone";
  const isMock = Deno.env.get("TWILIO_MOCK") === "true";

  /* ------------------------------------------------------------------
   *  Deliver via Twilio (SMS) or SendGrid (email)
   * ------------------------------------------------------------------ */
  if (isSms) {
    const accountSid = isMock
      ? Deno.env.get("TWILIO_TEST_SID")!
      : Deno.env.get("TWILIO_SID")!;
    const authToken = isMock
      ? Deno.env.get("TWILIO_TEST_TOKEN")!
      : Deno.env.get("TWILIO_TOKEN")!;

    const from = isMock ? "+15005550006" : Deno.env.get("TWILIO_FROM")!;
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

  /* ------------------------------------------------------------------
   *  Final response
   * ------------------------------------------------------------------ */
  return new Response("ok");
});
