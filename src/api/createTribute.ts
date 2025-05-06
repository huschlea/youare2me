import { supabase } from "@/lib/supabaseClient";

type Params = {
  recipient: string;
  organizerDisplayName: string;
  organizerMessage: string;
};

export async function createTribute({
  recipient,
  organizerDisplayName,
  organizerMessage,
}: Params) {
  /* 1 ▸ insert tribute draft */
  const { data: tribute, error: tErr } = await supabase
    .from("tributes")
    .insert({
      recipient,
      sender_name: organizerDisplayName || null,
      message: organizerMessage,
      // owner_id left NULL (draft); accent_color chosen later
    })
    .select("id") // only need id for redirect
    .single();

  if (tErr || !tribute) throw tErr ?? new Error("Tribute insert failed");

  /* 2 ▸ insert organizer invite row */
  const { error: iErr } = await supabase
    .from("invites")
    .insert({
      tribute_id: tribute.id,
      role: "organizer",
      display_name: organizerDisplayName || null,
      contact: organizerDisplayName || "organizer", // satisfies NOT NULL
      contact_type: "name", // use an allowed enum value
      message: organizerMessage,
      position: 0,
      sent: true,
    })
    .throwOnError(); // <-- surfaces exact DB error

  if (iErr) {
    // rollback so unfinished drafts don’t accumulate
    await supabase.from("tributes").delete().eq("id", tribute.id);
    throw iErr;
  }

  return tribute; // { id }
}
