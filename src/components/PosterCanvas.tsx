// src/components/PosterCanvas.tsx
import { useEffect, useState } from "react";
import { useTribute } from "@/hooks/useTribute";
import { useInvites } from "@/hooks/useInvites";
import PosterParagraph from "@/components/PosterParagraph";
import StyleToolbar from "@/components/StyleToolbar";

export default function PosterCanvas({ tributeId }: { tributeId: string }) {
  /* 1 ▸ tribute metadata (recipient, accent swatch, etc.) */
  const { tribute } = useTribute(tributeId);

  /* 2 ▸ contributor list, which now includes the organizer row */
  const { invites } = useInvites(tributeId);

  /* 3 ▸ local accent for instant UI feedback */
  const [accent, setAccent] = useState<string>("#0f766e");
  useEffect(() => {
    if (tribute?.accent_color) setAccent(tribute.accent_color);
  }, [tribute]);

  /* 4 ▸ guard while loading either piece */
  if (!tribute || !invites) {
    return (
      <section className="flex w-full max-w-lg flex-col items-center p-4">
        <div className="flex h-[32rem] w-full items-center justify-center">
          Loading…
        </div>
      </section>
    );
  }

  /* 5 ▸ extract sentence parts */
  const organizer = invites.find((i) => i.role === "organizer");
  const recipientName = tribute.recipient_name ?? "Recipient";
  const organizerMessage = organizer?.message ?? "";
  const organizerName =
    organizer?.display_name ?? organizer?.contact ?? "Organizer";

  /* 6 ▸ render poster + toolbar */
  return (
    <section className="flex w-full max-w-lg flex-col items-center p-4">
      {/* poster square */}
      <div className="relative w-full aspect-square bg-white shadow-lg">
        <div className="absolute inset-6 flex items-center justify-center">
          <PosterParagraph
            recipient={recipientName}
            organizerMessage={organizerMessage}
            organizerName={organizerName}
            accentColor={accent}
          />
        </div>
      </div>

      {/* style toolbar */}
      <StyleToolbar
        tributeId={tributeId}
        current={accent}
        onChange={(color) => {
          setAccent(color); // instant UI update
          import("@/utils/setAccentColor").then(
            ({ setAccentColor }) => setAccentColor(tributeId, color) // persist to DB
          );
        }}
      />
    </section>
  );
}
