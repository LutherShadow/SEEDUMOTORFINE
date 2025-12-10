-- Add section_order column to report_settings table
ALTER TABLE public.report_settings 
ADD COLUMN IF NOT EXISTS section_order TEXT[] DEFAULT ARRAY['introduction', 'recommendations', 'conclusion'];