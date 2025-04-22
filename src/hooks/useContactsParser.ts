// src/hooks/useContactsParser.ts
import { useMemo } from "react";

export type Contact = {
  raw: string;
  type: "email" | "phone" | "unknown";
  valid: boolean;
};

// quick‑and‑dirty regex; fine for a UI stub
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
// very loose E.164‑ish phone regex; refine later for locales
const phoneRx = /^\+?\d{7,15}$/;

export function useContactsParser(input: string): Contact[] {
  return useMemo(() => {
    return (
      input
        // split on whitespace, commas, or semicolons
        .split(/[\s,;]+/)
        .filter(Boolean)
        .map((token) => {
          const isEmail = emailRx.test(token);
          const isPhone = phoneRx.test(token);

          return {
            raw: token,
            type: isEmail ? "email" : isPhone ? "phone" : "unknown",
            valid: isEmail || isPhone,
          } as Contact;
        })
    );
  }, [input]);
}
