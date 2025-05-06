// src/types/invite.ts
export type Invite = {
  id: string;
  tribute_id: string;
  role: "organizer" | "contributor";
  display_name: string | null;
  contact: string;
  contact_type: string;
  message: string | null;
  position: number;
  sent: boolean;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  attempts: number;
  last_error: string | null;
};
