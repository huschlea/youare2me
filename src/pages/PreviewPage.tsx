// src/pages/PreviewPage.tsx
import { useParams } from "react-router-dom";
import InviteProgressPanel from "@/components/InviteProgressPanel";
import PosterCanvas from "@/components/PosterCanvas";

export default function PreviewPage() {
  const { id: tributeId } = useParams<{ id: string }>();

  if (!tributeId) {
    return <p className="p-4 text-red-600">Missing tribute ID in URL.</p>;
  }

  return (
    <main className="flex min-h-screen">
      {/* LEFT RAIL */}
      <aside className="w-72 shrink-0 border-r border-gray-200 bg-white p-4 overflow-y-auto">
        <InviteProgressPanel tributeId={tributeId} />
      </aside>

      {/* POSTER CANVAS */}
      <section className="flex flex-1 items-center justify-center p-8">
        <PosterCanvas tributeId={tributeId} />
      </section>
    </main>
  );
}
