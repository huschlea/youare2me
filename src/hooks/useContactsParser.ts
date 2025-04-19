import { useMemo } from "react";

export type Contact = {
  raw: string;
  type: "email" | "phone" | "unknown";
  valid: boolean;
};

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i; // quick‑and‑dirty, good enough for UI stub
const phoneRx = /^\+?\d{7,15}$/; // E.164‑ish; tweak later for locales

export function useContactsParser(input: string): Contact[] {
  return useMemo(() => {
    return input
      .split(/[\s,;]+/) // split on whitespace, commas or semicolons
      .filter(Boolean)
      .map((token) => {
        const isEmail = emailRx.test(token);
        const isPhone = phoneRx.test(token);
        return {
          raw: token,
          type: isEmail ? "email" : isPhone ? "phone" : "unknown",
          valid: isEmail || isPhone,
        } as Contact;
      });
  }, [input]);
}
