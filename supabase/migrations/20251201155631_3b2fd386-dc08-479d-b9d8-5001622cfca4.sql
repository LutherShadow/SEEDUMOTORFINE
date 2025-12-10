-- Agregar columna para tipo de reporte en report_settings
ALTER TABLE report_settings ADD COLUMN IF NOT EXISTS report_type TEXT DEFAULT 'motricidad';

-- Agregar constraint para valores válidos de report_type
ALTER TABLE report_settings ADD CONSTRAINT report_type_check 
  CHECK (report_type IN ('motricidad', 'cornell', 'chaea', 'tam', 'competencias'));

-- Eliminar la columna content_report_date ya que la fecha será automática
ALTER TABLE report_settings DROP COLUMN IF EXISTS content_report_date;