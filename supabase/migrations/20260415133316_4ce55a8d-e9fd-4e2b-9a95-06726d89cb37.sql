
CREATE TABLE public.options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_option TEXT NOT NULL UNIQUE,
  nom_option TEXT NOT NULL,
  description TEXT,
  prix_ht NUMERIC NOT NULL DEFAULT 0,
  type_facturation TEXT NOT NULL DEFAULT 'Par colis',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view options" ON public.options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create options" ON public.options FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update options" ON public.options FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete options" ON public.options FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON public.options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
