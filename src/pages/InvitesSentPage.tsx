// src/pages/InvitesSentPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ProgressBar } from "@/components/ProgressBar";
import AllSentBanner from "@/components/AllSentBanner";
import { useInviteStatuses } from "@/hooks/useInviteStatuses";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function InvitesSentPage() {
  const { id: tributeId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  /* live invite rows (organizer row included, harmless) */
  const rows = useInviteStatuses(tributeId);

  /* progress */
  const done = rows.filter((r) => r.sent === true || r.sent === "true").length;
  const total = rows.length;
  const pct = total ? (done / total) * 100 : 0;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-semibold">Invites sent ✅</h1>

        {/* progress bar + counter */}
        <div className="space-y-2">
          <ProgressBar pct={pct} />
          <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
            {done === total ? (
              <>
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                <span>All&nbsp;{total}&nbsp;invites sent</span>
              </>
            ) : (
              <span>
                {done}&nbsp;/&nbsp;{total}&nbsp;invites sent
              </span>
            )}
          </p>
        </div>

        {/* banner appears once every invite is sent */}
        {pct === 100 && tributeId && <AllSentBanner tributeId={tributeId} />}

        {/* add-contributors button */}
        <button
          type="button"
          onClick={() => navigate(`/invite/${tributeId}`)}
          className="text-indigo-600 hover:underline"
        >
          + Add more contributors
        </button>
      </div>
    </main>
  );
}
