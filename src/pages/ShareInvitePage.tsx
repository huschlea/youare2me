// src/pages/ShareInvitePage.tsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import InviteContributorsForm from "@/components/InviteContributorsForm";
import AuthModal from "@/components/AuthModal";

type Contact = { value: string; type: "sms" | "email" };

export default function ShareInvitePage() {
  /* ── params & nav ─────────────────────────────────────────── */
  const { id: tributeId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  /* ── local state ──────────────────────────────────────────── */
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [isSending, setIsSending] = useState(false);

  /* ── click “Send Invites” ─────────────────────────────────── */
  const handleSendInvites = () => {
    if (contacts.length === 0) {
      alert("Please add at least one friend.");
      return;
    }
    setShowAuth(true); // open OTP modal
  };

  /* ── finalizing: patch draft + insert invites + send batch ─ */
  const finalizeDraftAndSend = async (ownerId: string) => {
    setIsSending(true);

    /* (a) attach owner_id to the draft tribute */
    const { error: upErr } = await supabase
      .from("tributes")
      .update({ owner_id: ownerId })
      .eq("id", tributeId!);

    if (upErr) {
      alert(upErr.message);
      setIsSending(false);
      return;
    }

    /* (b) bulk-insert invites */
    const rows = contacts.map((c) => ({
      id: crypto.randomUUID(),
      tribute_id: tributeId,
      contact: c.value,
      contact_type: c.type,
      display_name: "",
      sent: false,
      attempts: 0,
    }));

    const { error: insErr } = await supabase.from("invites").insert(rows);
    if (insErr) {
      alert(insErr.message);
      setIsSending(false);
      return;
    }

    /* (c) trigger batch send */
    await fetch("/functions/v1/send-invite-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tribute_id: tributeId }),
    });

    navigate(`/invite/${tributeId}/sent`);
  };

  /* ── JSX ─────────────────────────────────────────────────── */
  return (
    <>
      {/* page content */}
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* 1️⃣ confirmation header */}
          <section className="text-center space-y-3">
            <h1 className="text-2xl font-semibold">Tribute saved 🎉</h1>
            <p className="text-gray-700">
              Next step: invite friends &amp; family to contribute messages.
            </p>

            <div className="bg-gray-100 rounded-md p-3 font-mono break-all">
              https://youare2.me/contribute/{tributeId}
            </div>
          </section>

          {/* 2️⃣ contributor contacts form */}
          <InviteContributorsForm
            contacts={contacts}
            onChange={setContacts}
            disabled={isSending}
          />

          <button
            onClick={handleSendInvites}
            disabled={contacts.length === 0 || isSending}
            className={`w-full py-2 rounded-md font-semibold transition ${
              contacts.length === 0 || isSending
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white"
            }`}
          >
            {isSending ? "Sending…" : `Send ${contacts.length} Invites`}
          </button>

          {/* 3️⃣ start-over link */}
          <div className="text-center">
            <Link
              to="/"
              className="inline-block mt-4 text-indigo-600 hover:underline"
            >
              Start another tribute
            </Link>
          </div>
        </div>
      </main>

      {/* OTP modal overlay */}
      {showAuth && (
        <AuthModal
          onSuccess={(session) => {
            finalizeDraftAndSend(session.user.id);
            setShowAuth(false);
          }}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
