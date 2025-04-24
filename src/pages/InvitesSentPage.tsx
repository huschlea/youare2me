import { Link, useParams } from "react-router-dom";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusChip } from "@/components/StatusChip";
import { useInviteStatuses } from "@/hooks/useInviteStatuses";

export default function InvitesSentPage() {
  /* :id is the tribute (not invite) ID that NewTributeForm returned */
  const { id: tributeId } = useParams<{ id: string }>();

  /* live roster */
  const rows = useInviteStatuses(tributeId!);
  const done = rows.filter((r) => r.sent).length;
  const pct = rows.length ? (done / rows.length) * 100 : 0;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
        <h1 className="text-2xl font-semibold">Invites sent ✅</h1>

        {/* progress bar */}
        <ProgressBar pct={pct} />

        {/* roster chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {rows.map((r) => (
            <StatusChip
              key={r.id}
              name={r.display_name}
              sent={r.sent}
              attempts={r.attempts}
            />
          ))}
        </div>

        {/* share-link helper */}
        <p className="text-gray-700">
          Friends &amp; family can leave messages at:
        </p>
        <div className="bg-gray-100 rounded-md p-3 font-mono break-all">
          https://youare2.me/contribute/{tributeId}
        </div>

        <Link to="/" className="text-indigo-600 hover:underline">
          Start another tribute
        </Link>
      </div>
    </main>
  );
}
