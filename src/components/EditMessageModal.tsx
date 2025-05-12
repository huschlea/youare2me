// src/components/EditMessageModal.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // shadcn dialog
import { supabase } from "@/lib/supabaseClient";
import { Invite } from "@/types/invite";

type Props = {
  open: boolean;
  invite: Invite | null;
  onClose: () => void;
};

export default function EditMessageModal({ open, invite, onClose }: Props) {
  /* local form state syncs whenever a new invite comes in */
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (invite) {
      setName(invite.display_name ?? "");
      setText(invite.message ?? "");
    }
  }, [invite]);

  async function handleSave() {
    if (!invite) return;
    await supabase
      .from("invites")
      .update({
        display_name: name.trim(),
        message: text.trim(),
      })
      .eq("id", invite.id);
    onClose();
  }

  async function handleDelete() {
    if (!invite) return;
    await supabase.from("invites").delete().eq("id", invite.id);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Edit contribution</DialogTitle>
        </DialogHeader>

        {/* contributor name */}
        <input
          className="w-full rounded border px-2 py-1 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* message text */}
        <textarea
          rows={5}
          className="w-full rounded border px-2 py-1 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          {/* delete only for manual rows */}
          {invite?.contact.startsWith("manual:") && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded border border-red-600 px-3 py-1 text-xs font-medium text-red-600"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
