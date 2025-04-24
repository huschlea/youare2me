// src/components/NewTributeForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useDraft } from "@/lib/useDraft";

export default function NewTributeForm() {
  /* ───────── local + draft state ────────────────────────────── */
  const [recipient, setRecipient] = useDraft<string>("draft:recipient", "");
  const [senderName, setSenderName] = useDraft<string>("draft:sender", "");
  const [message, setMessage] = useDraft<string>("draft:message", "");
  const [isSaving, setIsSaving] = useState(false);

  const isValid = Boolean(recipient.trim() && message.trim());
  const navigate = useNavigate();

  /* ───────── submit handler (create draft row) ─────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSaving) return;

    setIsSaving(true);

    const { data, error } = await supabase
      .from("tributes")
      .insert({
        recipient,
        sender_name: senderName || null,
        message,
        // owner_id intentionally omitted → NULL draft
      })
      .select("id")
      .single();

    setIsSaving(false);

    if (error || !data) {
      console.error("Supabase insert failed:", error);
      alert(`Sorry, something went wrong: ${error?.message}`);
      return;
    }

    /* clear localStorage drafts */
    ["recipient", "sender", "message"].forEach((key) =>
      localStorage.removeItem(`draft:${key}`)
    );

    /* off to the contact-entry screen */
    navigate(`/invite/${data.id}`);
  };

  /* ───────── UI ───────── */
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-xl bg-white shadow-lg p-8"
      >
        <h1 className="text-2xl font-semibold text-center">New Tribute</h1>

        {/* Recipient */}
        <label className="block">
          <span className="text-sm font-medium">Recipient name *</span>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            placeholder="e.g. Maya Angelou"
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        {/* Your name (optional) */}
        <label className="block">
          <span className="text-sm font-medium">Your name</span>
          <input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="e.g. Alden"
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        {/* Message */}
        <label className="block">
          <span className="text-sm font-medium">Message *</span>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="You light up every room…"
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        <button
          type="submit"
          disabled={!isValid || isSaving}
          className={`w-full py-2 rounded-md font-semibold transition ${
            !isValid || isSaving
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white"
          }`}
        >
          {isSaving ? "Saving…" : "Save & add participants"}
        </button>
      </form>
    </main>
  );
}
