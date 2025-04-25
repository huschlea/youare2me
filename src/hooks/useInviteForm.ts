// src/hooks/useInviteForm.ts
import { useState } from "react";
import { parseContact } from "@/utils/parseContact";

export interface Contact {
  type: "email" | "sms";
  value: string;
  invalid?: boolean;
}

/**
 * State + helpers for the Invite Contributors flow.
 *  • field        – live input value
 *  • contacts[]   – validated chips
 *  • add / remove – mutation helpers
 *  • isValid      – >0 chips and none marked invalid
 */
export function useInviteForm() {
  const MAX_CHIPS = 50;
  const [field, setField] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);

  /** Add one or more chips (handles comma & middot separators, skips junk) */
  const add = (raw: string) => {
    raw
      .split(/[,\u00B7]/) // comma or middot (·)
      .map((t) => t.trim())
      .filter(Boolean) // drop empty strings
      .filter((t) => /[A-Za-z0-9@+]/.test(t)) // ensure real content
      .forEach((token) => {
        if (contacts.length >= MAX_CHIPS) return;
        const parsed = parseContact(token);
        if (contacts.some((c) => c.value === parsed.value)) return; // dedupe
        setContacts((prev) => [...prev, parsed]);
      });
  };

  /** Remove chip by array index */
  const remove = (idx: number) =>
    setContacts((prev) => prev.filter((_, i) => i !== idx));

  const isValid = contacts.length > 0 && contacts.every((c) => !c.invalid);

  return { field, setField, contacts, add, remove, isValid };
}
