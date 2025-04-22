// src/pages/ShareInvitePage.tsx
import { useParams, Link } from "react-router-dom";
import InviteContributorsForm from "@/components/InviteContributorsForm"; // NEW

export default function ShareInvitePage() {
  // grab the Supabase UUID from the URL
  const { id } = useParams<{ id: string }>();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 space-y-8">
        {/* 1️⃣ Confirmation header stays the same */}
        <section className="text-center space-y-3">
          <h1 className="text-2xl font-semibold">Tribute saved 🎉</h1>
          <p className="text-gray-700">
            Next step: invite friends &amp; family to contribute messages.
          </p>

          {/* share link preview (still placeholder for now) */}
          <div className="bg-gray-100 rounded-md p-3 font-mono break-all">
            https://youare2me.dev/contribute/{id}
          </div>
        </section>

        {/* 2️⃣ NEW Invite Contributors form */}
        <InviteContributorsForm />

        {/* 3️⃣ “Start over” link is unchanged */}
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
  );
}
