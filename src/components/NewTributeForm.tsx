// src/components/NewTributeForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTribute } from "@/api/createTribute";
import { useDraft } from "@/lib/useDraft";

export default function NewTributeForm() {
  /* draft-backed inputs (auto-save to localStorage) */
  const [recipient, setRecipient] = useDraft<string>("draft:recipient", "");
  const [senderName, setSenderName] = useDraft<string>("draft:sender", "");
  const [message, setMessage] = useDraft<string>("draft:message", "");

  const [loading, setLoading] = useState(false);
  const isValid = Boolean(recipient.trim() && message.trim());
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);

    try {
      const tribute = await createTribute({
        recipient,
        organizerDisplayName: senderName,
        organizerMessage: message,
      });
      navigate(`/invite/${tribute.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-6 rounded-xl bg-white shadow-lg p-8"
      >
        <h1 className="text-2xl font-semibold text-center">YouAre2Me</h1>

        {/* Recipient */}
        <label className="block">
          <span className="text-sm font-medium">Recipient name *</span>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            placeholder="e.g. Dad"
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        {/* Organizer name */}
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
          <span className="text-sm font-medium">
            {recipient ? `${recipient} is…` : "[Recipient] is…"} *
          </span>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="the best father in the world."
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        <button
          type="submit"
          disabled={!isValid || loading}
          className={`w-full py-2 rounded-md font-semibold transition ${
            !isValid || loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white"
          }`}
        >
          {loading ? "Saving…" : "Save & add participants"}
        </button>
      </form>
    </main>
  );
}
