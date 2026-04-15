
CREATE TABLE public.client_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  contenu TEXT NOT NULL,
  type_note TEXT NOT NULL DEFAULT 'autre',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view client_notes" ON public.client_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create client_notes" ON public.client_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update client_notes" ON public.client_notes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete client_notes" ON public.client_notes FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_client_notes_updated_at
  BEFORE UPDATE ON public.client_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
