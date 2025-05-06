// src/utils/parseContact.ts
import isEmail from "validator/lib/isEmail.js";
import { parsePhoneNumber } from "libphonenumber-js";

import type { Contact } from "@/hooks/useInviteForm";

/**
 * Parse a raw input string and return a Contact chip object.
 *  • Emails → {type:"email", value}
 *  • US/Intl phone numbers → {type:"sms", value:"+14155550123"}
 *  • Otherwise mark invalid so the chip turns red.
 */
export function parseContact(raw: string): Contact {
  const value = raw.trim();

  // ---------- email ----------
  if (isEmail(value)) {
    return { type: "email", value };
  }

  // ---------- phone ----------
  try {
    const phone = parsePhoneNumber(value, "US"); // default region = US
    if (phone.isValid()) {
      return { type: "sms", value: phone.number }; // E.164 format
    }
  } catch {
    /* ignore parse errors */
  }

  // ---------- invalid ----------
  return { type: "email", value, invalid: true };
}
