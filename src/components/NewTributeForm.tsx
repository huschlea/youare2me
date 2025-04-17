import { useState } from "react";

export default function NewTributeForm() {
  const [recipient, setRecipient] = useState("");
  const [contacts, setContacts] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ recipient, contacts });
  };

  return (
    // 1️⃣  full‑viewport flex box gives vertical + horizontal centering
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* 2️⃣  the white “card” with max width, padding, rounded corners, shadow */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white shadow-lg p-8 space-y-6"
      >
        <h1 className="text-2xl font-semibold text-center">New Tribute</h1>

        {/* Recipient */}
        <label className="block">
          <span className="text-sm font-medium">Recipient name*</span>
          <input
            type="text"
            required
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Maya Angelou"
          />
        </label>

        {/* Contributor contacts */}
        <label className="block">
          <span className="text-sm font-medium">
            Contributor emails / phones*
          </span>
          <textarea
            rows={4}
            required
            value={contacts}
            onChange={(e) => setContacts(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="amy@example.com
+15555555555"
          />
        </label>

        <button
          type="submit"
          className="w-full py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-95 transition"
        >
          Save & continue
        </button>
      </form>
    </main>
  );
}
