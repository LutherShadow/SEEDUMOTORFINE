-- Add more customization fields to report_settings
ALTER TABLE public.report_settings 
ADD COLUMN IF NOT EXISTS logo_position TEXT DEFAULT 'left' CHECK (logo_position IN ('left', 'center', 'right')),
ADD COLUMN IF NOT EXISTS logo_size NUMERIC DEFAULT 40 CHECK (logo_size BETWEEN 20 AND 100),
ADD COLUMN IF NOT EXISTS header_font_size NUMERIC DEFAULT 18 CHECK (header_font_size BETWEEN 12 AND 24),
ADD COLUMN IF NOT EXISTS show_page_numbers BOOLEAN DEFAULT true;