import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Dialog from "./Dialog";

export default function EditMessageModal({
  inviteId,
  initial,
  onClose,
}: {
  inviteId: string;
  initial: string;
  onClose: () => void;
}) {
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("invites").update({ message: text }).eq("id", inviteId);
    setSaving(false);
    onClose();
  }

  return (
    <Dialog title="Edit contribution" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded border p-2"
        />
        <button
          disabled={saving}
          className="w-full rounded bg-indigo-600 py-2 text-white disabled:bg-gray-300"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </Dialog>
  );
}
