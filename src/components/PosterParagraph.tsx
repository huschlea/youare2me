// src/components/PosterParagraph.tsx
import { useEffect, useRef } from "react";
import { useAutoFont } from "@/hooks/useAutoFont";

type Props = {
  recipient: string; // e.g. "Dad"
  organizerMessage: string; // e.g. "is the best father in the world"
  organizerName: string; // e.g. "Alden"
  accentColor: string;
};

export default function PosterParagraph({
  recipient,
  organizerMessage,
  organizerName,
  accentColor,
}: Props) {
  const ref = useRef<HTMLParagraphElement>(null);

  /* full sentence */
  const sentence = `${recipient} ${organizerMessage} — ${organizerName}`.trim();

  /* auto-size to fit poster */
  useAutoFont(ref, sentence);

  /* inject spans for colored fragments */
  useEffect(() => {
    if (!ref.current) return;

    /* escape HTML in case recipient/message/name contain < or > */
    const escape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const coloredRecipient = `<span style="color:${accentColor}">${escape(
      recipient
    )}</span>`;

    const coloredName = `<span style="color:${accentColor}">${escape(
      organizerName
    )}</span>`;

    /* build final HTML */
    const html = `${coloredRecipient} ${escape(
      organizerMessage
    )} — ${coloredName}`;

    ref.current.innerHTML = html;
  }, [recipient, organizerMessage, organizerName, accentColor]);

  return (
    <p
      ref={ref}
      className="text-[32px] leading-snug text-justify whitespace-pre-wrap font-serif"
      style={{ maxWidth: "60ch" }}
    />
  );
}
