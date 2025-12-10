-- Agregar columnas para soportar múltiples logos
ALTER TABLE public.report_settings
ADD COLUMN IF NOT EXISTS logo_urls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS footer_logo_urls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS background_image_url text,
ADD COLUMN IF NOT EXISTS use_gemini_charts boolean DEFAULT false;

-- Comentarios para documentación
COMMENT ON COLUMN public.report_settings.logo_urls IS 'Array de URLs de logos principales (máximo 5)';
COMMENT ON COLUMN public.report_settings.footer_logo_urls IS 'Array de URLs de logos para el pie de página (máximo 5)';
COMMENT ON COLUMN public.report_settings.background_image_url IS 'URL de imagen de fondo para portada de reportes';
COMMENT ON COLUMN public.report_settings.use_gemini_charts IS 'Si se debe usar Gemini para generar gráficas mejoradas';