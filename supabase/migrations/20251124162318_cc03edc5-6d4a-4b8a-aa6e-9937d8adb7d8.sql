-- Create table for parent access tokens
CREATE TABLE public.parent_access_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  parent_name TEXT,
  parent_email TEXT
);

-- Create index for faster token lookups
CREATE INDEX idx_parent_tokens_token ON public.parent_access_tokens(token);
CREATE INDEX idx_parent_tokens_child ON public.parent_access_tokens(child_id);
CREATE INDEX idx_parent_tokens_active ON public.parent_access_tokens(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.parent_access_tokens ENABLE ROW LEVEL SECURITY;

-- Evaluators can view tokens for their children
CREATE POLICY "Evaluators can view tokens for their children"
ON public.parent_access_tokens
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM children
    WHERE children.id = parent_access_tokens.child_id
    AND children.evaluator_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

-- Evaluators can create tokens for their children
CREATE POLICY "Evaluators can create tokens for their children"
ON public.parent_access_tokens
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM children
    WHERE children.id = parent_access_tokens.child_id
    AND children.evaluator_id = auth.uid()
  )
);

-- Evaluators can update tokens for their children
CREATE POLICY "Evaluators can update tokens for their children"
ON public.parent_access_tokens
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM children
    WHERE children.id = parent_access_tokens.child_id
    AND children.evaluator_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

-- Evaluators can delete tokens for their children
CREATE POLICY "Evaluators can delete tokens for their children"
ON public.parent_access_tokens
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM children
    WHERE children.id = parent_access_tokens.child_id
    AND children.evaluator_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

-- Add comment
COMMENT ON TABLE public.parent_access_tokens IS 'Stores secure tokens for parent access to questionnaires';