// src/types/index.ts (example)
export type Invite = {
  id: string;
  tribute_id: string;
  contact: string;
  contact_type: string;
  sent: boolean;
  display_name: string | null;
  message: string | null;
  position: number;
  created_at: string;
  /* plus any other columns you need */
};
