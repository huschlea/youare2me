import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useContactsParser } from "@/hooks/useContactsParser";
import ContactPreviewItem from "@/components/ContactPreviewItem";
import { upsertInvites } from "@/services/invites"; // NEW

export default function InviteContributorsForm() {
  // raw textarea string
  const [contactsRaw, setContactsRaw] = useState("");

  // derived, memoized contact objects
  const contacts = useContactsParser(contactsRaw);
  const allValid = contacts.length > 0 && contacts.every((c) => c.valid);

  // UX state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // router helpers
  const { id: tributeId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  async function handleSend() {
    if (!tributeId) return; // should never happen, but type‑safe

    setLoading(true);
    setError(null);

    try {
      await upsertInvites(contacts, tributeId);
      navigate(`/invite/${tributeId}/sent`); // success page
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
    >
      {/* 1 ▸ Contacts textarea */}
      <label className="block">
        <span className="block font-semibold mb-1">
          Contacts (email or phone)
        </span>
        <textarea
          value={contactsRaw}
          onChange={(e) => setContactsRaw(e.target.value)}
          rows={4}
          placeholder="alice@example.com, +14155550123, bob@gmail.com…"
          className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      {/* 2 ▸ Preview list */}
      <div>
        <h3 className="font-medium mb-2">Preview</h3>
        {contacts.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing to show yet.</p>
        ) : (
          <ul className="space-y-1">
            {contacts.map((c) => (
              <ContactPreviewItem key={c.raw} contact={c} />
            ))}
          </ul>
        )}
      </div>

      {/* 3 ▸ Error state */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* 4 ▸ Send button */}
      <button
        type="submit"
        disabled={!allValid || loading}
        className="w-full py-2 rounded-md bg-indigo-600 text-white disabled:bg-gray-300 transition"
      >
        {loading ? "Sending…" : "Send Invites"}
      </button>
    </form>
  );
}
