-- Move cards from DB to code. Reactions now reference card slugs (text).
TRUNCATE TABLE public.reactions;

ALTER TABLE public.reactions DROP CONSTRAINT IF EXISTS reactions_card_id_fkey;
ALTER TABLE public.reactions ALTER COLUMN card_id TYPE text USING card_id::text;

DROP TABLE IF EXISTS public.cards;

-- Clear cached headlines so they re-generate against the new card pool.
UPDATE public.sessions SET headline = NULL WHERE headline IS NOT NULL;