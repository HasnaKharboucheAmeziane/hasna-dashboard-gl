
-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_entreprise TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  type_client TEXT NOT NULL DEFAULT 'prospect',
  statut TEXT NOT NULL DEFAULT 'actif',
  ca_annuel NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create devis table
CREATE TABLE public.devis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_devis TEXT NOT NULL,
  id_client UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  statut TEXT NOT NULL DEFAULT 'brouillon',
  montant_ht NUMERIC NOT NULL DEFAULT 0,
  type_service TEXT NOT NULL,
  options JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tarifs table
CREATE TABLE public.tarifs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_devis TEXT NOT NULL,
  id_client UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  statut TEXT NOT NULL DEFAULT 'actif',
  montant_ht NUMERIC NOT NULL DEFAULT 0,
  type_service TEXT NOT NULL,
  options JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarifs ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients
CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" ON public.clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete clients" ON public.clients FOR DELETE TO authenticated USING (true);

-- RLS policies for devis
CREATE POLICY "Authenticated users can view devis" ON public.devis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create devis" ON public.devis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update devis" ON public.devis FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete devis" ON public.devis FOR DELETE TO authenticated USING (true);

-- RLS policies for tarifs
CREATE POLICY "Authenticated users can view tarifs" ON public.tarifs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create tarifs" ON public.tarifs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tarifs" ON public.tarifs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete tarifs" ON public.tarifs FOR DELETE TO authenticated USING (true);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_devis_updated_at BEFORE UPDATE ON public.devis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tarifs_updated_at BEFORE UPDATE ON public.tarifs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
