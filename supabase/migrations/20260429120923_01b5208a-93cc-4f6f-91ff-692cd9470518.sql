-- 1. Add severity to cards
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS severity text NOT NULL DEFAULT 'medium';
ALTER TABLE public.cards DROP CONSTRAINT IF EXISTS cards_severity_check;
ALTER TABLE public.cards ADD CONSTRAINT cards_severity_check CHECK (severity IN ('critical','medium','light'));

-- 2. Rename stings -> weighs on reactions (preserve data if any)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reactions' AND column_name='stings')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reactions' AND column_name='weighs') THEN
    ALTER TABLE public.reactions RENAME COLUMN stings TO weighs;
  END IF;
END $$;

-- 3. Reseed cards
TRUNCATE TABLE public.reactions;
DELETE FROM public.cards;

INSERT INTO public.cards (category, scenario, severity, age_tags, role_tags) VALUES
-- school_comm
('school_comm', 'A school email lands at 9pm. Permission slip needed by tomorrow morning. The printer''s out of ink.', 'medium', '{}', '{}'),
('school_comm', 'A WhatsApp poll about next week''s outing. Already 14 replies. Yours isn''t one of them.', 'light', '{}', '{}'),
('school_comm', 'Three messages from the class chat in twenty minutes. Scrolling back to figure out which one actually needs a reply.', 'medium', '{}', '{}'),
('school_comm', 'An email from the teacher with "kindly note" in it. Reading it twice to figure out if something is being asked.', 'medium', '{}', '{}'),
('school_comm', 'A note came home in the backpack last week. It''s probably still in there.', 'light', '{2-4,5-7,8-10}', '{}'),

-- deadlines_prep
('deadlines_prep', 'Holiday care registration opens Monday. Spots fill in two days.', 'critical', '{2-4,5-7,8-10,11+}', '{}'),
('deadlines_prep', 'Costume day is Friday. The email mentioned this two weeks ago.', 'medium', '{2-4,5-7,8-10}', '{}'),
('deadlines_prep', 'School lunch subscription needs renewing. Not sure by when.', 'medium', '{5-7,8-10,11+}', '{}'),
('deadlines_prep', 'A form needs signing, scanning, and sending back. Has been on the kitchen counter for four days.', 'medium', '{}', '{}'),
('deadlines_prep', 'Indoor shoes. Library books. Swimming bag. Today is Tuesday — which one is today?', 'light', '{2-4,5-7,8-10}', '{}'),
('deadlines_prep', 'After-school activity signup closes tonight. Still haven''t asked them which one they want.', 'medium', '{5-7,8-10,11+}', '{}'),

-- appointments
('appointments', 'The dentist said "see you in six months." That was eight months ago.', 'medium', '{}', '{}'),
('appointments', 'The vaccination reminder card has been on the fridge since March.', 'critical', '{0-2,2-4,5-7}', '{}'),
('appointments', 'A pediatrician referral expires soon. Or maybe it already did.', 'critical', '{}', '{}'),
('appointments', 'The eye test the school recommended. That was the last school year.', 'medium', '{5-7,8-10,11+}', '{}'),
('appointments', 'Booking the next checkup means three apps, a phone call, and a calendar that has nothing free until November.', 'medium', '{}', '{}'),

-- social_obligations
('social_obligations', 'Someone in the class chat is collecting for the teacher''s gift. €15 by Thursday.', 'light', '{}', '{}'),
('social_obligations', 'A birthday party invitation. RSVP by Sunday. Gift not bought.', 'medium', '{2-4,5-7,8-10}', '{}'),
('social_obligations', 'Bake sale tomorrow. The sign-up sheet had your name on it.', 'medium', '{5-7,8-10}', '{}'),
('social_obligations', 'A class parent suggested coffee "to discuss the spring trip." That was a month ago.', 'light', '{}', '{}'),
('social_obligations', 'The thank-you note for the grandparents'' gift. Still not sent.', 'light', '{}', '{}'),

-- daily_logistics
('daily_logistics', 'The indoor shoes are getting tight. Nobody''s said anything yet.', 'light', '{2-4,5-7,8-10}', '{}'),
('daily_logistics', 'Three loads of laundry. One belongs to a kid who needs the football kit by 4pm.', 'medium', '{5-7,8-10,11+}', '{}'),
('daily_logistics', 'The medicine cabinet — when did the children''s paracetamol expire?', 'medium', '{0-2,2-4,5-7}', '{}'),
('daily_logistics', 'School photo day is in the calendar. The shirt that fits is in the wash.', 'light', '{2-4,5-7,8-10}', '{}');
