-- Actualizar la tabla de evaluaciones para incluir las 8 actividades
-- Primero eliminar las columnas antiguas
ALTER TABLE evaluations
DROP COLUMN IF EXISTS test_1_score,
DROP COLUMN IF EXISTS test_2_score,
DROP COLUMN IF EXISTS test_3_score,
DROP COLUMN IF EXISTS test_4_score,
DROP COLUMN IF EXISTS test_5_score,
DROP COLUMN IF EXISTS test_6_score;

-- Agregar las 8 nuevas columnas con escala 1-5
ALTER TABLE evaluations
ADD COLUMN test_1_score integer CHECK (test_1_score >= 1 AND test_1_score <= 5),
ADD COLUMN test_2_score integer CHECK (test_2_score >= 1 AND test_2_score <= 5),
ADD COLUMN test_3_score integer CHECK (test_3_score >= 1 AND test_3_score <= 5),
ADD COLUMN test_4_score integer CHECK (test_4_score >= 1 AND test_4_score <= 5),
ADD COLUMN test_5_score integer CHECK (test_5_score >= 1 AND test_5_score <= 5),
ADD COLUMN test_6_score integer CHECK (test_6_score >= 1 AND test_6_score <= 5),
ADD COLUMN test_7_score integer CHECK (test_7_score >= 1 AND test_7_score <= 5),
ADD COLUMN test_8_score integer CHECK (test_8_score >= 1 AND test_8_score <= 5);