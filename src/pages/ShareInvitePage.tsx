// src/pages/ShareInvitePage.tsx
import { useNavigate } from "react-router-dom";

import InviteContributorsForm from "@/components/InviteContributorsForm";

export default function ShareInvitePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 space-y-8">
        {/* 1️⃣ confirmation header */}
        <section className="text-center space-y-3">
          <h1 className="text-2xl font-semibold">Progress saved 🎉</h1>
          <p className="text-gray-700">
            Next step: invite friends &amp; family to contribute messages.
          </p>
        </section>

        {/* 2️⃣ contributor contacts form */}
        <InviteContributorsForm />

        {/* 3️⃣ back button */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-block mt-4 text-indigo-600 hover:underline"
          >
            ← Back
          </button>
        </div>
      </div>
    </main>
  );
}
