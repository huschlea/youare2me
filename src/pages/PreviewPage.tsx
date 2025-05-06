// src/pages/PreviewPage.tsx
import { useParams } from "react-router-dom";
import InviteProgressPanel from "@/components/InviteProgressPanel";
import PosterCanvas from "@/components/PosterCanvas";
import { useInvites } from "@/hooks/useInvites";

export default function PreviewPage() {
  const { id: tributeId } = useParams<{ id: string }>();

  /* fetch the invite list every render (hook must NOT be conditional) */
  const { invites, error } = useInvites(tributeId);

  /* 🔍 TEMP DEBUG — remove when stable */
  console.log("PreviewPage render", { tributeId, invites, error });

  if (!tributeId) {
    return <p className="p-4 text-red-600">Missing tribute ID in URL.</p>;
  }

  if (error) {
    return <p className="p-4 text-red-600">Error: {error.message}</p>;
  }

  return (
    <div className="flex h-screen">
      {/* LEFT RAIL */}
      <aside className="w-80 min-w-[16rem] shrink-0 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
        <InviteProgressPanel invites={invites} />
      </aside>

      {/* POSTER CANVAS */}
      <main className="flex-1 flex items-center justify-center">
        <PosterCanvas tributeId={tributeId} />
      </main>
    </div>
  );
}
