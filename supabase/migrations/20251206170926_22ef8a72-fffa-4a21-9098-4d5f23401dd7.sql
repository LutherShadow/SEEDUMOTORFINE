-- Eliminar el check constraint existente
ALTER TABLE report_settings DROP CONSTRAINT IF EXISTS report_type_check;

-- Crear el nuevo check constraint con todos los tipos de reporte incluyendo 'prediccion'
ALTER TABLE report_settings ADD CONSTRAINT report_type_check 
  CHECK (report_type IN ('motricidad', 'cornell', 'chaea', 'tam', 'competencias', 'prediccion'));