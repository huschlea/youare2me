// src/components/PosterParagraph.tsx
import { useEffect, useRef } from "react";
import { useAutoFont } from "@/hooks/useAutoFont";

type Props = {
  recipient: string; // e.g. "Dad"
  organizerMessage: string; // e.g. "the best father in the world"
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

  /* 1 ▸ ensure message starts with "is " */
  let body = organizerMessage.trim();
  if (!/^\bis\b/i.test(body)) {
    body = `is ${body}`;
  }

  /* full sentence for auto-font sizing */
  const sentence = `${recipient} ${body} — ${organizerName}`;
  useAutoFont(ref, sentence);

  /* 2 ▸ inject coloured spans */
  useEffect(() => {
    if (!ref.current) return;

    const escape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const coloredRecipient = `<span style="color:${accentColor}">${escape(
      recipient
    )}</span>`;

    const coloredDashAndName = `<span style="color:${accentColor}">— ${escape(
      organizerName
    )}</span>`;

    const html = `${coloredRecipient} ${escape(body)} ${coloredDashAndName}`;
    ref.current.innerHTML = html;
  }, [recipient, body, organizerName, accentColor]);

  return (
    <p
      ref={ref}
      className="text-[32px] leading-snug text-justify whitespace-pre-wrap font-serif"
      style={{ maxWidth: "60ch" }}
    />
  );
}
