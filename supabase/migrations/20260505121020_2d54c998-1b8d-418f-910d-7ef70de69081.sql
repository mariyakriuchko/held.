CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  session_id uuid,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscribers insert any"
  ON public.subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX idx_subscribers_email ON public.subscribers(email);