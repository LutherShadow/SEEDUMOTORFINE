-- Add template column to report_settings
ALTER TABLE report_settings 
ADD COLUMN IF NOT EXISTS template TEXT DEFAULT 'formal' CHECK (template IN ('formal', 'colorido', 'minimalista'));

-- Add color customization columns
ALTER TABLE report_settings 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#1e40af',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#f3f4f6',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#3b82f6';