-- Create report_settings table
CREATE TABLE IF NOT EXISTS public.report_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  header_text TEXT DEFAULT 'Reporte de Evaluación de Motricidad Fina',
  footer_text TEXT DEFAULT 'Generado por el Sistema de Evaluación Educativa',
  logo_url TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.report_settings ENABLE ROW LEVEL SECURITY;

-- Only one settings record should exist
CREATE UNIQUE INDEX IF NOT EXISTS report_settings_singleton ON public.report_settings ((TRUE));

-- RLS Policies - Anyone authenticated can view, only admins can modify
CREATE POLICY "Anyone authenticated can view report settings"
  ON public.report_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert report settings"
  ON public.report_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update report settings"
  ON public.report_settings
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Create storage bucket for report logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-logos', 'report-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for report logos
CREATE POLICY "Anyone can view report logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'report-logos');

CREATE POLICY "Admins can upload report logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'report-logos' 
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update report logos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'report-logos' 
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete report logos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'report-logos' 
    AND has_role(auth.uid(), 'admin')
  );

-- Insert default settings
INSERT INTO public.report_settings (header_text, footer_text, logo_url)
VALUES (
  'Reporte de Evaluación de Motricidad Fina',
  'Generado por el Sistema de Evaluación Educativa',
  NULL
)
ON CONFLICT DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_report_settings_updated_at
  BEFORE UPDATE ON public.report_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();