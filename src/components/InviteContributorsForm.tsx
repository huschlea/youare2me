import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import { useInviteForm } from "@/hooks/useInviteForm";
import StatusChip from "@/components/StatusChip";

export default function InviteContributorsForm() {
  /* chip-state hook */
  const {
    field,
    setField,
    contacts,
    add,
    remove,
    isValid: allValid,
  } = useInviteForm();

  /* UX + router */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id: tributeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  /* submit */
  const handleSend = async () => {
    if (!tributeId) return;
    setLoading(true);
    setError(null);

    try {
      /* build rows */
      const rows = contacts
        .filter((c) => !c.invalid)
        .map((c) => ({
          id: crypto.randomUUID(),
          tribute_id: tributeId,
          contact: c.value,
          contact_type: c.type,
          display_name: null,
          sent: false,
          attempts: 0,
        }));

      const { error: insertErr } = await supabase.from("invites").insert(rows);
      if (insertErr) throw insertErr;

      /* invoke batch function with JSON header */
      await supabase.functions.invoke("send-invite-batch", {
        body: { tribute_id: tributeId },
        headers: { "Content-Type": "application/json" },
      });

      navigate(`/invite/${tributeId}/sent`);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ?? JSON.stringify(err, null, 2);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* render */
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
    >
      {/* 1 ▸ entry */}
      <label className="block">
        <span className="block font-semibold mb-1">
          Add contributor (email or phone)
        </span>
        <input
          ref={inputRef}
          value={field}
          autoFocus
          onChange={(e) => setField(e.target.value)}
          onKeyDown={(e) => {
            const trigger =
              e.key === "Enter" ||
              e.key === "," ||
              (e.key === "v" && (e.metaKey || e.ctrlKey));
            if (trigger) {
              if (!(e.key === "v" && (e.metaKey || e.ctrlKey)))
                e.preventDefault();
              if (field) {
                add(field);
                setField("");
              }
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
          placeholder="alice@example.com, +14155550123, press Enter…"
          className="w-full rounded-md border border-gray-300 p-3
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      {/* 2 ▸ chips */}
      <ul className="flex flex-wrap gap-2">
        {contacts.map((c, i) => (
          <StatusChip
            key={c.value}
            name={c.value}
            invalid={c.invalid}
            onClose={() => remove(i)}
          />
        ))}
      </ul>
      {!allValid && (
        <p className="text-sm text-red-600">
          Remove or correct contacts marked in red.
        </p>
      )}

      {/* 3 ▸ server error */}
      {error && (
        <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
      )}

      {/* 4 ▸ submit */}
      <button
        type="submit"
        disabled={!allValid || loading}
        className="w-full py-2 rounded-md bg-indigo-600 text-white
                   disabled:bg-gray-300 transition"
      >
        {loading ? "Sending…" : "Send Invites"}
      </button>
    </form>
  );
}
