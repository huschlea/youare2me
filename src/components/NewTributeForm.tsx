// src/components/NewTributeForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useDraft } from "@/lib/useDraft";

export default function NewTributeForm() {
  /* ------------------------ state ------------------------------- */
  const [recipient, setRecipient] = useDraft<string>("draft:recipient", "");
  const [senderName, setSenderName] = useDraft<string>("draft:sender", "");
  const [message, setMessage] = useDraft<string>("draft:message", "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = Boolean(recipient.trim() && message.trim());
  const navigate = useNavigate();

  /* ------------------------ submit ------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("tributes")
      .insert({
        recipient,
        sender_name: senderName || null,
        message,
      })
      .select("id")
      .single(); // unwrap to one row

    setIsSubmitting(false);

    if (error) {
      console.error("Supabase insert failed:", error);
      alert(`Error: ${error.message}`);
      return;
    }

    // success: clear drafts & redirect
    ["recipient", "sender", "message"].forEach((k) =>
      localStorage.removeItem(`draft:${k}`)
    );

    navigate(`/invite/${data!.id}`);
  };

  /* ------------------------ UI ---------------------------------- */
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white shadow-lg p-8 space-y-6"
      >
        <h1 className="text-2xl font-semibold text-center">New Tribute</h1>

        {/* Recipient */}
        <label className="block">
          <span className="text-sm font-medium">Recipient name *</span>
          <input
            type="text"
            required
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Maya Angelou"
          />
        </label>

        {/* Sender (optional) */}
        <label className="block">
          <span className="text-sm font-medium">Your name</span>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Alden"
          />
        </label>

        {/* Message */}
        <label className="block">
          <span className="text-sm font-medium">Message *</span>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="You light up every room…"
          />
        </label>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`w-full py-2 rounded-md font-semibold transition ${
            !isValid || isSubmitting
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white"
          }`}
        >
          {isSubmitting ? "Saving…" : "Save tribute"}
        </button>
      </form>
    </main>
  );
}
