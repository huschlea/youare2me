import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusChip } from "@/components/StatusChip";
import { useInviteStatuses } from "@/hooks/useInviteStatuses";

export default function ContributeDonePage() {
  const { inviteId } = useParams<{ inviteId: string }>();

  /* ── look up the parent tribute_id once ── */
  const [tributeId, setTributeId] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteId) return;
    supabase
      .from("invites")
      .select("tribute_id")
      .eq("id", inviteId)
      .single()
      .then(({ data }) => setTributeId(data?.tribute_id ?? null));
  }, [inviteId]);

  /* ── always call the hook (lint-safe) ── */
  const rows = useInviteStatuses(tributeId);
  const done = rows.filter((r) => r.sent).length;
  const pct = rows.length ? (done / rows.length) * 100 : 0;

  /* loading state */
  if (!tributeId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
        <h1 className="text-2xl font-semibold">Thanks for sharing 🎉</h1>

        <ProgressBar pct={pct} />

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

        <p className="text-gray-700">
          Feel free to remind friends who haven’t added theirs yet—we’re at{" "}
          {done}/{rows.length}!
        </p>

        <Link to="/" className="text-indigo-600 hover:underline">
          Create your own tribute
        </Link>
      </div>
    </main>
  );
}
