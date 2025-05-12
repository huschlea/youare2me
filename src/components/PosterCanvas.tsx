// src/components/PosterCanvas.tsx
import { useEffect, useRef, useState } from "react";
import { useTribute } from "@/hooks/useTribute";
import { useInviteStatuses } from "@/hooks/useInviteStatuses";
import { useAutoFont } from "@/hooks/useAutoFont";
import StyleToolbar from "@/components/StyleToolbar";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function PosterCanvas({ tributeId }: { tributeId: string }) {
  /* live data */
  const { tribute } = useTribute(tributeId);
  const invites = useInviteStatuses(tributeId);

  /* accent colour */
  const [accent, setAccent] = useState("#0f766e");
  useEffect(() => {
    if (tribute?.accent_color) setAccent(tribute.accent_color);
  }, [tribute]);

  /* refs + placeholders to keep hooks order stable */
  const ref = useRef<HTMLParagraphElement>(null);
  let plain = "";
  let rich = "";

  if (tribute && invites) {
    const recipient = tribute.recipient ?? "Recipient";

    /** ordered, **VISIBLE** contributions only */
    const ordered = [...invites]
      .filter((i) => !i.hidden) // 👈 skip hidden rows
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .filter((i) => i.message && i.message.trim().length > 0);

    /* plain string for auto-font */
    plain =
      `${recipient} is ` +
      ordered
        .map((p) => `${p.message.trim()}. ${p.display_name || p.contact} `)
        .join(" ");

    /* rich HTML with accent spans */
    const start = `<span style="color:${accent}">${escape(recipient)} is</span>`;
    const parts = ordered.map((p) => {
      const msg = escape(p.message.trim());
      const name = escape(p.display_name || p.contact);
      return `${msg}. <span style="color:${accent}">${name}</span> `;
    });
    rich = `${start} ${parts.join(" ")}`.trim();
  }

  /* width fit */
  useAutoFont(ref, plain);

  /* extra height fit */
  useEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (
      size > 10 &&
      (el.scrollHeight > box.clientHeight || el.scrollWidth > box.clientWidth)
    ) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }
  }, [rich]);

  /* loading state */
  if (!tribute || !invites) {
    return (
      <section className="flex w-full max-w-lg flex-col items-center p-4">
        <div className="flex h-[32rem] w-full items-center justify-center">
          Loading…
        </div>
      </section>
    );
  }

  /* render */
  return (
    <section className="flex w-full max-w-lg flex-col items-center p-4">
      <div className="relative w-full aspect-square bg-white shadow-lg">
        {/* 3-rem inner margin */}
        <div className="absolute inset-12 flex items-center justify-center">
          <p
            ref={ref}
            className="text-[32px] leading-snug text-justify whitespace-pre-wrap font-serif"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
            dangerouslySetInnerHTML={{ __html: rich }}
          />
        </div>
      </div>

      <StyleToolbar
        tributeId={tributeId}
        current={accent}
        onChange={(color) => {
          setAccent(color);
          import("@/utils/setAccentColor").then(({ setAccentColor }) =>
            setAccentColor(tributeId, color)
          );
        }}
      />
    </section>
  );
}
