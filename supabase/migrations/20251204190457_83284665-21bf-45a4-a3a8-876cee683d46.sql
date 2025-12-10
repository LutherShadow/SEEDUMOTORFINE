-- Drop the existing check constraint
ALTER TABLE report_settings DROP CONSTRAINT IF EXISTS report_settings_template_check;

-- Add updated check constraint with the values used in the code
ALTER TABLE report_settings ADD CONSTRAINT report_settings_template_check 
CHECK (template = ANY (ARRAY['classic'::text, 'modern'::text, 'minimal'::text, 'formal'::text, 'colorido'::text, 'minimalista'::text]));