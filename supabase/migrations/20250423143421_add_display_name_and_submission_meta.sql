/* -------------------------------------------------------------------
   Add new columns to public.invites and enforce constraints
 ------------------------------------------------------------------- */
ALTER TABLE public.invites
  -- new data columns
  ADD COLUMN display_name  TEXT,
  ADD COLUMN submitted_at  TIMESTAMPTZ,
  ADD COLUMN message       TEXT,

  -- hard-require a non-empty display name (max 40 chars)
  ADD CONSTRAINT display_name_len
    CHECK (char_length(trim(display_name)) BETWEEN 1 AND 40),

  -- cap each sentiment at 280 chars
  ADD CONSTRAINT message_len
    CHECK (char_length(message) BETWEEN 1 AND 280);

/* -------------------------------------------------------------------
   Back-fill legacy rows so the NOT-NULL-ish check passes
 ------------------------------------------------------------------- */
UPDATE public.invites
SET    display_name = 'Pending Friend'
WHERE  display_name IS NULL;

/* -------------------------------------------------------------------
   View used by the real-time roster (chips + progress bar)
 ------------------------------------------------------------------- */
CREATE OR REPLACE VIEW public.invite_status_v AS
SELECT
    id,
    tribute_id,
    display_name,
    sent,
    attempts,
    submitted_at
FROM public.invites;
