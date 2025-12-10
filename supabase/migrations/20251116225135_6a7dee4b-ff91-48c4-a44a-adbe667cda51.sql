-- Create deleted_children table to store soft-deleted records
CREATE TABLE IF NOT EXISTS public.deleted_children (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_id uuid NOT NULL,
  name text NOT NULL,
  birth_date date NOT NULL,
  gender text,
  grade text,
  school text,
  evaluator_id uuid,
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_by uuid NOT NULL,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.deleted_children ENABLE ROW LEVEL SECURITY;

-- Create policies for deleted_children
CREATE POLICY "Evaluators can view their deleted children"
  ON public.deleted_children
  FOR SELECT
  USING (auth.uid() = deleted_by OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Evaluators can insert to trash"
  ON public.deleted_children
  FOR INSERT
  WITH CHECK (auth.uid() = deleted_by);

CREATE POLICY "Evaluators can delete their trash permanently"
  ON public.deleted_children
  FOR DELETE
  USING (auth.uid() = deleted_by OR has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_deleted_children_deleted_by ON public.deleted_children(deleted_by);
CREATE INDEX idx_deleted_children_deleted_at ON public.deleted_children(deleted_at);