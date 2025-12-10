-- Eliminar la constraint restrictiva de género
ALTER TABLE public.children DROP CONSTRAINT IF EXISTS children_gender_check;