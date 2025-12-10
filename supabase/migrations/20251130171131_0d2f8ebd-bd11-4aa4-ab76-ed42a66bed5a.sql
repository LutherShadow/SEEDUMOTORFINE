-- Add content customization fields to report_settings
ALTER TABLE public.report_settings
ADD COLUMN IF NOT EXISTS content_report_date TEXT DEFAULT 'Fecha del Reporte',
ADD COLUMN IF NOT EXISTS content_introduction_text TEXT,
ADD COLUMN IF NOT EXISTS content_conclusion_text TEXT,
ADD COLUMN IF NOT EXISTS content_recommendations_text TEXT,
ADD COLUMN IF NOT EXISTS content_company_name TEXT,
ADD COLUMN IF NOT EXISTS content_responsible_agent TEXT,
ADD COLUMN IF NOT EXISTS content_show_introduction BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS content_show_conclusion BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS content_show_recommendations BOOLEAN DEFAULT true;