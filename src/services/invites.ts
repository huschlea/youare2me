// src/services/invites.ts
// ------------------------------------------------------------------
// Persists a batch of contacts for a given tribute into the `invites`
// table.  Each row starts with `sent = false`; Twilio logic will flip
// that later.  Throws on any Supabase error so the caller can surface
// it in the UI.
// ------------------------------------------------------------------

import { supabase } from "@/lib/supabaseClient";
import { Contact } from "@/hooks/useContactsParser";

/**
 * Insert (email / phone) contacts for a single tribute.
 *
 * @param contacts  Array produced by useContactsParser
 * @param tributeId UUID of the parent tribute
 */
export async function upsertInvites(contacts: Contact[], tributeId: string) {
  if (contacts.length === 0) return; // nothing to do

  const rows = contacts.map((c) => ({
    tribute_id: tributeId,
    contact: c.raw,
    contact_type: c.type, // 'email' | 'phone'
    // sent defaults to false in the DB
  }));

  // Supabase: insert & throw on any error
  await supabase.from("invites").insert(rows).throwOnError();
}
