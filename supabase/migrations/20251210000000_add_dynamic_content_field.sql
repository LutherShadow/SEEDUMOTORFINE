-- Add JSONB field to store dynamic content fields for different report types
ALTER TABLE public.report_settings
ADD COLUMN IF NOT EXISTS dynamic_content JSONB DEFAULT '{}'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_report_settings_dynamic_content 
ON public.report_settings USING GIN (dynamic_content);

-- Add comment
COMMENT ON COLUMN public.report_settings.dynamic_content IS 'Stores dynamic content fields for different report types (e.g., content_estado_actual_text, content_modalidades_text, etc.)';

